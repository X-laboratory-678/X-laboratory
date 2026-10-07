#!/usr/bin/env ruby
# Exercise draft creation for each collection and publication failure safety.

require "date"
require "fileutils"
require "json"
require "open3"
require "tmpdir"
require "yaml"

ROOT = File.expand_path("..", __dir__)
ACTION_SCRIPT = File.join(ROOT, "scripts/pages-cms-content.rb")
PREFIXES = {
  "people" => "people-", "publications" => "publication-", "projects" => "project-",
  "news" => "news-", "grants" => "grant-", "opportunities" => "opportunity-",
  "events" => "event-", "resources" => "resource-", "materials" => "material-"
}.freeze

def assert(condition, message)
  abort("Pages CMS action test failed: #{message}") unless condition
end

def config(collection, has_id: true)
  fields = [
    { "name" => "title", "required" => true },
    { "name" => "translationKey", "required" => true },
    { "name" => "role", "required" => true },
    { "name" => "category", "required" => true },
    { "name" => "status", "required" => true }
  ]
  fields.insert(1, { "name" => "id", "required" => true }) if has_id
  { "content" => [{ "name" => collection, "fields" => fields }] }
end

def write_markdown(path, title, locale, changes = {})
  data = {
    "title" => title, "id" => "sample-record", "translationKey" => "people-sample-record",
    "role" => "Student", "category" => "master", "status" => "current",
    "cmsTitle" => "【#{locale}】#{title}", "draft" => true
  }.merge(changes)
  FileUtils.mkdir_p(File.dirname(path))
  yaml = YAML.dump(data, line_width: -1).sub(/\A---\s*\n/, "")
  File.write(path, "---\n#{yaml}---\n\nA test biography.\n", encoding: "UTF-8")
end

def read_metadata(path)
  source = File.read(path, encoding: "UTF-8")
  match = source.match(/\A---\r?\n(.*?)\r?\n---/m)
  YAML.safe_load(match.fetch(1), permitted_classes: [Date, DateTime, Time], aliases: true)
end

def run_action(directory, mode, event)
  env = {
    "PAGES_CMS_PAYLOAD" => JSON.generate(event),
    "GITHUB_REF_NAME" => "test"
  }
  Open3.capture2e(env, "ruby", ACTION_SCRIPT, mode, chdir: directory)
end

def repository_event(action, context, inputs = {})
  {
    "source" => "pages-cms",
    "repository" => { "owner" => "X-laboratory-678", "repo" => "X-laboratory", "ref" => "test" },
    "action" => { "name" => action, "label" => action },
    "context" => context,
    "inputs" => inputs
  }
end

def test_publish_success_and_rejections
  Dir.mktmpdir("cms-publish-") do |directory|
    File.write(File.join(directory, ".pages.yml"), YAML.dump(config("people")), encoding: "UTF-8")
    en = File.join(directory, "content/people/sample-record/index.en.md")
    zh = File.join(directory, "content/people/sample-record/index.zh.md")
    write_markdown(en, "Sample Person", "英文")
    write_markdown(zh, "示例成员", "中文")
    context = { "type" => "entry", "path" => "content/people/sample-record/index.en.md" }
    output, status = run_action(directory, "publish", repository_event("publish-bilingual", context))
    assert(status.success?, output)
    assert(read_metadata(en)["draft"] == false && read_metadata(zh)["draft"] == false, "valid pair was not published")
  end

  failures = {
    "missing translated file" => lambda { |_en, zh| FileUtils.rm_f(zh) },
    "mismatched stable ID" => lambda { |_en, zh| rewrite(zh, "id: sample-record", "id: other-record") },
    "mismatched translation key" => lambda { |_en, zh| rewrite(zh, "translationKey: people-sample-record", "translationKey: people-other-record") },
    "missing required field" => lambda { |_en, zh| rewrite(zh, "role: Student", "role: ''") }
  }
  failures.each do |label, change|
    Dir.mktmpdir("cms-publish-fail-") do |directory|
      File.write(File.join(directory, ".pages.yml"), YAML.dump(config("people")), encoding: "UTF-8")
      en = File.join(directory, "content/people/sample-record/index.en.md")
      zh = File.join(directory, "content/people/sample-record/index.zh.md")
      write_markdown(en, "Sample Person", "英文")
      write_markdown(zh, "示例成员", "中文")
      before_en = File.read(en, encoding: "UTF-8")
      change.call(en, zh)
      before_zh = File.file?(zh) ? File.read(zh, encoding: "UTF-8") : nil
      context = { "type" => "entry", "path" => "content/people/sample-record/index.en.md" }
      output, status = run_action(directory, "publish", repository_event("publish-bilingual", context))
      assert(!status.success?, "#{label} was unexpectedly accepted")
      assert(File.read(en, encoding: "UTF-8") == before_en, "English file changed after #{label}")
      if before_zh
        assert(File.read(zh, encoding: "UTF-8") == before_zh, "Chinese file changed after #{label}")
      else
        assert(!File.exist?(zh), "missing Chinese file was recreated")
      end
      assert(output.include?("failed"), "#{label} did not report a clear failure")
    end
  end
end

def rewrite(path, before, after)
  source = File.read(path, encoding: "UTF-8")
  abort("Fixture missing #{before.inspect}") unless source.include?(before)
  File.write(path, source.sub(before, after), encoding: "UTF-8")
end

def test_create_all_nine_collections
  PREFIXES.each do |collection, prefix|
    Dir.mktmpdir("cms-create-#{collection}-") do |directory|
      File.write(File.join(directory, ".pages.yml"), YAML.dump(config(collection, has_id: collection != "news")), encoding: "UTF-8")
      FileUtils.mkdir_p(File.join(directory, "archetypes"))
      FileUtils.cp(File.join(ROOT, "archetypes/#{collection}.md"), File.join(directory, "archetypes/#{collection}.md"))
      File.write(File.join(directory, "hugo.yaml"), "baseURL: https://example.test/\ndefaultContentLanguage: en\n", encoding: "UTF-8")
      context = { "type" => "collection", "name" => collection }
      inputs = { "slug" => "sample-record", "title_en" => "Sample title", "title_zh" => "示例标题" }
      output, status = run_action(directory, "create", repository_event("create-bilingual-draft", context, inputs))
      assert(status.success?, "#{collection} creation failed: #{output}")
      en = File.join(directory, "content/#{collection}/sample-record/index.en.md")
      zh = File.join(directory, "content/#{collection}/sample-record/index.zh.md")
      assert(File.file?(en) && File.file?(zh), "#{collection} did not create both language files")
      en_data = read_metadata(en)
      zh_data = read_metadata(zh)
      assert(en_data["title"] == "Sample title" && zh_data["title"] == "示例标题", "#{collection} titles are incorrect")
      assert(en_data["draft"] == true && zh_data["draft"] == true, "#{collection} entries must start as drafts")
      assert(en_data["cmsTitle"] == "【英文】Sample title" && zh_data["cmsTitle"] == "【中文】示例标题", "#{collection} labels are incorrect")
      assert(en_data["translationKey"] == "#{prefix}sample-record" && en_data["translationKey"] == zh_data["translationKey"], "#{collection} translation keys do not match")
      if collection != "news"
        assert(en_data["id"] == "sample-record" && zh_data["id"] == "sample-record", "#{collection} stable IDs are incorrect")
      end
    end
  end
end

test_publish_success_and_rejections
test_create_all_nine_collections
puts "Pages CMS action tests passed (9 draft collections, valid publish, and 4 safe rejections)."


