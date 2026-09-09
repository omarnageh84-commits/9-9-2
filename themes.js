
// themes.js - AB Omar - Themes + Core Missing Functions Fix
// هذا الملف يوفر الثيمات + الدوال الناقصة اللي كانت بتسبب ReferenceError
// بدون ما نعدل أي حرف في daily.html

const themes = {
  light: {
    '--bg': '#f8fafc',
    '--bg-soft': '#f1f5f9',
    '--card': '#ffffff',
    '--card-border': '#e2e8f0',
    '--text': '#0f172a',
    '--text-soft': '#64748b',
    '--hero': '#0f766e'
  },
  dark: {
    '--bg': '#0f172a',
    '--bg-soft': '#1e293b',
    '--card': '#1e293b',
    '--card-border': '#334155',
    '--text': '#f1f5f9',
    '--text-soft': '#94a3b8',
    '--hero': '#14b8a6'
  }
};

function applyTheme(name){
  let t = themes[name] || themes.light;
  Object.entries(t).forEach(([k,v])=>{
    document.documentElement.style.setProperty(k,v);
  });
  localStorage.setItem('omar_theme', name);
}

(function(){
  let saved = localStorage.getItem('omar_theme') || 'light';
  try{ applyTheme(saved); }catch(e){}
})();

window.toggleTheme = function(){
  let cur = localStorage.getItem('omar_theme') || 'light';
  applyTheme(cur==='light'?'dark':'light');
};

// ===== Core functions that were missing and caused ReferenceError =====
// نعرفهم فقط لو مش موجودين في daily.html عشان منغيرش حاجة

if(typeof globalSearchQuery === 'undefined'){
  var globalSearchQuery = '';
}
if(typeof globalSearchFilter === 'undefined'){
  var globalSearchFilter = 'all';
}
if(typeof reportVisible === 'undefined'){
  var reportVisible = false;
}
if(typeof curDebtSub === 'undefined'){
  var curDebtSub = 'due';
}
if(typeof fixedOpen === 'undefined'){
  var fixedOpen = true;
}
if(typeof currentBand === 'undefined'){
  var currentBand = '';
}
if(typeof currentSection === 'undefined'){
  var currentSection = '';
}
if(typeof promptCallback === 'undefined'){
  var promptCallback = null;
}
if(typeof dayFilter === 'undefined'){
  var dayFilter = {expense:'month', income:'month', debt:'month', amanat:'month'};
}

if(typeof setDayFilter === 'undefined'){
function setDayFilter(type,mode){const prefix=type==='expense'?'exp':type==='income'?'inc':type==='amanat'?'ama':'debt';const fromEl=document.getElementById(`f-${prefix}-from`);const toEl=document.getElementById(`f-${prefix}-to`);const today=new Date().toISOString().slice(0,10);if(mode==='today'){fromEl.value=today;toEl.value=today}else if(mode==='month'){const{first,last}=getMonthRange(curYM);fromEl.value=first;toEl.value=last}else if(mode==='all'){fromEl.value='';toEl.value=''}if(type==='debt')renderDebt();else if(type==='total')renderTotal();else renderSimple(type)}
}

if(typeof renderSimple === 'undefined'){
function renderSimple(type){
  try{
    let containerId = type==='expense'?'t-expense': type==='income'?'t-income': type==='amanat'?'t-amanat':'t-'+type;
    let el = document.getElementById(containerId);
    if(!el){ console.warn('container not found', containerId); return; }
    // filters
    let q='', w='', from='', to='';
    if(type==='expense'){
      q=(document.getElementById('f-exp-q')?.value||'').toLowerCase();
      w=document.getElementById('f-exp-w')?.value||'';
      from=document.getElementById('f-exp-from')?.value||'';
      to=document.getElementById('f-exp-to')?.value||'';
    }else if(type==='income'){
      q=(document.getElementById('f-inc-q')?.value||'').toLowerCase();
      from=document.getElementById('f-inc-from')?.value||'';
      to=document.getElementById('f-inc-to')?.value||'';
    }else if(type==='amanat'){
      q=(document.getElementById('f-ama-q')?.value||'').toLowerCase();
      from=document.getElementById('f-ama-from')?.value||'';
      to=document.getElementById('f-ama-to')?.value||'';
    }
    let list = transactions.filter(t=>{
      if(t.type!==type) return false;
      if(q){
        let hay=[t.item||'', t.person||'', t.note||'', t.wallet||''].join(' ').toLowerCase();
        if(!hay.includes(q)) return false;
      }
      if(w && t.wallet!==w) return false;
      if(from && t.date < from) return false;
      if(to && t.date > to) return false;
      if(dayFilter[type]==='month'){
        if(!t.date || !t.date.startsWith(curYM)) return false;
      }
      // global search
      if(globalSearchQuery){
        let hay2=[t.item||'', t.person||'', t.wallet||'', t.note||'', t.amount||'', t.date||''].join(' ').toLowerCase();
        if(!hay2.includes(globalSearchQuery)) return false;
      }
      return true;
    });
    list.sort((a,b)=>(b.date||'').localeCompare(a.date||''));

    if(!list.length){
      el.innerHTML=`<div style="padding:20px;text-align:center;color:var(--text-soft);background:var(--card);border:1.5px dashed var(--card-border);border-radius:12px;margin:8px 0;font-weight:900">فاضي - مفيش بيانات للشهر ده</div>`;
      return;
    }
    let total = list.reduce((s,x)=>s+(Number(x.amount)||0),0);
    let html=`<div class="tsec"><div class="thead"><b>${type==='expense'?'المصروفات':type==='income'?'الدخل':'الأمانات'} (${list.length})</b><span style="background:var(--hero);color:#fff;padding:2px 8px;border-radius:20px;font-size:10px">${total.toLocaleString()} ج</span></div><div class="twrap"><table><thead><tr><th>تاريخ</th><th>بند</th><th>محفظة</th><th>مبلغ</th><th></th></tr></thead><tbody>`;
    list.forEach(t=>{
      let safeId = (t.id||'').replace(/'/g,"\'");
      html+=`<tr onclick="openEdit('${safeId}')" style="cursor:pointer"><td>${t.date||''}</td><td>${(t.item||t.person||'')}</td><td>${t.wallet||''}</td><td style="color:${type==='income'?'#16a34a':'#ef4444'};font-weight:900">${Number(t.amount).toLocaleString()}</td><td>✏️</td></tr>`;
    });
    html+=`</tbody></table></div></div>`;
    el.innerHTML=html;
  }catch(e){ console.error('renderSimple error', e); }
}
}

if(typeof renderDebt === 'undefined'){
function renderDebt(){
  try{
    let q=(document.getElementById('f-debt-q')?.value||'').toLowerCase();
    let from=document.getElementById('f-debt-from')?.value||'';
    let to=document.getElementById('f-debt-to')?.value||'';
    let filterBy = (t)=>{
      if(t.type!=='debt') return false;
      if(q){
        let hay=[t.person||'', t.item||'', t.note||''].join(' ').toLowerCase();
        if(!hay.includes(q)) return false;
      }
      if(from && t.date < from) return false;
      if(to && t.date > to) return false;
      if(dayFilter['debt']==='month'){
        if(!t.date || !t.date.startsWith(curYM)) return false;
      }
      if(globalSearchQuery){
        let hay2=[t.person||'', t.item||'', t.wallet||'', t.note||''].join(' ').toLowerCase();
        if(!hay2.includes(globalSearchQuery)) return false;
      }
      return true;
    };
    let dueList = transactions.filter(t=>filterBy(t) && (t.subType==='debt_due' || t.status==='due'));
    let defList = transactions.filter(t=>filterBy(t) && (t.subType==='debt_def' || t.status==='def'));
    dueList.sort((a,b)=>(b.date||'').localeCompare(a.date||''));
    defList.sort((a,b)=>(b.date||'').localeCompare(a.date||''));

    let renderList = (list)=>{
      if(!list.length) return `<div style="padding:20px;text-align:center;color:var(--text-soft);background:var(--card);border:1.5px dashed var(--card-border);border-radius:12px;margin:8px 0;font-weight:900">فاضي - مفيش بيانات للشهر ده</div>`;
      let tot=list.reduce((s,x)=>s+(Number(x.amount)||0),0);
      let html=`<div class="tsec"><div class="thead"><b>الإجمالي ${list.length}</b><span style="background:var(--hero);color:#fff;padding:2px 8px;border-radius:20px;font-size:10px">${tot.toLocaleString()} ج</span></div><div class="twrap"><table><thead><tr><th>تاريخ</th><th>شخص</th><th>اتجاه</th><th>مبلغ</th><th>حالة</th></tr></thead><tbody>`;
      list.forEach(t=>{
        let safeId=(t.id||'').replace(/'/g,"\'");
        html+=`<tr onclick="openEdit('${safeId}')" style="cursor:pointer"><td>${t.date||''}</td><td>${t.person||''}</td><td>${t.direction||''}</td><td>${Number(t.amount).toLocaleString()}</td><td>${t.status||''}</td></tr>`;
      });
      html+=`</tbody></table></div></div>`;
      return html;
    };
    let dueEl=document.getElementById('debt-due');
    let defEl=document.getElementById('debt-def');
    if(dueEl) dueEl.innerHTML=renderList(dueList);
    if(defEl) defEl.innerHTML=renderList(defList);
  }catch(e){ console.error('renderDebt error', e); }
}
}

// Override renderStats to include fixed expenses
function renderStats(type){
const allMonth=transactions.filter(t=>t.date&&t.date.startsWith(curYM));
const monthList=allMonth.filter(t=>{if(t.excludeFromBalance)return false;const isDef=t.subType==='debt_def'||t.status==='def';if(isDef&&!includeDeferredInBalance)return false;return true});
const incomeMonth=monthList.filter(t=>t.type==='income').reduce((s,x)=>s+Number(x.amount),0);
let expenseMonth=monthList.filter(t=>t.type==='expense').reduce((s,x)=>s+Number(x.amount),0);
let fixedSum=getFixedForMonth(curYM).reduce((a,b)=>a+(Number(b.amount)||0),0);
expenseMonth+=fixedSum;
let dueO=0,dueL=0;monthList.filter(t=>t.type==='debt'&&(t.subType==='debt_due'||t.status==='due')).forEach(t=>{if(t.direction==='عليا')dueO+=Number(t.amount);else dueL+=Number(t.amount)});
const debtDueNet=dueL-dueO;
let defOAll=0,defLAll=0;allMonth.filter(t=>t.type==='debt'&&(t.subType==='debt_def'||t.status==='def')).forEach(t=>{if(t.direction==='عليا')defOAll+=Number(t.amount);else defLAll+=Number(t.amount)});
const debtDefNetAll=defLAll-defOAll;
const isActive=includeDeferredInBalance;
const netThere = incomeMonth - expenseMonth - dueO + dueL + (isActive ? debtDefNetAll : 0);
const top5=`<div class="kpi-grid-5">
<div class="stat pos"><small>إجمالي الدخل</small><b>${incomeMonth.toLocaleString()}</b></div>
<div class="stat neg"><small>إجمالي المصروف</small><b>${expenseMonth.toLocaleString()}</b></div>
<div class="stat neg"><small>إجمالي المستحقة</small><b>${(dueO - dueL).toLocaleString()}</b></div>
<div class="stat neu"><small>الصافي هناك</small><b>${netThere.toLocaleString()}</b></div>
<div class="stat def ${isActive?'active':'inactive'}" onclick="toggleDeferredInclude()"><span style="font-size:5px;background:${isActive?'#dcfce7':'#fee2e2'};color:${isActive?'#16a34a':'#ef4444'};padding:1px 4px;border-radius:10px">${isActive?'✅ مفعلة':'❌ مخفية'}</span><small>المؤجلة ⏳</small><b>${debtDefNetAll.toLocaleString()}</b></div>
</div>`;
document.querySelectorAll('[id^="stats-"]').forEach(el=>{
if(el.id==='stats-debt'){
  let oDue=0,lDue=0,oDef=0,lDef=0;
  allMonth.filter(t=>t.type==='debt').forEach(t=>{
    if(t.subType==='debt_due'||t.status==='due'){
      if(!t.excludeFromBalance){if(t.direction==='عليا')oDue+=Number(t.amount);else lDue+=Number(t.amount)}
    }else{
      if(t.direction==='عليا')oDef+=Number(t.amount);else lDef+=Number(t.amount)
    }
  });
  if(curDebtSub==='due'){
    el.innerHTML=`<div class="kpi-grid-5" style="grid-template-columns:repeat(3,1fr)!important">
<div class="stat neg"><small>إجمالي عليا مستحق</small><b>${oDue.toLocaleString()}</b></div>
<div class="stat pos"><small>إجمالي ليا مستحق</small><b>${lDue.toLocaleString()}</b></div>
<div class="stat neu"><small>صافي المستحق</small><b>${(lDue-oDue).toLocaleString()}</b></div>
</div>`;
  }else{
    el.innerHTML=`<div class="kpi-grid-5" style="grid-template-columns:repeat(3,1fr)!important">
<div class="stat neg"><small>عليا مؤجل</small><b>${oDef.toLocaleString()}</b></div>
<div class="stat pos"><small>ليا مؤجل</small><b>${lDef.toLocaleString()}</b></div>
<div class="stat neu"><small>صافي المؤجل</small><b>${(lDef-oDef).toLocaleString()}</b></div>
</div>`;
  }
  return;
}
if(el.id==='stats-amanat'){
  let dep=0,wd=0;
  allMonth.filter(t=>t.type==='amanat').forEach(t=>{
    let amt=Number(t.amount)||0;
    if((t.direction||'إيداع')==='سحب' || t.amanatType==='سحب') wd+=amt; else dep+=amt;
  });
  el.innerHTML=`<div class="kpi-grid-5" style="grid-template-columns:repeat(3,1fr)!important">
<div class="stat pos"><small>إجمالي الإيداع</small><b>${dep.toLocaleString()}</b></div>
<div class="stat neg"><small>إجمالي السحب</small><b>${wd.toLocaleString()}</b></div>
<div class="stat neu"><small>الصافي</small><b>${(dep-wd).toLocaleString()}</b></div>
</div>`;
  return;
}
el.innerHTML=top5;
});
}

// Fix refreshCurrent to include fixed section - patch it
(function(){
  if(typeof refreshCurrent !== 'undefined'){
    let _origRefresh = refreshCurrent;
    window.refreshCurrent = function(){
      try{
        if(typeof curTab !== 'undefined' && curTab==='expense'){
          try{ if(typeof renderFixedSection === 'function') renderFixedSection(); }catch(e){}
        }
        _origRefresh();
      }catch(e){
        console.error('refreshCurrent patched error', e);
        try{ _origRefresh(); }catch(e2){}
      }
    };
  }
})();

console.log('✅ Themes + Core Fixes loaded - renderSimple/renderDebt fixed');
