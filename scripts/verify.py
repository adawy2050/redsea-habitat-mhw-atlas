"""Validate the public static package without the private source archives."""
from pathlib import Path
import hashlib
import json
import numpy as np

root = Path(__file__).resolve().parents[1] / 'dist'
data = root / 'data'
meta = json.loads((data / 'metadata.json').read_text())
pixels = json.loads((data / 'pixels.json').read_text())['rows']
validation = json.loads((data / 'validation.json').read_text())
manifest = json.loads((data / 'manifest.json').read_text())
outlook = json.loads((data / 'outlook.json').read_text())
assert len(pixels) == meta['pixels'] == sum(b['pixels'] for b in meta['basins'])
assert len({(p[0],p[1]) for p in pixels}) == len(pixels)
assert all(0 < p[2] <= 7 and p[3] in range(len(meta['regions'])) for p in pixels)
assert all(sum(p[3] in b['regions'] for b in meta['basins'])==1 for p in pixels)
assert all(0 <= p[6] <= 5 for p in pixels)
assert validation['allChecksPassed'] and len(validation['checks']) == 108
assert validation['maxSummaryDifference'] < .00015
gulf=json.loads((data/'gulf_validation.json').read_text())
assert gulf['allChecksPassed']
assert all(c['annualMonthlyDaysMaxDifference']<1e-4 for c in gulf['nativeSeasonalChecks'])
for key, product in meta['products'].items():
    n = len(product['cells'])
    assert all(0 <= p[4 if key == 'mur' else 5] < n for p in pixels)
    for metric in meta['metrics']:
        a = np.fromfile(data / f'{key}_{metric}.f32', dtype='<f4')
        assert len(a) == len(product['years']) * n
        assert not np.isinf(a).any()
        if metric in ('mhw_days','mhw_frequency','mhw_cumulative_intensity'):
            assert np.isfinite(a).all() and (a >= 0).all()
    for season in ('MAM','JJA','SON','DJF'):
        a = np.fromfile(data / f'{key}_season_{season}.f32', dtype='<f4').reshape(len(product['years']), n)
        complete = a[:-1] if season == 'DJF' else a
        assert np.isfinite(complete).all() and (complete >= 0).all() and (complete <= 92).all()
        if season == 'DJF':
            assert np.isnan(a[-1]).all()
    forecast = outlook.get('pixelOutlooks', {}).get(key)
    if forecast:
        assert forecast['nativeCells'] == n
        assert forecast['nTest'] == sum(forecast['postBaselineMask'])
        assert forecast['nTestRetrospective'] == len(forecast['testYears'])
        for name in ('probability','baseline','threshold','alpha','skill','skill_all','brier','baseline_brier','n_high'):
            a = np.fromfile(data / f'{key}_outlook_{name}.f32', dtype='<f4')
            assert a.shape == (n,) and np.isfinite(a).all(), (key,name)
            if name in ('probability','baseline'):
                assert ((a >= 0) & (a <= 1)).all()
        assert np.fromfile(data / f'{key}_outlook_coefficients.f32', dtype='<f4').size == n * 7
        for name in ('predictions','observed','baselines'):
            a = np.fromfile(data / f'{key}_outlook_backtest_{name}.f32', dtype='<f4')
            assert a.size == len(forecast['testYears']) * n
            assert np.isfinite(a).all() and ((a >= 0) & (a <= 1)).all()
for name, record in manifest['files'].items():
    p = root / name
    assert p.stat().st_size == record['bytes']
    assert hashlib.sha256(p.read_bytes()).hexdigest() == record['sha256']
assert (root / 'vendor/leaflet.js').stat().st_size > 100000
assert (root / 'vendor/plotly.min.js').stat().st_size > 1000000
assert (root / 'vendor/jspdf.umd.min.js').stat().st_size > 300000
assert (root / 'vendor/jspdf-autotable.min.js').stat().st_size > 20000
photos=json.loads((root/'images/credits.json').read_text())
assert len(photos)==3 and len({p['file'] for p in photos})==3
for photo in photos:
    image=root/'images'/photo['file']
    assert image.stat().st_size>200000 and image.read_bytes().startswith(b'\xff\xd8')
    assert min(photo['width'],photo['height'])>=1500
    assert photo['source'].startswith('https://commons.wikimedia.org/wiki/')
    assert photo['licenseUrl'].startswith('https://creativecommons.org/licenses/')
coverage=json.loads((root/'coverage/index.json').read_text())
coverage_count=0
for habitat,keys in coverage['tiles'].items():
    assert habitat in meta['habitats'] and len(keys)==len(set(keys))
    for key in keys:
        path=root/'coverage'/habitat/(key+'.png')
        with path.open('rb') as file:
            assert file.read(8)==b'\x89PNG\r\n\x1a\n'
        coverage_count+=1
assert coverage_count>=5864
print(f"PASS: {len(pixels):,} unique habitat cells; 108 summary checks; native-array dimensions, missing values, indices and asset checksums.")
print(f'PASS: {coverage_count:,} rendered habitat coverage tiles match the map index.')
print('PASS: native seasonal histories, current pixel probabilities, coefficients and chronological backtest arrays.')
print('PASS: three original-resolution habitat photographs with source and open-licence metadata.')
