/* Fully browser-local point reports. No coordinates/data are sent to a server. */
(() => {
  const ascii=s=>String(s).replace(/[–—−]/g,'-').replace(/°/g,' deg').replace(/σ/g,'SD');
  const num=(v,d=1)=>v===null||!Number.isFinite(v)?'-':Number(v).toFixed(d);
  const pct=v=>`${num(v*100,1)}%`;
  async function create(r){
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
    const scratch=document.createElement('div');scratch.style.cssText='position:fixed;left:-10000px;top:0;width:1100px;height:390px';document.body.append(scratch);
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
      const el=document.createElement('div');el.style.cssText='position:fixed;left:-10000px;top:0;width:1100px;height:400px';document.body.append(el);
      try{await Plotly.newPlot(el,traces,{width:1100,height:400,paper_bgcolor:'#fff',plot_bgcolor:'#fff',margin:{l:65,r:65,t:40,b:45},legend:{orientation:'h',y:1.15,font:{size:12}},font:{size:12,color:'#34465b'},...options},{staticPlot:true,displayModeBar:false});return await Plotly.toImage(el,{format:'png',width:1100,height:400,scale:1.4});}finally{Plotly.purge(el);el.remove();}
    }
    if(r.detail){
      doc.addPage();title('Daily temperature and monthly heatwave history',`${coordinate} | Daily OISST source ${r.detail.daily.cell[1]} N, ${r.detail.daily.cell[0]} E`);y=40;
      const cutoff=String(+r.detail.period[1].slice(0,4)-4),daily=r.detail.daily,keep=daily.dates.map((date,i)=>date>=cutoff?i:-1).filter(i=>i>=0),means=window.AtlasDetails.monthlyMeans(daily),mk=means.dates.map((date,i)=>date>=cutoff?i:-1).filter(i=>i>=0),monthly=r.detail.monthly,hk=monthly.dates.map((date,i)=>date>=cutoff?i:-1).filter(i=>i>=0);
      const dense=await extraChart([{x:keep.map(i=>daily.dates[i]),y:keep.map(i=>daily.values[i]),name:'Daily OISST',mode:'lines',line:{color:'rgba(36,94,136,.24)',width:.8}},{x:mk.map(i=>means.dates[i]),y:mk.map(i=>means.values[i]),name:'Monthly mean SST',mode:'lines',line:{color:'#245e88',width:2}},{x:hk.map(i=>monthly.dates[i]),y:hk.map(i=>monthly.values[i]),name:'Monthly MHW days',mode:'lines',yaxis:'y2',line:{color:'#b35b32',width:1.2}}],{xaxis:{type:'date'},yaxis:{title:'SST (degC)'},yaxis2:{title:'MHW days / month',overlaying:'y',side:'right',showgrid:false,rangemode:'tozero'}});
      doc.addImage(dense,'PNG',X,y,W,68);y+=74;y=para(`Daily observations: ${r.detail.period[0]} to ${r.detail.period[1]} (${daily.dates.length.toLocaleString('en')} dates). Figure shows the latest five years; all daily values can be downloaded from the atlas. Monthly MHW days use ${monthly.product} at the point's attached source cell.`,y,8);
      const last=monthly.dates.map((date,i)=>({date,i})).slice(-24);y=table(['Month','Observed mean SST (degC)','Observed MHW days'],last.map(d=>{const k=means.dates.indexOf(d.date);return [d.date.slice(0,7),num(means.values[k],2),num(monthly.values[d.i],0)];}),y,{styles:{fontSize:7,cellPadding:1.1}});
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
    if(y>190){doc.addPage();title('Sources, methods and contacts',coordinate);y=42;}
    y=heading('Sources and interpretation',y);
    y=para('SST: NASA/JPL GHRSST MUR v4.1 and NOAA OISST v2.1. Habitats: UNEP-WCMC study inventories. Climate: NOAA CPC, PSL and NCEI. The seasonal model uses Nino-3.4, NAO, AO, EAWR, North Atlantic SST anomaly and PDO. The IOD feed is delayed and is shown separately in the atlas.',y,8);
    y=para('High exposure exceeds the training same-season 80th percentile, with a 10-day floor. Every backtest refits using earlier seasons only, including thresholds, detrending, standardisation and regularisation. A source cell may be shared by several habitat locations. These results describe surface heatwave exposure, not species-specific damage.',y,8);
    y=heading('Contacts',y);y=para('Ahmed Eladawy, JAMSTEC: ahmed.eladawy@jamstec.go.jp',y,8);
    const pages=doc.getNumberOfPages();for(let page=1;page<=pages;page++){doc.setPage(page);doc.setDrawColor(215,222,230);doc.line(X,282,195,282);doc.setFont('helvetica','normal');doc.setFontSize(7);doc.setTextColor(...grey);doc.text('Red Sea & Arabian Gulf Habitat Heatwave Atlas | Ahmed Eladawy',X,287);doc.text(`${page} / ${pages}`,195,287,{align:'right'});}
    doc.setProperties({title:`MHW point report: ${coordinate}`,author:'Ahmed Eladawy',subject:'Habitat-cell history, seasonal probabilities and chronological validation'});
    doc.save(`MHW_${r.latitude.toFixed(2)}N_${r.longitude.toFixed(2)}E_${r.product.name.replaceAll(' ','_')}_report.pdf`);
  }
  window.AtlasReports={create};
})();
