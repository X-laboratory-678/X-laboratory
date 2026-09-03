# Missing Information Registry

This registry is the only approved place for tracking facts that have not been supplied or verified. Placeholder tokens may be used in draft-only development fixtures, but must never appear in a production build. Replace an entry only after recording an acceptable source in `docs/content-sources.md`.

`Blocking production` means blocking publication of that specific record or feature, not blocking unrelated site releases.

| Placeholder ID | Module | Exact information needed | Why needed | Acceptable source | Blocking production | Status |
|---|---|---|---|---|---|---|
| `{{GRANT_01_TITLE_ZH}}` | Grants | Official Chinese grant title | Public title and identity | Award notice, contract, or funder database | Yes, Grant 01 | Missing |
| `{{GRANT_01_TITLE_EN}}` | Grants | Approved English grant title | English translation | Official bilingual record or PI-approved translation | Yes, Grant 01 English | Missing |
| `{{GRANT_01_FUNDER}}` | Grants | Official funding body name | Funder attribution | Funder database or award document | Yes, Grant 01 | Missing |
| `{{GRANT_01_PROGRAM}}` | Grants | Programme/scheme name | Directory metadata | Funder database or award document | No if genuinely absent | Missing |
| `{{GRANT_01_NUMBER}}` | Grants | Grant number | Record disambiguation | Funder database or award document | No if not public | Missing |
| `{{GRANT_01_ROLE}}` | Grants | X-Laboratory/PI role | Prevents inventing PI/Co-PI status | Award document or PI confirmation | Yes, Grant 01 | Missing |
| `{{GRANT_01_AMOUNT}}` | Grants | Award amount | Optional factual display | Award document or public funder record | No | Missing |
| `{{GRANT_01_CURRENCY}}` | Grants | ISO currency for the amount | Makes amount unambiguous | Same source as amount | Yes when amount is used | Missing |
| `{{GRANT_01_START_YEAR}}` | Grants | Verified start year | Period and status | Award document or funder record | Yes, Grant 01 | Missing |
| `{{GRANT_01_END_YEAR}}` | Grants | Verified end year | Period and archive grouping | Award document or funder record | No for ongoing award if unknown | Missing |
| `{{GRANT_01_OFFICIAL_URL}}` | Grants | Public official award URL | Provenance and user verification | Funder/university official page | No | Missing |
| `{{OPPORTUNITY_01_TITLE}}` | Opportunities | Confirmed opening title in each language | Prevents a fabricated vacancy | Official university notice or written PI authorization | Yes, Opportunity 01 | Missing |
| `{{OPPORTUNITY_01_TYPE}}` | Opportunities | One approved type ID | Filtering and eligibility context | Same vacancy source | Yes, Opportunity 01 | Missing |
| `{{OPPORTUNITY_01_STATUS}}` | Opportunities | Upcoming/open/closed/archived | Prevents stale applications | Same vacancy source | Yes, Opportunity 01 | Missing |
| `{{OPPORTUNITY_01_SUMMARY}}` | Opportunities | Source-backed summary | Directory copy | Official notice or PI-approved copy | Yes, Opportunity 01 | Missing |
| `{{OPPORTUNITY_01_DEADLINE}}` | Opportunities | Exact deadline with timezone, or explicit no-deadline statement | Automatic state and countdown | Official notice | Yes if advertised as time-limited | Missing |
| `{{OPPORTUNITY_01_START_DATE}}` | Opportunities | Expected start date if public | Applicant planning | Official notice | No | Missing |
| `{{OPPORTUNITY_01_FUNDING}}` | Opportunities | Funding type and approved description | Avoids invented scholarships/funding | Official notice or university policy | No; omit if unknown | Missing |
| `{{OPPORTUNITY_01_ELIGIBILITY}}` | Opportunities | Exact eligibility requirements | Safe applicant guidance | Official notice/policy | Yes when publishing an opening | Missing |
| `{{OPPORTUNITY_01_URLS}}` | Opportunities | Application and official source URLs | Application action and provenance | Official university systems/pages | Yes for an application CTA | Missing |
| `{{OPPORTUNITY_01_CONTACT}}` | Opportunities | Existing People stable ID for contact | Routes inquiries correctly | Official notice or PI confirmation | No | Missing |
| `{{EVENT_01_TITLE}}` | Events | Verified bilingual event title | Event identity | Organizer/university notice | Yes, Event 01 | Missing |
| `{{EVENT_01_DATE}}` | Events | Exact start date/time and timezone | Ordering and archive | Organizer/university notice | Yes, Event 01 | Missing |
| `{{EVENT_01_END_DATE}}` | Events | End date/time when applicable | Multi-day display | Organizer notice | No | Missing |
| `{{EVENT_01_SERIES}}` | Events | Approved series ID and event type | Grouping | Organizer record or lab confirmation | Yes, Event 01 | Missing |
| `{{EVENT_01_PARTICIPANTS}}` | Events | Internal People IDs and external speaker names | Attribution | Agenda or organizer report | Yes for named-person claims | Missing |
| `{{EVENT_01_LOCATION}}` | Events | Public location or online venue | Attendance information | Organizer notice | No for archive-only record | Missing |
| `{{EVENT_01_RESOURCES}}` | Events | Official paper/slides/video/website URLs | Event resources | Organizer, publisher, or presenter-approved files | No | Missing |
| `{{MEMBER_02_NAME_ZH}}` | People | Member's preferred Chinese name | Profile identity | Member confirmation or official profile | Yes, Member 02 | Missing |
| `{{MEMBER_02_PROFILE}}` | People | English name, role/category, status, bio, interests, links, and approved portrait | Complete verified profile | Member confirmation and official profile | Yes, Member 02 | Missing |
| `{{RESOURCE_01_DETAILS}}` | Resources | Bilingual title/summary, type, rights/license, files/URLs, and verified relationships | Publish a research resource | Publisher/repository record and owner confirmation | Yes, Resource 01 | Missing |
| `{{SOFTWARE_01_DETAILS}}` | Projects/Software | Name, description, version/support, repository, documentation, license, platforms, citation, and owners | Publish software showcase | Maintainer-controlled repository/docs | Yes, Software 01 | Missing |
| `{{MATERIAL_01_DETAILS}}` | Materials | Bilingual article, authors, date, category/tags, assets and rights | Publish knowledge-base content | Author-approved manuscript and assets | Yes, Material 01 | Missing |
| `{{CONFERENCE_01_DETAILS}}` | Deadlines | Official name/short name, areas, website, venue, conference dates, each deadline and timezone | Timezone-safe deadline tool | Official conference website or CFP | Yes, Conference 01 | Missing |
| `{{ANNOUNCEMENT_01_*}}` | News | Verified bilingual announcement, exact date, source, and direct lab relationship | Prevents invented News | University/lab-authorized source | Yes, Announcement 01 | Missing |
| `{{OPENALEX_ID_DISTRIBUTED_DEEP_RL_WATER_HEATER}}` | Metrics | OpenAlex work ID matching the DOI/title | Cached citation metrics | OpenAlex API record verified against DOI | No; metrics stay hidden | Missing |
| `{{OPENALEX_ID_META_RL_ENERGY_STORAGE_CONTROL}}` | Metrics | OpenAlex work ID matching the DOI/title | Cached citation metrics | OpenAlex API record verified against DOI | No; metrics stay hidden | Missing |
| `{{OPENALEX_ID_MULTIOUTPUT_TIME_SERIES_FORECASTING}}` | Metrics | OpenAlex work ID matching the DOI/title | Cached citation metrics | OpenAlex API record verified against DOI | No; metrics stay hidden | Missing |
| `{{OPENALEX_ID_MULTISCALE_TRANSFORMER_INSULATOR_DETECTION}}` | Metrics | OpenAlex work ID matching the DOI/title | Cached citation metrics | OpenAlex API record verified against DOI | No; metrics stay hidden | Missing |
| `{{OPENALEX_ID_PREFERENCE_ONLINE_RL_SMART_GRID}}` | Metrics | OpenAlex work ID matching the DOI/title | Cached citation metrics | OpenAlex API record verified against DOI | No; metrics stay hidden | Missing |

## Registry Maintenance

- Use uppercase snake-case tokens inside double braces.
- Never replace a token with an estimate, inferred date, inferred relationship, or marketing copy.
- Draft fixtures must keep `draft: true`; production builds and `audit-site.py` reject visible placeholder patterns.
- When information is supplied, update the content, its provenance entry, and this registry in the same focused change.
