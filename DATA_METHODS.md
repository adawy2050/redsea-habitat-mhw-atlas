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

## Packaging

All display data, coastline geometry, fonts (system fonts), Leaflet and Plotly libraries are local static assets. There is no runtime analytics tracking, remote tile dependency, database, credential or external climate query. The build script records input and output checksums. The repository's source data package contains only retained habitat/source cells; it excludes the all-ocean daily SST archives and complete all-pixel event catalogue.
