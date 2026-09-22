# Content Sources

This document records concise provenance for factual public content. It is not a citation database. Future maintainers should review the source before changing a person's role, affiliation, biography, or research interests.

## Principal Investigator

The expanded public research dossier is maintained at [`docs/jiangjiao-xu-research-dossier.md`](jiangjiao-xu-research-dossier.md). It contains the wider paper, conference, project, service, and achievement inventory used for later content imports. This provenance file remains the concise source register for production content; the dossier preserves review boundaries for records that are not yet suitable for public pages.

- Person: Jiangjiao Xu / 许江蛟
- Stable ID: `jiangjiao-xu`
- Primary source: Shanghai University of Electric Power, Division of Electrical Engineering official faculty profile
- URL: <https://dqxb.shiep.edu.cn/31/5c/c6639a274780/page.htm>
- Last reviewed: 2026-07-20

### Imported facts

- Chinese and English names
- Lecturer and master's-supervisor roles
- Electrical Engineering affiliation at Shanghai University of Electric Power
- Public institutional email
- Durham University PhD, completed in 2019
- University of Exeter postdoctoral research, 2019–2022
- Three research directions published on the faculty profile

### Editorial decisions

- The source field displayed as `职务: Xu Jiangjiao` is treated as a misplaced English-name field, not an administrative role.
- The biography paraphrases and structures confirmed facts instead of copying the faculty page.
- Academic service, honors, projects, and publication records are now imported only where the expanded dossier and authoritative content bundles provide sufficient provenance. The complete inventory and unresolved review notes remain in `docs/jiangjiao-xu-research-dossier.md`.
- The profile image was not copied because publication rights and a suitable local asset have not been confirmed. The site uses its neutral no-photo presentation.
- Affiliation and education remain in the Markdown biography for now. No person-specific schema fields were added before the formal People milestone.

## Remaining Development Fixtures

- People: Example Student and Example Alumnus
- Publications: all current Example Publication bundles
- Projects: all current Example Project bundles
- News: all current Example News bundles

These fixtures are not evidence of X-Laboratory membership or activity and must be replaced or removed before public launch.

They are marked `draft: true`, so they remain available to `hugo server -D` for relationship and validation testing but are excluded from production output.

## Public Contact and Laboratory Location

- Principal investigator stable ID: `jiangjiao-xu`
- Public contact email: `jiangjiao.xu@outlook.com`
- Institutional email: `jiangjiao.xu@shiep.edu.cn`
- Public phone: `+86 183 2113 7385`
- Laboratory address: 上海市杨浦区长阳路2588号
- English address: 2588 Changyang Road, Yangpu District, Shanghai, China
- Source and authorization: explicitly provided and approved for public display by the user
- Last reviewed: 2026-07-20

The public Outlook address and phone are maintained under `params.contact` for research inquiries. The institutional address remains the PI's `People.email` and is not replaced by the public contact address. Home, Contact, Join Us, Footer, and Organization structured data resolve these values from their authoritative configuration or People entity instead of maintaining copies.

The visible map marker uses `31.2744, 121.5430525`, converted from the Shanghai Yangpu District government report coordinates `N31°16′27.840″ E121°32′34.989″`: <https://www.shyp.gov.cn/shypq/yqyw-wb-hbjzl-wryhjjgxx-spjdgg/20250328/477132/677da4db8d3241a7b3e567a05c210e9a.pdf>. The result aligns with the OpenStreetMap Yangpu Campus feature, way `1068915935`: <https://www.openstreetmap.org/way/1068915935>. The school confirms the campus/address relationship at <https://www.shiep.edu.cn/campus/>.

Contact and Home use a lazy-loaded OpenStreetMap iframe centered on that marker. The address and Amap navigation link remain visible if third-party content is blocked. No map API key, SDK, external JavaScript library, or unverified building/room detail is used.

## Representative Publications

- Discovery source: Shanghai University of Electric Power official faculty profile, <https://dqxb.shiep.edu.cn/31/5c/c6639a274780/page.htm>
- Bibliographic authority: DOI registration metadata and the corresponding IEEE DOI landing page
- Last reviewed: 2026-07-20

The faculty profile was used to discover the representative-paper seed list. The production site now also includes additional DOI-indexed journal articles, conference papers, one Chinese journal article, and one clearly labelled SSRN preprint from the expanded research dossier. Exact titles, full author names and order, venue, publication year, volume, issue, pages, and DOI values were reviewed against DOI or source metadata. When sources conflict, the DOI/publisher record is used and the difference is recorded rather than silently guessed.

| Stable ID | DOI metadata / IEEE landing page | Review note |
|---|---|---|
| `distributed-deep-rl-water-heater` | <https://api.crossref.org/works/10.1109/TSG.2025.3548653> · <https://ieeexplore.ieee.org/document/10915553/> | Title, five-author order, venue, 2025, volume 16, issue 4, pages 2900–2912, and DOI verified. |
| `meta-rl-energy-storage-control` | <https://api.crossref.org/works/10.1109/TSTE.2025.3555002> · <https://ieeexplore.ieee.org/document/10948374/> | Title capitalization, five-author order without the profile's correspondence asterisk, venue, 2025, volume 16, issue 4, pages 2560–2572, and DOI verified. |
| `multiscale-transformer-insulator-detection` | <https://api.crossref.org/works/10.1109/TIM.2025.3568984> · <https://ieeexplore.ieee.org/document/11000342/> | Publisher title uses “Multiscale,” not the profile's “Multi-Scale”; five-author order, venue, 2025, volume 74, pages 1–13, and DOI verified. Issue omitted because none was present. |
| `preference-online-rl-smart-grid` | <https://api.crossref.org/works/10.1109/TII.2024.3507203> · <https://ieeexplore.ieee.org/document/10795479/> | Formal issue metadata is 2025, volume 21, issue 3, pages 2422–2431. The faculty seed says 2024, matching the DOI registration year but not the final issue year; the site uses 2025. |
| `multioutput-time-series-forecasting` | <https://api.crossref.org/works/10.1109/TII.2024.3396347> · <https://ieeexplore.ieee.org/document/10539288/> | Publisher title uses “Multioutput,” not the profile's “Multi-Output”; three-author order, venue, 2024, volume 20, issue 9, pages 11202–11212, and DOI verified. |

No abstract, citation count, impact factor, ranking, quartile, or local publisher PDF was imported. Exact day-level publication dates were omitted because the reviewed records did not provide reliable day values for all five papers.

The DOI records resolve to the publisher landing pages recorded in the expanded dossier. During the 2026-07-20 automated review, IEEE Xplore presented a bot-verification gate, so page-body metadata could not be independently extracted there; imported fields therefore rely on DOI registration metadata and are not supplemented with guessed IEEE page values.

## Research Areas and Projects

- Primary source: Shanghai University of Electric Power, Division of Electrical Engineering official faculty profile, <https://dqxb.shiep.edu.cn/31/5c/c6639a274780/page.htm>
- Person responsible: Jiangjiao Xu / 许江蛟 (`jiangjiao-xu`)
- Last reviewed: 2026-07-20

The three public Research pages are concise editorial summaries of the profile's three published research directions. Their stable IDs are maintained in `data/research_areas.yaml`. The English labels and project titles are editorial translations, not official English titles supplied by the source.

| Project ID | Official Chinese title | Period | Verified role | Editorial status |
|---|---|---:|---|---|
| `llm-smart-grid-research-platform` | 上海市教委人工智能范式改革项目：大语言模型赋能的智能电网科研创新平台研究 | 2024–2025 | 主持 | `completed` |
| `knowledge-graph-metering-diagnosis` | 国网上海市电力公司：面向数据驱动知识图谱构建的计量设备异常诊断技术及运维平台 | 2025–2026 | 主持 | `active` |
| `east-china-renewable-output-analysis` | 国家电网有限公司华东分部：基于统计学特征的华东电网新能源出力特性分析与应用技术服务 | 2024 | 主持 | `completed` |

Status is an internal editorial inference from the listed period as reviewed on 2026-07-20: a period ending in or before 2025 is represented as `completed`, while the 2025–2026 project is represented as `active`. Public cards prioritize the verified period and do not display an inferred status badge.

No amount, grant number, expanded team, method, dataset, deployment, outcome, patent, impact statement, hero image, or external resource was imported. A shared Research Area indicates topic only. The commissioning or funding organization remains part of the official Chinese title; a separate funder schema was intentionally not added because the source set is small and does not provide consistently structured funder metadata. The East China project does not claim a project-to-publication relationship because the public sources do not explicitly establish it.

## Grants and Opportunities

No production Grant or laboratory-specific Opportunity record is currently published. Existing Project titles that mention a commissioning or funding organization do not establish a separate verified Grant record, role, award number, amount, or exact award period. General university admissions guidance does not establish an X-Laboratory vacancy, quota, scholarship, funding commitment, eligibility rule, or deadline.

The bilingual Grants and Opportunities directories therefore render explicit empty states. `example-grant` and `example-opportunity` are draft-only layout fixtures containing registered placeholders; they are excluded from production and must never be cited as laboratory activity. A production record requires the sources listed in `docs/missing-information.md`, with provenance added here before publication.

## News Sources

All production News items require a reliable source, a day-precise event or first-publication date, and a direct relationship to Jiangjiao Xu or an existing X-Laboratory entity. Last reviewed: 2026-07-20.

### `2025-10-10-virtual-power-plant-talk`

- Event: Second International Summit Forum on the New Ecology of Source–Grid–Load–Storage–Hydrogen Power Systems
- Event date and location source: SNEC organizer forum page, <https://hfc.snec.org.cn/channel/Summit%20on%20New%20Ecology%20of%20Source-Grid-Load-Storage-Hydrogen%20of%20Power%20System>
- Participation and talk-title source: International Energy Network post-event report, <https://mpower.in-en.com/html/power-2465022.shtml>
- Verified date: 2025-10-10
- Relationship: the post-event report identifies Jiangjiao Xu as the speaker and gives the talk title used in the News body.
- Review note: the organizer's advance agenda lists Lin Shunfu for the same talk slot, while the post-event report attributes the delivered talk to Jiangjiao Xu. The News item uses the post-event report for actual participation and the organizer page for the exact event date and location. It does not call the presentation a keynote.
- Faculty-title note: the post-event report calls Jiangjiao Xu an associate professor, conflicting with the current university faculty profile. People content remains `Lecturer / 讲师、硕士生导师`; the News entry uses the conflict-neutral principal-investigator description.

### `2024-12-12-preference-online-rl-published`

- Publication: *A Preference-Based Online Reinforcement Learning With Embedded Communication Failure Solutions in Smart Grid*
- Stable Publication ID: `preference-online-rl-smart-grid`
- Exact online-publication source: Durham University institutional repository, <https://durham-repository.worktribe.com/output/3102293/a-preference-based-online-reinforcement-learning-with-embedded-communication-failure-solutions-in-smart-grid>
- Supporting DOI metadata: Crossref, <https://api.crossref.org/works/10.1109/TII.2024.3507203>
- Verified online date: 2024-12-12
- Relationship: Jiangjiao Xu is a named co-author and is explicitly mapped to the existing Publication entity.
- Date decision: the repository's `Online Publication Date` is used as the first formal public date. The 2025-03 issue date remains Publication metadata and is not substituted for the News event date.

### Candidates not imported

- The other four representative papers expose only year or year-month publication values in the reviewed Crossref records. Crossref creation timestamps were not promoted to publication dates.
- The three real Projects have year or year-range periods only, so no launch or completion News was created.
- No laboratory launch or establishment News was created because no authoritative date or source exists.

## Official Admissions Information

- Source: Shanghai University of Electric Power official Admissions Information index
- URL: <https://xxgk.shiep.edu.cn/525/list1.htm>
- Scope: university graduate-admissions notices and policies
- Last reviewed: 2026-07-20
- Maintenance decision: the stable index is configured once in `config/_default/params.yaml`, rather than embedding a year-specific notice in Join Us content.
- Accuracy boundary: this source describes university admissions. It does not establish an X-Laboratory vacancy, individual supervisor quota, scholarship, funding offer, or admission guarantee.
