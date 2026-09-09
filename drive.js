// drive-lite.js - محدث بالرابط الجديد ومتطابق تماماً مع باقي النظام
window.SCRIPT_URL = window.SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbz3TyAm_BWEzlgEcqjqYA6SaBMjoLzN3j51Ewb9vp6UZNL8yJespFDUKQxWA5IOvrvW/exec';

window.db = window.db || {
  daily: [],
  tasks: [],
  attendance: [],
  master: { wallets:['كاش','فودافون كاش','انستا باي'], incomeCats:['راتب'], expenseCats:['اكل'], debtPersons:[], amanatPersons:[] },
  theme: 'nile',
  lastSync: null
};

// تحميل محلي سريع أولاً
try{
  let local = localStorage.getItem('app-omar-db');
  if(local){
    let parsed = JSON.parse(local);
    window.db = Object.assign(window.db, parsed);
  }
}catch(e){ console.warn(e); }

function updateSyncStatus(txt, color){
  let el = document.getElementById('syncStatus');
  if(!el) return;
  el.textContent = txt;
  el.className = `text-xs px-2.5 py-1 rounded-full font-bold border ${color}`;
}

window.saveToLocal = function(){
  try{
    localStorage.setItem('app-omar-db', JSON.stringify(window.db));
  }catch(e){}
}

window.saveToDrive = async function(){
  window.saveToLocal();
  updateSyncStatus('جاري الرفع... 🔄', 'bg-yellow-50 text-yellow-700 border-yellow-200');
  if(!window.SCRIPT_URL || window.SCRIPT_URL.includes('YOUR_SCRIPT_ID')){
    updateSyncStatus('محلي فقط 💾', 'bg-gray-100 text-gray-600 border-gray-200');
    return;
  }
  try{
    let allData = {
      daily: JSON.parse(localStorage.getItem('omar_tx_v3') || '[]'),
      tasks: JSON.parse(localStorage.getItem('omar_tasks_v1') || '[]'),
      attendance: JSON.parse(localStorage.getItem('att_fixed_final') || '{}'),
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
    updateSyncStatus('اترفع الآن ✅ ' + new Date().toLocaleTimeString('ar-EG'), 'bg-emerald-50 text-emerald-700 border-emerald-200');
    setTimeout(()=> updateSyncStatus('متصل الآن 🟢', 'bg-emerald-50 text-emerald-700 border-emerald-200'), 2000);
  }catch(err){
    console.error('[DRIVE-LITE] save error', err);
    updateSyncStatus('خطأ رفع ⚠️', 'bg-red-50 text-red-700 border-red-200');
  }
}

window.loadFromDrive = async function(){
  updateSyncStatus('جاري التحميل... 🔄', 'bg-blue-50 text-blue-700 border-blue-200');
  if(!window.SCRIPT_URL || window.SCRIPT_URL.includes('YOUR_SCRIPT_ID')){
    updateSyncStatus('محلي فقط 💾', 'bg-gray-100 text-gray-600 border-gray-200');
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
      
      window.saveToLocal();
      updateSyncStatus('متصل الآن 🟢 ' + new Date().toLocaleTimeString('ar-EG'), 'bg-emerald-50 text-emerald-700 border-emerald-200');
    } else {
      updateSyncStatus('متصل الآن 🟢', 'bg-emerald-50 text-emerald-700 border-emerald-200');
    }
  }catch(err){
    console.error('[DRIVE-LITE] load error', err);
    updateSyncStatus('أوفلاين 📴', 'bg-gray-100 text-gray-600 border-gray-200');
  }
  if(window.initApp) window.initApp();
  else if(window.renderContent) window.renderContent();
}

window.addEventListener('DOMContentLoaded', ()=>{
  window.loadFromDrive();
});

window.addEventListener('online', ()=>{ window.loadFromDrive(); });
