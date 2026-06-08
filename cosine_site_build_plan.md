# Build plan: CoSiNE project page (static site)

## Goal
A single-page academic project website for the paper "Conditionally Site-Independent
Neural Evolution of Antibody Sequences" (ICML 2026), styled after the academic
project-page template (cryoDRGN-AI / Nerfies family): centered single column,
linked author list, link pills, a one-line description, a teaser figure, then
Abstract / Method / Results / BibTeX. Restrained, lots of whitespace, figures with
bold lead-in captions.

## Tech
- Vanilla static site. No framework, no build step. Plain `index.html` + `style.css` + `main.js`.
- Deploy target: GitHub Pages (root or `/docs`). Must work as static files opened directly.
- Two small interactive pieces, both vanilla JS (no React): the results tables (data-driven)
  and the interactive Figure 1 teaser (an inline SVG with clickable stages that scroll to the
  relevant section — NOT model inference).
- Responsive: single column max-width ~720px, centered; tables horizontally scrollable on mobile.
- Light theme primary. (Dark mode optional, low priority.)

## File structure
```
/index.html
/style.css
/main.js
/static/
  figures/
    architecture.svg        (or .png — interactive teaser; see note)
    jacobian.png            (paper Figure 3, categorical Jacobian)
    guidance_affinity.png   (paper Figure 5)
    guidance_quality.png    (paper Figure 6)
    robustness.png          (branch-length plot, optional subsection)
  cosine.bib
```
I will provide the figure files separately. Use exact paper figures; do not regenerate them.

## Page sections, in order

### 1. Header
- Centered title (full paper title).
- Author list, centered, each name a hyperlink (use `#` placeholders; I'll fill URLs).
  Mark equal contribution with `*` after Lu and Vermani, plus a footnote line
  "* Equal contribution".
- Affiliation line + venue: "UC Berkeley · Mila · Université de Montréal · Fred Hutch · Columbia    ICML 2026"
- Link pills (rounded, subtle border): Paper, Code (github.com/thematrixmaster/cosine), arXiv.

### 2. One-line description (bold, centered, ~17px)
Use exactly:
"CoSiNE explicitly models the dynamics of affinity maturation — the evolutionary process
most antibody sequence models leave implicit."

### 3. Teaser: interactive Figure 1 (architecture)
- Inline SVG pipeline: x (EVQLV...) → CoSiNE PLM backbone → per-site rate matrices Q(x):L×20×20
  (conditioned on x) → exp(t·Q) per site → product over sites → p(y|x,t).
- A dashed footer box stating the core idea: "Conditional site-independence — each site's
  rate matrix sees the whole sequence (epistasis), but transitions factorize across sites
  (tractable)."
- Interaction: clicking a stage smooth-scrolls to the related section (Method). Keep it calm —
  line-art, single accent color, no animation beyond a subtle hover highlight.
- Caption below (12.5px, muted): "A neural network maps an antibody sequence to per-site rate
  matrices conditioned on the full sequence; matrix exponentials evolve each site over time t,
  and their product gives the transition probability p(y | x, t)."
- (I will provide the SVG source for this; drop it in inline.)

### 4. Abstract
- Heading "Abstract" centered.
- Body justified, ~15px, verbatim from the paper:

"Common deep learning approaches for antibody engineering focus on modeling the marginal
distribution of sequences. By treating sequences as independent samples, however, these methods
overlook affinity maturation as a rich and largely untapped source of information about the
evolutionary process by which antibodies explore the underlying fitness landscape. In contrast,
classical phylogenetic models explicitly represent evolutionary dynamics but lack the expressivity
to capture complex epistatic interactions. We bridge this gap with CoSiNE, a continuous-time Markov
chain parameterized by a deep neural network. Mathematically, we prove that CoSiNE provides a
first-order approximation to the intractable sequential point mutation process, capturing epistatic
effects with an error bound that is quadratic in branch length. Empirically, CoSiNE outperforms
state-of-the-art language models in zero-shot variant effect prediction by explicitly disentangling
selection from context-dependent somatic hypermutation. Finally, we introduce Guided Gillespie, a
classifier-guided sampling scheme that steers CoSiNE at inference time, enabling efficient
optimization of antibody binding affinity toward specific antigens."

### 5. Method
- Heading "Method".
- Figure: jacobian.png (Figure 3) with bold lead-in + caption.
- Lead-in: "**Conditional site-independence.** Each site's rate matrix is conditioned on the entire
  sequence, so the model captures epistasis — yet transitions factorize across sites, keeping the
  likelihood tractable."
- Caption (muted): "The categorical Jacobian reveals strong off-diagonal coupling within and across
  CDR regions, confirming that CoSiNE learns inter-residue and inter-chain dependencies."

### 6. Results

#### 6a. The selection score (paired bar chart, placed BEFORE the table)
- Grouped bar chart (Chart.js bar type) matching the paper's Figure 4 encoding: two bars per assay
  — log-likelihood (muted, #C9D9D2 fill / #9FBDB0 border) and selection score (solid teal #1D9E75).
  The selection-score bar is taller on every assay — that is the message. y-axis "Spearman ρ",
  range 0–0.7. Hover tooltips show ρ to 2 decimals. Custom HTML legend above the canvas
  (Log-likelihood / Selection score). Optionally group x-labels into Expression (first 3) and
  Binding (last 4) with a thin under-axis band — do NOT recolor bars to encode this (two colors
  already used for the metric pair).
- Data (assay: loglik ρ, selection ρ) — VERIFY against source before shipping; read off Figure 4,
  approximate:
  Koenig Exp(H): 0.53, 0.61   Koenig Exp(L): 0.45, 0.51   Adams: 0.40, 0.46
  Koenig Bind(H): 0.34, 0.46  Koenig Bind(L): 0.32, 0.37  Shaneh.119: 0.46, 0.50  Shaneh.120: 0.45, 0.54
- Lead-in: "**Disentangling selection from mutation.** A raw likelihood conflates which mutations
  are *probable* under somatic hypermutation with which are *beneficial*. CoSiNE's selection score —
  a log-likelihood ratio against a frozen SHM model — removes that mutational bias. Across all
  seven assays, correlating fitness with the selection score rather than the raw likelihood
  improves the Spearman correlation."
- Caption (muted): "Spearman ρ of the raw log-likelihood versus the SHM-corrected selection score
  (Equation 5). The correction helps on every assay, with the largest gains where mutational bias
  is strongest. Values from the paper's Figure 4."

#### 6b. Variant effect prediction (single TABLE, not chart)
- ONE HTML table, all 9 assays, 8 models, data-driven via main.js (compute bold=best,
  underline=second-best PER COLUMN from the data arrays so they cannot drift).
- Three column groups with uppercase subgroup headers:
  Expression (3) | Binding (4) | Binding · MAGMA-seq (2)
  The third group preserves the protocol distinction (Petersen uses MAGMA-seq) visually,
  without splitting the table. Same eight model rows across all 9 columns.
- Styling: thin row rules (0.5px), subtle vertical divider between groups, CoSiNE row shaded
  (background-secondary) and name weight 500, tabular-nums, right-aligned decimals to 3 places.
  Wrap in a horizontally-scrollable container for narrow screens; ~12px font so 10 columns fit.
- Columns (in order):
  Koenig Exp(H), Koenig Exp(L), Adams | Koenig Bind(H), Koenig Bind(L), Shaneh.119, Shaneh.120
  | Petersen 319-345, Petersen 222-1C06
- Data (9 values each, in the column order above):
  AbLang-2:  [0.096,-0.127,-0.097,-0.090,-0.011,0.253,0.209,0.199,0.060]
  DASM:      [0.596,0.474,0.270,0.415,0.327,0.450,0.536,0.395,0.286]
  PRISM:     [0.069,0.129,0.297,0.005,0.061,0.348,0.286,0.312,-0.073]
  ESM2-150M: [0.413,0.485,-0.112,0.112,0.266,0.236,0.205,0.250,-0.139]
  ESM2-650M: [0.326,0.429,0.124,0.063,0.265,0.227,0.360,0.278,0.013]
  ProGen2-S: [0.407,0.513,-0.024,0.098,0.332,0.119,0.070,0.329,0.024]
  ProGen2-M: [0.392,0.408,0.231,0.085,0.235,0.299,0.319,0.294,0.036]
  CoSiNE:    [0.613,0.508,0.464,0.456,0.371,0.498,0.536,0.504,0.328]
- Lead-in: "**Zero-shot variant effect prediction.** Across nine assays spanning expression,
  binding, and held-out MAGMA-seq binding measurements, CoSiNE matches or beats the best baseline
  on eight of nine — without ever seeing experimental fitness labels during training."
- Caption (muted): "Spearman ρ between model score and measured fitness; best per assay in bold,
  second-best underlined. The MAGMA-seq (Petersen) assays use a different experimental protocol
  and are held out from the main benchmark. CoSiNE evaluated at t = 0.2. Bolding/underlining is
  computed from the values; Shaneh.120 is an exact tie with DASM."

#### 6c. Steering evolution
- Figures: guidance_affinity.png (Fig 5) and guidance_quality.png (Fig 6), side by side or stacked.
- Lead-in: "**Steering evolution.** Guided Gillespie shifts sampled antibodies toward higher
  predicted binding affinity against SARS-CoV targets, while preserving humanness and structural
  plausibility — at roughly a 500× speedup over exact oracle guidance."

#### 6d. (Optional) Robustness
- robustness.png with caption noting stability over t ∈ [0.1, 0.4] (Δρ ≤ 0.045) and fixed t = 0.2.

### 7. Reference
- "Reference" heading, BibTeX in a monospace box (load/paste from cosine.bib).

## HARD CONSTRAINTS / honesty guardrails (do not violate)
- VEP claim wording: "matches or beats the best baseline on eight of nine." Do NOT write
  "outperforms all" (Koenig Exp(L) is a loss to ProGen2-S; Shaneh.120 is a tie). The nine assays
  may be shown in one table; the MAGMA-seq (Petersen) columns use a different experimental
  protocol and should be labeled as such, but the same eight baselines were run on all nine.
- Do NOT claim CoSiNE beats Discrete Flow Matching empirically — no DFM baseline was run.
  If DFM is mentioned anywhere, frame as complementary/conceptual only.
- If the ESM2 ablation is mentioned, phrase as "much of the predictive power comes from the
  evolutionary training objective rather than the ESM2 initialization" — NOT "all" / not
  "the objective alone."
- "best baseline per assay" must be described as such — it is a different model per column,
  not a single baseline.
- Bolding/underlining in tables must be computed from the data arrays in JS, never hardcoded.

## Style notes
- Sentence case everywhere. Two font weights (400/500). No heavy borders, no drop shadows.
- Max-width ~720px centered. Generous vertical spacing between sections.
- Link pills: rounded, 0.5px border, background-secondary, icon + label.
- Figures: centered, full content width, thin border or none, muted caption beneath with a
  bold lead-in clause.
- Tables: horizontally scrollable wrapper on narrow screens.
- Provide a README with GitHub Pages deploy steps.
```
