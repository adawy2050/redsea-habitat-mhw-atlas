/* Local responsive imagery; full originals are fetched only on demand. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id), ar=()=>AtlasLanguage.current==='ar';
  let photos=[],page=0,active=0,timer,opener,autoPhotoArea=true,lastPoint={basin:'redsea',habitats:1};
  const field=(p,name)=>ar()?p[name+'Ar']||p[name]:p[name];
  function picture(p,eager=false){const el=document.createElement('picture');for(const ext of ['avif','webp']){const source=document.createElement('source');source.type=`image/${ext}`;source.srcset=[480,960,1600,2400].map(w=>`./images/responsive/${p.id}-${w}.${ext} ${w}w`).join(', ');source.sizes='(max-width:650px) 90vw, 32vw';el.append(source);}const img=document.createElement('img');img.src=`./images/responsive/${p.id}-960.jpg`;img.srcset=[480,960,1600,2400].map(w=>`./images/responsive/${p.id}-${w}.jpg ${w}w`).join(', ');img.sizes='(max-width:650px) 90vw, 32vw';img.width=p.width;img.height=p.height;img.alt=field(p,'title')+' · '+field(p,'location');img.loading=eager?'eager':'lazy';img.decoding='async';img.style.backgroundImage=`url("${p.placeholder}")`;img.style.backgroundSize='cover';el.append(img);return el;}
  function credit(p){const div=document.createElement('div');div.className='photo-credit';const a=document.createElement('a');a.href=p.source;a.target='_blank';a.rel='noopener';a.textContent=p.author;const l=document.createElement('a');l.href=p.licenseUrl;l.target='_blank';l.rel='noopener';l.textContent=p.license;const size=document.createElement('span');size.dir='ltr';size.textContent=`${p.width.toLocaleString('en')} × ${p.height.toLocaleString('en')} px`;div.append(a,document.createTextNode(' · '),l,size);return div;}
  function selected(){return photos.filter(p=>$('photoBasin').value==='all'||p.basin===$('photoBasin').value);}
  function render(){const list=selected(),pages=Math.ceil(list.length/3);page=(page+pages)%pages;$('photoGallery').replaceChildren(...list.slice(page*3,page*3+3).map(p=>{const figure=document.createElement('figure'),link=document.createElement('a');link.href='./images/'+p.file;link.dataset.photo=p.id;link.append(picture(p));link.onclick=e=>{e.preventDefault();open(photos.indexOf(p),link);};const caption=document.createElement('figcaption'),h=document.createElement('h3'),location=document.createElement('p');h.textContent=field(p,'title');location.textContent=field(p,'location');caption.append(h,location,credit(p));figure.append(link,caption);return figure;}));$('photoPage').textContent=`${page+1} / ${pages}`;$('photoPrev').disabled=$('photoNext').disabled=pages<2;}
  function nearest(latitude,longitude,limit=1){return photos.filter(p=>p.basin!=='representative'&&Number.isFinite(p.latitude)&&Number.isFinite(p.longitude)).map(p=>{const rad=Math.PI/180,a=(p.latitude-latitude)*rad,b=(p.longitude-longitude)*rad,h=Math.sin(a/2)**2+Math.cos(latitude*rad)*Math.cos(p.latitude*rad)*Math.sin(b/2)**2;return {photo:p,distance:6371*2*Math.asin(Math.min(1,Math.sqrt(h)))}}).sort((a,b)=>a.distance-b.distance).slice(0,limit);}
  function updatePixel(detail=lastPoint){lastPoint=detail;if(autoPhotoArea&&[...$('photoBasin').options].some(o=>o.value===detail.basin)&&$('photoBasin').value!==detail.basin){$('photoBasin').value=detail.basin;page=0;render();}const found=nearest(detail.latitude,detail.longitude,3),pick=found[0];if(!pick)return;const p=pick.photo,button=document.createElement('button');button.type='button';button.className='pixel-photo-button';button.append(picture(p));button.onclick=()=>open(photos.indexOf(p),button);const cap=document.createElement('figcaption');cap.textContent=AtlasLanguage.translate('Closest photo in the collection');const place=document.createElement('span');place.className='pixel-photo-location';place.textContent=field(p,'location')+' · '+Math.round(pick.distance)+' km';const note=document.createElement('p');note.className='nearest-photo-note';note.textContent=AtlasLanguage.translate(p.locationPrecision==='GPS'?'Distance to the photo coordinate. The image is separate from this heatwave cell.':'Distance to the named photo area; its position is approximate.');const cite=credit(p);cite.classList.add('pixel-photo-credit');cite.querySelector('span')?.remove();$('pixelPhoto').replaceChildren(button,cap,place,cite,note);const nearby=document.createElement('div');nearby.className='nearby-photos';for(const item of found.slice(1)){const b=document.createElement('button');b.type='button';b.title=field(item.photo,'location')+' · '+Math.round(item.distance)+' km';b.append(picture(item.photo));b.onclick=()=>open(photos.indexOf(item.photo),b);nearby.append(b);}$('pixelPhoto').append(nearby);}
  const dialog=document.createElement('dialog');dialog.id='photoDialog';dialog.className='photo-dialog';dialog.setAttribute('aria-labelledby','photoTitle');dialog.innerHTML='<div class="photo-viewer-head"><h2 id="photoTitle"></h2><button id="photoClose" aria-label="Close photograph"></button></div><div class="photo-viewer-tools"><button id="photoBack" aria-label="Previous photograph"></button><button id="photoZoom">Actual pixels</button><button id="photoForward" aria-label="Next photograph"></button><a id="photoDownload" download>Download original</a></div><div id="photoViewport" class="photo-viewport"><img id="photoOriginal" alt="" draggable="false"></div><div id="photoCaption" class="photo-viewer-caption"></div>';document.body.append(dialog);
  function open(index,from){active=(index+photos.length)%photos.length;if(from)opener=from;const p=photos[active];$('photoTitle').textContent=field(p,'title')+' · '+field(p,'location');$('photoOriginal').alt=field(p,'title');$('photoOriginal').src='./images/'+p.file;$('photoDownload').href='./images/'+p.file;$('photoViewport').classList.remove('actual');$('photoZoom').textContent='Actual pixels';$('photoCaption').replaceChildren(credit(p));const note=document.createElement('span');note.textContent='Original retained unchanged; previews resized only.';$('photoCaption').append(note);if(!dialog.open)dialog.showModal();}
  $('photoClose').onclick=()=>dialog.close();dialog.addEventListener('close',()=>opener?.focus());dialog.onclick=e=>{if(e.target===dialog)dialog.close();};$('photoBack').onclick=()=>open(active-1);$('photoForward').onclick=()=>open(active+1);$('photoZoom').onclick=()=>{$('photoViewport').classList.toggle('actual');$('photoZoom').textContent=$('photoViewport').classList.contains('actual')?'Fit to screen':'Actual pixels';};dialog.onkeydown=e=>{if(e.key==='ArrowRight')open(active+1);if(e.key==='ArrowLeft')open(active-1);};
  let drag;const viewport=$('photoViewport');viewport.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,left:viewport.scrollLeft,top:viewport.scrollTop};if(viewport.classList.contains('actual'))viewport.setPointerCapture(e.pointerId);});viewport.addEventListener('pointermove',e=>{if(drag&&viewport.classList.contains('actual')){viewport.scrollLeft=drag.left+drag.x-e.clientX;viewport.scrollTop=drag.top+drag.y-e.clientY;}});viewport.addEventListener('pointerup',e=>{if(drag&&!viewport.classList.contains('actual')&&Math.abs(e.clientX-drag.x)>60)open(active+(e.clientX<drag.x?1:-1));drag=null;});viewport.addEventListener('pointercancel',()=>drag=null);
  function pause(){clearInterval(timer);timer=null;$('photoPlay').textContent='Play slideshow';}
  $('photoPrev').onclick=()=>{page--;render();};$('photoNext').onclick=()=>{page++;render();};$('photoBasin').onchange=()=>{autoPhotoArea=false;page=0;render();};$('photoPlay').onclick=()=>{if(timer){pause();return;}timer=setInterval(()=>{if(!document.hidden&&!dialog.open){page++;render();}},6500);$('photoPlay').textContent='Pause slideshow';};document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});window.addEventListener('atlasmotionchange',()=>{if(document.documentElement.dataset.motion==='off')pause();});
  window.addEventListener('atlaspixelchange',e=>updatePixel(e.detail));window.addEventListener('atlaslanguagechange',()=>{render();updatePixel();if(dialog.open)open(active);});
  fetch('./images/credits.json?v=20261019-scientific-r3').then(r=>{if(!r.ok)throw Error('Photo catalogue unavailable');return r.json();}).then(data=>{photos=data;render();const p=window.AtlasDebug?.pixels?.[AtlasDebug.state.pixel];if(p)lastPoint={basin:AtlasDebug.meta.basins.find(b=>b.regions.includes(p[3])).id,habitats:p[2],latitude:p[1],longitude:p[0]};updatePixel();window.dispatchEvent(new Event('atlasphotosready'));});
  window.AtlasPhotos={open,picture,credit,nearest,get photos(){return photos;}};
})();

;
/* Small, dependency-free annual-series statistics. Missing values are never zero-filled. */
(function (root) {
  'use strict';
  const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
  const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
  const finite = x => x !== null && x !== undefined && Number.isFinite(x);
  function standardize(a) {
    const ok = a.filter(finite), m = mean(ok), sd = Math.sqrt(mean(ok.map(v => (v - m) ** 2)));
    return a.map(v => finite(v) ? (sd > 1e-12 ? (v - m) / sd : 0) : null);
  }
  function fit(y, columns = []) {
    const n = y.length, ym = mean(y), yc = y.map(v => v - ym);
    const sst = dot(yc, yc), Q = [], R = [], active = [], xm = [], xs = [];
    for (let j = 0; j < columns.length; j++) {
      const m = mean(columns[j]), sd = Math.sqrt(mean(columns[j].map(v => (v - m) ** 2)));
      xm.push(m); xs.push(sd);
      if (sd < 1e-12) continue;
      let v = columns[j].map(x => (x - m) / sd), rr = [];
      for (let k = 0; k < Q.length; k++) {
        const r = dot(Q[k], v); rr.push(r); v = v.map((x, i) => x - r * Q[k][i]);
      }
      // Reorthogonalization protects highly correlated index subsets.
      for (let k = 0; k < Q.length; k++) {
        const r = dot(Q[k], v); rr[k] += r; v = v.map((x, i) => x - r * Q[k][i]);
      }
      const norm = Math.sqrt(dot(v, v));
      if (norm < 1e-9) continue;
      rr.push(norm); R.push(rr); Q.push(v.map(x => x / norm)); active.push(j);
    }
    const projected = Q.map(q => dot(q, yc));
    const pred = y.map((_, i) => ym + Q.reduce((s, q, j) => s + q[i] * projected[j], 0));
    const residual = y.map((v, i) => v - pred[i]);
    const sse = dot(residual, residual), r2 = sst > 1e-12 ? Math.max(0, Math.min(1, 1 - sse / sst)) : 0;
    const betaActive = new Array(Q.length).fill(0);
    for (let j = Q.length - 1; j >= 0; j--) {
      let rhs = projected[j];
      for (let k = j + 1; k < Q.length; k++) rhs -= R[k][j] * betaActive[k];
      betaActive[j] = rhs / R[j][j];
    }
    const beta = new Array(columns.length).fill(0);
    active.forEach((j, k) => { beta[j] = betaActive[k]; });
    const leverage = y.map((_, i) => 1 / n + Q.reduce((s, q) => s + q[i] ** 2, 0));
    const press = residual.reduce((s, v, i) => s + (v / Math.max(1e-10, 1 - leverage[i])) ** 2, 0);
    return {n, pred, residual, r2, beta, means: xm, scales: xs, rank: Q.length + 1,
      adjustedR2: n > Q.length + 1 && sst > 1e-12 ? 1 - (1 - r2) * (n - 1) / (n - Q.length - 1) : null,
      cvR2: n > Q.length + 2 && sst > 1e-12 ? 1 - press / sst : null};
  }
  function detrend(a, years) {
    const keep = a.map((v, i) => finite(v) && finite(years[i]) ? i : -1).filter(i => i >= 0);
    if (keep.length < 3) return a.map(() => null);
    const f = fit(keep.map(i => a[i]), [keep.map(i => years[i])]);
    const out = a.map(() => null); keep.forEach((i, k) => { out[i] = f.residual[k]; }); return out;
  }
  function correlation(a, b) {
    const pairs = a.map((v, i) => [v, b[i]]).filter(p => p.every(finite));
    if (pairs.length < 3) return null;
    const aa = pairs.map(p => p[0]), bb = pairs.map(p => p[1]), am = mean(aa), bm = mean(bb);
    const ac = aa.map(v => v - am), bc = bb.map(v => v - bm), den = Math.sqrt(dot(ac, ac) * dot(bc, bc));
    return den > 1e-12 ? dot(ac, bc) / den : null;
  }
  function shapley(y, columns) {
    const p = columns.length, count = 1 << p, values = new Float64Array(count), sizes = new Uint8Array(count);
    for (let mask = 1; mask < count; mask++) {
      sizes[mask] = sizes[mask >> 1] + (mask & 1);
      values[mask] = fit(y, columns.filter((_, j) => mask & (1 << j))).r2;
    }
    const fact = [1]; for (let j = 1; j <= p; j++) fact.push(fact[j - 1] * j);
    const shares = columns.map((_, j) => {
      let value = 0;
      for (let mask = 0; mask < count; mask++) if (!(mask & (1 << j))) {
        const s = sizes[mask]; value += fact[s] * fact[p - s - 1] / fact[p] * (values[mask | (1 << j)] - values[mask]);
      }
      return Math.max(0, value);
    });
    return {...fit(y, columns), shares};
  }
  function trend(years, a) {
    const keep = a.map((v, i) => finite(v) ? i : -1).filter(i => i >= 0);
    if (keep.length < 3) return null;
    const f = fit(keep.map(i => a[i]), [keep.map(i => years[i])]);
    return f.scales[0] > 0 ? f.beta[0] / f.scales[0] * 10 : 0;
  }
  const api = {mean, finite, standardize, fit, detrend, correlation, shapley, trend};
  root.AtlasStats = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window === 'undefined' ? globalThis : window);

;
/* Red Sea Habitat Heatwave Atlas. All scientific arrays are fetched locally. */
(() => {
  'use strict';
  const RELEASE='20261019-scientific-r3';
  const $ = id => document.getElementById(id), S = window.AtlasStats;
  const labels = {Nino34: 'Niño-3.4', IOD: 'IOD', NAO: 'NAO', AO: 'AO', EAWR: 'EAWR', NAtl_SSTA: 'N. Atlantic SST', PDO: 'PDO',localSst:'Annual SST (OISST)'};
  const modeColors = {Nino34:'#c43d32', IOD:'#007d8a', NAO:'#7e52a0', AO:'#366aa2', EAWR:'#99700d', NAtl_SSTA:'#b52a74', PDO:'#39813c',localSst:'#7c660d'};
  const metricInfo = {
    mhw_days: {name:'Heatwave days', unit:'days', axis:'Heatwave days / year', max:200, digits:0},
    mhw_frequency: {name:'Event frequency', unit:'events', axis:'Events / year', max:12, digits:1},
    mhw_mean_duration: {name:'Mean event duration', unit:'days', axis:'Mean duration (days)', max:40, digits:1},
    mhw_mean_intensity: {name:'Mean intensity', unit:'°C', axis:'Mean intensity (°C relative to threshold)', max:1.5, digits:2},
    mhw_max_intensity: {name:'Maximum intensity', unit:'°C', axis:'Maximum intensity (°C relative to threshold)', max:3, digits:2},
    mhw_cumulative_intensity: {name:'Cumulative intensity', unit:'°C days', axis:'Cumulative intensity (°C days)', max:160, digits:1}
  };
  const state = {product:'mur', metric:'mhw_days',mapMode:'history', year:2025, basin:'all',region:'all', habitats:15, selection:null,historySecondary:'mhw_frequency', pixel:0, pins:[], arrays:new Map(),showTrend:true,climateTrend:false,
    from:2003, to:2025, lag:0, benchmark:'trend', index:'Nino34', detrend:true, selectedModes:new Set(['Nino34','IOD','NAtl_SSTA','AO']),
    step:'monthly', scale:'standard', climateSource:'latest',climateFrom:null,climateTo:null,outlookRecord:'GHRSST MUR',outlookScope:'ecoregion',pixelOpacity:.7,showPixels:true,timer:null,generation:0};
  let meta, pixels, climate, map, pixelLayer, selectedMarker, sourceMarker, sourceLine, climateZ, mapLand,landLayer,satelliteLayer,coverageMeta,liveClimate,outlook;
  const coverageLayers={};
  let modelData = null, currentHistory = [], climateExport = [];
  const pinColors = ['#3f7f82','#997ba0','#9b954d','#5f809d','#c68f57'];
  const config = {responsive:true, displaylogo:false, scrollZoom:false, modeBarButtonsToRemove:['lasso2d','select2d','autoScale2d'],
    toImageButtonOptions:{format:'svg', filename:'redsea_habitat_mhw', height:550, width:1100, scale:1}};
  const baseLayout = {paper_bgcolor:'rgba(0,0,0,0)', plot_bgcolor:'rgba(0,0,0,0)', font:{family:'system-ui, sans-serif',size:10,color:'#657775'},
    margin:{l:58,r:20,t:30,b:46}, hovermode:'x unified', hoverlabel:{font:{size:10},bgcolor:'#fff',bordercolor:'#ddd'},
    xaxis:{gridcolor:'#f0f1eb',linecolor:'#dfe3d9',zeroline:false,tickformat:'d',fixedrange:false},
    yaxis:{gridcolor:'#edf0e7',zeroline:false,title:{font:{size:10}},fixedrange:false},
    legend:{orientation:'h',x:0,y:1.15,font:{size:10}}, showlegend:true};
  function layout(extra={}) { return {...baseLayout,...extra,xaxis:{...baseLayout.xaxis,...extra.xaxis},yaxis:{...baseLayout.yaxis,...extra.yaxis}}; }
  function renderPlot(id,traces,chartLayout,options=config){
    const localize=(value,key)=>{if(typeof value==='string')return ['name','text','title'].includes(key)&&window.AtlasLanguage?.current!=='en'?window.AtlasLanguage.translate(value):value;if(Array.isArray(value))return value.map(v=>localize(v,key));if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,localize(v,k)]));return value;};
    return Plotly.react(id,localize(traces,''),localize(chartLayout,''),options);
  }
  function note(message) { $('toast').textContent=message; $('toast').hidden=false; clearTimeout(note.timer); note.timer=setTimeout(()=>{$('toast').hidden=true;},4000); }
  function loading(message) { $('loadingText').textContent=message; $('loading').hidden=false; }
  async function json(path) { const r=await fetch(`${path}?v=${RELEASE}`); if(!r.ok)throw Error(`${path}: HTTP ${r.status}`); return r.json(); }
  async function array(product, metric) {
    const key=`${product}_${metric}`;
    if(!state.arrays.has(key)) state.arrays.set(key, fetch(`./data/${key}.f32?v=${RELEASE}`).then(r=>{if(!r.ok)throw Error(`Unable to load ${key}`);return r.arrayBuffer();}).then(buffer=>{
      const a=new Float32Array(buffer), p=meta.products[product];
      if(a.length!==p.years.length*p.cells.length)throw Error(`Unexpected data dimensions: ${key}`);return a;
    }).catch(e=>{state.arrays.delete(key);throw e;}));
    return state.arrays.get(key);
  }
  async function forecastArray(product,name){const key=`${product}_outlook_${name}`;if(!state.arrays.has(key))state.arrays.set(key,fetch(`./data/${key}.f32?v=${RELEASE}`).then(r=>{if(!r.ok)throw Error(`Unable to load point forecast ${name}`);return r.arrayBuffer();}).then(b=>new Float32Array(b)));return state.arrays.get(key);}
  async function pointForecast(product,pixel){
    const info=outlook.pixelOutlooks[product];if(!info)return null;const index=sourceIndex(pixel,product),names=['probability','baseline','threshold','skill','skill_all','brier','baseline_brier','n_high','alpha'];
    const arrays=await Promise.all(names.map(name=>forecastArray(product,name))),values=Object.fromEntries(names.map((name,i)=>[name,arrays[i][index]]));
    return {...info,...values,index,product,pixel,available:true,scope:'pixel',habitat:'Selected habitat pixel',region:`${coordinate(pixel)} · ${meta.regions[pixels[pixel][3]]}`,
      historicalProbability:values.baseline,highExposureThresholdDays:values.threshold,trainingSeasons:info.trainingYears.length,
      trainingFirstYear:info.trainingYears[0],trainingLastYear:info.trainingYears.at(-1),backtest:{scores:{baseline_available:{nTest:info.nTest,nHigh:values.n_high,skill:values.skill,brierScore:values.brier,baselineBrierScore:values.baseline_brier},all_retrospective:{nTest:info.nTestRetrospective,skill:values.skill_all}}}};
  }
  function mapInfo(){return state.mapMode==='probability'?{name:'Prediction probability',unit:'%',axis:'High-exposure probability (%)',max:100,digits:1}:metricInfo[state.metric];}
  function percent(value){return value<.01?'<1%':`${Math.round(value*100)}%`;}
  function sourceIndex(pixel, product=state.product) {return pixels[pixel][product==='mur'?4:5];}
  function series(pixel, a, product=state.product) {
    const p=meta.products[product], n=p.cells.length, index=sourceIndex(pixel,product);
    return p.years.map((_,i)=>{const v=a[i*n+index];return Number.isFinite(v)?v:null;});
  }
  function number(v,digits=1) {return S.finite(v)?v.toLocaleString('en',{minimumFractionDigits:digits,maximumFractionDigits:digits}):'—';}
  function signed(v,digits=1) {return S.finite(v)?`${v>=0?'+':''}${number(v,digits)}`:'—';}
  function coordinate(i) {const p=pixels[i];return `${p[1].toFixed(2)}°N, ${p[0].toFixed(2)}°E`;}
  function pointBasin(point){return meta.basins.find(b=>b.regions.includes(point[3]));}
  function pixelId(i) {return `${pointBasin(pixels[i]).id==='redsea'?'':pointBasin(pixels[i]).id+'_'}ghrsst_${String(pixels[i][8]).padStart(5,'0')}_${String(pixels[i][9]).padStart(5,'0')}`;}
  function visible(p) {return (!state.selection||(p[0]>=state.selection[0]&&p[0]<=state.selection[2]&&p[1]>=state.selection[1]&&p[1]<=state.selection[3]))&&(p[2]&state.habitats)!==0&&(state.region==='all'||p[3]===Number(state.region))&&(state.basin==='all'||pointBasin(p).id===state.basin);}
  function regionControls(){const options=[new Option('All ecoregions','all')];meta.regions.forEach((name,index)=>{if(state.basin==='all'||meta.basins.find(b=>b.id===state.basin).regions.includes(index))options.push(new Option(name,index));});$('region').replaceChildren(...options);$('region').value=state.region;$('totalPixels').textContent=(state.basin==='all'?meta.pixels:meta.basins.find(b=>b.id===state.basin).pixels).toLocaleString('en-GB');}
  function fitStudy(){map.fitBounds(state.selection?[[state.selection[1],state.selection[0]],[state.selection[3],state.selection[2]]]:(state.basin==='all'?meta.bounds:meta.basins.find(b=>b.id===state.basin).bounds),{padding:[55,45]});}
  function color(v, max) {
    if(!S.finite(v))return '#6b8583';
    const stops=[[0,34,78],[0,46,106],[26,56,111],[50,67,109],[67,78,108],[83,90,109],[97,101,111],[111,112,115],[125,124,120],[140,136,120],[155,148,118],[171,160,114],[188,174,108],[205,187,99],[222,201,88],[240,216,70],[254,232,56]];
    const z=Math.max(0,Math.min(.99999,v/max))*(stops.length-1), i=Math.floor(z), t=z-i;
    return `rgb(${stops[i].map((c,k)=>Math.round(c+(stops[i+1][k]-c)*t)).join(',')})`;
  }
  function inYears(year) {return year>=state.from&&year<=state.to;}
  function monthLabel(value){return new Date(`${value.slice(0,7)}-01T00:00:00Z`).toLocaleDateString('en-GB',{month:'short',year:'numeric',timeZone:'UTC'});}
  function download(name, content, mime='text/csv;charset=utf-8') {
    const url=URL.createObjectURL(new Blob([content],{type:mime})), a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
  }
  function csv(rows) {if(!rows.length)return '';const keys=Object.keys(rows[0]),escape=v=>{const s=v===null||v===undefined?'':String(v);return /[",\n]/.test(s)?`"${s.replaceAll('"','""')}"`:s;};return [keys,...rows.map(r=>keys.map(k=>r[k]))].map(row=>row.map(escape).join(',')).join('\r\n');}
  function showMethods() {$('methodsDialog').showModal();}

  function makeMap(land) {
    mapLand=land;
    map=L.map('map',{zoomControl:false,attributionControl:true,minZoom:3,maxZoom:16,preferCanvas:true});fitStudy();
    map.attributionControl.setPrefix('');map.attributionControl.addAttribution('<a href="https://www.unep-wcmc.org/" target="_blank">UNEP-WCMC: coral 2021, seagrass 2021, mangroves 2010</a>');
    L.control.zoom({position:'topright'}).addTo(map);
    landLayer=L.geoJSON(land,{interactive:false,style:{color:'#8994a3',weight:.55,fillColor:'#d4dae1',fillOpacity:1}});
    satelliteLayer=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,detectRetina:true,crossOrigin:true,attribution:'Imagery © Esri, Vantor, Earthstar Geographics, GIS User Community'}).addTo(map);
    map.createPane('habitatCoverage');map.getPane('habitatCoverage').style.zIndex=390;map.getPane('habitatCoverage').style.pointerEvents='none';
    const empty='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
    for(const habitat of meta.habitats){const keys=new Set(coverageMeta.tiles[habitat]||[]);const Coverage=L.TileLayer.extend({getTileUrl(coords){const key=`${coords.z}/${coords.x}/${coords.y}`;return keys.has(key)?new URL(`./coverage/${habitat}/${key}.png?v=${RELEASE}`,document.baseURI).href:empty;}});coverageLayers[habitat]=new Coverage('',{pane:'habitatCoverage',minZoom:4,maxNativeZoom:12,maxZoom:16,opacity:.95,crossOrigin:true,errorTileUrl:empty}).addTo(map);}
    for(const [name,lat,lon,kind] of [['EGYPT',27.7,30.3,'country'],['SAUDI ARABIA',25.7,43.5,'country'],['SUDAN',20.8,33.5,'country'],['ERITREA',15.7,37.4,'country'],['YEMEN',15.8,47,'country'],['SOMALIA',9.6,47.5,'country'],['Red Sea',22.7,38.9,'sea'],['Gulf of Aden',12.5,47.8,'sea']]) {
      L.tooltip({permanent:true,direction:'center',className:`country-label ${kind==='sea'?'sea-label':''}`,interactive:false}).setLatLng([lat,lon]).setContent(name).addTo(map);
    }
    for(const [name,lat,lon,kind] of [['Arabian Gulf',27.4,51.5,'sea'],['Gulf of Oman',24.3,58.4,'sea'],['IRAN',29.4,55.2,'country'],['OMAN',22.7,56.5,'country'],['UAE',24.3,54.4,'country'],['KUWAIT',29.6,47.3,'country']])L.tooltip({permanent:true,direction:'center',className:`country-label ${kind==='sea'?'sea-label':''}`,interactive:false}).setLatLng([lat,lon]).setContent(name).addTo(map);
    const HabitatLayer=L.Layer.extend({
      onAdd(mapRef){this._map=mapRef;this.canvas=L.DomUtil.create('canvas','habitat-canvas');this.canvas.style.position='absolute';this.canvas.style.pointerEvents='none';mapRef.getPane('overlayPane').appendChild(this.canvas);mapRef.on('moveend zoomend resize',this.draw,this);this.draw();},
      onRemove(mapRef){mapRef.off('moveend zoomend resize',this.draw,this);this.canvas.remove();},
      draw(){if(!this.a)return;const size=this._map.getSize(),dpr=window.devicePixelRatio||1,canvas=this.canvas;
        canvas.width=size.x*dpr;canvas.height=size.y*dpr;canvas.style.width=`${size.x}px`;canvas.style.height=`${size.y}px`;
        L.DomUtil.setPosition(canvas,this._map.containerPointToLayerPoint([0,0]));
        const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);ctx.globalAlpha=state.showPixels?state.pixelOpacity:0;const p=meta.products[state.product],n=p.cells.length,yi=p.years.indexOf(state.year),info=mapInfo(),bounds=this._map.getBounds().pad(.03);
        const step=Math.max(1.7,Math.abs(this._map.latLngToContainerPoint([20,40.01]).x-this._map.latLngToContainerPoint([20,40]).x));
        let count=0;
        const centre=this._map.getCenter(),key=[centre.lat,centre.lng,this._map.getZoom(),size.x,size.y,state.basin,state.region,state.habitats,state.product].join('|');
        if(this.positionKey!==key){this.positionKey=key;this.positions=[];this.filteredCount=0;for(let i=0;i<pixels.length;i++){const point=pixels[i];if(!visible(point))continue;this.filteredCount++;if(!bounds.contains([point[1],point[0]]))continue;const q=this._map.latLngToContainerPoint([point[1],point[0]]);this.positions.push([i,q.x,q.y,sourceIndex(i)]);}}
        count=this.filteredCount;
        for(const [i,x,y,source] of this.positions){const v=state.mapMode==='probability'?this.probabilityArray[source]*100:this.a[yi*n+source];ctx.fillStyle=color(v,info.max);ctx.fillRect(x-step/2,y-step/2,step,step);}

        $('visibleCount').textContent=state.showPixels?`${count.toLocaleString()} habitat cells · click to explore`:'Inventory coverage · heatwave pixels hidden';
      }
    });
    pixelLayer=new HabitatLayer().addTo(map);
    selectedMarker=L.circleMarker([0,0],{radius:7,color:'#fff3ca',weight:2,fillColor:'#ffd09c',fillOpacity:.2,interactive:false}).addTo(map);
    sourceMarker=L.circleMarker([0,0],{radius:3,color:'#b4d2c2',weight:1,fillOpacity:.6,interactive:false}).addTo(map);
    sourceLine=L.polyline([],{color:'#afd4c2',weight:1,dashArray:'3,4',interactive:false}).addTo(map);
    map.on('click',e=>{
      let best=-1,distance=14*14;
      for(let i=0;i<pixels.length;i++){const p=pixels[i];if(!visible(p))continue;const q=map.latLngToContainerPoint([p[1],p[0]]),d=(q.x-e.containerPoint.x)**2+(q.y-e.containerPoint.y)**2;if(d<distance){distance=d;best=i;}}
      if(best>=0)selectPixel(best);else note('Zoom towards the coloured coastline, then select a habitat cell.');
    });
  }

  function setYearControls(reset=true) {
    const p=meta.products[state.product];if(reset){state.from=p.years[0];state.to=p.years.at(-1);}
    for(const id of ['fromYear','toYear']){$(id).replaceChildren(...p.years.map(y=>new Option(y,y)));}
    $('fromYear').value=state.from;$('toYear').value=state.to;
    $('year').min=p.years[0];$('year').max=p.years.at(-1);$('yearStart').textContent=p.years[0];
    state.year=Math.max(p.years[0],Math.min(p.years.at(-1),state.year));$('year').value=state.year;
  }
  async function renderMap() {
    const product=state.product,metric=state.metric,token=++state.generation;
    loading('Loading habitat-pixel histories…');
    try {const [a,p]=await Promise.all([array(product,metric),state.mapMode==='probability'?forecastArray(product,'probability'):Promise.resolve(null)]);if(token!==state.generation)return;pixelLayer.a=a;pixelLayer.probabilityArray=p;pixelLayer.draw();$('loading').hidden=true;updateMapText();await renderPixel();}
    catch(e){$('loadingText').textContent=`${e.message}. Reload to try again.`;console.error(e);}
  }
  function updateMapText() {
    const probability=state.mapMode==='probability',forecast=outlook.pixelOutlooks[state.product];
    $('mapTitle').replaceChildren(document.createTextNode(`${mapInfo().name} `),Object.assign(document.createElement('span'),{id:'mapYear',textContent:probability?`${forecast.season} ${forecast.seasonStart.slice(0,4)}`:state.year}));
    $('yearLabel').textContent=probability?`${forecast.season} ${forecast.seasonStart.slice(0,4)}`:state.year;const p=meta.products[state.product],info=mapInfo();
    for(const id of ['year','play'])$(id).hidden=probability;
    $('yearStart').textContent=probability?`${monthLabel(forecast.seasonStart.slice(0,7))}–${monthLabel(forecast.seasonEnd.slice(0,7))}`:p.years[0];
    document.querySelector('.timeline-caption').textContent=probability?'INDIVIDUAL PIXEL MODELS':'YEAR BY YEAR';document.querySelector('.year-climate').hidden=probability;
    $('mapNote').textContent=probability?`${p.name} source cells · ${forecast.leadMonths}-month lead · updated ${outlook.asOf}`:`${p.name} · ${p.resolution} SST · baseline ${p.baseline}`;
    $('legendTitle').textContent=info.axis;$('legendMax').textContent=`${info.max}+`;updatePixelValue();
    $('climateYearLabel').textContent=`Climate in ${state.year}`;
    $('yearClimateValues').replaceChildren(...climate.modes.map(m=>{const e=document.createElement('div'),dot=document.createElement('i'),name=document.createElement('span'),value=document.createElement('strong');dot.style.background=modeColors[m];name.textContent=labels[m];value.textContent=`${signed(climateZ[m][state.year-1982],1)}σ`;e.append(dot,name,value);return e;}));
  }
  function updatePixelValue() {
    if(!pixelLayer?.a)return;const p=meta.products[state.product],a=pixelLayer.a,v=a[p.years.indexOf(state.year)*p.cells.length+sourceIndex(state.pixel)];
    if(state.mapMode==='probability'&&pixelLayer.probabilityArray){$('pixelValue').textContent=number(pixelLayer.probabilityArray[sourceIndex(state.pixel)]*100,1);$('pixelUnit').textContent=`% high-exposure probability · ${outlook.pixelOutlooks[state.product].season}`;return;}
    $('pixelValue').textContent=number(v,metricInfo[state.metric].digits);
    $('pixelUnit').textContent=`${metricInfo[state.metric].unit} in ${state.year}`;
  }
  function selectPixel(index, pan=false) {
    state.pixel=index;const p=pixels[index];if(pan)map.setView([p[1],p[0]],Math.max(map.getZoom(),8));
    renderPixel().catch(e=>{console.error(e);note('Unable to update the selected cell.');});
    const u=new URL(location.href);u.searchParams.set('lat',p[1].toFixed(2));u.searchParams.set('lon',p[0].toFixed(2));u.searchParams.set('product',state.product);u.searchParams.set('basin',state.basin);u.searchParams.set('variable',state.mapMode==='probability'?'outlook_probability':state.metric);history.replaceState(null,'',u);
  }
  async function renderPixel() {
    const index=state.pixel,product=state.product,metric=state.metric,a=await array(product,metric);
    if(index!==state.pixel||product!==state.product||metric!==state.metric)return;
    const p=pixels[index],native=meta.products[product],source=native.cells[sourceIndex(index)],values=series(index,a),ok=values.filter(S.finite),info=metricInfo[metric];
    selectedMarker.setLatLng([p[1],p[0]]);sourceMarker.setLatLng([source[1],source[0]]);sourceLine.setLatLngs([[p[1],p[0]],[source[1],source[0]]]);
    $('pixelTitle').textContent=coordinate(index);$('pixelRegion').textContent=meta.regions[p[3]];
    $('pixelHabitats').replaceChildren(...meta.habitats.filter((_,i)=>p[2]&(1<<i)).map(h=>{const e=document.createElement('span');e.className=`habitat-badge ${h}`;e.textContent=h==='kelp_macroalgae'?'Kelp & seaweeds':h;return e;}));
    updatePixelValue();const statLabels=document.querySelectorAll('.mini-stats>div>span');
    if(state.mapMode==='history'){['Record mean','Change / decade','Highest year'].forEach((text,j)=>statLabels[j].textContent=text);$('recordMean').textContent=ok.length?number(S.mean(ok),info.digits):'—';
    $('pixelTrend').textContent=signed(S.trend(native.years,values),info.digits===0?1:info.digits);
    const peak=ok.length?Math.max(...ok):null,idx=values.indexOf(peak);$('peakYear').textContent=idx>=0?native.years[idx]:'—';}
    else ['Historical probability','Brier skill','Test seasons'].forEach((text,j)=>statLabels[j].textContent=text);
    $('sourceCell').textContent=`${source[1].toFixed(product==='mur'?2:3)}°N, ${source[0].toFixed(product==='mur'?2:3)}°E · ${native.name}`;
    $('attachmentNote').textContent=`${number(p[product==='mur'?6:7],2)} km from habitat centre. ${product==='oisst'?'A shared 0.25° SST cell.':'Nearest valid 0.01° marine cell.'}`;
    Plotly.react('sparkline',[{x:native.years,y:values,type:'scatter',mode:'lines',line:{color:'#1768ac',width:1.5},fill:'tozeroy',fillcolor:'#d9e8f580',hovertemplate:'%{x}: %{y:.2f}<extra></extra>'}],{margin:{l:0,r:0,t:5,b:0},paper_bgcolor:'transparent',plot_bgcolor:'transparent',showlegend:false,xaxis:{visible:false},yaxis:{visible:false},font:{size:9}},{displayModeBar:false,responsive:true});
    window.dispatchEvent(new CustomEvent('atlaspixelchange',{detail:{basin:pointBasin(p).id,habitats:p[2],latitude:p[1],longitude:p[0],pixel:index}}));await Promise.all([renderHistory(),renderModel(),renderPointOutlook()]);if(state.outlookScope==='pixel')renderOutlook();
  }
  async function renderHistory() {
    const product=state.product,metric=state.metric,a=await array(product,metric);if(product!==state.product||metric!==state.metric)return;
    const p=meta.products[product],indices=[state.pixel,...state.pins.filter(i=>i!==state.pixel)];currentHistory=[];
    const traces=indices.map((index,j)=>{const values=series(index,a),years=p.years.filter(inYears),v=values.filter((_,k)=>inYears(p.years[k]));
      years.forEach((year,k)=>currentHistory.push({pixel:pixelId(index),latitude:pixels[index][1],longitude:pixels[index][0],product:p.name,year,metric,value:v[k],series:'observed'}));
      return {x:years,y:v,type:'scatter',mode:'lines+markers',name:coordinate(index),line:{color:j===0?'#1768ac':pinColors[(j-1)%pinColors.length],width:j===0?2.5:1.6},marker:{size:4},connectgaps:false,hovertemplate:`%{y:.2f} ${metricInfo[metric].unit}<extra>${coordinate(index)}</extra>`};
    });
    if(state.showTrend){const selected=traces[0],valid=selected.y.map((v,i)=>S.finite(v)?i:-1).filter(i=>i>=0);if(valid.length>=3){const years=valid.map(i=>selected.x[i]),fit=S.fit(valid.map(i=>selected.y[i]),[years]);traces.push({x:years,y:fit.pred,type:'scatter',mode:'lines',name:'Selected cell · fitted trend',line:{color:'#253444',width:2,dash:'dot'},hovertemplate:'%{y:.2f}<extra>Fitted linear trend</extra>'});years.forEach((year,k)=>currentHistory.push({pixel:pixelId(state.pixel),latitude:pixels[state.pixel][1],longitude:pixels[state.pixel][0],product:p.name,year,metric,value:fit.pred[k],series:'fitted_linear_trend'}));}}
    const second=state.historySecondary;
    if(second&&second!==metric){const key=second==='localSst'?'oisst':product,secondary=await array(key,second==='localSst'?'sst':second);if(product!==state.product||metric!==state.metric)return;const yy=meta.products[key].years,vv=series(state.pixel,secondary,key),keep=yy.map((y,i)=>inYears(y)?i:-1).filter(i=>i>=0),name=second==='localSst'?'Annual SST (OISST)':metricInfo[second].name;traces.push({x:keep.map(i=>yy[i]),y:keep.map(i=>vv[i]),name,type:'scatter',mode:'lines',yaxis:'y2',line:{color:'#7a6253',width:1.4,dash:'dash'},hovertemplate:'%{y:.2f}<extra>'+name+'</extra>'});keep.forEach(i=>currentHistory.push({pixel:pixelId(state.pixel),latitude:pixels[state.pixel][1],longitude:pixels[state.pixel][0],product:meta.products[key].name,year:yy[i],metric:second,value:vv[i],series:'observed_secondary_axis'}));}
    renderPlot('historyPlot',traces,layout({margin:{l:65,r:70,t:45,b:48},yaxis:{title:metricInfo[metric].axis},yaxis2:{title:second&&second!==metric?(second==='localSst'?'SST (°C)':metricInfo[second].axis):'',overlaying:'y',side:'right',showgrid:false,zeroline:false,rangemode:second==='localSst'?'normal':'tozero',visible:!!second&&second!==metric},xaxis:{dtick:Math.max(1,Math.round((state.to-state.from)/9))},shapes:[{type:'line',xref:'x',x0:state.year,x1:state.year,yref:'paper',y0:0,y1:1,line:{color:'#a6b3a0',width:1,dash:'dot'}}]}),config);
    $('historyCaption').textContent=`${p.name} · ${state.from}–${state.to} · baseline ${p.baseline} · ${metricInfo[metric].unit}`;
    $('pins').replaceChildren(...state.pins.map((index,j)=>{const e=document.createElement('span');e.className='pin';const dot=document.createElement('i');dot.className='pin-dot';dot.style.background=pinColors[j%pinColors.length];const b=document.createElement('button');b.textContent='×';b.setAttribute('aria-label',`Remove ${coordinate(index)}`);b.onclick=()=>{state.pins=state.pins.filter(i=>i!==index);renderHistory();};e.append(dot,document.createTextNode(coordinate(index)),b);return e;}));
  }
  async function renderModel() {
    const product=state.product,metric=state.metric,pixel=state.pixel;
    const [a,sst]=await Promise.all([array(product,metric),array('oisst','sst')]);
    if(product!==state.product||metric!==state.metric||pixel!==state.pixel)return;
    const years=meta.products[product].years, values=series(pixel,a), sstSeries=series(pixel,sst,'oisst'),annual=climate.annual;
    const rows=years.map((year,i)=>{const climateIndex=annual.years.indexOf(year-state.lag),sstIndex=meta.products.oisst.years.indexOf(year);
      return {year, observed:values[i], reference:state.benchmark==='trend'?year:sstSeries[sstIndex],
        indices:climate.modes.map(m=>climateIndex>=0?annual.values[m][climateIndex]:null),sst:sstSeries[sstIndex]};
    }).filter(r=>inYears(r.year)&&[r.observed,r.reference,...r.indices].every(S.finite));
    if(rows.length<12){modelData=null;$('modelSample').textContent=`${rows.length} complete years · choose ≥12`;for(const id of ['modelR2','modelCv'])$(id).textContent='—';$('varianceBar').replaceChildren();$('shares').textContent='Select a longer period for the eight-predictor model.';const modelRendering=renderPlot('modelPlot',[],layout({annotations:[{text:'Choose at least 12 complete years.',xref:'paper',yref:'paper',x:.5,y:.5,showarrow:false}]}),config);renderPaired(years,values,sstSeries);return;}
    const ys=rows.map(r=>r.year),y=rows.map(r=>r.observed),columns=[rows.map(r=>r.reference),...climate.modes.map((_,j)=>rows.map(r=>r.indices[j]))];
    const model=S.shapley(y,columns),base=S.fit(y,[columns[0]]),reference=state.benchmark==='trend'?'Long-term trend':'Annual SST (OISST)';
    modelData={rows,model,base,names:[reference,...climate.modes.map(m=>labels[m])],product,metric,pixel};
    $('modelSample').textContent=`${rows.length} complete years · ${ys[0]}–${ys.at(-1)}`;
    $('modelR2').textContent=number(model.r2,2);$('modelCv').textContent=number(model.cvR2,2);
    const modelRendering=renderPlot('modelPlot',[
      {x:ys,y,type:'scatter',mode:'lines+markers',name:'Observed',line:{color:'#1768ac',width:2},marker:{size:4}},
      {x:ys,y:base.pred,type:'scatter',mode:'lines',name:reference,line:{color:'#8e9e8c',width:1.5,dash:'dot'}},
      {x:ys,y:model.pred,type:'scatter',mode:'lines',name:'Combined model',line:{color:'#253444',width:2,dash:'dot'}}
    ],layout({margin:{l:52,r:12,t:37,b:37},legend:{...baseLayout.legend,y:1.17,font:{size:9}},yaxis:{title:metricInfo[metric].unit},xaxis:{dtick:Math.max(1,Math.round((state.to-state.from)/7))}}),config);
    modelRendering.then(()=>window.dispatchEvent(new Event('atlasmodelrender')));
    const colors=['#8591a0',...climate.modes.map(m=>modeColors[m])],bar=[];
    model.shares.forEach((v,j)=>{const e=document.createElement('span');e.style.width=`${v*100}%`;e.style.background=colors[j];e.title=`${modelData.names[j]}: ${number(v*100,1)}%`;bar.push(e);});$('varianceBar').replaceChildren(...bar);
    $('shares').replaceChildren(...model.shares.map((share,j)=>{const e=document.createElement('div');e.className='share-row';const dot=document.createElement('i');dot.style.background=colors[j];const name=document.createElement('span');name.textContent=modelData.names[j];const value=document.createElement('strong');value.textContent=`${number(share*100,1)}%`;value.title=`Coefficient per predictor SD: ${signed(model.beta[j],3)} ${metricInfo[metric].unit}`;e.append(dot,name,value);return e;}));
    const residual=document.createElement('div');residual.className='share-row';residual.innerHTML=`<i style="background:#e2e5dc"></i><span>Residual</span><strong>${number((1-model.r2)*100,1)}%</strong>`;$('shares').append(residual);
    renderPaired(years,values,sstSeries);
  }
  function renderPaired(years,values,sstSeries) {
    const local=state.index==='localSst';
    const keep=years.map((year,i)=>({year,y:values[i],x:local?sstSeries[meta.products.oisst.years.indexOf(year)]:climate.annual.values[state.index][climate.annual.years.indexOf(year-state.lag)]})).filter(r=>inYears(r.year)&&S.finite(r.y)&&S.finite(r.x));
    const ys=keep.map(r=>r.year),rawY=keep.map(r=>r.y),rawX=keep.map(r=>r.x);
    const y=state.detrend?S.detrend(rawY,ys):rawY,x=state.detrend?S.detrend(rawX,ys):rawX,r=S.correlation(y,x),d=state.detrend?'Detrended':'Raw';
    $('pairedTitle').textContent=`${labels[state.index]} & ${metricInfo[state.metric].name.toLowerCase()}`;
    $('pairedStat').textContent=`${d} r = ${number(r,2)} · n = ${keep.length}`;
    renderPlot('pairedPlot',[
      {x:ys,y:S.standardize(y),type:'scatter',mode:'lines+markers',name:`Heatwave metric${state.detrend?' (detrended)':''}`,line:{color:'#253444',width:2},marker:{size:3}},
      {x:ys,y:S.standardize(x),type:'scatter',mode:'lines',name:labels[state.index],line:{color:modeColors[state.index],width:1.8}}
    ],layout({margin:{l:52,r:15,t:35,b:38},yaxis:{title:'Standard deviations'},legend:{...baseLayout.legend,y:1.19},xaxis:{dtick:Math.max(1,Math.round((state.to-state.from)/9))}}),config);
    $('pairedCaption').textContent=local?`${d} annual series · same-year OISST mean SST at the attached habitat source cell · standardised over the same complete years.`:`${d} annual series · index lead ${state.lag} year${state.lag===1?'':'s'} · both series standardised over the same complete years.`;
  }
  function climateDateControls(){
    const dates=(state.climateSource==='latest'?liveClimate.monthly:climate.monthly).dates,first=Number(dates[0].slice(0,4)),last=Number(dates.at(-1).slice(0,4));
    state.climateFrom=Math.max(first,Math.min(state.climateFrom??last-10,last));state.climateTo=Math.max(state.climateFrom,Math.min(state.climateTo??last,last));
    for(const id of ['climateFrom','climateTo']){$(id).replaceChildren(...Array.from({length:last-first+1},(_,i)=>new Option(first+i,first+i)));$(id).value=state[id];}
    $('climateThisYear').disabled=state.climateSource!=='latest';
  }
  function renderLatestIndices(){
    $('latestIndexCards').replaceChildren(...climate.modes.map(mode=>{const dates=liveClimate.monthly.dates,values=liveClimate.monthly.values[mode];let i=values.length-1;while(i>=0&&!S.finite(values[i]))i--;const card=document.createElement('article');card.className='latest-index-card';
      const name=document.createElement('h3');name.textContent=labels[mode];const value=document.createElement('strong');value.textContent=i<0?'—':`${signed(values[i],2)}${['Nino34','IOD','NAtl_SSTA'].includes(mode)?' °C':''}`;const date=document.createElement('span');date.textContent=i<0?'Unavailable':monthLabel(dates[i]);
      card.append(name,value,date);return card;}));
  }
  function renderClimate() {
    const latest=state.climateSource==='latest',monthly=state.step==='monthly';let data=latest?liveClimate.monthly:climate[state.step];
    if(latest&&!monthly){const years=[...new Set(data.dates.map(d=>Number(d.slice(0,4))))],values={};for(const mode of climate.modes)values[mode]=years.map(year=>{const v=data.values[mode].filter((v,i)=>Number(data.dates[i].slice(0,4))===year&&S.finite(v));return v.length?S.mean(v):null;});data={years,values};}
    const x0=monthly?data.dates:data.years,keep=x0.map((x,i)=>({x,i,year:monthly?Number(x.slice(0,4)):x})).filter(d=>d.year>=state.climateFrom&&d.year<=state.climateTo);
    const modes=climate.modes.filter(m=>state.selectedModes.has(m));climateExport=[];
    keep.forEach(d=>{const row={date:d.x};modes.forEach(m=>{row[m]=data.values[m][d.i];if(latest&&!monthly)row[`${m}_months`]=liveClimate.monthly.values[m].filter((v,i)=>Number(liveClimate.monthly.dates[i].slice(0,4))===d.year&&S.finite(v)).length;});climateExport.push(row);});
    const traces=modes.map(m=>{const raw=keep.map(d=>data.values[m][d.i]),y=state.scale==='standard'?S.standardize(raw):raw;return {x:keep.map(d=>d.x),y,type:'scatter',mode:'lines',name:labels[m],line:{color:modeColors[m],width:monthly?1.3:2},connectgaps:false};});
    if(state.climateTrend)for(let k=0;k<modes.length;k++){const m=modes[k],line=traces[k],valid=line.y.map((v,i)=>S.finite(v)?i:-1).filter(i=>i>=0);if(valid.length<3)continue;const x=valid.map(i=>monthly?Date.parse(keep[i].x)/86400000:keep[i].x),fit=S.fit(valid.map(i=>line.y[i]),[x]),rawFit=S.fit(valid.map(i=>data.values[m][keep[i].i]),[x]);traces.push({x:valid.map(i=>line.x[i]),y:fit.pred,type:'scatter',mode:'lines',name:`${labels[m]} · fitted trend`,line:{color:modeColors[m],width:1.8,dash:'dot'}});valid.forEach((i,j)=>climateExport[i][`${m}_linear_fit`]=rawFit.pred[j]);}
    const tickformat=monthly?(state.climateFrom===state.climateTo?'%b %Y':'%Y'):'d';
    const climateRendering=renderPlot('climatePlot',traces,layout({xaxis:{type:monthly?'date':'linear',tickformat,dtick:monthly?undefined:Math.max(1,Math.round((state.climateTo-state.climateFrom)/9))},yaxis:{title:state.scale==='standard'?'Standard deviations':'Original index values'},annotations:traces.length?[]:[{text:'Select one or more indices above.',xref:'paper',yref:'paper',x:.5,y:.5,showarrow:false}]}),config);
    climateRendering.then(()=>window.dispatchEvent(new Event('atlasclimaterender')));
    $('climateRangeNote').textContent=`${state.climateFrom}–${state.climateTo} · climate dates are independent of heatwave analysis years`;
    $('climateCaption').textContent=latest?`NOAA feeds checked ${liveClimate.asOf} · latest: ${monthLabel(Object.values(liveClimate.latestByMode).sort().at(-1))}; IOD: ${monthLabel(liveClimate.latestByMode.IOD)} · missing months remain blank.${monthly?'':' Annual values for incomplete years are means of available months (year to date).'}`:state.scale==='standard'?`${monthly?'Monthly':'Annual'} indices · standardised within ${state.climateFrom}–${state.climateTo} · downloads retain original values.`:'Original values; index units differ. Use standardised scale for direct comparison.';
  }
  async function renderPointOutlook(){const pixel=state.pixel,product=state.product,f=await pointForecast(product,pixel);if(pixel!==state.pixel||product!==state.product)return;if(!f){$('pointOutlookTitle').textContent='Waiting for recent climate data';$('climateNextTitle').textContent='Waiting for recent climate data';$('climateNextDetail').textContent='';for(const id of ['pointProbability','pointBaseline','pointSkill'])$(id).textContent='—';return;}
    $('pointOutlookTitle').textContent=`${coordinate(pixel)} · ${meta.products[product].name}`;$('pointOutlookPeriod').textContent=`${monthLabel(f.seasonStart.slice(0,7))}–${monthLabel(f.seasonEnd.slice(0,7))} · ${f.leadMonths}-month lead · individual SST-source-cell model`;
    $('pointProbability').textContent=percent(f.probability);$('pointBaseline').textContent=percent(f.baseline);$('pointSkill').textContent=`${signed(f.skill*100,1)}%`;$('pointValidationYears').textContent=`Brier skill · ${f.nTest} test seasons`;
    $('climateNextTitle').textContent=`${monthLabel(f.seasonStart.slice(0,7))}–${monthLabel(f.seasonEnd.slice(0,7))} · ${percent(f.probability)} high-exposure probability`;
    $('climateNextDetail').textContent=`${coordinate(pixel)} · ${meta.products[product].name} · historical baseline ${percent(f.baseline)} · Brier skill ${signed(f.skill*100,1)}% (${f.nTest} test seasons) · ${f.leadMonths}-month lead`;
    if(state.mapMode==='probability'){$('recordMean').textContent=percent(f.baseline);$('pixelTrend').textContent=`${signed(f.skill*100,1)}%`;$('peakYear').textContent=f.nTest;}
  }
  async function renderOutlook(){
    const all=outlook.targets.filter(t=>t.available),latest=Object.values(liveClimate.latestByMode).sort().at(-1);
    $('freshness').textContent=`MHW history through 2025 · climate feeds to ${monthLabel(latest)} · IOD to ${monthLabel(liveClimate.latestByMode.IOD)}`;
    $('footerFreshness').textContent=`Climate checked ${liveClimate.asOf} · weekly refresh`;
    if(!all.length){$('outlookSubtitle').textContent='Waiting for the required recent climate observations.';$('outlookCards').innerHTML=`<div class="unavailable-outlook">${outlook.targets.map(t=>t.reason||'No dated outlook available.').join(' · ')}</div>`;return;}
    const first=all[0],start=new Date(first.seasonStart+'T00:00:00Z'),end=new Date(first.seasonEnd+'T00:00:00Z');
    const season=`${start.toLocaleDateString('en-GB',{month:'short',year:'numeric',timeZone:'UTC'})} – ${end.toLocaleDateString('en-GB',{month:'short',year:'numeric',timeZone:'UTC'})}`;
    $('outlookSubtitle').textContent=`${season} (${first.season}) · ${first.leadMonths}-month lead · ${state.outlookScope==='pixel'?'individual source-cell history':state.outlookScope==='overall'?'pooled habitat-cell means across the study domain':'habitat-cell means within each ecoregion'}`;
    $('outlookDates').replaceChildren(...[`Issue month: ${monthLabel(first.issueDate.slice(0,7))}`,`Indices used: ${monthLabel(first.predictorFirstMonth)}–${monthLabel(first.predictorLastMonth)}`,`Updated ${outlook.asOf}`,`MHW history: through 2025`].map(text=>{const e=document.createElement('span');e.textContent=text;return e;}));
    $('outlookDefinition').textContent=`Probability of a high-exposure season: ${state.outlookScope==='pixel'?'MHW days at this source cell':'habitat-cell mean MHW days'} above the training same-season 80th percentile, with a 10-day floor. Fixed six-index model; the delayed IOD feed is displayed separately.`;
    const rows=state.outlookScope==='pixel'?[await pointForecast(state.outlookRecord==='GHRSST MUR'?'mur':'oisst',state.pixel)]:all.filter(t=>t.product===state.outlookRecord&&t.scope===state.outlookScope&&(state.basin==='all'||t.basin===state.basin)&&(state.outlookScope==='overall'||state.region==='all'||t.region===meta.regions[Number(state.region)])&&(state.habitats&(1<<meta.habitats.indexOf(t.habitat)))).sort((a,b)=>meta.basins.findIndex(v=>v.id===a.basin)-meta.basins.findIndex(v=>v.id===b.basin)||meta.regions.indexOf(a.region)-meta.regions.indexOf(b.region)||meta.habitats.indexOf(a.habitat)-meta.habitats.indexOf(b.habitat));
    window.dispatchEvent(new CustomEvent('atlasoutlookchange',{detail:{rows}}));

  }
  function stop(){clearInterval(state.timer);state.timer=null;$('play').textContent='';$('play').setAttribute('aria-label','Play annual maps');}
  function forecastAvailability(){const enabled=!!outlook.pixelOutlooks[state.product];document.querySelector('#metric option[value="outlook_probability"]').disabled=!enabled;if(!enabled&&state.mapMode==='probability'){state.mapMode='history';$('metric').value=state.metric;}}
  async function createPointReport(){
    const button=$('createReport'),pixel=state.pixel,product=state.product,metric=state.metric,point=pixels[pixel],productInfo=meta.products[product];
    const association=modelData?.pixel===pixel&&modelData.product===product&&modelData.metric===metric?JSON.parse(JSON.stringify(modelData)):null;
    button.disabled=true;button.textContent='Preparing PDF…';
    try{
      const [arrays,forecast]=await Promise.all([Promise.all(meta.metrics.map(m=>array(product,m))),pointForecast(product,pixel)]);
      const histories=Object.fromEntries(meta.metrics.map((m,j)=>[m,series(pixel,arrays[j],product)]));
      let validation=[];let seasonal=[];
      if(forecast){const [predicted,observed,baseline,seasonArray]=await Promise.all(['backtest_predictions','backtest_observed','backtest_baselines'].map(name=>forecastArray(product,name)).concat([array(product,`season_${forecast.season}`)]));
        const seasonValues=series(pixel,seasonArray,product);seasonal=forecast.trainingYears.map(year=>({year,days:seasonValues[productInfo.years.indexOf(year)]}));
        validation=forecast.testYears.map((year,j)=>({year,probability:predicted[j*forecast.nativeCells+forecast.index],baseline:baseline[j*forecast.nativeCells+forecast.index],observedHigh:observed[j*forecast.nativeCells+forecast.index],days:seasonValues[productInfo.years.indexOf(year)],postBaseline:forecast.postBaselineMask[j]}));
      }
      const habitats=meta.habitats.filter((_,j)=>point[2]&(1<<j));
      const context=outlook.targets.filter(t=>t.available&&t.product===productInfo.name&&t.basin===pointBasin(point).id&&habitats.includes(t.habitat)&&(t.scope==='overall'||t.region===meta.regions[point[3]]));
      await window.AtlasReports.create({pixel:pixelId(pixel),latitude:point[1],longitude:point[0],habitats,region:meta.regions[point[3]],product:productInfo,
        source:productInfo.cells[sourceIndex(pixel,product)],distance:point[product==='mur'?6:7],metric,metricInfo:metricInfo[metric],histories,forecast,validation,seasonal,context,
        association,scenarios:window.AtlasScenarios?.compute(),detail:await window.AtlasDetails?.load(pixel,product),dailyClimate:await window.AtlasDetails?.climate(),updated:outlook.asOf,liveClimate,webUrl:`https://adawy2050.github.io/redsea-habitat-mhw-atlas/?lat=${point[1]}&lon=${point[0]}&product=${product}`});
      note('Point report downloaded.');
    }catch(error){console.error(error);note(`Report could not be created: ${error.message}`);}
    finally{button.disabled=false;button.textContent='Create point report (PDF) ';}
  }
  function exportMap(){
    const canvas=document.createElement('canvas'),w=$('map').clientWidth,h=$('map').clientHeight;
    canvas.width=w*2;canvas.height=h*2;const ctx=canvas.getContext('2d');ctx.scale(2,2);ctx.fillStyle='#102f37';ctx.fillRect(0,0,w,h);
    ctx.fillStyle='#24464a';ctx.strokeStyle='#51726d';ctx.lineWidth=.6;
    if($('basemap').value==='coastline')for(const feature of mapLand.features){const geometry=feature.geometry,polygons=geometry.type==='Polygon'?[geometry.coordinates]:geometry.coordinates;
      for(const polygon of polygons){ctx.beginPath();for(const ring of polygon){ring.forEach((xy,i)=>{const p=map.latLngToContainerPoint([xy[1],xy[0]]);if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);});ctx.closePath();}ctx.fill('evenodd');ctx.stroke();}
    }
    const baseRect=$('map').getBoundingClientRect();for(const tile of $('map').querySelectorAll('img.leaflet-tile-loaded')){if(tile.complete&&tile.naturalWidth){const r=tile.getBoundingClientRect();ctx.drawImage(tile,r.x-baseRect.x,r.y-baseRect.y,r.width,r.height);}}
    ctx.drawImage(pixelLayer.canvas,0,0,w,h);
    const selected=map.latLngToContainerPoint([pixels[state.pixel][1],pixels[state.pixel][0]]);ctx.beginPath();ctx.arc(selected.x,selected.y,7,0,Math.PI*2);ctx.strokeStyle='#fff0b6';ctx.lineWidth=2;ctx.stroke();
    const forecast=outlook.pixelOutlooks[state.product],mapTitle=state.mapMode==='probability'?`Prediction probability · ${forecast.season} ${forecast.seasonStart.slice(0,4)}`:`${metricInfo[state.metric].name} · ${state.year}`;
    ctx.fillStyle='#102f37dd';ctx.fillRect(0,0,w,65);ctx.fillRect(0,h-70,w,70);ctx.fillStyle='#eeeade';ctx.font='15px system-ui';ctx.fillText(`${mapTitle} · ${meta.products[state.product].name}`,20,28);ctx.font='10px system-ui';ctx.fillText('RED SEA & ARABIAN GULF HABITAT HEATWAVE ATLAS · habitat cells only',20,47);
    const info=mapInfo();for(let i=0;i<140;i++){ctx.fillStyle=color(i/139*info.max,info.max);ctx.fillRect(20+i,h-42,1,6);}ctx.fillStyle='#ceded4';ctx.font='9px system-ui';ctx.fillText(`${info.axis}     0 — ${info.max}+`,20,h-50);ctx.fillText(state.mapMode==='probability'?`${forecast.leadMonths}-month lead · updated ${outlook.asOf} · ${meta.products[state.product].resolution} SST`:`Baseline ${meta.products[state.product].baseline} · ${meta.products[state.product].resolution} SST`,20,h-18);
    ctx.textAlign='right';ctx.fillText($('basemap').value==='satellite'?'Imagery © Esri, Vantor, Earthstar Geographics, GIS User Community · UNEP-WCMC habitats':'Natural Earth · UNEP-WCMC habitats · NASA/JPL · NOAA',w-20,h-18);
    canvas.toBlob(blob=>{if(!blob){note('Map image could not be generated.');return;}const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=`habitat_map_${state.product}_${state.year}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);},'image/png');
  }
  function yearChanged(){state.year=Number($('year').value);pixelLayer.draw();window.dispatchEvent(new Event('atlasmapyearchange'));updateMapText();Plotly.relayout('historyPlot',{'shapes[0].x0':state.year,'shapes[0].x1':state.year}).catch(()=>{});}
  function bind() {
    window.addEventListener('atlaslanguagechange',()=>{renderHistory();renderModel();renderClimate();});
    $('product').onchange=()=>{stop();state.product=$('product').value;forecastAvailability();setYearControls();renderMap();renderClimate();};
    $('metric').onchange=()=>{stop();if($('metric').value==='outlook_probability')state.mapMode='probability';else{state.mapMode='history';state.metric=$('metric').value;}renderMap();};
    $('basemap').onchange=()=>{if($('basemap').value==='satellite'){map.removeLayer(landLayer);satelliteLayer.addTo(map);}else{map.removeLayer(satelliteLayer);landLayer.addTo(map);}};
    document.querySelectorAll('input[name="coverage"]').forEach(el=>el.onchange=()=>{el.checked?coverageLayers[el.value].addTo(map):map.removeLayer(coverageLayers[el.value]);});
    $('pixelOpacity').oninput=()=>{state.pixelOpacity=Number($('pixelOpacity').value);pixelLayer.draw();};$('showPixels').onchange=()=>{state.showPixels=$('showPixels').checked;pixelLayer.draw();};
    $('basin').onchange=()=>{state.selection=null;state.basin=$('basin').value;state.region='all';regionControls();filterChanged();fitStudy();const u=new URL(location.href);u.searchParams.set('basin',state.basin);history.replaceState(null,'',u);};
    $('region').onchange=()=>{state.region=$('region').value;filterChanged();};
    $('historySecondary').onchange=()=>{state.historySecondary=$('historySecondary').value;renderHistory();};
    $('showTrend').onchange=()=>{state.showTrend=$('showTrend').checked;renderHistory();};$('climateTrend').onchange=()=>{state.climateTrend=$('climateTrend').checked;renderClimate();};
    document.querySelectorAll('input[name="habitat"]').forEach(el=>el.onchange=()=>{state.habitats=[...document.querySelectorAll('input[name="habitat"]:checked')].reduce((s,e)=>s+Number(e.value),0);filterChanged();});
    $('year').oninput=yearChanged;
    $('play').onclick=()=>{if(state.timer){stop();return;}$('play').textContent='';$('play').setAttribute('aria-label','Pause annual maps');const p=meta.products[state.product];if(state.year===p.years.at(-1)){$('year').value=p.years[0];yearChanged();}state.timer=setInterval(()=>{if(state.year>=p.years.at(-1)){stop();return;}$('year').value=state.year+1;yearChanged();},750);};
    $('fitMap').onclick=fitStudy;
    $('pinPixel').onclick=()=>{if(state.pins.includes(state.pixel)){note('This cell is already in the comparison.');return;}if(state.pins.length>=5){note('Compare up to five pinned cells. Remove one to add another.');return;}state.pins.push(state.pixel);renderHistory();note('Cell added. Select another cell on the map to compare.');};
    $('clearPins').onclick=()=>{state.pins=[];renderHistory();};
    $('fromYear').onchange=()=>{state.from=Number($('fromYear').value);if(state.from>state.to){state.to=state.from;$('toYear').value=state.to;}renderHistory();renderModel();renderClimate();window.dispatchEvent(new Event('atlasrangechange'));};
    $('toYear').onchange=()=>{state.to=Number($('toYear').value);if(state.to<state.from){state.from=state.to;$('fromYear').value=state.from;}renderHistory();renderModel();renderClimate();window.dispatchEvent(new Event('atlasrangechange'));};
    $('benchmark').onchange=()=>{state.benchmark=$('benchmark').value;renderModel();};$('lag').onchange=()=>{state.lag=Number($('lag').value);renderModel();};
    $('pairedIndex').onchange=()=>{state.index=$('pairedIndex').value;renderModel();};$('detrend').onchange=()=>{state.detrend=$('detrend').checked;renderModel();};
    $('climateStep').onchange=()=>{state.step=$('climateStep').value;renderClimate();};$('climateScale').onchange=()=>{state.scale=$('climateScale').value;renderClimate();};
    $('climateSource').onchange=()=>{state.climateSource=$('climateSource').value;state.climateTo=null;climateDateControls();renderClimate();};
    $('climateFrom').onchange=()=>{state.climateFrom=Number($('climateFrom').value);if(state.climateFrom>state.climateTo){state.climateTo=state.climateFrom;$('climateTo').value=state.climateTo;}renderClimate();};
    $('climateTo').onchange=()=>{state.climateTo=Number($('climateTo').value);if(state.climateTo<state.climateFrom){state.climateFrom=state.climateTo;$('climateFrom').value=state.climateFrom;}renderClimate();};
    $('climateThisYear').onclick=()=>{state.climateFrom=state.climateTo=Number(liveClimate.asOf.slice(0,4));state.step='monthly';$('climateStep').value='monthly';climateDateControls();renderClimate();};
    $('climateFullRecord').onclick=()=>{const dates=(state.climateSource==='latest'?liveClimate.monthly:climate.monthly).dates;state.climateFrom=Number(dates[0].slice(0,4));state.climateTo=Number(dates.at(-1).slice(0,4));climateDateControls();renderClimate();};
    $('outlookRecord').onchange=()=>{state.outlookRecord=$('outlookRecord').value;renderOutlook();};
    $('outlookScope').onchange=()=>{state.outlookScope=$('outlookScope').value;renderOutlook();};
    $('showPointOutlook').onclick=()=>{state.outlookScope='pixel';state.outlookRecord=meta.products[state.product].name;$('outlookScope').value='pixel';$('outlookRecord').value=state.outlookRecord;renderOutlook();$('outlook').scrollIntoView({behavior:'smooth'});};
    $('createReport').onclick=createPointReport;
    $('downloadOutlook').onclick=()=>download('seasonal_outlook.json',JSON.stringify(outlook,null,2),'application/json');
    $('pairedIndex').replaceChildren(...[...climate.modes,'localSst'].map(m=>new Option(labels[m],m)));
    $('indexChips').replaceChildren(...climate.modes.map(m=>{const label=document.createElement('label');label.className='index-chip';const input=document.createElement('input');input.type='checkbox';input.checked=state.selectedModes.has(m);input.value=m;input.onchange=()=>{input.checked?state.selectedModes.add(m):state.selectedModes.delete(m);renderClimate();};const dot=document.createElement('i');dot.style.background=modeColors[m];label.append(input,dot,document.createTextNode(labels[m]));return label;}));
    for(const id of ['methodsOpen','methodsFooter','modelHelp'])$(id).onclick=showMethods;
    $('methodsClose').onclick=()=>$('methodsDialog').close();$('methodsDialog').onclick=e=>{if(e.target===$('methodsDialog'))$('methodsDialog').close();};
    $('locateForm').onsubmit=e=>{e.preventDefault();const parts=$('locate').value.trim().split(/[,\s]+/).map(Number);if(parts.length!==2||!parts.every(Number.isFinite)||parts[0]<-90||parts[0]>90||parts[1]<-180||parts[1]>180){$('locateMessage').textContent='Enter latitude, longitude; for example 21.5, 39.1';return;}const i=nearest(parts[0],parts[1],true);if(i<0){$('locateMessage').textContent='Select at least one habitat first.';return;}const d=Math.hypot(pixels[i][1]-parts[0],(pixels[i][0]-parts[1])*Math.cos(parts[0]*Math.PI/180))*111;$('locateMessage').textContent=`Nearest retained habitat cell: about ${number(d,1)} km away`;selectPixel(i,true);};
    $('downloadHistory').onclick=()=>download(`habitat_history_${state.product}_${state.metric}.csv`,csv(currentHistory));
    $('downloadClimate').onclick=()=>download(`climate_indices_${state.step}_${state.climateFrom}_${state.climateTo}.csv`,csv(climateExport));
    $('downloadPixel').onclick=async()=>{const pixel=state.pixel,product=state.product,p=meta.products[product],arrays=await Promise.all(meta.metrics.map(m=>array(product,m))),sst=await array('oisst','sst'),ss=series(pixel,sst,'oisst');
      const rows=p.years.map((year,j)=>{const row={pixel:pixelId(pixel),latitude:pixels[pixel][1],longitude:pixels[pixel][0],product:p.name,baseline:p.baseline,year,source_latitude:p.cells[sourceIndex(pixel,product)][1],source_longitude:p.cells[sourceIndex(pixel,product)][0]};meta.metrics.forEach((m,k)=>{row[m]=series(pixel,arrays[k],product)[j];});row.oisst_annual_mean_sst=ss[meta.products.oisst.years.indexOf(year)];climate.modes.forEach(m=>{row[m]=climate.annual.values[m][climate.annual.years.indexOf(year)];});return row;});download(`${pixelId(pixel)}_${product}.csv`,csv(rows));};
    $('downloadModel').onclick=()=>{if(!modelData){note('Select a longer period to fit the model.');return;}const d=modelData;download(`pixel_model_${pixelId(state.pixel)}.csv`,csv(d.rows.map((row,k)=>{const out={pixel:pixelId(state.pixel),latitude:pixels[state.pixel][1],longitude:pixels[state.pixel][0],year:row.year,observed:row.observed,fitted:d.model.pred[k],reference_only_fit:d.base.pred[k],reference:state.benchmark,reference_value:row.reference,oisst_annual_mean_sst:row.sst,index_lead_years:state.lag,climate_year:row.year-state.lag,product:meta.products[d.product].name,metric:d.metric,r2:d.model.r2,leave_one_year_out_r2:d.model.cvR2};climate.modes.forEach((m,j)=>{out[m]=row.indices[j];});d.names.forEach((name,j)=>{out[`${name}_share_r2`]=d.model.shares[j];out[`${name}_coefficient_per_sd`]=d.model.beta[j];out[`${name}_predictor_mean`]=d.model.means[j];out[`${name}_predictor_sd`]=d.model.scales[j];});return out;})));};
    $('mapDownload').onclick=exportMap;
  }
  function nearest(lat,lon,onlyVisible=false){let best=-1,distance=Infinity;for(let i=0;i<pixels.length;i++){const p=pixels[i];if(onlyVisible&&!visible(p))continue;const d=(p[1]-lat)**2+((p[0]-lon)*Math.cos(lat*Math.PI/180))**2;if(d<distance){distance=d;best=i;}}return best;}
  function filterChanged(){pixelLayer.draw();renderOutlook();if(!visible(pixels[state.pixel])){const index=pixels.findIndex(visible);if(index>=0)selectPixel(index);else note('Select at least one habitat to display cells.');}if(state.region!=='all'){const pts=pixels.filter(visible);if(pts.length)map.fitBounds(L.latLngBounds(pts.map(p=>[p[1],p[0]])),{padding:[70,65]});}}
  async function init(){
    try{[meta,climate]=await Promise.all([json('./data/metadata.json'),json('./data/climate.json')]);const [points,land,coverage,latest,seasonal]=await Promise.all([json('./data/pixels.json'),json('./data/land.geojson'),json('./coverage/index.json'),json('./data/climate_latest.json'),json('./data/outlook.json')]);pixels=points.rows;coverageMeta=coverage;liveClimate=latest;outlook=seasonal;
      climateZ=Object.fromEntries(climate.modes.map(m=>[m,S.standardize(climate.annual.values[m].filter((_,i)=>climate.annual.years[i]>=1982))]));
      const params=new URLSearchParams(location.search);if(['mur','oisst'].includes(params.get('product')))state.product=params.get('product');$('product').value=state.product;if(params.get('variable')==='outlook_probability'){state.mapMode='probability';$('metric').value='outlook_probability';}else if(meta.metrics.includes(params.get('variable'))){state.metric=params.get('variable');$('metric').value=state.metric;}
      if(meta.basins.some(b=>b.id===params.get('basin')))state.basin=params.get('basin');$('basin').value=state.basin;regionControls();
      state.pixel=params.has('lat')&&params.has('lon')?nearest(Number(params.get('lat')),Number(params.get('lon'))):nearest(21.4,39.05);
      if(!visible(pixels[state.pixel]))state.pixel=pixels.findIndex(visible);
      forecastAvailability();makeMap(land);setYearControls();bind();$('climateSource').value='latest';$('climateStep').value='monthly';climateDateControls();renderLatestIndices();await renderMap();renderClimate();renderOutlook();document.documentElement.dataset.ready='true';window.dispatchEvent(new Event('atlasready'));
    }catch(e){console.error(e);$('loadingText').textContent=`Atlas could not open: ${e.message}. Please reload.`;document.documentElement.dataset.error=e.message;}
  }
  window.AtlasUI={
    snapshot(){return {state:{...state},meta,pixels,climate,liveClimate,outlook,model:modelData,point:pixels[state.pixel],sourceIndex:sourceIndex(state.pixel),oisstIndex:sourceIndex(state.pixel,'oisst')};},
    array:(p,m)=>m.startsWith('outlook_')?forecastArray(p,m.slice(8)):array(p,m),series,nearest,selectPixel,visible,mapInfo,pixelId,color,forecast:pointForecast,
    get map(){return map;},
    setYear(year){if(year===state.year||!meta.products[state.product].years.includes(year)||state.mapMode==='probability')return;$('year').value=year;yearChanged();},
    setRange(from,to){state.from=Math.max(meta.products[state.product].years[0],Math.ceil(from));state.to=Math.min(2025,Math.floor(to));if(state.from>state.to)return;$('fromYear').value=state.from;$('toYear').value=state.to;renderHistory();renderModel();window.dispatchEvent(new Event('atlasrangechange'));},
    redraw(){pixelLayer.draw();},
    selectBounds(bounds){state.selection=bounds?[bounds.getWest(),bounds.getSouth(),bounds.getEast(),bounds.getNorth()]:null;if(bounds){const centre=bounds.getCenter(),i=nearest(centre.lat,centre.lng,true);if(i>=0)selectPixel(i);}filterChanged();window.dispatchEvent(new Event('atlasselectionchange'));},
    async visit(step){
      state.basin=step.basin;state.region='all';state.habitats=15;state.selection=null;state.product='mur';state.metric='mhw_days';state.mapMode=step.forecast?'probability':'history';
      $('basin').value=state.basin;$('product').value=state.product;$('metric').value=step.forecast?'outlook_probability':state.metric;document.querySelectorAll('input[name="habitat"]').forEach(e=>e.checked=true);regionControls();setYearControls();state.year=2025;$('year').value=state.year;
      const i=nearest(step.lat,step.lon,true);state.pixel=i;await renderMap();selectPixel(i);const point=pixels[i];map.flyTo([point[1],point[0]],8,{animate:!matchMedia('(prefers-reduced-motion: reduce)').matches,duration:.8});
      if(step.forecast){state.outlookScope='pixel';$('outlookScope').value='pixel';await renderOutlook();const f=await pointForecast(state.product,i);return {en:`At ${coordinate(i)}, the ${f.season} high-exposure probability is ${percent(f.probability)}, compared with a historical ${percent(f.baseline)}. Brier skill: ${number(f.skill,2)}; ${f.nTest} test seasons.`,ar:`عند ${coordinate(i)}، احتمال ارتفاع التعرض في ${f.season} هو ${percent(f.probability)}، مقابل احتمال تاريخي ${percent(f.baseline)}. مهارة براير ${number(f.skill,2)} خلال ${f.nTest} مواسم تحقق.`};}
      const a=await array('mur','mhw_days'),v=series(i,a),years=meta.products.mur.years,trend=S.trend(years,v);return {en:`This ${meta.regions[point[3]]} cell recorded ${number(v[0],0)} heatwave days in ${years[0]} and ${number(v.at(-1),0)} in ${years.at(-1)}. Its full-record linear change is ${signed(trend,1)} days per decade.`,ar:`سجلت هذه الخلية ${number(v[0],0)} يومًا من الموجات الحارة في ${years[0]} و${number(v.at(-1),0)} يومًا في ${years.at(-1)}. التغير الخطي خلال السجل ${signed(trend,1)} يوم لكل عقد.`};
    }
  };
  window.AtlasDebug={state,get meta(){return meta;},get pixels(){return pixels;},get model(){return modelData;},get outlook(){return outlook;},get map(){return map;}};
  init();
})();

;
/* Fully browser-local point reports. No coordinates/data are sent to a server. */
(() => {
  const ascii=s=>String(s).replace(/[–—−]/g,'-').replace(/°/g,' deg').replace(/σ/g,'SD');
  const num=(v,d=1)=>v===null||!Number.isFinite(v)?'-':Number(v).toFixed(d);
  const pct=v=>`${num(v*100,1)}%`;
  let dependencies;
  async function loadDependencies(){if(window.jspdf?.jsPDF?.API?.autoTable)return;if(!dependencies)dependencies=(async()=>{for(const path of ['./vendor/jspdf.umd.min.js','./vendor/jspdf-autotable.min.js'])await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=new URL(path,document.baseURI).href;script.onload=resolve;script.onerror=()=>reject(Error('PDF dependency unavailable'));document.head.append(script);});})().catch(e=>{dependencies=null;throw e;});return dependencies;}
  async function create(r){
    window.AtlasReportRendering=true;
    try{
    await loadDependencies();
    const {jsPDF}=window.jspdf,doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
    const ink=[23,33,46],blue=[23,79,134],grey=[85,101,117],W=180,X=15;
    const title=(name,sub)=>{doc.setFont('helvetica','bold');doc.setFontSize(17);doc.setTextColor(...ink);doc.text(ascii(name),X,21);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(...grey);doc.text(doc.splitTextToSize(ascii(sub),W),X,28);};
    const heading=(name,y)=>{doc.setFont('helvetica','bold');doc.setFontSize(11);doc.setTextColor(...ink);doc.text(ascii(name),X,y);doc.setFont('helvetica','normal');return y+7;};
    const para=(text,y,size=8.5)=>{doc.setFontSize(size);doc.setTextColor(...grey);const lines=doc.splitTextToSize(ascii(text),W);doc.text(lines,X,y);return y+lines.length*(size*.42)+4;};
    const table=(head,body,y,extra={})=>{doc.autoTable({head:[head.map(ascii)],body:body.map(row=>row.map(ascii)),startY:y,margin:{left:X,right:X,bottom:19},theme:'striped',styles:{fontSize:8,cellPadding:2,overflow:'linebreak',textColor:ink},headStyles:{fillColor:blue,textColor:255,fontStyle:'bold'},alternateRowStyles:{fillColor:[243,246,249]},...extra});return doc.lastAutoTable.finalY+8;};
    const coordinate=`${r.latitude.toFixed(2)} N, ${r.longitude.toFixed(2)} E`;
    title('Habitat marine heatwave point report',`${coordinate} | ${r.product.name} | Generated ${new Date().toISOString().slice(0,10)}`);
    let y=43;
    y=table(['Location and sampling','Value'],[
      ['Habitat grid cell',r.pixel],['Mapped habitat(s)',r.habitats.join(', ')],['Ecoregion',r.region],
      ['Observed record',`${r.product.years[0]}-${r.product.years.at(-1)} | ${r.product.resolution} SST | baseline ${r.product.baseline}`],
      ['Sampled SST centre',`${r.source[1].toFixed(3)} N, ${r.source[0].toFixed(3)} E (${num(r.distance,2)} km from habitat centre)`]
    ],y,{columnStyles:{0:{cellWidth:46}},styles:{fontSize:8,cellPadding:1.8}});
    y=heading('Upcoming-season outlook at this point',y);
    if(r.forecast){const f=r.forecast;y=table(['Season','Point probability','Historical baseline','Brier skill','Test seasons'],[
      [`${f.season} ${f.seasonStart.slice(0,4)}`,pct(f.probability),pct(f.baseline),pct(f.skill),String(f.nTest)]
    ],y);
      y=para(`Season: ${f.seasonStart} to ${f.seasonEnd}. High exposure: more than ${num(f.threshold,1)} MHW days at this source cell. Training: ${f.trainingYears[0]}-${f.trainingYears.at(-1)} (${f.trainingYears.length} seasons). ${f.leadMonths}-month lead; estimate updated ${r.updated}.`,y);
      y=para('This model uses the point history itself. Brier skill is relative to a historical-probability baseline; negative values indicate worse held-out performance. Probabilities are research estimates, not operational alert levels.',y,8);
    }else y=para('A current seasonal estimate is waiting for the required climate observations.',y);
    y=heading(`Annual ${r.metricInfo.name.toLowerCase()}`,y);
    const scratch=document.createElement('div');scratch.dataset.reportChart='true';scratch.style.cssText='position:fixed;left:-10000px;top:0;width:1100px;height:390px';document.body.append(scratch);
    let image;
    const traces=[{x:r.product.years,y:r.histories[r.metric],name:'Observed',mode:'lines+markers',type:'scatter',line:{color:'#1768ac',width:2},marker:{size:4}}];
    const valid=r.histories[r.metric].map((v,i)=>Number.isFinite(v)?i:-1).filter(i=>i>=0);
    if(valid.length>=3){const x=valid.map(i=>r.product.years[i]),fit=window.AtlasStats.fit(valid.map(i=>r.histories[r.metric][i]),[x]);traces.push({x,y:fit.pred,name:'Fitted linear trend',type:'scatter',mode:'lines',line:{color:'#34465b',width:2,dash:'dot'}});}
    try{await Plotly.newPlot(scratch,traces,
      {width:1100,height:390,paper_bgcolor:'#fff',plot_bgcolor:'#fff',margin:{l:75,r:25,t:35,b:55},legend:{orientation:'h',y:1.15},font:{family:'Arial',size:15,color:'#34465b'},xaxis:{tickformat:'d',gridcolor:'#e8edf3'},yaxis:{title:r.metricInfo.axis,gridcolor:'#e8edf3',zeroline:false}}, {staticPlot:true,displayModeBar:false});image=await Plotly.toImage(scratch,{format:'png',width:1100,height:390,scale:1.5});}
    finally{Plotly.purge(scratch);scratch.remove();}
    doc.addImage(image,'PNG',X,y,W,64);y+=70;
    doc.setFontSize(8);doc.setTextColor(...blue);doc.textWithLink('Open this point in the interactive atlas',X,Math.min(y,275),{url:r.webUrl});
    doc.addPage();title('Observed annual history',`${coordinate} | ${r.product.name} | MHW observations through ${r.product.years.at(-1)}`);
    y=table(['Year','MHW days','Events','Mean duration\n(days)','Mean intensity\n(degC)','Max intensity\n(degC)','Cumulative\n(degC days)'],r.product.years.map((year,j)=>[
      year,num(r.histories.mhw_days[j],0),num(r.histories.mhw_frequency[j],0),num(r.histories.mhw_mean_duration[j]),num(r.histories.mhw_mean_intensity[j],2),num(r.histories.mhw_max_intensity[j],2),num(r.histories.mhw_cumulative_intensity[j],1)
    ]),40,{styles:{fontSize:7.3,cellPadding:1},columnStyles:{0:{cellWidth:15}}});
    if(y<268)para('Intensity is temperature above the seasonal 90th-percentile threshold. A dash indicates no event intensity/duration. Cross-year event allocation follows the corrected manuscript pipeline.',y,8);
    doc.addPage();title('Seasonal validation and habitat context',`${coordinate} | ${r.product.name} | Chronological training-only predictions`);
    y=40;
    if(r.forecast){y=para(`Post-baseline validation: ${r.forecast.nTest} seasons; Brier score ${num(r.forecast.brier,4)} versus baseline ${num(r.forecast.baseline_brier,4)}. Full retrospective validation: ${r.forecast.nTestRetrospective} seasons, skill ${pct(r.forecast.skill_all)}.`,y);
      y=table(['Season start\nyear','MHW days','Observed high\n(1=yes)','Model\nprobability','Baseline\nprobability','SST baseline ready'],r.validation.map(v=>[v.year,num(v.days,0),num(v.observedHigh,0),pct(v.probability),pct(v.baseline),v.postBaseline?'Yes':'No']),y,{styles:{fontSize:7,cellPadding:1.5}});
    }
    if(y>225){doc.addPage();title('Habitat context and climate associations',`${coordinate} | ${r.product.name}`);y=42;}
    y=heading('Habitat-scale context',y);
    y=table(['Habitat','Scope','Probability','Baseline','Brier skill'],r.context.map(t=>[t.habitat,t.scope==='overall'?`${t.region} (whole habitat)`:t.region,pct(t.probability),pct(t.historicalProbability),pct(t.backtest.scores.baseline_available.skill)]),y,{styles:{fontSize:7,cellPadding:1.5}});
    if(r.association){
      if(y>202){doc.addPage();title('Annual climate associations',`${coordinate} | selected analysis period`);y=42;}
      const a=r.association;y=heading('Annual pixel model',y);y=para(`Analysis years ${a.rows[0].year}-${a.rows.at(-1).year}; outcome ${r.metricInfo.name.toLowerCase()}. Fitted R2: ${num(a.model.r2,3)}. Leave-one-year-out R2: ${num(a.model.cvR2,3)}. Shares below allocate full-record fitted variation; they are separate from the seasonal logistic probability model.`,y);
      y=table(['Predictor','Share of total variance','Coefficient per predictor SD'],a.names.map((name,j)=>[name,pct(a.model.shares[j]),num(a.model.beta[j],3)]),y,{styles:{fontSize:7,cellPadding:1.5}});
    }
    async function extraChart(traces,options={}){
      const el=document.createElement('div');el.dataset.reportChart='true';el.style.cssText='position:fixed;left:-10000px;top:0;width:1100px;height:400px';document.body.append(el);
      try{await Plotly.newPlot(el,traces,{width:1100,height:400,paper_bgcolor:'#fff',plot_bgcolor:'#fff',margin:{l:65,r:65,t:40,b:45},legend:{orientation:'h',y:1.15,font:{size:12}},font:{size:12,color:'#34465b'},...options},{staticPlot:true,displayModeBar:false});return await Plotly.toImage(el,{format:'png',width:1100,height:400,scale:1.4});}finally{Plotly.purge(el);el.remove();}
    }
    if(r.detail){
      doc.addPage();title('Daily temperature and monthly heatwave history',`${coordinate} | Daily OISST source ${r.detail.daily.cell[1]} N, ${r.detail.daily.cell[0]} E`);y=40;
      const cutoff=String(+r.detail.period[1].slice(0,4)-4),daily=r.detail.daily,keep=daily.dates.map((date,i)=>date>=cutoff?i:-1).filter(i=>i>=0),means=window.AtlasDetails.monthlyMeans(daily),mk=means.dates.map((date,i)=>date>=cutoff?i:-1).filter(i=>i>=0),monthly=r.detail.monthly,hk=monthly.dates.map((date,i)=>date>=cutoff?i:-1).filter(i=>i>=0);
      const dense=await extraChart([{x:keep.map(i=>daily.dates[i]),y:keep.map(i=>daily.values[i]),name:'Daily OISST',mode:'lines',line:{color:'rgba(36,94,136,.24)',width:.8}},{x:mk.map(i=>means.dates[i]),y:mk.map(i=>means.values[i]),name:'Monthly mean SST',mode:'lines',line:{color:'#245e88',width:2}},{x:hk.map(i=>monthly.dates[i]),y:hk.map(i=>monthly.values[i]),name:'Monthly MHW days',mode:'lines',yaxis:'y2',line:{color:'#b35b32',width:1.2}}],{xaxis:{type:'date'},yaxis:{title:'SST (degC)'},yaxis2:{title:'MHW days / month',overlaying:'y',side:'right',showgrid:false,rangemode:'tozero'}});
      doc.addImage(dense,'PNG',X,y,W,68);y+=74;y=para(`Daily observations: ${r.detail.period[0]} to ${r.detail.period[1]} (${daily.dates.length.toLocaleString('en')} dates). Figure shows the latest five years; all daily values can be downloaded from the atlas. Monthly MHW days use ${monthly.product} at the point's attached source cell.`,y,8);
      const last=monthly.dates.map((date,i)=>({date,i})).slice(-24);y=table(['Month','Observed mean SST (degC)','Observed MHW days'],last.map(d=>{const k=means.dates.indexOf(d.date);return [d.date.slice(0,7),num(means.values[k],2),num(monthly.values[d.i],0)];}),y,{styles:{fontSize:7,cellPadding:1.1}});
    }
    if(r.detail){
      doc.addPage();title('Heatwave calendar and next-season outlook',`${coordinate} | ${r.region} | ${r.product.name}`);y=40;
      const monthly=r.detail.monthly,years=r.product.years,calendar=years.map(year=>Array.from({length:12},(_,m)=>{const key=`${year}-${String(m+1).padStart(2,'0')}`;const i=monthly.dates.findIndex(d=>d.startsWith(key));return i<0?null:monthly.values[i];}));
      const heat=await extraChart([{x:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],y:years,z:calendar,type:'heatmap',colorscale:[[0,'#f3eee2'],[.5,'#4b737c'],[1,'#9f542e']],zmin:0,zmax:31,colorbar:{title:'Days',thickness:12}}],{xaxis:{type:'category',side:'top'},yaxis:{autorange:'reversed',tickformat:'d',dtick:years.length>30?4:2}});doc.addImage(heat,'PNG',X,y,W,85);y+=91;
      const days=r.histories.mhw_days.filter(Number.isFinite),mean=v=>v.reduce((a,b)=>a+b,0)/v.length;
      y=para(`Mean heatwave days per year: first five years ${num(mean(days.slice(0,5)),1)}; last five years ${num(mean(days.slice(-5)),1)}; difference ${num(mean(days.slice(-5))-mean(days.slice(0,5)),1)} days/year.`,y,9);
      if(r.forecast){const f=r.forecast,tests=r.validation||[],plot=await extraChart([{x:tests.map(v=>`${v.year}-${f.seasonStart.slice(5)}`),y:tests.map(v=>v.probability*100),name:'Past model tests',mode:'lines',line:{color:'#245e88',width:2}},{x:[f.seasonStart,f.seasonEnd],y:[f.probability*100,f.probability*100],name:'Next season',mode:'lines',line:{color:'#a45d36',width:3,dash:'dot'}},{x:[tests.length?`${tests[0].year}-01-01`:f.seasonStart,f.seasonEnd],y:[f.baseline*100,f.baseline*100],name:'Historical chance',mode:'lines',line:{color:'#92947f',dash:'dot'}}],{xaxis:{type:'date'},yaxis:{title:'Probability (%)',range:[0,100]}});doc.addImage(plot,'PNG',X,y,W,65);y+=72;y=para(`The dotted future line covers ${f.seasonStart} to ${f.seasonEnd}. It is one probability for the whole season.`,y,8);}
    }
    if(r.liveClimate){
      doc.addPage();title('Climate observations and conditional annual extension',`${coordinate} | Monthly feeds checked ${r.liveClimate.asOf}`);y=40;
      const monthly=r.liveClimate.monthly,start=String(+r.liveClimate.asOf.slice(0,4)-4),keep=monthly.dates.map((date,i)=>date>=start?i:-1).filter(i=>i>=0),colours=['#c43d32','#007d8a','#7e52a0','#366aa2','#99700d','#b52a74','#39813c'];
      const ct=r.liveClimate.modes.map((m,j)=>({x:keep.map(i=>monthly.dates[i]),y:window.AtlasStats.standardize(keep.map(i=>monthly.values[m][i])),name:m,mode:'lines',line:{color:colours[j],width:1.4}}));
      if(r.dailyClimate)for(const mode of ['AO','NAO']){const source=r.dailyClimate.modes[mode],indices=source.dates.map((date,i)=>date>=start?i:-1).filter(i=>i>=0),raw=keep.map(i=>monthly.values[mode][i]).filter(Number.isFinite),mean=window.AtlasStats.mean(raw),sd=Math.sqrt(window.AtlasStats.mean(raw.map(v=>(v-mean)**2)));ct.push({x:indices.map(i=>source.dates[i]),y:indices.map(i=>(source.values[i]-mean)/(sd||1)),name:mode+' daily',mode:'lines',line:{color:mode==='AO'?'rgba(54,106,162,.20)':'rgba(126,82,160,.20)',width:.7}});}
      const cimage=await extraChart(ct,{xaxis:{type:'date'},yaxis:{title:'Standard deviations'}});doc.addImage(cimage,'PNG',X,y,W,68);y+=75;
      y=table(['Index','Latest monthly observation','Value','Current-year months'],r.liveClimate.modes.map(mode=>{let k=monthly.values[mode].length-1;while(k>=0&&!Number.isFinite(monthly.values[mode][k]))k--;return [mode,monthly.dates[k].slice(0,7),num(monthly.values[mode][k],3),monthly.values[mode].filter((v,i)=>monthly.dates[i].startsWith(r.liveClimate.asOf.slice(0,4))&&Number.isFinite(v)).length];}),y,{styles:{fontSize:7.5,cellPadding:1.5}});
      y=para('Faint daily AO/NAO are genuine NOAA daily products. The monthly record and original normalisations are retained; daily observations are display-only and do not replace the model predictors.',y,8);
      if(r.scenarios?.length){y=heading('Conditional annual model values',y);y=table(['Year','Conditional metric value','Climate input year'],r.scenarios.map(v=>[v.year,num(v.value,2),v.climateYear]),y);y=para('These dotted annual extensions are conditional scenarios, separate from the next-season probability model. Current-year index means use only available months; future indices and annual SST, when used, are held at their latest available values. They are not observed MHW values.',y,8);}
    }
    if(r.association){
      doc.addPage();title('Observed, fitted and conditional annual curves',`${coordinate} | ${r.product.name} | ${r.metricInfo.name}`);y=40;
      const a=r.association,ys=a.rows.map(v=>v.year),traces=[{x:ys,y:a.rows.map(v=>v.observed),name:'Observed',mode:'lines+markers',line:{color:'#245e88',width:2},marker:{size:4}},{x:ys,y:a.base.pred,name:a.names[0],mode:'lines',line:{color:'#90977d',dash:'dot',width:1.5}},{x:ys,y:a.model.pred,name:'Combined annual model',mode:'lines',line:{color:'#34465b',dash:'dot',width:2}}];
      if(r.scenarios?.length)traces.push({x:[ys.at(-1),...r.scenarios.map(v=>v.year)],y:[a.model.pred.at(-1),...r.scenarios.map(v=>v.value)],name:'Conditional annual extension',mode:'lines+markers',line:{color:'#b15b35',dash:'dot',width:2}});
      const plot=await extraChart(traces,{xaxis:{tickformat:'d'},yaxis:{title:r.metricInfo.unit}});doc.addImage(plot,'PNG',X,y,W,78);y+=85;
      y=para('Solid: observations. Dotted: model fit, reference-only fit and conditional extension. The extension holds unavailable future predictors at their latest available values; it is separate from the seasonal exposure probability forecast.',y,8);
      if(r.scenarios?.length)y=table(['Index','2026 input year','Available months','Mean index input'],r.scenarios[0].inputs.map(i=>[i.mode,i.year,i.months,num(i.value,3)]),y,{styles:{fontSize:7.5,cellPadding:1.6}});
    }
    if(y>190){doc.addPage();title('Sources, methods and contacts',coordinate);y=42;}
    y=heading('Sources and interpretation',y);
    y=para('SST: NASA/JPL GHRSST MUR v4.1 and NOAA OISST v2.1. Habitats: UNEP-WCMC inventories; East Asia also uses modelled seagrass grids and macroalgae occurrence records. Climate: NOAA CPC, PSL and NCEI. The seasonal model uses Nino-3.4, NAO, AO, EAWR, North Atlantic SST anomaly and PDO. The IOD feed is delayed and is shown separately in the atlas.',y,8);
    y=para('High exposure exceeds the training same-season 80th percentile, with a 10-day floor. Every backtest refits using earlier seasons only, including thresholds, detrending, standardisation and regularisation. A source cell may be shared by several habitat locations. These results describe surface heatwave exposure, not species-specific damage.',y,8);
    y=heading('Contacts',y);y=para('Ahmed Eladawy, JAMSTEC: ahmed.eladawy@jamstec.go.jp',y,8);
    const pages=doc.getNumberOfPages();for(let page=1;page<=pages;page++){doc.setPage(page);doc.setDrawColor(215,222,230);doc.line(X,282,195,282);doc.setFont('helvetica','normal');doc.setFontSize(7);doc.setTextColor(...grey);doc.text('Coastal Habitat Heatwave Atlas | Ahmed Eladawy',X,287);doc.text(`${page} / ${pages}`,195,287,{align:'right'});}
    doc.setProperties({title:`MHW point report: ${coordinate}`,author:'Ahmed Eladawy',subject:'Habitat-cell history, seasonal probabilities and chronological validation'});
    doc.save(`MHW_${r.latitude.toFixed(2)}N_${r.longitude.toFixed(2)}E_${r.product.name.replaceAll(' ','_')}_report.pdf`);
    }finally{window.AtlasReportRendering=false;window.dispatchEvent(new Event('atlasreportcomplete'));}
  }
  window.AtlasReports={create};
})();

;
/* Guided selections use the existing map state and verified per-cell records. */
(() => {
  const steps=[
    {title:'Northern Red Sea',ar:'شمال البحر الأحمر',lat:27,lon:34,basin:'redsea',section:'explore'},
    {title:'Southern Red Sea',ar:'جنوب البحر الأحمر',lat:16.5,lon:41.8,basin:'redsea',section:'history'},
    {title:'Gulf of Aden',ar:'خليج عدن',lat:12.6,lon:45,basin:'redsea',section:'history'},
    {title:'Arabian Gulf',ar:'الخليج العربي',lat:25.3,lon:54.5,basin:'gulf',section:'connections'},
    {title:'Gulf of Oman',ar:'خليج عُمان',lat:25.3,lon:57,basin:'gulf',section:'climate'},
    {title:'Okinawa reefs',ar:'شعاب أوكيناوا',lat:26.2,lon:127.3,basin:'eastasia',section:'history'},
    {title:'Northern Japan seagrass and kelp',ar:'الأعشاب والطحالب في شمال اليابان',lat:43,lon:144,basin:'eastasia',section:'history'},
    {title:'Philippine habitats',ar:'موائل الفلبين',lat:10.3,lon:119.2,basin:'eastasia',section:'climate'},
    {title:'Western Pacific islands',ar:'جزر غرب المحيط الهادئ',lat:7.5,lon:134.5,basin:'eastasia',section:'connections'},
    {title:'Next-season probability',ar:'احتمال الموسم القادم',lat:25.3,lon:57,basin:'gulf',section:'outlook',forecast:true}
  ];
  let index=0,running=false,busy=false;
  const panel=document.createElement('aside');panel.id='tourPanel';panel.className='tour-panel';panel.hidden=true;panel.setAttribute('aria-labelledby','tourHeading');panel.innerHTML='<div class="tour-progress" id="tourProgress"></div><div class="tour-heading"><h2 id="tourHeading"></h2><button id="tourExit">Exit tour</button></div><p id="tourFinding" aria-live="polite"></p><div class="tour-actions"><button id="tourBack">Previous step</button><span id="tourPosition"></span><button id="tourNext">Next step</button></div>';document.body.append(panel);
  const $=id=>document.getElementById(id), ar=()=>AtlasLanguage.current==='ar';
  async function show(n){if(!window.AtlasUI||busy)return;index=Math.max(0,Math.min(steps.length-1,n));running=true;busy=true;panel.hidden=false;$('tourNext').disabled=$('tourBack').disabled=true;const step=steps[index];$('tourHeading').textContent=ar()?step.ar:step.title;$('tourFinding').textContent=ar()?'جارٍ اختيار الخلية…':'Selecting the habitat cell…';
    try{const finding=await AtlasUI.visit(step);if(!running)return;$('tourFinding').textContent=ar()?finding.ar:finding.en;$('tourProgress').replaceChildren(...steps.map((s,k)=>{const b=document.createElement('button');b.className=k===index?'current':'';b.setAttribute('aria-label',ar()?s.ar:s.title);b.setAttribute('aria-current',k===index?'step':'false');b.onclick=()=>show(k);return b;}));$('tourPosition').textContent=`${index+1} / ${steps.length}`;$('tourNext').textContent=index===steps.length-1?'Finish tour':'Next step';$('tourBack').disabled=index===0;$('tourNext').disabled=false;const url=new URL(location.href);url.searchParams.set('tour',String(index+1));history.replaceState(null,'',url);$(step.section).scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
    }finally{busy=false;}}
  function exit(){running=false;panel.hidden=true;const url=new URL(location.href);url.searchParams.delete('tour');history.replaceState(null,'',url);$('tourButton')?.focus();}
  $('tourBack').onclick=()=>show(index-1);$('tourNext').onclick=()=>index===steps.length-1?exit():show(index+1);$('tourExit').onclick=exit;
  for(const id of ['tourButton','tourStart'])$(id).onclick=()=>show(0);
  window.addEventListener('atlaslanguagechange',()=>{if(running)show(index);});
  function init(){const n=Number(new URL(location.href).searchParams.get('tour'));if(n>=1&&n<=steps.length)show(n-1);}
  window.addEventListener('atlasready',init);if(document.documentElement.dataset.ready==='true')init();
})();

;
/* Observed daily/monthly display series are independent of annual model arrays. */
(() => {
  const $=id=>document.getElementById(id),cache=new Map(),T=s=>AtlasLanguage.current!=='en'?AtlasLanguage.translate(s):s;
  const json=url=>{if(!cache.has(url))cache.set(url,fetch(url).then(r=>{if(!r.ok)throw Error(url);return r.json();}));return cache.get(url);};
  const binary=url=>{if(!cache.has(url))cache.set(url,fetch(url).then(r=>{if(!r.ok)throw Error(url);return r.arrayBuffer();}));return cache.get(url);};
  async function load(pixel,product){const d=AtlasUI.snapshot(),point=d.pixels[pixel],basin=d.meta.basins.find(b=>b.regions.includes(point[3])).id,oi=point[5]-d.meta.products.oisst.basinCellRanges[basin][0],source=point[product==='mur'?4:5];
    const [dailyIndex,monthlyIndex]=await Promise.all([json(`./detail/daily/${basin}/index.json`),json('./detail/monthly/index.json')]),p=monthlyIndex.products[product],chunk=Math.floor(source/monthlyIndex.chunkCells),chunkWidth=Math.min(monthlyIndex.chunkCells,p.cells-chunk*monthlyIndex.chunkCells);
    const [raw,months]=await Promise.all([binary(`./detail/daily/${basin}/${oi}.i16`),binary(`./detail/monthly/${product}_${chunk}.u8`)]),a=new Int16Array(raw),b=new Uint8Array(months),offset=(source%monthlyIndex.chunkCells)*p.dates.length;
    if(a.length!==dailyIndex.dates.length||b.length!==chunkWidth*p.dates.length)throw Error('Display data dimension mismatch');
    return {daily:{dates:dailyIndex.dates,values:Array.from(a,v=>v===-32768?null:v/100),source:dailyIndex.source,cell:d.meta.products.oisst.cells[point[5]]},monthly:{dates:p.dates,values:Array.from(b.slice(offset,offset+p.dates.length)),product:d.meta.products[product].name},period:dailyIndex.period};
  }
  function monthlyMeans(daily){const groups=new Map();daily.dates.forEach((date,i)=>{const value=daily.values[i];if(!Number.isFinite(value))return;const key=date.slice(0,7);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(value);});return {dates:[...groups.keys()].map(d=>d+'-15'),values:[...groups.values()].map(v=>v.reduce((a,b)=>a+b,0)/v.length)};}
  let token=0,current;
  async function render(){if(document.documentElement.dataset.ready!=='true')return;const id=++token,d=AtlasUI.snapshot();try{const data=await load(d.state.pixel,d.state.product);if(id!==token)return;current=data;const lo=d.state.from,hi=d.state.to,within=date=>+date.slice(0,4)>=lo&&+date.slice(0,4)<=hi,filter=(source)=>{const indices=source.dates.map((date,i)=>within(date)?i:-1).filter(i=>i>=0);return {x:indices.map(i=>source.dates[i]),y:indices.map(i=>source.values[i])};},daily=filter(data.daily),mean=filter(monthlyMeans(data.daily)),mhw=filter(data.monthly),traces=[];
      if($('detailDaily').checked)traces.push({...daily,name:T('Daily OISST SST'),type:'scatter',mode:'lines',line:{color:'rgba(41,92,134,.23)',width:.8},hovertemplate:'%{x}: %{y:.2f} °C<extra></extra>'});
      traces.push({...mean,name:T('Monthly mean SST'),type:'scatter',mode:'lines',line:{color:'#245e88',width:1.7}},{...mhw,name:T('Monthly MHW days'),type:'scatter',mode:'lines',yaxis:'y2',line:{color:'#b35b32',width:1.1},fill:'tozeroy',fillcolor:'rgba(179,91,50,.10)'});
      await Plotly.react('detailPlot',traces,{paper_bgcolor:'transparent',plot_bgcolor:'transparent',margin:{l:55,r:55,t:30,b:45},hovermode:'x unified',legend:{orientation:'h',y:1.15,font:{size:10}},font:{family:'system-ui',size:10,color:'#647681'},xaxis:{type:'date'},yaxis:{title:'SST (°C)'},yaxis2:{title:T('MHW days / month'),overlaying:'y',side:'right',rangemode:'tozero',showgrid:false}},{responsive:true,displaylogo:false,toImageButtonOptions:{format:'svg',filename:'daily_monthly_habitat'}});
      const cell=data.daily.cell;$('detailNote').textContent=AtlasLanguage.current==='ar'?`الرصد اليومي: OISST عند ${cell[1]}°N، ${cell[0]}°E، حتى ${data.period[1]}. الخط البرتقالي: أيام الموجات الحارة الشهرية من ${data.monthly.product}. الفترة ${lo}–${hi} تتبع اختيار سنوات السجل.`:`Daily OISST at ${cell[1]}°N, ${cell[0]}°E, through ${data.period[1]}. Orange: native monthly MHW days from ${data.monthly.product}. The ${lo}–${hi} view follows the history year controls.`;
    }catch(e){console.error(e);$('detailNote').textContent=T('Daily display records could not load.');}}
  async function climate(){return json('./detail/climate_daily.json');}
  let overlayToken=0;
  async function climateOverlay(){const ticket=++overlayToken;if(!$('climateDaily').checked)return;try{const data=await climate();if(ticket!==overlayToken||!$('climateDaily').checked)return;const d=AtlasUI.snapshot(),plot=$('climatePlot');if(!plot.data||d.state.climateSource!=='latest'||d.state.step!=='monthly')return;const traces=[];for(const mode of ['AO','NAO']){if(!d.state.selectedModes.has(mode))continue;const v=data.modes[mode],indices=v.dates.map((x,i)=>+x.slice(0,4)>=d.state.climateFrom&&+x.slice(0,4)<=d.state.climateTo?i:-1).filter(i=>i>=0),monthly=d.liveClimate.monthly.values[mode].filter((x,i)=>+d.liveClimate.monthly.dates[i].slice(0,4)>=d.state.climateFrom&&+d.liveClimate.monthly.dates[i].slice(0,4)<=d.state.climateTo&&Number.isFinite(x)),mean=AtlasStats.mean(monthly),sd=Math.sqrt(AtlasStats.mean(monthly.map(x=>(x-mean)**2)));
        traces.push({x:indices.map(i=>v.dates[i]),y:indices.map(i=>d.state.scale==='standard'?(v.values[i]-mean)/(sd||1):v.values[i]),type:'scatter',mode:'lines',name:`${mode} · ${T('daily')}`,legendgroup:mode,line:{color:mode==='AO'?'rgba(54,106,162,.24)':'rgba(126,82,160,.24)',width:.7},hovertemplate:'%{x}: %{y:.2f}<extra>'+mode+' '+T('daily')+'</extra>',meta:'daily_display'});}
      const old=(plot.data||[]).map((t,i)=>t.meta==='daily_display'?i:-1).filter(i=>i>=0);if(old.length)await Plotly.deleteTraces(plot,old);if(traces.length&&ticket===overlayToken)await Plotly.addTraces(plot,traces);
    }catch(e){console.error(e);}}
  let seasonToken=0;
  async function seasonalTimeline(){if(document.documentElement.dataset.ready!=='true')return;const ticket=++seasonToken,d=AtlasUI.snapshot(),f=await AtlasUI.forecast(d.state.product,d.state.pixel);if(!f||ticket!==seasonToken)return;
    const [pred,base,obs]=await Promise.all(['outlook_backtest_predictions','outlook_backtest_baselines','outlook_backtest_observed'].map(m=>AtlasUI.array(d.state.product,m)));if(ticket!==seasonToken)return;
    const x=f.testYears.map(y=>`${y}-${f.seasonStart.slice(5)}`),at=a=>f.testYears.map((_,k)=>a[k*f.nativeCells+f.index]*100);
    const traces=[{x,y:at(pred),name:T('Earlier-year model probabilities'),mode:'lines+markers',line:{color:'#245e88',dash:'dot'},marker:{size:4}},{x,y:at(base),name:T('Historical baseline'),mode:'lines',line:{color:'#8d927e',dash:'dot'}},{x,y:at(obs),name:T('Observed high exposure'),mode:'markers',marker:{color:'#a25d36',size:5,symbol:'x'}},{x:[f.seasonStart,f.seasonEnd],y:[f.probability*100,f.probability*100],name:T('Next-season estimate'),mode:'lines+markers',line:{color:'#a84e2f',width:3,dash:'dot'}}];
    await Plotly.react('outlookTimeline',traces,{paper_bgcolor:'transparent',plot_bgcolor:'transparent',margin:{l:55,r:25,t:30,b:45},legend:{orientation:'h',y:1.2,font:{size:10}},font:{size:10,color:'#647681'},xaxis:{type:'date',range:[`${f.testYears[0]}-01-01`,`${+f.seasonEnd.slice(0,4)}-06-01`]},yaxis:{title:T('Probability (%)'),range:[-3,103]},shapes:[{type:'rect',xref:'x',x0:f.seasonStart,x1:f.seasonEnd,yref:'paper',y0:0,y1:1,fillcolor:'#a84e2f12',line:{width:0}}]},{responsive:true,displaylogo:false});
  }
  const dailyDownload=document.createElement('button');dailyDownload.type='button';dailyDownload.className='text-button';dailyDownload.textContent='Daily climate CSV';dailyDownload.id='downloadDailyClimate';document.querySelector('.daily-climate-toggle').after(dailyDownload);
  dailyDownload.onclick=async()=>{const d=AtlasUI.snapshot(),data=await climate(),rows=['date,index,value,series,source'];for(const mode of ['AO','NAO']){if(!d.state.selectedModes.has(mode))continue;const source=data.modes[mode];source.dates.forEach((date,i)=>{if(+date.slice(0,4)>=d.state.climateFrom&&+date.slice(0,4)<=d.state.climateTo)rows.push([date,mode,source.values[i],'observed_daily',source.source].join(','));});}const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([rows.join('\r\n')],{type:'text/csv'}));a.download='daily_climate_observations.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
  $('detailDaily').onchange=render;$('climateDaily').onchange=()=>{const plot=$('climatePlot'),old=(plot.data||[]).map((t,i)=>t.meta==='daily_display'?i:-1).filter(i=>i>=0);if(old.length)Plotly.deleteTraces(plot,old);if($('climateDaily').checked)climateOverlay();};
  $('downloadDetail').onclick=()=>{if(!current)return;const rows=['date,series,value,units,source'];current.daily.dates.forEach((date,i)=>rows.push(`${date},observed_daily_SST,${current.daily.values[i]??''},degC,OISST`));current.monthly.dates.forEach((date,i)=>rows.push(`${date},observed_monthly_MHW_days,${current.monthly.values[i]},days,${current.monthly.product}`));const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([rows.join('\r\n')],{type:'text/csv'}));a.download='habitat_daily_monthly.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
  for(const event of ['atlasready','atlaspixelchange','atlasrangechange','atlaslanguagechange'])window.addEventListener(event,()=>{render();seasonalTimeline();});
  window.addEventListener('atlasclimaterender',climateOverlay);
  window.AtlasDetails={load,climate,monthlyMeans,get current(){return current;}};
})();

;
/* Linked exploration reuses the selected annual arrays; no scientific refits. */
(() => {
  const $=id=>document.getElementById(id),T=s=>AtlasLanguage.current!=='en'?AtlasLanguage.translate(s):s;
  let syncing=false;let selectedRows=[],rectangle,brush=false,first,hoverTimer,savedYear,comparisonLayer,comparisonArray,comparisonKey;
  const controls=document.createElement('div');controls.className='explore-tools';controls.innerHTML='<form id="placeForm"><label for="placeSearch">Find a coastal place</label><input id="placeSearch" list="places" placeholder="Hurghada, Jeddah, Dubai…" autocomplete="off"><datalist id="places"></datalist><button>Go</button></form><button id="showHotspots">Show 20 hotspots</button><button id="drawBox">Draw selection</button><button id="selectExtent">Use map extent</button><label>Compare left year<select id="compareYear"><option value="">No comparison</option></select></label><label class="compare-position">Swipe<input id="compareSwipe" type="range" min="0" max="100" value="50" aria-label="Before and after swipe position"></label><span id="exploreStatus" aria-live="polite"></span>';
  document.querySelector('.atlas-layout').before(controls);
  const dialog=document.createElement('dialog');dialog.id='selectionDialog';dialog.innerHTML='<div class="dialog-heading"><h2>Selected habitat cells</h2><button id="selectionClose" aria-label="Close selection"></button></div><div class="dialog-body"><p id="selectionSummary"></p><div id="selectionPlot" style="height:280px"></div><button id="selectionCsv" class="button primary">Download selection CSV</button></div>';document.body.append(dialog);$('selectionClose').onclick=()=>dialog.close();
  async function mapValues(){const d=AtlasUI.snapshot(),prob=d.state.mapMode==='probability',p=d.meta.products[d.state.product],a=await AtlasUI.array(d.state.product,prob?'outlook_probability':d.state.metric),n=p.cells.length,yi=p.years.indexOf(d.state.year);return {d,value:i=>a[(prob?0:yi*n)+d.pixels[i][d.state.product==='mur'?4:5]]*(prob?100:1)};}
  function localizePlaces(rows){$('places').replaceChildren(...rows.map(p=>new Option(AtlasLanguage.current==='ar'?p.ar:p.name)));}
  let places=[];fetch('./places.json').then(r=>r.json()).then(p=>{places=p;localizePlaces(p);});
  $('placeForm').onsubmit=e=>{e.preventDefault();const text=$('placeSearch').value.trim().toLowerCase(),p=places.find(p=>p.name.toLowerCase()===text||p.ar===text);if(!p){$('exploreStatus').textContent=T('Choose a place from the list.');return;}const i=AtlasUI.nearest(p.lat,p.lon);const d=AtlasUI.snapshot(),point=d.pixels[i],basin=d.meta.basins.find(b=>b.regions.includes(point[3])).id;if(d.state.basin!==basin){$('basin').value=basin;$('basin').dispatchEvent(new Event('change'));}AtlasUI.selectPixel(i,true);$('exploreStatus').textContent=T('Nearest mapped habitat cell selected.');};
  async function selection(bounds){AtlasUI.selectBounds(bounds);AtlasUI.map.fitBounds(bounds,{padding:[40,40],maxZoom:12});const {d,value}=await mapValues();selectedRows=[];for(let i=0;i<d.pixels.length;i++){const p=d.pixels[i],v=value(i);if(AtlasUI.visible(p)&&bounds.contains([p[1],p[0]])&&Number.isFinite(v))selectedRows.push({habitat_cell:AtlasUI.pixelId(i),latitude:p[1],longitude:p[0],product:d.meta.products[d.state.product].name,metric:d.state.mapMode==='probability'?'outlook_probability':d.state.metric,year:d.state.mapMode==='probability'?d.outlook.pixelOutlooks[d.state.product].seasonStart:d.state.year,value:v});}
    if(rectangle)rectangle.remove();rectangle=L.rectangle(bounds,{color:'#f3d6a9',weight:2,fillOpacity:.06,interactive:false}).addTo(AtlasUI.map);dialog.showModal();const values=selectedRows.map(p=>p.value);$('selectionSummary').textContent=AtlasLanguage.current==='ar'?`${values.length.toLocaleString('en')} خلية موائل. المتوسط ${values.length?AtlasStats.mean(values).toFixed(2):'—'}. قد تشترك خلايا الموائل في مصدر حرارة واحد.`:`${values.length.toLocaleString('en')} habitat cells. Mean ${values.length?AtlasStats.mean(values).toFixed(2):'—'}. Habitat cells may share an SST source.`;Plotly.react('selectionPlot',[{x:values,type:'histogram',marker:{color:'#b15a35'},name:T('Habitat cells')}],{paper_bgcolor:'transparent',plot_bgcolor:'transparent',margin:{l:50,r:20,t:15,b:40},xaxis:{title:T(AtlasUI.mapInfo().axis)},yaxis:{title:T('Habitat cells')}},{responsive:true,displaylogo:false});}
  $('drawBox').onclick=()=>{brush=!brush;AtlasUI.map.dragging[brush?'disable':'enable']();$('drawBox').setAttribute('aria-pressed',String(brush));$('exploreStatus').textContent=T(brush?'Drag a rectangle on the map.':'Selection drawing off.');};$('selectExtent').onclick=()=>selection(AtlasUI.map.getBounds());
  $('selectionCsv').onclick=()=>{if(!selectedRows.length)return;const keys=Object.keys(selectedRows[0]),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([[keys.join(','),...selectedRows.map(r=>keys.map(k=>r[k]).join(','))].join('\n')],{type:'text/csv'}));a.download='habitat_selection.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
  $('showHotspots').onclick=async()=>{const {d,value}=await mapValues(),rank=d.pixels.map((p,i)=>({i,v:AtlasUI.visible(p)?value(i):NaN})).filter(p=>Number.isFinite(p.v)).sort((a,b)=>b.v-a.v).slice(0,20);if(!rank.length)return;const group=L.featureGroup(rank.map(p=>L.circleMarker([d.pixels[p.i][1],d.pixels[p.i][0]],{radius:7,color:'#fff4d7',weight:2,fillColor:'#b03a23',fillOpacity:.7}).on('click',()=>AtlasUI.selectPixel(p.i))));if(window.AtlasHotspots)window.AtlasHotspots.remove();window.AtlasHotspots=group.addTo(AtlasUI.map);AtlasUI.map.fitBounds(group.getBounds(),{padding:[60,60],maxZoom:10});$('exploreStatus').textContent=T('20 highest-value visible cells highlighted.');};
  function compareOptions(){const d=AtlasUI.snapshot(),value=$('compareYear').value;$('compareYear').replaceChildren(new Option(T('No comparison'),''),...d.meta.products[d.state.product].years.map(y=>new Option(y,y)));$('compareYear').value=d.meta.products[d.state.product].years.includes(+value)?value:'';}
  async function compare(){const year=+$('compareYear').value;if(!year||AtlasUI.snapshot().state.mapMode==='probability'){comparisonLayer?.remove();comparisonLayer=null;return;}const d=AtlasUI.snapshot(),p=d.meta.products[d.state.product],key=d.state.product+d.state.metric;if(comparisonKey!==key){comparisonArray=await AtlasUI.array(d.state.product,d.state.metric);comparisonKey=key;}if(!comparisonLayer){const Layer=L.Layer.extend({onAdd(map){this.map=map;this.canvas=L.DomUtil.create('canvas','comparison-canvas');this.canvas.style.cssText='position:absolute;pointer-events:none;z-index:430';map.getPane('overlayPane').append(this.canvas);map.on('moveend zoomend resize',this.draw,this);this.draw();},onRemove(map){map.off('moveend zoomend resize',this.draw,this);this.canvas.remove();},draw(){const d=AtlasUI.snapshot(),p=d.meta.products[d.state.product],size=this.map.getSize(),ratio=devicePixelRatio||1,ctx=this.canvas.getContext('2d'),year=+$('compareYear').value;this.canvas.width=size.x*ratio;this.canvas.height=size.y*ratio;this.canvas.style.width=size.x+'px';this.canvas.style.height=size.y+'px';L.DomUtil.setPosition(this.canvas,this.map.containerPointToLayerPoint([0,0]));ctx.scale(ratio,ratio);const edge=size.x*+$('compareSwipe').value/100;ctx.save();ctx.rect(0,0,edge,size.y);ctx.clip();ctx.fillStyle='rgba(8,25,37,.7)';ctx.fillRect(0,0,edge,size.y);const yi=p.years.indexOf(year),n=p.cells.length,bounds=this.map.getBounds(),step=Math.max(2,Math.abs(this.map.latLngToContainerPoint([20,40.01]).x-this.map.latLngToContainerPoint([20,40]).x));for(let i=0;i<d.pixels.length;i++){const point=d.pixels[i];if(!AtlasUI.visible(point)||!bounds.contains([point[1],point[0]]))continue;const q=this.map.latLngToContainerPoint([point[1],point[0]]),v=comparisonArray[yi*n+point[d.state.product==='mur'?4:5]];ctx.fillStyle=AtlasUI.color(v,AtlasUI.mapInfo().max);ctx.fillRect(q.x-step/2,q.y-step/2,step,step);}ctx.restore();ctx.strokeStyle='#fff2d5';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(edge,0);ctx.lineTo(edge,size.y);ctx.stroke();ctx.fillStyle='#102e3f';ctx.fillRect(10,85,80,25);ctx.fillStyle='white';ctx.font='12px sans-serif';ctx.fillText(String(year),25,102);}});comparisonLayer=new Layer().addTo(AtlasUI.map);}else comparisonLayer.draw();}
  $('compareYear').onchange=compare;$('compareSwipe').oninput=()=>comparisonLayer?.draw();
  function linkedCharts(){for(const id of ['historyPlot','modelPlot']){const plot=$(id);if(!plot.on||plot.dataset.linked)return;plot.dataset.linked='true';plot.on('plotly_hover',e=>{if(syncing)return;const year=Math.round(Number(e.points[0].x));if(savedYear===undefined)savedYear=AtlasUI.snapshot().state.year;AtlasUI.setYear(year);});plot.on('plotly_unhover',()=>{if(savedYear!==undefined){AtlasUI.setYear(savedYear);savedYear=undefined;}});plot.on('plotly_relayout',e=>{if(e['xaxis.range[0]']!==undefined&&e['xaxis.range[1]']!==undefined)AtlasUI.setRange(Number(e['xaxis.range[0]']),Number(e['xaxis.range[1]']));});}}
  function init(){compareOptions();linkedCharts();const map=AtlasUI.map,tooltip=L.tooltip({direction:'top',opacity:.97,className:'cell-hover'});map.on('mousedown',e=>{if(!brush)return;first=e.latlng;if(rectangle)rectangle.remove();rectangle=L.rectangle(L.latLngBounds(first,first),{color:'#f3d6a9',weight:2,fillOpacity:.1}).addTo(map);});map.on('mousemove',e=>{if(brush&&first){rectangle.setBounds(L.latLngBounds(first,e.latlng));return;}clearTimeout(hoverTimer);hoverTimer=setTimeout(async()=>{if(brush)return;const {d,value}=await mapValues(),i=AtlasUI.nearest(e.latlng.lat,e.latlng.lng,true);if(i<0)return;const point=d.pixels[i],q=map.latLngToContainerPoint([point[1],point[0]]);if(q.distanceTo(e.containerPoint)>15){tooltip.remove();return;}const nearby=AtlasPhotos.nearest(point[1],point[0])[0],photoHtml=nearby?`<br><img src="./images/responsive/${nearby.photo.id}-480.jpg" width="140" height="85" style="object-fit:cover" alt=""><br>${Math.round(nearby.distance)} km · ${nearby.photo.location}`:'',a=await AtlasUI.array(d.state.product,d.state.metric),s=AtlasUI.series(i,a),ok=s.filter(Number.isFinite),lo=Math.min(...ok),hi=Math.max(...ok),path=s.map((v,k)=>Number.isFinite(v)?`${k&&Number.isFinite(s[k-1])?'L':'M'}${(k/(s.length-1)*140).toFixed(1)},${(28-(v-lo)/(hi-lo||1)*24).toFixed(1)}`:'').join(' '),v=value(i);tooltip.setLatLng([point[1],point[0]]).setContent(`<strong>${point[1].toFixed(2)}°N, ${point[0].toFixed(2)}°E</strong><br>${Number.isFinite(v)?v.toFixed(2):'—'} ${T(AtlasUI.mapInfo().unit)}<br><svg width="145" height="32" aria-hidden="true"><path d="${path}" fill="none" stroke="#d2a35f" stroke-width="1.6"/></svg>${photoHtml}`).addTo(map);},90);});map.on('mouseup',e=>{if(brush&&first){const bounds=L.latLngBounds(first,e.latlng);first=null;brush=false;map.dragging.enable();$('drawBox').setAttribute('aria-pressed','false');selection(bounds);window.dispatchEvent(new CustomEvent('atlasboxdrawn',{detail:{bounds}}));}});map.on('mouseout',()=>{clearTimeout(hoverTimer);tooltip.remove();});const container=map.getContainer();container.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch'||!brush)return;e.preventDefault();container.setPointerCapture(e.pointerId);first=map.mouseEventToLatLng(e);if(rectangle)rectangle.remove();rectangle=L.rectangle(L.latLngBounds(first,first),{color:'#f3d6a9',weight:2,fillOpacity:.1}).addTo(map);},{passive:false});container.addEventListener('pointermove',e=>{if(e.pointerType==='touch'&&brush&&first){e.preventDefault();rectangle.setBounds(L.latLngBounds(first,map.mouseEventToLatLng(e)));}},{passive:false});container.addEventListener('pointerup',e=>{if(e.pointerType!=='touch'||!brush||!first)return;const bounds=L.latLngBounds(first,map.mouseEventToLatLng(e));first=null;brush=false;map.dragging.enable();$('drawBox').setAttribute('aria-pressed','false');selection(bounds);window.dispatchEvent(new CustomEvent('atlasboxdrawn',{detail:{bounds}}));});window.addEventListener('atlasmapyearchange',()=>{syncing=true;const year=AtlasUI.snapshot().state.year;for(const id of ['historyPlot','modelPlot']){if($(id).data)Plotly.Fx.hover(id,[{curveNumber:0,pointNumber:Math.max(0,($(id).data[0]?.x||[]).indexOf(year))}]);}syncing=false;});}
  window.addEventListener('atlasready',init);window.addEventListener('atlaspixelchange',()=>{linkedCharts();compareOptions();compare();});window.addEventListener('atlaslanguagechange',()=>{localizePlaces(places);compareOptions();});
})();

;
/* Conditional annual extensions: original fits and observations remain unchanged. */
(() => {
  const $=id=>document.getElementById(id),T=s=>AtlasLanguage.current!=='en'?AtlasLanguage.translate(s):s;
  let current=[],ticket=0;
  const controls=document.createElement('div');controls.className='scenario-controls';controls.innerHTML='<label><input id="showScenario" type="checkbox" checked>2026–2027 conditional curves</label><button id="scenarioCsv" class="text-button">Scenario data CSV</button><p id="scenarioNote"></p>';$('modelPlot').after(controls);
  function compute(){const d=AtlasUI.snapshot(),fit=d.model;if(!fit||fit.pixel!==d.state.pixel||fit.product!==d.state.product||fit.metric!==d.state.metric)return [];const latestYear=+d.liveClimate.monthly.dates.at(-1).slice(0,4),meanY=AtlasStats.mean(fit.rows.map(r=>r.observed)),reference=fit.rows.at(-1).reference;
    return [2026,2027].map(year=>{const climateYear=Math.min(year-d.state.lag,latestYear),inputs=d.climate.modes.map(mode=>{if(climateYear<=2025){const i=d.climate.annual.years.indexOf(climateYear);return {mode,value:i>=0?d.climate.annual.values[mode][i]:null,year:climateYear,months:12};}const values=d.liveClimate.monthly.values[mode].filter((v,i)=>+d.liveClimate.monthly.dates[i].slice(0,4)===climateYear&&Number.isFinite(v));return {mode,value:values.length?AtlasStats.mean(values):null,year:climateYear,months:values.length};}),x=[d.state.benchmark==='trend'?year:reference,...inputs.map(i=>i.value)],value=x.every(Number.isFinite)?meanY+x.reduce((sum,v,i)=>sum+(fit.model.scales[i]>1e-12?fit.model.beta[i]*(v-fit.model.means[i])/fit.model.scales[i]:0),0):null;
      return {year,value,series:'conditional_annual_scenario',climateYear,inputs,assumption:year-d.state.lag>latestYear?'Latest available annual climate means held constant':'Available annual climate means; incomplete current-year inputs use available months',reference:d.state.benchmark==='trend'?'Year advances':'Annual SST held at last observed analysis year',metric:d.state.metric};});}
  async function render(){const id=++ticket;if(document.documentElement.dataset.ready!=='true'||!$('modelPlot').data)return;current=compute();const plot=$('modelPlot'),old=plot.data.map((t,i)=>t.meta==='annual_scenario'?i:-1).filter(i=>i>=0);if(old.length)await Plotly.deleteTraces(plot,old);if(id!==ticket)return;if(!$('showScenario').checked||!current.length){$('scenarioNote').textContent='';return;}const d=AtlasUI.snapshot(),last=d.model.rows.at(-1),lastFit=d.model.model.pred.at(-1);await Plotly.addTraces(plot,{x:[last.year,...current.map(r=>r.year)],y:[lastFit,...current.map(r=>r.value)],name:T('Conditional annual scenario'),type:'scatter',mode:'lines+markers',meta:'annual_scenario',line:{color:'#b15b35',width:2,dash:'dot'},marker:{size:5},hovertemplate:'%{x}: %{y:.2f}<extra>'+T('Conditional annual scenario')+'</extra>'});$('scenarioNote').textContent=T('Annual extensions follow the selected index lead. Unavailable future inputs are held at their latest means; current-year means use available months. Separate from the seasonal probability forecast.');}
  $('showScenario').onchange=render;$('scenarioCsv').onclick=()=>{const rows=current.flatMap(r=>r.inputs.map(i=>[r.year,r.value,r.series,r.climateYear,i.mode,i.value,i.months,r.reference,r.assumption])),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([['year,value,series,climate_year,index,index_value,months,reference,assumption',...rows.map(r=>r.join(','))].join('\n')],{type:'text/csv'}));a.download='conditional_annual_scenarios.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
  window.addEventListener('atlasmodelrender',render);window.addEventListener('atlasready',render);window.addEventListener('atlaslanguagechange',render);window.AtlasScenarios={compute,get current(){return current;}};
})();

;
/* Keep existing control IDs and scientific state while reducing first-screen load. */
(() => {
  const $=id=>document.getElementById(id);
  const drawer=document.createElement('dialog');drawer.id='filtersDialog';drawer.className='side-drawer';drawer.setAttribute('aria-labelledby','filterTitle');drawer.innerHTML='<div class="dialog-heading"><h2 id="filterTitle">More filters</h2><button id="filtersClose" aria-label="Close filters"></button></div><div class="dialog-body"><div id="secondaryControls"></div></div>';document.body.append(drawer);
  for(const id of ['region','product'])$('secondaryControls').append($(id).closest('label'));
  $('secondaryControls').append(document.querySelector('.layers-toolbar'));
  const open=document.createElement('button');open.type='button';open.id='filtersOpen';open.className='button outline';open.textContent='More filters';document.querySelector('.toolbar').append(open);open.onclick=()=>drawer.showModal();$('filtersClose').onclick=()=>drawer.close();drawer.onclick=e=>{if(e.target===drawer)drawer.close();};
  const methods=$('methodsDialog');methods.classList.add('side-drawer');methods.setAttribute('aria-label','Data and methods');
  for(const body of methods.querySelectorAll('.dialog-body')){const ar=body.classList.contains('methods-ar'),toc=document.createElement('nav');toc.className='methods-toc';toc.setAttribute('aria-label',ar?'محتويات المنهجية':'Methods contents');const children=[...body.children];let section;
    for(const child of children){if(child.tagName==='H3'){section=document.createElement('details');section.className='method-section';const summary=document.createElement('summary');summary.textContent=child.textContent;section.append(summary);child.replaceWith(section);const button=document.createElement('button');button.type='button';button.textContent=summary.textContent;button.onclick=()=>{section.open=true;section.scrollIntoView({block:'start',behavior:'auto'});};const target=section;button.onclick=()=>{target.open=true;target.scrollIntoView({block:'start',behavior:'auto'});};toc.append(button);}else if(section)section.append(child);}
    body.prepend(toc);
  }
  function help(element,term,description){if(!element||element.querySelector('.term-help'))return;const details=document.createElement('details');details.className='term-help';const button=document.createElement('summary');button.textContent='i';button.setAttribute('aria-label',term);const text=document.createElement('span');text.textContent=description;details.append(button,text);element.after(details);}
  help(document.querySelector('.intro h1'),'Marine heatwave','At least five days above the seasonally varying local 90th-percentile temperature threshold.');
  help(document.querySelector('.variation-card .small-tag'),'Shapley R²','Allocates the fitted variation among predictors while sharing credit between correlated indices.');
  help($('modelCv').parentElement,'Leave-one-year-out R²','Fits each year using the other years; negative scores mean poorer fit than the reference mean.');
  help($('pointSkill').parentElement,'Brier skill','Compares probability errors with the historical-probability baseline; positive is better.');
  help($('outlookDefinition'),'90th-percentile threshold','A temperature exceeded on about one in ten baseline days for the same time of year.');
  help($('outlookSubtitle'),'Lead time','The interval from forecast issue to the start of the predicted season.');
  help($('outlookDates'),'Backtest','Recreates past forecasts using only data available before each test season.');
  const pointBar=document.createElement('div');pointBar.id='pointProbabilityBar';pointBar.className='point-probability-bar';$('pointOutlookPeriod').after(pointBar);
  async function probability(){if(document.documentElement.dataset.ready!=='true')return;const d=AtlasUI.snapshot(),pixel=d.state.pixel,f=await AtlasUI.forecast(d.state.product,pixel);if(!f||pixel!==AtlasUI.snapshot().state.pixel)return;pointBar.replaceChildren();const track=document.createElement('div');track.className='probability-track';track.innerHTML=`<span style="width:${f.probability*100}%"></span><i style="left:${f.baseline*100}%" title="Historical baseline"></i>`;const text=document.createElement('span');text.textContent='Model probability · marker: historical baseline';pointBar.append(track,text);}
  for(const event of ['atlasready','atlaspixelchange','atlaslanguagechange'])window.addEventListener(event,probability);
})();

;
/* Curated, editable source catalogues; pagination is ten papers at a time. */
(() => {
  const $=id=>document.getElementById(id),T=s=>AtlasLanguage.current!=='en'?AtlasLanguage.translate(s):s;
  let papers,news,pp=0,np=0,paperTimer,newsTimer;
  function link(url,text){const a=document.createElement('a');a.href=url;a.textContent=text;a.target='_blank';a.rel='noopener';return a;}
  function renderPapers(){if(!papers)return;const rows=papers.items.filter(p=>$('paperTopic').value==='all'||p.topic===$('paperTopic').value),pages=Math.max(1,Math.ceil(rows.length/10));pp=(pp+pages)%pages;
    $('paperList').replaceChildren(...rows.slice(pp*10,pp*10+10).map((p,k)=>{const article=document.createElement('article');article.className='paper-row';const no=document.createElement('span');no.className='paper-number';no.textContent=String(pp*10+k+1).padStart(2,'0');const body=document.createElement('div'),title=document.createElement('h3'),meta=document.createElement('p'),topic=document.createElement('span');title.append(link(p.url,T(p.title)));meta.dataset.noI18n='';meta.textContent=`${p.journal} · ${p.year}`;topic.className='paper-topic';topic.textContent=T({regional:'Regional heatwaves',habitats:'Habitat impacts',methods:'Methods and drivers',forecast:'Forecasting'}[p.topic]);body.append(topic,title,meta);article.append(no,body);return article;}));$('papersPosition').textContent=`${pp+1} / ${pages}`;$('papersPrev').disabled=$('papersNext').disabled=pages<2;$('paperUpdated').textContent=T('Publisher metadata verified')+' · '+papers.checked+' · '+rows.length+' '+T('published papers');}
  function renderNews(){if(!news)return;const rows=[...news.items].sort((a,b)=>b.date.localeCompare(a.date)),pages=Math.max(1,Math.ceil(rows.length/3));np=(np+pages)%pages;$('newsList').replaceChildren(...rows.slice(np*3,np*3+3).map(item=>{const article=document.createElement('article'),date=document.createElement('div'),h=document.createElement('h3'),p=document.createElement('p');article.className='news-item';date.className='news-date';date.textContent=`${item.source} · ${item.date}`;h.append(link(item.url,T(item.title)));p.textContent=T(item.summary);const source=link(item.url,T('Read at source'));source.className='news-source';article.append(date,h,p,source);return article;}));$('newsPosition').textContent=`${np+1} / ${pages}`;$('newsUpdated').textContent=T('Source catalogue checked')+' · '+news.checked;}
  $('papersPrev').onclick=()=>{pp--;renderPapers();};$('papersNext').onclick=()=>{pp++;renderPapers();};$('paperTopic').onchange=()=>{pp=0;renderPapers();};$('newsPrev').onclick=()=>{np--;renderNews();};$('newsNext').onclick=()=>{np++;renderNews();};
  function pause(){clearInterval(paperTimer);clearInterval(newsTimer);paperTimer=newsTimer=null;$('papersPlay').textContent='Play paper slideshow';$('newsPlay').textContent='Play news slideshow';}
  $('papersPlay').onclick=()=>{if(paperTimer){clearInterval(paperTimer);paperTimer=null;$('papersPlay').textContent='Play paper slideshow';return;}paperTimer=setInterval(()=>{if(!document.hidden){pp++;renderPapers();}},12000);$('papersPlay').textContent='Pause slideshow';};$('newsPlay').onclick=()=>{if(newsTimer){clearInterval(newsTimer);newsTimer=null;$('newsPlay').textContent='Play news slideshow';return;}newsTimer=setInterval(()=>{if(!document.hidden){np++;renderNews();}},9000);$('newsPlay').textContent='Pause slideshow';};document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});window.addEventListener('atlasmotionchange',()=>{if(document.documentElement.dataset.motion==='off')pause();});window.addEventListener('atlaslanguagechange',()=>{renderPapers();renderNews();});
  Promise.all(['papers','news'].map(name=>fetch(`./content/${name}.json?v=20261018-ui`).then(r=>{if(!r.ok)throw Error('Source catalogue unavailable');return r.json();}))).then(([p,n])=>{papers=p;news=n;const translations={};for(const item of [...p.items,...n.items]){translations[item.title]=item.titleAr;if(item.summary)translations[item.summary]=item.summaryAr;}AtlasLanguage.add(translations);renderPapers();renderNews();});
})();

;
/* Atlas identity, themes, SVG controls and optional presentation motion. */
(() => {
  const $=id=>document.getElementById(id),root=document.documentElement,reduce=matchMedia('(prefers-reduced-motion: reduce)'),T=s=>AtlasLanguage.current!=='en'?AtlasLanguage.translate(s):s;
  const paths={download:'M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5',fit:'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M12 8v8m-4-4h8',play:'m8 4 12 8-12 8z',pause:'M8 4v16M16 4v16',close:'m5 5 14 14M19 5 5 19',left:'m14 5-7 7 7 7M7 12h14',right:'m10 5 7 7-7 7M17 12H3',moon:'M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11',sun:'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0'};
  function svg(key){const node=document.createElementNS('http://www.w3.org/2000/svg','svg');node.setAttribute('viewBox','0 0 24 24');node.setAttribute('aria-hidden','true');node.setAttribute('focusable','false');node.classList.add('ui-icon');const path=document.createElementNS(node.namespaceURI,'path');path.setAttribute('d',paths[key]);node.append(path);return node;}
  function icons(){for(const [selector,key] of [['#fitMap','fit'],['#mapDownload','download'],['#photoPrev,#photoBack,#tourBackIcon,#papersPrev,#newsPrev','left'],['#photoNext,#photoForward,#papersNext,#newsNext,#locateForm button','right'],['#photoClose,#methodsClose,#filtersClose,#selectionClose,.pin button','close'],['#play',window.AtlasDebug?.state?.timer?'pause':'play']]){for(const el of document.querySelectorAll(selector)){if(el.querySelector('svg'))continue;el.replaceChildren(svg(key));}}}
  const motionButton=document.createElement('button');motionButton.id='motionToggle';motionButton.className='theme-button';motionButton.type='button';$('themeToggle').before(motionButton);
  let theme='light',motion=!reduce.matches;try{theme=localStorage.getItem('atlas-theme')||'light';if(localStorage.getItem('atlas-motion')==='off')motion=false;}catch{}
  function applyTheme(){root.dataset.theme=theme;$('themeToggle').textContent=theme==='dark'?'Day view':'Night view';$('themeToggle').setAttribute('aria-pressed',String(theme==='dark'));$('themeToggle').setAttribute('aria-label',T(theme==='dark'?'Day view':'Night view'));$('themeToggle').prepend(svg(theme==='dark'?'sun':'moon'));try{localStorage.setItem('atlas-theme',theme);}catch{}document.querySelector('meta[name=theme-color]').content=theme==='dark'?'#10232e':'#f4efe4';charts();}
  $('themeToggle').onclick=()=>{theme=theme==='dark'?'light':'dark';applyTheme();};
  function applyMotion(){root.dataset.motion=motion&&!reduce.matches?'on':'off';motionButton.textContent=root.dataset.motion==='on'?'Pause motion':'Enable motion';motionButton.setAttribute('aria-pressed',String(root.dataset.motion==='on'));motionButton.disabled=reduce.matches;motionButton.prepend(svg(root.dataset.motion==='on'?'pause':'play'));try{localStorage.setItem('atlas-motion',motion?'on':'off');}catch{}window.dispatchEvent(new Event('atlasmotionchange'));}
  motionButton.onclick=()=>{motion=!motion;applyMotion();};reduce.addEventListener('change',applyMotion);
  const originalLines=new WeakMap();
  function palette(plot){if(plot._paletteBusy)return;const dark=theme==='dark',map={'#355c7d':'#86a9c8','#8b5a46':'#c8977f','#57755b':'#95b49a','#78658a':'#b5a0c8','#9b813e':'#cbb56e','#4c8183':'#89b8ba','#956477':'#c99aaf','#646b73':'#aab2ba','#a16f32':'#d0a768','#6c789d':'#a5b1d4','#85934c':'#b4c67b','#995454':'#cf9292','#253444':'#d8e3e8','#34465b':'#d8e3e8','#1768ac':'#8bc7e9','#245e88':'#8bc7e9','#386b7a':'#8bc7e9','#a4663d':'#e4ae83','rgba(41,92,134,.23)':'rgba(139,199,233,.35)','#8e9e8c':'#c6c3a9','#b15b35':'#e4ae83'},colours=(plot.data||[]).map(trace=>{if(!originalLines.has(trace))originalLines.set(trace,trace.line?.color);const original=originalLines.get(trace);return dark?(map[original]||original):original;});if(!colours.some((color,i)=>color&&plot.data[i].line?.color!==color))return;plot._paletteBusy=true;Plotly.restyle(plot,{'line.color':colours}).finally(()=>plot._paletteBusy=false);}
  function chartTheme(plot){if(window.AtlasReportRendering||plot.dataset.reportChart)return;if(!plot.layout||!plot._fullLayout)return;palette(plot);const dark=theme==='dark',fg=dark?'#cad8de':'#50616a',grid=dark?'#334550':'#d9d5ca',family=AtlasLanguage.current==='ar'?'Noto Sans Arabic, sans-serif':'Inter, sans-serif';if(plot.layout.font?.color===fg&&plot.layout.font?.family===family)return;Plotly.relayout(plot,{'font.color':fg,'font.family':family,'xaxis.gridcolor':grid,'yaxis.gridcolor':grid,'xaxis.zerolinecolor':grid,'yaxis.zerolinecolor':grid,'hoverlabel.bgcolor':dark?'#1a303e':'#fffdf7','hoverlabel.font.color':dark?'#f7f0df':'#233d4c','hoverlabel.bordercolor':grid,'legend.font.color':fg});}
  function charts(){for(const plot of document.querySelectorAll('.js-plotly-plot')){if(!plot.on)continue;if(!plot.dataset.themeBound){plot.dataset.themeBound='true';plot.on('plotly_afterplot',()=>chartTheme(plot));}chartTheme(plot);}}
  const observer=new MutationObserver(()=>{if(observer.queued)return;observer.queued=true;requestAnimationFrame(()=>{observer.queued=false;icons();charts();});});observer.observe(document.body,{subtree:true,childList:true});
  const reveal=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('revealed');reveal.unobserve(entry.target);}},{threshold:.08});for(const el of document.querySelectorAll('.analysis-section .chart-card,.resources-section,.habitat-gallery')){el.classList.add('reveal-panel');reveal.observe(el);}
  function photographicStory(){if(document.querySelector('.habitat-story'))return;const p=window.AtlasPhotos?.photos.find(p=>p.id==='bleaching-great-barrier');if(!p)return;const section=document.createElement('section');section.className='habitat-story';const a=document.createElement('a');a.href='./images/'+p.file;a.append(AtlasPhotos.picture(p));a.onclick=e=>{e.preventDefault();AtlasPhotos.open(AtlasPhotos.photos.indexOf(p),a);};const body=document.createElement('div');body.innerHTML='<span class="eyebrow">WHEN HEAT PERSISTS</span><h2>A warmer season can leave a lasting mark</h2><p>Coral bleaching can follow prolonged heat stress. These comparison photographs were taken outside the atlas basins.</p>';const location=document.createElement('p');location.className='story-location';location.textContent=AtlasLanguage.current==='ar'?p.locationAr:p.location;location.dataset.location='true';body.append(location,AtlasPhotos.credit(p));section.append(a,body);$('connections').before(section);}
  window.addEventListener('atlasphotosready',photographicStory);
  const second=document.createElement('picture');second.className='hero-image hero-alternate';second.innerHTML='<source type="image/avif" srcset="./images/responsive/redsea-reef-fish-960.avif 960w, ./images/responsive/redsea-reef-fish-1600.avif 1600w" sizes="100vw"><img src="./images/responsive/redsea-reef-fish-960.jpg" width="7713" height="5142" loading="lazy" decoding="async" alt="Reef and fish at Ras Muhammad, Red Sea">';
  function delayedHero(){if(root.dataset.motion==='on'&&!second.isConnected)document.querySelector('.photo-intro').prepend(second);}
  for(const event of ['pointerdown','keydown','scroll'])window.addEventListener(event,delayedHero,{once:true,passive:true});
  let scrollPending=false;window.addEventListener('scroll',()=>{if(scrollPending||root.dataset.motion!=='on')return;scrollPending=true;requestAnimationFrame(()=>{scrollPending=false;const hero=document.querySelector('.photo-intro'),box=hero.getBoundingClientRect();if(box.bottom>0&&box.top<innerHeight)hero.style.setProperty('--parallax',`${Math.max(-12,Math.min(12,-box.top*.025))}px`);});},{passive:true});
  let mapFade;window.addEventListener('atlasmapyearchange',()=>{if(root.dataset.motion!=='on')return;const canvas=document.querySelector('.habitat-canvas');if(!canvas)return;mapFade?.cancel();mapFade=canvas.animate([{opacity:.62},{opacity:1}],{duration:230,easing:'ease-out'});});
  window.addEventListener('atlasready',()=>{icons();charts();photographicStory();});window.addEventListener('atlaslanguagechange',()=>{applyTheme();applyMotion();const location=document.querySelector('[data-location]'),p=AtlasPhotos?.photos.find(p=>p.id==='bleaching-great-barrier');if(location&&p){location.textContent=AtlasLanguage.current==='ar'?p.locationAr:p.location;const image=document.querySelector('.habitat-story img');if(image)image.alt=AtlasLanguage.current==='ar'?p.titleAr+' · '+p.locationAr:p.title+' · '+p.location;}});
  window.addEventListener('atlasreportcomplete',charts);
  applyTheme();applyMotion();icons();
})();

;
/* Geography, rectangle entry, richer point history and seasonal line views. */
(() => {
  const $=id=>document.getElementById(id),T=s=>AtlasLanguage.translate(s);
  const atlas=document.querySelector('.atlas-layout');atlas.after(document.querySelector('.photo-intro'));atlas.insertBefore(document.querySelector('.explore-tools'),document.querySelector('.pixel-panel'));
  const entry=document.createElement('div');entry.id='areaEntry';entry.className='area-entry';entry.innerHTML='<span class="eyebrow">START WITH A PLACE</span><h2>Choose an area on the map</h2><p>Draw a rectangle, or choose a study area below. Then select a habitat cell.</p><div class="area-actions"><button id="beginRectangle" class="button primary">Draw a rectangle</button><button id="enterExtent" class="button outline">Use map view</button><button id="enterAll" class="button outline">Explore all areas</button></div><div id="areaChoices" class="area-choices"></div>';
  document.querySelector('.map-card').append(entry);
  const footprint=document.createElement('p');footprint.id='footprintNote';footprint.className='detail-note';document.querySelector('.source-cell').append(footprint);
  function sourceNote(){if(document.documentElement.dataset.ready!=='true')return;const d=AtlasUI.snapshot(),east=d.meta.basins.find(b=>b.id==='eastasia'),notes=[];if(east?.regions.includes(d.point[3])){if(d.point[2]&2)notes.push('Seagrass footprint: modelled areas for three Zostera species.');if(d.point[2]&8)notes.push('Kelp and seaweed footprint: recorded occurrence locations.');}footprint.textContent=notes.map(T).join(' ');footprint.hidden=!notes.length;}
  for(const e of ['atlasready','atlaspixelchange','atlaslanguagechange'])window.addEventListener(e,sourceNote);
  const reset=document.createElement('button');reset.id='chooseArea';reset.type='button';reset.textContent='Choose another area';reset.className='button outline';document.querySelector('.explore-tools').prepend(reset);
  const clear=document.createElement('button');clear.id='clearArea';clear.type='button';clear.textContent='Clear rectangle';clear.className='button outline';document.querySelector('.explore-tools').append(clear);clear.hidden=true;
  function close(){entry.hidden=true;$('clearArea').hidden=!AtlasUI.snapshot().state.selection;AtlasUI.map.invalidateSize();}
  function init(){
    const d=AtlasUI.snapshot();$('areaChoices').replaceChildren(...d.meta.basins.map(b=>{const button=document.createElement('button');button.type='button';button.textContent=b.name;button.onclick=()=>{$('basin').value=b.id;$('basin').dispatchEvent(new Event('change'));AtlasUI.selectBounds(L.latLngBounds(b.bounds));close();};return button;}));
    const east=d.meta.basins.find(b=>b.id==='eastasia');
    if(east){const regionSet=new Set(east.regions),Coverage=L.Layer.extend({onAdd(map){this.map=map;this.canvas=L.DomUtil.create('canvas','east-habitat-coverage');this.canvas.style.cssText='position:absolute;pointer-events:none';map.getPane('habitatCoverage').append(this.canvas);map.on('moveend zoomend resize',this.draw,this);this.draw();},draw(){const map=this.map,size=map.getSize(),ratio=devicePixelRatio||1,canvas=this.canvas,ctx=canvas.getContext('2d');canvas.width=size.x*ratio;canvas.height=size.y*ratio;canvas.style.width=size.x+'px';canvas.style.height=size.y+'px';L.DomUtil.setPosition(canvas,map.containerPointToLayerPoint([0,0]));ctx.scale(ratio,ratio);const d=AtlasUI.snapshot(),bounds=map.getBounds(),colours=['#bd724d','#478493','#4d8659','#93804e'],enabled=d.meta.habitats.map(h=>document.querySelector(`input[name="coverage"][value="${h}"]`)?.checked!==false),step=Math.max(2,Math.abs(map.latLngToContainerPoint([20,120.01]).x-map.latLngToContainerPoint([20,120]).x));ctx.globalAlpha=.7;for(const p of d.pixels){if(!regionSet.has(p[3])||!AtlasUI.visible(p)||!bounds.contains([p[1],p[0]]))continue;const h=d.meta.habitats.findIndex((_,i)=>enabled[i]&&(p[2]&(1<<i)));if(h<0)continue;const q=map.latLngToContainerPoint([p[1],p[0]]);ctx.fillStyle=colours[h];ctx.fillRect(q.x-step/2,q.y-step/2,step,step);}}});const layer=new Coverage().addTo(AtlasUI.map);for(const input of document.querySelectorAll('input[name="coverage"]'))input.addEventListener('change',()=>layer.draw());for(const event of ['atlaspixelchange','atlasselectionchange'])window.addEventListener(event,()=>layer.draw());for(const id of ['basin','region'])$(id).addEventListener('change',()=>layer.draw());for(const input of document.querySelectorAll('input[name="habitat"]'))input.addEventListener('change',()=>layer.draw());}
    const params=new URLSearchParams(location.search);entry.hidden=params.has('lat')&&params.get('choose')!=='1';
    $('beginRectangle').onclick=()=>{entry.hidden=true;if($('drawBox').getAttribute('aria-pressed')!=='true')$('drawBox').click();};
    $('enterExtent').onclick=()=>{AtlasUI.selectBounds(AtlasUI.map.getBounds());close();};$('enterAll').onclick=()=>{$('basin').value='all';$('basin').dispatchEvent(new Event('change'));AtlasUI.selectBounds(null);close();};
    $('chooseArea').onclick=()=>{entry.hidden=false;$('basin').value='all';$('basin').dispatchEvent(new Event('change'));AtlasUI.selectBounds(null);$('map').scrollIntoView({block:'center',behavior:'auto'});};
    $('clearArea').onclick=()=>{AtlasUI.selectBounds(null);clear.hidden=true;};
    AtlasUI.map.invalidateSize();
    // Touch and keyboard users can enter exact rectangle corners.
    const form=document.createElement('form');form.id='rectangleForm';form.innerHTML='<details><summary>Enter rectangle corners</summary><div class="rectangle-fields"><label>South<input name="south" type="number" step="any" min="-90" max="90" required value="0"></label><label>West<input name="west" type="number" step="any" min="-180" max="180" required value="110"></label><label>North<input name="north" type="number" step="any" min="-90" max="90" required value="55"></label><label>East<input name="east" type="number" step="any" min="-180" max="180" required value="160"></label><button type="submit">Use rectangle</button></div></details>';
    entry.append(form);form.onsubmit=e=>{e.preventDefault();const f=new FormData(form),s=+f.get('south'),w=+f.get('west'),n=+f.get('north'),a=+f.get('east');if(s>=n||w>=a)return;const bounds=L.latLngBounds([s,w],[n,a]);AtlasUI.selectBounds(bounds);AtlasUI.map.fitBounds(bounds);close();};
  }
  window.addEventListener('atlasready',init);window.addEventListener('atlasboxdrawn',close);window.addEventListener('atlasselectionchange',()=>clear.hidden=!AtlasUI.snapshot().state.selection);
  // A vector calendar retains every saved month without separate number panels.
  const history=document.createElement('div');history.id='historyDetails';history.innerHTML='<figure class="monthly-figure"><figcaption><h3>Heatwave days by month and year</h3><button id="saveCalendarSvg" class="text-button">Save SVG</button></figcaption><div id="monthCalendar" class="calendar-view"></div><p id="calendarCaption" class="detail-note"></p></figure>';$('historyPlot').closest('.chart-card').after(history);
  let historyToken=0,historyVisible=false,currentSvg;const historyObserver=new IntersectionObserver(entries=>{historyVisible=entries[0].isIntersecting;if(historyVisible)richHistory();},{rootMargin:'300px'});historyObserver.observe(history);
  async function richHistory(){if(!historyVisible||document.documentElement.dataset.ready!=='true')return;const ticket=++historyToken,d=AtlasUI.snapshot();try{const data=await AtlasDetails.load(d.state.pixel,d.state.product);if(ticket!==historyToken)return;const years=d.meta.products[d.state.product].years.filter(y=>y>=d.state.from&&y<=d.state.to),w=1100,left=58,top=58,cellWidth=78,rowHeight=17,h=top+years.length*rowHeight+35,colours=['#ffffff','#e8edf1','#ccd9e3','#a2b9ca','#7395af','#476e8d','#23465f'],colour=v=>v===null?'#f5f5f5':colours[v===0?0:Math.min(6,Math.ceil(v/5))],ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.setAttribute('xmlns',ns);svg.setAttribute('role','img');svg.setAttribute('aria-label',T('Heatwave days by month and year'));svg.style.fontFamily='Arial, sans-serif';
      const add=(name,attributes,text,parent=svg)=>{const el=document.createElementNS(ns,name);for(const [k,v] of Object.entries(attributes))el.setAttribute(k,String(v));if(text!==undefined)el.textContent=text;parent.append(el);return el;};add('rect',{width:w,height:h,fill:'#fff'});add('text',{x:left,y:17,'font-size':12,fill:'#333'},`${d.meta.products[d.state.product].name} · ${d.point[1].toFixed(2)}°N, ${d.point[0].toFixed(2)}°E`);
      for(let m=0;m<12;m++)add('text',{x:left+(m+.5)*cellWidth,y:43,'font-size':12,'text-anchor':'middle',fill:'#333'},new Intl.DateTimeFormat(AtlasLanguage.current,{month:'short'}).format(new Date(2020,m,15)));
      for(let j=0;j<years.length;j++){const year=years[j];add('text',{x:left-9,y:top+j*rowHeight+12,'font-size':11,'text-anchor':'end',fill:'#333'},year);for(let m=0;m<12;m++){const key=`${year}-${String(m+1).padStart(2,'0')}`,i=data.monthly.dates.findIndex(s=>s.startsWith(key)),v=i<0?null:data.monthly.values[i],rect=add('rect',{x:left+m*cellWidth,y:top+j*rowHeight,width:cellWidth,height:rowHeight,fill:colour(v),stroke:'#dce2e6','stroke-width':.4});add('title',{},`${key}: ${v??'—'} ${T('days')}`,rect);}}
      add('text',{x:1012,y:43,'font-size':11,fill:'#333'},T('days'));for(let k=0;k<7;k++){add('rect',{x:1012,y:top+k*24,width:16,height:24,fill:colours[k],stroke:'#ccc','stroke-width':.4});add('text',{x:1035,y:top+k*24+16,'font-size':11,fill:'#333'},k===0?'0':k===6?'26–31':`${(k-1)*5+1}–${k*5}`);}add('text',{x:left,y:h-9,'font-size':11,fill:'#555'},`${years[0]}–${years.at(-1)} · ${T('Monthly MHW days')}`);$('monthCalendar').replaceChildren(svg);currentSvg=svg;$('calendarCaption').textContent=T('Each square is one month. Hover for the day count.');
    }catch(error){$('calendarCaption').textContent=error.message;}}
  $('saveCalendarSvg').onclick=()=>{if(!currentSvg)return;const raw='<?xml version="1.0" encoding="UTF-8"?>\n'+new XMLSerializer().serializeToString(currentSvg),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([raw],{type:'image/svg+xml;charset=utf-8'}));a.download='monthly_heatwave_calendar.svg';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
  for(const e of ['atlasready','atlaspixelchange','atlasrangechange','atlaslanguagechange'])window.addEventListener(e,richHistory);
})();

;
/* Habitat figures share region colours; future segments show one seasonal probability. */
(() => {
  const $=id=>document.getElementById(id),T=s=>AtlasLanguage.translate(s);
  AtlasLanguage.add({'Right axis':'المحور الأيمن','None':'بدون','Save SVG':'حفظ SVG','Each square is one month. Hover for the day count.':'يمثل كل مربع شهراً واحداً. مرّر المؤشر لعرض عدد الأيام.','Solid lines: past tests. Dotted lines: next season. Each future segment is one probability for the whole season.':'الخطوط المتصلة: التحقق السابق. المنقطة: الموسم القادم. يمثل كل مقطع مستقبلي احتمالاً واحداً للموسم كله.','Click a region to hide or show its line':'اضغط على الإقليم لإخفاء خطه أو إظهاره'});
  const palette=['#355c7d','#8b5a46','#57755b','#78658a','#9b813e','#4c8183','#956477','#646b73','#a16f32','#6c789d','#85934c','#995454'];
  let rows=[],token=0,busy=false,pending=false;const figures=new Map();
  const old=$('outlookTimeline').closest('.chart-card');old.hidden=true;old.style.display='none';
  document.querySelector('#outlook .outlook-note').textContent='Solid lines: past tests. Dotted lines: next season. Each future segment is one probability for the whole season.';
  async function draw(){
    const ticket=token,d=AtlasUI.snapshot(),host=$('outlookCards');
    host.className='habitat-outlook-figures';
    for(const figure of figures.values())figure.hidden=true;
    let empty=host.querySelector('.empty-season');if(!empty){empty=document.createElement('p');empty.className='empty-season detail-note';host.append(empty);}empty.textContent=T('Select a habitat to show its seasonal curves.');empty.hidden=rows.length>0;
    const groups=new Map();for(const row of rows.filter(Boolean)){if(!groups.has(row.habitat))groups.set(row.habitat,[]);groups.get(row.habitat).push(row);}
    const regions=[...new Set(d.outlook.targets.filter(t=>t.available).map(t=>t.region))].sort();
    let letter=0;
    for(const [habitat,items] of groups){
      let figure=figures.get(habitat);if(!figure){figure=document.createElement('figure');figure.className='habitat-outlook-figure';figures.set(habitat,figure);host.append(figure);}figure.hidden=false;
      const caption=document.createElement('figcaption'),title=document.createElement('h3'),save=document.createElement('button');
      title.textContent=`${String.fromCharCode(97+letter++)}. ${T(({coral:'Coral reefs',seagrass:'Seagrass',mangrove:'Mangroves',kelp_macroalgae:'Kelp & seaweeds'})[habitat]||habitat)}`;
      save.className='text-button';save.textContent=T('Save SVG');save.type='button';caption.append(title,save);
      let plot=figure.querySelector('.habitat-outlook-plot');if(!plot){plot=document.createElement('div');plot.className='habitat-outlook-plot';}
      const key=document.createElement('div');key.className='region-line-key';key.setAttribute('aria-label',T('Ecoregion'));
      figure.querySelector('figcaption')?.remove();figure.querySelector('.region-line-key')?.remove();figure.prepend(caption);figure.append(plot,key);
      const traces=[];
      for(const row of items){
        let predictions=row.backtest.predictions;
        if(row.scope==='pixel'){
          const pred=await AtlasUI.array(row.product,'outlook_backtest_predictions');if(ticket!==token)return;
          predictions=row.testYears.map((year,k)=>({year,probability:pred[k*row.nativeCells+row.index]}));
        }
        const ri=Math.max(0,regions.indexOf(row.region)),color=palette[ri%palette.length],dash=ri>=palette.length?'dash':'solid';
        // The saved target year is the season-start year, including December for DJF.
        const dateForYear=year=>`${year}-${row.seasonStart.slice(5)}`;
        const group=`${habitat}:${row.region}`,indices=[traces.length,traces.length+1];
        traces.push({x:predictions.map(p=>dateForYear(p.year)),y:predictions.map(p=>p.probability*100),type:'scatter',mode:'lines+markers',name:T(row.region),legendgroup:group,showlegend:false,line:{color,width:1.4,dash},marker:{size:3},hovertemplate:'%{x|%Y-%m}: %{y:.1f}%<extra>'+T(row.region)+'</extra>'});
        traces.push({x:[row.seasonStart,row.seasonEnd],y:[row.probability*100,row.probability*100],type:'scatter',mode:'lines+markers',name:T(row.region)+' · '+T('Next-season estimate'),legendgroup:group,showlegend:false,line:{color,width:2.2,dash:'dot'},marker:{size:4},hovertemplate:'%{y:.1f}%<extra>'+T(row.region)+' · '+row.season+'</extra>'});
        const button=document.createElement('button');button.type='button';button.className='region-line-toggle';button.setAttribute('aria-pressed','true');
        const swatch=document.createElement('span');swatch.className='line-swatch';swatch.style.borderColor=color;swatch.style.borderTopStyle=ri>=palette.length?'dashed':'solid';
        const name=document.createElement('span');name.textContent=T(row.region);const value=document.createElement('span');value.className='region-probability';value.textContent=(row.probability*100).toFixed(1)+'%';
        button.append(swatch,name,value);button.title=T('Click a region to hide or show its line');
        button.onclick=()=>{const visible=button.getAttribute('aria-pressed')!=='true';button.setAttribute('aria-pressed',String(visible));Plotly.restyle(plot,{visible},indices);};key.append(button);
      }
      const first=items[0],dark=document.documentElement.dataset.theme==='dark',fg=dark?'#d6dee4':'#3b4650',grid=dark?'#334550':'#e5e8ea';
      await Plotly.react(plot,traces,{paper_bgcolor:'transparent',plot_bgcolor:'transparent',margin:{l:65,r:22,t:24,b:46},font:{family:'Arial, sans-serif',size:11,color:fg},hovermode:'closest',xaxis:{type:'date',tickformat:'%Y',showgrid:false,showline:true,linecolor:grid,zeroline:false},yaxis:{title:T('Probability (%)'),range:[0,100],dtick:20,gridcolor:grid,zeroline:false,showline:true,linecolor:grid},shapes:[{type:'rect',xref:'x',yref:'paper',x0:first.seasonStart,x1:first.seasonEnd,y0:0,y1:1,fillcolor:dark?'#ffffff0a':'#00000005',line:{width:0}}]},{responsive:true,displaylogo:false,toImageButtonOptions:{format:'svg',filename:`seasonal_${habitat}`}});
      if(ticket!==token)return;
      // SVG downloads include the region key inside the exported figure.
      save.onclick=async()=>{await Plotly.relayout(plot,{showlegend:true,legend:{orientation:'h',y:-.2,font:{size:10}},margin:{l:65,r:22,t:24,b:150}});await Plotly.restyle(plot,{showlegend:true},traces.map((_,i)=>i).filter(i=>i%2===0));try{await Plotly.downloadImage(plot,{format:'svg',filename:`seasonal_${habitat}`,width:1200,height:650});}finally{await Plotly.restyle(plot,{showlegend:false});await Plotly.relayout(plot,{showlegend:false,margin:{l:65,r:22,t:24,b:46}});}};
    }
  }
  async function schedule(){pending=true;token++;if(busy)return;busy=true;try{while(pending){pending=false;await draw();}}catch(error){console.error(error);}finally{busy=false;}}
  window.addEventListener('atlasoutlookchange',event=>{rows=event.detail.rows;schedule();});
  window.addEventListener('atlaslanguagechange',schedule);
})();
