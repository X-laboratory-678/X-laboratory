#!/usr/bin/env ruby
# Safely create and publish paired English/Chinese Hugo page bundles from Pages CMS.

require "date"
require "fileutils"
require "json"
require "open3"
require "pathname"
require "yaml"

REPOSITORY_OWNER = "X-laboratory-678"
REPOSITORY_NAME = "X-laboratory"
COLLECTIONS = {
  "people" => { "prefix" => "people-", "create" => true },
  "publications" => { "prefix" => "publication-", "create" => true },
  "projects" => { "prefix" => "project-", "create" => true },
  "research" => { "prefix" => "research-", "create" => false },
  "news" => { "prefix" => "news-", "create" => true },
  "grants" => { "prefix" => "grant-", "create" => true },
  "opportunities" => { "prefix" => "opportunity-", "create" => true },
  "events" => { "prefix" => "event-", "create" => true },
  "resources" => { "prefix" => "resource-", "create" => true },
  "materials" => { "prefix" => "material-", "create" => true }
}.freeze

def fail_with(message)
  warn "Pages CMS action failed: #{message}"
  exit 1
end

def safe_yaml(source, label)
  YAML.safe_load(
    source,
    permitted_classes: [Date, DateTime, Time],
    permitted_symbols: [],
    aliases: true
  ) || {}
rescue Psych::Exception => error
  fail_with("#{label} contains invalid YAML: #{error.message}")
end

def payload
  raw = ENV.fetch("PAGES_CMS_PAYLOAD") { fail_with("the Pages CMS payload is missing") }
  JSON.parse(raw)
rescue JSON::ParserError => error
  fail_with("the Pages CMS payload is invalid JSON: #{error.message}")
end

def current_action_context
  data = payload
  repository = data["repository"] || {}
  unless repository["owner"] == REPOSITORY_OWNER && repository["repo"] == REPOSITORY_NAME
    fail_with("this action only supports #{REPOSITORY_OWNER}/#{REPOSITORY_NAME}")
  end

  payload_ref = repository["ref"].to_s.sub(%r{\Arefs/heads/}, "")
  workflow_ref = ENV.fetch("GITHUB_REF_NAME", "")
  if payload_ref.empty? || workflow_ref.empty? || payload_ref != workflow_ref
    fail_with("the Pages CMS branch does not match the workflow branch")
  end

  action = data.dig("action", "name").to_s
  unless ["create-bilingual-draft", "publish-bilingual"].include?(action)
    fail_with("unknown action #{action.inspect}")
  end

  context = data["context"] || {}
  collection = nil
  slug = nil
  english_path = nil
  chinese_path = nil

  if action == "create-bilingual-draft"
    unless context["type"] == "collection"
      fail_with("the create action must be started from a collection")
    end
    collection = context["name"].to_s
    unless COLLECTIONS.dig(collection, "create")
      fail_with("creating records in #{collection.inspect} is disabled")
    end
    inputs = data["inputs"] || {}
    slug = inputs["slug"].to_s.strip
    title_en = inputs["title_en"].to_s.strip
    title_zh = inputs["title_zh"].to_s.strip
    unless slug.match?(/\A[a-z0-9]+(?:-[a-z0-9]+)*\z/) && slug.length <= 80
      fail_with("the stable ID must use lowercase English letters, numbers, and hyphens")
    end
    validate_title(title_en, "English")
    validate_title(title_zh, "Chinese")
    english_path, chinese_path = record_paths(collection, slug)
  else
    unless context["type"] == "entry"
      fail_with("the publish action must be started from a content entry")
    end
    path = context["path"].to_s
    match = path.match(%r{\Acontent/([a-z]+)/([a-z0-9]+(?:-[a-z0-9]+)*)/index\.(en|zh)\.md\z})
    fail_with("the selected entry is not a supported bilingual page bundle") unless match
    collection, slug = match.captures.first(2)
    fail_with("the selected collection is not managed here") unless COLLECTIONS.key?(collection)
    english_path, chinese_path = record_paths(collection, slug)
  end

  {
    "action" => action,
    "collection" => collection,
    "slug" => slug,
    "english_path" => english_path,
    "chinese_path" => chinese_path
  }
end

def validate_title(value, language)
  if value.empty? || value.length > 240 || value.match?(/[\r\n\u0000-\u001f]/)
    fail_with("the #{language} title must contain 1–240 characters on one line")
  end
end

def record_paths(collection, slug)
  base = "content/#{collection}/#{slug}"
  ["#{base}/index.en.md", "#{base}/index.zh.md"]
end

def emit_outputs(context)
  lines = context.map { |key, value| "#{key}=#{value}" }
  if output_path = ENV["GITHUB_OUTPUT"]
    File.open(output_path, "a", encoding: "UTF-8") { |file| file.puts(lines) }
  else
    puts lines
  end
end

def repository_config
  config = safe_yaml(File.read(".pages.yml", encoding: "UTF-8"), ".pages.yml")
  config.fetch("content") { fail_with(".pages.yml has no content collections") }
rescue Errno::ENOENT
  fail_with(".pages.yml is missing")
end

def collection_config(collection)
  repository_config.find { |entry| entry["name"] == collection } ||
    fail_with("#{collection} is missing from .pages.yml")
end

def frontmatter(path)
  source = File.read(path, encoding: "UTF-8")
  match = source.match(/\A---\r?\n(.*?)\r?\n---[ \t]*(?:\r?\n|\z)/m)
  fail_with("#{path} has no YAML front matter") unless match
  [source, match, safe_yaml(match[1], path)]
rescue Errno::ENOENT
  fail_with("required bilingual file is missing: #{path}")
end

def empty_value?(value, field)
  return true if value.nil?
  return value.strip.empty? if value.is_a?(String)
  if value.is_a?(Array)
    list_config = field["list"]
    minimum = list_config.is_a?(Hash) ? (list_config["min"] || 1) : 1
    return true if value.length < minimum
    return false unless field["type"] == "object" && field["fields"].is_a?(Array)
    return value.any? do |item|
      !item.is_a?(Hash) || field["fields"].any? do |child|
        child["required"] == true && empty_value?(item[child["name"]], child)
      end
    end
  end
  return value.empty? if value.is_a?(Hash)
  false
end

def validate_required_fields(collection, data, body, path)
  fields = collection_config(collection).fetch("fields", [])
  fields.each do |field|
    next unless field["required"] == true
    value = field["name"] == "body" ? body : data[field["name"]]
    if empty_value?(value, field)
      fail_with("#{path} is missing required field #{field['label'] || field['name']}")
    end
  end
end

def validate_pair(context)
  collection = context.fetch("collection")
  slug = context.fetch("slug")
  en_path = context.fetch("english_path")
  zh_path = context.fetch("chinese_path")
  en_source, en_match, en_data = frontmatter(en_path)
  zh_source, zh_match, zh_data = frontmatter(zh_path)
  en_body = en_source[en_match.end(0)..].to_s
  zh_body = zh_source[zh_match.end(0)..].to_s

  unless en_data["draft"] == true && zh_data["draft"] == true
    fail_with("both language files must still be drafts before publishing")
  end

  fields = collection_config(collection).fetch("fields", [])
  has_id = fields.any? { |field| field["name"] == "id" }
  if has_id
    unless !en_data["id"].to_s.strip.empty? && en_data["id"] == zh_data["id"]
      fail_with("the English and Chinese stable IDs do not match")
    end
  elsif slug.empty?
    fail_with("the bundle slug is missing")
  end

  en_key = en_data["translationKey"].to_s.strip
  zh_key = zh_data["translationKey"].to_s.strip
  if en_key.empty? || en_key != zh_key
    fail_with("the English and Chinese translation keys are missing or do not match")
  end

  unless en_data["cmsTitle"].to_s.start_with?("【英文】") && zh_data["cmsTitle"].to_s.start_with?("【中文】")
    fail_with("the paired list labels must start with 【英文】 and 【中文】")
  end

  validate_required_fields(collection, en_data, en_body, en_path)
  validate_required_fields(collection, zh_data, zh_body, zh_path)
  [[en_path, en_source, en_match], [zh_path, zh_source, zh_match]]
end

def generate_draft_pair(context)
  collection = context.fetch("collection")
  slug = context.fetch("slug")
  en_path, zh_path = context.values_at("english_path", "chinese_path")
  [en_path, zh_path].each do |path|
    fail_with("a record with this stable ID already exists: #{path}") if File.exist?(path)
  end

  inputs = payload.fetch("inputs")
  titles = { en_path => inputs.fetch("title_en").strip, zh_path => inputs.fetch("title_zh").strip }
  [[en_path, "en"], [zh_path, "zh"]].each do |path, language|
    FileUtils.mkdir_p(File.dirname(path))
    output, status = Open3.capture2e("hugo", "new", "content", "--kind", collection, path)
    puts output unless output.empty?
    unless status.success? && File.file?(path)
      FileUtils.rm_f([en_path, zh_path])
      fail_with("Hugo could not create #{path} from archetypes/#{collection}.md")
    end
    apply_draft_metadata(path, collection, slug, titles.fetch(path), language)
  end
  puts "Created bilingual draft pair for #{collection}/#{slug}."
end

def apply_draft_metadata(path, collection, slug, title, language)
  source, match, = frontmatter(path)
  lines = match[1].split(/\r?\n/)
  set_yaml_field(lines, "title", JSON.generate(title))
  if collection_config(collection).fetch("fields", []).any? { |field| field["name"] == "id" }
    set_yaml_field(lines, "id", slug)
  end
  set_yaml_field(lines, "translationKey", JSON.generate("#{COLLECTIONS.fetch(collection).fetch('prefix')}#{slug}"))
  marker = language == "en" ? "英文" : "中文"
  set_yaml_field(lines, "cmsTitle", JSON.generate("【#{marker}】#{title}"))
  set_yaml_field(lines, "draft", "true")
  replacement = "---\n#{lines.join("\n")}\n---\n\n"
  File.write(path, source.sub(match[0], replacement), mode: "w:UTF-8")
end

def set_yaml_field(lines, name, value)
  key = Regexp.escape(name)
  replacement = "#{name}: #{value}"
  index = lines.index { |line| line.match?(/\A#{key}:[ \t]*/) }
  if index
    lines[index] = replacement
  else
    title_index = lines.index { |line| line.start_with?("title:") }
    lines.insert(title_index ? title_index + 1 : 0, replacement)
  end
end

def publish_pair(context)
  files = validate_pair(context)
  replacements = files.map do |path, source, match|
    updated_yaml = match[1].sub(/^draft:[ \t]*true[ \t]*$/, "draft: false")
    if updated_yaml == match[1]
      fail_with("#{path} does not contain an explicit draft: true setting")
    end
    [path, source.sub(match[1], updated_yaml)]
  end
  replacements.each { |path, source| File.write(path, source, mode: "w:UTF-8") }
  puts "Both language files passed validation and are ready to publish."
end

def audit_configuration
  expected = COLLECTIONS.keys.sort
  configured = repository_config
  configured_names = configured.map { |entry| entry["name"] }.sort
  fail_with(".pages.yml must define exactly the ten managed collections") unless configured_names == expected

  expected_create = COLLECTIONS.select { |_name, config| config["create"] }.keys.sort
  configured_create = []
  configured.each do |entry|
    name = entry.fetch("name")
    fail_with("#{name} must keep built-in create, rename, and delete disabled") unless
      entry.dig("operations", "create") == false &&
      entry.dig("operations", "rename") == false &&
      entry.dig("operations", "delete") == false
    fail_with("#{name} must use cmsTitle as its list label") unless entry.dig("view", "primary") == "cmsTitle"
    cms_title = entry.fetch("fields", []).find { |field| field["name"] == "cmsTitle" }
    fail_with("#{name} must keep cmsTitle hidden and read-only") unless
      cms_title && cms_title["hidden"] == true && cms_title["readonly"] == true

    actions = entry.fetch("actions", [])
    by_name = actions.to_h { |action| [action["name"], action] }
    publish = by_name["publish-bilingual"]
    fail_with("#{name} is missing the paired publish action") unless
      publish && publish["scope"] == "entry" && publish["workflow"] == "pages-cms-content.yml" && publish["ref"] == "current"

    create = by_name["create-bilingual-draft"]
    if COLLECTIONS.fetch(name).fetch("create")
      fail_with("#{name} is missing the bilingual draft creation action") unless
        create && create["scope"] == "collection" && create["workflow"] == "pages-cms-content.yml" && create["ref"] == "current"
      configured_create << name
      archetype = "archetypes/#{name}.md"
      fail_with("#{archetype} is missing") unless File.file?(archetype)
      fail_with("#{archetype} must create drafts") unless File.read(archetype, encoding: "UTF-8").match?(/^draft:\s*true\s*$/)
    elsif create
      fail_with("Research must not expose draft creation")
    end
  end
  fail_with("draft creation must be enabled in exactly nine collections") unless configured_create.sort == expected_create
  fail_with("the Pages CMS workflow file is missing") unless File.file?(".github/workflows/pages-cms-content.yml")

  checked = 0
  configured.each do |entry|
    section = entry.fetch("name")
    root = Pathname("content/#{section}")
    next unless root.directory?
    Dir.glob(root.join("**/index.en.md").to_s).sort.each do |english|
      directory = File.dirname(english)
      next if File.expand_path(directory) == File.expand_path(root.to_s)
      chinese = File.join(directory, "index.zh.md")
      next unless File.file?(chinese)
      _, _, en_data = frontmatter(english)
      _, _, zh_data = frontmatter(chinese)
      unless en_data["cmsTitle"].to_s.start_with?("【英文】") && zh_data["cmsTitle"].to_s.start_with?("【中文】")
        fail_with("#{directory} must have distinct 【英文】 and 【中文】 CMS list labels")
      end
      checked += 1
    end
  end
  puts "Pages CMS configuration audit passed (10 collections, 9 create actions, #{checked} labeled bilingual records)."
end

command = ARGV.fetch(0, "")
if command == "audit-config"
  audit_configuration
  exit 0
end
context = current_action_context
case command
when "inspect"
  emit_outputs(context)
when "create"
  fail_with("the selected action is not create-bilingual-draft") unless context["action"] == "create-bilingual-draft"
  generate_draft_pair(context)
when "publish"
  fail_with("the selected action is not publish-bilingual") unless context["action"] == "publish-bilingual"
  publish_pair(context)
else
  fail_with("usage: pages-cms-content.rb inspect|create|publish")
end

