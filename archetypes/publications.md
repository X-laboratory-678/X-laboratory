{{- $id := path.Base .File.Dir -}}
---
title: "{{ $id | humanize | title }}"
id: "{{ $id }}"
authors: []
labMembers: []
venue: ""
venueShort: ""
year: {{ time.AsTime .Date | time.Format "2006" }}
date: {{ time.AsTime .Date | time.Format "2006-01-02" }}
publicationType: ""
doi: ""
paperUrl: ""
pdf: ""
code: ""
projectPage: ""
dataset: ""
video: ""
bibtex: ""
thumbnail: ""
selected: false
researchAreas: []
tags: []
links: []
draft: true
---

Add the abstract or publication notes here.
