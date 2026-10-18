# Atlas interface upgrade

## Baseline architecture (before phase 1)

The build-free site is served from `dist/` on GitHub Pages. Leaflet draws the habitat cells on a canvas; Plotly draws annual histories, regression fits, monthly climate indices and forecast validation. `app.js` owns selection, filters and rendering inside an IIFE. `stats.js` contains the existing scientific calculations and will remain unchanged. `point-report.js` creates local jsPDF reports. `i18n.js` translates source strings and manages EN/AR and RTL. The three existing JPEG cards have original-file links and a separate credits catalogue. The Monday 00:20 UTC workflow refreshes NOAA monthly feeds and seasonal model estimates; it does not fetch new SST records. Published heatwave histories end in 2025.

Work is on `ui-upgrade`, with one commit per phase. Existing scientific data, validation outputs and statistics are preserved byte for byte. Additional observed daily display data, if available, must be separate files with source dates; annual model fits are not forecasts. Future curves require documented inputs or an explicit scenario, never fabricated observations.

## Phase 1 — photography

Completed: 12 verified photographs, 3,000–8,121 px on the long edge, with unchanged originals and AVIF/WebP/JPEG previews at 480/960/1600/2400 px. Added a basin-filtered slideshow, native-pixel lightbox with pan/swipe/keyboard close, a reef hero (AVIF ≤258 KB), and habitat-linked illustrative images in the point panel. Bleaching images are correctly labelled as comparisons from outside the study basins. Sources, authors, licences, hashes and rejected candidates are in PHOTO_AUDIT.md. Removed the requested name from portal contacts, credits and PDF authorship. Scientific arrays and stats.js are unchanged.

Validation: verify.py and test_stats.cjs passed; browser checks passed for EN/AR, Gulf filtering, full originals, zoom, Escape and 360 px layout.


## Before phase 2 — guided tour

The map and charts still use the existing app state. A small explicit UI bridge will expose selection and metric/year controls without changing statistical routines. The tour will compute its statements from the selected cell arrays and existing forecast output; route state will use `tour=`.
