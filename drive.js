// drive-lite.js - موحد + Debounced + مستقر
window.SCRIPT_URL = window.SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbz3TyAm_BWEzlgEcqjqYA6SaBMjoLzN3j51Ewb9vp6UZNL8yJespFDUKQxWA5IOvrvW/exec';

window.db = window.db || {
  daily: [],
  tasks: [],
  attendance: [],
  master: { wallets:['كاش','فودافون كاش','انستا باي'], incomeCats:['راتب'], expenseCats:['اكل'], debtPersons:[], amanatPersons:[] },
  theme: 'teal',
  lastSync: null
};

try{
  let local = localStorage.getItem('app-omar-db');
  if(local){
    let parsed = JSON.parse(local);
    window.db = Object.assign(window.db, parsed);
  }
}catch(e){}

let _saveTimer = null;
let _isSaving = false;

function updateSyncStatus(txt){
  let el = document.getElementById('syncStatus');
  if(!el) return;
  // لو في الهيدر فوق - نخليه بسيط
  if(el.parentElement && el.parentElement.classList.contains('header') || el.tagName==='SPAN'){
    el.textContent = txt;
  } else {
    el.textContent = txt;
  }
}

window.saveToLocal = function(){
  try{
    localStorage.setItem('app-omar-db', JSON.stringify(window.db));
  }catch(e){}
}

window.saveToDrive = function(){
  // debounced save - ده اللي هيحل مشكلة مرة يرفع ومرة لا
  window.saveToLocal();
  if(_saveTimer) clearTimeout(_saveTimer);
  _saveTimer = setTimeout(()=>{ _doSaveToDrive(); }, 700);
}

async function _doSaveToDrive(){
  if(_isSaving) {
    // لو بيرفع حاليا - اجلها شوية
    _saveTimer = setTimeout(()=>{ _doSaveToDrive(); }, 1000);
    return;
  }
  _isSaving = true;
  updateSyncStatus('⏳ جاري الرفع...');
  if(!window.SCRIPT_URL || window.SCRIPT_URL.includes('YOUR_SCRIPT_ID')){
    updateSyncStatus('💾 محلي');
    _isSaving = false;
    return;
  }
  try{
    let allData = {
      daily: JSON.parse(localStorage.getItem('omar_tx_v3') || '[]'),
      tasks: JSON.parse(localStorage.getItem('omar_tasks_v1') || '[]'),
      attendance: JSON.parse(localStorage.getItem('att_fixed_final') || '{}'),
      cats: JSON.parse(localStorage.getItem('omar_cats_v1') || '[]'),
      att_hols: JSON.parse(localStorage.getItem('att_hols_fixed') || '{}'),
      att_notes: JSON.parse(localStorage.getItem('att_notes') || '{}'),
      db: window.db,
      timestamp: new Date().toISOString()
    };
    let payload = {
      fileName: "all_project_data.json",
      content: allData
    };
    await fetch(window.SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload)
    });
    window.db.lastSync = new Date().toISOString();
    window.saveToLocal();
    updateSyncStatus('✅ اترفع ' + new Date().toLocaleTimeString('ar-EG'));
    setTimeout(()=> updateSyncStatus('🟢 متصل الآن'), 2500);
  }catch(err){
    console.error('[DRIVE] save error', err);
    updateSyncStatus('⚠️ خطأ رفع');
  } finally {
    _isSaving = false;
  }
}

window.saveToDriveNow = _doSaveToDrive;

window.loadFromDrive = async function(){
  updateSyncStatus('🔄 تحميل...');
  if(!window.SCRIPT_URL || window.SCRIPT_URL.includes('YOUR_SCRIPT_ID')){
    updateSyncStatus('💾 محلي');
    if(window.initApp) window.initApp();
    else if(window.renderContent) window.renderContent();
    return;
  }
  try{
    let res = await fetch(window.SCRIPT_URL + '?fileName=all_project_data.json&t=' + Date.now());
    let json = await res.json();
    let payload = json.data || json;
    let content = payload.content || payload;
    if(content){
      if(content.db) window.db = Object.assign(window.db, content.db);
      if(content.tasks) localStorage.setItem('omar_tasks_v1', JSON.stringify(content.tasks));
      if(content.daily) localStorage.setItem('omar_tx_v3', JSON.stringify(content.daily));
      if(content.attendance) localStorage.setItem('att_fixed_final', JSON.stringify(content.attendance));
      if(content.cats) localStorage.setItem('omar_cats_v1', JSON.stringify(content.cats));
      if(content.att_hols) localStorage.setItem('att_hols_fixed', JSON.stringify(content.att_hols));
      if(content.att_notes) localStorage.setItem('att_notes', JSON.stringify(content.att_notes));
      window.saveToLocal();
      updateSyncStatus('🟢 متصل الآن');
    }
  }catch(err){
    updateSyncStatus('📴 أوفلاين');
  }
  if(window.initApp) window.initApp();
  else if(window.renderContent) window.renderContent();
}

window.addEventListener('DOMContentLoaded', ()=>{
  window.loadFromDrive();
});
window.addEventListener('online', ()=>{ window.loadFromDrive(); });
