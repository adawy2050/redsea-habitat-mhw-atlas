# Red Sea Habitat Heatwave Atlas

A static, interactive atlas of **49,408 habitat grid cells** across the Red Sea and Gulf of Aden. It displays coral, seagrass and mangrove habitat cells, using the corrected habitat attachments from the manuscript analysis. All map and time-series values are real study data.

**Website:** https://adawy2050.github.io/redsea-habitat-mhw-atlas/

## Explore

- Animate annual habitat-cell maps for six marine heatwave metrics.
- Switch between satellite imagery and a coastline basemap; show separate coral, seagrass and mangrove coverage maps.
- Click a cell to inspect its source SST coordinate and sampling distance.
- Compare up to five pinned cells with the selected cell.
- Fit annual pixel histories to seven climate indices and either a time trend or local annual OISST SST.
- Inspect Shapley R² shares, observed/fitted histories and leave-one-year-out fit.
- Compare raw or detrended paired climate–heatwave histories with 0–2-year index leads.
- Plot any of the seven climate indices at annual or monthly frequency.
- Export pixel data, comparisons, climate series, fitted model data, map PNGs and chart SVGs.
- Share a selected cell using its latitude/longitude in the URL.
- View upcoming-season probabilities for each habitat overall, each habitat × ecoregion, or the selected pixel, with historical baselines and chronological backtests.
- Choose prediction probability in the map-variable dropdown to map individual source-cell forecasts.
- Create a point PDF with all six annual histories, the seasonal outlook, validation, climate associations and author contacts.
- View newly released NOAA monthly indices while preserving the manuscript's historical climate archive.

GHRSST MUR is the first view (2003–2025, 0.01°, baseline 2003–2022). OISST provides the longer record (1982–2025, 0.25°, baseline 1982–2011). The map locations remain habitat grid cells; selecting OISST does not increase its native SST resolution.

## Run locally

```powershell
cd 'D:\Red Sea paper\habitat-mhw-atlas'
powershell -ExecutionPolicy Bypass -File .\preview.ps1
```

Open http://localhost:8765. No Node installation, build step, API key or database is needed. Libraries, coastline geometry and scientific display data are included. Satellite imagery loads from Esri World Imagery for the visible viewport; the coastline basemap works without that service. Coverage layers are rendered publication maps of the study inventories; original GIS polygons are not distributed.

## GitHub Pages

The included `.github/workflows/pages.yml` publishes `dist/` after pushes to `main`. In repository **Settings → Pages**, set **Source** to **GitHub Actions**. Every path supports a GitHub Pages project subdirectory.

The same workflow refreshes NOAA climate observations and seasonal models at habitat, ecoregion and individual source-cell scales each Monday at 00:20 UTC (09:20 JST), and on manual dispatch. It commits the updated feed, forecast arrays, outlook and checksum files before deploying. Failed downloads leave the previous successful published version intact. MHW pixel observations remain the study record through 2025; they are not automatically extended by this climate-only job.

The current IOD archive is delayed. A fixed six-index panel (Niño-3.4, NAO, AO, EAWR, North Atlantic SST anomaly and PDO) supplies the dated seasonal outlook, with its own nested chronological backtest. The seventh index remains available in the historical analysis and latest-feed charts. Model probabilities are shown with a historical baseline and Brier skill, rather than validated alert categories.

## Data and statistics

See [DATA_METHODS.md](DATA_METHODS.md). Browser data are in `dist/data/`. `metadata.json` describes native cell coordinates and periods; `pixels.json` links habitat coordinates to those native SST cells. Binary `.f32` files are little-endian float32 arrays. Annual and seasonal histories are ordered **year × native source cell**. Forecast probabilities and scores have one value per native cell; backtests are **test year × native cell**, and coefficients are **native cell × seven coefficients**. Missing intensity/duration values are NaNs.

`validation.json` reports comparison of every habitat–ecoregion annual series and all six metrics with the corrected manuscript summaries. `manifest.json` includes asset checksums and hashes of the corrected habitat attachment and climate inputs.

Each pixel forecast is fitted to its own source-cell seasonal MHW history, threshold and training-only choice of regularisation. Habitat-wide and regional forecasts instead use their corresponding mean exposure histories. Repeated habitat attachments to one SST cell share that cell's forecast. Pixel skill is tested independently; finer spatial support does not guarantee higher skill.

The selected-cell multivariate model is calculated by `dist/stats.js`. It is a full-record statistical fit, separate from the manuscript's chronological seasonal warning analysis. Model output changes when the selected pixel, outcome, years, reference or lead changes. The paired detrending switch affects only the paired plot.

## Rebuild from the original study workspace

```powershell
python .\scripts\build_data.py
python .\scripts\build_seasonal_pixels.py
python .\scripts\update_climate.py
python .\scripts\verify.py
node .\scripts\test_stats.cjs
python .\scripts\test_outlook.py
python .\scripts\test_pixel_outlook.py
```

The builder requires the original corrected attachment table, event catalogue, OISST annual metrics/daily yearly SST files and cached NOAA indices. It reads the original files without changing them. A private `_cache/` speeds later rebuilds and is excluded from Git. The published website works directly from the included static files without those inputs.

`scripts/build_coverage.py` renders the original local habitat inventory to transparent map tiles. It requires GeoPandas, Rasterio and Pillow. `scripts/build_seasonal_pixels.py` reconstructs native-cell seasonal histories from the saved events and checks annual totals and monthly habitat summaries. `scripts/update_climate.py` requires NumPy, pandas and SciPy and works from the included seasonal histories and training cases; scheduled refreshes never need the large original event or SST archives. `scripts/test_pixel_outlook.py` compares batched forecasts with independent scalar fits and sampled nested backtests.

## Sources and attribution

Ahmed Eladawy and Mohammed Shaltout. Contacts: ahmed.eladawy@jamstec.go.jp and mohamed.shaltot@alexu.edu.eg. SST: NASA/JPL GHRSST MUR v4.1 and NOAA OISST v2.1. Habitat inventories: UNEP-WCMC Ocean+ Habitats (coral 2021, seagrass 2021, mangroves 2010). Climate: NOAA CPC, PSL and NCEI ERSSTv5. Satellite imagery: Esri, Vantor, Earthstar Geographics and the GIS User Community. Coastline: Natural Earth public-domain land vectors. Leaflet 1.9.4, Plotly.js 2.35.2, jsPDF 4.2.1 and jsPDF-AutoTable 5.0.8 are vendored with their original license notices. Original data providers' use and attribution terms continue to apply. This repository contains sampled numerical habitat-cell values and rendered coverage maps, not the original habitat polygon datasets or cached satellite imagery.
