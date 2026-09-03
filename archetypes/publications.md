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
publicationStatus: published
doi: ""
paperUrl: ""
pdf: ""
code: ""
projectPage: ""
dataset: ""
video: ""
supplementary: []
blog: ""
bibtex: ""
thumbnail: ""
selected: false
acceptanceRate:
acceptanceRateSource: ""
distinctions: []
metricsId: ""
researchAreas: []
tags: []
links: []
draft: true
---

Add the abstract or publication notes here.
