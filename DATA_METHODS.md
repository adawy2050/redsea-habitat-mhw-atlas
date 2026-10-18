# Data and statistical methods

## Spatial support

The 49,408 displayed points are unique retained GHRSST habitat-grid coordinates. There are 56,597 habitat records because a coordinate can intersect more than one habitat inventory. Coral, seagrass and mangrove flags can therefore overlap. Only the three manuscript ecoregions are included: Northern and Central Red Sea, Southern Red Sea, and Gulf of Aden.

Each point retains its corrected MUR and OISST source-cell index and attachment distance. MUR values come from 41,393 native SST cells, while OISST values come from 325 native SST cells. Several habitat points can sample the same SST cell. All inference and line graphs operate on the **selected source-cell history**, without treating repeated habitat attachments as independent observations.

Map filters select displayed cells. They do not generate basin means or change the selected pixel's statistical model. Selected cells are visibly marked, and source-cell coordinates and distance are reported. Years or metrics without events have missing duration/intensity, shown as grey cells and gaps, rather than zero intensity.

## MHW metrics and baselines

The atlas uses existing MHW detections and the corrected manuscript sampling table. It does not rerun SST detection. GHRSST MUR v4.1 covers 2003–2025 at 0.01°, with a 2003–2022 baseline. OISST v2.1 covers 1982–2025 at 0.25°, with a 1982–2011 baseline. Thresholds are seasonally varying 90th percentiles; minimum event duration is five days on a no-leap calendar.

The six metrics are annual MHW days, frequency, mean duration, mean intensity, maximum intensity and cumulative intensity. Temperature intensity is above the seasonal threshold. MUR annual metrics are reconstructed from the saved event catalogue using `annual_from_events` and `complete_grid` in the corrected manuscript script. Cross-year cumulative intensity is apportioned by event days. Frequency follows the existing detection pipeline's year/no-leap gap handling. Maximum intensity for a cross-year event follows that same reconstruction. All reconstruction conventions match the corrected manuscript; no independent annual-tile reprocessing was performed for this website.

Every metric is validated against the saved corrected habitat × ecoregion summaries for all years in both products, using the original record weights. Maximum discrepancy before writing browser arrays must be below 0.00015 in the metric's units. Published native arrays use float32. The validation file records all 108 product × metric × habitat × region checks.

## Annual SST

Daily OISST SST is averaged by calendar year at the 325 attached habitat source cells. Leap-day SST enters the annual SST average; the MHW annual counts retain the source pipeline's no-leap convention. Annual mean SST is an OISST covariate in both product views. It is not a reconstructed high-resolution MUR SST field. The native OISST coordinate is available in the selected pixel data.

## Climate records and leads

The seven saved climate series are Niño-3.4, IOD/DMI, NAO, AO, EAWR, North Atlantic SST anomaly and PDO. The source is the manuscript's cached NOAA monthly archive, not a newly spliced series. The Atlantic SST series comes from the ERSSTv5 AMO archive and is labelled as SST anomaly, without isolating an internal AMO mechanism.

Calendar-year means are computed from the cached monthly series. The archive contains all twelve months from 1982 through 2025 for all seven indices. Earlier missing Niño-3.4 values remain missing. At index lead `k`, the heatwave metric in year `y` is paired with annual climate indices in `y-k`. The reference term uses outcome-year SST or outcome-year time. Complete-case filtering occurs after choosing years and leads; no predictor values are imputed.

Climate charts standardise each selected series over the displayed period when requested. Original-scale CSV downloads preserve the underlying archive values. Raw multi-index overlays combine different units, which is stated beside the chart.

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

For each habitat × ecoregion × SST product, the outcome is the mean MHW days across its corrected habitat records over the three-month target season. A high-exposure season exceeds the past same-season 80th percentile, with a minimum threshold of ten days. The live model fits an intercept and six climate predictors by ridge logistic regression. Index linear trends are estimated and removed in the training window, and residual predictors are standardised using that window alone. There are no unavailable recent-MHW or previous-season-history inputs in this indices-only model.

Regularisation is selected from 0.1, 1, 10 and 100 by expanding earlier-season validation. The matching outer backtest starts after twelve training seasons, refits at each origin, and recomputes thresholds, detrending, standardisation and inner regularisation using only earlier seasons. The reference probability is the smoothed fraction of high-exposure training seasons. Brier skill is `1 - mean((observed - model_probability)^2) / mean((observed - baseline_probability)^2)` on the same years. The interface reports post-baseline-availability validation (MUR from February 2023; OISST from February 2012) and exposes the longer retrospective result in details. The short MUR post-baseline record does not establish reliable alerts. No six-index probability is labelled an operational warning; numerical probabilities, dates and backtest performance are shown directly.

The Monday 00:20 UTC GitHub Actions refresh downloads current archives, validates parsing and predictor availability, refits these estimates and deploys the updated JSON. A failed download/fit does not push a partial result. Original arrays, study-period indices and manuscript files are not modified. Monthly NOAA archives are current versions, rather than an archive of the exact source vintages originally published at every historical issue date.

## Satellite imagery and habitat coverage

Esri World Imagery is loaded only for the visitor's current map viewport. Required imagery credits appear on the map and exported map image. It is a reference mosaic with varying acquisition dates, not an annual satellite image for the chosen heatwave year. The Natural Earth coastline option remains available independently.

Transparent raster coverage maps show the study's UNEP-WCMC coral (2021), seagrass (2021) and mangrove (2010) inventories. They are rendered from the local study GeoPackage into Web Mercator map tiles at zooms 4–12, with no GIS geometries or source attributes exported. Original polygon inventories should be obtained from the providers. These coverage maps are context layers; analysis still uses only the 49,408 retained habitat grid cells and their corrected SST attachments. See the [UNEP-WCMC general data licence](https://www.unep-wcmc.org/en/general-data-license).

## Packaging

Scientific display data, coastline geometry, fonts (system fonts), Leaflet and Plotly libraries are local static assets. Satellite imagery is a viewport-only external map service. There is no analytics tracking, database, credential or browser-side climate API request. The build/update scripts record checksums. The repository excludes the all-ocean daily SST archives, complete all-pixel event catalogue, original habitat polygons and cached satellite images.
