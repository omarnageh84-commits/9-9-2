// themes.js - موحد لكل الصفحات - نفس ثيم المهام
const themes = {
  teal: {
    '--bg': '#F0FDFA',
    '--bg-soft': '#CCFBF1',
    '--card': '#FFFFFF',
    '--card-border': '#5EEAD4',
    '--text': '#134E4A',
    '--text-soft': '#0D9488',
    '--hero': '#0F766E',
    '--accent': '#14B8A6',
    '--nav-bg': 'rgba(255,255,255,0.92)'
  },
  green: {
    '--bg': '#F0FDFA',
    '--bg-soft': '#CCFBF1',
    '--card': '#FFFFFF',
    '--card-border': '#5EEAD4',
    '--text': '#134E4A',
    '--text-soft': '#0D9488',
    '--hero': '#0F766E',
    '--accent': '#14B8A6',
    '--nav-bg': 'rgba(255,255,255,0.92)'
  },
  light: {
    '--bg': '#F0FDFA',
    '--bg-soft': '#CCFBF1',
    '--card': '#FFFFFF',
    '--card-border': '#5EEAD4',
    '--text': '#134E4A',
    '--text-soft': '#0D9488',
    '--hero': '#0F766E',
    '--accent': '#14B8A6',
    '--nav-bg': 'rgba(255,255,255,0.92)'
  },
  dark: {
    '--bg': '#020617',
    '--bg-soft': '#1E293B',
    '--card': '#0F172A',
    '--card-border': '#1E293B',
    '--text': '#F1F5F9',
    '--text-soft': '#94A3B8',
    '--hero': '#0F766E',
    '--accent': '#14B8A6',
    '--nav-bg': 'rgba(15,23,42,0.92)'
  }
};

function applyTheme(name, save=true){
  let t = themes[name] || themes.teal;
  Object.entries(t).forEach(([k,v])=>{
    document.documentElement.style.setProperty(k,v);
  });
  if(save) localStorage.setItem('omar_theme', name);
  if(document.body) document.body.dataset.theme = name;
}

(function(){
  let saved = localStorage.getItem('omar_theme') || 'teal';
  try{ applyTheme(saved, false); }catch(e){}
})();

window.applyTheme = applyTheme;
window.toggleTheme = function(){
  let cur = localStorage.getItem('omar_theme') || 'teal';
  applyTheme(cur==='teal' || cur==='green' || cur==='light' ? 'dark' : 'teal', true);
};

console.log('✅ Themes unified loaded');
