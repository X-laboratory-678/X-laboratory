{{- $id := path.Base .File.Dir -}}
---
title: "{{ $id | humanize | title }}"
id: "{{ $id }}"
date: {{ time.AsTime .Date | time.Format "2006-01-02" }}
summary: ""
tldr: ""
categories: []
tags: []
authors: []
researchAreas: []
relatedPublication: ""
relatedProject: ""
relatedResources: []
cover: ""
coverAlt: ""
featured: false
draft: true
---

Add the material article here.
