# Data and statistical methods

## Spatial support

The atlas contains 65,348 unique retained habitat-grid locations and 74,402 habitat records. The Red Sea/Gulf of Aden contribution is 49,408 cells and 56,597 records; the Arabian Gulf/Gulf of Oman contribution is 15,940 cells and 17,805 records. Habitat flags overlap where inventories intersect. The five MEOW labels are Northern and Central Red Sea, Southern Red Sea, Gulf of Aden, Arabian (Persian) Gulf, and Gulf of Oman. The basin selector keeps the two studies distinct.

The combined native support is 55,688 MUR SST cells (41,393 Red Sea plus 14,295 Gulf) and 483 OISST cells (325 plus 158). Several habitat points may sample one native SST cell. Statistical models use the selected source-cell history without treating repeated attachments as independent years. Source coordinates and distances are shown in the interface and reports.

The Red Sea attachments retain the corrected manuscript table. Gulf sites are attached to the nearest finite marine SST cell, with a 5 km limit for MUR. Of 15,996 unique Gulf locations in the retained MEOW regions, 15,940 pass this limit; 56 are excluded and 1,715 attach to a nearby marine MUR cell. Four records with unknown ecoregion are excluded before attachment. Original Gulf annual tables contain repeated identical habitat–year rows; all six metric values agree within duplicates, and each habitat cell is counted once in atlas summaries. These attachment and weighting choices are recorded separately from the original Gulf summary tables. The Gulf of Oman source inventory has coral and mangrove records but no seagrass records.

Map filters select displayed cells and their corresponding basin/ecoregion forecasts. Pinned cells can be compared across study areas. Missing no-event intensity and duration remain gaps rather than zero intensity.

## MHW metrics and baselines

The atlas uses existing MHW detections and the corrected manuscript sampling table. It does not rerun SST detection. GHRSST MUR v4.1 covers 2003–2025 at 0.01°, with a 2003–2022 baseline. OISST v2.1 covers 1982–2025 at 0.25°, with a 1982–2011 baseline. Thresholds are seasonally varying 90th percentiles; minimum event duration is five days on a no-leap calendar.

The six metrics are annual MHW days, frequency, mean duration, mean intensity, maximum intensity and cumulative intensity. Temperature intensity is above the seasonal threshold. Red Sea MUR annual metrics are reconstructed from the saved event catalogue using `annual_from_events` and `complete_grid` in the corrected manuscript script. Cross-year cumulative intensity is apportioned by event days. Frequency follows the existing detection pipeline's year/no-leap gap handling. Maximum intensity for a cross-year event follows that same reconstruction. All reconstruction conventions match the corrected manuscript; no independent annual-tile reprocessing was performed for this website.

Every Red Sea metric is validated against the saved corrected habitat × ecoregion summaries for all years in both products, using the corrected record weights. Maximum discrepancy before writing browser arrays must be below 0.00015 in the metric's units. Published native arrays use float32. The validation file records all 108 Red Sea product × metric × habitat × region checks. Gulf metrics are extracted independently from its saved native annual tiles and OISST annual dataset. Its full native event catalogues reproduce annual MHW days exactly when aggregated by month. The full MUR catalogue is used because the broad-domain filtered catalogue removes some valid coastal source cells. Original Gulf source means are checked against their saved summary tables; direct matching native values are checked against the annual habitat records. The Gulf source registry covers all 8,401 daily MUR dates and 44 OISST years. All MUR daily file headers were read successfully during this extraction.

## Annual SST

Daily OISST SST is averaged by calendar year at the 483 attached habitat source cells across both studies. Leap-day SST enters the annual SST average; the MHW annual counts retain the source pipeline's no-leap convention. Annual mean SST is an OISST covariate in both product views. It is not a reconstructed high-resolution MUR SST field. The native OISST coordinate is available in the selected pixel data.

## Climate records and leads

The seven saved climate series are Niño-3.4, IOD/DMI, NAO, AO, EAWR, North Atlantic SST anomaly and PDO. The source is the manuscript's cached NOAA monthly archive, not a newly spliced series. The Atlantic SST series comes from the ERSSTv5 AMO archive and is labelled as SST anomaly, without isolating an internal AMO mechanism.

Calendar-year means are computed from the cached monthly series. The archive contains all twelve months from 1982 through 2025 for all seven indices. Earlier missing Niño-3.4 values remain missing. At index lead `k`, the heatwave metric in year `y` is paired with annual climate indices in `y-k`. The reference term uses outcome-year SST or outcome-year time. Complete-case filtering occurs after choosing years and leads; no predictor values are imputed.

Climate charts standardise each selected series over the displayed period when requested. Original-scale CSV downloads preserve the underlying archive values. Raw multi-index overlays combine different units, which is stated beside the chart.

The climate plot has its own start and end years, independent of the MHW analysis period, and can include the latest available months of the current year. The current-year shortcut uses monthly resolution. Annual live-feed means include available months only; incomplete-year means are labelled as year-to-date, and CSV exports provide a month-count column for every selected index. Latest-month cards show each index's own value and date. Missing and delayed observations remain blank.

## Dotted computed curves

Observed time series use solid lines. Full annual climate-model fits, reference-only fits and optional linear trends use dotted lines. The history trend uses the selected cell and displayed years. Climate trends use each displayed index over its available months/years. These fits stay within observed dates. History CSV downloads identify `observed` and `fitted_linear_trend` rows. Climate downloads retain original values and add raw-unit fitted-trend columns when enabled. The point PDF includes the full-record annual linear trend.

## Pixel model and variation shares

The full annual model has an intercept, a reference term (year or annual mean OISST SST) and the seven annual climate indices. It uses ordinary least squares on complete observations in the selected period, with numerical centring/scaling. At least 12 complete years are required by the interface for this eight-predictor fit. Modified Gram–Schmidt QR with reorthogonalisation gives the projection and coefficients, dropping numerically dependent columns.

Shapley R² is computed exactly by fitting every predictor subset (256 fits for eight predictors). For predictor `j`, the average incremental R² across all orders of inclusion is:

`sum_S [|S|! (p-|S|-1)! / p!] * [R²(S union j) - R²(S)]`

Each displayed percentage is a share of **total observed response variance**, not a percentage of the already-fitted variance. Their sum equals full-model R²; the remaining portion is residual variation. This allocation shares credit among correlated predictors and does not estimate causal contributions or anthropogenic warming attribution. Coefficients in the CSV are outcome units per predictor standard deviation, with their signs retained.

Fitted R² describes the full selected record. Leave-one-year-out R² uses PRESS residuals `e_i / (1-h_ii)`, with SST `sum((y_i-mean(y))²)` as denominator. It may be negative. It uses the fixed chosen predictor set and is not a forward chronological forecast, a significance test, or the manuscript's seasonal warning evaluation.

For the paired plot, both annual series use the same complete years. Optional detrending independently removes a linear time trend from each series before Pearson correlation and standardisation. This option does not alter the multivariate model. No map-level significance tests or habitat-specific causal attribution are claimed by this interface.

## Live seasonal estimates and climate updates

The study archive through 2025 is frozen. NOAA monthly observations from 2026 onward are appended to a separate feed. Each index retains its own latest available month. Missing months remain missing; daily AO is aggregated only for complete calendar months. Future calendar months and the incomplete current month are excluded. The IOD/HadISST archive currently lags the other six feeds. Its delayed values are not filled or spliced from another SST product.

The live seasonal panel is therefore fixed in advance to the six other indices: Niño-3.4, NAO, AO, EAWR, North Atlantic SST anomaly and PDO. It is not chosen by the best forecast result. The seven-index annual pixel model remains unchanged. The six-index seasonal model receives its own matched chronological backtest, rather than reusing seven-index validation scores.

At the current issue month, the next DJF, MAM, JJA or SON season whose start is 1–3 months ahead is selected. Index predictors are three-month means ending two calendar months before the issue month, matching the manuscript publication-lag convention. Output shows the actual computation date and the reference issue month separately. The MHW history remains through December 2025; no 2026 heatwave histories are inferred or invented.

Forecasts have three spatial supports: each habitat separately across each basin, each habitat within each ecoregion, and each individual native SST cell. Group outcomes are mean seasonal MHW days across the corresponding corrected habitat records, retaining their original record weights. Whole-habitat models use the pooled exposure history within their own basin, rather than averaging regional probabilities or pooling the two basins. The Gulf models are fitted from Gulf outcomes using the same global climate predictor panel and chronological model rules; they do not reuse Red Sea coefficients or forecast scores. Pixel outcomes use only that source cell's own seasonal MHW-day history. Habitat groups refer to coral reefs, seagrass and mangroves, rather than biological species.

A high-exposure season exceeds the past same-season 80th percentile, with a minimum threshold of ten days. The live model fits an intercept and six climate predictors by ridge logistic regression. Index linear trends are estimated and removed in the training window, and residual predictors are standardised using that window alone. There are no unavailable recent-MHW or previous-season-history inputs in this indices-only model. Each pixel has its own exposure threshold, coefficients and regularisation choice; a regional probability is never assigned as its pixel forecast.

Regularisation is selected from 0.1, 1, 10 and 100 by expanding earlier-season validation. The matching outer backtest starts after twelve training seasons, refits at each origin, and recomputes thresholds, detrending, standardisation and inner regularisation using only earlier seasons. The reference probability is the smoothed fraction of high-exposure training seasons. Brier skill is `1 - mean((observed - model_probability)^2) / mean((observed - baseline_probability)^2)` on the same years. The interface reports post-baseline-availability validation (MUR from February 2023; OISST from February 2012) and exposes the longer retrospective result in details. The short MUR post-baseline record does not establish reliable alerts. No six-index probability is labelled an operational warning; numerical probabilities, dates and backtest performance are shown directly.

Seasonal pixel histories are reconstructed from event-day counts at the native SST cells. Their annual totals reproduce the published MHW-day arrays, and monthly habitat means match the saved manuscript summaries. DJF is labelled by its December start year; the incomplete December 2025–February 2026 season is excluded. Seasonal training dates match the original Red Sea case calendar; Gulf outcomes replace the corresponding exposure values while global predictor dates and values stay matched. Identical binary training histories share a numerical solve within an origin and penalty for efficiency; their individual thresholds, held-out outcomes and tuning losses remain separate. Independent scalar fits check sampled pixel probabilities, coefficients, selected penalties and nested backtests. Pixel Brier skill is shown directly and can be negative; spatial refinement does not guarantee better predictions.

The Monday 00:20 UTC GitHub Actions refresh downloads current archives, validates parsing and predictor availability, refits all three spatial supports and deploys the updated JSON and native-cell forecast arrays. A failed download/fit does not push a partial result. Original histories, study-period indices and manuscript files are not modified. Monthly NOAA archives are current versions, rather than an archive of the exact source vintages originally published at every historical issue date.

## Point reports and forecast files

The map-variable dropdown includes upcoming-season prediction probability. The separate scale control switches among habitat-wide, habitat–ecoregion and selected-pixel results. Every selected point can generate a PDF locally in the browser, including coordinates, source-cell distance, all six annual histories, seasonal probability and baseline, chronological validation, habitat context, annual association results and contacts. Reports describe surface exposure; no species-specific injury or mortality is estimated.

`{product}_season_{season}.f32` holds year-major native-cell seasonal MHW days. `seasonal_groups.json` holds the corresponding twenty group histories per product (six basin-wide habitat groups and fourteen habitat–ecoregion groups). `outlook.json` records target dates, training and test years, group forecasts and pixel-array metadata. Pixel probability, baseline, threshold, selected penalty and scores are native-cell vectors. Coefficients are native-cell × seven (intercept then six indices). Backtest predictions, binary outcomes and baseline probabilities are test-year × native-cell arrays. All binary arrays are little-endian float32; ordering follows `metadata.json` and `outlook.json`. `seasonal_pixel_validation.json` records reconstruction checks.

## Satellite imagery and habitat coverage

Esri World Imagery is loaded only for the visitor's current map viewport. Required imagery credits appear on the map and exported map image. It is a reference mosaic with varying acquisition dates, not an annual satellite image for the chosen heatwave year. The Natural Earth coastline option remains available independently.

Transparent raster coverage maps show the study's UNEP-WCMC coral (2021), seagrass (2021) and mangrove (2010) inventories. They are rendered from the local study GeoPackage into Web Mercator map tiles at zooms 4–12, with no GIS geometries or source attributes exported. Original polygon inventories should be obtained from the providers. The combined coverage index has 6,697 rendered tiles from the two local study inventories. These maps are context layers; analysis uses only the 65,348 retained habitat grid cells and their SST attachments. See the [UNEP-WCMC general data licence](https://www.unep-wcmc.org/en/general-data-license).

The separate habitat gallery contains openly licensed Red Sea photographs from Wikimedia Commons, with original JPEGs, locations, authors and licence links retained in `images/credits.json` and visible captions. The pictures show a Red Sea reef in Egypt, a seagrass meadow at Marsa Abu Dabbab, and mangroves at Nabq. CSS crops the displayed cards; original-resolution links return the unmodified photographs. These are habitat examples and do not establish habitat condition or coverage at a selected analysis cell.

## Interface languages

The top switch changes between English and Arabic, preserving the selected pixel, model, probabilities and controls. Arabic uses right-to-left page layout and translated interface, chart labels and methods; geographic maps, numerical chart axes and source identifiers retain their original coordinate direction. The choice is stored locally and in the share URL's `lang` parameter. Scientific arrays, source data, CSV schemas and model coefficients are unchanged. Point PDF reports remain in English and the Arabic download button says so.

## Packaging

Scientific display data, coastline geometry, fonts (system fonts), Leaflet, Plotly, jsPDF and AutoTable libraries are local static assets. Satellite imagery is a viewport-only external map service. There is no analytics tracking, database, credential or browser-side climate API request. The build/update scripts record checksums. The repository excludes the all-ocean daily SST archives, complete all-pixel event catalogue, original habitat polygons and cached satellite images.
