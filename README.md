# Red Sea Habitat Heatwave Atlas

A static, interactive atlas of **49,408 habitat grid cells** across the Red Sea and Gulf of Aden. It displays coral, seagrass and mangrove habitat cells, using the corrected habitat attachments from the manuscript analysis. All map and time-series values are real study data.

**Website:** https://adawy2050.github.io/redsea-habitat-mhw-atlas/

## Explore

- Animate annual habitat-cell maps for six marine heatwave metrics.
- Click a cell to inspect its source SST coordinate and sampling distance.
- Compare up to five pinned cells with the selected cell.
- Fit annual pixel histories to seven climate indices and either a time trend or local annual OISST SST.
- Inspect Shapley R² shares, observed/fitted histories and leave-one-year-out fit.
- Compare raw or detrended paired climate–heatwave histories with 0–2-year index leads.
- Plot any of the seven climate indices at annual or monthly frequency.
- Export pixel data, comparisons, climate series, fitted model data, map PNGs and chart SVGs.
- Share a selected cell using its latitude/longitude in the URL.

GHRSST MUR is the first view (2003–2025, 0.01°, baseline 2003–2022). OISST provides the longer record (1982–2025, 0.25°, baseline 1982–2011). The map locations remain habitat grid cells; selecting OISST does not increase its native SST resolution.

## Run locally

```powershell
cd 'D:\Red Sea paper\habitat-mhw-atlas'
powershell -ExecutionPolicy Bypass -File .\preview.ps1
```

Open http://localhost:8765. No Node installation, build step, API key or database is needed. All libraries, coastline vectors and scientific data are included; the atlas makes no runtime requests to external tile services or climate archives.

## GitHub Pages

The included `.github/workflows/pages.yml` publishes `dist/` after pushes to `main`. In repository **Settings → Pages**, set **Source** to **GitHub Actions**. The static package is approximately 31 MB, and every path supports a GitHub Pages project subdirectory.

## Data and statistics

See [DATA_METHODS.md](DATA_METHODS.md). Browser data are in `dist/data/`. `metadata.json` describes native cell coordinates, periods and array ordering; `pixels.json` links habitat coordinates to those native SST cells. Binary `.f32` files are little-endian float32 arrays, ordered **year × native source cell**. Missing intensity/duration values are NaNs.

`validation.json` reports comparison of every habitat–ecoregion annual series and all six metrics with the corrected manuscript summaries. `manifest.json` includes asset checksums and hashes of the corrected habitat attachment and climate inputs.

The selected-cell multivariate model is calculated by `dist/stats.js`. It is a full-record statistical fit, separate from the manuscript's chronological seasonal warning analysis. Model output changes when the selected pixel, outcome, years, reference or lead changes. The paired detrending switch affects only the paired plot.

## Rebuild from the original study workspace

```powershell
python .\scripts\build_data.py
python .\scripts\verify.py
node .\scripts\test_stats.cjs
```

The builder requires the original corrected attachment table, event catalogue, OISST annual metrics/daily yearly SST files and cached NOAA indices. It reads the original files without changing them. A private `_cache/` speeds later rebuilds and is excluded from Git. The published website works directly from the included static files without those inputs.

## Sources and attribution

Ahmed Eladawy and Mohammed Shaltout. SST: NASA/JPL GHRSST MUR v4.1 and NOAA OISST v2.1. Habitat inventories: UNEP-WCMC Ocean+ Habitats. Climate: NOAA CPC, PSL and NCEI ERSSTv5. Coastline: Natural Earth public-domain land vectors. Leaflet 1.9.4 and Plotly.js 2.35.2 are vendored with their original license notices. Original data providers' use and attribution terms continue to apply. This repository contains sampled numerical habitat-cell values, not a redistribution of the original habitat polygon datasets.
