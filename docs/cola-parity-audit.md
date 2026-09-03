# COLA-Lab Parity Audit

Audit date: 2026-09-03  
Benchmark: <https://colalab.ai/>  
X-Laboratory baseline: local `main` at `c39c4fc`, including the preserved uncommitted Contact improvements and documentation-style permalink migration.

## Scope and Method

This audit records public information architecture, content models, presentation patterns, and progressive-enhancement behavior. It does not authorize copying COLA-Lab branding, prose, images, logos, source code, or CSS. Observations were made from the public English pages listed below; the implementation column describes an X-Laboratory-native Hugo approach.

Status vocabulary:

- **Covered** — the production site already supplies the essential capability.
- **Partially covered** — a useful foundation exists but does not yet match the benchmark's functional breadth.
- **Missing** — no corresponding production model or route exists.
- **Not applicable** — the reference behavior should not be copied because it is unsupported, institution-specific, or contrary to X-Laboratory policy.
- **X-Lab extension** — requested capability beyond the public benchmark.

## Parity Matrix

| COLA Feature | COLA Route | X-Lab Current | Gap | Implementation |
| --- | --- | --- | --- | --- |
| Home introduction | `/` | Covered | X-Lab has a richer sectioned home page; empty-section behavior must be generalized for new modules. | Keep the existing factual hero and aggregate only non-empty production sections. |
| Important home notices | `/` | Missing | No scheduled announcement model. | Add validated `data/announcements.yaml` with language pairs, priority, date window, optional link, and production placeholder rejection. |
| Recent news | `/` | Covered | Current latest-news aggregation exists; archive grouping needs enhancement. | Keep source-backed aggregation and add year/month archive behavior. |
| Contact and embedded map | `/` | Covered | Existing home/contact map and verified contact data exceed the reference's link-only failure modes; preserve current pending copy-action improvements. | Keep visible OpenStreetMap embed, Amap navigation, visible/copyable email and phone, and bilingual contact page. |
| Hierarchical global navigation | all routes | Partially covered | Current navigation is flat; no nested desktop or mobile disclosures. | Create data-driven Home, People, Research, Events, Resources, Tools, News, and Join groups with keyboard, Escape, focus, ARIA, and no-JS fallback. |
| Language selector | all routes | Partially covered | Translation-aware EN/ZH switch exists, but not a scalable language disclosure. | Retain Hugo translations and add an accessible data-driven language menu without inventing Russian content. |
| Members directory | `/docs/home/members/` | Covered | Category model is broad, but cards do not yet expose all optional period/affiliation fields. | Preserve People Page Bundles and add only reusable optional member metadata and grant/event/resource aggregation. |
| Faculty / research staff / students | `/docs/home/members/` | Covered | Production currently contains one verified PI; missing people must not be invented. | Render supported categories only when real or draft records exist. Use draft placeholder members for development layout QA. |
| Alumni grouped history | `/docs/home/members/` | Partially covered | Alumni row supports period/destination but lacks former-role, affiliation, co-supervisor, and representative-output breadth. | Extend the stable Person model; keep Alumni compact and optionally expandable. |
| Vacancies and funding routes | `/docs/home/vacancies/` | Partially covered | Join Us provides accurate general guidance but there is no Opportunity entity, automatic state, archive, or funding-route page. | Add bilingual Opportunity Page Bundles and controlled types/statuses; production empty state must say there are no confirmed lab-specific openings. |
| Publications by status/year/type | `/docs/research/publications/` | Partially covered | X-Lab has five verified publications, filters, details, resources, and BibTeX, but no publication status grouping. | Add status vocabulary/filter and ordered groups: To Appear, In Press, then year and type. |
| Abstract disclosure | `/docs/research/publications/` | Partially covered | Abstract is available on detail pages rather than compact list disclosures. | Add semantic `<details>` where helpful while keeping details accessible without JavaScript. |
| BibTeX disclosure/copy | `/docs/research/publications/` | Covered | Existing raw access and progressive copy already exceed the basic reference behavior. | Preserve and include in regression tests. |
| Acceptance rate and distinctions | `/docs/research/publications/` | Missing | No validated source fields. | Add optional source-backed fields; hide when absent. |
| Citation metrics | `/docs/research/publications/` | Missing | No OpenAlex cache. | Add `data/generated/publication-metrics.json` contract and rendering first; defer scheduled refresh until separately verified. |
| Landscape Analysis topic hub | `/docs/research/landscapes/` | Partially covered | Research detail pages aggregate projects/publications but not grants, software, datasets, resources, or materials. | Generalize Research pages into rich topic hubs driven by authoritative reverse relationships. |
| Curated external literature/resources | `/docs/research/landscapes/` | Missing | No Resource entity or curated topic bibliography. | Add Resource Page Bundles; only publish verified X-Lab-relevant resources. |
| Projects | `/docs/research/projects/` | Covered + Extended | COLA's public page is currently marked under development; X-Lab already has three verified project records and details. | Extend the existing model with project type, repository, and documentation while preserving URLs and data. |
| Grants portfolio | `/docs/research/grants/` | Missing | Projects are not a substitute for awards. | Add separate Grant Page Bundles, controlled statuses, active/completed grouping, relationships, and source validation. |
| Completed-grants disclosure | `/docs/research/grants/` | Missing | No grant UI. | Render accessible `<details>` or progressive disclosure with complete no-JS access. |
| Software showcase (EMOC) | `/docs/research/emoc/` | Missing | Project model cannot yet express software-specific capabilities and documentation. | Extend Projects with `projectType: software` and optional feature/install/platform/citation sections; add draft-only placeholder. |
| Study Group | `/docs/events/studygroup/` | Missing | No unified Event model. | Add Event Page Bundles plus event-series vocabulary; provide series landing page and year/month agenda/archive. |
| Reading Group | `/docs/events/readinggroup/` | Missing | No culture/goals/agenda/presenter/moderator structure. | Use the unified Event model and series page, not a second event schema. |
| Seminar Series | `/docs/events/seminars/` | Missing | No speaker/website/date-range/archive system. | Use unified Events with internal/external speakers, upcoming/completed state, and archive. |
| Event archives | `/docs/events/archive/…` | Missing | No event directory or year/month archive. | Generate a unified archive from Event dates; ensure all records remain visible without JavaScript. |
| Conference deadlines | `/docs/misc/ddl/` | Missing | No conference data or deadline calculations. | Add controlled `data/conferences.yaml`, area filters, timezone-aware deadlines, countdown, archive, local-time view, copy, and ICS. |
| Deadlines no-JS fallback | `/docs/misc/ddl/` | X-Lab extension | Reference asks users to enable JavaScript for its enhanced layout. | X-Lab must render all dates, timezones, and links server-side before enhancement. |
| Materials index | `/posts/` | Missing | No knowledge-base entity, categories, or tags. | Add bilingual Material Page Bundles, controlled categories/tags, TLDR, archive, and related-content aggregation. |
| Material article | `/posts/<slug>/` | Missing | No long-form note/tutorial layout. | Add semantic article template supporting bundle figures, code, math-ready markup, and related entities. |
| News archive | `/docs/home/news/` | Partially covered | X-Lab has source-backed list/detail pages but not year/month navigation. | Group production News by year/month and extend optional validated relationships. |
| Supplementary research page | `/docs/research/supp/plant_fm/` | Missing | Publication bundles can hold files but there is no reusable public Resource entity. | Add Resource Page Bundles and choose Resource as the authoritative owner of relationships to publications/projects. |
| Supplementary paper/code/data/BibTeX | `/docs/research/supp/plant_fm/` | Partially covered | Individual Publication fields cover many actions but not a standalone reproducibility hub. | Build Resource detail sections from optional verified fields and bundle resources. |
| Static site search | none observed as a principal public feature | X-Lab extension | No search index or UI. | Generate per-language JSON indexes at build time and add a native-JS progressive search page. |
| Unified research explorer | none observed | X-Lab extension | Relationships appear only on entity details. | Add research-area grouped linked lists using existing stable IDs and reverse aggregation. |
| Calendar/ICS deadline export | none observed | X-Lab extension | No calendar output. | Generate standards-compliant `.ics` locally from validated conference data. |

## Supplementary Public Pages Inspected

| Page | Route | Relevant interaction/content pattern |
| --- | --- | --- |
| Home | `/` | Introduction, urgent callouts, recent news, contact, embedded map. |
| Members | `/docs/home/members/` | Role groups, counts, current members, alumni subgroups and career history. |
| Vacancies | `/docs/home/vacancies/` | Funding routes, role disclosures, inquiry guidance, explicit unavailable opportunity. |
| Publications | `/docs/research/publications/` | Status/year/type grouping, abstract/BibTeX disclosures, action links, acceptance rates, citation counts. |
| Landscape Analysis | `/docs/research/landscapes/` | Topic narrative, methods, case studies, publications, curated resources and bibliography. |
| Projects | `/docs/research/projects/` | Presently under development on the reference site. |
| Grants | `/docs/research/grants/` | Active/completed counts, funder, programme, grant number, role, amount, period, disclosure. |
| EMOC | `/docs/research/emoc/` | Software overview, features, documentation, platform/dependency information. |
| Study Group | `/docs/events/studygroup/` | Intro, year/month agenda, topic, series, slides, presenter, date, archive link. |
| Reading Group | `/docs/events/readinggroup/` | Culture, goals, paper/venue, slides, presenter, moderator, agenda and archive. |
| Seminar Series | `/docs/events/seminars/` | Series intro, workshop/talk website, speakers, date range, archive. |
| Study/Reading/Seminar archives | `/docs/events/archive/…` | Past years and months with the same compact agenda grammar. |
| Deadlines | `/docs/misc/ddl/` | Area controls, upcoming/ahead/archive groups, archive toggle, JavaScript enhancement. |
| Materials | `/posts/` | Categories/tags with counts, dated cards, TLDR, images and excerpts. |
| Material detail | `/posts/NeurIPS25_MH_GraphFLA/` | Long-form research explainer with figures, questions, framework, outlook and BibTeX. |
| News archive | `/docs/home/news/` | Year/month chronological grouping and links to papers/events. |
| Supplementary | `/docs/research/supp/plant_fm/` | Paper citation, code/supplement links, narrative, figures, experiments and reproducibility notice. |

## Reference Behaviors Not to Copy Blindly

- Do not copy COLA-Lab's real vacancies, scholarship routes, grant amounts, deadlines, people, affiliations, publications, or event agendas into X-Laboratory.
- Do not reproduce reference prose, logos, photographs, screenshots, or styling assets.
- Do not copy reference placeholders such as `#TBD`, broken or duplicated labels, or under-development content into production.
- Do not adopt JavaScript-only access to core deadline or archive content.
- Do not add Russian until complete reviewed translations exist.
- Do not infer X-Laboratory relationships merely because Jiangjiao Xu appears in historical COLA-Lab pages.

## Implementation Sequence

The required sequence remains:

1. Phase A — navigation, placeholder registry, vocabularies, schemas, validation.
2. Phase B — Grants and Opportunities.
3. Phase C — unified Events and series/archive views.
4. Phase D — Resources, supplementary pages, and software/dataset support.
5. Phase E — conference deadlines and ICS.
6. Phase F — Materials, controlled categories, and tags.
7. Phase G — publications, metrics, News archive, and announcements.
8. Phase H — search and Research Explorer.
9. Phase I — final parity and visual verification.

Each implementation phase must pass the strict production build and generated-site audit before commit and deployment. Draft development placeholders must never enter production output.
