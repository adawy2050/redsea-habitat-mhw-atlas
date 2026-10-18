# Atlas interface upgrade

## Baseline architecture (before phase 1)

The build-free site is served from `dist/` on GitHub Pages. Leaflet draws the habitat cells on a canvas; Plotly draws annual histories, regression fits, monthly climate indices and forecast validation. `app.js` owns selection, filters and rendering inside an IIFE. `stats.js` contains the existing scientific calculations and will remain unchanged. `point-report.js` creates local jsPDF reports. `i18n.js` translates source strings and manages EN/AR and RTL. The three existing JPEG cards have original-file links and a separate credits catalogue. The Monday 00:20 UTC workflow refreshes NOAA monthly feeds and seasonal model estimates; it does not fetch new SST records. Published heatwave histories end in 2025.

Work is on `ui-upgrade`, with one commit per phase. Existing scientific data, validation outputs and statistics are preserved byte for byte. Additional observed daily display data, if available, must be separate files with source dates; annual model fits are not forecasts. Future curves require documented inputs or an explicit scenario, never fabricated observations.

## Phase 1 — photography

Completed: 12 verified photographs, 3,000–8,121 px on the long edge, with unchanged originals and AVIF/WebP/JPEG previews at 480/960/1600/2400 px. Added a basin-filtered slideshow, native-pixel lightbox with pan/swipe/keyboard close, a reef hero (AVIF ≤258 KB), and habitat-linked illustrative images in the point panel. Bleaching images are correctly labelled as comparisons from outside the study basins. Sources, authors, licences, hashes and rejected candidates are in PHOTO_AUDIT.md. Removed the requested name from portal contacts, credits and PDF authorship. Scientific arrays and stats.js are unchanged.

Validation: verify.py and test_stats.cjs passed; browser checks passed for EN/AR, Gulf filtering, full originals, zoom, Escape and 360 px layout.


## Before phase 2 — guided tour

The map and charts still use the existing app state. A small explicit UI bridge will expose selection and metric/year controls without changing statistical routines. The tour will compute its statements from the selected cell arrays and existing forecast output; route state will use `tour=`.

Phase 2 completed: six shareable steps select real cells across all five ecoregions and the next-season outlook. Annual statements are calculated from existing native MUR arrays; the final step reads current cell probability, baseline and Brier skill. The persistent tour can exit at any step. Browser checks passed for all six Arabic steps and URL/selection state.

## Before phase 3 — linked exploration and dense records

The canvas layer already draws only visible map bounds. The UI bridge can reuse arrays, selected cell and map without duplicating state. Dense histories will be separate, lazy per-cell daily OISST records and original event-day monthly counts; existing annual arrays/models stay untouched. Daily climate observations will be supplied only for indices with genuine daily source products, not interpolated monthly data. Existing output covers the DJF season through February 2027; other future annual values require explicit assumptions.

Phase 3 completed: place search (12 bundled coastal places), linked year hover and chart range, map-cell hover sparklines, rectangle/current-extent selection with histogram and CSV, 20-cell hotspot ranking, and a two-year map swipe. Canvas position caching was retained instead of adding WebGL. The baseline at the full-basin view was 29.8 ms mean / 33.6 ms p95; a regional cached view measured 1.7 / 2.6 ms (a like-for-like full-view measurement follows in phase 6). Annual playback has a 750 ms cadence, so this is adequate without changing renderers.

Added separate display-only records: 16,071 daily OISST dates at all 483 native habitat source cells and exact native monthly MHW counts. Independent checks reproduce all annual MHW-day totals exactly and OISST annual SST means within 0.0001 °C. No existing study arrays, model files, validation files or stats.js changed. AO/NAO daily NOAA CDAS observations extend to 15 October 2026 and now refresh with the weekly workflow; other monthly indices are not interpolated into daily values.

A separate dotted timeline displays historical probability backtests and the actual DJF December 2026–February 2027 estimate. Optional dotted annual conditional values use available index means and hold missing future inputs constant; their assumptions are visible and exportable, and they do not change the original fit. Six-page point reports now include daily/monthly observations, seven monthly climate indices plus faint daily AO/NAO and conditional values. Browser checks passed for dense curves, Gulf place search, swipe, selection histogram and PDF download; every PDF page was rendered and visually inspected.

## Before phase 4 — organisation, sources and copy

Filters still have stable IDs read by app.js, so secondary controls can be moved into a drawer without changing state. The methods dialog has separate complete EN/AR bodies; they can be reorganised into a table of contents and collapsible sections. Forecast cards already contain probability and backtest outputs; presentation will expose a comparison bar and hide technical detail behind accessible disclosure controls. Papers/news will use separate bilingual, editable catalogues with original source links.

Phase 4 completed: secondary filters and coverage controls moved into an accessible side drawer, preserving IDs and state. All EN/AR methods paragraphs remain in collapsible sections with a desktop contents list. Native keyboard disclosures explain seven scientific terms. Forecast cards retain probability/baseline bars and all validation details behind “How reliable is this?”. Added 20 verified published papers in pages of ten and six dated source-linked NOAA/NASA/WMO bulletins, with independent slideshow controls and full Arabic titles/summaries. The requested name is absent from the curated portal catalogue as well as contacts and reports; no published authorship was rewritten.

Catalogues live in `dist/content/`. Adding bilingual entries updates the interface without rebuilding. The weekly job refreshes the ENSO bulletin date and checks publisher DOI metadata every 90 days; new editorial news selections require a reviewed catalogue entry. Existing article dates and summaries are never invented from a generic feed. Browser checks passed for drawer controls, retained Arabic methods content, two ten-paper pages and EN/AR news.

## Before phase 5 — visual identity

The upgrade is a local CSS layer loaded after the existing styles, with separate small feature modules. The remaining work is tokens and self-hosted fonts, warm atlas typography, theme switching, consistent SVG controls, restrained entrance motion and reduced-motion handling. The canvas remains the measured renderer; metric numbers and legend endpoints remain unchanged.
