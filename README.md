# CoSiNE project page

Static academic project website for [Conditionally Site-Independent Neural Evolution of Antibody Sequences](https://github.com/thematrixmaster/cosine) (ICML 2026).

## Local preview

Open `index.html` directly in a browser — no build step required.

## GitHub Pages deploy

1. Push the `blog/` directory contents (or the repo root if `blog/` is the root) to your GitHub repository.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set Source to **Deploy from a branch** and select the branch + folder (e.g., `main` / `/(root)` or `main` / `/docs`).
   - If deploying from a subdirectory, rename `blog/` → `docs/` or configure accordingly.
4. Save. GitHub will publish the site within ~1 minute.

## Updating content

- **Author URLs**: replace `href="#"` placeholders in `index.html` with actual links.
- **Paper/arXiv links**: update the two `href="#"` pills in the header.
- **BibTeX**: replace the placeholder entry in the Reference section with your final citation.
- **Figures**: drop replacement PNGs/SVGs into `static/figures/` using the same filenames.

## Figure sources

All figures are PNGs converted from the paper's PDF figures (rasterized at 300 DPI
via PyMuPDF — `fitz`).

| File | Source |
|------|--------|
| `static/figures/architecture.png` | Paper Figure 1 |
| `static/figures/jacobian.png` | Paper Figure 3 |
| `static/figures/guidance_affinity.png` | Paper Figure 5 |
| `static/figures/guidance_quality.png` | Paper Figure 6 |

To regenerate: place the source PDFs next to the PNGs in `static/figures/` and run

```bash
python -c "
import fitz, pathlib
for n in ['architecture','guidance_affinity','guidance_quality','jacobian']:
    p = pathlib.Path('static/figures')/f'{n}.pdf'
    if not p.exists(): continue
    d = fitz.open(str(p)); d.load_page(0).get_pixmap(dpi=300, alpha=False).save(str(p.with_suffix('.png'))); d.close()
"
```
