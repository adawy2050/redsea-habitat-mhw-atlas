# Red Sea & Arabian Gulf Habitat Heatwave Atlas

A static, interactive atlas of **65,348 habitat grid cells**: 49,408 in the Red Sea and Gulf of Aden, and 15,940 in the Arabian Gulf and Gulf of Oman. It uses the two independent study pipelines, with unique habitat-cell sampling and valid marine SST attachments. Original Red Sea annual histories and pixel forecasts are preserved unchanged.

**Website:** https://adawy2050.github.io/redsea-habitat-mhw-atlas/

## Explore

- Select both study areas, the Red Sea, or the Arabian Gulf; filter their MEOW ecoregions.
- Animate annual habitat-cell maps for six marine heatwave metrics.
- Distinguish solid observed series from dotted annual model fits; toggle fitted linear trends in history and climate charts.
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
- Switch between English and Arabic at the top; Arabic uses a right-to-left layout, translated controls, chart labels and methods. The choice persists and can be shared with `?lang=ar` or `?lang=en`.
- Set the climate chart's own date range, jump to the current year, or view annual means including clearly labelled partial years. Latest-month cards retain each index's actual publication date.
- Open the Red Sea habitat photographs at their original resolution, with photographer and open-licence credits beside each image.

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

The climate panel also shows the selected point's next-season forecast with its dates, historical probability and backtest. Its climate date range is independent of the MHW analysis years. Current-year monthly data stop at the latest available observations; annual means for incomplete years use available months only, with month counts included in CSV exports. The downloadable point PDFs remain in English, as labelled in the Arabic interface.

## Data and statistics

See [DATA_METHODS.md](DATA_METHODS.md). Browser data are in `dist/data/`. `metadata.json` describes native cell coordinates and periods; `pixels.json` links habitat coordinates to those native SST cells. Binary `.f32` files are little-endian float32 arrays. Annual and seasonal histories are ordered **year × native source cell**. Forecast probabilities and scores have one value per native cell; backtests are **test year × native cell**, and coefficients are **native cell × seven coefficients**. Missing intensity/duration values are NaNs.

`validation.json` records the 108 Red Sea annual-summary checks. `gulf_validation.json` records Gulf source-summary comparisons, duplicate-row checks, marine attachment, native seasonal/annual consistency and source completeness. `scripts/test_multibasin.py` also compares matching Gulf source values and checks that Red Sea annual histories, pixel coefficients, backtests and probabilities remain unchanged. `manifest.json` includes asset checksums and hashes of the corrected habitat attachment and climate inputs.

Each pixel forecast is fitted to its own source-cell seasonal MHW history, threshold and training-only choice of regularisation. Habitat-wide and regional forecasts instead use their corresponding mean exposure histories. Whole-habitat forecasts are fitted separately for each basin; choosing both study areas shows both sets. Repeated habitat attachments to one SST cell share that cell's forecast. Pixel skill is tested independently; finer spatial support does not guarantee higher skill.

The selected-cell multivariate model is calculated by `dist/stats.js`. It is a full-record statistical fit, separate from the manuscript's chronological seasonal warning analysis. Model output changes when the selected pixel, outcome, years, reference or lead changes. The paired detrending switch affects only the paired plot.

## Rebuild from the original study workspace

```powershell
python .\scripts\build_multibasin.py
python .\scripts\update_climate.py
python .\scripts\verify.py
node .\scripts\test_stats.cjs
python .\scripts\test_outlook.py
python .\scripts\test_pixel_outlook.py
python .\scripts\test_multibasin.py
```

The combined builder reads `_cache/redsea_atlas_base` (the preserved original display package) and `_cache/gulf_extracted` (the compact remote extraction), plus the Gulf annual source tables in `_cache/gulf_source`. These private rebuild inputs are excluded from Git. The public website and scheduled climate refresh work directly from the included static files. The original Red Sea package is also recoverable from Git commit `8381735`; `build_data.py` and `build_seasonal_pixels.py` remain the original Red Sea-only source builders.

`scripts/extract_gulf_remote.py --root STUDY_ROOT --output NEW_ATLAS_CACHE` runs on the Gulf study server and reads its native annual metrics, full native event catalogues and daily SST. It writes only a separate atlas transfer cache. The Gulf extraction retains 15,940 of 15,996 known-ecoregion locations within the 5 km MUR marine-attachment limit, reattaches 1,715 coastal locations and excludes four unknown-ecoregion records. Repeated identical annual rows are counted once. No seagrass records occur in the source Gulf of Oman inventory.

`scripts/build_coverage.py` renders both original local habitat inventories to transparent map tiles. It requires GeoPandas, Rasterio and Pillow. `scripts/build_seasonal_pixels.py` reconstructs native-cell seasonal histories from the saved events and checks annual totals and monthly habitat summaries. `scripts/update_climate.py` requires NumPy, pandas and SciPy and works from the included seasonal histories and training cases; scheduled refreshes never need the large original event or SST archives. `scripts/test_pixel_outlook.py` compares batched forecasts with independent scalar fits and sampled nested backtests.

## Sources and attribution

Ahmed Eladawy and Mohammed Shaltout. Contacts: ahmed.eladawy@jamstec.go.jp and mohamed.shaltot@alexu.edu.eg. SST: NASA/JPL GHRSST MUR v4.1 and NOAA OISST v2.1. Habitat inventories: UNEP-WCMC Ocean+ Habitats (coral 2021, seagrass 2021, mangroves 2010). Climate: NOAA CPC, PSL and NCEI ERSSTv5. Satellite imagery: Esri, Vantor, Earthstar Geographics and the GIS User Community. Coastline: Natural Earth public-domain land vectors. Leaflet 1.9.4, Plotly.js 2.35.2, jsPDF 4.2.1 and jsPDF-AutoTable 5.0.8 are vendored with their original license notices. Original data providers' use and attribution terms continue to apply. This repository contains sampled numerical habitat-cell values and rendered coverage maps, not the original habitat polygon datasets or cached satellite imagery.

Habitat photographs retain their original JPEGs: Menna.Hassan100 (Red Sea coral reef, CC BY-SA 4.0), Mark Goodchild / Ruth Hartnup (Marsa Abu Dabbab seagrass and dugong, CC BY 2.0), and Hatem Moushir (Nabq mangroves, CC BY-SA 3.0), via Wikimedia Commons. See [`dist/images/credits.json`](dist/images/credits.json) for original sources and licence links. Photos are unedited; CSS crops only their on-page display. Their licences apply independently of the portal code. They are habitat illustrations, not observations of the currently selected pixel.
