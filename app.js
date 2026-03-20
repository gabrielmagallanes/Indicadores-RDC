// ═══════════════════════════════════════════════════════
// DATA — Marzo 2026
// ═══════════════════════════════════════════════════════
var tableData = {
  carteras:      { cols:['Cartera','PRO','OBJ','Variación %','Estado'],      editable:[0,1,2,3,4], rows:[['HORECA 1','1.10','1.00','+9.1%','✅ Cumplido (110.0%)'],['HORECA 3','1.03','1.00','+2.9%','✅ Cumplido (103.0%)'],['HORECA 4','1.04','1.00','+4.0%','✅ Cumplido (104.0%)'],['COMERCIO 2','1.27','1.00','+27.0%','✅ Cumplido (127.0%)'],['COMERCIO 5','1.32','1.00','+32.0%','✅ Cumplido (132.0%)']] },
  clima:         { cols:['Bimestre','PRO','OBJ','Estado'],                   editable:[0,1,2,3],   rows:[['1er BIM','0.95','0.97','⚠ Bajo obj. (97.9%)'],['2do BIM','—','0.97','Pendiente']] },
  productividad: { cols:['Mes','PRO 2026','PRO 2025','OBJ','Tendencia'],     editable:[0,1,2,3,4], rows:[['Marzo','0.86','0.70','—','↑ +22.8% vs 2025']] },
  conversion:    { cols:['Segmento','PRO','OBJ','Variación %','Estado'],     editable:[0,1,2,3,4], rows:[['HORECA 1','0.49','0.60','-22.4%','❌ No cumplido (81.7%)'],['HORECA 3','0.35','0.60','-41.7%','❌ No cumplido (58.3%)'],['HORECA 4','0.27','0.60','-55.0%','❌ No cumplido (45.0%)'],['COMERCIO 2','0.27','0.50','-46.0%','❌ No cumplido (54.0%)'],['COMERCIO 5','0.26','0.50','-48.0%','❌ No cumplido (52.0%)']] },
  visitas:       { cols:['Segmento','PRO','OBJ','Variación %'],              editable:[0,1,2,3],   rows:[['HORECA 1','0.95','1.00','-5.0%'],['HORECA 3','0.88','1.00','-12.0%'],['HORECA 4','0.91','1.00','-9.0%'],['COMERCIO 2','0.96','1.00','-4.0%'],['COMERCIO 5','0.94','1.00','-6.0%'],['SCLI','0.94','1.00','-6.0%']] },
  ventas:        { cols:['Categoría','PRO','OBJ','Estado'],                  editable:[0,1,2,3],   rows:[['FRESCOS','0.55','1.10','❌ No cumplido (50.0%)'],['MMCC','0.53','1.15','❌ No cumplido (46.1%)']] }
};
var tableIds = { carteras:'tbl-carteras', clima:'tbl-clima', productividad:'tbl-productividad', conversion:'tbl-conversion', visitas:'tbl-visitas', ventas:'tbl-ventas' };

// ═══════════════════════════════════════════════════════
// NAVEGACIÓN
// ═══════════════════════════════════════════════════════
var sectionTitles = { tables:'Tablas de Datos', dashboard:'Dashboard', summary:'Resumen Ejecutivo' };

function navigate(view) {
  document.querySelectorAll('.view').forEach(function(v){ v.classList.remove('active'); });
  document.querySelectorAll('.nav-item').forEach(function(n){ n.classList.remove('active'); });
  document.getElementById('view-'+view).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(function(n){
    if (n.getAttribute('onclick') && n.getAttribute('onclick').indexOf("'"+view+"'") !== -1) n.classList.add('active');
  });
  var tl = document.getElementById('topbar-label');
  if (tl) tl.textContent = sectionTitles[view];
  if (view === 'dashboard') { initCharts(); updateKPICards(); }
  if (view === 'summary')   { updateSummary(); }
}

// ─── Fecha ───
var daysArr   = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
var monthsArr = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
var now = new Date();
document.getElementById('date-chip').textContent = daysArr[now.getDay()]+' '+now.getDate()+' '+monthsArr[now.getMonth()]+' '+now.getFullYear();

// ═══════════════════════════════════════════════════════
// MODALES
// ═══════════════════════════════════════════════════════
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.modal-overlay').forEach(function(o){
  o.addEventListener('click', function(e){ if(e.target===o) o.classList.remove('open'); });
});

// ═══════════════════════════════════════════════════════
// RENDER TABLE
// ═══════════════════════════════════════════════════════
function computeEstado(pro, obj) {
  var p=parseFloat(pro), o=parseFloat(obj);
  if (isNaN(p)||isNaN(o)||o===0) return '<span style="color:var(--muted)">—</span>';
  var pct=(p/o)*100;
  return pct>=100
    ? '<span style="color:#17a55e;font-weight:700">✅ Cumplido ('+pct.toFixed(1)+'%)</span>'
    : '<span style="color:#cc3333;font-weight:700">❌ No cumplido ('+pct.toFixed(1)+'%)</span>';
}

function renderTableById(key) {
  var el=document.getElementById(tableIds[key]); if(!el) return;
  var tbody=el.querySelector('tbody');
  var td=tableData[key]; var html='';
  td.rows.forEach(function(row){
    var processed=row.slice();
    if (key==='carteras') {
      var pro=parseFloat(row[1]),obj=parseFloat(row[2]);
      if (!isNaN(pro)&&!isNaN(obj)&&obj!==0) {
        processed[3]=(((pro-obj)/obj)*100>=0?'+':'')+(((pro-obj)/obj)*100).toFixed(1)+'%';
        processed[4]=computeEstado(pro,obj);
      }
    }
    html+='<tr>'+processed.map(function(c){ return '<td>'+c+'</td>'; }).join('')+'</tr>';
  });
  tbody.innerHTML=html;
}

// ═══════════════════════════════════════════════════════
// EDITAR TABLA
// ═══════════════════════════════════════════════════════
function openEditModal() {
  document.getElementById('edit-table-select').value='';
  document.getElementById('edit-rows-container').innerHTML='';
  document.getElementById('btn-save-edit').style.display='none';
  document.getElementById('modal-edit').classList.add('open');
}

function loadEditRows() {
  var key=document.getElementById('edit-table-select').value;
  var container=document.getElementById('edit-rows-container');
  var btnSave=document.getElementById('btn-save-edit');
  if (!key) { container.innerHTML=''; btnSave.style.display='none'; return; }
  var td=tableData[key];
  var h='<div style="overflow-x:auto;margin-top:12px;border:1px solid var(--border);border-radius:10px;overflow:hidden"><table class="edit-table"><thead><tr>';
  td.cols.forEach(function(c){ h+='<th style="color:var(--accent5)">'+c+' ✏️</th>'; });
  h+='</tr></thead><tbody>';
  td.rows.forEach(function(row,ri){
    h+='<tr>';
    row.forEach(function(cell,ci){
      h+='<td><input class="edit-input" data-row="'+ri+'" data-col="'+ci+'" value="'+String(cell).replace(/"/g,'&quot;')+'"></td>';
    });
    h+='</tr>';
  });
  h+='</tbody></table></div><p style="font-size:.72rem;color:var(--muted);margin-top:8px">Edita cualquier celda y presiona Guardar Cambios.</p>';
  container.innerHTML=h;
  btnSave.style.display='inline-flex';
}

function saveEdit() {
  var key=document.getElementById('edit-table-select').value; if(!key) return;
  var td=tableData[key];
  document.querySelectorAll('#edit-rows-container .edit-input').forEach(function(inp){
    td.rows[parseInt(inp.dataset.row)][parseInt(inp.dataset.col)]=inp.value;
  });
  renderTableById(key);
  closeModal('modal-edit');
  showToast('💾 Tabla guardada correctamente');
}

// ═══════════════════════════════════════════════════════
// AGREGAR CUADROS
// ═══════════════════════════════════════════════════════
function openAddRowModal() {
  document.getElementById('addrow-table-select').value='';
  document.getElementById('addrow-form-container').innerHTML='';
  document.getElementById('btn-save-addrow').style.display='none';
  document.getElementById('modal-addrow').classList.add('open');
}

function loadAddRowForm() {
  var key=document.getElementById('addrow-table-select').value;
  var container=document.getElementById('addrow-form-container');
  var btnSave=document.getElementById('btn-save-addrow');
  if (!key) { container.innerHTML=''; btnSave.style.display='none'; return; }
  var td=tableData[key];
  var h='<div style="margin-top:14px;padding:16px;background:var(--surface2);border:1px solid var(--border);border-radius:10px">';
  h+='<p style="font-size:.75rem;color:var(--muted);margin-bottom:14px;font-weight:600;text-transform:uppercase;letter-spacing:.06em">Nueva fila — completa los campos</p>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px">';
  td.cols.forEach(function(col,ci){
    var isVal=ci===1, isObj=ci===2;
    var isEstado=td.cols.length>=4&&ci===td.cols.length-1;
    var lc=isVal?'var(--accent1)':isObj?'var(--accent5)':isEstado?'var(--muted)':'var(--accent6)';
    var itype=(isVal||isObj)?'number':'text';
    var oin=(isVal||isObj)?' oninput="addrowLive(this)"':'';
    var ro=isEstado?' readonly style="background:var(--surface);cursor:default;font-weight:600"':'';
    h+='<div><label style="font-size:.7rem;font-weight:600;color:'+lc+';text-transform:uppercase;letter-spacing:.06em;display:block;margin-bottom:5px">'+col+'</label>';
    h+='<input class="form-input" id="addrow-field-'+ci+'"'+(itype==='number'?' type="number" step="0.01"':'')+oin+ro+' placeholder="'+(isEstado?'Auto...':col)+'">';
    if (isEstado) h+='<span id="addrow-estado-preview" style="display:none;font-size:.72rem;margin-top:4px"></span>';
    h+='</div>';
  });
  h+='</div></div><p style="font-size:.72rem;color:var(--muted);margin-top:10px">La tabla tiene <strong>'+td.rows.length+'</strong> fila(s).</p>';
  container.innerHTML=h;
  btnSave.style.display='inline-flex';
}

function addrowLive(inp) {
  var v=parseFloat(document.getElementById('addrow-field-1')&&document.getElementById('addrow-field-1').value);
  var o=parseFloat(document.getElementById('addrow-field-2')&&document.getElementById('addrow-field-2').value);
  var prev=document.getElementById('addrow-estado-preview');
  var einp=document.getElementById('addrow-field-'+(document.getElementById('addrow-table-select').value&&tableData[document.getElementById('addrow-table-select').value]?tableData[document.getElementById('addrow-table-select').value].cols.length-1:3));
  if (prev&&einp&&!isNaN(v)&&!isNaN(o)&&o!==0) {
    var pct=(v/o)*100; var ok=pct>=100;
    var txt=ok?'Cumplido ('+pct.toFixed(1)+'%)':'No cumplido ('+pct.toFixed(1)+'%)';
    einp.value=txt; prev.textContent=txt;
    prev.style.color=ok?'#17a55e':'#cc3333'; prev.style.fontWeight='700'; prev.style.display='block';
  } else if (prev) { prev.style.display='none'; }
}

function saveAddRow() {
  var key=document.getElementById('addrow-table-select').value; if(!key) return;
  var td=tableData[key]; var newRow=[];
  td.cols.forEach(function(col,ci){
    var inp=document.getElementById('addrow-field-'+ci);
    var val=inp?inp.value.trim():'—';
    var isEstado=td.cols.length>=4&&ci===td.cols.length-1;
    if (isEstado) {
      var v=parseFloat(document.getElementById('addrow-field-1')&&document.getElementById('addrow-field-1').value);
      var o=parseFloat(document.getElementById('addrow-field-2')&&document.getElementById('addrow-field-2').value);
      if (!isNaN(v)&&!isNaN(o)&&o!==0) {
        var pct=(v/o)*100;
        val=pct>=100?'✅ Cumplido ('+pct.toFixed(1)+'%)':'❌ No cumplido ('+pct.toFixed(1)+'%)';
      }
    }
    newRow.push(val||'—');
  });
  td.rows.push(newRow);
  renderTableById(key);
  loadAddRowForm();
  showToast('✅ Fila agregada');
}

// ═══════════════════════════════════════════════════════
// CREAR TABLA
// ═══════════════════════════════════════════════════════
var selectedColor='var(--accent1)', selectedColorHex='#2e74e8', rowCounter=0;
var colorHexMap={'var(--accent1)':'#2e74e8','var(--accent2)':'#e8622a','var(--accent3)':'#17a55e','var(--accent4)':'#9b4fd4','var(--accent5)':'#c89a00','var(--accent6)':'#0fa8cc'};

function selectColor(el) {
  document.querySelectorAll('.color-opt').forEach(function(o){ o.classList.remove('selected'); });
  el.classList.add('selected');
  selectedColor=el.getAttribute('data-color');
  selectedColorHex=colorHexMap[selectedColor]||'#2e74e8';
}

function openCreateModal() {
  ['new-table-name','new-table-desc','new-col1','new-col2','new-col3','new-col4'].forEach(function(id){ document.getElementById(id).value=''; });
  selectedColor='var(--accent1)'; selectedColorHex='#2e74e8'; rowCounter=0;
  document.querySelectorAll('.color-opt').forEach(function(o,i){ o.classList.toggle('selected',i===0); });
  document.getElementById('dynamic-rows-container').innerHTML='';
  document.getElementById('dynamic-rows-section').style.display='none';
  document.getElementById('modal-create').classList.add('open');
}

function rebuildRowInputs() {
  document.getElementById('dynamic-rows-section').style.display='block';
  if (document.getElementById('dynamic-rows-container').children.length===0) addNewRowInput();
}

function addNewRowInput() {
  var c1=document.getElementById('new-col1').value.trim()||'Col 1';
  var c2=document.getElementById('new-col2').value.trim()||'Col 2';
  var c3=document.getElementById('new-col3').value.trim()||'Col 3';
  var c4=document.getElementById('new-col4').value.trim()||'Col 4';
  document.getElementById('dynamic-rows-section').style.display='block';
  var id=++rowCounter; var div=document.createElement('div');
  div.id='drow-'+id;
  div.style.cssText='background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:12px 14px;margin-bottom:10px';
  div.innerHTML='<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr 32px;gap:8px;align-items:center">'
    +'<div><span style="font-size:.68rem;font-weight:600;color:var(--muted);text-transform:uppercase;display:block;margin-bottom:4px">'+c1+'</span><input class="form-input" style="padding:6px 9px;font-size:.82rem" placeholder="Nombre..." data-col="0"></div>'
    +'<div><span style="font-size:.68rem;font-weight:600;color:var(--accent1);text-transform:uppercase;display:block;margin-bottom:4px">'+c2+'</span><input class="form-input" style="padding:6px 9px;font-size:.82rem" placeholder="0.00" type="number" step="0.01" data-col="1" oninput="liveEstadoRow(this)"></div>'
    +'<div><span style="font-size:.68rem;font-weight:600;color:var(--accent5);text-transform:uppercase;display:block;margin-bottom:4px">'+c3+'</span><input class="form-input" style="padding:6px 9px;font-size:.82rem" placeholder="0.00" type="number" step="0.01" data-col="2" oninput="liveEstadoRow(this)"></div>'
    +'<div><span style="font-size:.68rem;font-weight:600;color:var(--muted);text-transform:uppercase;display:block;margin-bottom:4px">'+c4+'</span><input class="form-input" style="padding:6px 9px;font-size:.82rem" placeholder="Auto..." data-col="3"></div>'
    +'<button onclick="removeRow('+id+')" style="background:rgba(220,60,60,.1);border:1px solid rgba(220,60,60,.2);color:#cc3333;border-radius:6px;cursor:pointer;padding:4px 8px;font-size:.9rem;margin-top:18px">✕</button>'
    +'</div>';
  document.getElementById('dynamic-rows-container').appendChild(div);
}

function removeRow(id) { var el=document.getElementById('drow-'+id); if(el) el.remove(); }

function liveEstadoRow(inp) {
  var rowDiv=inp.closest('[id^="drow-"]'); if(!rowDiv) return;
  var v=parseFloat(rowDiv.querySelector('[data-col="1"]').value);
  var o=parseFloat(rowDiv.querySelector('[data-col="2"]').value);
  var ei=rowDiv.querySelector('[data-col="3"]'); if(!ei) return;
  if (!isNaN(v)&&!isNaN(o)&&o!==0) {
    var pct=(v/o)*100;
    ei.value=pct>=100?'Cumplido ('+pct.toFixed(1)+'%)':'No cumplido ('+pct.toFixed(1)+'%)';
    ei.style.color=pct>=100?'#17a55e':'#cc3333'; ei.style.fontWeight='700';
  } else { ei.value=''; ei.style.color=''; ei.style.fontWeight=''; }
}

function saveCreate() {
  var name=document.getElementById('new-table-name').value.trim();
  if (!name) { showToast('⚠ Escribe un nombre'); return; }
  var col1=document.getElementById('new-col1').value.trim()||'Ítem';
  var col2=document.getElementById('new-col2').value.trim()||'Valor';
  var col3=document.getElementById('new-col3').value.trim()||'OBJ';
  var col4=document.getElementById('new-col4').value.trim()||'Estado';
  var parsedRows=[];
  document.querySelectorAll('#dynamic-rows-container > div').forEach(function(rowDiv){
    var ins=rowDiv.querySelectorAll('input'); var row=[];
    ins.forEach(function(i){ row.push(i.value.trim()||'—'); });
    if (row.length===4&&row[0]!=='—') parsedRows.push(row);
  });
  var ts=Date.now(); var tblId='tbl-custom-'+ts; var chartId='chart-custom-'+ts; var key='custom_'+ts;
  var rowsHtml=parsedRows.length
    ? parsedRows.map(function(r){
        var v=parseFloat(r[1]),o=parseFloat(r[2]);
        if (!isNaN(v)&&!isNaN(o)&&o!==0) { var pct=(v/o)*100; r[3]=pct>=100?'✅ Cumplido ('+pct.toFixed(1)+'%)':'❌ No cumplido ('+pct.toFixed(1)+'%)'; }
        return '<tr>'+r.map(function(c){ return '<td>'+c+'</td>'; }).join('')+'</tr>';
      }).join('')
    : '<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:20px">Sin filas — usa Agregar Cuadros</td></tr>';
  document.getElementById('custom-tables-container').insertAdjacentHTML('beforeend',
    '<div class="table-card" style="animation:fadeIn .3s ease"><div class="table-card-header">'
    +'<div class="table-card-title"><span class="dot" style="background:'+selectedColor+'"></span>'+name+'</div>'
    +'<span class="pill" style="background:rgba(23,165,94,.15);color:var(--accent3)">NUEVA</span></div>'
    +'<table id="'+tblId+'"><thead><tr><th>'+col1+'</th><th>'+col2+'</th><th>'+col3+'</th><th>'+col4+'</th></tr></thead>'
    +'<tbody>'+rowsHtml+'</tbody></table></div>');
  var labels=parsedRows.map(function(r){ return r[0]; });
  var vals  =parsedRows.map(function(r){ return parseFloat(r[1])||0; });
  var objs  =parsedRows.map(function(r){ return parseFloat(r[2])||null; });
  document.getElementById('custom-charts-container').insertAdjacentHTML('beforeend',
    '<div class="chart-grid full" style="animation:fadeIn .4s ease"><div class="chart-card">'
    +'<div class="chart-card-title"><span class="dot" style="background:'+selectedColor+'"></span>'+name+'</div>'
    +'<div class="chart-card-sub">'+col2+' vs '+col3+'</div>'
    +'<div style="position:relative;height:220px"><canvas id="'+chartId+'"></canvas></div></div></div>');
  setTimeout(function(){
    var ctx=document.getElementById(chartId); if(!ctx) return;
    var hex=selectedColorHex;
    var def={responsive:true,maintainAspectRatio:false,animation:{duration:800,easing:'easeInOutQuart',delay:function(c){return c.dataIndex*60;}},
      plugins:{legend:{display:false},tooltip:{backgroundColor:'#fff',borderColor:'#e2e6f0',borderWidth:1,titleColor:'#1a1f2e',bodyColor:'#8490a8',padding:10,cornerRadius:8}},
      scales:{x:{ticks:{color:'#8490a8',font:{size:11}},grid:{color:'rgba(226,230,240,0.6)'},border:{dash:[4,4]}},y:{ticks:{color:'#8490a8',font:{size:11},callback:function(v){return v.toFixed(2);}},grid:{color:'rgba(226,230,240,0.6)'},border:{dash:[4,4]}}}};
    var ds=[{label:col2,data:vals,backgroundColor:vals.map(function(v,i){var o=objs[i];return o?(v>=o?hex+'99':'#cc333399'):hex+'99';}),borderColor:vals.map(function(v,i){var o=objs[i];return o?(v>=o?hex:'#cc3333'):hex;}),borderWidth:2,borderRadius:6,maxBarThickness:36}];
    if (objs.some(function(v){return v!==null;})) ds.push({type:'line',label:col3,data:objs,borderColor:'#aaa',borderWidth:2,borderDash:[5,3],pointRadius:4,fill:false,tension:0});
    chartInstances['ck_'+chartId]=new Chart(ctx,{type:'bar',data:{labels:labels,datasets:ds},options:def});
  },80);
  tableData[key]={cols:[col1,col2,col3,col4],editable:[0,1,2,3],rows:parsedRows.length?parsedRows:[],hexColor:selectedColorHex};
  tableIds[key]=tblId;
  ['edit-table-select','addrow-table-select'].forEach(function(selId){
    var opt=document.createElement('option'); opt.value=key; opt.textContent=name;
    document.getElementById(selId).appendChild(opt);
  });
  closeModal('modal-create');
  setTimeout(function(){ navigate('dashboard'); reRenderCustomCharts(); updateKPICards(); updateSummary(); },100);
  showToast('✅ Tabla "'+name+'" creada con gráfico');
}

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════
function rowAvg(key, col) {
  var td=tableData[key]; if(!td) return 0;
  var s=0,n=0;
  td.rows.forEach(function(r){ var v=parseFloat(r[col]); if(!isNaN(v)){s+=v;n++;} });
  return n?s/n:0;
}

// ═══════════════════════════════════════════════════════
// DASHBOARD — GRÁFICOS
// ═══════════════════════════════════════════════════════
var chartInstances={};

function initCharts() {
  ['c1','c2','c3','c4','c5'].forEach(function(k){ if(chartInstances[k]){chartInstances[k].destroy();delete chartInstances[k];} });
  var animDef={duration:900,easing:'easeInOutQuart',delay:function(ctx){return ctx.dataIndex*60;}};
  function tip(){return{backgroundColor:'#fff',borderColor:'#e2e6f0',borderWidth:1,titleColor:'#1a1f2e',bodyColor:'#8490a8',padding:10,cornerRadius:8,callbacks:{label:function(ctx){var d=ctx.chart.data.datasets[1];var p='';if(d&&ctx.datasetIndex===0&&d.data){var o=d.data[ctx.dataIndex];if(o)p=' ('+(ctx.raw/o*100).toFixed(1)+'% OBJ)';}return ' '+ctx.dataset.label+': '+ctx.raw.toFixed(2)+p;}}};}
  function sc(){return{x:{ticks:{color:'#8490a8',font:{size:11}},grid:{color:'rgba(226,230,240,0.6)'},border:{dash:[4,4]}},y:{ticks:{color:'#8490a8',font:{size:11},callback:function(v){return v.toFixed(2);}},grid:{color:'rgba(226,230,240,0.6)'},border:{dash:[4,4]}}};}
  function mkLegend(id,ds){var canvas=document.getElementById(id);if(!canvas)return;var card=canvas.closest('.chart-card');if(!card)return;var ex=card.querySelector('.chart-legend');if(ex)ex.remove();var sub=card.querySelector('.chart-card-sub');if(!sub)return;var div=document.createElement('div');div.className='chart-legend';ds.forEach(function(d){var c=Array.isArray(d.borderColor)?d.borderColor[0]:(d.borderColor||'#aaa');var s=document.createElement('span');s.style.cssText='display:flex;align-items:center;gap:5px';var dash=d.borderDash?'border-top:2px dashed '+c+';width:14px;height:0':'width:10px;height:10px;border-radius:2px;background:'+c;s.innerHTML='<span style="'+dash+'"></span>'+d.label;div.appendChild(s);});sub.parentNode.insertBefore(div,sub.nextSibling);}

  function gd(key,lc,vc,oc){var td=tableData[key],labels=[],vals=[],objs=[];td.rows.forEach(function(r){var v=parseFloat(r[vc]),o=parseFloat(r[oc]);if(!isNaN(v)){labels.push(r[lc]);vals.push(v);objs.push(isNaN(o)?null:o);}});return{labels:labels,vals:vals,objs:objs};}

  // Carteras — horizontal bar, color por cumplimiento
  var dc=gd('carteras',0,1,2);
  var c1Ds=[{label:'PRO',data:dc.vals,backgroundColor:dc.vals.map(function(v,i){return(v>=(dc.objs[i]||1))?'rgba(23,165,94,.75)':'rgba(204,51,51,.7)';}),borderColor:dc.vals.map(function(v,i){return(v>=(dc.objs[i]||1))?'#17a55e':'#cc3333';}),borderWidth:2,borderRadius:5,maxBarThickness:24},{label:'OBJ',data:dc.objs,backgroundColor:'rgba(180,180,180,.2)',borderColor:'#bbb',borderWidth:1.5,borderRadius:5,maxBarThickness:24}];
  chartInstances.c1=new Chart(document.getElementById('chart-carteras'),{type:'bar',data:{labels:dc.labels,datasets:c1Ds},options:{responsive:true,maintainAspectRatio:false,animation:animDef,indexAxis:'y',plugins:{legend:{display:false},tooltip:tip()},scales:{x:{ticks:{color:'#8490a8',font:{size:11},callback:function(v){return v.toFixed(2);}},grid:{color:'rgba(226,230,240,.6)'},border:{dash:[4,4]}},y:{ticks:{color:'#1a1f2e',font:{size:11,weight:'500'}},grid:{display:false},border:{display:false}}}}});
  mkLegend('chart-carteras',c1Ds);

  // Conversión — bar + line
  var dconv=gd('conversion',0,1,2);
  var c2Ds=[{type:'bar',label:'PRO',data:dconv.vals,backgroundColor:'rgba(155,79,212,.65)',borderColor:'#9b4fd4',borderWidth:2,borderRadius:5,maxBarThickness:32,yAxisID:'y'},{type:'line',label:'OBJ',data:dconv.objs,borderColor:'#e8622a',borderWidth:2.5,borderDash:[6,3],pointRadius:5,pointBackgroundColor:'#e8622a',fill:false,tension:0,yAxisID:'y'}];
  chartInstances.c2=new Chart(document.getElementById('chart-conversion'),{type:'bar',data:{labels:dconv.labels,datasets:c2Ds},options:{responsive:true,maintainAspectRatio:false,animation:animDef,plugins:{legend:{display:false},tooltip:tip()},scales:sc()}});
  mkLegend('chart-conversion',c2Ds);

  // Visitas — donut
  var dv=gd('visitas',0,1,2);
  var visColors=['#2e74e8','#17a55e','#c89a00','#9b4fd4','#e8622a','#0fa8cc'];
  var c3Ds=[{label:'Visitas',data:dv.vals,backgroundColor:visColors.slice(0,dv.vals.length).map(function(c){return c+'cc';}),borderColor:visColors.slice(0,dv.vals.length),borderWidth:2,hoverOffset:10}];
  chartInstances.c3=new Chart(document.getElementById('chart-visitas'),{type:'doughnut',data:{labels:dv.labels,datasets:c3Ds},options:{responsive:true,maintainAspectRatio:false,animation:{duration:900},cutout:'60%',plugins:{legend:{display:false},tooltip:{backgroundColor:'#fff',borderColor:'#e2e6f0',borderWidth:1,titleColor:'#1a1f2e',bodyColor:'#8490a8',padding:10,cornerRadius:8,callbacks:{label:function(ctx){return ' '+ctx.label+': '+ctx.raw.toFixed(2)+' (OBJ 1.00)';}}}}}});
  mkLegend('chart-visitas',visColors.slice(0,dv.vals.length).map(function(c,i){return{label:dv.labels[i],borderColor:c};}));

  // Productividad — área
  var c4Ds=[{label:'PRO 2026',data:[null,null,0.86,null,null,null,null,null,null,null,null,null],borderColor:'#17a55e',backgroundColor:'rgba(23,165,94,.10)',tension:.4,fill:true,pointRadius:5,pointBackgroundColor:'#fff',pointBorderColor:'#17a55e',pointBorderWidth:2,pointHoverRadius:7},{label:'PRO 2025',data:[0.7,0.7,0.7,0.7,0.7,0.7,0.7,0.7,0.7,0.7,0.7,0.7],borderColor:'#8490a8',backgroundColor:'transparent',tension:.4,borderDash:[5,4],pointRadius:3,pointBackgroundColor:'#8490a8'}];
  chartInstances.c4=new Chart(document.getElementById('chart-prod'),{type:'line',data:{labels:['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Set','Oct','Nov','Dic'],datasets:c4Ds},options:{responsive:true,maintainAspectRatio:false,animation:animDef,plugins:{legend:{display:false},tooltip:tip()},scales:sc()}});
  mkLegend('chart-prod',c4Ds);

  // Radar
  var radarData=[rowAvg('carteras',1)/(rowAvg('carteras',2)||1)*100,rowAvg('clima',1)/0.97*100,rowAvg('productividad',1)/(rowAvg('productividad',2)||.70)*100,rowAvg('conversion',1)/(rowAvg('conversion',2)||.56)*100,rowAvg('visitas',1)*100,rowAvg('ventas',1)/(rowAvg('ventas',2)||1.13)*100].map(function(v){return parseFloat(v.toFixed(1));});
  chartInstances.c5=new Chart(document.getElementById('chart-radar'),{type:'radar',data:{labels:['Carteras','Clima','Productividad','Conversión','Visitas','Ventas'],datasets:[{label:'Cumplimiento (%)',data:radarData,backgroundColor:'rgba(46,116,232,.12)',borderColor:'#2e74e8',borderWidth:2,pointBackgroundColor:'#2e74e8',pointRadius:4,pointHoverRadius:6},{label:'Objetivo (100%)',data:[100,100,100,100,100,100],backgroundColor:'rgba(150,150,150,.06)',borderColor:'rgba(150,150,150,.4)',borderDash:[5,4],borderWidth:1.5,pointRadius:0}]},options:{responsive:true,maintainAspectRatio:false,animation:{duration:900},plugins:{legend:{display:false},tooltip:{backgroundColor:'#fff',borderColor:'#e2e6f0',borderWidth:1,titleColor:'#1a1f2e',bodyColor:'#8490a8',padding:10,cornerRadius:8}},scales:{r:{min:0,max:130,ticks:{stepSize:25,color:'#8490a8',backdropColor:'transparent',font:{size:10}},grid:{color:'rgba(226,230,240,.7)'},pointLabels:{color:'#1a1f2e',font:{size:12,weight:'500'}},angleLines:{color:'rgba(226,230,240,.7)'}}}}});
}

function reRenderCustomCharts() {
  Object.keys(tableData).forEach(function(key){
    if (!key.startsWith('custom_')) return;
    var td=tableData[key]; if(!td.chartId) return;
    var ctx=document.getElementById(td.chartId); if(!ctx) return;
    var ck='ck_'+td.chartId;
    if (chartInstances[ck]){chartInstances[ck].destroy();delete chartInstances[ck];}
    var labels=td.rows.map(function(r){return r[0];}); var vals=td.rows.map(function(r){return parseFloat(r[1])||0;}); var objs=td.rows.map(function(r){return parseFloat(r[2])||null;});
    var hex=td.hexColor||'#2e74e8';
    var ds=[{label:td.cols[1],data:vals,backgroundColor:vals.map(function(v,i){var o=objs[i];return o?(v>=o?hex+'99':'#cc333399'):hex+'99';}),borderColor:vals.map(function(v,i){var o=objs[i];return o?(v>=o?hex:'#cc3333'):hex;}),borderWidth:2,borderRadius:6,maxBarThickness:32}];
    if (objs.some(function(v){return v!==null;})) ds.push({type:'line',label:td.cols[2],data:objs,borderColor:'#aaa',borderWidth:2,borderDash:[5,3],pointRadius:4,fill:false,tension:0});
    chartInstances[ck]=new Chart(ctx,{type:'bar',data:{labels:labels,datasets:ds},options:{responsive:true,maintainAspectRatio:false,animation:{duration:800,easing:'easeInOutQuart'},plugins:{legend:{display:false},tooltip:{backgroundColor:'#fff',borderColor:'#e2e6f0',borderWidth:1,titleColor:'#1a1f2e',bodyColor:'#8490a8',padding:10,cornerRadius:8}},scales:{x:{ticks:{color:'#8490a8',font:{size:11}},grid:{color:'rgba(226,230,240,.6)'},border:{dash:[4,4]}},y:{ticks:{color:'#8490a8',font:{size:11},callback:function(v){return v.toFixed(2);}},grid:{color:'rgba(226,230,240,.6)'},border:{dash:[4,4]}}}}});
  });
}

// ═══════════════════════════════════════════════════════
// KPI CARDS
// ═══════════════════════════════════════════════════════
function updateKPICards() {
  var grid=document.getElementById('kpi-grid'); if(!grid) return;
  var colors=['var(--accent1)','var(--accent2)','var(--accent3)','var(--accent4)','var(--accent5)','var(--accent6)']; var ci=0;
  function nc(){return colors[ci++%colors.length];}
  function card(label,value,sub,trend,up,color){return '<div class="kpi-card" style="border-top:3px solid '+color+'"><div class="kpi-label">'+label+'</div><div class="kpi-value" style="color:'+color+'">'+value+'</div><div class="kpi-sub">'+sub+'</div><div class="kpi-trend '+(up?'up':'down')+'">'+trend+'</div></div>';}
  var html='';
  var crows=tableData['carteras'].rows; var cumpl=crows.filter(function(r){var p=parseFloat(r[1]),o=parseFloat(r[2])||1;return!isNaN(p)&&p>=o;}).length; var c=nc();
  html+=card('Carteras Activas',cumpl,cumpl+' de '+crows.length+' sobre objetivo',cumpl===crows.length?'↑ Todas cumplen OBJ':'↓ '+cumpl+'/'+crows.length+' cumplen',cumpl===crows.length,c);
  var climaV=rowAvg('clima',1);var climaD=((climaV/0.97)-1)*100;c=nc();
  html+=card('Clima Mandela',climaV.toFixed(2),'OBJ: 0.97',(climaD>=0?'↑ +':'↓ ')+climaD.toFixed(1)+'% vs OBJ',climaD>=0,c);
  var pv26=rowAvg('productividad',1)||0.86;var pv25=rowAvg('productividad',2)||0.70;var pm=pv25?((pv26-pv25)/pv25)*100:0;c=nc();
  html+=card('Productividad Media',pv26.toFixed(2),'vs '+pv25.toFixed(2)+' en 2025','↑ +'+pm.toFixed(1)+'% vs año anterior',true,c);
  var convV=rowAvg('conversion',1);var convO=rowAvg('conversion',2)||0.56;var convD=((convV/convO)-1)*100;c=nc();
  html+=card('Conversión Media',convV.toFixed(2),'OBJ: '+convO.toFixed(2),(convD>=0?'↑ +':'↓ ')+convD.toFixed(1)+'% vs OBJ',convD>=0,c);
  var visV=rowAvg('visitas',1);var visD=(visV-1)*100;c=nc();
  html+=card('Visitas Diarias Prom.',visV.toFixed(2),'OBJ: 1.00',(visD>=0?'↑ +':'↓ ')+visD.toFixed(1)+'% vs OBJ',visD>=0,c);
  var ventV=rowAvg('ventas',1);var ventO=rowAvg('ventas',2)||1.13;var ventD=((ventV/ventO)-1)*100;c=nc();
  html+=card('Ventas Promedio',ventV.toFixed(2),'OBJ: '+ventO.toFixed(2),(ventD>=0?'↑ +':'↓ ')+ventD.toFixed(1)+'% vs OBJ',ventD>=0,c);
  Object.keys(tableData).forEach(function(key){
    if (!key.startsWith('custom_')) return;
    var td=tableData[key]; if(!td.rows.length) return;
    var avg=rowAvg(key,1);var obj=rowAvg(key,2)||1;var diff=((avg/obj)-1)*100;var cx=td.hexColor||nc();
    html+=card(td.cols[0]||key,avg.toFixed(2),obj?'OBJ: '+obj.toFixed(2):td.cols[1]+' prom.',(diff>=0?'↑ +':'↓ ')+diff.toFixed(1)+'% vs OBJ',diff>=0,cx);
  });
  grid.innerHTML=html;
}

// ═══════════════════════════════════════════════════════
// RESUMEN
// ═══════════════════════════════════════════════════════
function updateSummary() {
  var semaforo=document.getElementById('semaforo-tbody'); if(!semaforo) return;
  var summGrid=document.getElementById('summary-grid');

  function badge(pct,label){
    if(pct>=100) return '<span class="pill pill-up">🟢 '+label+' ('+pct.toFixed(1)+'%)</span>';
    if(pct>=90)  return '<span class="pill" style="background:rgba(200,154,0,.12);color:var(--accent5)">🟡 '+label+' ('+pct.toFixed(1)+'%)</span>';
    return '<span class="pill pill-down">🔴 '+label+' ('+pct.toFixed(1)+'%)</span>';
  }
  function pBar(pct,color){return '<div class="progress-bar"><div class="progress-fill" style="width:'+Math.min(pct,100).toFixed(1)+'%;background:'+color+'"></div></div>';}
  function bar(label,pct,color){return '<div class="progress-label"><span>'+label+'</span><span>'+pct.toFixed(1)+'%</span></div>'+pBar(pct,color)+'<div style="margin-top:5px"></div>';}

  var cartA=rowAvg('carteras',1);var cartO=rowAvg('carteras',2)||1;var cartP=(cartA/cartO)*100;
  var climA=rowAvg('clima',1);var climP=climA?(climA/0.97)*100:0;
  var convA=rowAvg('conversion',1);var convO=rowAvg('conversion',2)||0.56;var convP=(convA/convO)*100;
  var visA=rowAvg('visitas',1);var visP=visA*100;
  var ventA=rowAvg('ventas',1);var ventO=rowAvg('ventas',2)||1.13;var ventP=(ventA/ventO)*100;
  var pv26=rowAvg('productividad',1)||0.86;var pv25=rowAvg('productividad',2)||0.70;var prodMej=pv25?((pv26-pv25)/pv25)*100:0;

  semaforo.innerHTML=[
    ['Carteras (prom.)',cartA.toFixed(2),cartO.toFixed(2),cartP.toFixed(1)+'%',badge(cartP,'CARTERAS')],
    ['Clima Mandela',climA.toFixed(2),'0.97',climP.toFixed(1)+'%',badge(climP,'CLIMA')],
    ['Productividad',pv26.toFixed(2),'—',(prodMej>=0?'+':'')+prodMej.toFixed(1)+'% vs 2025',badge(100+prodMej,'PRODUCTIVIDAD')],
    ['Conversión (prom.)',convA.toFixed(2),convO.toFixed(2),convP.toFixed(1)+'%',badge(convP,'CONVERSIÓN')],
    ['Visitas (prom.)',visA.toFixed(2),'1.00',visP.toFixed(1)+'%',badge(visP,'VISITAS')],
    ['Ventas (prom.)',ventA.toFixed(2),ventO.toFixed(2),ventP.toFixed(1)+'%',badge(ventP,'VENTAS')]
  ].map(function(r){return '<tr>'+r.map(function(c){return '<td>'+c+'</td>';}).join('')+'</tr>';}).join('');

  if (!summGrid) return;
  function card(icon,title,text,barsHtml){return '<div class="summary-card"><div class="summary-icon">'+icon+'</div><div class="summary-title">'+title+'</div><div class="summary-text">'+text+'</div><div class="progress-bar-wrap" style="margin-top:14px">'+barsHtml+'</div></div>';}
  var cumpl=tableData['carteras'].rows.filter(function(r){var p=parseFloat(r[1]),o=parseFloat(r[2])||1;return!isNaN(p)&&p>=o;}).length;
  var cartBars=tableData['carteras'].rows.slice().sort(function(a,b){return parseFloat(b[1])-parseFloat(a[1]);}).slice(0,3).map(function(r){var p=(parseFloat(r[1])/(parseFloat(r[2])||1))*100;return bar(r[0],p,'var(--accent1)');}).join('');
  var convBars=tableData['conversion'].rows.slice().sort(function(a,b){return parseFloat(b[1])-parseFloat(a[1]);}).slice(0,3).map(function(r){var p=(parseFloat(r[1])/(parseFloat(r[2])||1))*100;return bar(r[0],p,'var(--accent2)');}).join('');
  var visBars=tableData['visitas'].rows.slice().sort(function(a,b){return parseFloat(b[1])-parseFloat(a[1]);}).slice(0,3).map(function(r){var p=(parseFloat(r[1])/(parseFloat(r[2])||1))*100;return bar(r[0],p,'var(--accent5)');}).join('');
  var ventBars=tableData['ventas'].rows.map(function(r){var p=(parseFloat(r[1])/(parseFloat(r[2])||1))*100;return bar(r[0],p,'#e05252');}).join('');
  var html='';
  html+=card('🏆','Fortaleza: Carteras',cumpl+' de '+tableData['carteras'].rows.length+' carteras sobre objetivo. Promedio: <strong>'+cartA.toFixed(2)+'</strong>',cartBars);
  html+=card('⚠️','Alerta: Conversión','Promedio <strong>'+convA.toFixed(2)+'</strong> vs OBJ '+convO.toFixed(2)+' — '+convP.toFixed(1)+'%',convBars);
  html+=card('📈','Productividad','PRO 2026: <strong>'+pv26.toFixed(2)+'</strong> vs '+pv25.toFixed(2)+' en 2025 — '+(prodMej>=0?'+':'')+prodMej.toFixed(1)+'%',bar('2025',100,'var(--muted)')+bar('2026',(pv26/(pv25||1))*100,'var(--accent3)'));
  html+=card('🛒','Ventas','Promedio <strong>'+ventA.toFixed(2)+'</strong> vs OBJ '+ventO.toFixed(2)+' — '+ventP.toFixed(1)+'%',ventBars);
  html+=card('👣','Visitas Diarias','Promedio <strong>'+visA.toFixed(2)+'</strong> vs OBJ 1.00 — '+visP.toFixed(1)+'%',visBars);
  html+=card('🌡️','Clima Mandela','1er bimestre: <strong>'+climA.toFixed(2)+'</strong> vs OBJ 0.97 — '+climP.toFixed(1)+'%',bar('Clima',climP,'var(--accent2)'));
  Object.keys(tableData).forEach(function(key){
    if (!key.startsWith('custom_')) return;
    var td=tableData[key]; if(!td.rows.length) return;
    var avg=rowAvg(key,1);var obj=rowAvg(key,2)||1;var pct=(avg/obj)*100;var hexC=td.hexColor||'#2e74e8';
    var customBars=td.rows.slice().sort(function(a,b){return parseFloat(b[1])-parseFloat(a[1]);}).slice(0,4).map(function(r){var p=(parseFloat(r[1])/(parseFloat(r[2])||obj))*100;return bar(r[0],p,hexC);}).join('');
    html+=card('📊',td.cols[0]||'Tabla','Promedio <strong>'+avg.toFixed(2)+'</strong> vs OBJ '+obj.toFixed(2)+' — '+pct.toFixed(1)+'%',customBars);
  });
  summGrid.innerHTML=html;
}

// ═══════════════════════════════════════════════════════
// REFRESH
// ═══════════════════════════════════════════════════════
function refreshDashboard() {
  renderTableById('carteras');
  navigate('dashboard');
  initCharts();
  reRenderCustomCharts();
  updateKPICards();
  updateSummary();
  showToast('⟳ Dashboard actualizado · Marzo 2026');
}

// ═══════════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════════
function showToast(msg) {
  var t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  setTimeout(function(){t.classList.remove('show');},3000);
}

// ─── Init ───
updateKPICards();
updateSummary();