# Product Requirements Document (PRD) & AI Agent Execution Spec
**Project Name:** Kent 11+ Admissions Intelligence & Historical Trend Platform (2015–2026)  
**Target Execution Environment:** Google Antigravity (Autonomous Agentic Workspace) + Vercel (Next.js App Router) + Optional Supabase / Static JSON Engine  
**Document Owner:** Senior Product Owner  
**Last Updated:** October 2026 (For September 2027 Secondary School Entry)

---

## 1. Executive Summary & Mission Statement for Google Antigravity

### 1.1 Problem Statement
On **15 October 2026**, Kent County Council (KCC) released the 2026 Kent Test (11+) results for September 2027 entry. Parents have until **2 November 2026** to submit their Secondary Common Application Form (SCAF) listing up to 4 schools, followed by National Offer Day on **1 March 2027** and Waiting List Re-allocations / Independent Appeals between **March and May 2027**.

In 2026, candidate performance surged across the cohort, prompting KCC to raise the qualifying threshold to an **aggregate score of $345$** (up $+13$ points from the $332$ pass mark held from 2021 to 2025) and a **minimum individual paper floor of $111$** (up from $108$). Because school Published Admission Numbers (PANs) remain fixed, **raw score comparisons against 2021–2025 cut-off scores are dangerously misleading**. A score of $382$ in 2026 carries roughly the same cumulative rank position as a $370$ in 2025.

### 1.2 Agent Mission
You (Google Antigravity) are tasked with building an end-to-end, zero-assumption **Data Pipeline, Predictive Admissions Engine, and Notion-Styled Interactive Web Dashboard**. Specifically, you must:
1. **Ingest and normalize** a local directory of 12 historical KCC Kent Test Excel workbooks covering **2015 through 2026** (`.xlsx` and `.xls`).
2. **Enrich** the dataset with authoritative UK Open Government sources (**Postcodes.io**, **DfE GIAS**, **ONS Open Geography Civil Parishes**, and **KCC Determined Admission Arrangements** for all 32 Kent Grammar Schools).
3. **Compute** multi-year score-inflation curves, cumulative rank equivalences, parish/catchment polygon matches, and Ordnance Survey (`OSGB36`) straight-line distances.
4. **Build and verify** a high-craft, Notion-inspired web application that takes three core parent inputs—**2026 Kent Test Score** (Total and/or English, Maths, Reasoning breakdown), **Gender (`F`/`M`)**, and **Home Postcode**—and outputs an immediate **"One-Shot Glance"** executive summary alongside deep drill-downs for **"Apply Now (SCAF by 2 Nov)"** and **"Apply Later (Waiting List & Appeals)"**.

### 1.3 Strict Non-Negotiable Constraints
* **Zero Hallucinated Data:** Never invent, guess, or hardcode dummy numbers for score distributions, school coordinates, PANs, or historical cut-offs. Every value must trace back to the local Excel files or verified UK government datasets.
* **Strict Anti-"AI Slop" UI Policy:** No purple/blue neon gradients, no glassmorphism, no generic marketing hero banners, no floating chatbot widgets, and no stock photos. The interface must open directly into a functional, high-density **Notion-inspired workspace**.

---

## 2. Local Data Ingestion & Excel Parsing Specification (2015–2026)

### 2.1 Expected Local Directory Structure
Scan the workspace folder `/data/raw_excel/` (or root directory) for the 12 KCC Kent Test score distribution files:
* `Report-of-Kent-Test-scores-2026.xlsx` (84.8 KB)
* `Report-of-Kent-Test-scores-2025.xlsx` (31.8 KB)
* `Report-of-Kent-Test-scores-2024.xlsx` (24.6 KB)
* `Report-of-Kent-Test-scores-2023.xlsx` (24.2 KB)
* `Report-of-Kent-Test-scores-2022.xlsx` (24.2 KB)
* `Report-of-Kent-Test-scores-2021.xlsx` (47.3 KB)
* `Report-of-Kent-Test-scores-2020.xlsx` (50.3 KB)
* `Report-of-Kent-Test-scores-2019.xlsx` (24.9 KB)
* `Report-of-Kent-Test-scores-2018.xlsx` (80.8 KB)
* `Report-of-Kent-Test-scores-2017.xlsx` (89.5 KB)
* `Report-of-Kent-Test-scores-2016.xlsx` (82.2 KB)
* `Report-of-Kent-Test-scores-2015.xls` (144.5 KB — requires `xlrd` in Python alongside `openpyxl` for `.xlsx`).

### 2.2 Schema Evolution Across the Three KCC Reporting Eras
Your Python ETL script (`scripts/ingest_kcc_excel.py`) must inspect sheet names and column headers dynamically rather than assuming identical row/column indices across all 12 files:

| Reporting Era | File Years | Worksheet Structure | Granularity & Dimensions | Cell Suppression Rule |
| :--- | :--- | :--- | :--- | :--- |
| **Era 1: Legacy Detailed** | `2015–2018` | Multiple tabs covering Grammar Assessed (`G`), High School Assessed (`H`), and demographic splits | Total scores $207$ to $423$ broken down by school origin (`Kent Mainstream`, `Kent PVI/Independent`, `OOC`) and/or District & Gender | **Unredacted integers** ($0, 1, 2, \dots$). |
| **Era 2: ICO Redacted Summary** | `2019–2025` | 2 Tabs: Grammar Assessed (`G` / `Grammar`) and High School Assessed (`H` / `High`) | Total scores $207$ to $423$ segmented by `Kent Mainstream` vs. `All Other Children` + `Total` | **ICO Suppression:** Any cell with $1$ to $5$ pupils contains the string **`"5 or less"`** (or `"<=5"` / `"*"`). |
| **Era 3: Modern Unredacted Matrix** | `2026` | 3 Tabs: `'Any outcome'`, `'Assessed suitable for grammar'`, `'Assessed suitable for High'` | Exact $30\text{ rows} \times 220\text{ columns}$ matrix per tab: `Col 0` = `'District'` (14 categories), `Col 1` = `'F/M'`, `Cols 2..218` = integer scores $207\text{..}423$, `Col 219` = `'Total'`, `Row 29` = Summary column totals | **Unredacted integers** ($0$ suppressed cells). |

### 2.3 Ground-Truth Validation Checksums for 2026 (`Report-of-Kent-Test-scores-2026.xlsx`)
Your ETL pipeline **must** assert the following exact checksums against the 2026 file before proceeding:
* **Total Candidates (`'Any outcome'`, Row 29, Col `'Total'`):** $16,462$ ($8,130$ Female `'F'`, $8,332$ Male `'M'`).
* **Total Grammar Assessed (`'Assessed suitable for grammar'`, Row 29, Col `'Total'`):** $8,820$ ($4,227$ `'F'`, $4,593$ `'M'$; $53.58\%$ of cohort).
* **Total High School Assessed (`'Assessed suitable for High'`, Row 29, Col `'Total'`):** $7,642$ ($3,903$ `'F'`, $3,739$ `'M'$; $46.42\%$ of cohort).
* **Cell-by-Cell Identity Check:** Across all $28\text{ cohort rows} \times 217\text{ score columns} = 6,076\text{ cells}$, verify:
  $$\text{Count}_{\text{Any}}(r, s) - \left(\text{Count}_{\text{Grammar}}(r, s) + \text{Count}_{\text{High}}(r, s)\right) = 0$$
* **The 14 District/Origin Categories (2 rows each for `'F'` and `'M'`):**
  1. `Ashford` ($195\text{ F}, 185\text{ M}$ Grammar)
  2. `Canterbury` ($184\text{ F}, 236\text{ M}$ Grammar)
  3. `Dartford` ($266\text{ F}, 283\text{ M}$ Grammar)
  4. `Dover` ($124\text{ F}, 123\text{ M}$ Grammar)
  5. `Folkestone & Hythe` ($125\text{ F}, 134\text{ M}$ Grammar)
  6. `Gravesham` ($150\text{ F}, 197\text{ M}$ Grammar)
  7. `Kent independent` ($199\text{ F}, 231\text{ M}$ Grammar)
  8. `Maidstone` ($261\text{ F}, 254\text{ M}$ Grammar)
  9. `OOC/Misc` ($1,720\text{ F}, 1,900\text{ M}$ Grammar)
  10. `Sevenoaks` ($182\text{ F}, 194\text{ M}$ Grammar)
  11. `Swale` ($193\text{ F}, 250\text{ M}$ Grammar)
  12. `Thanet` ($178\text{ F}, 172\text{ M}$ Grammar)
  13. `Tonbridge & Malling` ($222\text{ F}, 219\text{ M}$ Grammar)
  14. `Tunbridge Wells` ($228\text{ F}, 215\text{ M}$ Grammar)

### 2.4 Critical Domain Anomalies the Parser Must Explicitly Model
1. **Anomaly A — The Headteacher Assessment (HTA) Override Zone (Scores $< \text{Pass Mark}$ on the Grammar Tab):**
   * In 2026, **$733$ pupils** on the `'Assessed suitable for grammar'` tab have total scores **below $345$** (ranging from $313$ to $344$).
   * *Domain Meaning:* These children did not achieve the automatic $345$ threshold on test day, but their primary school referred them to the local **Headteacher Assessment Panel** before results were published, and the panel awarded a Grammar assessment based on classroom attainment and the writing task.
   * *Admissions Rule:* A child with an HTA Grammar assessment is **100% eligible for pure distance/catchment grammar schools** on equal footing with a child scoring $423$. However, for score-ranked super-selective schools, their raw score ($<345$) will not clear the competitive score cut-off.
2. **Anomaly B — The Single-Paper Floor Failure Trap (Scores $\ge \text{Pass Mark}$ on the High School Tab):**
   * In 2026, **$520$ pupils** on the `'Assessed suitable for High'` tab achieved an aggregate score **$\ge 345$** (reaching as high as **$388$**), yet were assessed suitable for **High School**.
   * *Domain Meaning:* To pass automatically in 2026, a candidate needs **both** Total $\ge 345$ **and** every individual paper (English, Maths, Reasoning) $\ge 111$. A pupil scoring $141\text{ Maths} + 141\text{ Reasoning} + 106\text{ English} = 388\text{ Total}$ fails the $111$ floor and was either not referred to HTA (common for the $320$ `OOC/Misc` candidates in this group) or was turned down by HTA.
   * *Admissions Rule:* These children **cannot** be offered a grammar school place on 1 March 2027 unless they name the grammar school on their SCAF by 2 November 2026 (receiving an automatic refusal on 1 March) and win an **Independent Admission Appeal** in Spring 2027.
3. **Anomaly C — Handling ICO Suppressed Cells (`"5 or less"`) in 2019–2025 Files:**
   * When parsing 2019–2025 sheets, never cast `"5 or less"` to `0` or `NaN`.
   * For every score $s \in [207, 423]$, store a 3-tuple:
     * `exact_or_min`: $1$ if cell is `"5 or less"`, else exact integer.
     * `midpoint_est`: $2.5$ if cell is `"5 or less"`, else exact integer (calibrate against the published sheet footer total if provided so the column sum equals the official total).
     * `max_bound`: $5$ if cell is `"5 or less"`, else exact integer.

### 2.5 Historical Qualifying Threshold Reference Table (2015–2026)
Embed this lookup table in the normalisation pipeline to annotate every historical year:

| Test Year | Secondary Entry Year | Aggregate Pass Mark (Max $423$) | Minimum Single Paper Floor (Max $141$) | Standardised Paper Scale |
| :---: | :---: | :---: | :---: | :---: |
| **2015** | Sept 2016 | $320$ | $106$ | $69\text{--}141$ |
| **2016** | Sept 2017 | $320$ | $106$ | $69\text{--}141$ |
| **2017** | Sept 2018 | $320$ | $106$ | $69\text{--}141$ |
| **2018** | Sept 2019 | $320$ | $106$ | $69\text{--}141$ |
| **2019** | Sept 2020 | $323$ | $107$ | $69\text{--}141$ |
| **2020** | Sept 2021 | $330$ | $110$ | $69\text{--}141$ |
| **2021** | Sept 2022 | $332$ | $108$ | $69\text{--}141$ |
| **2022** | Sept 2023 | $332$ | $109$ | $69\text{--}141$ |
| **2023** | Sept 2024 | $332$ | $107$ | $69\text{--}141$ |
| **2024** | Sept 2025 | $332$ | $108$ | $69\text{--}141$ |
| **2025** | Sept 2026 | $332$ | $108$ | $69\text{--}141$ |
| **2026** | **Sept 2027** | **$345$** | **$111$** | **$69\text{--}141$** |

---

## 3. External UK Government Open Data Enrichment Specification

To eliminate assumptions, the agent must fetch and join the following open government datasets into `/data/processed/kent_schools_32.json`:

### 3.1 Postcode & Administrative Geography (`Postcodes.io` API)
* **Live Resolution Endpoint:** `GET https://api.postcodes.io/postcodes/{postcode}`
* **Fields Required:**
  * `result.eastings` and `result.northings` (Ordnance Survey `OSGB36` metres — required for KCC straight-line distance math).
  * `result.latitude` and `result.longitude` (`WGS84` decimal degrees — required for Leaflet / MapLibre interactive map rendering).
  * `result.admin_district` (Maps user to one of the 12 Kent Districts or identifies them as Out-of-County `OOC/Misc`, e.g., `Bexley`, `Bromley`, `Greenwich`, `Lewisham`, `Medway`, `Surrey`, `East Sussex`).
  * `result.parish` and `result.codes.parish` (Civil Parish name and 9-character ONS GSS code `E0400xxxx` — required to evaluate inner-area parish priority for West Kent, North West Kent, and East Kent grammar schools).

### 3.2 Department for Education (DfE) Get Information About Schools (GIAS) & Performance Tables
For all **32 Kent Grammar Schools**, pull official metadata by Unique Reference Number (`URN`):
* **Spatial & Structural:** Official School Name, `URN`, `DfE Number` (`886/xxxx`), Postcode, `Eastings`, `Northings`, `Latitude`, `Longitude`, Gender Entry (`Boys`, `Girls`, or `Mixed` at Year 7), and 2027 Published Admission Number (`PAN`).
* **Academic & Inspection Indicators:** Latest Ofsted judgements, KS4 `Attainment 8` score, `Progress 8` score with confidence interval, `% Achieving Grade 5+ and 7+ in English & Maths`, and KS5 `% progressing to Russell Group / Oxbridge / Higher Education`.

### 3.3 Complete Roster of the 32 Kent Grammar Schools & Admission Archetypes
Every Kent grammar school must be classified into one of **four operational admission models** in `kent_schools_32.json`:

1. **Archetype A — Pure Super-Selective (Score-Ranked across Inner & Outer Catchments):**
   * *West Kent Boys:* **The Judd School** (Tonbridge), **The Skinners' School** (Tunbridge Wells — hybrid top-score floor `Threshold + 40` = $385$ for local 140 places + remaining by score).
   * *West Kent Girls:* **Tonbridge Grammar School** (TGS).
   * *North West Kent Boys:* **Dartford Grammar School** (DGS — local priority requires `Threshold + 40` = $385$ for 130 places; Outer tier ranked purely by top score).
2. **Archetype B — Hybrid Distance Core + Governor / Outer Score Places:**
   * **Dartford Grammar School for Girls** (Distance in priority parishes + high-score quota).
   * **Wilmington Grammar School for Boys** & **Wilmington Grammar School for Girls** (Distance core + top-score places scoring $\ge \text{Threshold} + 15\text{ to }30$).
   * **Weald of Kent Grammar School** (Tonbridge & Sevenoaks campuses — distance core + high-scoring governor places).
   * **Tunbridge Wells Girls' Grammar School (TWGGS)** (Distance within named parishes + governor places).
   * **Simon Langton Grammar School for Boys** (Canterbury — priority tier for candidates scoring $\ge \text{Threshold} + 20 = 365$ within catchment).
   * **Rochester / Medway Cross-Border Note:** Out of scope for KCC's 32 schools, though optionally flag if postcode is in Medway/Gravesham.
3. **Archetype C — Pure Catchment & Distance (Once Qualified $\ge 345$, Score Does Not Rank Candidates):**
   * *West Kent:* **Tunbridge Wells Grammar School for Boys (TWGSB)** (Tunbridge Wells & Sevenoaks campuses).
   * *Maidstone & Malling:* **Maidstone Grammar School (Boys)**, **Maidstone Grammar School for Girls (MGGS)**, **Invicta Grammar School (Girls)**, **Oakwood Park Grammar School (Boys)**.
   * *Gravesham:* **Gravesend Grammar School (Boys)**, **Mayfield Grammar School (Girls)** (check governor score quota).
   * *Canterbury & Faversham:* **Simon Langton Girls' Grammar School**, **Barton Court Grammar School** (Mixed), **Queen Elizabeth's Grammar School** (Faversham, Mixed).
   * *Swale (Sittingbourne):* **Borden Grammar School (Boys)**, **Highsted Grammar School (Girls)**.
   * *Ashford:* **Highworth Grammar School (Girls)**, **The Norton Knatchbull School (Boys)**.
   * *Folkestone & Dover:* **The Folkestone School for Girls**, **The Harvey Grammar School (Boys)**, **Dover Grammar School for Boys**, **Dover Grammar School for Girls**.
   * *Thanet & Sandwich:* **Chatham & Clarendon Grammar School** (Ramsgate, Mixed), **Dane Court Grammar School** (Broadstairs, Mixed — some score/distance tiers), **Sir Roger Manwood's School** (Sandwich, Mixed).
4. **Archetype D — Boarding / Specialised Year 7 Entry:**
   * **Cranbrook School** (Mixed day and boarding — strict catchment radius around Cranbrook parish + boarding priority).

---

## 4. Mathematical & Predictive Engine Specification

### 4.1 Model 1: Cumulative Rank Equivalence (The 2026 Inflation Adjuster)
Because school PANs are static while test scores shift, the engine must translate a child's 2026 score $S_{2026} \in [207, 423]$ into an **Inflation-Adjusted Equivalent Score** $S_{\text{equiv}, Y}$ for any historical year $Y \in \{2015, \dots, 2025\}$.

1. **Cumulative Grammar Rank in 2026 ($R_{2026}$):**
   $$R_{2026}(S_{2026}) = \sum_{x = S_{2026}}^{423} N_{2026, \text{Grammar}}(x)$$
   where $N_{2026, \text{Grammar}}(x)$ is the number of grammar-assessed candidates scoring exactly $x$ in 2026.
2. **Normalized Grammar Percentile ($P_{2026}$):**
   $$P_{2026}(S_{2026}) = \frac{R_{2026}(S_{2026})}{N_{2026, \text{Grammar, Total}}}$$
   *(Or optionally unscaled rank $R_{2026}$ directly when comparing against fixed school seat supply).*
3. **Historical Equivalent Score ($S_{\text{equiv}, Y}$):**
   Find the integer score $s \in [207, 423]$ in historical year $Y$ that minimizes the absolute rank difference:
   $$S_{\text{equiv}, Y}(S_{2026}) = \arg\min_{s \in [207, 423]} \left| R_Y(s) - R_{2026}(S_{2026}) \right|$$
   * **Empirical Verification Rule:** For $Y = 2025$ and $S_{2026} \in [355, 412]$, $S_{\text{equiv}, 2025}$ must evaluate to **$10\text{ to }13\text{ points lower}$** than $S_{2026}$ (e.g., $S_{2026} = 384 \implies R_{2026}(384) = 3,447 \implies S_{\text{equiv}, 2025} = 372$, since $R_{2025}(372) = 3,457$).

### 4.2 Model 2: Localized District $\times$ Gender Competition Supply (2026 Matrix Power Feature)
Unlike county-wide tools, your engine must leverage the 28 rows of `Report-of-Kent-Test-scores-2026.xlsx` to compute **Gender-Matched Regional Seat Pressure**:
* Given child's gender $g \in \{\text{'F'}, \text{'M'}\}$, score $S_{2026}$, and a target school's catchment districts $D_{\text{school}} \subset \{\text{14 categories}\}$:
  $$\text{Local Competitors}(S_{2026}, g, D_{\text{school}}) = \sum_{d \in D_{\text{school}}} \sum_{x = S_{2026}}^{423} N_{2026, \text{Grammar}}(d, g, x)$$
* **Example Implementation (West Kent Super-Selective Boys — Judd & Skinners'):**
  * Define $D_{\text{WestKent}} = \{\text{'Sevenoaks'}, \text{'Tonbridge \& Malling'}, \text{'Tunbridge Wells'}, \text{'Kent independent'}\}$.
  * Compute exact count of boys in $D_{\text{WestKent}}$ scoring $\ge S_{2026}$ and compare directly against the combined local PAN ($157\text{ Judd Inner} + 140\text{ Skinners' Inner} = 297\text{ seats}$).

### 4.3 Model 3: Statutory "Pass Mark $+ K$" Escalator
Several Kent grammar schools define their priority score floor dynamically as $\text{Threshold}_{Y} + K$:
$$\text{PriorityFloor}_Y = \text{Threshold}_Y + K$$
* When $\text{Threshold}_{2025} = 332 \rightarrow \text{Threshold}_{2026} = 345$:
  * **Dartford Grammar (Boys) Local Priority ($K = 40$):** Floor jumps from $372$ to **$385$**.
  * **The Skinners' School Local Priority ($K = 40$):** Floor jumps from $372$ to **$385$**.
  * **Simon Langton Boys Priority ($K = 20$):** Floor jumps from $352$ to **$365$**.
* Your eligibility engine **must** enforce $\text{PriorityFloor}_{2026}$ automatically.

### 4.4 Model 4: OSGB36 Euclidean Straight-Line Distance
Kent County Council measures straight-line home-to-school distance using Ordnance Survey National Grid (`OSGB36`) Eastings ($E$) and Northings ($N$) in metres:
$$d_{\text{metres}} = \sqrt{(E_{\text{home}} - E_{\text{school}})^2 + (N_{\text{home}} - N_{\text{school}})^2}$$
$$d_{\text{miles}} = \frac{d_{\text{metres}}}{1609.344}$$
* Compare $d_{\text{miles}}$ against each school's historical **National Offer Day (March)** and **Re-allocation Day (April)** last-distance-offered radius over the past 5 years.

---

## 5. Strategic Decision Engine ("Apply Now" vs. "Apply Later")

### 5.1 User Input Contract
The dashboard header must capture:
1. **Score Input Mode:**
   * **Detailed Mode (Default):** `English` ($69\text{--}141$), `Maths` ($69\text{--}141$), `Reasoning` ($69\text{--}141$) $\rightarrow$ auto-calculates `Total Score` ($207\text{--}423$) and checks if any single paper is $< 111$.
   * **Quick Mode:** Single `Total Score` slider/input ($207\text{--}423$) + toggle for `"Did the official KCC email confirm a Grammar School assessment?"` (handles HTA passes $< 345$ and single-paper floor fails $\ge 345$).
2. **Child's Gender:** `Girl (F)` or `Boy (M)` (filters out single-sex schools of the opposite gender while keeping Mixed grammar schools).
3. **Home Postcode:** Validated UK postcode (e.g., `TN13 1XX`, `DA1 2XX`, `ME14 1XX`, `BR1 1XX`).
4. **Priority Modifiers (Compact Pills):** `Pupil Premium / FSM`, `Sibling Currently Attending`, `EHCP / Looked After Child`.

### 5.2 Eligibility Classification Bands (Per School)
Every gender-compatible grammar school is evaluated across **two pathways**—**In-Catchment (Inner Area / Parish Priority)** and **Out-of-Catchment (Outer Area / Governor Places)**—and assigned one of five deterministic badges:

| Verdict Badge | Condition | Recommended Parent Action |
| :--- | :--- | :--- |
| **`SAFE OFFER (MARCH)`** | **Distance School:** Grammar assessed + In-Catchment + $d_{\text{miles}} \le 85\%$ of 5-yr min radius.<br>**Score School:** $S_{\text{equiv}, 2025} \ge \text{Max 5-yr March Cut-off} + 3\text{ pts}$. | **Apply Now (SCAF):** Ideal 2nd or 3rd preference anchor, or 1st preference if top choice. |
| **`REALISTIC TARGET`** | **Distance School:** Grammar assessed + $d_{\text{miles}}$ within $\pm 15\%$ of 5-yr March average radius.<br>**Score School:** $S_{\text{equiv}, 2025}$ within $[-1, +2]\text{ pts}$ of 2026 entry March cut-off. | **Apply Now (SCAF):** Place above your safe insurance choice on the SCAF form. |
| **`WAITLIST / APRIL RE-ALLOCATION`** | Score or distance misses historical 1 March Offer Day cut-off by $1\text{--}4\text{ pts}$ (or $0.1\text{--}0.8\text{ miles}$), but clears the historical **April/May Waiting List cut-off**. | **Apply Now + Apply Later:** Name high on SCAF by 2 Nov to gain automatic waiting-list eligibility in March/April 2027. |
| **`APPEAL CANDIDATE (MARCH 2027)`** | Child scored $\ge 345$ Total but missed one paper floor ($< 111$, the $520$ cohort), OR scored $338\text{--}344$ without HTA pass, and lives inside a non-super-selective school's distance radius. | **Apply Now to Trigger Appeal:** Must list the grammar school on SCAF by 2 Nov 2026 so an official refusal letter is issued on 1 March 2027, unlocking the right to lodge an Independent Appeal by end of March 2027. |
| **`OUT OF RANGE`** | Score is $> 8\text{ pts}$ below inflation-adjusted super-selective cut-off OR postcode is well outside distance radius with no outer-area score pathway. | **Do Not Waste a SCAF Slot:** Preserve your 4 SCAF preferences for viable targets. |

### 5.3 SCAF 4-Preference Optimizer ("Apply Now" — Deadline 2 November 2026)
Explain and enforce KCC's **Equal Preference System**: schools never see where a parent ranked them (`1st`, `2nd`, `3rd`, `4th`). If a child qualifies for more than one school on their list, KCC offers the highest-ranked preference.
* Auto-generate a personalized **4-Slot SCAF Blueprint**:
  * **Preference 1 (Aspirational / Super-Selective / Waitlist Reach):** Highest-ambition school where the child has at least a `Waitlist / April Re-allocation` or `Realistic Target` chance.
  * **Preference 2 (Primary Target Grammar):** Strong `Realistic Target` or `Safe Offer` grammar school.
  * **Preference 3 (Safe In-Catchment Grammar):** High-certainty `Safe Offer` distance grammar school.
  * **Preference 4 (Ironclad Insurance):** Either a rock-solid local distance grammar or a safe local non-selective comprehensive school (critical so KCC does not allocate an undersubscribed school miles away if Preferences 1–3 fail).

### 5.4 Post-Offer Day Playbook ("Apply Later" — March to May 2027)
Include a dedicated timeline tab showing parents exact dates and historical movement metrics:
* **1 March 2027 (National Offer Day):** Initial offers released.
* **Mid-March 2027 (Waiting List Opt-In & Refusal Deadline):** Parents can join the KCC Waiting List for any school ranked *higher* on their SCAF than the school offered.
* **Late March 2027 (Independent Appeal Filing Deadline):** Statutory deadline to submit academic evidence (Year 6 CAT4 scores, reading/spelling ages, mock SATs, extenuating circumstances) for an Independent Appeal Panel.
* **Late April 2027 (KCC Re-allocation Round):** KCC reallocates places declined by independent school or cross-border applicants (historically dropping super-selective cut-offs by $2\text{ to }5\text{ points}$ and expanding distance radii by $0.3\text{ to }1.2\text{ miles}$).

---

## 6. UI/UX & Notion-Inspired Design System Specification

### 6.1 Visual Identity & Design Tokens (Strict Notion Aesthetic)
Use Tailwind CSS configured with the following exact palette and typography rules:
* **Backgrounds:**
  * Page Canvas: `#FFFFFF`
  * Secondary Surface / Sidebar / Table Header / Callout Box: `#F7F7F5` (Warm Notion Alabaster)
  * Hover Row State: `#F1F1EF`
* **Borders & Hairlines:** `1px solid #E9E9E7` (crisp 1px structural dividers; avoid heavy drop shadows).
* **Typography:**
  * Sans-Serif UI: `'Inter'`, `-apple-system`, `BlinkMacSystemFont`, sans-serif.
  * Monospace Numbers: `'JetBrains Mono'` or `'Geist Mono'` with `font-variant-numeric: tabular-nums` applied to every score, rank, percentage, and mileage figure.
  * Primary Text: `#37352F` | Secondary Text: `#787774` | Muted Caption: `#9B9A97`
* **Semantic Notion Status Pills:**
  * **Safe / Eligible (Green):** Background `#EDF3EC`, Text `#2B593F`, Border `#D4E4D2`
  * **Target / In-Catchment (Blue):** Background `#E7F3F8`, Text `#1F6C9C`, Border `#C9E4F0`
  * **Borderline / Waitlist / Appeal (Amber):** Background `#FBF3DB`, Text `#89632A`, Border `#F1E0B5`
  * **Ineligible / Out of Range (Red):** Background `#FDEBEC`, Text `#9E3632`, Border `#F5D0D2`

### 6.2 Screen Layout & Component Hierarchy
1. **Sticky Command Header (`h-16`, `#F7F7F5`, `border-b #E9E9E7`):**
   * Inline Notion-style property pills for: `English`, `Maths`, `Reasoning` (with auto-sum `Total: XXX / 423`), `Gender (F/M)`, `Postcode`, and `Assessment Status`.
2. **Section 1: The "One-Shot Glance" Executive Bento (4 Compact Cards):**
   * **Card 1 — 2026 Qualification & Floor Check:** Shows Pass/Fail status against $345$ Total & $111$ Paper Floor. Explicitly detects if the child is in the **$733$ HTA Override cohort** ($<345$) or the **$520$ Single-Paper Floor Fail cohort** ($\ge 345$).
   * **Card 2 — Inflation-Adjusted Rank & 2025 Equivalent:** Displays `2026 Score: XXX` $\rightarrow$ **`2025 Equivalent Score: YYY (-12 pts)`**, alongside exact cumulative rank (`#R out of 8,820 Grammar Passes`, Top $Z\%$).
   * **Card 3 — Local District $\times$ Gender Pressure:** Shows how many boys/girls in the user's home district (and target super-selective catchment) scored $\ge$ their child's score in 2026.
   * **Card 4 — Immediate SCAF Summary:** Counts of `Safe Now`, `Target Now`, `Waitlist Later`, and `Appeal Later` schools.
3. **Section 2: Interactive School Eligibility Matrix & GIS Map Split-View:**
   * **Left/Main Pane (70% Width):** Filterable Notion Database Table with view tabs:
     * `All Gender-Eligible Schools`
     * `In-Catchment (Parish / Radius)`
     * `Out-of-Catchment (Super-Selective / Outer)`
     * `SCAF Builder (4 Slots)`
   * **Right Pane (30% Width, Collapsible):** Minimalist Monochrome Map (`CartoDB Positron` tiles via Leaflet/MapLibre) plotting the home postcode pin, straight-line vectors to shortlisted schools, and historical distance cut-off circles.
4. **Section 3: 12-Year Historical Trend & Score Inflation Explorer (2015–2026):**
   * Interactive Recharts / Visx visualization with 3 views:
     * **Chart A:** 2015–2026 Cumulative Score Distribution Curves showing how the $2026$ curve shifted $+11\text{ to }+13\text{ points}$ right of $2021\text{--}2025$.
     * **Chart B:** 2026 District $\times$ Gender Pass Rate & $380+$ / $400+$ Concentration Horizontal Bar Chart.
     * **Chart C:** HTA Overrides ($<345$) vs. Single-Paper Floor Failures ($\ge 345$) by District.
5. **Slide-Over School Drill-Down Drawer (`w-[520px]`):**
   * Opens when clicking any school row. Displays:
     * 10-year historical March Offer Day vs. April Re-allocation cut-offs (raw score + inflation-adjusted 2026 projection).
     * Exact Parish/Catchment eligibility check for the user's postcode.
     * DfE GIAS & KS4/KS5 academic performance metrics.
     * Custom "Apply Now vs. Apply Later" action checklist for that specific school.

---

## 7. Step-by-Step Execution Plan for Google Antigravity

Execute the build in the following four sequential phases, running automated verification scripts after each phase:

### Phase 1: Python Data Pipeline & Normalization (`scripts/build_kent_dataset.py`)
1. Inspect all Excel files in the workspace directory (`2015` through `2026`).
2. Parse `Report-of-Kent-Test-scores-2026.xlsx` across all 3 tabs (`'Any outcome'`, `'Assessed suitable for grammar'`, `'Assessed suitable for High'`) and verify the exact checksums in Section 2.3 ($16,462$ total; $8,820$ Grammar; $7,642$ High; $733$ HTA $<345$; $520$ Floor Fail $\ge 345$).
3. Parse `2015–2025` Excel files, normalizing tab names and computing `exact_or_min`, `midpoint_est`, and `max_bound` arrays for any `"5 or less"` cells in `2019–2025`.
4. Pre-compute the cumulative rank lookup tables $R_Y(s)$ for every year $Y \in [2015, 2026]$ and every score $s \in [207, 423]$, plus the 2026 District $\times$ Gender cumulative arrays.
5. Output `/public/data/kent_distributions_2015_2026.json`.

### Phase 2: 32 Kent Grammar Schools Metadata & Admissions Rules (`scripts/build_schools_metadata.py`)
1. Compile `/public/data/kent_schools_32.json` containing all 32 Kent grammar schools with official DfE `URN`, `Eastings`, `Northings`, `Latitude`, `Longitude`, `Gender`, `2027 PAN`, `Admission Archetype`, `Statutory Threshold Offset` (e.g., $+40$ for Dartford Boys & Skinners', $+20$ for Simon Langton Boys), `Inner Catchment Districts/Parishes`, and historical March/April score and distance cut-offs (`2016–2026`).
2. Validate that all 32 schools have non-null `Eastings` and `Northings` within Kent (`Eastings` $\in [530000, 645000]$, `Northings` $\in [130000, 180000]$).

### Phase 3: Next.js Application & Predictive Engine Implementation
1. Scaffold a clean Next.js (App Router, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Leaflet/React-Leaflet) project ready for zero-config deployment on Vercel.
2. Implement `/lib/admissions-engine.ts` containing:
   * `calculate2026RankAndEquivalents(score, gender, district)`
   * `calculateOSGB36DistanceMiles(homeE, homeN, schoolE, schoolN)`
   * `evaluateSchoolEligibility(userProfile, school, distributions)`
   * `generateSCAFRecommendations(evaluatedSchools, userProfile)`
3. Implement client-side `Postcodes.io` lookup with graceful fallback and caching.
4. Build the Notion-styled single-page workspace featuring the Sticky Command Header, 4-Card Diagnostic Bento, Interactive School Matrix + GIS Map, 12-Year Historical Trend Explorer, and School Slide-Over Drawer.

### Phase 4: Automated Verification & Acceptance Gate
Before marking the task complete, run automated verification tests checking:
* **Test Case 1 (West Kent Super-Selective Inflation Check):** Boy in `TN13` (`Sevenoaks`), Score `382` ($130\text{ E}, 126\text{ M}, 126\text{ R}$). Engine must flag that `382` in 2026 equates to `~370` in 2025, placing **The Judd School** (`2026 entry cut-off 389`, `2027 est. 400–402`) as `Out of Range` and **The Skinners' School** (`2027 statutory local floor 385`) as `Borderline / Outer Pool` ($3\text{ pts}$ below the new $385$ local priority floor), while flagging **TWGSB (Sevenoaks/Tunbridge Wells)** and **Wilmington Boys** as `Safe / Realistic Target` via distance/governor rules.
* **Test Case 2 (Single-Paper Floor Fail Appeal Check):** Out-of-County Girl (`BR1`, `Bromley`), Score `380` ($140\text{ M}, 132\text{ R}, 108\text{ E}$). Engine must immediately flag **`Single-Paper Floor Trap (<111 in English)`**, classify her in the $520$-pupil High School floor-fail cohort, and switch her SCAF strategy to the **March 2027 Academic Appeal Pathway**.
* **Test Case 3 (HTA Override Distance Check):** Girl in `ME13` (`Faversham / Swale`), Score `336`, `Grammar Assessed via HTA = True`. Engine must mark **Queen Elizabeth's Grammar School (Faversham)** and **Highsted Grammar** as `Safe Offer / Realistic Target` (since score does not rank candidates at pure distance schools once HTA Grammar status is granted), while marking super-selectives as `Out of Range`.