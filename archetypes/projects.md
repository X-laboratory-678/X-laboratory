{{- $id := path.Base .File.Dir -}}
---
title: "{{ $id | humanize | title }}"
id: "{{ $id }}"
summary: ""
hero: ""
heroAlt: ""
status: planned
projectType: research
startYear: {{ time.AsTime .Date | time.Format "2006" }}
endYear:
people: []
researchAreas: []
publications: []
code: ""
dataset: ""
demo: ""
repository: ""
documentation: ""
links: []
featured: false
weight: 100
draft: true
---

Add the detailed project description here.
