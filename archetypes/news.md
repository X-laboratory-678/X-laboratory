{{- $slug := path.Base .File.Dir -}}
---
title: "{{ $slug | humanize | title }}"
date: {{ time.AsTime .Date | time.Format "2006-01-02T15:04:05-07:00" }}
lastmod: {{ time.AsTime .Date | time.Format "2006-01-02T15:04:05-07:00" }}
summary: ""
image: ""
imageAlt: ""
category: announcement
relatedPublication: ""
relatedProject: ""
featured: false
draft: true
---

Add the complete news item here.
