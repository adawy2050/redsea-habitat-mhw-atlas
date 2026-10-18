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
assert len(pixels) == meta['pixels'] == 49408
assert len({(p[0],p[1]) for p in pixels}) == len(pixels)
assert all(0 < p[2] <= 7 and p[3] in (0,1,2) for p in pixels)
assert all(0 <= p[6] <= 5 for p in pixels)
assert validation['allChecksPassed'] and len(validation['checks']) == 108
assert validation['maxSummaryDifference'] < .00015
for key, product in meta['products'].items():
    n = len(product['cells'])
    assert all(0 <= p[4 if key == 'mur' else 5] < n for p in pixels)
    for metric in meta['metrics']:
        a = np.fromfile(data / f'{key}_{metric}.f32', dtype='<f4')
        assert len(a) == len(product['years']) * n
        assert not np.isinf(a).any()
        if metric in ('mhw_days','mhw_frequency','mhw_cumulative_intensity'):
            assert np.isfinite(a).all() and (a >= 0).all()
for name, record in manifest['files'].items():
    p = root / name
    assert p.stat().st_size == record['bytes']
    assert hashlib.sha256(p.read_bytes()).hexdigest() == record['sha256']
assert (root / 'vendor/leaflet.js').stat().st_size > 100000
assert (root / 'vendor/plotly.min.js').stat().st_size > 1000000
print(f"PASS: {len(pixels):,} unique habitat cells; 108 summary checks; native-array dimensions, missing values, indices and asset checksums.")
