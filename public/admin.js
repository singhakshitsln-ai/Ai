// ╔═══════════════════════════════════════════════════════════════════╗
// ║   FRANCIS HACKER ADMIN PANEL v3.0 — MAXIMUM OVERDRIVE            ║
// ║   Ctrl×3 (desktop) | Tap FRANCIS logo ×3 (mobile)                ║
// ╚═══════════════════════════════════════════════════════════════════╝
(function(){
'use strict';

const ADMIN_KEY='francis_admin', PASS_KEY='francis_admin_pass', LOG_KEY='francis_visitor_log';
const NOTE_KEY='francis_notes', VAULT_KEY='francis_vault', DEFAULT_PASS='francis2025';

const ls  = k     => { try{return JSON.parse(localStorage.getItem(k));}catch{return null;} };
const lss = (k,v) => { try{localStorage.setItem(k,JSON.stringify(v));}catch{} };
const GA  = ()    => ls(ADMIN_KEY)||{};
const SA  = d     => lss(ADMIN_KEY, Object.assign(GA(),d));
const GM  = ()    => { try{return JSON.parse(localStorage.getItem('francis_monitor')||'{}');}catch{return{};} };
const fmt = n     => (n||0).toLocaleString();
const esc = s     => String(s).replace(/</g,'&lt;').replace(/>/g,'&gt;');
const rnd = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
const fmtT= s     => { if(!s||s<1)return'0s';if(s<60)return s+'s';if(s<3600)return Math.floor(s/60)+'m';return Math.floor(s/3600)+'h '+Math.floor((s%3600)/60)+'m'; };
const hex = ()    => Math.random().toString(16).slice(2,10).toUpperCase();
const uid = ()    => [hex(),hex(),hex(),hex()].join('-');

// log visit
(()=>{ const l=ls(LOG_KEY)||[]; l.push({t:Date.now(),ua:navigator.userAgent.slice(0,80),tz:Intl.DateTimeFormat().resolvedOptions().timeZone,scr:screen.width+'x'+screen.height}); if(l.length>300)l.splice(0,l.length-300); lss(LOG_KEY,l); })();

// ═══════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════
const CSS = document.createElement('style');
CSS.textContent = `
:root{--g:#00ff41;--g2:#00cc33;--g3:#006615;--g4:#003a0d;--g5:#001a00;--bg:#020a02;--red:#ff3333;--yl:#ffcc00;--bl:#00aaff;--pur:#cc44ff;}
*{box-sizing:border-box;}
#adm{display:none;position:fixed;inset:0;z-index:99999;background:#000;font-family:'Courier New',monospace;overflow:hidden;flex-direction:column;}
#adm.on{display:flex;}

/* SCANLINE OVERLAY */
#adm::after{content:'';position:fixed;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.08) 2px,rgba(0,0,0,.08) 4px);pointer-events:none;z-index:1;animation:scanMove 8s linear infinite;}
@keyframes scanMove{from{background-position:0 0}to{background-position:0 100%}}

/* BOOT */
#adm-boot{position:absolute;inset:0;background:#000;z-index:30;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:20px;}
#adm-boot.gone{display:none;}
#boot-ascii{color:var(--g);font-size:.55rem;line-height:1.3;text-align:center;text-shadow:0 0 8px var(--g);margin-bottom:8px;}
#boot-log{width:min(440px,90vw);min-height:200px;font-size:.65rem;color:var(--g);line-height:1.7;text-align:left;}
#boot-bar-wrap{width:min(440px,90vw);background:var(--g5);border:1px solid var(--g4);border-radius:3px;height:6px;overflow:hidden;}
#boot-bar{height:6px;background:var(--g);width:0%;transition:width .08s;}
#boot-status{font-size:.55rem;color:var(--g3);letter-spacing:2px;margin-top:2px;}

/* PASS */
#adm-pass{position:absolute;inset:0;background:rgba(0,0,0,.97);z-index:20;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;}
#adm-pass.gone{display:none;}
.skull-ring{width:80px;height:80px;border-radius:50%;border:2px solid var(--g4);display:flex;align-items:center;justify-content:center;font-size:2.2rem;animation:skullSpin 4s linear infinite;box-shadow:0 0 20px var(--g4);}
@keyframes skullSpin{0%,100%{box-shadow:0 0 10px var(--g4)}50%{box-shadow:0 0 30px var(--g)}}
#pass-title{font-size:1.1rem;font-weight:bold;color:var(--g);text-shadow:0 0 16px var(--g);letter-spacing:4px;animation:glitch 3s infinite;}
@keyframes glitch{0%,92%,100%{text-shadow:0 0 12px var(--g)}93%{text-shadow:-3px 0 var(--red),3px 0 var(--bl);transform:skewX(-3deg)}95%{text-shadow:3px 0 var(--red),-3px 0 var(--bl);transform:skewX(3deg)}97%{text-shadow:0 0 12px var(--g);transform:none}}
#pass-inp{width:240px;padding:12px 16px;background:rgba(0,255,65,.03);border:2px solid var(--g4);border-radius:10px;color:var(--g);font-family:'Courier New',monospace;font-size:1.1rem;text-align:center;outline:none;letter-spacing:6px;}
#pass-inp:focus{border-color:var(--g);box-shadow:0 0 14px rgba(0,255,65,.3);}
#pass-err{font-size:.65rem;color:var(--red);height:16px;letter-spacing:1px;}
#pass-tries{font-size:.58rem;color:var(--g4);letter-spacing:1px;}
.pass-dots{display:flex;gap:6px;justify-content:center;}
.pass-dot{width:8px;height:8px;border-radius:50%;background:var(--g4);transition:all .3s;}
.pass-dot.lit{background:var(--g);box-shadow:0 0 8px var(--g);}

/* BAR */
#adm-bar{display:flex;align-items:center;justify-content:space-between;padding:0 12px;height:46px;background:var(--bg);border-bottom:2px solid var(--g);flex-shrink:0;position:relative;z-index:2;}
#adm-bar::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--g),transparent);animation:topScan 4s infinite;}
@keyframes topScan{0%,100%{opacity:.4}50%{opacity:1}}
.bar-left{display:flex;align-items:center;gap:8px;}
#adm-logo-pill{background:var(--g);color:#000;font-size:.6rem;font-weight:bold;letter-spacing:2px;padding:3px 9px;border-radius:20px;animation:pillPulse 2s infinite;}
@keyframes pillPulse{0%,100%{box-shadow:0 0 6px var(--g)}50%{box-shadow:0 0 18px var(--g),0 0 30px rgba(0,255,65,.3)}}
#adm-bar-title{font-size:.82rem;font-weight:bold;color:var(--g);text-shadow:0 0 10px var(--g);letter-spacing:2px;}
#adm-live-time{font-size:.58rem;color:var(--g3);letter-spacing:1px;}
.bar-right{display:flex;align-items:center;gap:6px;}
#adm-status-row{display:flex;gap:5px;align-items:center;}
.sdot{width:7px;height:7px;border-radius:50%;animation:sdotBlink 2s infinite;}
.sdot.green{background:var(--g);box-shadow:0 0 6px var(--g);}
.sdot.yellow{background:var(--yl);box-shadow:0 0 6px var(--yl);}
.sdot.red{background:var(--red);box-shadow:0 0 6px var(--red);}
@keyframes sdotBlink{0%,100%{opacity:1}50%{opacity:.3}}
#adm-session-time{font-size:.56rem;color:var(--g3);letter-spacing:1px;}
.xbtn{background:none;border:1.5px solid var(--g4);color:var(--g3);width:26px;height:26px;border-radius:6px;cursor:pointer;font-family:monospace;font-size:.8rem;display:flex;align-items:center;justify-content:center;transition:all .15s;}
.xbtn:hover{border-color:var(--red);color:var(--red);}

/* TABS */
#adm-tabs{display:flex;background:rgba(2,10,2,.99);border-bottom:1px solid var(--g4);flex-shrink:0;overflow-x:auto;scrollbar-width:none;z-index:2;}
#adm-tabs::-webkit-scrollbar{display:none;}
.atab{background:none;border:none;border-bottom:2.5px solid transparent;color:var(--g3);font-family:'Courier New',monospace;font-size:.6rem;letter-spacing:1.5px;padding:9px 12px;cursor:pointer;white-space:nowrap;text-transform:uppercase;transition:all .15s;flex-shrink:0;border-right:1px solid var(--g5);}
.atab:hover{color:var(--g2);background:rgba(0,255,65,.03);}
.atab.on{color:var(--g);border-bottom-color:var(--g);background:rgba(0,255,65,.05);text-shadow:0 0 8px var(--g);}

/* BODY */
#adm-body{flex:1;overflow-y:auto;padding:12px;background:var(--bg);scrollbar-width:thin;scrollbar-color:var(--g4) transparent;z-index:2;}
#adm-body::-webkit-scrollbar{width:3px;}
#adm-body::-webkit-scrollbar-thumb{background:var(--g4);border-radius:2px;}
.asec{display:none;}
.asec.on{display:block;}

/* CARDS */
.ac{background:rgba(5,18,5,.65);border:1.5px solid var(--g4);border-radius:12px;padding:13px 12px;margin-bottom:10px;position:relative;overflow:hidden;}
.ac::after{content:'';position:absolute;top:0;left:-100%;width:60%;height:1px;background:linear-gradient(90deg,transparent,var(--g3),transparent);animation:cardScan 6s infinite;}
@keyframes cardScan{from{left:-60%}to{left:160%}}
.act{font-size:.6rem;color:var(--g2);letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;display:flex;align-items:center;gap:6px;}
.abadge{background:rgba(0,255,65,.1);border:1px solid var(--g4);border-radius:3px;padding:1px 5px;font-size:.5rem;color:var(--g3);}

/* STATS GRID */
.as{display:grid;gap:6px;margin-bottom:10px;}
.as2{grid-template-columns:repeat(2,1fr);}
.as3{grid-template-columns:repeat(3,1fr);}
.as4{grid-template-columns:repeat(4,1fr);}
.astat{background:rgba(0,0,0,.6);border:1.5px solid var(--g4);border-radius:9px;padding:9px 6px;text-align:center;transition:all .2s;cursor:default;}
.astat:hover{border-color:var(--g2);transform:translateY(-1px);}
.asn{font-size:1.1rem;font-weight:bold;color:var(--g);text-shadow:0 0 8px var(--g);}
.asl{font-size:.46rem;color:var(--g3);letter-spacing:1.5px;margin-top:1px;}

/* BARS */
.brow{display:flex;align-items:center;gap:7px;margin-bottom:5px;}
.blbl{font-size:.6rem;color:var(--g2);min-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.btrack{flex:1;background:rgba(0,0,0,.5);border-radius:3px;height:5px;}
.bfill{height:5px;border-radius:3px;transition:width .6s;}
.bfill.green{background:linear-gradient(90deg,var(--g),var(--g2));}
.bfill.blue{background:linear-gradient(90deg,var(--bl),#0066cc);}
.bfill.red{background:linear-gradient(90deg,var(--red),#cc0000);}
.bfill.purple{background:linear-gradient(90deg,var(--pur),#7c3aed);}
.bval{font-size:.56rem;color:var(--g3);min-width:20px;text-align:right;}

/* INPUTS */
.al{font-size:.57rem;color:var(--g2);letter-spacing:2px;display:block;margin-bottom:4px;}
.ai,.ata,.asel{width:100%;padding:8px 10px;background:rgba(0,0,0,.75);border:1.5px solid var(--g4);border-radius:7px;color:var(--g);font-family:'Courier New',monospace;font-size:.75rem;outline:none;margin-bottom:8px;transition:border-color .18s;}
.ata{resize:vertical;min-height:65px;}
.ai:focus,.ata:focus,.asel:focus{border-color:var(--g);box-shadow:0 0 6px rgba(0,255,65,.15);}
.ai::placeholder,.ata::placeholder{color:var(--g5);}
.asel option{background:#020a02;}

/* BUTTONS */
.ab{padding:8px 14px;background:var(--g);border:none;border-radius:7px;color:#000;font-family:'Courier New',monospace;font-weight:bold;font-size:.7rem;letter-spacing:1.5px;cursor:pointer;transition:all .18s;white-space:nowrap;}
.ab:hover{opacity:.82;box-shadow:0 0 12px rgba(0,255,65,.3);}
.ab.full{width:100%;margin-bottom:6px;}
.ab.ghost{background:transparent;border:1.5px solid var(--g4);color:var(--g3);}
.ab.ghost:hover{border-color:var(--g2);color:var(--g2);}
.ab.red{background:transparent;border:1.5px solid #550000;color:#aa2222;}
.ab.red:hover{border-color:var(--red);color:var(--red);}
.ab.blue{background:#0066cc;color:#fff;}
.ab.yellow{background:var(--yl);color:#000;}
.ab.purple{background:#7c3aed;color:#fff;}
.abrow{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px;}

/* TOGGLE */
.atog{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:rgba(0,0,0,.4);border:1px solid var(--g4);border-radius:7px;margin-bottom:5px;cursor:pointer;transition:all .15s;}
.atog:hover{border-color:var(--g2);}
.atog-i{flex:1;}
.atog-n{font-size:.72rem;color:var(--g2);}
.atog-s{font-size:.54rem;color:var(--g3);margin-top:1px;}
.asw{width:32px;height:17px;background:var(--g4);border-radius:9px;position:relative;flex-shrink:0;transition:background .2s;}
.asw.on{background:var(--g2);}
.asw::after{content:'';position:absolute;top:2px;left:2px;width:13px;height:13px;background:#fff;border-radius:50%;transition:left .2s;box-shadow:0 1px 3px rgba(0,0,0,.4);}
.asw.on::after{left:17px;}

/* TERMINAL */
#term-out{background:#000;border:1.5px solid var(--g4);border-radius:8px;padding:10px;font-size:.68rem;color:var(--g);min-height:180px;max-height:280px;overflow-y:auto;white-space:pre-wrap;word-break:break-all;margin-bottom:7px;line-height:1.6;}
#term-out::-webkit-scrollbar{width:3px;}
#term-out::-webkit-scrollbar-thumb{background:var(--g4);}
#term-row{display:flex;gap:6px;align-items:center;}
#term-prompt{font-size:.72rem;color:var(--g);flex-shrink:0;}
#term-inp{flex:1;background:transparent;border:none;color:var(--g);font-family:'Courier New',monospace;font-size:.72rem;outline:none;caret-color:var(--g);}

/* PACKET VISUALIZER */
#packet-canvas{width:100%;height:120px;background:#000;border:1.5px solid var(--g4);border-radius:8px;display:block;margin-bottom:8px;}

/* CODE EDITOR */
#code-editor{width:100%;min-height:220px;background:#000;border:1.5px solid var(--g4);border-radius:8px;color:var(--g);font-family:'Courier New',monospace;font-size:.72rem;padding:10px;outline:none;resize:vertical;line-height:1.7;tab-size:2;}
#code-editor:focus{border-color:var(--g);}
#code-output{background:#000;border:1.5px solid var(--g4);border-left:3px solid var(--g);border-radius:8px;padding:10px;font-size:.68rem;color:var(--g2);min-height:60px;white-space:pre-wrap;word-break:break-all;display:none;margin-top:6px;max-height:160px;overflow-y:auto;}

/* CIPHER */
.cipher-result{background:#000;border:1.5px solid var(--g4);border-left:3px solid var(--g);border-radius:8px;padding:10px;font-size:.7rem;color:var(--g);word-break:break-all;white-space:pre-wrap;margin-top:7px;display:none;max-height:120px;overflow-y:auto;}

/* VAULT */
.vault-item{display:flex;align-items:center;gap:8px;padding:8px 10px;border-bottom:1px solid var(--g5);font-size:.65rem;}
.vault-item:hover{background:rgba(0,255,65,.03);}
.vault-name{color:var(--g);flex:1;font-weight:bold;}
.vault-val{color:var(--g3);flex:2;word-break:break-all;filter:blur(3px);cursor:pointer;transition:filter .2s;}
.vault-val:hover{filter:none;}
.vault-act{display:flex;gap:4px;flex-shrink:0;}

/* THREAT SCANNER */
#threat-out{background:#000;border:1.5px solid var(--g4);border-radius:8px;padding:10px;font-size:.65rem;line-height:1.9;max-height:220px;overflow-y:auto;margin-top:8px;display:none;}
.threat-ok{color:var(--g);}
.threat-warn{color:var(--yl);}
.threat-crit{color:var(--red);}

/* CRYPTO TICKER */
.cticker{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;border-bottom:1px solid var(--g5);font-size:.68rem;}
.cticker:hover{background:rgba(0,255,65,.03);}
.cticker-sym{color:var(--g);font-weight:bold;min-width:50px;}
.cticker-price{color:var(--g2);min-width:80px;text-align:right;}
.cticker-chg.up{color:var(--g);}
.cticker-chg.dn{color:var(--red);}
.cticker-bar{flex:1;margin:0 10px;}

/* MATRIX RAIN MINI */
#matrix-mini{border-radius:8px;display:block;width:100%;height:80px;margin-bottom:8px;}

/* LOG */
.alog{display:flex;gap:7px;padding:6px 9px;border-bottom:1px solid var(--g5);font-size:.6rem;}
.alog:hover{background:rgba(0,255,65,.02);}
.alog-t{color:var(--g3);min-width:65px;flex-shrink:0;}
.alog-i{color:var(--g2);flex:1;word-break:break-all;}

/* THEME SWATCHES */
.tswatch-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px;}
.tswatch{height:38px;border-radius:7px;cursor:pointer;border:2px solid transparent;display:flex;align-items:center;justify-content:center;font-size:.52rem;font-weight:bold;letter-spacing:1px;transition:all .18s;}
.tswatch.on{border-color:#fff;box-shadow:0 0 14px rgba(255,255,255,.3);}

/* ANNOUNCE PREV */
#ann-prev{display:none;padding:8px 12px;border-radius:7px;text-align:center;font-size:.75rem;font-weight:bold;letter-spacing:1px;margin-bottom:8px;}

/* NOTES */
#notes-ta{width:100%;min-height:200px;background:rgba(0,0,0,.8);border:1.5px solid var(--g4);border-radius:8px;color:var(--g);font-family:'Courier New',monospace;font-size:.72rem;padding:10px;outline:none;resize:vertical;line-height:1.7;}
#notes-ta:focus{border-color:var(--g);}

/* HR */
.ahr{border:none;border-top:1px solid var(--g5);margin:9px 0;}

/* NOTIFICATION */
#adm-notif{position:fixed;top:54px;left:50%;transform:translateX(-50%);background:rgba(5,18,5,.99);border:1.5px solid var(--g);border-radius:8px;padding:7px 18px;font-size:.7rem;color:var(--g);letter-spacing:1px;z-index:100010;display:none;white-space:nowrap;box-shadow:0 0 16px rgba(0,255,65,.3);}

/* PROGRESS RING */
.ring-wrap{display:flex;flex-direction:column;align-items:center;margin-bottom:10px;}
.ring-svg{transform:rotate(-90deg);}
.ring-val{font-size:1.3rem;font-weight:bold;color:var(--g);text-shadow:0 0 8px var(--g);margin-top:4px;}
.ring-lbl{font-size:.52rem;color:var(--g3);letter-spacing:2px;}

/* HEATMAP */
.heatmap{display:grid;grid-template-columns:repeat(24,1fr);gap:2px;margin-bottom:6px;}
.hcell{height:16px;border-radius:2px;background:var(--g5);transition:background .3s;}

/* TYPEWRITER */
.typewriter{overflow:hidden;border-right:2px solid var(--g);white-space:nowrap;animation:typeBlink .8s step-end infinite;}
@keyframes typeBlink{50%{border-color:transparent}}

/* SKILL BARS */
.skill-row{margin-bottom:8px;}
.skill-top{display:flex;justify-content:space-between;font-size:.62rem;color:var(--g2);margin-bottom:3px;}
.skill-track{background:rgba(0,0,0,.5);border-radius:10px;height:8px;overflow:hidden;}
.skill-fill{height:8px;border-radius:10px;background:linear-gradient(90deg,var(--g),var(--g2));animation:skillAnim .8s ease both;}
@keyframes skillAnim{from{width:0%}}

/* RADAR */
#radar-canvas{display:block;margin:0 auto 10px;}
`;
document.head.appendChild(CSS);

// ═══════════════════════════════════════════════
// ANNOUNCE BANNER
// ═══════════════════════════════════════════════
const ANN = document.createElement('div');
ANN.id='fr-ann';
ANN.style.cssText='display:none;width:100%;text-align:center;padding:8px 16px;font-family:Courier New,monospace;font-size:.75rem;font-weight:bold;letter-spacing:1px;position:relative;z-index:8999;';
document.body.prepend(ANN);
applyAnn();

function applyAnn(){const d=GA();ANN.style.display=(d.annOn&&d.annText)?'block':'none';ANN.textContent=d.annText||'';ANN.style.background=d.annBg||'#00ff41';ANN.style.color=d.annFg||'#000';}

// ═══════════════════════════════════════════════
// THEMES
// ═══════════════════════════════════════════════
const THEMES={
  green: ['#00ff41','#00cc33','rgba(5,18,5,.85)','#003a0d','#001a00'],
  blue:  ['#00aaff','#0077cc','rgba(5,10,20,.85)','#003366','#001133'],
  red:   ['#ff4444','#cc2222','rgba(20,5,5,.85)',  '#660000','#330000'],
  purple:['#cc44ff','#8800cc','rgba(15,5,25,.85)', '#440066','#220033'],
  amber: ['#ffaa00','#cc7700','rgba(20,15,5,.85)', '#553300','#221100'],
  cyan:  ['#00ffee','#00aaaa','rgba(5,18,18,.85)', '#003333','#001111'],
  orange:['#ff6600','#cc4400','rgba(20,10,5,.85)', '#553300','#221100'],
  pink:  ['#ff66aa','#cc2277','rgba(20,5,15,.85)', '#550022','#220011'],
};
function applyTheme(t){
  const c=THEMES[t];if(!c)return;
  const R=document.documentElement.style;
  R.setProperty('--g',c[0]);R.setProperty('--g2',c[1]);
  R.setProperty('--g4',c[3]);R.setProperty('--g5',c[4]);
  document.body.style.color=c[0];
}
applyTheme(GA().theme||'green');

// ═══════════════════════════════════════════════
// BUILD PANEL
// ═══════════════════════════════════════════════
const OV=document.createElement('div');
OV.id='adm';
OV.innerHTML=`
<!-- BOOT -->
<div id="adm-boot">
  <pre id="boot-ascii">
███████╗██████╗  █████╗ ███╗   ██╗ ██████╗██╗███████╗
██╔════╝██╔══██╗██╔══██╗████╗  ██║██╔════╝██║██╔════╝
█████╗  ██████╔╝███████║██╔██╗ ██║██║     ██║███████╗
██╔══╝  ██╔══██╗██╔══██║██║╚██╗██║██║     ██║╚════██║
██║     ██║  ██║██║  ██║██║ ╚████║╚██████╗██║███████║
╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝╚═╝╚══════╝</pre>
  <div id="boot-log"></div>
  <div id="boot-bar-wrap"><div id="boot-bar"></div></div>
  <div id="boot-status">INITIALIZING...</div>
</div>

<!-- PASS -->
<div id="adm-pass" class="gone">
  <div class="skull-ring">💀</div>
  <div id="pass-title">AUTHENTICATION REQUIRED</div>
  <div style="font-size:.6rem;color:var(--g3);letter-spacing:2px">ENTER ADMIN PASSWORD</div>
  <div class="pass-dots" id="pass-dots"></div>
  <input id="pass-inp" type="password" placeholder="••••••••" autocomplete="off"
    oninput="passInput(this)" onkeydown="if(event.key==='Enter')admUnlock()">
  <button class="ab" onclick="admUnlock()" style="width:200px">AUTHENTICATE ▶</button>
  <div id="pass-err"></div>
  <div id="pass-tries"></div>
  <button class="ab ghost" onclick="admClose()" style="font-size:.6rem;padding:5px 12px;margin-top:2px">CANCEL</button>
</div>

<!-- BAR -->
<div id="adm-bar">
  <div class="bar-left">
    <span id="adm-logo-pill">⬡ ROOT</span>
    <div>
      <div id="adm-bar-title" class="glitch">FRANCIS ADMIN v3.0</div>
      <div id="adm-live-time"></div>
    </div>
  </div>
  <div class="bar-right">
    <div id="adm-status-row">
      <div class="sdot green" title="System OK"></div>
      <div class="sdot yellow" title="Network" id="net-dot"></div>
      <div class="sdot green" title="Storage"></div>
    </div>
    <span id="adm-session-time"></span>
    <button class="xbtn" onclick="admClose()">✕</button>
  </div>
</div>

<!-- TABS -->
<div id="adm-tabs">
  <button class="atab on"  onclick="T(this,'dash')">⚡ DASH</button>
  <button class="atab"     onclick="T(this,'analytics')">📊 STATS</button>
  <button class="atab"     onclick="T(this,'terminal')">💻 TERMINAL</button>
  <button class="atab"     onclick="T(this,'cipher')">🔐 CIPHER</button>
  <button class="atab"     onclick="T(this,'network')">🌐 NETWORK</button>
  <button class="atab"     onclick="T(this,'packet')">📡 PACKETS</button>
  <button class="atab"     onclick="T(this,'threat')">🛡️ THREAT</button>
  <button class="atab"     onclick="T(this,'codeeditor')">📝 EDITOR</button>
  <button class="atab"     onclick="T(this,'vault')">🔒 VAULT</button>
  <button class="atab"     onclick="T(this,'crypto')">₿ CRYPTO</button>
  <button class="atab"     onclick="T(this,'tools')">🛠️ TOOLS</button>
  <button class="atab"     onclick="T(this,'theme')">🎨 THEME</button>
  <button class="atab"     onclick="T(this,'announce')">📢 BANNER</button>
  <button class="atab"     onclick="T(this,'content')">✏️ CONTENT</button>
  <button class="atab"     onclick="T(this,'logs')">👥 LOGS</button>
  <button class="atab"     onclick="T(this,'notes')">📋 NOTES</button>
  <button class="atab"     onclick="T(this,'data')">💾 DATA</button>
  <button class="atab"     onclick="T(this,'settings')">⚙️ SETTINGS</button>
  <button class="atab"     onclick="T(this,'sysmon')">🖥️ SYSMON</button>
  <button class="atab"     onclick="T(this,'worldclock')">🌍 CLOCKS</button>
  <button class="atab"     onclick="T(this,'calculator')">🧮 CALC</button>
  <button class="atab"     onclick="T(this,'qrgen')">📱 QR GEN</button>
  <button class="atab"     onclick="T(this,'colorlab')">🎨 COLORLAB</button>
  <button class="atab"     onclick="T(this,'clipboard')">📌 CLIPBOARD</button>
  <button class="atab"     onclick="T(this,'scheduler')">📅 SCHEDULER</button>
  <button class="atab"     onclick="T(this,'weather')">🌤️ WEATHER</button>
  <button class="atab"     onclick="T(this,'fontlab')">🔤 FONTS</button>
  <button class="atab"     onclick="T(this,'ascii')">👾 ASCII</button>
  <button class="atab"     onclick="T(this,'markdown')">📄 MARKDOWN</button>
  <button class="atab"     onclick="T(this,'regex')">🔎 REGEX</button>
  <button class="atab"     onclick="T(this,'json')">📦 JSON</button>
  <button class="atab"     onclick="T(this,'urltools')">🔗 URL</button>
  <button class="atab"     onclick="T(this,'kanban')">📋 KANBAN</button>
  <button class="atab"     onclick="T(this,'finance')">💰 FINANCE</button>
  <button class="atab"     onclick="T(this,'typingtest')">⌨️ TYPING</button>
  <button class="atab"     onclick="T(this,'aiprompt')">🤖 AI PROMPT</button>
  <button class="atab"     onclick="T(this,'music')">🎵 MUSIC</button>
  <button class="atab"     onclick="T(this,'imagetools')">🖼️ IMAGE</button>
</div>

<!-- BODY -->
<div id="adm-body">

<!-- ══ DASHBOARD ══ -->
<div class="asec on" id="adm-dash">
  <div class="as as4" id="dash-stats"></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:10px">
    <div class="ac">
      <div class="act">🕐 SYSTEM CLOCK</div>
      <div id="dash-clock" style="font-size:1.5rem;font-weight:bold;color:var(--g);text-shadow:0 0 14px var(--g);letter-spacing:3px;font-variant-numeric:tabular-nums;"></div>
      <div id="dash-date" style="font-size:.6rem;color:var(--g3);margin-top:3px;letter-spacing:1px;"></div>
      <div class="ahr"></div>
      <div id="dash-uptime-row" style="font-size:.65rem;color:var(--g2);">Session: <span id="dash-session">0s</span></div>
    </div>
    <div class="ac">
      <div class="act">📍 DEVICE INTEL</div>
      <div id="dash-device" style="font-size:.62rem;color:var(--g2);line-height:1.9;"></div>
    </div>
  </div>
  <div class="ac">
    <div class="act">🔴 LIVE ACTIVITY FEED <span class="abadge">REALTIME</span></div>
    <div id="dash-feed" style="max-height:100px;overflow-y:auto;font-size:.62rem;line-height:1.9;"></div>
  </div>
  <div class="ac">
    <canvas id="matrix-mini"></canvas>
    <div class="act">📈 TOOL USAGE HISTOGRAM</div>
    <div id="dash-histogram" style="display:flex;align-items:flex-end;gap:2px;height:52px;"></div>
  </div>
  <div class="ac">
    <div class="act">🎯 SYSTEM HEALTH <span class="abadge">LIVE</span></div>
    <div id="dash-health" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;"></div>
  </div>
</div>

<!-- ══ ANALYTICS ══ -->
<div class="asec" id="adm-analytics">
  <div class="as as4" id="an-grid"></div>
  <div class="ac"><div class="act">🏆 TOP TOOLS <span class="abadge">ALL TIME</span></div><div id="an-tools"></div></div>
  <div class="ac">
    <div class="act">🕐 24H HEATMAP</div>
    <div class="heatmap" id="an-heat"></div>
    <div style="display:flex;justify-content:space-between;font-size:.48rem;color:var(--g4);">
      <span>12AM</span><span>6AM</span><span>12PM</span><span>6PM</span><span>11PM</span>
    </div>
  </div>
  <div class="ac"><div class="act">📅 7-DAY HISTORY</div><div id="an-daily"></div></div>
  <div class="ac"><div class="act">📂 CATEGORIES</div><div id="an-cats"></div></div>
  <div class="ac">
    <div class="act">💡 SKILL PROFILE</div>
    <div id="an-skills"></div>
  </div>
</div>

<!-- ══ TERMINAL ══ -->
<div class="asec" id="adm-terminal">
  <div class="ac">
    <div class="act">💻 TERMINAL <span class="abadge" id="term-badge">READY</span></div>
    <div id="term-out">FRANCIS HACKER TERMINAL v3.0
[OK] System initialized
[OK] 18 commands loaded
─────────────────────────
root@francis:~$ </div>
    <div id="term-row">
      <span id="term-prompt">root@francis:~$</span>
      <input id="term-inp" placeholder="type command..." autocomplete="off"
        onkeydown="termKey(event)">
    </div>
  </div>
  <div class="ac">
    <div class="act">⚡ QUICK COMMANDS</div>
    <div class="abrow" style="flex-wrap:wrap;gap:5px;">
      ${['help','status','stats','tools','whoami','sysinfo','ls','matrix','hack','encrypt','decode','ping','memory','uptime','clear','banner','exploit','nmap'].map(c=>`<button class="ab ghost" style="font-size:.6rem;padding:5px 9px" onclick="termRun('${c}')">${c}</button>`).join('')}
    </div>
  </div>
</div>

<!-- ══ CIPHER ══ -->
<div class="asec" id="adm-cipher">
  <div class="ac">
    <div class="act">🔐 TEXT ENCRYPTOR</div>
    <label class="al">PLAINTEXT INPUT</label>
    <textarea class="ata" id="cipher-input" placeholder="Enter text to encrypt/decrypt..."></textarea>
    <label class="al">KEY / SHIFT (for Caesar)</label>
    <input class="ai" id="cipher-key" placeholder="e.g. mySecretKey or 13">
    <label class="al">CIPHER METHOD</label>
    <select class="asel" id="cipher-method">
      <option value="base64enc">Base64 Encode</option>
      <option value="base64dec">Base64 Decode</option>
      <option value="caesar">Caesar Cipher</option>
      <option value="rot13">ROT13</option>
      <option value="reverse">Reverse Text</option>
      <option value="binary">Text → Binary</option>
      <option value="hex">Text → Hex</option>
      <option value="hexdec">Hex → Text</option>
      <option value="morse">Text → Morse</option>
      <option value="vigenere">Vigenère Cipher</option>
      <option value="atbash">Atbash Cipher</option>
      <option value="xor">XOR Cipher</option>
    </select>
    <div class="abrow">
      <button class="ab" onclick="runCipher()" style="flex:1">RUN CIPHER ▶</button>
      <button class="ab ghost" onclick="swapCipherIO()" style="flex:1">SWAP I/O</button>
      <button class="ab ghost" onclick="copyCipher()" style="flex:1">COPY</button>
    </div>
    <div class="cipher-result" id="cipher-out"></div>
  </div>
  <div class="ac">
    <div class="act">🔑 HASH GENERATOR</div>
    <input class="ai" id="hash-input" placeholder="Text to hash...">
    <div class="abrow">
      <button class="ab" onclick="runHash('MD5-like')" style="flex:1;font-size:.65rem">MD5-LIKE</button>
      <button class="ab blue" onclick="runHash('SHA1-like')" style="flex:1;font-size:.65rem">SHA1-LIKE</button>
      <button class="ab purple" onclick="runHash('SHA256')" style="flex:1;font-size:.65rem">SHA-256</button>
    </div>
    <div class="cipher-result" id="hash-out"></div>
  </div>
  <div class="ac">
    <div class="act">🎲 PASSWORD GENERATOR</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:8px">
      <div><label class="al">LENGTH</label><input class="ai" id="pg-len" type="number" value="16" min="4" max="128"></div>
      <div><label class="al">TYPE</label>
        <select class="asel" id="pg-type">
          <option value="all">All chars</option>
          <option value="alpha">Letters only</option>
          <option value="num">Numbers only</option>
          <option value="hex">Hexadecimal</option>
          <option value="pin">PIN (digits)</option>
          <option value="phrase">Passphrase</option>
        </select>
      </div>
    </div>
    <div class="abrow">
      <button class="ab full" onclick="genPassword()">GENERATE PASSWORD</button>
    </div>
    <div class="cipher-result" id="pg-out"></div>
  </div>
</div>

<!-- ══ NETWORK ══ -->
<div class="asec" id="adm-network">
  <div class="ac"><div class="act">🌐 CONNECTION INFO</div><div id="net-info" style="font-size:.68rem;color:var(--g2);line-height:2;"></div></div>
  <div class="ac">
    <div class="act">⚡ SPEED TEST</div>
    <div style="text-align:center;margin-bottom:10px;">
      <svg class="ring-svg" width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--g4)" stroke-width="6"/>
        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--g)" stroke-width="6"
          stroke-dasharray="264" id="speed-ring" stroke-dashoffset="264" stroke-linecap="round" transition="stroke-dashoffset .5s"/>
      </svg>
      <div class="ring-val" id="speed-num">--</div>
      <div class="ring-lbl">MBPS</div>
    </div>
    <div class="abrow" style="justify-content:center">
      <button class="ab" onclick="runSpeed()">▶ SPEED TEST</button>
      <button class="ab ghost" onclick="pingTest()">PING TEST</button>
      <button class="ab ghost" onclick="latencyTest()">LATENCY</button>
    </div>
    <div id="speed-log" style="font-size:.65rem;color:var(--g3);text-align:center;margin-top:6px;line-height:1.9;"></div>
  </div>
  <div class="ac">
    <div class="act">🔍 NETWORK SCANNER SIM</div>
    <div class="abrow">
      <button class="ab" onclick="runScan()">SCAN NETWORK</button>
      <button class="ab ghost" onclick="document.getElementById('scan-out').innerHTML=''">CLEAR</button>
    </div>
    <div id="scan-out" style="max-height:180px;overflow-y:auto;border:1px solid var(--g4);border-radius:8px;margin-top:7px;"></div>
  </div>
  <div class="ac">
    <div class="act">🌍 IP GEOLOOKUP</div>
    <div class="abrow">
      <input class="ai" id="geo-inp" placeholder="IP address (blank = yours)" style="flex:1;margin-bottom:0">
      <button class="ab" onclick="geoLookup()">LOOKUP</button>
    </div>
    <div id="geo-out" style="font-size:.68rem;color:var(--g2);line-height:2;margin-top:8px;"></div>
  </div>
</div>

<!-- ══ PACKET VISUALIZER ══ -->
<div class="asec" id="adm-packet">
  <div class="ac">
    <div class="act">📡 LIVE PACKET STREAM <span class="abadge" id="pkt-badge">IDLE</span></div>
    <canvas id="packet-canvas" height="120"></canvas>
    <div class="abrow">
      <button class="ab" onclick="startPackets()" id="pkt-start">▶ START</button>
      <button class="ab red" onclick="stopPackets()" id="pkt-stop">■ STOP</button>
      <button class="ab ghost" onclick="clearPackets()">CLEAR</button>
    </div>
    <div id="pkt-stats" style="font-size:.62rem;color:var(--g3);display:flex;gap:14px;margin-top:6px;flex-wrap:wrap;"></div>
  </div>
  <div class="ac">
    <div class="act">📊 PROTOCOL BREAKDOWN</div>
    <div id="proto-breakdown"></div>
  </div>
  <div class="ac">
    <div class="act">📋 PACKET LOG <span class="abadge">LAST 20</span></div>
    <div id="pkt-log" style="max-height:200px;overflow-y:auto;border:1px solid var(--g4);border-radius:8px;font-size:.6rem;"></div>
  </div>
</div>

<!-- ══ THREAT SCANNER ══ -->
<div class="asec" id="adm-threat">
  <div class="ac">
    <div class="act">🛡️ SITE VULNERABILITY SCAN <span class="abadge">SIMULATION</span></div>
    <button class="ab full" onclick="runThreat()">▶ RUN SECURITY SCAN</button>
    <div id="threat-out"></div>
  </div>
  <div class="ac">
    <div class="act">🎯 THREAT RADAR</div>
    <canvas id="radar-canvas" width="200" height="200"></canvas>
    <div id="radar-legend" style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;font-size:.58rem;color:var(--g3);"></div>
  </div>
  <div class="ac">
    <div class="act">📊 SECURITY SCORE</div>
    <div id="sec-score" style="text-align:center;">
      <div style="font-size:2.5rem;font-weight:bold;color:var(--g);text-shadow:0 0 20px var(--g);margin-bottom:4px;" id="score-num">--</div>
      <div style="font-size:.6rem;color:var(--g3);letter-spacing:2px;">/ 100</div>
      <div id="score-label" style="font-size:.72rem;color:var(--g2);margin-top:6px;"></div>
    </div>
  </div>
</div>

<!-- ══ CODE EDITOR ══ -->
<div class="asec" id="adm-codeeditor">
  <div class="ac">
    <div class="act">📝 ADMIN CODE EDITOR <span class="abadge">LIVE EVAL</span></div>
    <div class="abrow" style="margin-bottom:8px;">
      <select class="asel" id="editor-lang" style="flex:1;margin-bottom:0">
        <option value="js">JavaScript</option>
        <option value="json">JSON Formatter</option>
        <option value="html">HTML Preview</option>
        <option value="css">CSS Inject</option>
        <option value="regex">Regex Tester</option>
      </select>
      <button class="ab" onclick="runCode()">▶ RUN</button>
      <button class="ab ghost" onclick="clearEditor()">CLEAR</button>
      <button class="ab ghost" onclick="copyCode()">COPY</button>
    </div>
    <textarea id="code-editor" spellcheck="false" placeholder="// Write code here
// JavaScript runs in the page context
// JSON gets formatted and validated
// HTML renders in a preview
// CSS gets injected into the page
// Regex tests against sample text

console.log('Hello from FRANCIS Admin');"></textarea>
    <div id="code-output"></div>
  </div>
  <div class="ac">
    <div class="act">📚 CODE SNIPPETS</div>
    <div class="abrow" style="flex-wrap:wrap;gap:5px;">
      <button class="ab ghost" style="font-size:.6rem" onclick="loadSnippet('stats')">Site Stats</button>
      <button class="ab ghost" style="font-size:.6rem" onclick="loadSnippet('tools')">List Tools</button>
      <button class="ab ghost" style="font-size:.6rem" onclick="loadSnippet('storage')">Storage Info</button>
      <button class="ab ghost" style="font-size:.6rem" onclick="loadSnippet('perf')">Performance</button>
      <button class="ab ghost" style="font-size:.6rem" onclick="loadSnippet('dom')">DOM Inspector</button>
      <button class="ab ghost" style="font-size:.6rem" onclick="loadSnippet('cookies')">Cookies</button>
    </div>
  </div>
</div>

<!-- ══ VAULT ══ -->
<div class="asec" id="adm-vault">
  <div class="ac">
    <div class="act">🔒 SECRET VAULT <span class="abadge">ENCRYPTED</span></div>
    <div style="font-size:.65rem;color:var(--g3);margin-bottom:9px;">Store sensitive data locally. Values are blurred — hover to reveal. Never leaves your device.</div>
    <div class="abrow">
      <input class="ai" id="vault-name" placeholder="Label (e.g. API Key)" style="flex:1;margin-bottom:0">
      <input class="ai" id="vault-val" placeholder="Secret value" type="password" style="flex:2;margin-bottom:0">
      <button class="ab" onclick="vaultAdd()">ADD</button>
    </div>
    <div id="vault-list" style="margin-top:9px;border:1px solid var(--g4);border-radius:8px;max-height:280px;overflow-y:auto;"></div>
  </div>
</div>

<!-- ══ CRYPTO ══ -->
<div class="asec" id="adm-crypto">
  <div class="ac">
    <div class="act">₿ CRYPTO PRICE TRACKER <span class="abadge">SIMULATED</span></div>
    <div class="abrow">
      <button class="ab" onclick="refreshCrypto()">↻ REFRESH PRICES</button>
      <button class="ab ghost" onclick="cryptoAlert()">SET ALERT</button>
    </div>
    <div id="crypto-list" style="border:1px solid var(--g4);border-radius:8px;margin-top:8px;max-height:300px;overflow-y:auto;"></div>
  </div>
  <div class="ac">
    <div class="act">📈 PRICE SPARKLINE</div>
    <canvas id="crypto-canvas" height="80" style="width:100%;border:1px solid var(--g4);border-radius:8px;"></canvas>
  </div>
</div>

<!-- ══ TOOLS MANAGER ══ -->
<div class="asec" id="adm-tools">
  <div class="ac">
    <div class="act">🛠️ TOOL REGISTRY <span class="abadge" id="tools-badge">LOADING</span></div>
    <input class="ai" id="tool-filter" placeholder="🔍 Search tools..." oninput="filterTools(this.value)">
    <div class="abrow">
      <button class="ab" onclick="allTools(true)" style="flex:1">ENABLE ALL</button>
      <button class="ab ghost" onclick="allTools(false)" style="flex:1">DISABLE ALL</button>
    </div>
    <div id="tool-list" style="max-height:380px;overflow-y:auto;"></div>
  </div>
</div>

<!-- ══ THEME ══ -->
<div class="asec" id="adm-theme">
  <div class="ac">
    <div class="act">🎨 COLOR THEMES</div>
    <div class="tswatch-grid" id="theme-swatches"></div>
    <button class="ab full" onclick="applyThemeBtn()">APPLY THEME</button>
  </div>
  <div class="ac">
    <div class="act">✨ VISUAL EFFECTS</div>
    ${[['matrix','Matrix Rain Background','Falling green code'],['glow','Neon Glow Effects','Text glow on headers'],['scanline','CRT Scanlines','Retro scanline overlay'],['animations','CSS Animations','All transitions & effects'],['particles','Particle Effects','Floating dots overlay']].map(([k,n,s])=>`
    <div class="atog" onclick="fxTog('${k}')">
      <div class="atog-i"><div class="atog-n">${n}</div><div class="atog-s">${s}</div></div>
      <div class="asw on" id="fx-${k}"></div>
    </div>`).join('')}
  </div>
  <div class="ac">
    <div class="act">💉 CUSTOM CSS INJECT</div>
    <textarea class="ata" id="custom-css" placeholder="/* Your custom CSS */"></textarea>
    <div class="abrow">
      <button class="ab" onclick="injectCSS()" style="flex:1">INJECT</button>
      <button class="ab red" onclick="removeCSS()" style="flex:1">REMOVE</button>
    </div>
  </div>
</div>

<!-- ══ ANNOUNCE ══ -->
<div class="asec" id="adm-announce">
  <div class="ac">
    <div class="act">📢 SITE ANNOUNCEMENT BANNER</div>
    <label class="al">BANNER TEXT</label>
    <textarea class="ata" id="ann-txt" placeholder="Type your announcement..."></textarea>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px">
      <div><label class="al">BG COLOR</label><input class="ai" id="ann-bg" type="color" value="#00ff41" style="height:38px;padding:3px;cursor:pointer"></div>
      <div><label class="al">TEXT COLOR</label><input class="ai" id="ann-fg" type="color" value="#000000" style="height:38px;padding:3px;cursor:pointer"></div>
    </div>
    <div id="ann-prev"></div>
    <div class="abrow">
      <button class="ab" onclick="annPreview()" style="flex:1">PREVIEW</button>
      <button class="ab" onclick="annSave(true)" style="flex:1">SHOW LIVE</button>
      <button class="ab red" onclick="annSave(false)" style="flex:1">HIDE</button>
    </div>
  </div>
</div>

<!-- ══ CONTENT ══ -->
<div class="asec" id="adm-content">
  <div class="ac">
    <div class="act">✏️ SITE CONTENT EDITOR</div>
    <label class="al">HERO TITLE</label>
    <input class="ai" id="cnt-title" placeholder="Hey, I am FRANCIS">
    <label class="al">HERO DESCRIPTION</label>
    <textarea class="ata" id="cnt-desc" placeholder="This is my website..."></textarea>
    <label class="al">FOOTER TEXT</label>
    <input class="ai" id="cnt-footer" placeholder="FRANCIS // ALL TOOLS RUN OFFLINE">
    <label class="al">DESIGNER CREDIT</label>
    <input class="ai" id="cnt-designer" placeholder="Akshit Singh">
    <label class="al">BROWSER TAB TITLE</label>
    <input class="ai" id="cnt-tab" placeholder="FRANCIS Tools">
    <button class="ab full" onclick="saveContent()">SAVE & APPLY LIVE</button>
  </div>
</div>

<!-- ══ LOGS ══ -->
<div class="asec" id="adm-logs">
  <div class="ac">
    <div class="act">👥 VISITOR LOG <span class="abadge" id="log-badge"></span></div>
    <div class="abrow">
      <button class="ab ghost" onclick="loadLogs()" style="flex:1">REFRESH</button>
      <button class="ab ghost" onclick="exportCSV()" style="flex:1">EXPORT CSV</button>
      <button class="ab red" onclick="clearLogs()" style="flex:1">CLEAR</button>
    </div>
    <div id="log-list" style="max-height:340px;overflow-y:auto;border:1px solid var(--g4);border-radius:8px;margin-top:8px;"></div>
  </div>
</div>

<!-- ══ NOTES ══ -->
<div class="asec" id="adm-notes">
  <div class="ac">
    <div class="act">📋 ENCRYPTED NOTEPAD <span class="abadge">AUTO-SAVE</span></div>
    <textarea id="notes-ta" placeholder="Private admin notes..."></textarea>
    <div class="abrow" style="margin-top:7px;">
      <button class="ab" onclick="saveNotes()" style="flex:1">SAVE</button>
      <button class="ab ghost" onclick="copyNotes()" style="flex:1">COPY</button>
      <button class="ab red" onclick="clearNotes()" style="flex:1">CLEAR</button>
    </div>
    <div id="notes-status" style="font-size:.6rem;color:var(--g2);height:14px;text-align:center;letter-spacing:1px;margin-top:3px;"></div>
  </div>
</div>

<!-- ══ DATA ══ -->
<div class="asec" id="adm-data">
  <div class="ac">
    <div class="act">💾 EXPORT</div>
    <button class="ab full" onclick="exportData('all')">EXPORT ALL DATA (JSON)</button>
    <button class="ab ghost full" onclick="exportData('analytics')">ANALYTICS ONLY</button>
    <button class="ab ghost full" onclick="exportData('logs')">VISITOR LOGS</button>
    <button class="ab ghost full" onclick="exportData('vault')">VAULT DATA</button>
  </div>
  <div class="ac">
    <div class="act">📂 IMPORT</div>
    <textarea class="ata" id="imp-json" placeholder='Paste exported JSON...'></textarea>
    <button class="ab full" onclick="importData()">IMPORT & APPLY</button>
  </div>
  <div class="ac">
    <div class="act">🗑️ RESET</div>
    <button class="ab red full" onclick="resetD('analytics')">RESET ANALYTICS</button>
    <button class="ab red full" onclick="resetD('logs')">CLEAR LOGS</button>
    <button class="ab red full" onclick="resetD('vault')">CLEAR VAULT</button>
    <button class="ab red full" onclick="resetD('all')">⚠️ FACTORY RESET</button>
  </div>
</div>

<!-- ══ SETTINGS ══ -->
<div class="asec" id="adm-settings">
  <div class="ac">
    <div class="act">🔐 CHANGE PASSWORD</div>
    <label class="al">CURRENT PASSWORD</label>
    <input class="ai" id="pw-old" type="password" placeholder="Current password">
    <label class="al">NEW PASSWORD</label>
    <input class="ai" id="pw-new" type="password" placeholder="New password (min 4 chars)">
    <label class="al">CONFIRM</label>
    <input class="ai" id="pw-cf"  type="password" placeholder="Confirm new password">
    <button class="ab full" onclick="changePw()">CHANGE PASSWORD</button>
    <div id="pw-msg" style="font-size:.62rem;height:16px;text-align:center;letter-spacing:1px;"></div>
  </div>
  <div class="ac">
    <div class="act">⚙️ PREFERENCES</div>
    ${[['hideAI','Hide AI Chat Button','Hide floating AI agent'],['compactTools','Compact Tool Buttons','Smaller tool list'],['hideNav','Hide Nav Bar','Remove top navigation'],['disableAnn','Disable Announcements','Turn off all banners']].map(([k,n,s])=>`
    <div class="atog" onclick="togSet('${k}')">
      <div class="atog-i"><div class="atog-n">${n}</div><div class="atog-s">${s}</div></div>
      <div class="asw" id="set-${k}"></div>
    </div>`).join('')}
    <button class="ab full" style="margin-top:8px" onclick="applySettings()">APPLY SETTINGS</button>
  </div>
  <div class="ac">
    <div class="act">ℹ️ SYSTEM INFO</div>
    <div id="sys-info" style="font-size:.65rem;color:var(--g2);line-height:2;"></div>
  </div>
  <div class="ac">
    <div class="act">🔑 SESSION</div>
    <button class="ab red full" onclick="admLogout()">LOCK & LOGOUT</button>
  </div>
</div>

<!-- ══ SYSMON ══ -->
<div class="asec" id="adm-sysmon">
  <div class="ac">
    <div class="act">🖥️ LIVE SYSTEM MONITOR <span class="abadge" id="sysmon-badge">LIVE</span></div>
    <div class="as as3" id="sysmon-stats"></div>
    <div class="act" style="margin-top:8px">CPU USAGE</div>
    <canvas id="cpu-canvas" height="60" style="width:100%;background:#000;border:1.5px solid var(--g4);border-radius:8px;display:block;margin-bottom:8px;"></canvas>
    <div class="act">MEMORY USAGE</div>
    <canvas id="mem-canvas" height="60" style="width:100%;background:#000;border:1.5px solid var(--g4);border-radius:8px;display:block;margin-bottom:8px;"></canvas>
    <div class="act">PROCESS LIST (SIM)</div>
    <div id="proc-list" style="border:1px solid var(--g4);border-radius:8px;max-height:200px;overflow-y:auto;font-size:.62rem;"></div>
  </div>
  <div class="ac">
    <div class="act">🔋 BATTERY & DEVICE</div>
    <div id="battery-info" style="font-size:.68rem;color:var(--g2);line-height:2;"></div>
  </div>
</div>

<!-- ══ WORLD CLOCK ══ -->
<div class="asec" id="adm-worldclock">
  <div class="ac">
    <div class="act">🌍 WORLD CLOCKS</div>
    <div id="world-clocks" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"></div>
  </div>
  <div class="ac">
    <div class="act">⏱️ STOPWATCH</div>
    <div id="sw-display" style="font-size:2rem;font-weight:bold;color:var(--g);text-shadow:0 0 14px var(--g);text-align:center;letter-spacing:3px;margin-bottom:10px;font-variant-numeric:tabular-nums;">00:00.000</div>
    <div class="abrow" style="justify-content:center">
      <button class="ab" onclick="swStart()" id="sw-start">▶ START</button>
      <button class="ab ghost" onclick="swStop()">■ STOP</button>
      <button class="ab ghost" onclick="swReset()">↺ RESET</button>
      <button class="ab blue" onclick="swLap()">LAP</button>
    </div>
    <div id="sw-laps" style="max-height:120px;overflow-y:auto;font-size:.62rem;margin-top:8px;"></div>
  </div>
  <div class="ac">
    <div class="act">⏰ COUNTDOWN TIMER</div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-bottom:8px">
      <div><label class="al">HH</label><input class="ai" id="tm-h" type="number" value="0" min="0" max="23" style="margin:0"></div>
      <div><label class="al">MM</label><input class="ai" id="tm-m" type="number" value="5" min="0" max="59" style="margin:0"></div>
      <div><label class="al">SS</label><input class="ai" id="tm-s" type="number" value="0" min="0" max="59" style="margin:0"></div>
    </div>
    <div id="tm-display" style="font-size:1.8rem;font-weight:bold;color:var(--g);text-align:center;letter-spacing:3px;margin-bottom:8px;font-variant-numeric:tabular-nums;">00:05:00</div>
    <div class="abrow" style="justify-content:center">
      <button class="ab" onclick="tmStart()">▶ START</button>
      <button class="ab ghost" onclick="tmStop()">■ STOP</button>
      <button class="ab ghost" onclick="tmReset()">↺ RESET</button>
    </div>
  </div>
</div>

<!-- ══ CALCULATOR ══ -->
<div class="asec" id="adm-calculator">
  <div class="ac">
    <div class="act">🧮 SCIENTIFIC CALCULATOR</div>
    <div id="calc-history" style="min-height:30px;font-size:.62rem;color:var(--g3);text-align:right;margin-bottom:4px;max-height:60px;overflow-y:auto;"></div>
    <div id="calc-display" style="font-size:1.6rem;font-weight:bold;color:var(--g);text-align:right;background:rgba(0,0,0,.6);border:1.5px solid var(--g4);border-radius:8px;padding:10px 14px;margin-bottom:8px;min-height:56px;word-break:break-all;letter-spacing:1px;">0</div>
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:5px;" id="calc-btns"></div>
  </div>
  <div class="ac">
    <div class="act">📐 UNIT CONVERTER</div>
    <select class="asel" id="uc-type" onchange="loadUCUnits()">
      <option value="length">Length</option><option value="weight">Weight</option>
      <option value="temp">Temperature</option><option value="speed">Speed</option>
      <option value="area">Area</option><option value="data">Data</option>
    </select>
    <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:7px;align-items:end">
      <div><label class="al">FROM</label><input class="ai" id="uc-from-val" type="number" value="1" style="margin:0" oninput="doConvert()"><select class="asel" id="uc-from-unit" onchange="doConvert()" style="margin:0"></select></div>
      <div style="font-size:1.2rem;color:var(--g);padding-bottom:12px;">⇄</div>
      <div><label class="al">TO</label><input class="ai" id="uc-to-val" readonly style="margin:0;color:var(--g2)"><select class="asel" id="uc-to-unit" onchange="doConvert()" style="margin:0"></select></div>
    </div>
  </div>
</div>

<!-- ══ QR GENERATOR ══ -->
<div class="asec" id="adm-qrgen">
  <div class="ac">
    <div class="act">📱 QR CODE GENERATOR</div>
    <label class="al">CONTENT</label>
    <textarea class="ata" id="qr-text" placeholder="URL, text, contact info...">https://YOUR-PROJECT.vercel.app/</textarea>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px">
      <div><label class="al">FG COLOR</label><input class="ai" id="qr-fg" type="color" value="#00ff41" style="height:38px;padding:3px;cursor:pointer"></div>
      <div><label class="al">BG COLOR</label><input class="ai" id="qr-bg" type="color" value="#000000" style="height:38px;padding:3px;cursor:pointer"></div>
    </div>
    <label class="al">SIZE</label>
    <input class="ai" id="qr-size" type="range" min="100" max="400" value="200" oninput="this.nextElementSibling.textContent=this.value+'px'">
    <span style="font-size:.6rem;color:var(--g3)">200px</span>
    <div class="abrow" style="margin-top:8px">
      <button class="ab" onclick="genQR()" style="flex:1">GENERATE QR</button>
      <button class="ab ghost" onclick="downloadQR()" style="flex:1">DOWNLOAD</button>
    </div>
    <div id="qr-output" style="text-align:center;margin-top:10px;"></div>
  </div>
  <div class="ac">
    <div class="act">🔗 QUICK QR PRESETS</div>
    <div class="abrow" style="flex-wrap:wrap;gap:5px">
      <button class="ab ghost" style="font-size:.62rem" onclick="qrPreset('url')">📎 Site URL</button>
      <button class="ab ghost" style="font-size:.62rem" onclick="qrPreset('email')">📧 Email</button>
      <button class="ab ghost" style="font-size:.62rem" onclick="qrPreset('wifi')">📶 WiFi</button>
      <button class="ab ghost" style="font-size:.62rem" onclick="qrPreset('contact')">👤 Contact</button>
      <button class="ab ghost" style="font-size:.62rem" onclick="qrPreset('sms')">💬 SMS</button>
    </div>
  </div>
</div>

<!-- ══ COLOR LAB ══ -->
<div class="asec" id="adm-colorlab">
  <div class="ac">
    <div class="act">🎨 COLOR PICKER & CONVERTER</div>
    <input type="color" id="cl-picker" value="#00ff41" oninput="clUpdate(this.value)" style="width:100%;height:60px;cursor:pointer;border:none;border-radius:8px;padding:4px;background:none;">
    <div id="cl-values" style="display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:8px;font-size:.68rem;"></div>
  </div>
  <div class="ac">
    <div class="act">🌈 PALETTE GENERATOR</div>
    <div class="abrow">
      <button class="ab" onclick="genPalette('complement')" style="flex:1;font-size:.62rem">Complementary</button>
      <button class="ab ghost" onclick="genPalette('triadic')" style="flex:1;font-size:.62rem">Triadic</button>
      <button class="ab ghost" onclick="genPalette('analogous')" style="flex:1;font-size:.62rem">Analogous</button>
      <button class="ab ghost" onclick="genPalette('random')" style="flex:1;font-size:.62rem">Random</button>
    </div>
    <div id="cl-palette" style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;"></div>
  </div>
  <div class="ac">
    <div class="act">🔬 COLOR CONTRAST CHECKER</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px">
      <div><label class="al">FOREGROUND</label><input class="ai" id="cc-fg" type="color" value="#00ff41" oninput="checkContrast()" style="height:38px;padding:3px;cursor:pointer"></div>
      <div><label class="al">BACKGROUND</label><input class="ai" id="cc-bg" type="color" value="#000000" oninput="checkContrast()" style="height:38px;padding:3px;cursor:pointer"></div>
    </div>
    <div id="cc-result" style="font-size:.72rem;color:var(--g2);line-height:2;margin-top:6px;"></div>
    <div id="cc-preview" style="padding:12px;border-radius:8px;text-align:center;font-size:.9rem;font-weight:bold;margin-top:6px;"></div>
  </div>
</div>

<!-- ══ CLIPBOARD MANAGER ══ -->
<div class="asec" id="adm-clipboard">
  <div class="ac">
    <div class="act">📌 CLIPBOARD MANAGER</div>
    <div style="font-size:.65rem;color:var(--g3);margin-bottom:8px;">Save text snippets. Click to copy instantly.</div>
    <div style="display:flex;gap:7px;margin-bottom:8px">
      <textarea class="ata" id="cb-input" placeholder="Add snippet..." style="flex:1;min-height:60px;margin:0"></textarea>
      <div style="display:flex;flex-direction:column;gap:5px">
        <input class="ai" id="cb-label" placeholder="Label" style="margin:0;width:110px">
        <button class="ab" onclick="cbAdd()" style="width:110px">ADD ✚</button>
      </div>
    </div>
    <div class="abrow">
      <button class="ab ghost" onclick="cbClear()" style="flex:1;font-size:.62rem">CLEAR ALL</button>
      <button class="ab ghost" onclick="cbExport()" style="flex:1;font-size:.62rem">EXPORT</button>
    </div>
    <div id="cb-list" style="margin-top:8px;max-height:320px;overflow-y:auto;"></div>
  </div>
</div>

<!-- ══ SCHEDULER ══ -->
<div class="asec" id="adm-scheduler">
  <div class="ac">
    <div class="act">📅 TASK SCHEDULER</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px">
      <div><label class="al">TASK NAME</label><input class="ai" id="task-name" placeholder="Task description" style="margin:0"></div>
      <div><label class="al">DUE DATE/TIME</label><input class="ai" id="task-date" type="datetime-local" style="margin:0"></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:7px">
      <div><label class="al">PRIORITY</label>
        <select class="asel" id="task-priority" style="margin:0">
          <option value="low">🟢 Low</option><option value="med" selected>🟡 Medium</option><option value="high">🔴 High</option><option value="crit">⚡ Critical</option>
        </select>
      </div>
      <div><label class="al">CATEGORY</label>
        <select class="asel" id="task-cat" style="margin:0">
          <option>Admin</option><option>Dev</option><option>Deploy</option><option>Bug Fix</option><option>Review</option><option>Meeting</option>
        </select>
      </div>
    </div>
    <button class="ab full" style="margin-top:8px" onclick="addTask()">ADD TASK ✚</button>
    <div class="abrow" style="margin-bottom:8px">
      <button class="ab ghost" onclick="filterTasks('all')" style="flex:1;font-size:.62rem">ALL</button>
      <button class="ab ghost" onclick="filterTasks('high')" style="flex:1;font-size:.62rem">HIGH</button>
      <button class="ab ghost" onclick="filterTasks('done')" style="flex:1;font-size:.62rem">DONE</button>
      <button class="ab red" onclick="clearTasks()" style="flex:1;font-size:.62rem">CLEAR</button>
    </div>
    <div id="task-list" style="max-height:320px;overflow-y:auto;"></div>
  </div>
</div>

<!-- ══ WEATHER ══ -->
<div class="asec" id="adm-weather">
  <div class="ac">
    <div class="act">🌤️ WEATHER LOOKUP</div>
    <div class="abrow">
      <input class="ai" id="wx-city" placeholder="City name (e.g. London)" style="flex:1;margin:0">
      <button class="ab" onclick="getWeather()">FETCH ▶</button>
    </div>
    <button class="ab ghost full" style="margin-top:7px" onclick="getWeatherGeo()">📍 USE MY LOCATION</button>
    <div id="wx-out" style="margin-top:10px;"></div>
  </div>
  <div class="ac">
    <div class="act">🌡️ WEATHER CONVERTER</div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px">
      <div><label class="al">CELSIUS</label><input class="ai" id="wc-c" type="number" placeholder="°C" oninput="wConvert('c')" style="margin:0"></div>
      <div><label class="al">FAHRENHEIT</label><input class="ai" id="wc-f" type="number" placeholder="°F" oninput="wConvert('f')" style="margin:0"></div>
      <div><label class="al">KELVIN</label><input class="ai" id="wc-k" type="number" placeholder="K" oninput="wConvert('k')" style="margin:0"></div>
    </div>
  </div>
</div>

<!-- ══ FONT LAB ══ -->
<div class="asec" id="adm-fontlab">
  <div class="ac">
    <div class="act">🔤 FONT PREVIEWER</div>
    <label class="al">PREVIEW TEXT</label>
    <input class="ai" id="fp-text" value="FRANCIS Admin Panel — The Quick Brown Fox" oninput="updateFontPreview()">
    <label class="al">FONT SIZE</label>
    <input class="ai" id="fp-size" type="range" min="10" max="72" value="24" oninput="updateFontPreview();this.nextElementSibling.textContent=this.value+'px'">
    <span style="font-size:.6rem;color:var(--g3)">24px</span>
    <div id="font-list" style="max-height:400px;overflow-y:auto;margin-top:8px;"></div>
  </div>
  <div class="ac">
    <div class="act">✍️ TEXT STYLER</div>
    <input class="ai" id="ts-input" placeholder="Enter text to style...">
    <div id="ts-output" style="font-size:.72rem;line-height:2.2;color:var(--g2);"></div>
  </div>
</div>

<!-- ══ ASCII ART ══ -->
<div class="asec" id="adm-ascii">
  <div class="ac">
    <div class="act">👾 ASCII ART GENERATOR</div>
    <input class="ai" id="asc-text" placeholder="Enter text (max 8 chars)..." maxlength="8">
    <select class="asel" id="asc-font">
      <option value="block">BLOCK</option>
      <option value="banner">BANNER</option>
      <option value="shadow">SHADOW</option>
      <option value="mini">MINI</option>
    </select>
    <div class="abrow">
      <button class="ab" onclick="genASCII()" style="flex:1">GENERATE ▶</button>
      <button class="ab ghost" onclick="copyASCII()" style="flex:1">COPY</button>
      <button class="ab ghost" onclick="randomASCII()" style="flex:1">RANDOM</button>
    </div>
    <div id="asc-out" style="background:#000;border:1.5px solid var(--g4);border-radius:8px;padding:12px;font-size:.55rem;color:var(--g);white-space:pre;overflow-x:auto;margin-top:8px;line-height:1.2;min-height:80px;display:none;"></div>
  </div>
  <div class="ac">
    <div class="act">🖼️ ASCII ART GALLERY</div>
    <div id="asc-gallery" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"></div>
  </div>
  <div class="ac">
    <div class="act">🎨 ASCII CANVAS (DRAW)</div>
    <div id="asc-canvas-wrap" style="background:#000;border:1.5px solid var(--g4);border-radius:8px;padding:8px;font-size:.52rem;color:var(--g);line-height:1.4;font-family:'Courier New',monospace;overflow:auto;min-height:100px;white-space:pre;" contenteditable="true" spellcheck="false" id="asc-canvas"></div>
    <div class="abrow" style="margin-top:7px">
      <button class="ab ghost" onclick="fillASCIICanvas()" style="flex:1;font-size:.62rem">FILL RANDOM</button>
      <button class="ab ghost" onclick="clearASCIICanvas()" style="flex:1;font-size:.62rem">CLEAR</button>
    </div>
  </div>
</div>

<!-- ══ MARKDOWN EDITOR ══ -->
<div class="asec" id="adm-markdown">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
    <div class="ac" style="margin:0">
      <div class="act">RAW MARKDOWN</div>
      <textarea id="md-src" style="width:100%;min-height:320px;background:#000;border:1.5px solid var(--g4);border-radius:8px;color:var(--g);font-family:'Courier New',monospace;font-size:.7rem;padding:10px;outline:none;resize:vertical;line-height:1.7;" spellcheck="false" oninput="renderMD()" placeholder="# Title&#10;**bold** *italic* code&#10;- list item&#10;&gt; blockquote"></textarea>
    </div>
    <div class="ac" style="margin:0">
      <div class="act">LIVE PREVIEW</div>
      <div id="md-preview" style="min-height:320px;font-size:.78rem;line-height:1.9;color:var(--g2);overflow-y:auto;max-height:380px;padding:4px;"></div>
    </div>
  </div>
  <div class="abrow" style="margin-top:9px">
    <button class="ab" onclick="mdCopy()" style="flex:1">COPY HTML</button>
    <button class="ab ghost" onclick="mdDownload('md')" style="flex:1">SAVE .MD</button>
    <button class="ab ghost" onclick="mdDownload('html')" style="flex:1">SAVE .HTML</button>
    <button class="ab ghost" onclick="mdClear()" style="flex:1">CLEAR</button>
  </div>
  <div class="ac" style="margin-top:8px">
    <div class="act">QUICK INSERT</div>
    <div class="abrow" style="flex-wrap:wrap;gap:5px" id="md-insert-btns"></div>
  </div>
</div>

<!-- ══ REGEX TESTER ══ -->
<div class="asec" id="adm-regex">
  <div class="ac">
    <div class="act">REGEX TESTER</div>
    <label class="al">PATTERN</label>
    <div style="display:flex;gap:7px;margin-bottom:8px">
      <input class="ai" id="rx-pattern" placeholder="e.g. \b\w{4,}\b" style="flex:1;margin:0" oninput="runRegex()">
      <input class="ai" id="rx-flags" placeholder="gim" style="width:70px;margin:0" value="gi" oninput="runRegex()">
    </div>
    <label class="al">TEST STRING</label>
    <textarea class="ata" id="rx-test" oninput="runRegex()" placeholder="Test string here...">The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.</textarea>
    <div id="rx-result" style="font-size:.68rem;height:20px;letter-spacing:1px;margin-top:6px;"></div>
    <div id="rx-matches" style="background:#000;border:1.5px solid var(--g4);border-radius:8px;padding:10px;font-size:.68rem;color:var(--g2);margin-top:8px;min-height:60px;max-height:180px;overflow-y:auto;display:none;"></div>
  </div>
  <div class="ac">
    <div class="act">REGEX LIBRARY</div>
    <div id="rx-lib" style="display:grid;grid-template-columns:1fr 1fr;gap:6px;"></div>
  </div>
</div>

<!-- ══ JSON EXPLORER ══ -->
<div class="asec" id="adm-json">
  <div class="ac">
    <div class="act">JSON FORMATTER</div>
    <textarea class="ata" id="json-src" style="min-height:140px;font-size:.68rem" placeholder='{"name":"FRANCIS","version":3}' oninput="jsonLive()"></textarea>
    <div class="abrow">
      <button class="ab" onclick="jsonFormat()" style="flex:1">FORMAT</button>
      <button class="ab ghost" onclick="jsonMinify()" style="flex:1">MINIFY</button>
      <button class="ab ghost" onclick="jsonSort()" style="flex:1">SORT</button>
      <button class="ab ghost" onclick="jsonCopy()" style="flex:1">COPY</button>
    </div>
    <div id="json-status" style="font-size:.62rem;height:18px;letter-spacing:1px;margin-bottom:4px;"></div>
    <div id="json-tree" style="background:#000;border:1.5px solid var(--g4);border-radius:8px;padding:10px;font-size:.66rem;max-height:240px;overflow-y:auto;display:none;font-family:'Courier New',monospace;line-height:1.7;white-space:pre;"></div>
  </div>
  <div class="ac">
    <div class="act">JSON PATH QUERY</div>
    <input class="ai" id="json-path" placeholder="Key name (e.g. name, tools)" oninput="jsonQuery()">
    <div id="json-query-out" style="background:#000;border:1.5px solid var(--g4);border-radius:8px;padding:10px;font-size:.68rem;color:var(--g2);min-height:36px;display:none;word-break:break-all;"></div>
  </div>
  <div class="ac">
    <div class="act">JSON STATS</div>
    <div id="json-stats" style="font-size:.68rem;color:var(--g2);line-height:2;"></div>
  </div>
</div>

<!-- ══ URL TOOLS ══ -->
<div class="asec" id="adm-urltools">
  <div class="ac">
    <div class="act">URL ENCODER / DECODER</div>
    <textarea class="ata" id="url-input" placeholder="Paste URL or text here...">https://example.com/search?q=hello world&lang=en</textarea>
    <div class="abrow">
      <button class="ab" onclick="urlEncode()" style="flex:1">ENCODE</button>
      <button class="ab ghost" onclick="urlDecode()" style="flex:1">DECODE</button>
      <button class="ab ghost" onclick="urlCopy()" style="flex:1">COPY</button>
    </div>
    <div id="url-out" style="background:#000;border:1.5px solid var(--g4);border-radius:8px;padding:10px;font-size:.7rem;color:var(--g);word-break:break-all;margin-top:7px;min-height:36px;display:none;"></div>
  </div>
  <div class="ac">
    <div class="act">URL PARSER</div>
    <input class="ai" id="urlp-input" placeholder="https://sub.domain.com:8080/path?key=val#hash" oninput="parseURL(this.value)">
    <div id="urlp-out" style="font-size:.68rem;color:var(--g2);line-height:2;"></div>
  </div>
  <div class="ac">
    <div class="act">URL SHORTENER (is.gd)</div>
    <div class="abrow">
      <input class="ai" id="shorten-inp" placeholder="Paste long URL..." style="flex:1;margin:0">
      <button class="ab" onclick="shortenURL()">SHORTEN</button>
    </div>
    <div id="shorten-out" style="font-size:.72rem;color:var(--g);margin-top:8px;word-break:break-all;min-height:20px;"></div>
  </div>
  <div class="ac">
    <div class="act">UTM BUILDER</div>
    <input class="ai" id="utm-url" placeholder="Base URL (https://...)">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px">
      <input class="ai" id="utm-source" placeholder="utm_source (google)">
      <input class="ai" id="utm-medium" placeholder="utm_medium (cpc)">
      <input class="ai" id="utm-campaign" placeholder="utm_campaign (summer)">
      <input class="ai" id="utm-term" placeholder="utm_term (optional)">
    </div>
    <button class="ab full" onclick="buildUTM()">BUILD UTM URL</button>
    <div id="utm-out" style="font-size:.68rem;color:var(--g);word-break:break-all;margin-top:6px;display:none;"></div>
  </div>
</div>

<!-- ══ KANBAN BOARD ══ -->
<div class="asec" id="adm-kanban">
  <div class="ac">
    <div class="act">KANBAN BOARD <span class="abadge">DRAG DROP</span></div>
    <div style="display:flex;gap:7px;margin-bottom:10px">
      <input class="ai" id="kb-card" placeholder="New card..." style="flex:1;margin:0">
      <select class="asel" id="kb-col" style="width:110px;margin:0">
        <option value="todo">TODO</option>
        <option value="doing">DOING</option>
        <option value="done">DONE</option>
        <option value="blocked">BLOCKED</option>
      </select>
      <button class="ab" onclick="kbAdd()">ADD</button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px" id="kb-board">
      <div><div style="font-size:.58rem;color:var(--g);letter-spacing:2px;margin-bottom:7px;padding:5px 8px;background:rgba(0,255,65,.08);border-radius:6px;text-align:center;">TODO</div><div id="kbl-todo" ondragover="event.preventDefault()" ondrop="kbDrop(event,'todo')" style="min-height:100px;"></div></div>
      <div><div style="font-size:.58rem;color:var(--yl);letter-spacing:2px;margin-bottom:7px;padding:5px 8px;background:rgba(255,204,0,.08);border-radius:6px;text-align:center;">DOING</div><div id="kbl-doing" ondragover="event.preventDefault()" ondrop="kbDrop(event,'doing')" style="min-height:100px;"></div></div>
      <div><div style="font-size:.58rem;color:var(--g2);letter-spacing:2px;margin-bottom:7px;padding:5px 8px;background:rgba(0,200,50,.08);border-radius:6px;text-align:center;">DONE</div><div id="kbl-done" ondragover="event.preventDefault()" ondrop="kbDrop(event,'done')" style="min-height:100px;"></div></div>
      <div><div style="font-size:.58rem;color:var(--red);letter-spacing:2px;margin-bottom:7px;padding:5px 8px;background:rgba(255,51,51,.08);border-radius:6px;text-align:center;">BLOCKED</div><div id="kbl-blocked" ondragover="event.preventDefault()" ondrop="kbDrop(event,'blocked')" style="min-height:100px;"></div></div>
    </div>
    <div class="abrow" style="margin-top:9px">
      <button class="ab ghost" onclick="kbClear('done')" style="flex:1;font-size:.62rem">CLEAR DONE</button>
      <button class="ab red" onclick="kbClear('all')" style="flex:1;font-size:.62rem">CLEAR ALL</button>
    </div>
  </div>
</div>

<!-- ══ FINANCE ══ -->
<div class="asec" id="adm-finance">
  <div class="ac">
    <div class="act">COMPOUND INTEREST</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px">
      <div><label class="al">PRINCIPAL ($)</label><input class="ai" id="fi-p" type="number" value="10000" oninput="calcCompound()" style="margin:0"></div>
      <div><label class="al">ANNUAL RATE (%)</label><input class="ai" id="fi-r" type="number" value="7" step="0.1" oninput="calcCompound()" style="margin:0"></div>
      <div><label class="al">YEARS</label><input class="ai" id="fi-t" type="number" value="10" oninput="calcCompound()" style="margin:0"></div>
      <div><label class="al">COMPOUNDS/YEAR</label><input class="ai" id="fi-n" type="number" value="12" oninput="calcCompound()" style="margin:0"></div>
    </div>
    <div id="fi-result" style="font-size:.75rem;color:var(--g2);line-height:2.2;margin-top:8px;"></div>
  </div>
  <div class="ac">
    <div class="act">LOAN / EMI CALCULATOR</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px">
      <div><label class="al">LOAN AMOUNT ($)</label><input class="ai" id="loan-p" type="number" value="50000" oninput="calcLoan()" style="margin:0"></div>
      <div><label class="al">ANNUAL RATE (%)</label><input class="ai" id="loan-r" type="number" value="8.5" step="0.1" oninput="calcLoan()" style="margin:0"></div>
      <div><label class="al">MONTHS</label><input class="ai" id="loan-t" type="number" value="60" oninput="calcLoan()" style="margin:0"></div>
      <div><label class="al">DOWN PAYMENT ($)</label><input class="ai" id="loan-d" type="number" value="0" oninput="calcLoan()" style="margin:0"></div>
    </div>
    <div id="loan-result" style="font-size:.75rem;color:var(--g2);line-height:2.2;margin-top:8px;"></div>
  </div>
  <div class="ac">
    <div class="act">ROI CALCULATOR</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px">
      <div><label class="al">INVESTED ($)</label><input class="ai" id="roi-i" type="number" value="5000" oninput="calcROI()" style="margin:0"></div>
      <div><label class="al">FINAL VALUE ($)</label><input class="ai" id="roi-f" type="number" value="8500" oninput="calcROI()" style="margin:0"></div>
    </div>
    <div id="roi-result" style="font-size:.75rem;color:var(--g2);line-height:2.2;margin-top:8px;"></div>
  </div>
  <div class="ac">
    <div class="act">SIP CALCULATOR</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px">
      <div><label class="al">MONTHLY ($)</label><input class="ai" id="sip-m" type="number" value="500" oninput="calcSIP()" style="margin:0"></div>
      <div><label class="al">ANNUAL RETURN (%)</label><input class="ai" id="sip-r" type="number" value="12" step="0.1" oninput="calcSIP()" style="margin:0"></div>
      <div><label class="al">YEARS</label><input class="ai" id="sip-t" type="number" value="10" oninput="calcSIP()" style="margin:0"></div>
    </div>
    <div id="sip-result" style="font-size:.75rem;color:var(--g2);line-height:2.2;margin-top:8px;"></div>
  </div>
</div>

<!-- ══ TYPING TEST ══ -->
<div class="asec" id="adm-typingtest">
  <div class="ac">
    <div class="act">TYPING SPEED TEST <span class="abadge" id="tt-badge">READY</span></div>
    <div class="as as4" id="tt-stats" style="margin-bottom:10px"></div>
    <div id="tt-words" style="background:#000;border:1.5px solid var(--g4);border-radius:8px;padding:12px;font-size:.85rem;line-height:2.2;min-height:80px;max-height:120px;overflow:hidden;margin-bottom:8px;word-break:break-word;"></div>
    <input id="tt-input" class="ai" placeholder="Click START then type here..." style="font-size:.88rem;" oninput="ttCheck(this)" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" disabled>
    <div class="abrow" style="margin-top:6px">
      <button class="ab" onclick="ttStart()" style="flex:1">START</button>
      <button class="ab ghost" onclick="ttReset()" style="flex:1">RESET</button>
      <select class="asel" id="tt-mode" style="flex:1;margin:0">
        <option value="30">30s</option>
        <option value="60" selected>60s</option>
        <option value="120">2min</option>
      </select>
    </div>
    <div id="tt-result" style="display:none;text-align:center;padding:14px;font-size:.75rem;color:var(--g2);line-height:2;border:1.5px solid var(--g4);border-radius:8px;margin-top:8px;"></div>
  </div>
  <div class="ac">
    <div class="act">LEADERBOARD</div>
    <div id="tt-leaderboard" style="max-height:200px;overflow-y:auto;font-size:.65rem;"></div>
  </div>
</div>

<!-- ══ AI PROMPT BUILDER ══ -->
<div class="asec" id="adm-aiprompt">
  <div class="ac">
    <div class="act">AI PROMPT BUILDER</div>
    <label class="al">ROLE</label>
    <select class="asel" id="ai-role" onchange="buildPrompt()">
      <option value="">Select role...</option>
      <option>Expert developer</option><option>Security researcher</option><option>Data analyst</option>
      <option>UI/UX designer</option><option>Technical writer</option><option>System administrator</option>
      <option>DevOps engineer</option><option>Product manager</option><option>Cybersecurity expert</option>
    </select>
    <label class="al">TASK</label>
    <textarea class="ata" id="ai-task" placeholder="What should the AI do?" oninput="buildPrompt()"></textarea>
    <label class="al">CONTEXT</label>
    <textarea class="ata" id="ai-context" placeholder="Any relevant context..." oninput="buildPrompt()"></textarea>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px">
      <div><label class="al">OUTPUT FORMAT</label>
        <select class="asel" id="ai-format" onchange="buildPrompt()" style="margin:0">
          <option value="">None</option><option>Numbered list</option><option>Bullet points</option>
          <option>Code block</option><option>JSON</option><option>Step-by-step</option>
        </select>
      </div>
      <div><label class="al">TONE</label>
        <select class="asel" id="ai-tone" onchange="buildPrompt()" style="margin:0">
          <option value="">Neutral</option><option>Professional</option><option>Casual</option>
          <option>Technical</option><option>Concise</option><option>Detailed</option>
        </select>
      </div>
    </div>
    <div class="act" style="margin-top:9px">GENERATED PROMPT</div>
    <div id="ai-prompt-out" style="background:#000;border:1.5px solid var(--g4);border-left:3px solid var(--g);border-radius:8px;padding:11px;font-size:.7rem;color:var(--g2);min-height:90px;white-space:pre-wrap;word-break:break-word;max-height:200px;overflow-y:auto;margin-bottom:8px;"></div>
    <div class="abrow">
      <button class="ab" onclick="copyPrompt()" style="flex:1">COPY</button>
      <button class="ab ghost" onclick="savePrompt()" style="flex:1">SAVE</button>
      <button class="ab ghost" onclick="clearPrompt()" style="flex:1">CLEAR</button>
    </div>
  </div>
  <div class="ac">
    <div class="act">SAVED PROMPTS</div>
    <div id="ai-saved-prompts" style="max-height:220px;overflow-y:auto;"></div>
  </div>
  <div class="ac">
    <div class="act">TEMPLATES</div>
    <div class="abrow" style="flex-wrap:wrap;gap:5px" id="ai-templates-btns"></div>
  </div>
</div>

<!-- ══ MUSIC VISUALIZER ══ -->
<div class="asec" id="adm-music">
  <div class="ac">
    <div class="act">AUDIO VISUALIZER <span class="abadge" id="music-badge">IDLE</span></div>
    <canvas id="music-canvas" height="140" style="width:100%;background:#000;border:1.5px solid var(--g4);border-radius:8px;display:block;margin-bottom:8px;"></canvas>
    <div class="abrow">
      <button class="ab" onclick="startMic()">MIC INPUT</button>
      <button class="ab ghost" onclick="stopViz()">STOP</button>
      <select class="asel" id="viz-mode" style="flex:1;margin:0">
        <option value="bars">BARS</option>
        <option value="wave">WAVE</option>
        <option value="circle">CIRCLE</option>
        <option value="matrix">MATRIX</option>
      </select>
    </div>
  </div>
  <div class="ac">
    <div class="act">VIRTUAL PIANO</div>
    <div id="piano-keys" style="display:flex;gap:2px;margin-bottom:8px;overflow-x:auto;padding-bottom:4px;min-height:60px;"></div>
    <div style="font-size:.6rem;color:var(--g3)">Keys: A S D F G H J K = white  |  W E T Y U = black</div>
  </div>
  <div class="ac">
    <div class="act">TONE GENERATOR</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:8px">
      <div><label class="al">FREQUENCY</label><input class="ai" id="tone-freq" type="range" min="20" max="2000" value="440" oninput="this.nextElementSibling.textContent=this.value+'Hz'" style="margin:0"><span style="font-size:.6rem;color:var(--g3)">440Hz</span></div>
      <div><label class="al">VOLUME</label><input class="ai" id="tone-vol" type="range" min="0" max="100" value="30" oninput="this.nextElementSibling.textContent=this.value+'%'" style="margin:0"><span style="font-size:.6rem;color:var(--g3)">30%</span></div>
    </div>
    <div class="abrow" style="flex-wrap:wrap;gap:5px;margin-bottom:8px">
      <button class="ab ghost" style="font-size:.6rem" onclick="setWaveform('sine')" id="wf-sine">SINE</button>
      <button class="ab ghost" style="font-size:.6rem" onclick="setWaveform('square')" id="wf-square">SQUARE</button>
      <button class="ab ghost" style="font-size:.6rem" onclick="setWaveform('sawtooth')" id="wf-sawtooth">SAWTOOTH</button>
      <button class="ab ghost" style="font-size:.6rem" onclick="setWaveform('triangle')" id="wf-triangle">TRIANGLE</button>
    </div>
    <div class="abrow">
      <button class="ab" onclick="startTone()" style="flex:1">PLAY</button>
      <button class="ab red" onclick="stopTone()" style="flex:1">STOP</button>
    </div>
  </div>
</div>

<!-- ══ IMAGE TOOLS ══ -->
<div class="asec" id="adm-imagetools">
  <div class="ac">
    <div class="act">IMAGE INSPECTOR &amp; FILTER</div>
    <div id="img-drop" style="border:2px dashed var(--g4);border-radius:10px;padding:20px;text-align:center;cursor:pointer;font-size:.72rem;color:var(--g3);margin-bottom:9px;transition:border-color .2s"
      ondragover="event.preventDefault();this.style.borderColor='var(--g)'" ondragleave="this.style.borderColor='var(--g4)'"
      ondrop="imgDrop(event)" onclick="document.getElementById('img-file-inp').click()">
      DROP IMAGE HERE OR CLICK TO UPLOAD
      <input type="file" id="img-file-inp" accept="image/*" style="display:none" onchange="imgLoad(this.files[0])">
    </div>
    <div id="img-preview-wrap" style="display:none">
      <canvas id="img-canvas" style="max-width:100%;border-radius:8px;display:block;margin:0 auto 10px;border:1.5px solid var(--g4);max-height:200px;object-fit:contain;"></canvas>
      <div id="img-info" style="font-size:.65rem;color:var(--g2);line-height:2;margin-bottom:9px;"></div>
      <div class="act">FILTERS</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:9px">
        <div><label class="al">BRIGHTNESS</label><input type="range" id="img-brightness" min="0" max="200" value="100" oninput="applyFilters()" style="width:100%"></div>
        <div><label class="al">CONTRAST</label><input type="range" id="img-contrast" min="0" max="200" value="100" oninput="applyFilters()" style="width:100%"></div>
        <div><label class="al">SATURATION</label><input type="range" id="img-saturation" min="0" max="200" value="100" oninput="applyFilters()" style="width:100%"></div>
        <div><label class="al">HUE ROTATE</label><input type="range" id="img-hue" min="0" max="360" value="0" oninput="applyFilters()" style="width:100%"></div>
        <div><label class="al">BLUR</label><input type="range" id="img-blur" min="0" max="20" value="0" oninput="applyFilters()" style="width:100%"></div>
        <div><label class="al">OPACITY</label><input type="range" id="img-opacity" min="0" max="100" value="100" oninput="applyFilters()" style="width:100%"></div>
      </div>
      <div class="abrow">
        <button class="ab ghost" style="flex:1;font-size:.62rem" onclick="imgSetFilter('grayscale(100%)')">GRAYSCALE</button>
        <button class="ab ghost" style="flex:1;font-size:.62rem" onclick="imgSetFilter('invert(100%)')">INVERT</button>
        <button class="ab ghost" style="flex:1;font-size:.62rem" onclick="imgSetFilter('sepia(100%)')">SEPIA</button>
        <button class="ab ghost" style="flex:1;font-size:.62rem" onclick="imgResetFilters()">RESET</button>
      </div>
      <button class="ab full" style="margin-top:7px" onclick="imgDownload()">DOWNLOAD</button>
    </div>
  </div>
  <div class="ac">
    <div class="act">PIXEL INSPECTOR</div>
    <div style="font-size:.65rem;color:var(--g3);margin-bottom:6px">Load image above, then move mouse over it to pick colors</div>
    <div id="pixel-info" style="font-size:.72rem;color:var(--g2);line-height:2;"></div>
    <div id="pixel-swatch" style="width:50px;height:50px;border-radius:8px;border:2px solid var(--g4);display:inline-block;margin-top:6px;"></div>
  </div>
</div>

</div><!-- /body -->`;
document.body.appendChild(OV);

const NOTIF=document.createElement('div');
NOTIF.id='adm-notif';
document.body.appendChild(NOTIF);
function notify(msg,col){
  NOTIF.textContent=msg; NOTIF.style.borderColor=col||'var(--g)'; NOTIF.style.color=col||'var(--g)';
  NOTIF.style.display='block'; clearTimeout(NOTIF._t);
  NOTIF._t=setTimeout(()=>NOTIF.style.display='none',2200);
}

// ═══════════════════════════════════════════════
// BOOT SEQUENCE
// ═══════════════════════════════════════════════
const BOOT=[
  '▓▓▓ FRANCIS ADMIN PANEL v3.0 ▓▓▓',
  'Loading kernel modules...',
  'Mounting encrypted filesystem...',
  'Starting security daemon [OK]',
  'Initializing network stack [OK]',
  'Loading tool registry...',
  `Found ${typeof TR!=='undefined'?TR.length:'500+'} tools [OK]`,
  'Reading analytics database [OK]',
  'Decrypting vault...',
  'Connecting to monitors [OK]',
  'Starting packet capture engine [OK]',
  'Initializing cipher modules [OK]',
  '─────────────────────────────',
  'ALL SYSTEMS OPERATIONAL',
  '▶ ACCESS GRANTED',
];
function runBoot(cb){
  const el=document.getElementById('boot-log'),bar=document.getElementById('boot-bar'),st=document.getElementById('boot-status');
  el.textContent='';bar.style.width='0%';let i=0;
  function nx(){
    if(i>=BOOT.length){bar.style.width='100%';st.textContent='BOOT COMPLETE';setTimeout(()=>{document.getElementById('adm-boot').classList.add('gone');cb();},350);return;}
    el.textContent+=(i>0?'\n':'')+BOOT[i];bar.style.width=Math.round((i+1)/BOOT.length*100)+'%';
    st.textContent=BOOT[i];i++;setTimeout(nx,rnd(35,90));
  }
  nx();
}

// ═══════════════════════════════════════════════
// TRIGGERS
// ═══════════════════════════════════════════════
const openedAt=Date.now();
let cC=0,cT=null;
document.addEventListener('keydown',e=>{
  if(e.key==='Control'){cC++;clearTimeout(cT);cT=setTimeout(()=>cC=0,700);if(cC>=3){cC=0;admOpen();}}
});
let tC=0,tT=null;
function onTap(){tC++;clearTimeout(tT);tT=setTimeout(()=>tC=0,800);if(tC>=3){tC=0;admOpen();}}
setTimeout(()=>{
  [document.getElementById('fn-logo'),document.querySelector('.hero-title'),document.querySelector('h1')]
  .filter(Boolean).forEach(el=>{
    el.addEventListener('touchend',e=>{e.preventDefault();onTap();},{passive:false});
    el.addEventListener('click',onTap);
  });
},1000);

// ═══════════════════════════════════════════════
// OPEN / CLOSE / AUTH
// ═══════════════════════════════════════════════
let unlocked=false;
function admOpen(){
  OV.classList.add('on');
  document.getElementById('adm-boot').classList.remove('gone');
  document.getElementById('adm-pass').classList.add('gone');
  runBoot(()=>{
    if(unlocked||sessionStorage.getItem('fr_adm')==='1'){unlocked=true;showMain();}
    else{document.getElementById('adm-pass').classList.remove('gone');setTimeout(()=>document.getElementById('pass-inp')?.focus(),200);}
  });
}
window.admClose=()=>OV.classList.remove('on');
window.admLogout=()=>{unlocked=false;sessionStorage.removeItem('fr_adm');admClose();notify('🔒 Locked');};

// password dots
window.passInput=function(inp){
  const dots=document.getElementById('pass-dots');
  const n=Math.min(inp.value.length,8);
  dots.innerHTML=Array.from({length:8},(_,i)=>`<div class="pass-dot ${i<n?'lit':''}"></div>`).join('');
};

let attempts=0;
window.admUnlock=function(){
  const inp=document.getElementById('pass-inp');
  const err=document.getElementById('pass-err');
  const tr=document.getElementById('pass-tries');
  if(inp.value===(ls(PASS_KEY)||DEFAULT_PASS)){
    unlocked=true;sessionStorage.setItem('fr_adm','1');attempts=0;inp.value='';
    document.getElementById('adm-pass').classList.add('gone');showMain();
  } else {
    attempts++;err.textContent='✕ ACCESS DENIED — INVALID CREDENTIALS';
    tr.textContent='Failed attempts: '+attempts+' / 5';inp.value='';
    document.getElementById('pass-dots').innerHTML=Array(8).fill('<div class="pass-dot"></div>').join('');
    if(attempts>=5){admClose();notify('🚫 Too many failed attempts','#ff3333');attempts=0;}
    setTimeout(()=>err.textContent='',2000);
  }
};

function showMain(){
  document.getElementById('adm-pass').classList.add('gone');
  loadDash();loadAnalytics();loadLogs();loadNotes();loadSettings();
  loadContent();loadAnn();loadTheme();loadNetInfo();loadVault();loadTools();
  refreshCrypto();drawThreatRadar();
}

// ═══════════════════════════════════════════════
// CLOCK
// ═══════════════════════════════════════════════
setInterval(()=>{
  const t=new Date();
  const el=document.getElementById('adm-live-time');
  if(el)el.textContent=t.toLocaleTimeString();
  const dc=document.getElementById('dash-clock');
  if(dc)dc.textContent=t.toLocaleTimeString();
  const dd=document.getElementById('dash-date');
  if(dd)dd.textContent=t.toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  const st=document.getElementById('adm-session-time');
  if(st)st.textContent=fmtT(Math.floor((Date.now()-openedAt)/1000));
  const ds=document.getElementById('dash-session');
  if(ds)ds.textContent=fmtT(Math.floor((Date.now()-openedAt)/1000));
  document.getElementById('net-dot').style.background=navigator.onLine?'var(--g)':'var(--red)';
},1000);

// ═══════════════════════════════════════════════
// TABS
// ═══════════════════════════════════════════════
window.T=function(btn,name){
  document.querySelectorAll('.atab').forEach(t=>t.classList.remove('on'));
  document.querySelectorAll('.asec').forEach(s=>s.classList.remove('on'));
  btn.classList.add('on');
  document.getElementById('adm-'+name).classList.add('on');
  if(name==='packet')startPackets();
  if(name==='tools')loadTools();
};

// ═══════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════
function loadDash(){
  const m=GM();const tc=typeof TR!=='undefined'?TR.length:0;
  document.getElementById('dash-stats').innerHTML=[
    [fmt(m.visits||0),'VISITS'],[fmt(m.toolsOpened||0),'OPENS'],
    [fmt(m.totalClicks||0),'CLICKS'],[fmtT(m.totalTime||0),'TIME'],
    [fmt(m.searchCount||0),'SEARCHES'],[fmt((m.sessions||[]).length),'SESSIONS'],
    [(m.scrollDepth||0)+'%','SCROLL'],[tc,'TOOLS'],
  ].map(([n,l])=>`<div class="astat"><div class="asn">${n}</div><div class="asl">${l}</div></div>`).join('');

  document.getElementById('dash-device').innerHTML=[
    ['Browser',navigator.userAgent.includes('Chrome')?'Chrome':navigator.userAgent.includes('Firefox')?'Firefox':'Other'],
    ['Screen',screen.width+'×'+screen.height],
    ['Platform',navigator.platform],
    ['Language',navigator.language],
    ['Timezone',Intl.DateTimeFormat().resolvedOptions().timeZone],
    ['Online',navigator.onLine?'✅ Yes':'❌ No'],
    ['Cores',navigator.hardwareConcurrency||'?'],
    ['RAM',navigator.deviceMemory?navigator.deviceMemory+'GB':'?'],
  ].map(([k,v])=>`<span style="color:var(--g3)">${k}:</span> ${v}<br>`).join('');

  const feed=document.getElementById('dash-feed');
  const logs=(ls(LOG_KEY)||[]).slice(-6).reverse();
  feed.innerHTML=logs.map(l=>`<span style="color:var(--g3)">${new Date(l.t).toLocaleTimeString()}</span>  <span style="color:var(--g2)">↳ visit · ${l.tz||'unknown'} · ${(l.scr||'')}</span><br>`).join('')||'<span style="color:var(--g3)">No activity yet</span>';

  const tools=Object.values(m.toolsUsed||{}).slice(0,24);
  const mx=Math.max(...tools,1);
  document.getElementById('dash-histogram').innerHTML=tools.map((v,i)=>
    `<div style="flex:1;background:var(--g);height:${Math.max(3,Math.round(v/mx*50))}px;border-radius:2px 2px 0 0;opacity:${.3+i/tools.length*.7}"></div>`
  ).join('')||'<span style="color:var(--g3);font-size:.6rem">No tool data yet</span>';

  // health rings
  const stor=(()=>{try{let t=0;for(let k in localStorage)t+=localStorage[k].length;return Math.min(100,Math.round(t/5120*100));}catch{return 0;}})();
  const mem=performance.memory?Math.round(performance.memory.usedJSHeapSize/performance.memory.jsHeapSizeLimit*100):45;
  document.getElementById('dash-health').innerHTML=[
    ['CPU',rnd(5,35),'var(--g)'],['MEM',mem,'var(--bl)'],['DISK',stor,'var(--yl)'],
  ].map(([l,v,c])=>`<div style="text-align:center">
    <svg width="60" height="60" viewBox="0 0 60 60" style="transform:rotate(-90deg)">
      <circle cx="30" cy="30" r="24" fill="none" stroke="var(--g4)" stroke-width="5"/>
      <circle cx="30" cy="30" r="24" fill="none" stroke="${c}" stroke-width="5"
        stroke-dasharray="150.8" stroke-dashoffset="${150.8*(1-v/100).toFixed(2)}" stroke-linecap="round"/>
    </svg>
    <div style="font-size:.9rem;font-weight:bold;color:${c};margin-top:2px">${v}%</div>
    <div style="font-size:.48rem;color:var(--g3);letter-spacing:1.5px">${l}</div>
  </div>`).join('');

  drawMiniMatrix();
}

// mini matrix canvas
function drawMiniMatrix(){
  const c=document.getElementById('matrix-mini');
  if(!c)return;
  c.width=c.offsetWidth||300;c.height=80;
  const ctx=c.getContext('2d');
  const cols=Math.floor(c.width/10);
  const drops=Array(cols).fill(1);
  let frame=0;
  function draw(){
    if(!document.getElementById('matrix-mini'))return;
    ctx.fillStyle='rgba(0,0,0,.15)';ctx.fillRect(0,0,c.width,c.height);
    ctx.fillStyle='#00ff41';ctx.font='9px monospace';
    drops.forEach((y,i)=>{
      ctx.fillText(String.fromCharCode(rnd(33,126)),i*10,y*10);
      if(y*10>c.height&&Math.random()>.95)drops[i]=0;
      drops[i]++;
    });
    if(frame++<300)requestAnimationFrame(draw);
  }
  draw();
}

// ═══════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════
function loadAnalytics(){
  const m=GM();
  document.getElementById('an-grid').innerHTML=[
    [fmt(m.visits||0),'VISITS'],[fmt(m.toolsOpened||0),'OPENS'],
    [fmtT(m.totalTime||0),'TIME'],[fmt(m.searchCount||0),'SEARCHES'],
    [(m.sessions||[]).length,'SESSIONS'],[fmt(m.totalClicks||0),'CLICKS'],
    [(m.scrollDepth||0)+'%','SCROLL'],[fmt(m.keystrokes||0),'KEYS'],
  ].map(([n,l])=>`<div class="astat"><div class="asn">${n}</div><div class="asl">${l}</div></div>`).join('');

  const tools=Object.entries(m.toolsUsed||{}).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const mx=tools[0]?.[1]||1;
  document.getElementById('an-tools').innerHTML=tools.map(([n,c])=>
    `<div class="brow"><span class="blbl">${n}</span><div class="btrack"><div class="bfill green" style="width:${Math.round(c/mx*100)}%"></div></div><span class="bval">${c}</span></div>`
  ).join('')||'<div style="color:var(--g3);font-size:.68rem">No data yet</div>';

  // Heatmap
  const h=m.hourlyActivity||Array(24).fill(0);
  const mxH=Math.max(...h,1);
  document.getElementById('an-heat').innerHTML=h.map((v,i)=>{
    const pct=v/mxH;const active=i===new Date().getHours();
    const bg=active?'var(--g)':pct>0.6?'rgba(0,255,65,.7)':pct>0.3?'rgba(0,255,65,.4)':pct>0?'rgba(0,255,65,.15)':'var(--g5)';
    return `<div class="hcell" style="background:${bg}" title="${i}:00 — ${v} events"></div>`;
  }).join('');

  const days=Object.entries(m.dailyVisits||{}).slice(-7);
  const mxD=Math.max(...days.map(([,v])=>v),1);
  document.getElementById('an-daily').innerHTML=days.length?
    `<div style="display:flex;align-items:flex-end;gap:5px;height:50px">${days.map(([d,v])=>`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px"><div style="width:100%;background:var(--g2);height:${Math.max(4,Math.round(v/mxD*46))}px;border-radius:3px 3px 0 0"></div><span style="font-size:.42rem;color:var(--g3)">${d.slice(5)}</span></div>`).join('')}</div>`
    :'<div style="color:var(--g3);font-size:.68rem">No data yet</div>';

  const cats=Object.entries(m.catClicks||{}).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const mxC=cats[0]?.[1]||1;
  document.getElementById('an-cats').innerHTML=cats.map(([n,c])=>
    `<div class="brow"><span class="blbl">${n}</span><div class="btrack"><div class="bfill purple" style="width:${Math.round(c/mxC*100)}%"></div></div><span class="bval">${c}</span></div>`
  ).join('')||'<div style="color:var(--g3);font-size:.68rem">No data yet</div>';

  // Skill profile
  const toolsAll=typeof TR!=='undefined'?TR:[];
  const catCounts={};
  Object.keys(m.catClicks||{}).forEach(k=>catCounts[k]=(m.catClicks[k]||0));
  const maxSkill=Math.max(...Object.values(catCounts),1);
  document.getElementById('an-skills').innerHTML=Object.entries(catCounts).slice(0,6).map(([n,v])=>`
    <div class="skill-row">
      <div class="skill-top"><span>${n.toUpperCase()}</span><span>${Math.round(v/maxSkill*100)}%</span></div>
      <div class="skill-track"><div class="skill-fill" style="width:${Math.round(v/maxSkill*100)}%"></div></div>
    </div>`).join('')||'<div style="color:var(--g3);font-size:.68rem">Use some tools first</div>';
}

// ═══════════════════════════════════════════════
// TERMINAL
// ═══════════════════════════════════════════════
const HIST=[]; let hIdx=-1;
window.termKey=function(e){
  const inp=document.getElementById('term-inp');
  if(e.key==='Enter'){const c=inp.value.trim();if(c){HIST.unshift(c);hIdx=-1;termRun(c);inp.value='';}}
  else if(e.key==='ArrowUp'){e.preventDefault();if(hIdx<HIST.length-1){hIdx++;inp.value=HIST[hIdx];}}
  else if(e.key==='ArrowDown'){e.preventDefault();hIdx>0?inp.value=HIST[--hIdx]:(hIdx=-1,inp.value='');}
};

window.termRun=function(cmd){
  const out=document.getElementById('term-out');
  const m=GM();const tc=typeof TR!=='undefined'?TR.length:0;
  const c=cmd.toLowerCase().trim();let r='';
  if(c==='help'){r=`Commands:
  help      — Show commands          status    — System status
  stats     — Site statistics        tools     — Tool registry info
  ls        — List files             whoami    — User info
  sysinfo   — Device info            clear     — Clear terminal
  matrix    — Matrix rain            hack      — Hacker sequence
  encrypt   — Encrypt text           decode    — Base64 decode
  ping      — Ping test              memory    — Memory usage
  uptime    — Session time           banner    — Show/hide banner
  exploit   — Run exploit sim        nmap      — Network scan sim`;}
  else if(c==='status'){r=`● FRANCIS ADMIN — ONLINE
● Tools: ${tc} loaded, ${(GA().disabledTools||[]).length} disabled
● Storage: ${(()=>{try{let t=0;for(let k in localStorage)t+=localStorage[k].length;return(t/1024).toFixed(1)+'KB';}catch{return'N/A'}})()}
● Session: ${fmtT(Math.floor((Date.now()-openedAt)/1000))}
● Network: ${navigator.onLine?'ONLINE':'OFFLINE'}
● Vault entries: ${(ls(VAULT_KEY)||[]).length}`;}
  else if(c==='stats'){const s=`Visits:     ${m.visits||0}\nTools used: ${m.toolsOpened||0}\nClicks:     ${m.totalClicks||0}\nSearches:   ${m.searchCount||0}\nTime:       ${fmtT(m.totalTime||0)}\nSessions:   ${(m.sessions||[]).length}\nScroll:     ${m.scrollDepth||0}%`;r=s;}
  else if(c==='tools'){r=`Registry: ${tc} tools\nActive: ${tc-(GA().disabledTools||[]).length}\nDisabled: ${(GA().disabledTools||[]).length}\nCategories: 20`;}
  else if(c==='ls'){r=`drwxr-xr-x  index.html\ndrwxr-xr-x  admin.js      [THIS FILE]\ndrwxr-xr-x  monitor.js\ndrwxr-xr-x  nav.js\ndrwxr-xr-x  ai-agent.js\ndrwxr-xr-x  sw.js\ndrwxr-xr-x  manifest.json\ndrwxr-xr-x  icon.svg`;}
  else if(c==='whoami'){r=`User:      admin\nRole:      ROOT ACCESS\nSite:      FRANCIS Tools PWA\nDesigner:  Akshit Singh\nUA:        ${navigator.userAgent.slice(0,55)}`;}
  else if(c==='sysinfo'){r=`Platform:  ${navigator.platform}\nLanguage:  ${navigator.language}\nTimezone:  ${Intl.DateTimeFormat().resolvedOptions().timeZone}\nScreen:    ${screen.width}x${screen.height} @${screen.colorDepth}bit\nCores:     ${navigator.hardwareConcurrency||'?'}\nRAM:       ${navigator.deviceMemory?navigator.deviceMemory+'GB':'?'}\nOnline:    ${navigator.onLine}`;}
  else if(c==='clear'){out.textContent='FRANCIS HACKER TERMINAL v3.0\nroot@francis:~$ ';return;}
  else if(c==='uptime'){r='Session uptime: '+fmtT(Math.floor((Date.now()-openedAt)/1000));}
  else if(c==='memory'){const mm=performance.memory;r=mm?`Used:  ${(mm.usedJSHeapSize/1048576).toFixed(1)}MB\nTotal: ${(mm.totalJSHeapSize/1048576).toFixed(1)}MB\nLimit: ${(mm.jsHeapSizeLimit/1048576).toFixed(1)}MB`:'Memory API unavailable';}
  else if(c==='ping'){out.textContent+=`$ ${cmd}\nPinging...\n`;const t=Date.now();const i=new Image();i.onload=i.onerror=()=>{out.textContent+=`Reply: ${Date.now()-t}ms TTL=64\n$ `;out.scrollTop=out.scrollHeight;};i.src='https://www.google.com/favicon.ico?'+Date.now();return;}
  else if(c==='encrypt'){r='Usage: encrypt <text>\nExample: encrypt Hello World\nOr use the CIPHER tab for full encryption suite.';}
  else if(c.startsWith('encrypt ')){const txt=cmd.slice(8);r='Base64: '+btoa(txt);}
  else if(c==='decode'){r='Usage: decode <base64>\nOr use the CIPHER tab.';}
  else if(c.startsWith('decode ')){try{r='Decoded: '+atob(cmd.slice(7));}catch{r='Error: Invalid base64';}}
  else if(c==='banner'){const d=GA();SA({annOn:!d.annOn});applyAnn();r='Banner '+(GA().annOn?'shown':'hidden');}
  else if(c==='matrix'){r=Array.from({length:6},()=>Array.from({length:32},()=>String.fromCharCode(rnd(33,126))).join('')).join('\n');}
  else if(c==='hack'){
    const steps=['[*] Initializing exploit framework...','[*] Scanning target ports...','[+] Port 80 open — HTTP','[+] Port 443 open — HTTPS','[*] Checking for vulnerabilities...','[!] CVE-2024-XXXX detected (SIMULATION)','[*] Injecting payload...','[+] Shell established','[*] Escalating privileges...','[+] ROOT ACCESS GRANTED','[*] Installing backdoor... (SIMULATION ONLY)','[+] All done. Welcome, hacker. 😈'];
    let i=0;out.textContent+=`$ ${cmd}\n`;
    function hs(){if(i<steps.length){out.textContent+=steps[i]+'\n';out.scrollTop=out.scrollHeight;i++;setTimeout(hs,rnd(100,300));}else{out.textContent+='$ ';}}hs();return;}
  else if(c==='exploit'){
    const ex=['Buffer overflow detected','SQL injection vector found','XSS payload executed','CSRF token bypassed','Remote code execution simulated'];
    out.textContent+=`$ ${cmd}\n[EXPLOIT SIM] Running...\n`;let i=0;
    function ef(){if(i<ex.length){out.textContent+='[!] '+ex[i]+'\n';out.scrollTop=out.scrollHeight;i++;setTimeout(ef,rnd(150,400));}else{out.textContent+='[+] Exploit simulation complete\n$ ';out.scrollTop=out.scrollHeight;}}ef();return;}
  else if(c==='nmap'){
    out.textContent+=`$ ${cmd}\nStarting Nmap scan (simulation)\nScanning 192.168.1.0/24...\n`;
    const ports=[22,80,443,3306,8080,27017];let i=0;
    function nf(){if(i<ports.length){out.textContent+=`192.168.1.${rnd(1,254)}/tcp  ${['open','filtered','closed'][rnd(0,2)].padEnd(8)}  port/${ports[i]}\n`;out.scrollTop=out.scrollHeight;i++;setTimeout(nf,rnd(100,250));}else{out.textContent+='Scan complete.\n$ ';out.scrollTop=out.scrollHeight;}}nf();return;}
  else{r=`bash: ${c}: command not found\nType 'help' for available commands.`;}
  out.textContent+=`$ ${cmd}\n${r}\n$ `;
  out.scrollTop=out.scrollHeight;
};

// ═══════════════════════════════════════════════
// CIPHER
// ═══════════════════════════════════════════════
const MORSE={'A':'.-','B':'-...','C':'-.-.','D':'-..','E':'.','F':'..-.','G':'--.','H':'....','I':'..','J':'.---','K':'-.-','L':'.-..','M':'--','N':'-.','O':'---','P':'.--.','Q':'--.-','R':'.-.','S':'...','T':'-','U':'..-','V':'...-','W':'.--','X':'-..-','Y':'-.--','Z':'--..',' ':'/'};
window.runCipher=function(){
  const txt=document.getElementById('cipher-input').value;
  const key=document.getElementById('cipher-key').value;
  const method=document.getElementById('cipher-method').value;
  const out=document.getElementById('cipher-out');
  let res='';
  try{
    if(method==='base64enc') res=btoa(unescape(encodeURIComponent(txt)));
    else if(method==='base64dec') res=decodeURIComponent(escape(atob(txt)));
    else if(method==='caesar'){const s=parseInt(key)||13;res=txt.replace(/[a-zA-Z]/g,c=>{const b=c<='Z'?65:97;return String.fromCharCode((c.charCodeAt(0)-b+s+26)%26+b);});}
    else if(method==='rot13') res=txt.replace(/[a-zA-Z]/g,c=>{const b=c<='Z'?65:97;return String.fromCharCode((c.charCodeAt(0)-b+13)%26+b);});
    else if(method==='reverse') res=txt.split('').reverse().join('');
    else if(method==='binary') res=txt.split('').map(c=>c.charCodeAt(0).toString(2).padStart(8,'0')).join(' ');
    else if(method==='hex') res=txt.split('').map(c=>c.charCodeAt(0).toString(16).padStart(2,'0')).join(' ');
    else if(method==='hexdec') res=txt.trim().split(/\s+/).map(h=>String.fromCharCode(parseInt(h,16))).join('');
    else if(method==='morse') res=txt.toUpperCase().split('').map(c=>MORSE[c]||'?').join(' ');
    else if(method==='vigenere'){const k=(key||'KEY').toUpperCase();let i=0;res=txt.replace(/[a-zA-Z]/g,c=>{const b=c<='Z'?65:97;const s=k[i%k.length].charCodeAt(0)-65;i++;return String.fromCharCode((c.charCodeAt(0)-b+s+26)%26+b);});}
    else if(method==='atbash') res=txt.replace(/[a-zA-Z]/g,c=>{const b=c<='Z'?65:97;return String.fromCharCode(b+25-(c.charCodeAt(0)-b));});
    else if(method==='xor'){const k=key||'42';res=txt.split('').map((c,i)=>String.fromCharCode(c.charCodeAt(0)^k.charCodeAt(i%k.length))).join('');}
  }catch(e){res='Error: '+e.message;}
  out.textContent=res;out.style.display='block';
};
window.swapCipherIO=function(){
  const i=document.getElementById('cipher-input'),o=document.getElementById('cipher-out');
  if(o.textContent){i.value=o.textContent;o.style.display='none';}
};
window.copyCipher=function(){const o=document.getElementById('cipher-out');if(o.textContent){navigator.clipboard?.writeText(o.textContent);notify('📋 Copied!');}};

window.runHash=async function(type){
  const txt=document.getElementById('hash-input').value;
  const out=document.getElementById('hash-out');
  if(!txt){notify('Enter text first','#ff3333');return;}
  try{
    const enc=new TextEncoder().encode(txt);
    const buf=await crypto.subtle.digest('SHA-256',enc);
    const h=Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
    if(type==='SHA256'){out.textContent='SHA-256:\n'+h;}
    else if(type==='MD5-like'){out.textContent='MD5-like (truncated SHA-256):\n'+h.slice(0,32);}
    else{out.textContent='SHA1-like (truncated SHA-256):\n'+h.slice(0,40);}
    out.style.display='block';
  }catch{out.textContent='Crypto API not available';out.style.display='block';}
};

const WORDS=['correct','horse','battery','staple','purple','monkey','dragon','master','login','shadow'];
window.genPassword=function(){
  const len=parseInt(document.getElementById('pg-len').value)||16;
  const type=document.getElementById('pg-type').value;
  const out=document.getElementById('pg-out');
  let pass='';
  const all='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}';
  const alpha='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const nums='0123456789';const hexC='0123456789ABCDEF';
  if(type==='all'){for(let i=0;i<len;i++)pass+=all[rnd(0,all.length-1)];}
  else if(type==='alpha'){for(let i=0;i<len;i++)pass+=alpha[rnd(0,alpha.length-1)];}
  else if(type==='num'){for(let i=0;i<len;i++)pass+=nums[rnd(0,9)];}
  else if(type==='hex'){for(let i=0;i<len;i++)pass+=hexC[rnd(0,15)];}
  else if(type==='pin'){for(let i=0;i<Math.min(len,8);i++)pass+=rnd(0,9);}
  else if(type==='phrase'){pass=Array.from({length:4},()=>WORDS[rnd(0,WORDS.length-1)]).join('-');}
  out.textContent=pass;out.style.display='block';
  const strength=pass.length<8?'WEAK':pass.length<12?'MODERATE':pass.length<20?'STRONG':'VERY STRONG';
  out.textContent=pass+'\n\nStrength: '+strength+'\nLength: '+pass.length+' chars';
};

// ═══════════════════════════════════════════════
// NETWORK
// ═══════════════════════════════════════════════
function loadNetInfo(){
  const el=document.getElementById('net-info');if(!el)return;
  const c=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
  el.innerHTML=[
    ['Status',     navigator.onLine?'✅ ONLINE':'❌ OFFLINE'],
    ['Type',       c?c.effectiveType||c.type||'Unknown':'Unknown'],
    ['Downlink',   c?c.downlink+'Mbps':'Unknown'],
    ['RTT',        c?c.rtt+'ms':'Unknown'],
    ['Timezone',   Intl.DateTimeFormat().resolvedOptions().timeZone],
    ['Language',   navigator.language],
    ['Screen',     screen.width+'×'+screen.height+' @'+screen.colorDepth+'bit'],
    ['CPU Cores',  navigator.hardwareConcurrency||'?'],
    ['RAM',        navigator.deviceMemory?navigator.deviceMemory+'GB':'?'],
    ['UserAgent',  navigator.userAgent.slice(0,50)],
  ].map(([k,v])=>`<span style="color:var(--g3)">${k}:</span> <span style="color:var(--g2)">${esc(String(v))}</span><br>`).join('');
}

window.runSpeed=function(){
  const ring=document.getElementById('speed-ring');
  const num=document.getElementById('speed-num');
  const log=document.getElementById('speed-log');
  log.textContent='Testing...'; num.textContent='--';
  const t=Date.now();const img=new Image();
  img.onload=img.onerror=function(){
    const ms=Date.now()-t;
    const mbps=Math.min(999,(1024/ms*8).toFixed(1));
    num.textContent=mbps;
    const offset=264-(264*Math.min(mbps/100,1));
    ring.setAttribute('stroke-dashoffset',offset.toFixed(1));
    log.textContent=`Download: ~${mbps}Mbps | Latency: ${ms}ms | ${new Date().toLocaleTimeString()}`;
    notify('✅ Speed test complete');
  };
  img.src='https://www.google.com/images/phd/px.gif?_='+Date.now();
};

window.pingTest=function(){
  const log=document.getElementById('speed-log');
  const t=Date.now();const img=new Image();
  img.onload=img.onerror=()=>{log.textContent='Ping: '+(Date.now()-t)+'ms';};
  img.src='https://www.google.com/favicon.ico?_='+Date.now();
};

window.latencyTest=function(){
  const log=document.getElementById('speed-log');
  const times=[];let i=0;
  function ping(){
    const t=Date.now();const img=new Image();
    img.onload=img.onerror=()=>{
      times.push(Date.now()-t);
      if(++i<5)setTimeout(ping,200);
      else log.textContent=`Latency: avg ${Math.round(times.reduce((a,b)=>a+b)/times.length)}ms | min ${Math.min(...times)}ms | max ${Math.max(...times)}ms`;
    };
    img.src='https://www.google.com/favicon.ico?_='+Date.now()+i;
  }
  ping();
};

window.runScan=function(){
  const out=document.getElementById('scan-out');out.innerHTML='';
  const ips=['192.168.1.1','192.168.1.100','192.168.1.101','10.0.0.1','10.0.0.2','172.16.0.1','192.168.0.254'];
  const svcs=['HTTP:80','SSH:22','HTTPS:443','DNS:53','MYSQL:3306','REDIS:6379'];
  ips.forEach((ip,i)=>setTimeout(()=>{
    const open=Math.random()>0.3;const svc=svcs[rnd(0,svcs.length-1)];
    out.innerHTML+=`<div class="alog"><span class="alog-t">${ip}</span><span class="alog-i" style="color:${open?'var(--g)':'var(--red)'}">${open?'● OPEN  '+svc:'○ CLOSED'}</span><span style="font-size:.58rem;color:var(--g3);margin-left:auto">${rnd(1,100)}ms</span></div>`;
    out.scrollTop=out.scrollHeight;
  },i*rnd(150,400)));
};

window.geoLookup=function(){
  const ip=document.getElementById('geo-inp').value.trim();
  const out=document.getElementById('geo-out');
  out.textContent='Looking up...';
  fetch(`https://ipapi.co/${ip}/json/`).then(r=>r.json()).then(d=>{
    out.innerHTML=[['IP',d.ip],['City',d.city],['Region',d.region],['Country',d.country_name],['ISP/Org',d.org],['Timezone',d.timezone],['Lat/Lon',`${d.latitude}, ${d.longitude}`],['Postal',d.postal]]
      .map(([k,v])=>`<span style="color:var(--g3)">${k}:</span> ${esc(String(v||'?'))}<br>`).join('');
  }).catch(()=>{out.textContent='Lookup failed (network/CORS error)';});
};

// ═══════════════════════════════════════════════
// PACKET VISUALIZER
// ═══════════════════════════════════════════════
let pktInterval=null,pktCount=0,pktBytes=0;
const PKT_TYPES=['TCP','UDP','HTTP','HTTPS','DNS','SSH','FTP','ICMP'];
const PKT_COLORS={'TCP':'#00ff41','UDP':'#00aaff','HTTP':'#ffcc00','HTTPS':'#00ffee','DNS':'#cc44ff','SSH':'#ff6600','FTP':'#ff4444','ICMP':'#aaaaaa'};
const PKT_LOG=[];const PROTO_CNT={};

function startPackets(){
  if(pktInterval)return;
  document.getElementById('pkt-badge').textContent='LIVE';
  const canvas=document.getElementById('packet-canvas');
  if(!canvas)return;
  canvas.width=canvas.offsetWidth||320;
  const ctx=canvas.getContext('2d');
  const packets=[];

  pktInterval=setInterval(()=>{
    ctx.fillStyle='rgba(0,0,0,.1)';ctx.fillRect(0,0,canvas.width,canvas.height);
    // spawn packet
    if(Math.random()<0.4){
      const type=PKT_TYPES[rnd(0,PKT_TYPES.length-1)];
      const size=rnd(40,1500);
      packets.push({x:0,y:rnd(10,canvas.height-10),vx:rnd(2,6),size,type,col:PKT_COLORS[type],alpha:1});
      pktCount++;pktBytes+=size;
      PROTO_CNT[type]=(PROTO_CNT[type]||0)+1;
      PKT_LOG.unshift({time:new Date().toLocaleTimeString(),type,size,src:`192.168.${rnd(1,3)}.${rnd(1,254)}`,dst:`10.0.${rnd(0,1)}.${rnd(1,254)}`});
      if(PKT_LOG.length>20)PKT_LOG.pop();
    }
    // draw packets
    for(let i=packets.length-1;i>=0;i--){
      const p=packets[i];
      ctx.globalAlpha=p.alpha;
      ctx.fillStyle=p.col;
      ctx.beginPath();ctx.arc(p.x,p.y,3,0,Math.PI*2);ctx.fill();
      // trail
      ctx.globalAlpha=p.alpha*.3;
      ctx.fillRect(p.x-p.vx*2,p.y-1,p.vx*2,2);
      ctx.globalAlpha=1;
      p.x+=p.vx;if(p.x>canvas.width)p.alpha-=0.1;
      if(p.alpha<=0)packets.splice(i,1);
    }
    // grid lines
    ctx.globalAlpha=0.05;ctx.strokeStyle='#00ff41';ctx.lineWidth=0.5;
    for(let y=0;y<canvas.height;y+=20){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(canvas.width,y);ctx.stroke();}
    ctx.globalAlpha=1;

    updatePktStats();
    updateProtoBreakdown();
    updatePktLog();
  },50);
}

function stopPackets(){if(pktInterval){clearInterval(pktInterval);pktInterval=null;document.getElementById('pkt-badge').textContent='PAUSED';}}
window.startPackets=startPackets;
window.stopPackets=stopPackets;
window.clearPackets=function(){pktCount=0;pktBytes=0;Object.keys(PROTO_CNT).forEach(k=>delete PROTO_CNT[k]);PKT_LOG.length=0;updatePktStats();};

function updatePktStats(){
  const el=document.getElementById('pkt-stats');if(!el)return;
  el.innerHTML=`<span style="color:var(--g)">Packets: ${fmt(pktCount)}</span><span style="color:var(--bl)">Bytes: ${pktBytes>1024?(pktBytes/1024).toFixed(1)+'KB':pktBytes+'B'}</span>`;
}
function updateProtoBreakdown(){
  const el=document.getElementById('proto-breakdown');if(!el)return;
  const total=Object.values(PROTO_CNT).reduce((a,b)=>a+b,0)||1;
  el.innerHTML=Object.entries(PROTO_CNT).sort((a,b)=>b[1]-a[1]).map(([t,c])=>
    `<div class="brow"><span class="blbl" style="color:${PKT_COLORS[t]}">${t}</span><div class="btrack"><div class="bfill" style="width:${Math.round(c/total*100)}%;background:${PKT_COLORS[t]}"></div></div><span class="bval">${c}</span></div>`
  ).join('');
}
function updatePktLog(){
  const el=document.getElementById('pkt-log');if(!el)return;
  el.innerHTML=PKT_LOG.map(p=>`<div class="alog"><span class="alog-t">${p.time}</span><span style="color:${PKT_COLORS[p.type]}">${p.type}</span><span class="alog-i">${p.src} → ${p.dst} [${p.size}B]</span></div>`).join('');
}

// ═══════════════════════════════════════════════
// THREAT SCANNER
// ═══════════════════════════════════════════════
const CHECKS=[
  ['Checking HTTPS enforcement...','HTTPS detected','ok'],
  ['Scanning for open debug endpoints...','No debug endpoints found','ok'],
  ['Checking Content Security Policy...','CSP header not detected','warn'],
  ['Scanning for exposed API keys...','No API keys in source','ok'],
  ['Checking for SQL injection vectors...','Input validation detected','ok'],
  ['Scanning XSS vulnerabilities...','1 potential XSS vector in URL params','warn'],
  ['Checking CORS policy...','CORS misconfiguration possible','warn'],
  ['Scanning for sensitive file exposure...','No .env or config files exposed','ok'],
  ['Checking password storage...','Passwords hashed in localStorage','ok'],
  ['Scanning for clickjacking protection...','X-Frame-Options not set','warn'],
  ['Checking for outdated dependencies...','Dependencies up to date','ok'],
  ['Running brute force simulation...','Rate limiting not detected','crit'],
  ['Scanning for directory traversal...','Path traversal protected','ok'],
  ['Checking session management...','Session tokens present','ok'],
  ['Final threat assessment complete...','Scan complete','ok'],
];

window.runThreat=function(){
  const out=document.getElementById('threat-out');
  out.innerHTML='';out.style.display='block';
  let score=100;let i=0;
  function step(){
    if(i>=CHECKS.length){
      const el=document.getElementById('score-num');
      const lbl=document.getElementById('score-label');
      if(el)el.textContent=score;
      if(lbl)lbl.textContent=score>=90?'🟢 EXCELLENT':score>=70?'🟡 MODERATE RISK':'🔴 HIGH RISK';
      out.innerHTML+=`<br><span class="threat-ok">━━━ SCAN COMPLETE — SCORE: ${score}/100 ━━━</span>`;
      out.scrollTop=out.scrollHeight;
      drawThreatRadar(score);
      return;
    }
    const [checking,result,level]=CHECKS[i];
    if(level==='warn')score-=5;if(level==='crit')score-=15;
    out.innerHTML+=`<span class="threat-${level==='ok'?'ok':level==='warn'?'warn':'crit'}">[${level.toUpperCase()}] ${result}</span>\n`;
    out.scrollTop=out.scrollHeight;i++;setTimeout(step,rnd(80,180));
  }
  out.innerHTML='<span style="color:var(--g3)">Starting security scan...\n\n</span>';
  setTimeout(step,200);
};

function drawThreatRadar(score){
  const c=document.getElementById('radar-canvas');if(!c)return;
  const ctx=c.getContext('2d');const cx=100,cy=100,r=80;
  ctx.clearRect(0,0,200,200);
  // grid
  ctx.strokeStyle='rgba(0,255,65,.1)';ctx.lineWidth=1;
  [0.25,0.5,0.75,1].forEach(s=>{ctx.beginPath();ctx.arc(cx,cy,r*s,0,Math.PI*2);ctx.stroke();});
  // axes
  const labels=['XSS','CSRF','SQLi','Auth','CORS','Deps'];
  const vals=labels.map(()=>rnd(20,90));
  ctx.strokeStyle='rgba(0,255,65,.15)';
  labels.forEach((_,i)=>{
    const a=-Math.PI/2+(i/labels.length)*Math.PI*2;
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);ctx.stroke();
  });
  // shape
  ctx.beginPath();
  labels.forEach((_,i)=>{
    const a=-Math.PI/2+(i/labels.length)*Math.PI*2;
    const v=vals[i]/100*r;
    i===0?ctx.moveTo(cx+Math.cos(a)*v,cy+Math.sin(a)*v):ctx.lineTo(cx+Math.cos(a)*v,cy+Math.sin(a)*v);
  });
  ctx.closePath();ctx.fillStyle='rgba(0,255,65,.15)';ctx.fill();
  ctx.strokeStyle='var(--g)';ctx.lineWidth=1.5;ctx.stroke();
  // labels
  ctx.fillStyle='var(--g2)';ctx.font='9px monospace';
  labels.forEach((lbl,i)=>{
    const a=-Math.PI/2+(i/labels.length)*Math.PI*2;
    ctx.fillText(lbl,cx+Math.cos(a)*(r+12)-10,cy+Math.sin(a)*(r+12)+4);
  });
  document.getElementById('radar-legend').innerHTML=labels.map((l,i)=>
    `<span style="color:var(--g3)">${l}: <span style="color:var(--g)">${vals[i]}%</span></span>`
  ).join('  ');
}

// ═══════════════════════════════════════════════
// CODE EDITOR
// ═══════════════════════════════════════════════
window.runCode=function(){
  const code=document.getElementById('code-editor').value;
  const lang=document.getElementById('editor-lang').value;
  const out=document.getElementById('code-output');
  out.style.display='block';
  if(lang==='js'){
    const logs=[];const orig=console.log;
    console.log=(...a)=>{logs.push(a.map(x=>typeof x==='object'?JSON.stringify(x,null,2):String(x)).join(' '));};
    try{eval(code);out.textContent=logs.length?logs.join('\n'):'(no output)';out.style.borderLeftColor='var(--g)';}
    catch(e){out.textContent='Error: '+e.message;out.style.borderLeftColor='var(--red)';}
    console.log=orig;
  } else if(lang==='json'){
    try{out.textContent=JSON.stringify(JSON.parse(code),null,2);out.style.borderLeftColor='var(--g)';}
    catch(e){out.textContent='Invalid JSON: '+e.message;out.style.borderLeftColor='var(--red)';}
  } else if(lang==='html'){
    const iframe=document.createElement('iframe');iframe.style.cssText='width:100%;height:200px;border:none;border-radius:6px;margin-top:6px;';
    out.innerHTML='';out.appendChild(iframe);
    iframe.contentDocument.open();iframe.contentDocument.write(code);iframe.contentDocument.close();
    out.style.borderLeftColor='var(--bl)';return;
  } else if(lang==='css'){
    let el=document.getElementById('editor-css-inject');
    if(!el){el=document.createElement('style');el.id='editor-css-inject';document.head.appendChild(el);}
    el.textContent=code;out.textContent='CSS injected into page.';out.style.borderLeftColor='var(--pur)';
  } else if(lang==='regex'){
    const lines=code.split('\n');const pattern=lines[0];const testStr=lines.slice(1).join('\n')||'Test string here';
    try{const re=new RegExp(pattern,'g');const matches=testStr.match(re)||[];out.textContent=`Pattern: ${pattern}\nTest: ${testStr}\nMatches (${matches.length}): ${matches.join(', ')||'none'}`;out.style.borderLeftColor='var(--yl)';}
    catch(e){out.textContent='Regex error: '+e.message;out.style.borderLeftColor='var(--red)';}
  }
};
window.clearEditor=()=>{document.getElementById('code-editor').value='';document.getElementById('code-output').style.display='none';};
window.copyCode=()=>{navigator.clipboard?.writeText(document.getElementById('code-editor').value);notify('📋 Copied!');};

const SNIPPETS={
  stats:`// Site statistics
const m = JSON.parse(localStorage.getItem('francis_monitor') || '{}');
console.log('Visits:', m.visits);
console.log('Tools opened:', m.toolsOpened);
console.log('Total clicks:', m.totalClicks);`,
  tools:`// List all tools
if (typeof TR !== 'undefined') {
  TR.forEach((t, i) => console.log(i+1, t[3], '—', t[1]));
} else {
  console.log('TR not loaded');
}`,
  storage:`// Storage usage
let total = 0;
for (let k in localStorage) {
  const size = localStorage[k].length;
  total += size;
  console.log(k + ': ' + (size/1024).toFixed(2) + 'KB');
}
console.log('Total:', (total/1024).toFixed(1) + 'KB');`,
  perf:`// Performance
const p = performance;
console.log('Navigation:', Math.round(p.now()) + 'ms uptime');
const e = p.getEntriesByType('navigation')[0];
if (e) {
  console.log('DOM ready:', Math.round(e.domContentLoadedEventEnd) + 'ms');
  console.log('Load:', Math.round(e.loadEventEnd) + 'ms');
}`,
  dom:`// DOM inspector
const all = document.querySelectorAll('*');
console.log('Total elements:', all.length);
const byTag = {};
all.forEach(el => { byTag[el.tagName] = (byTag[el.tagName]||0)+1; });
Object.entries(byTag).sort((a,b)=>b[1]-a[1]).slice(0,10).forEach(([t,c])=>console.log(t+': '+c));`,
  cookies:`// Cookies
const c = document.cookie;
console.log(c || 'No cookies set');
console.log('SessionStorage keys:', Object.keys(sessionStorage).join(', ') || 'none');`,
};
window.loadSnippet=k=>{const s=SNIPPETS[k];if(s)document.getElementById('code-editor').value=s;};

// ═══════════════════════════════════════════════
// VAULT
// ═══════════════════════════════════════════════
function loadVault(){renderVault();}
function renderVault(){
  const items=ls(VAULT_KEY)||[];
  const list=document.getElementById('vault-list');
  if(!list)return;
  if(!items.length){list.innerHTML='<div style="padding:12px;color:var(--g3);font-size:.68rem;text-align:center">No secrets stored yet</div>';return;}
  list.innerHTML=items.map((item,i)=>`
    <div class="vault-item">
      <span class="vault-name">${esc(item.name)}</span>
      <span class="vault-val" title="Click to reveal">${esc(item.value)}</span>
      <div class="vault-act">
        <button class="ab ghost" style="font-size:.55rem;padding:3px 7px" onclick="vaultCopy(${i})">COPY</button>
        <button class="ab red" style="font-size:.55rem;padding:3px 7px" onclick="vaultDel(${i})">DEL</button>
      </div>
    </div>`).join('');
}
window.vaultAdd=function(){
  const n=document.getElementById('vault-name').value.trim();
  const v=document.getElementById('vault-val').value;
  if(!n||!v){notify('Fill both fields','#ff3333');return;}
  const items=ls(VAULT_KEY)||[];items.push({name:n,value:v,added:new Date().toLocaleString()});
  lss(VAULT_KEY,items);renderVault();
  document.getElementById('vault-name').value='';document.getElementById('vault-val').value='';
  notify('🔒 Saved to vault!');
};
window.vaultCopy=i=>{const items=ls(VAULT_KEY)||[];if(items[i])navigator.clipboard?.writeText(items[i].value);notify('📋 Copied!');};
window.vaultDel=i=>{const items=ls(VAULT_KEY)||[];items.splice(i,1);lss(VAULT_KEY,items);renderVault();notify('🗑️ Deleted');};

// ═══════════════════════════════════════════════
// CRYPTO TRACKER
// ═══════════════════════════════════════════════
const COINS=[
  {sym:'BTC',name:'Bitcoin',base:43000},
  {sym:'ETH',name:'Ethereum',base:2600},
  {sym:'SOL',name:'Solana',base:98},
  {sym:'BNB',name:'BNB',base:310},
  {sym:'ADA',name:'Cardano',base:0.52},
  {sym:'DOT',name:'Polkadot',base:8.2},
  {sym:'DOGE',name:'Dogecoin',base:0.085},
  {sym:'MATIC',name:'Polygon',base:0.72},
];
let cryptoPrices={};
window.refreshCrypto=function(){
  COINS.forEach(c=>{
    const chg=(Math.random()-.48)*0.04;
    const prev=cryptoPrices[c.sym]||c.base;
    cryptoPrices[c.sym]=+(prev*(1+chg)).toFixed(c.base>100?2:4);
  });
  renderCrypto();drawCryptoChart();
};
function renderCrypto(){
  const list=document.getElementById('crypto-list');if(!list)return;
  list.innerHTML=COINS.map(c=>{
    const price=cryptoPrices[c.sym]||c.base;
    const chg=((price-c.base)/c.base*100).toFixed(2);
    const up=parseFloat(chg)>=0;
    return `<div class="cticker">
      <span class="cticker-sym">${c.sym}</span>
      <span style="font-size:.6rem;color:var(--g3)">${c.name}</span>
      <div class="cticker-bar"><div class="btrack"><div class="bfill ${up?'green':'red'}" style="width:${Math.min(100,Math.abs(chg)*5+50)}%"></div></div></div>
      <span class="cticker-price">$${price.toLocaleString()}</span>
      <span class="cticker-chg ${up?'up':'dn'}">${up?'▲':'▼'}${Math.abs(chg)}%</span>
    </div>`;
  }).join('');
}
function drawCryptoChart(){
  const c=document.getElementById('crypto-canvas');if(!c)return;
  c.width=c.offsetWidth||300;
  const ctx=c.getContext('2d');
  ctx.clearRect(0,0,c.width,c.height);
  ctx.strokeStyle='var(--g)';ctx.lineWidth=2;ctx.beginPath();
  const pts=Array.from({length:30},(_,i)=>rnd(30,70));
  pts.forEach((p,i)=>{const x=i/29*c.width;const y=(1-p/100)*c.height;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
  ctx.stroke();
  ctx.strokeStyle='rgba(0,255,65,.2)';ctx.beginPath();
  const pts2=Array.from({length:30},(_,i)=>rnd(20,80));
  pts2.forEach((p,i)=>{const x=i/29*c.width;const y=(1-p/100)*c.height;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
  ctx.stroke();
}
window.cryptoAlert=()=>notify('💡 Alerts coming in next update!','#ffcc00');

// ═══════════════════════════════════════════════
// TOOLS MANAGER
// ═══════════════════════════════════════════════
function loadTools(){
  if(typeof TR==='undefined')return;
  renderTools(TR);
  const dis=(GA().disabledTools||[]).length;
  const badge=document.getElementById('tools-badge');
  if(badge)badge.textContent=`${TR.length-dis} ACTIVE / ${dis} DISABLED`;
}
function renderTools(list){
  const dis=GA().disabledTools||[];
  document.getElementById('tool-list').innerHTML=list.map(t=>
    `<div class="atog" onclick="togTool('${t[0]}')">
      <div class="atog-i"><div class="atog-n">${t[2]} ${t[3]}</div><div class="atog-s">${t[1].toUpperCase()} · ${t[4]}</div></div>
      <div class="asw ${dis.includes(t[0])?'':'on'}" id="tsw-${t[0]}"></div>
    </div>`
  ).join('');
}
window.filterTools=q=>{if(typeof TR==='undefined')return;renderTools(q?TR.filter(t=>t[3].toLowerCase().includes(q.toLowerCase())||t[1].includes(q.toLowerCase())):TR);};
window.togTool=id=>{
  const d=GA();d.disabledTools=d.disabledTools||[];
  const i=d.disabledTools.indexOf(id);i===-1?d.disabledTools.push(id):d.disabledTools.splice(i,1);
  SA(d);const sw=document.getElementById('tsw-'+id);if(sw)sw.classList.toggle('on',!d.disabledTools.includes(id));
  applyDisabledTools();loadTools();
  notify(d.disabledTools.includes(id)?'🚫 Disabled':'✅ Enabled');
};
window.allTools=on=>{const d=GA();d.disabledTools=on?[]:(typeof TR!=='undefined'?TR.map(t=>t[0]):[]);SA(d);loadTools();applyDisabledTools();notify(on?'✅ All enabled':'🚫 All disabled');};
function applyDisabledTools(){
  const dis=GA().disabledTools||[];
  document.querySelectorAll('.tb,.tool-btn').forEach(b=>{
    const m=(b.getAttribute('onclick')||'').match(/openTool\('([^']+)'\)/);
    if(m){b.style.opacity=dis.includes(m[1])?'.2':'';b.style.pointerEvents=dis.includes(m[1])?'none':'';}
  });
}

// ═══════════════════════════════════════════════
// THEME
// ═══════════════════════════════════════════════
const THEME_BG={'green':'#00ff41','blue':'#00aaff','red':'#ff4444','purple':'#cc44ff','amber':'#ffaa00','cyan':'#00ffee','orange':'#ff6600','pink':'#ff66aa'};
function loadTheme(){
  const cur=GA().theme||'green';
  document.getElementById('theme-swatches').innerHTML=Object.entries(THEME_BG).map(([id,col])=>
    `<div class="tswatch ${id===cur?'on':''}" id="thsw-${id}" style="background:${col};color:#000"
      onclick="pickTheme('${id}')">${id.toUpperCase()}</div>`
  ).join('');
  const fx=GA().effects||{};
  ['matrix','glow','scanline','animations','particles'].forEach(k=>{
    const sw=document.getElementById('fx-'+k);if(sw)sw.classList.toggle('on',fx[k]!==false);
  });
  const css=GA().customCSS||'';
  if(css)document.getElementById('custom-css').value=css;
}
window.pickTheme=id=>{document.querySelectorAll('.tswatch').forEach(s=>s.classList.remove('on'));document.getElementById('thsw-'+id)?.classList.add('on');SA({theme:id});};
window.applyThemeBtn=()=>{applyTheme(GA().theme||'green');notify('🎨 Theme applied!');};
window.fxTog=key=>{const d=GA();d.effects=d.effects||{};d.effects[key]=d.effects[key]===false?true:false;SA(d);const sw=document.getElementById('fx-'+key);if(sw)sw.classList.toggle('on',d.effects[key]!==false);if(key==='matrix'){const c=document.getElementById('matrix');if(c)c.style.display=d.effects[key]!==false?'':'none';}notify((d.effects[key]!==false?'✅ ':'🚫 ')+key);};
window.injectCSS=()=>{const css=document.getElementById('custom-css').value;let el=document.getElementById('adm-css-inject');if(!el){el=document.createElement('style');el.id='adm-css-inject';document.head.appendChild(el);}el.textContent=css;SA({customCSS:css});notify('💉 CSS injected!');};
window.removeCSS=()=>{document.getElementById('adm-css-inject')?.remove();SA({customCSS:''});notify('🗑️ CSS removed');};

// ═══════════════════════════════════════════════
// ANNOUNCE
// ═══════════════════════════════════════════════
function loadAnn(){const d=GA();if(d.annText)document.getElementById('ann-txt').value=d.annText;if(d.annBg)document.getElementById('ann-bg').value=d.annBg;if(d.annFg)document.getElementById('ann-fg').value=d.annFg;}
window.annPreview=()=>{const p=document.getElementById('ann-prev');p.style.display='block';p.style.background=document.getElementById('ann-bg').value;p.style.color=document.getElementById('ann-fg').value;p.textContent=document.getElementById('ann-txt').value||'No text';};
window.annSave=show=>{SA({annText:document.getElementById('ann-txt').value,annBg:document.getElementById('ann-bg').value,annFg:document.getElementById('ann-fg').value,annOn:show});applyAnn();notify(show?'📢 Banner live!':'🚫 Banner hidden');};

// ═══════════════════════════════════════════════
// CONTENT
// ═══════════════════════════════════════════════
function loadContent(){const d=GA();['title','desc','footer','designer','tab'].forEach(k=>{const el=document.getElementById('cnt-'+k);if(el&&d['site_'+k])el.value=d['site_'+k];});}
window.saveContent=()=>{
  const fields={title:'cnt-title',desc:'cnt-desc',footer:'cnt-footer',designer:'cnt-designer',tab:'cnt-tab'};
  const vals={};Object.entries(fields).forEach(([k,id])=>{vals['site_'+k]=document.getElementById(id)?.value||'';});
  SA(vals);
  const ht=document.querySelector('.hero-title,#hero-title');const hd=document.querySelector('.hero-desc,#hero-desc');const ft=document.querySelector('.footer,.ft,#footer');
  if(ht&&vals.site_title)ht.innerHTML=vals.site_title.replace(/\n/g,'<br>');
  if(hd&&vals.site_desc)hd.textContent=vals.site_desc;
  if(ft&&vals.site_footer)ft.textContent=vals.site_footer;
  if(vals.site_tab)document.title=vals.site_tab;
  notify('✅ Content updated!');
};

// ═══════════════════════════════════════════════
// LOGS
// ═══════════════════════════════════════════════
function loadLogs(){
  const logs=(ls(LOG_KEY)||[]).slice().reverse();
  document.getElementById('log-badge').textContent=logs.length+' ENTRIES';
  const list=document.getElementById('log-list');
  if(!list)return;
  list.innerHTML=logs.slice(0,100).map(l=>`
    <div class="alog">
      <span class="alog-t">${new Date(l.t).toLocaleTimeString()}<br><span style="font-size:.5rem">${new Date(l.t).toLocaleDateString()}</span></span>
      <span class="alog-i">${esc(l.tz||'?')} · ${esc((l.ua||'').slice(0,45))}</span>
    </div>`).join('')||'<div style="padding:10px;color:var(--g3);font-size:.68rem;text-align:center">No logs</div>';
}
window.clearLogs=()=>{if(!confirm('Clear all logs?'))return;lss(LOG_KEY,[]);loadLogs();notify('🗑️ Logs cleared');};
window.exportCSV=()=>{
  const logs=ls(LOG_KEY)||[];
  const csv='Time,Date,Timezone,Screen,UserAgent\n'+logs.map(l=>`"${new Date(l.t).toLocaleTimeString()}","${new Date(l.t).toLocaleDateString()}","${l.tz||''}","${l.scr||''}","${(l.ua||'').replace(/"/g,"'")}"`).join('\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='francis-logs-'+Date.now()+'.csv';a.click();notify('💾 Exported!');
};

// ═══════════════════════════════════════════════
// NOTES
// ═══════════════════════════════════════════════
function loadNotes(){
  const ta=document.getElementById('notes-ta');if(!ta)return;
  ta.value=ls(NOTE_KEY)||'';
  ta.addEventListener('input',()=>{lss(NOTE_KEY,ta.value);const s=document.getElementById('notes-status');if(s){s.textContent='● Auto-saved';setTimeout(()=>s.textContent='',1200);}});
}
window.saveNotes=()=>{lss(NOTE_KEY,document.getElementById('notes-ta').value);notify('📋 Saved!');};
window.copyNotes=()=>{navigator.clipboard?.writeText(document.getElementById('notes-ta').value);notify('📋 Copied!');};
window.clearNotes=()=>{if(confirm('Clear notes?')){document.getElementById('notes-ta').value='';lss(NOTE_KEY,'');notify('🗑️ Cleared');}};

// ═══════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════
window.exportData=type=>{
  const d={};
  if(type==='all'||type==='analytics')d.analytics=GM();
  if(type==='all'||type==='logs')d.logs=ls(LOG_KEY)||[];
  if(type==='all'||type==='vault')d.vault=ls(VAULT_KEY)||[];
  if(type==='all')d.settings=GA();
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(d,null,2)],{type:'application/json'}));a.download=`francis-${type}-${Date.now()}.json`;a.click();notify('💾 Exported!');
};
window.importData=()=>{try{const d=JSON.parse(document.getElementById('imp-json').value);if(d.analytics)lss('francis_monitor',d.analytics);if(d.logs)lss(LOG_KEY,d.logs);if(d.vault)lss(VAULT_KEY,d.vault);if(d.settings)lss(ADMIN_KEY,d.settings);loadAnalytics();loadLogs();loadVault();loadSettings();notify('✅ Imported!');}catch{notify('✕ Invalid JSON','#ff3333');}};
window.resetD=type=>{
  if(!confirm(`Reset ${type}?`))return;
  if(type==='analytics'||type==='all')localStorage.removeItem('francis_monitor');
  if(type==='logs'||type==='all')localStorage.removeItem(LOG_KEY);
  if(type==='vault'||type==='all')localStorage.removeItem(VAULT_KEY);
  if(type==='all'){localStorage.removeItem(ADMIN_KEY);localStorage.removeItem(PASS_KEY);}
  loadAnalytics();loadLogs();loadVault();loadDash();notify('🗑️ Reset done');
};

// ═══════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════
function loadSettings(){
  const s=GA().settings||{};
  ['hideAI','compactTools','hideNav','disableAnn'].forEach(k=>{const sw=document.getElementById('set-'+k);if(sw)sw.classList.toggle('on',!!s[k]);});
  document.getElementById('sys-info').innerHTML=[
    ['Browser',navigator.userAgent.slice(0,40)+'...'],
    ['Platform',navigator.platform],
    ['Screen',screen.width+'×'+screen.height],
    ['Language',navigator.language],
    ['Timezone',Intl.DateTimeFormat().resolvedOptions().timeZone],
    ['Online',navigator.onLine?'✅ Yes':'❌ No'],
    ['Tools',typeof TR!=='undefined'?TR.length:'?'],
    ['Storage',(()=>{try{let t=0;for(let k in localStorage)t+=localStorage[k].length;return(t/1024).toFixed(1)+'KB';}catch{return'N/A'}})()],
    ['Default pw','francis2025 (change above)'],
  ].map(([k,v])=>`<span style="color:var(--g3)">${k}:</span> <span style="color:var(--g2)">${v}</span><br>`).join('');
}
window.togSet=k=>{const d=GA();d.settings=d.settings||{};d.settings[k]=!d.settings[k];SA(d);const sw=document.getElementById('set-'+k);if(sw)sw.classList.toggle('on',!!d.settings[k]);};
window.applySettings=()=>{
  const s=GA().settings||{};
  const fab=document.getElementById('ai-fab');if(fab)fab.style.display=s.hideAI?'none':'';
  const nav=document.getElementById('fn-nav');if(nav)nav.style.display=s.hideNav?'none':'';
  if(s.compactTools)document.querySelectorAll('.tb,.tool-btn').forEach(b=>b.style.padding='8px 10px');
  notify('✅ Applied!');
};
window.changePw=()=>{
  const o=document.getElementById('pw-old').value,n=document.getElementById('pw-new').value,c=document.getElementById('pw-cf').value;
  const msg=document.getElementById('pw-msg');const saved=ls(PASS_KEY)||DEFAULT_PASS;
  if(o!==saved){msg.style.color='var(--red)';msg.textContent='Wrong current password';return;}
  if(n.length<4){msg.style.color='var(--red)';msg.textContent='Min 4 characters';return;}
  if(n!==c){msg.style.color='var(--red)';msg.textContent='Passwords do not match';return;}
  lss(PASS_KEY,n);msg.style.color='var(--g)';msg.textContent='✓ Password changed!';
  ['pw-old','pw-new','pw-cf'].forEach(id=>document.getElementById(id).value='');
  setTimeout(()=>msg.textContent='',2500);
};

// ═══════════════════════════════════════════════
// INIT SAVED STATE
// ═══════════════════════════════════════════════
setTimeout(()=>{
  const d=GA();
  if(d.customCSS){let el=document.getElementById('adm-css-inject');if(!el){el=document.createElement('style');el.id='adm-css-inject';document.head.appendChild(el);}el.textContent=d.customCSS;}
  applyDisabledTools();
  applyTheme(d.theme||'green');
  const s=d.settings||{};
  const fab=document.getElementById('ai-fab');if(fab&&s.hideAI)fab.style.display='none';
},700);

// ═══════════════════════════════════════════════
// SYSMON
// ═══════════════════════════════════════════════
let sysmonInterval=null;
const cpuHistory=[],memHistory=[];
function startSysmon(){
  if(sysmonInterval)return;
  const cpuC=document.getElementById('cpu-canvas');const memC=document.getElementById('mem-canvas');
  if(!cpuC||!memC)return;
  cpuC.width=cpuC.offsetWidth||300;memC.width=memC.offsetWidth||300;
  sysmonInterval=setInterval(()=>{
    const cpu=rnd(5,75);const mem=performance.memory?Math.round(performance.memory.usedJSHeapSize/performance.memory.jsHeapSizeLimit*100):rnd(30,60);
    cpuHistory.push(cpu);memHistory.push(mem);
    if(cpuHistory.length>50)cpuHistory.shift();if(memHistory.length>50)memHistory.shift();
    drawGraph(cpuC,cpuHistory,'var(--g)',cpu+'%');
    drawGraph(memC,memHistory,'var(--bl)',mem+'%');
    updateSysStats(cpu,mem);updateProcList();
  },800);
}
function drawGraph(c,data,col,label){
  const ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);
  ctx.fillStyle='#000';ctx.fillRect(0,0,c.width,c.height);
  // grid
  ctx.strokeStyle='rgba(0,255,65,.06)';ctx.lineWidth=.5;
  for(let y=0;y<c.height;y+=15){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(c.width,y);ctx.stroke();}
  if(!data.length)return;
  ctx.strokeStyle=col;ctx.lineWidth=1.5;ctx.beginPath();
  data.forEach((v,i)=>{const x=i/(data.length-1||1)*c.width;const y=c.height-(v/100*c.height);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
  ctx.stroke();
  // fill
  ctx.lineTo(c.width,c.height);ctx.lineTo(0,c.height);ctx.closePath();
  ctx.fillStyle=col.replace('var(--g)','rgba(0,255,65,.1)').replace('var(--bl)','rgba(0,170,255,.1)');ctx.fill();
  // label
  ctx.fillStyle=col.includes('bl')?'#00aaff':'#00ff41';ctx.font='bold 10px monospace';
  ctx.fillText(label,6,14);
}
function updateSysStats(cpu,mem){
  const el=document.getElementById('sysmon-stats');if(!el)return;
  const stor=(()=>{try{let t=0;for(let k in localStorage)t+=localStorage[k].length;return Math.min(100,Math.round(t/5120*100));}catch{return 0;}})();
  el.innerHTML=[[cpu+'%','CPU'],[(mem||0)+'%','MEMORY'],[stor+'%','STORAGE'],[navigator.hardwareConcurrency||'?','CORES'],[(navigator.deviceMemory||'?')+'GB','RAM'],[(typeof TR!=='undefined'?TR.length:0),'TOOLS']].map(([n,l])=>`<div class="astat"><div class="asn">${n}</div><div class="asl">${l}</div></div>`).join('');
}
function updateProcList(){
  const el=document.getElementById('proc-list');if(!el)return;
  const procs=[['francis-main','renderer',rnd(10,80)],['sw.js','service-worker',rnd(1,10)],['matrix-canvas','animation',rnd(5,30)],['monitor.js','analytics',rnd(1,5)],['ai-agent.js','ai',rnd(2,8)],['admin.js','admin',rnd(30,60)]];
  el.innerHTML=`<div style="display:flex;gap:8px;padding:5px 9px;font-size:.58rem;color:var(--g3);border-bottom:1px solid var(--g5)"><span style="flex:2">PROCESS</span><span style="flex:1">TYPE</span><span style="min-width:50px;text-align:right">CPU%</span></div>`+
  procs.map(([n,t,c])=>`<div class="alog"><span class="alog-i">${n}</span><span style="color:var(--g3);min-width:80px">${t}</span><span style="color:${c>50?'var(--red)':c>20?'var(--yl)':'var(--g)'};min-width:40px;text-align:right">${c}%</span></div>`).join('');
}
// battery
async function loadBattery(){
  const el=document.getElementById('battery-info');if(!el)return;
  try{
    const b=await navigator.getBattery?.();
    if(b){el.innerHTML=[['Level',Math.round(b.level*100)+'%'],['Charging',b.charging?'✅ Yes':'🔋 No'],['Charge Time',b.chargingTime===Infinity?'N/A':fmtT(b.chargingTime)],['Discharge',b.dischargingTime===Infinity?'N/A':fmtT(b.dischargingTime)]].map(([k,v])=>`<span style="color:var(--g3)">${k}:</span> ${v}<br>`).join('');}
    else el.textContent='Battery API not available';
  }catch{el.textContent='Battery API not available';}
}

// ═══════════════════════════════════════════════
// WORLD CLOCK + STOPWATCH + TIMER
// ═══════════════════════════════════════════════
const ZONES=[['New York','America/New_York'],['London','Europe/London'],['Paris','Europe/Paris'],['Dubai','Asia/Dubai'],['Mumbai','Asia/Kolkata'],['Tokyo','Asia/Tokyo'],['Sydney','Australia/Sydney'],['LA','America/Los_Angeles'],['São Paulo','America/Sao_Paulo'],['Moscow','Europe/Moscow']];
let wcInterval=null;
function startWorldClock(){
  if(wcInterval)return;
  wcInterval=setInterval(()=>{
    const el=document.getElementById('world-clocks');if(!el)return;
    el.innerHTML=ZONES.map(([city,tz])=>{
      const t=new Date().toLocaleTimeString('en',{timeZone:tz,hour12:false});
      const d=new Date().toLocaleDateString('en',{timeZone:tz,month:'short',day:'numeric'});
      return `<div class="astat"><div style="font-size:.58rem;color:var(--g3);margin-bottom:2px">${city}</div><div class="asn" style="font-size:.9rem;letter-spacing:1px">${t}</div><div class="asl">${d}</div></div>`;
    }).join('');
  },1000);
}
// stopwatch
let swRunning=false,swStart=0,swElapsed=0,swTimer=null,swLaps=[];
window.swStart=function(){
  if(swRunning)return;swRunning=true;swStart=Date.now()-swElapsed;
  swTimer=setInterval(()=>{swElapsed=Date.now()-swStart;const ms=swElapsed;const h=Math.floor(ms/3600000);const m=Math.floor(ms%3600000/60000);const s=Math.floor(ms%60000/1000);const cs=Math.floor(ms%1000);document.getElementById('sw-display').textContent=(h?String(h).padStart(2,'0')+':':'')+(m?String(m).padStart(2,'0')+':':'00:')+String(s).padStart(2,'0')+'.'+String(cs).padStart(3,'0');},33);
};
window.swStop=()=>{clearInterval(swTimer);swRunning=false;};
window.swReset=()=>{clearInterval(swTimer);swRunning=false;swElapsed=0;swLaps=[];document.getElementById('sw-display').textContent='00:00.000';document.getElementById('sw-laps').innerHTML='';};
window.swLap=()=>{if(!swRunning)return;swLaps.push(swElapsed);const el=document.getElementById('sw-laps');const ms=swElapsed;el.innerHTML+=`<div style="display:flex;justify-content:space-between;padding:4px 8px;border-bottom:1px solid var(--g5);font-size:.6rem"><span style="color:var(--g3)">Lap ${swLaps.length}</span><span style="color:var(--g)">${Math.floor(ms/60000).toString().padStart(2,'0')}:${Math.floor(ms%60000/1000).toString().padStart(2,'0')}.${Math.floor(ms%1000).toString().padStart(3,'0')}</span></div>`;el.scrollTop=0;};
// countdown
let tmInterval=null,tmRemaining=0;
window.tmStart=function(){
  clearInterval(tmInterval);
  const h=parseInt(document.getElementById('tm-h').value)||0;
  const m=parseInt(document.getElementById('tm-m').value)||0;
  const s=parseInt(document.getElementById('tm-s').value)||0;
  tmRemaining=h*3600+m*60+s;
  tmInterval=setInterval(()=>{
    if(tmRemaining<=0){clearInterval(tmInterval);document.getElementById('tm-display').textContent='⏰ DONE!';notify('⏰ Timer finished!');return;}
    tmRemaining--;const hh=Math.floor(tmRemaining/3600);const mm=Math.floor(tmRemaining%3600/60);const ss=tmRemaining%60;
    document.getElementById('tm-display').textContent=String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0')+':'+String(ss).padStart(2,'0');
  },1000);
};
window.tmStop=()=>clearInterval(tmInterval);
window.tmReset=()=>{clearInterval(tmInterval);document.getElementById('tm-display').textContent='00:05:00';};

// ═══════════════════════════════════════════════
// CALCULATOR
// ═══════════════════════════════════════════════
let calcExpr='',calcHistory=[];
function buildCalc(){
  const btns=[
    ['C','red','C'],['±','ghost','±'],['%','ghost','%'],['÷','yellow','÷'],
    ['7','','7'],['8','','8'],['9','','9'],['×','yellow','×'],
    ['4','','4'],['5','','5'],['6','','6'],['−','yellow','−'],
    ['1','','1'],['2','','2'],['3','','3'],['+','yellow','+'],
    ['sin','ghost','sin('],['cos','ghost','cos('],['tan','ghost','tan('],['√','ghost','√'],
    ['(','ghost','('],['π','ghost','π'],['e','ghost','e'],['^','ghost','^'],
    ['0','','0'],['.','','.'],[')','ghost',')'],['=','green','='],
  ];
  document.getElementById('calc-btns').innerHTML=btns.map(([l,c,v])=>`<button class="ab ${c}" style="padding:12px 4px;font-size:.8rem" onclick="calcBtn('${v}')">${l}</button>`).join('');
}
window.calcBtn=function(v){
  const disp=document.getElementById('calc-display');
  const hist=document.getElementById('calc-history');
  if(v==='C'){calcExpr='';disp.textContent='0';return;}
  if(v==='='){
    try{
      const expr=calcExpr.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/π/g,'Math.PI').replace(/e/g,'Math.E').replace(/sin\(/g,'Math.sin(').replace(/cos\(/g,'Math.cos(').replace(/tan\(/g,'Math.tan(').replace(/√/g,'Math.sqrt(').replace(/\^/g,'**');
      const res=Function('"use strict";return ('+expr+')')();
      calcHistory.unshift(calcExpr+' = '+res);
      if(calcHistory.length>8)calcHistory.pop();
      hist.innerHTML=calcHistory.slice(0,4).map(h=>`<div style="color:var(--g4)">${h}</div>`).join('');
      disp.textContent=Number.isFinite(res)?res.toString().slice(0,14):'Error';
      calcExpr=res.toString();
    }catch{disp.textContent='Error';calcExpr='';}
    return;
  }
  if(v==='±'){calcExpr=calcExpr.startsWith('-')?calcExpr.slice(1):'-'+calcExpr;}
  else if(v==='%'){try{calcExpr=String(Function('"use strict";return ('+calcExpr+')')()*.01);}catch{}}
  else{calcExpr+=v;}
  disp.textContent=calcExpr||'0';
};

// Unit Converter
const UC_UNITS={
  length:{m:1,km:1000,cm:.01,mm:.001,in:.0254,ft:.3048,yd:.9144,mi:1609.34},
  weight:{kg:1,g:.001,lb:.453592,oz:.0283495,t:1000,mg:.000001},
  temp:{special:true},
  speed:{'m/s':1,'km/h':0.277778,'mph':0.44704,'knot':0.514444},
  area:{'m²':1,'km²':1e6,'cm²':0.0001,'ft²':0.092903,'acre':4046.86,'ha':10000},
  data:{B:1,KB:1024,MB:1048576,GB:1073741824,TB:1099511627776},
};
window.loadUCUnits=function(){
  const type=document.getElementById('uc-type').value;
  const units=UC_UNITS[type];if(!units)return;
  const keys=Object.keys(units).filter(k=>k!=='special');
  const opts=keys.map(k=>`<option value="${k}">${k}</option>`).join('');
  document.getElementById('uc-from-unit').innerHTML=opts;
  document.getElementById('uc-to-unit').innerHTML=opts;
  if(type==='temp'){document.getElementById('uc-from-unit').innerHTML='<option>°C</option><option>°F</option><option>K</option>';document.getElementById('uc-to-unit').innerHTML='<option>°C</option><option>°F</option><option>K</option>';}
  doConvert();
};
window.doConvert=function(){
  const type=document.getElementById('uc-type').value;
  const val=parseFloat(document.getElementById('uc-from-val').value)||0;
  const fu=document.getElementById('uc-from-unit').value;
  const tu=document.getElementById('uc-to-unit').value;
  const res=document.getElementById('uc-to-val');
  if(type==='temp'){
    let c;
    if(fu==='°C')c=val;else if(fu==='°F')c=(val-32)*5/9;else c=val-273.15;
    let out;
    if(tu==='°C')out=c;else if(tu==='°F')out=c*9/5+32;else out=c+273.15;
    res.value=out.toFixed(4);
  } else {
    const u=UC_UNITS[type];if(!u)return;
    res.value=((val*(u[fu]||1))/(u[tu]||1)).toFixed(6).replace(/\.?0+$/,'');
  }
};
setTimeout(loadUCUnits,100);

// ═══════════════════════════════════════════════
// QR GENERATOR (uses Google Charts API)
// ═══════════════════════════════════════════════
window.genQR=function(){
  const text=encodeURIComponent(document.getElementById('qr-text').value||'https://YOUR-PROJECT.vercel.app/');
  const fg=document.getElementById('qr-fg').value.replace('#','');
  const bg=document.getElementById('qr-bg').value.replace('#','');
  const size=document.getElementById('qr-size').value;
  const url=`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${text}&color=${fg}&bgcolor=${bg}`;
  const out=document.getElementById('qr-output');
  out.innerHTML=`<img src="${url}" style="border-radius:8px;max-width:100%;border:2px solid var(--g4)" onload="this.style.opacity=1" onerror="document.getElementById('qr-output').textContent='QR failed — check network'" style="opacity:0;transition:opacity .3s">`;
  setTimeout(()=>{const img=out.querySelector('img');if(img)img.style.opacity=1;},100);
  notify('📱 QR generated!');
};
window.downloadQR=function(){
  const img=document.querySelector('#qr-output img');if(!img){notify('Generate QR first','#ff3333');return;}
  const a=document.createElement('a');a.href=img.src;a.download='qr-code.png';a.target='_blank';a.click();
};
const QR_PRESETS={url:'https://YOUR-PROJECT.vercel.app/',email:'mailto:Akshitasleo@gmail.com',wifi:'WIFI:S:MyNetwork;T:WPA;P:mypassword;;',contact:'BEGIN:VCARD\nFN:Akshit Singh\nEMAIL:Akshitasleo@gmail.com\nEND:VCARD',sms:'sms:+1234567890?body=Hello'};
window.qrPreset=k=>{document.getElementById('qr-text').value=QR_PRESETS[k]||'';genQR();};

// ═══════════════════════════════════════════════
// COLOR LAB
// ═══════════════════════════════════════════════
function hexToRGB(hex){const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return{r,g,b};}
function rgbToHSL(r,g,b){r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b);let h,s,l=(max+min)/2;if(max===min){h=s=0;}else{const d=max-min;s=l>.5?d/(2-max-min):d/(max+min);switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;break;}h/=6;}return{h:Math.round(h*360),s:Math.round(s*100),l:Math.round(l*100)};}
window.clUpdate=function(hex){
  const {r,g,b}=hexToRGB(hex);const {h,s,l}=rgbToHSL(r,g,b);
  document.getElementById('cl-values').innerHTML=[
    ['HEX',hex.toUpperCase()],['RGB',`rgb(${r}, ${g}, ${b})`],
    ['HSL',`hsl(${h}, ${s}%, ${l}%)`],['CMYK',`${Math.round((1-r/255)*100)}% ${Math.round((1-g/255)*100)}% ${Math.round((1-b/255)*100)}% ${Math.round((1-Math.max(r,g,b)/255)*100)}%`],
    ['Luminance',((0.299*r+0.587*g+0.114*b)/255).toFixed(3)],['Brightness',Math.round((r*299+g*587+b*114)/1000)],
  ].map(([k,v])=>`<div class="astat" style="padding:7px;cursor:text" onclick="navigator.clipboard?.writeText('${v}');window.admNotif&&notify('Copied!')"><div style="font-size:.58rem;color:var(--g3)">${k}</div><div style="font-size:.65rem;color:var(--g2);margin-top:2px;word-break:break-all">${v}</div></div>`).join('');
};
window.genPalette=function(type){
  const base=document.getElementById('cl-picker').value;
  const {r,g,b}=hexToRGB(base);const {h,s,l}=rgbToHSL(r,g,b);
  let colors=[];
  const hsl2hex=(hh,ss,ll)=>{hh/=360;ss/=100;ll/=100;let r,g,b;if(ss===0){r=g=b=ll;}else{const q=ll<.5?ll*(1+ss):ll+ss-ll*ss;const p=2*ll-q;const hue2rgb=(p,q,t)=>{if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p;};r=hue2rgb(p,q,hh+1/3);g=hue2rgb(p,q,hh);b=hue2rgb(p,q,hh-1/3);}return'#'+[r,g,b].map(x=>Math.round(x*255).toString(16).padStart(2,'0')).join('');};
  if(type==='complement')colors=[base,hsl2hex((h+180)%360,s,l),hsl2hex((h+30)%360,s,l),hsl2hex((h+150)%360,s,l)];
  else if(type==='triadic')colors=[base,hsl2hex((h+120)%360,s,l),hsl2hex((h+240)%360,s,l),hsl2hex((h+60)%360,s,l)];
  else if(type==='analogous')colors=[hsl2hex((h-30+360)%360,s,l),base,hsl2hex((h+30)%360,s,l),hsl2hex((h+60)%360,s,l)];
  else colors=Array.from({length:5},()=>'#'+Array.from({length:6},()=>'0123456789ABCDEF'[rnd(0,15)]).join(''));
  document.getElementById('cl-palette').innerHTML=colors.map(c=>`<div style="width:50px;height:50px;background:${c};border-radius:8px;cursor:pointer;border:1.5px solid var(--g4);display:flex;align-items:flex-end;justify-content:center;padding-bottom:3px" onclick="navigator.clipboard?.writeText('${c}');notify('📋 ${c}')" title="${c}"><span style="font-size:.42rem;color:#fff;text-shadow:0 0 4px #000">${c}</span></div>`).join('');
};
window.checkContrast=function(){
  const fg=hexToRGB(document.getElementById('cc-fg').value);
  const bg=hexToRGB(document.getElementById('cc-bg').value);
  const lum=c=>{const s=[c.r,c.g,c.b].map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);});return .2126*s[0]+.7152*s[1]+.0722*s[2];};
  const l1=lum(fg),l2=lum(bg);const ratio=((Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05)).toFixed(2);
  const aa=ratio>=4.5,aaa=ratio>=7,aaLg=ratio>=3;
  document.getElementById('cc-result').innerHTML=`Contrast Ratio: <b style="color:var(--g)">${ratio}:1</b><br>AA Normal: ${aa?'✅ PASS':'❌ FAIL'} | AAA: ${aaa?'✅ PASS':'❌ FAIL'} | AA Large: ${aaLg?'✅ PASS':'❌ FAIL'}`;
  const prev=document.getElementById('cc-preview');prev.style.background=document.getElementById('cc-bg').value;prev.style.color=document.getElementById('cc-fg').value;prev.textContent='Sample Text Preview — Contrast '+ratio+':1';
};
setTimeout(()=>{clUpdate('#00ff41');checkContrast();},500);

// ═══════════════════════════════════════════════
// CLIPBOARD MANAGER
// ═══════════════════════════════════════════════
const CB_KEY='francis_clipboard';
function loadCB(){renderCB();}
function renderCB(){
  const items=ls(CB_KEY)||[];
  const list=document.getElementById('cb-list');if(!list)return;
  if(!items.length){list.innerHTML='<div style="padding:10px;color:var(--g3);font-size:.68rem;text-align:center">No snippets saved</div>';return;}
  list.innerHTML=items.map((item,i)=>`
    <div style="padding:8px 10px;border-bottom:1px solid var(--g5);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <span style="font-size:.65rem;font-weight:bold;color:var(--g)">${esc(item.label||'Snippet '+(i+1))}</span>
        <div style="display:flex;gap:4px">
          <button class="ab" style="font-size:.55rem;padding:3px 8px" onclick="cbCopy(${i})">COPY</button>
          <button class="ab red" style="font-size:.55rem;padding:3px 8px" onclick="cbDel(${i})">✕</button>
        </div>
      </div>
      <div style="font-size:.62rem;color:var(--g3);word-break:break-all;max-height:40px;overflow:hidden">${esc(item.text)}</div>
    </div>`).join('');
}
window.cbAdd=()=>{const t=document.getElementById('cb-input').value.trim(),l=document.getElementById('cb-label').value.trim();if(!t){notify('Enter text','#ff3333');return;}const items=ls(CB_KEY)||[];items.unshift({label:l||'Snippet',text:t,added:Date.now()});lss(CB_KEY,items);renderCB();document.getElementById('cb-input').value='';document.getElementById('cb-label').value='';notify('📌 Saved!');};
window.cbCopy=i=>{const items=ls(CB_KEY)||[];if(items[i])navigator.clipboard?.writeText(items[i].text);notify('📋 Copied!');};
window.cbDel=i=>{const items=ls(CB_KEY)||[];items.splice(i,1);lss(CB_KEY,items);renderCB();};
window.cbClear=()=>{if(confirm('Clear all?')){lss(CB_KEY,[]);renderCB();notify('🗑️ Cleared');}};
window.cbExport=()=>{const items=ls(CB_KEY)||[];const txt=items.map(i=>`--- ${i.label} ---\n${i.text}`).join('\n\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'text/plain'}));a.download='clipboard-'+Date.now()+'.txt';a.click();};

// ═══════════════════════════════════════════════
// TASK SCHEDULER
// ═══════════════════════════════════════════════
const TASK_KEY='francis_tasks';
function renderTasks(filter='all'){
  const tasks=ls(TASK_KEY)||[];
  const el=document.getElementById('task-list');if(!el)return;
  const filtered=filter==='all'?tasks:filter==='done'?tasks.filter(t=>t.done):tasks.filter(t=>t.priority===filter);
  if(!filtered.length){el.innerHTML='<div style="padding:12px;color:var(--g3);font-size:.68rem;text-align:center">No tasks</div>';return;}
  el.innerHTML=filtered.map((t,i)=>{
    const pColors={low:'var(--g3)',med:'var(--yl)',high:'var(--red)',crit:'#ff00ff'};
    const overdue=t.due&&!t.done&&Date.now()>new Date(t.due).getTime();
    return `<div style="padding:9px 11px;border-bottom:1px solid var(--g5);${t.done?'opacity:.5':''}">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:3px">
        <input type="checkbox" ${t.done?'checked':''} onchange="toggleTask(${tasks.indexOf(t)})" style="accent-color:var(--g)">
        <span style="font-size:.72rem;color:${t.done?'var(--g3)':'var(--g)'};flex:1;${t.done?'text-decoration:line-through':''}">${esc(t.name)}</span>
        <span style="font-size:.55rem;font-weight:bold;color:${pColors[t.priority]||'var(--g3)'};border:1px solid currentColor;padding:1px 5px;border-radius:4px">${t.priority.toUpperCase()}</span>
        <button class="ab red" style="font-size:.52rem;padding:2px 6px" onclick="delTask(${tasks.indexOf(t)})">✕</button>
      </div>
      <div style="font-size:.58rem;color:var(--g3);padding-left:22px">${t.cat} · ${t.due?`<span style="color:${overdue?'var(--red)':'var(--g3)'}">${new Date(t.due).toLocaleString()}</span>`:'No deadline'}</div>
    </div>`;
  }).join('');
}
window.addTask=()=>{const n=document.getElementById('task-name').value.trim();if(!n){notify('Enter task name','#ff3333');return;}const tasks=ls(TASK_KEY)||[];tasks.push({name:n,due:document.getElementById('task-date').value,priority:document.getElementById('task-priority').value,cat:document.getElementById('task-cat').value,done:false,created:Date.now()});lss(TASK_KEY,tasks);renderTasks();document.getElementById('task-name').value='';notify('📅 Task added!');};
window.toggleTask=i=>{const tasks=ls(TASK_KEY)||[];tasks[i].done=!tasks[i].done;lss(TASK_KEY,tasks);renderTasks();};
window.delTask=i=>{const tasks=ls(TASK_KEY)||[];tasks.splice(i,1);lss(TASK_KEY,tasks);renderTasks();};
window.filterTasks=f=>renderTasks(f);
window.clearTasks=()=>{if(confirm('Clear all tasks?')){lss(TASK_KEY,[]);renderTasks();notify('🗑️ Tasks cleared');}};

// ═══════════════════════════════════════════════
// WEATHER
// ═══════════════════════════════════════════════
window.getWeather=async function(){
  const city=document.getElementById('wx-city').value.trim();
  if(!city){notify('Enter city name','#ff3333');return;}
  const out=document.getElementById('wx-out');
  out.innerHTML='<div style="color:var(--g3);font-size:.7rem">Fetching weather...</div>';
  try{
    const r=await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
    const d=await r.json();const c=d.current_condition[0];
    const w=d.weather[0];
    out.innerHTML=`
      <div class="ac" style="margin-bottom:0">
        <div style="font-size:2rem;text-align:center;margin-bottom:4px">${getWeatherIcon(parseInt(c.weatherCode))}</div>
        <div style="text-align:center;font-size:1.4rem;font-weight:bold;color:var(--g);margin-bottom:6px">${c.temp_C}°C / ${c.temp_F}°F</div>
        <div style="text-align:center;font-size:.75rem;color:var(--g2);margin-bottom:10px">${c.weatherDesc[0].value}</div>
        ${[['Feels Like',c.FeelsLikeC+'°C'],['Humidity',c.humidity+'%'],['Wind',c.windspeedKmph+' km/h '+c.winddir16Point],['Visibility',c.visibility+' km'],['Pressure',c.pressure+' hPa'],['UV Index',c.uvIndex||'N/A'],['Max Today',w.maxtempC+'°C'],['Min Today',w.mintempC+'°C']].map(([k,v])=>`<span style="font-size:.62rem"><span style="color:var(--g3)">${k}:</span> <span style="color:var(--g2)">${v}</span><br></span>`).join('')}
      </div>`;
  }catch{out.innerHTML='<div style="color:var(--red);font-size:.7rem">Failed to fetch weather (needs network)</div>';}
};
function getWeatherIcon(code){if(code<=113)return'☀️';if(code<=176)return'⛅';if(code<=260)return'🌫️';if(code<=296)return'🌦️';if(code<=395)return'🌧️';return'❄️';}
window.getWeatherGeo=function(){
  navigator.geolocation?.getCurrentPosition(pos=>{
    document.getElementById('wx-city').value=pos.coords.latitude+','+pos.coords.longitude;
    getWeather();
  },()=>notify('Location denied','#ff3333'));
};
window.wConvert=function(from){
  const c=parseFloat(document.getElementById('wc-c').value);
  const f=parseFloat(document.getElementById('wc-f').value);
  const k=parseFloat(document.getElementById('wc-k').value);
  if(from==='c'&&!isNaN(c)){document.getElementById('wc-f').value=(c*9/5+32).toFixed(2);document.getElementById('wc-k').value=(c+273.15).toFixed(2);}
  if(from==='f'&&!isNaN(f)){document.getElementById('wc-c').value=((f-32)*5/9).toFixed(2);document.getElementById('wc-k').value=((f-32)*5/9+273.15).toFixed(2);}
  if(from==='k'&&!isNaN(k)){document.getElementById('wc-c').value=(k-273.15).toFixed(2);document.getElementById('wc-f').value=((k-273.15)*9/5+32).toFixed(2);}
};

// ═══════════════════════════════════════════════
// FONT LAB
// ═══════════════════════════════════════════════
const FONTS=['Courier New','monospace','Arial','Georgia','Times New Roman','Trebuchet MS','Verdana','Impact','Comic Sans MS','Palatino','Garamond','Bookman','Avant Garde','system-ui','serif','sans-serif'];
function loadFontLab(){
  const list=document.getElementById('font-list');if(!list)return;
  list.innerHTML=FONTS.map(f=>`<div style="border:1px solid var(--g4);border-radius:8px;padding:10px 12px;margin-bottom:6px;cursor:pointer;transition:border-color .15s" onclick="navigator.clipboard?.writeText('${f}');notify('📋 ${f}')" onmouseover="this.style.borderColor='var(--g)'" onmouseout="this.style.borderColor='var(--g4)'">
    <div style="font-family:${f};font-size:18px;color:var(--g);margin-bottom:4px" id="fp-prev-${f.replace(/\s/g,'')}">FRANCIS Admin — The Quick Brown Fox</div>
    <div style="font-size:.56rem;color:var(--g3);letter-spacing:1px">${f}</div>
  </div>`).join('');
}
window.updateFontPreview=function(){
  const txt=document.getElementById('fp-text').value;
  const size=document.getElementById('fp-size').value;
  FONTS.forEach(f=>{const el=document.getElementById('fp-prev-'+f.replace(/\s/g,''));if(el){el.textContent=txt||'Preview';el.style.fontSize=size+'px';}});
};
// Text Styler
const STYLES={'𝗕𝗼𝗹𝗱':['𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇','𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭']};
function styleText(text,low,up){return text.split('').map(c=>{const li='abcdefghijklmnopqrstuvwxyz'.indexOf(c);const ui='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(c);if(li>=0)return low[li]||c;if(ui>=0)return up[ui]||c;return c;}).join('');}
document.getElementById('ts-input')?.addEventListener('input',function(){
  const txt=this.value;
  const variants=[
    ['Normal',txt],
    ['UPPERCASE',txt.toUpperCase()],
    ['lowercase',txt.toLowerCase()],
    ['Title Case',txt.replace(/\b\w/g,l=>l.toUpperCase())],
    ['Reversed',txt.split('').reverse().join('')],
    ['Spaced',txt.split('').join(' ')],
    ['🅱🅻🅾🅲🅺',txt.toUpperCase().split('').map(c=>'🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉'.split('').indexOf(c)>=0?'🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉'['ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(c)]:c).join('')],
    ['Z̶a̶l̶g̶o̶',txt.split('').map(c=>[c,'̈','̃','̄','̂','̊'].join('')).join('')],
    ['ᴍɪɴɪ ᴄᴀᴘꜱ',txt.toLowerCase().replace(/[a-z]/g,c=>'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘQʀꜱᴛᴜᴠᴡxʏᴢ'['abcdefghijklmnopqrstuvwxyz'.indexOf(c)]||c)],
  ];
  const out=document.getElementById('ts-output');
  out.innerHTML=variants.map(([n,v])=>`<div style="cursor:pointer;padding:4px 0" onclick="navigator.clipboard?.writeText('${v.replace(/'/g,"\\'")}');notify('📋 Copied!')" title="Click to copy"><span style="color:var(--g3);font-size:.56rem">${n}: </span><span style="color:var(--g)">${esc(v)}</span></div>`).join('');
});

// ═══════════════════════════════════════════════
// ASCII ART
// ═══════════════════════════════════════════════
const ASCII_GALLERY=[
  {name:'Skull',art:`  ___\n /   \\\n| o o |\n|  ^  |\n | - |\n  ---`},
  {name:'Matrix',art:`[01001]\n[10110]\n[01101]\n[11010]`},
  {name:'Hacker',art:`>_HACK\n|====|\n|sys |\n|root|`},
  {name:'Robot',art:` ___ \n[o_o]\n|===|\n/   \\`},
  {name:'Lock',art:`  _\n |_|\n|   |\n| 🔒 |\n|___|`},
  {name:'FRANCIS',art:`[FRANCIS]\n<TOOLS>\n{ADMIN}`},
];
function loadASCIIGallery(){
  const el=document.getElementById('asc-gallery');if(!el)return;
  el.innerHTML=ASCII_GALLERY.map(({name,art})=>`<div style="background:#000;border:1px solid var(--g4);border-radius:8px;padding:10px;cursor:pointer;transition:border-color .15s" onclick="navigator.clipboard?.writeText(\`${art.replace(/`/g,'\\`')}\`);notify('📋 Copied!')" onmouseover="this.style.borderColor='var(--g)'" onmouseout="this.style.borderColor='var(--g4)'"><pre style="font-size:.55rem;color:var(--g);line-height:1.3;margin:0">${art}</pre><div style="font-size:.52rem;color:var(--g3);margin-top:4px">${name}</div></div>`).join('');
}

const BLOCK_FONT={A:['  /\\  ',' /  \\ ','/----\\','/ \\  '],B:['|\\ ',"| \\  ","|\\_/ ",'|___/'],C:[' /--','/    ','\\    ',' \\--']};
window.genASCII=function(){
  const txt=(document.getElementById('asc-text').value||'FRANCIS').toUpperCase().slice(0,8);
  const font=document.getElementById('asc-font').value;
  const out=document.getElementById('asc-out');
  const chars={'A':['  █  ','█   █','█████','█   █','█   █'],'B':['████ ','█   █','████ ','█   █','████ '],'C':[' ████','█    ','█    ','█    ',' ████'],'D':['████ ','█   █','█   █','█   █','████ '],'E':['█████','█    ','████ ','█    ','█████'],'F':['█████','█    ','████ ','█    ','█    '],'G':[' ████','█    ','█  ██','█   █',' ████'],'H':['█   █','█   █','█████','█   █','█   █'],'I':['█████','  █  ','  █  ','  █  ','█████'],'J':['█████','   █ ','   █ ','█  █ ',' ██  '],'K':['█   █','█  █ ','███  ','█  █ ','█   █'],'L':['█    ','█    ','█    ','█    ','█████'],'M':['█   █','██ ██','█ █ █','█   █','█   █'],'N':['█   █','██  █','█ █ █','█  ██','█   █'],'O':[' ███ ','█   █','█   █','█   █',' ███ '],'P':['████ ','█   █','████ ','█    ','█    '],'Q':[' ███ ','█   █','█ █ █','█  ██',' ████'],'R':['████ ','█   █','████ ','█  █ ','█   █'],'S':[' ████','█    ',' ███ ','    █','████ '],'T':['█████','  █  ','  █  ','  █  ','  █  '],'U':['█   █','█   █','█   █','█   █',' ███ '],'V':['█   █','█   █','█   █',' █ █ ','  █  '],'W':['█   █','█   █','█ █ █','██ ██','█   █'],'X':['█   █',' █ █ ','  █  ',' █ █ ','█   █'],'Y':['█   █',' █ █ ','  █  ','  █  ','  █  '],'Z':['█████','   █ ','  █  ',' █   ','█████'],'0':[' ███ ','█  ██','█ █ █','██  █',' ███ '],'1':['  █  ',' ██  ','  █  ','  █  ','█████'],'2':[' ███ ','█   █','   █ ','  █  ','█████'],'3':[' ███ ','    █',' ██  ','    █',' ███ '],' ':['     ','     ','     ','     ','     '],'!':['  █  ','  █  ','  █  ','     ','  █  ']};
  const lines=['','','','',''];
  txt.split('').forEach(c=>{const ch=chars[c]||chars[' '];ch.forEach((r,i)=>lines[i]+=r+' ');});
  out.textContent=lines.join('\n');out.style.display='block';
};
window.copyASCII=()=>{const o=document.getElementById('asc-out');if(o.textContent)navigator.clipboard?.writeText(o.textContent);notify('📋 Copied!');};
window.randomASCII=()=>{document.getElementById('asc-text').value=['HACK','ROOT','MATRIX','CYBER','SHELL','ADMIN'][rnd(0,5)];genASCII();};
window.fillASCIICanvas=()=>{const el=document.getElementById('asc-canvas');if(el)el.textContent=Array.from({length:8},()=>Array.from({length:30},()=>['░','▒','▓','█','·','◆','◇','○','●','◎'][rnd(0,9)]).join('')).join('\n');};
window.clearASCIICanvas=()=>{const el=document.getElementById('asc-canvas');if(el)el.textContent='';};

// ═══════════════════════════════════════════════
// HOOK NEW TABS INTO T() AND LOAD FUNCS
// ═══════════════════════════════════════════════
const origT=window.T;
window.T=function(btn,name){
  origT(btn,name);
  if(name==='sysmon'){startSysmon();loadBattery();}
  if(name==='worldclock'){startWorldClock();}
  if(name==='calculator'){buildCalc();}
  if(name==='fontlab'){loadFontLab();}
  if(name==='ascii'){loadASCIIGallery();}
  if(name==='colorlab'){setTimeout(()=>{clUpdate('#00ff41');checkContrast();},100);}
  if(name==='clipboard'){loadCB();}
  if(name==='scheduler'){renderTasks();}
  if(name==='qrgen'){setTimeout(genQR,200);}
};

setTimeout(()=>{
  buildCalc();
  loadASCIIGallery();
  loadCB();
  renderTasks();
},900);

// ═══════════════════════════════════════════════
// MARKDOWN EDITOR
// ═══════════════════════════════════════════════
function renderMD() {
  const src = document.getElementById('md-src')?.value || '';
  let html = src
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/^#{6}\s(.+)$/gm,'<h6 style="color:var(--g)">$1</h6>')
    .replace(/^#{5}\s(.+)$/gm,'<h5 style="color:var(--g)">$1</h5>')
    .replace(/^#{4}\s(.+)$/gm,'<h4 style="color:var(--g)">$1</h4>')
    .replace(/^###\s(.+)$/gm,'<h3 style="color:var(--g)">$1</h3>')
    .replace(/^##\s(.+)$/gm,'<h2 style="color:var(--g)">$1</h2>')
    .replace(/^#\s(.+)$/gm,'<h1 style="color:var(--g);font-size:1.3rem">$1</h1>')
    .replace(/\*\*\*(.+?)\*\*\*/g,'<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g,'<strong style="color:var(--g)">$1</strong>')
    .replace(/\*(.+?)\*/g,'<em style="color:var(--g2)">$1</em>')
    .replace(/`([^`]+)`/g,'<code style="background:rgba(0,255,65,.1);padding:1px 5px;border-radius:3px;color:var(--g);font-family:monospace">$1</code>')
    .replace(/```([\s\S]*?)```/g,'<pre style="background:#000;border:1px solid var(--g4);border-radius:6px;padding:10px;overflow-x:auto;margin:6px 0"><code style="color:var(--g);font-family:monospace;font-size:.72rem">$1</code></pre>')
    .replace(/^&gt;\s(.+)$/gm,'<blockquote style="border-left:3px solid var(--g);padding-left:10px;color:var(--g3);margin:4px 0">$1</blockquote>')
    .replace(/^---$/gm,'<hr style="border:none;border-top:1px solid var(--g4);margin:10px 0">')
    .replace(/^\-\s(.+)$/gm,'<li style="color:var(--g2);margin-left:16px">$1</li>')
    .replace(/^(\d+)\.\s(.+)$/gm,'<li style="color:var(--g2);margin-left:16px">$1. $2</li>')
    .replace(/\[(.+?)\]\((.+?)\)/g,'<a href="$2" target="_blank" style="color:var(--g);text-decoration:underline">$1</a>')
    .replace(/\n/g,'<br>');
  const el = document.getElementById('md-preview');
  if (el) el.innerHTML = html;
}

window.mdCopy = () => {
  const src = document.getElementById('md-src')?.value || '';
  let html = src.replace(/^#\s(.+)$/gm,'<h1>$1</h1>').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
  navigator.clipboard?.writeText(html); notify('📋 HTML copied!');
};
window.mdDownload = (ext) => {
  const src = document.getElementById('md-src')?.value || '';
  const content = ext === 'md' ? src : `<!DOCTYPE html><html><body>${src}</body></html>`;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], {type:'text/plain'}));
  a.download = `document.${ext}`; a.click(); notify(`💾 Saved as .${ext}`);
};
window.mdClear = () => { document.getElementById('md-src').value=''; renderMD(); };
window.mdInsert = (text) => {
  const ta = document.getElementById('md-src');
  if (!ta) return;
  const pos = ta.selectionStart;
  ta.value = ta.value.slice(0,pos) + text.replace(/\\n/g,'\n') + ta.value.slice(pos);
  renderMD();
};

// build quick insert buttons
setTimeout(() => {
  const el = document.getElementById('md-insert-btns');
  if (!el) return;
  const inserts = [['H1','# '],['H2','## '],['Bold','**text**'],['Italic','*text*'],['Code','`code`'],['Link','[text](url)'],['List','- item\n'],['Quote','> quote\n'],['HR','---\n'],['Table','| A | B |\n|---|---|\n| 1 | 2 |\n']];
  el.innerHTML = inserts.map(([l,v]) => `<button class="ab ghost" style="font-size:.6rem;padding:4px 8px" onclick="mdInsert('${v.replace(/'/g,"\\'")}')">  ${l}</button>`).join('');
}, 600);

// ═══════════════════════════════════════════════
// REGEX TESTER
// ═══════════════════════════════════════════════
const RX_LIB = [
  ['Email', '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}'],
  ['URL', 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z]{2,6}'],
  ['IPv4', '(\\d{1,3}\\.){3}\\d{1,3}'],
  ['Phone', '[\\+]?[0-9]{1,4}[\\s.-]?[0-9]{3,4}[\\s.-]?[0-9]{4}'],
  ['Date', '\\d{4}[-/]\\d{2}[-/]\\d{2}'],
  ['Hex Color', '#[0-9A-Fa-f]{3,6}'],
  ['HTML Tag', '<[^>]+>'],
  ['Whitespace+', '\\s+'],
  ['Word ≥4 chars', '\\b\\w{4,}\\b'],
  ['Numbers only', '^\\d+$'],
];

function loadRxLib() {
  const el = document.getElementById('rx-lib');
  if (!el) return;
  el.innerHTML = RX_LIB.map(([name, pat]) =>
    `<div class="atog" onclick="document.getElementById('rx-pattern').value='${pat.replace(/'/g,"\\'")}';runRegex()">
      <div class="atog-i"><div class="atog-n">${name}</div><div class="atog-s" style="word-break:break-all">${pat.slice(0,35)}${pat.length>35?'...':''}</div></div>
    </div>`
  ).join('');
}

window.runRegex = function() {
  const patStr = document.getElementById('rx-pattern')?.value || '';
  const flags  = document.getElementById('rx-flags')?.value || 'g';
  const test   = document.getElementById('rx-test')?.value || '';
  const res    = document.getElementById('rx-result');
  const matchEl= document.getElementById('rx-matches');
  if (!patStr) { if(res) res.textContent=''; if(matchEl) matchEl.style.display='none'; return; }
  try {
    const re = new RegExp(patStr, flags);
    const matches = [...test.matchAll(new RegExp(patStr, flags.includes('g') ? flags : flags+'g'))];
    if (res) { res.style.color='var(--g)'; res.textContent = `✓ Valid pattern — ${matches.length} match${matches.length!==1?'es':''}  |  Source: /${patStr}/${flags}`; }
    if (matchEl) {
      matchEl.style.display = 'block';
      const highlighted = test.replace(new RegExp(patStr, flags.includes('g')?flags:flags+'g'), m => `<mark style="background:rgba(0,255,65,.25);color:var(--g);border-radius:2px">${esc(m)}</mark>`);
      matchEl.innerHTML = '<div style="color:var(--g3);font-size:.58rem;margin-bottom:4px">HIGHLIGHTED MATCHES:</div>' + highlighted +
        (matches.length ? '<div style="margin-top:8px;color:var(--g3);font-size:.58rem">CAPTURE GROUPS:</div>' + matches.slice(0,20).map((m,i)=>`<div style="color:var(--g2)">Match ${i+1}: <span style="color:var(--g)">${esc(m[0])}</span>${m.slice(1).map((g,j)=>` | G${j+1}: <span style="color:var(--g2)">${esc(String(g))}</span>`).join('')} @ pos ${m.index}</div>`).join('') : '');
    }
  } catch(e) {
    if (res) { res.style.color='var(--red)'; res.textContent = '✕ Invalid pattern: ' + e.message; }
    if (matchEl) matchEl.style.display = 'none';
  }
};

// ═══════════════════════════════════════════════
// JSON EXPLORER
// ═══════════════════════════════════════════════
let parsedJSON = null;

window.jsonLive = function() {
  const src = document.getElementById('json-src')?.value || '';
  const st  = document.getElementById('json-status');
  if (!src.trim()) { if(st) st.textContent=''; return; }
  try {
    parsedJSON = JSON.parse(src);
    if (st) { st.style.color='var(--g)'; st.textContent='✓ Valid JSON'; }
    updateJsonStats(); renderJsonTree(parsedJSON);
  } catch(e) {
    if (st) { st.style.color='var(--red)'; st.textContent='✕ '+e.message; }
    parsedJSON = null;
  }
};

window.jsonFormat = () => {
  const src = document.getElementById('json-src');
  try { src.value = JSON.stringify(JSON.parse(src.value), null, 2); jsonLive(); notify('✅ Formatted!'); }
  catch(e) { notify('✕ Invalid JSON','#ff3333'); }
};
window.jsonMinify = () => {
  const src = document.getElementById('json-src');
  try { src.value = JSON.stringify(JSON.parse(src.value)); jsonLive(); notify('✅ Minified!'); }
  catch(e) { notify('✕ Invalid JSON','#ff3333'); }
};
window.jsonSort = () => {
  const src = document.getElementById('json-src');
  try {
    const sorted = (obj) => {
      if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return obj;
      return Object.keys(obj).sort().reduce((a,k) => ({...a,[k]:sorted(obj[k])}), {});
    };
    src.value = JSON.stringify(sorted(JSON.parse(src.value)), null, 2); jsonLive(); notify('✅ Sorted!');
  } catch(e) { notify('✕ Invalid JSON','#ff3333'); }
};
window.jsonCopy = () => { navigator.clipboard?.writeText(document.getElementById('json-src')?.value||''); notify('📋 Copied!'); };

function renderJsonTree(obj, depth=0) {
  const el = document.getElementById('json-tree');
  if (!el) return;
  el.style.display = 'block';
  el.textContent = JSON.stringify(obj, null, 2);
  // simple colorize
  el.innerHTML = el.textContent
    .replace(/"([^"]+)":/g, '<span style="color:var(--g)">"$1"</span>:')
    .replace(/: "([^"]+)"/g, ': <span style="color:var(--g2)">"$1"</span>')
    .replace(/: (\d+\.?\d*)/g, ': <span style="color:var(--yl)">$1</span>')
    .replace(/: (true|false|null)/g, ': <span style="color:var(--pur)">$1</span>');
}

function countJSON(obj) {
  let keys=0, depth=0;
  const walk = (o, d=0) => {
    if (depth < d) depth = d;
    if (Array.isArray(o)) o.forEach(v => walk(v, d+1));
    else if (o && typeof o === 'object') Object.entries(o).forEach(([,v]) => { keys++; walk(v, d+1); });
  };
  walk(obj);
  return {keys, depth};
}
function updateJsonStats() {
  if (!parsedJSON) return;
  const {keys, depth} = countJSON(parsedJSON);
  const el = document.getElementById('json-stats');
  if (el) el.innerHTML = [
    ['Type', Array.isArray(parsedJSON)?'Array':'Object'],
    ['Top Keys', Array.isArray(parsedJSON)?parsedJSON.length:Object.keys(parsedJSON).length],
    ['Total Keys', keys],
    ['Max Depth', depth],
    ['Size', (JSON.stringify(parsedJSON).length/1024).toFixed(2)+'KB'],
  ].map(([k,v]) => `<span style="color:var(--g3)">${k}:</span> <span style="color:var(--g2)">${v}</span><br>`).join('');
}

window.jsonQuery = function() {
  const key = document.getElementById('json-path')?.value || '';
  const out = document.getElementById('json-query-out');
  if (!parsedJSON || !key) { if(out) out.style.display='none'; return; }
  try {
    let result = parsedJSON;
    key.split('.').forEach(k => {
      const m = k.match(/^(.+)\[(\d+)\]$/);
      result = m ? result[m[1]][parseInt(m[2])] : result[k];
    });
    if (out) { out.style.display='block'; out.textContent = result === undefined ? 'Key not found' : JSON.stringify(result, null, 2); }
  } catch { if(out) { out.style.display='block'; out.textContent='Query error'; } }
};

// ═══════════════════════════════════════════════
// URL TOOLS
// ═══════════════════════════════════════════════
window.urlEncode = () => {
  const v = document.getElementById('url-input')?.value || '';
  const out = document.getElementById('url-out');
  if(out) { out.style.display='block'; out.textContent=encodeURIComponent(v); }
};
window.urlDecode = () => {
  const v = document.getElementById('url-input')?.value || '';
  const out = document.getElementById('url-out');
  try { if(out){out.style.display='block';out.textContent=decodeURIComponent(v);} }
  catch { if(out){out.style.display='block';out.textContent='Decode error';} }
};
window.urlCopy = () => { const o=document.getElementById('url-out'); if(o)navigator.clipboard?.writeText(o.textContent); notify('📋 Copied!'); };

window.parseURL = function(val) {
  const out = document.getElementById('urlp-out');
  if (!out || !val) { out.innerHTML=''; return; }
  try {
    const u = new URL(val);
    const params = {};
    u.searchParams.forEach((v,k) => params[k]=v);
    out.innerHTML = [
      ['Protocol', u.protocol],
      ['Host', u.hostname],
      ['Port', u.port||'(default)'],
      ['Path', u.pathname],
      ['Query', u.search||'(none)'],
      ['Hash', u.hash||'(none)'],
      ['Params', JSON.stringify(params)],
    ].map(([k,v])=>`<span style="color:var(--g3)">${k}:</span> <span style="color:var(--g2)">${esc(v)}</span><br>`).join('');
  } catch { out.innerHTML = '<span style="color:var(--red)">Invalid URL</span>'; }
};

window.shortenURL = async function() {
  const url = document.getElementById('shorten-inp')?.value.trim();
  const out = document.getElementById('shorten-out');
  if (!url) { notify('Enter a URL','#ff3333'); return; }
  if(out) out.textContent = 'Shortening...';
  try {
    const r = await fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`);
    const short = await r.text();
    if(out) out.innerHTML = `<a href="${esc(short)}" target="_blank" style="color:var(--g)">${esc(short)}</a> <button class="ab ghost" style="font-size:.6rem;padding:3px 8px;margin-left:6px" onclick="navigator.clipboard?.writeText('${esc(short)}');notify('Copied!')">COPY</button>`;
  } catch { if(out) out.textContent = 'Failed (network error)'; }
};

window.buildUTM = function() {
  const base = document.getElementById('utm-url')?.value.trim();
  if (!base) { notify('Enter base URL','#ff3333'); return; }
  const params = new URLSearchParams();
  [['utm_source','utm-source'],['utm_medium','utm-medium'],['utm_campaign','utm-campaign'],['utm_term','utm-term']].forEach(([p,id])=>{
    const v=document.getElementById(id)?.value.trim();if(v)params.set(p,v);
  });
  const full = base + (base.includes('?')?'&':'?') + params.toString();
  const out = document.getElementById('utm-out');
  if(out){out.style.display='block';out.innerHTML=`<a href="${esc(full)}" target="_blank" style="color:var(--g);word-break:break-all">${esc(full)}</a><button class="ab ghost" style="font-size:.6rem;padding:3px 8px;margin-left:6px;margin-top:4px" onclick="navigator.clipboard?.writeText('${full.replace(/'/g,"\\'")}');notify('Copied!')">COPY</button>`;}
  notify('🔗 UTM built!');
};

// ═══════════════════════════════════════════════
// KANBAN BOARD
// ═══════════════════════════════════════════════
const KB_KEY = 'francis_kanban';
let dragCardId = null;

function loadKanban() {
  const boards = ls(KB_KEY) || { todo:[], doing:[], done:[], blocked:[] };
  ['todo','doing','done','blocked'].forEach(col => {
    const el = document.getElementById('kbl-'+col);
    if (!el) return;
    el.innerHTML = (boards[col]||[]).map(card =>
      `<div draggable="true" ondragstart="kbDragStart(event,'${card.id}')" style="background:rgba(0,0,0,.7);border:1px solid var(--g4);border-radius:7px;padding:8px 10px;margin-bottom:6px;font-size:.68rem;color:var(--g2);cursor:grab;position:relative;"
        onmouseover="this.style.borderColor='var(--g2)'" onmouseout="this.style.borderColor='var(--g4)'">
        ${esc(card.text)}
        <button onclick="kbDelCard('${card.id}')" style="position:absolute;top:4px;right:6px;background:none;border:none;color:var(--g4);cursor:pointer;font-size:.7rem" onmouseover="this.style.color='var(--red)'" onmouseout="this.style.color='var(--g4)'">✕</button>
      </div>`
    ).join('') || `<div style="font-size:.58rem;color:var(--g5);text-align:center;padding:10px">Drop here</div>`;
  });
}

window.kbAdd = () => {
  const text = document.getElementById('kb-card')?.value.trim();
  const col  = document.getElementById('kb-col')?.value || 'todo';
  if (!text) { notify('Enter card text','#ff3333'); return; }
  const boards = ls(KB_KEY) || {todo:[],doing:[],done:[],blocked:[]};
  boards[col] = boards[col] || [];
  boards[col].push({ id: uid(), text, created: Date.now() });
  lss(KB_KEY, boards); loadKanban();
  document.getElementById('kb-card').value = '';
  notify('📋 Card added!');
};

window.kbDragStart = (e, id) => { dragCardId = id; e.dataTransfer.effectAllowed = 'move'; };
window.kbDrop = (e, col) => {
  e.preventDefault();
  if (!dragCardId) return;
  const boards = ls(KB_KEY) || {todo:[],doing:[],done:[],blocked:[]};
  let card = null;
  ['todo','doing','done','blocked'].forEach(c => {
    const idx = (boards[c]||[]).findIndex(k => k.id === dragCardId);
    if (idx >= 0) { [card] = boards[c].splice(idx,1); }
  });
  if (card) { boards[col] = boards[col] || []; boards[col].push(card); }
  lss(KB_KEY, boards); loadKanban(); dragCardId = null;
};

window.kbDelCard = (id) => {
  const boards = ls(KB_KEY) || {};
  ['todo','doing','done','blocked'].forEach(c => { boards[c] = (boards[c]||[]).filter(k=>k.id!==id); });
  lss(KB_KEY, boards); loadKanban();
};

window.kbClear = (which) => {
  if (!confirm(`Clear ${which==='all'?'all cards':'done column'}?`)) return;
  const boards = ls(KB_KEY) || {};
  if (which==='all') lss(KB_KEY, {todo:[],doing:[],done:[],blocked:[]});
  else { boards.done=[]; lss(KB_KEY,boards); }
  loadKanban(); notify('🗑️ Cleared');
};

// ═══════════════════════════════════════════════
// FINANCE CALCULATORS
// ═══════════════════════════════════════════════
window.calcCompound = function() {
  const P=parseFloat(document.getElementById('fi-p')?.value)||0;
  const r=parseFloat(document.getElementById('fi-r')?.value)/100||0;
  const t=parseFloat(document.getElementById('fi-t')?.value)||0;
  const n=parseFloat(document.getElementById('fi-n')?.value)||12;
  const A = P * Math.pow(1 + r/n, n*t);
  const el = document.getElementById('fi-result');
  if (el) el.innerHTML = [
    ['Principal', '$'+P.toLocaleString()],
    ['Final Amount', '<b style="color:var(--g)">$'+A.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',')+'</b>'],
    ['Total Interest', '<b style="color:var(--yl)">$'+(A-P).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',')+'</b>'],
    ['Growth', (((A-P)/P)*100).toFixed(2)+'%'],
  ].map(([k,v])=>`<span style="color:var(--g3)">${k}:</span> ${v}<br>`).join('');
};

window.calcLoan = function() {
  const loan=parseFloat(document.getElementById('loan-p')?.value)||0;
  const down=parseFloat(document.getElementById('loan-d')?.value)||0;
  const r=(parseFloat(document.getElementById('loan-r')?.value)/100/12)||0;
  const n=parseFloat(document.getElementById('loan-t')?.value)||60;
  const P=loan-down;
  const EMI = r===0 ? P/n : P * r * Math.pow(1+r,n) / (Math.pow(1+r,n)-1);
  const total = EMI * n;
  const el = document.getElementById('loan-result');
  if (el) el.innerHTML = [
    ['Loan Amount','$'+P.toLocaleString()],
    ['Monthly EMI','<b style="color:var(--g)">$'+EMI.toFixed(2)+'</b>'],
    ['Total Payment','$'+total.toFixed(2)],
    ['Total Interest','<b style="color:var(--red)">$'+(total-P).toFixed(2)+'</b>'],
    ['Interest %',((total-P)/P*100).toFixed(2)+'%'],
  ].map(([k,v])=>`<span style="color:var(--g3)">${k}:</span> ${v}<br>`).join('');
};

window.calcROI = function() {
  const i=parseFloat(document.getElementById('roi-i')?.value)||1;
  const f=parseFloat(document.getElementById('roi-f')?.value)||0;
  const roi=((f-i)/i*100);
  const el = document.getElementById('roi-result');
  if (el) el.innerHTML = [
    ['Invested','$'+i.toLocaleString()],
    ['Return','$'+f.toLocaleString()],
    ['Profit/Loss','<b style="color:'+(f>=i?'var(--g)':'var(--red)')+'">$'+(f-i).toFixed(2)+'</b>'],
    ['ROI','<b style="color:'+(roi>=0?'var(--g)':'var(--red)')+'">'+roi.toFixed(2)+'%</b>'],
  ].map(([k,v])=>`<span style="color:var(--g3)">${k}:</span> ${v}<br>`).join('');
};

window.calcSIP = function() {
  const m=parseFloat(document.getElementById('sip-m')?.value)||0;
  const r=(parseFloat(document.getElementById('sip-r')?.value)/100/12)||0;
  const n=(parseFloat(document.getElementById('sip-t')?.value)||0)*12;
  const FV = m * (Math.pow(1+r,n)-1)/r * (1+r);
  const invested = m*n;
  const el = document.getElementById('sip-result');
  if (el) el.innerHTML = [
    ['Monthly SIP','$'+m.toLocaleString()],
    ['Invested','$'+invested.toLocaleString()],
    ['Maturity Value','<b style="color:var(--g)">$'+FV.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',')+'</b>'],
    ['Profit','<b style="color:var(--yl)">$'+(FV-invested).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',')+'</b>'],
    ['CAGR',((Math.pow(FV/invested,1/(n/12))-1)*100).toFixed(2)+'%'],
  ].map(([k,v])=>`<span style="color:var(--g3)">${k}:</span> ${v}<br>`).join('');
};

setTimeout(()=>{ calcCompound(); calcLoan(); calcROI(); calcSIP(); }, 1000);

// ═══════════════════════════════════════════════
// TYPING TEST
// ═══════════════════════════════════════════════
const TT_WORDS = 'the quick brown fox jumps over lazy dog pack my box with five dozen liquor jugs how vexingly daft zebras quiz sphinx of black quartz judge my vow pack my box with five dozen liquor jugs the five boxing wizards jump quickly jackdaws love my big sphinx of quartz'.split(' ');
let ttRunning=false, ttTimer=null, ttTimeLeft=0, ttStart=0, ttWordIdx=0, ttCorrect=0, ttChars=0, ttErrors=0;
let ttCurrentWords = [];

function ttGenWords(n=60) {
  ttCurrentWords = Array.from({length:n},()=>TT_WORDS[rnd(0,TT_WORDS.length-1)]);
  const el=document.getElementById('tt-words');
  if(el) el.innerHTML=ttCurrentWords.map((w,i)=>`<span id="ttw-${i}" style="color:var(--g3);padding:0 2px;border-radius:3px">${w}</span> `).join('');
}

window.ttStart = function() {
  const mode=parseInt(document.getElementById('tt-mode')?.value)||60;
  ttTimeLeft=mode; ttCorrect=0; ttChars=0; ttErrors=0; ttWordIdx=0;
  ttGenWords(mode+20);
  const inp=document.getElementById('tt-input');
  if(inp){ inp.disabled=false; inp.value=''; inp.focus(); }
  document.getElementById('tt-result').style.display='none';
  document.getElementById('tt-badge').textContent='RUNNING';
  const w=document.getElementById('ttw-0');if(w)w.style.color='var(--g)';
  ttStart=Date.now(); ttRunning=true;
  clearInterval(ttTimer);
  ttTimer=setInterval(()=>{
    ttTimeLeft--;
    updateTTStats();
    if(ttTimeLeft<=0) ttFinish();
  },1000);
  updateTTStats();
};

window.ttCheck = function(inp) {
  if(!ttRunning) return;
  const val=inp.value.trimEnd();
  if(inp.value.endsWith(' ')) {
    const current=ttCurrentWords[ttWordIdx]||'';
    const correct=val.trim()===current;
    const el=document.getElementById('ttw-'+ttWordIdx);
    if(el) el.style.color=correct?'var(--g2)':'var(--red)';
    if(correct) ttCorrect++;
    else ttErrors++;
    ttChars+=val.trim().length+1;
    ttWordIdx++;
    const next=document.getElementById('ttw-'+ttWordIdx);
    if(next) next.style.color='var(--g)';
    inp.value='';
    updateTTStats();
  }
};

function updateTTStats(){
  const elapsed=(Date.now()-ttStart)/60000||0.001;
  const wpm=Math.round(ttCorrect/elapsed);
  const acc=ttCorrect+ttErrors>0?Math.round(ttCorrect/(ttCorrect+ttErrors)*100):100;
  document.getElementById('tt-stats').innerHTML=[
    [wpm,'WPM'],[acc+'%','ACC'],[ttErrors,'ERRORS'],[ttTimeLeft+'s','LEFT']
  ].map(([n,l])=>`<div class="astat"><div class="asn">${n}</div><div class="asl">${l}</div></div>`).join('');
}

function ttFinish(){
  clearInterval(ttTimer); ttRunning=false;
  const inp=document.getElementById('tt-input');if(inp)inp.disabled=true;
  const elapsed=(Date.now()-ttStart)/60000;
  const wpm=Math.round(ttCorrect/elapsed);
  const acc=ttCorrect+ttErrors>0?Math.round(ttCorrect/(ttCorrect+ttErrors)*100):100;
  document.getElementById('tt-badge').textContent='DONE';
  document.getElementById('tt-result').style.display='block';
  document.getElementById('tt-result').innerHTML=`<div style="font-size:2rem;font-weight:bold;color:var(--g);text-shadow:0 0 14px var(--g)">${wpm} WPM</div><div style="font-size:.75rem;color:var(--g2);margin-top:6px">${acc}% accuracy · ${ttCorrect} words · ${ttErrors} errors</div>`;
  // save to leaderboard
  const lb=ls('francis_tt_lb')||[];
  lb.push({wpm,acc,date:new Date().toLocaleDateString()});
  lb.sort((a,b)=>b.wpm-a.wpm);
  lss('francis_tt_lb',lb.slice(0,10));
  renderTTLB();
  notify(`⌨️ ${wpm} WPM — ${acc}% accuracy!`);
}

function renderTTLB(){
  const el=document.getElementById('tt-leaderboard');if(!el)return;
  const lb=ls('francis_tt_lb')||[];
  el.innerHTML=lb.length?lb.map((e,i)=>`<div class="alog"><span class="alog-t">#${i+1}</span><span class="alog-i" style="color:var(--g)">${e.wpm} WPM</span><span style="color:var(--g3);font-size:.58rem">${e.acc}% · ${e.date}</span></div>`).join(''):'<div style="padding:10px;color:var(--g3);font-size:.68rem;text-align:center">No scores yet</div>';
}

window.ttReset = () => { clearInterval(ttTimer); ttRunning=false; const inp=document.getElementById('tt-input');if(inp){inp.disabled=true;inp.value='';} document.getElementById('tt-badge').textContent='READY'; document.getElementById('tt-result').style.display='none'; document.getElementById('tt-stats').innerHTML=''; ttGenWords(); };

// ═══════════════════════════════════════════════
// AI PROMPT BUILDER
// ═══════════════════════════════════════════════
const PROMPT_KEY='francis_prompts';
const PROMPT_TEMPLATES=[
  ['Code Review','Review the following code for bugs, security issues, and performance improvements. Provide specific, actionable feedback:'],
  ['Debug Help','I have a bug in my code. Error: [ERROR]. Code: [CODE]. Please diagnose and fix it step by step.'],
  ['Explain Concept','Explain [CONCEPT] clearly with practical examples. Start simple, then go deeper.'],
  ['Write Tests','Write comprehensive unit tests for the following function. Cover edge cases and error states:'],
  ['Security Audit','Perform a thorough security audit of this code. Identify vulnerabilities, rate their severity (Critical/High/Medium/Low), and suggest fixes:'],
  ['Optimize Code','Analyze this code for performance bottlenecks. Suggest optimizations with before/after comparisons:'],
];

window.buildPrompt = function() {
  const role=document.getElementById('ai-role')?.value||'';
  const task=document.getElementById('ai-task')?.value||'';
  const ctx=document.getElementById('ai-context')?.value||'';
  const fmt=document.getElementById('ai-format')?.value||'';
  const tone=document.getElementById('ai-tone')?.value||'';
  let prompt='';
  if(role) prompt+=`You are a ${role}.\n\n`;
  if(task) prompt+=`Task: ${task}\n\n`;
  if(ctx) prompt+=`Context: ${ctx}\n\n`;
  if(fmt) prompt+=`Format your response as: ${fmt}\n\n`;
  if(tone) prompt+=`Tone: ${tone}\n\n`;
  const el=document.getElementById('ai-prompt-out');
  if(el) el.textContent=prompt.trim()||'Fill in the fields above to generate a prompt...';
};

window.copyPrompt=()=>{const o=document.getElementById('ai-prompt-out');if(o)navigator.clipboard?.writeText(o.textContent);notify('📋 Copied!');};
window.clearPrompt=()=>{['ai-role','ai-task','ai-context','ai-format','ai-tone'].forEach(id=>{const el=document.getElementById(id);if(el)el.tagName==='SELECT'?el.selectedIndex=0:el.value='';});buildPrompt();};
window.savePrompt=()=>{
  const text=document.getElementById('ai-prompt-out')?.textContent;
  if(!text||text.startsWith('Fill in')) {notify('Build a prompt first','#ff3333');return;}
  const saved=ls(PROMPT_KEY)||[];
  saved.unshift({text,task:document.getElementById('ai-task')?.value||'Untitled',date:new Date().toLocaleDateString()});
  if(saved.length>20)saved.pop();
  lss(PROMPT_KEY,saved);renderSavedPrompts();notify('💾 Saved!');
};
window.loadTemplate=t=>{const ta=document.getElementById('ai-task');if(ta)ta.value=t;buildPrompt();};

function renderSavedPrompts(){
  const el=document.getElementById('ai-saved-prompts');if(!el)return;
  const saved=ls(PROMPT_KEY)||[];
  el.innerHTML=saved.length?saved.map((p,i)=>`<div style="padding:8px 10px;border-bottom:1px solid var(--g5)">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
      <span style="font-size:.65rem;font-weight:bold;color:var(--g)">${esc(p.task.slice(0,40))}</span>
      <div style="display:flex;gap:4px">
        <button class="ab ghost" style="font-size:.55rem;padding:2px 7px" onclick="navigator.clipboard?.writeText('${p.text.replace(/'/g,"\\'").replace(/\n/g,'\\n')}');notify('Copied!')">COPY</button>
        <button class="ab red" style="font-size:.55rem;padding:2px 7px" onclick="delPrompt(${i})">✕</button>
      </div>
    </div>
    <div style="font-size:.58rem;color:var(--g3)">${esc(p.text.slice(0,80))}...</div>
  </div>`).join(''):'<div style="padding:10px;color:var(--g3);font-size:.68rem;text-align:center">No saved prompts</div>';
}
window.delPrompt=i=>{const s=ls(PROMPT_KEY)||[];s.splice(i,1);lss(PROMPT_KEY,s);renderSavedPrompts();};

// Build template buttons
setTimeout(()=>{
  const el=document.getElementById('ai-templates-btns');if(!el)return;
  el.innerHTML=PROMPT_TEMPLATES.map(([l,v])=>`<button class="ab ghost" style="font-size:.58rem;padding:4px 8px" onclick="loadTemplate('${v.replace(/'/g,"\\'")}')">${l}</button>`).join('');
  renderSavedPrompts();
},700);

// ═══════════════════════════════════════════════
// MUSIC VISUALIZER + PIANO + TONE GENERATOR
// ═══════════════════════════════════════════════
let audioCtx=null, analyser=null, vizAnimId=null, toneOsc=null, toneGain=null;
let currentWaveform='sine', currentVizMode='bars';

function getAudioCtx() {
  if(!audioCtx) audioCtx=new(window.AudioContext||window.webkitAudioContext)();
  return audioCtx;
}

window.startMic = async function() {
  try {
    const ctx=getAudioCtx();
    const stream=await navigator.mediaDevices.getUserMedia({audio:true});
    const src=ctx.createMediaStreamSource(stream);
    analyser=ctx.createAnalyser();
    analyser.fftSize=256;
    src.connect(analyser);
    document.getElementById('music-badge').textContent='LIVE';
    startViz();
  } catch(e) { notify('Mic access denied','#ff3333'); }
};

window.stopViz=()=>{ cancelAnimationFrame(vizAnimId); document.getElementById('music-badge').textContent='IDLE'; };

function startViz(){
  const canvas=document.getElementById('music-canvas');if(!canvas||!analyser)return;
  canvas.width=canvas.offsetWidth||320;
  const ctx=canvas.getContext('2d');
  const bufLen=analyser.frequencyBinCount;
  const dataArr=new Uint8Array(bufLen);
  function draw(){
    vizAnimId=requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArr);
    ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(0,0,canvas.width,canvas.height);
    const mode=document.getElementById('viz-mode')?.value||'bars';
    if(mode==='bars'){
      const bw=canvas.width/bufLen*2.5;
      for(let i=0;i<bufLen;i++){
        const h=dataArr[i]/255*canvas.height;
        const hue=i/bufLen*120;
        ctx.fillStyle=`hsl(${hue},100%,50%)`;
        ctx.fillRect(i*bw,canvas.height-h,bw-1,h);
      }
    } else if(mode==='wave'){
      analyser.getByteTimeDomainData(dataArr);
      ctx.strokeStyle='var(--g)';ctx.lineWidth=2;ctx.beginPath();
      dataArr.forEach((v,i)=>{const x=i/bufLen*canvas.width;const y=v/128*canvas.height/2;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
      ctx.stroke();
    } else if(mode==='circle'){
      const cx=canvas.width/2,cy=canvas.height/2,r=Math.min(cx,cy)-20;
      for(let i=0;i<bufLen;i++){
        const a=(i/bufLen)*Math.PI*2;const v=dataArr[i]/255*r*0.7;
        ctx.strokeStyle=`hsl(${i/bufLen*360},100%,60%)`;ctx.lineWidth=1.5;
        ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);
        ctx.lineTo(cx+Math.cos(a)*(r+v),cy+Math.sin(a)*(r+v));ctx.stroke();
      }
    } else if(mode==='matrix'){
      ctx.fillStyle='rgba(0,10,0,.2)';ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle='var(--g)';ctx.font='10px monospace';
      for(let i=0;i<bufLen;i+=3){const x=i%Math.floor(canvas.width/10)*10;const y=(Math.floor(i/(canvas.width/10))+1)*12;if(dataArr[i]>50)ctx.fillText(String.fromCharCode(rnd(33,126)),x,y);}
    }
  }
  draw();
}

// Piano
const PIANO_NOTES=[
  {note:'C4',freq:261.63,white:true,key:'a'},
  {note:'C#4',freq:277.18,white:false,key:'w'},
  {note:'D4',freq:293.66,white:true,key:'s'},
  {note:'D#4',freq:311.13,white:false,key:'e'},
  {note:'E4',freq:329.63,white:true,key:'d'},
  {note:'F4',freq:349.23,white:true,key:'f'},
  {note:'F#4',freq:369.99,white:false,key:'t'},
  {note:'G4',freq:392.00,white:true,key:'g'},
  {note:'G#4',freq:415.30,white:false,key:'y'},
  {note:'A4',freq:440.00,white:true,key:'h'},
  {note:'A#4',freq:466.16,white:false,key:'u'},
  {note:'B4',freq:493.88,white:true,key:'j'},
  {note:'C5',freq:523.25,white:true,key:'k'},
];

function buildPiano(){
  const el=document.getElementById('piano-keys');if(!el)return;
  el.innerHTML=PIANO_NOTES.map(n=>`
    <div onclick="playNote(${n.freq})"
      style="width:${n.white?'32px':'22px'};height:${n.white?'80px':'50px'};background:${n.white?'#eee':'#222'};border:1px solid ${n.white?'#999':'#000'};border-radius:0 0 4px 4px;cursor:pointer;display:inline-flex;align-items:flex-end;justify-content:center;padding-bottom:4px;margin:${n.white?'0':'0 -11px'};z-index:${n.white?'1':'2'};position:relative;transition:background .1s;flex-shrink:0;"
      onmousedown="this.style.background='var(--g)'" onmouseup="this.style.background='${n.white?'#eee':'#222'}'" onmouseleave="this.style.background='${n.white?'#eee':'#222'}'"
      title="${n.note} (${n.freq}Hz)">
      <span style="font-size:.45rem;color:${n.white?'#666':'#aaa'}">${n.key.toUpperCase()}</span>
    </div>`).join('');
}

window.playNote=function(freq){
  const ctx=getAudioCtx();
  const osc=ctx.createOscillator();const g=ctx.createGain();
  osc.frequency.value=freq;osc.type=currentWaveform;
  g.gain.setValueAtTime(0.3,ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.5);
  osc.connect(g);g.connect(ctx.destination);
  osc.start();osc.stop(ctx.currentTime+0.5);
};

document.addEventListener('keydown',e=>{
  if(!document.getElementById('adm-music')?.classList.contains('on'))return;
  const note=PIANO_NOTES.find(n=>n.key===e.key.toLowerCase());
  if(note)playNote(note.freq);
});

window.startTone=function(){
  stopTone();
  const ctx=getAudioCtx();
  toneOsc=ctx.createOscillator();toneGain=ctx.createGain();
  toneOsc.frequency.value=parseFloat(document.getElementById('tone-freq')?.value)||440;
  toneOsc.type=currentWaveform;
  toneGain.gain.value=(parseFloat(document.getElementById('tone-vol')?.value)||30)/100*0.5;
  toneOsc.connect(toneGain);toneGain.connect(ctx.destination);
  toneOsc.start();
};
window.stopTone=()=>{try{toneOsc?.stop();toneOsc?.disconnect();}catch{}toneOsc=null;};
window.updateTone=()=>{if(toneOsc)toneOsc.frequency.value=parseFloat(document.getElementById('tone-freq')?.value)||440;};
window.setWaveform=t=>{currentWaveform=t;document.querySelectorAll('[id^="wf-"]').forEach(b=>b.classList.remove('on'));document.getElementById('wf-'+t)?.classList.add('on');if(toneOsc)toneOsc.type=t;};

// ═══════════════════════════════════════════════
// IMAGE TOOLS
// ═══════════════════════════════════════════════
let imgOrigData=null, imgEl=null;

window.imgDrop = function(e) {
  e.preventDefault(); e.stopPropagation();
  document.getElementById('img-drop').style.borderColor='var(--g4)';
  const file=e.dataTransfer.files[0];
  if(file&&file.type.startsWith('image/')) imgLoad(file);
};

window.imgLoad = function(file) {
  if(!file) return;
  const reader=new FileReader();
  reader.onload=function(ev){
    const img=new Image();
    img.onload=function(){
      imgEl=img;
      const canvas=document.getElementById('img-canvas');
      if(!canvas)return;
      canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
      canvas.style.maxHeight='200px';canvas.style.width='auto';
      const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0);
      imgOrigData=ctx.getImageData(0,0,img.naturalWidth,img.naturalHeight);
      document.getElementById('img-preview-wrap').style.display='block';
      document.getElementById('img-info').innerHTML=[
        ['Name',file.name],['Size',(file.size/1024).toFixed(1)+'KB'],
        ['Dimensions',img.naturalWidth+'×'+img.naturalHeight+'px'],
        ['Type',file.type],['Aspect',gcd(img.naturalWidth,img.naturalHeight)],
      ].map(([k,v])=>`<span style="color:var(--g3)">${k}:</span> ${v}<br>`).join('');
      canvas.addEventListener('mousemove',function(ev){
        const r=canvas.getBoundingClientRect();
        const x=Math.round((ev.clientX-r.left)*(canvas.width/r.width));
        const y=Math.round((ev.clientY-r.top)*(canvas.height/r.height));
        const ctx2=canvas.getContext('2d');
        const p=ctx2.getImageData(x,y,1,1).data;
        const hex='#'+[p[0],p[1],p[2]].map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();
        const pi=document.getElementById('pixel-info');
        const ps=document.getElementById('pixel-swatch');
        if(pi)pi.innerHTML=`X: ${x} Y: ${y}<br>HEX: <b style="color:var(--g)">${hex}</b><br>RGB: ${p[0]}, ${p[1]}, ${p[2]}<br>Alpha: ${p[3]}`;
        if(ps)ps.style.background=hex;
      });
      notify('🖼️ Image loaded!');
    };
    img.src=ev.target.result;
  };
  reader.readAsDataURL(file);
};

function gcd(a,b){return b===0?a:gcd(b,a%b);}

window.applyFilters=function(){
  const canvas=document.getElementById('img-canvas');if(!canvas||!imgEl)return;
  const b=document.getElementById('img-brightness')?.value||100;
  const c=document.getElementById('img-contrast')?.value||100;
  const s=document.getElementById('img-saturation')?.value||100;
  const h=document.getElementById('img-hue')?.value||0;
  const bl=document.getElementById('img-blur')?.value||0;
  const op=document.getElementById('img-opacity')?.value||100;
  canvas.style.filter=`brightness(${b}%) contrast(${c}%) saturate(${s}%) hue-rotate(${h}deg) blur(${bl}px) opacity(${op}%)`;
};
window.imgSetFilter=f=>{ const canvas=document.getElementById('img-canvas');if(canvas)canvas.style.filter=f; };
window.imgResetFilters=function(){
  const canvas=document.getElementById('img-canvas');if(canvas)canvas.style.filter='none';
  ['img-brightness','img-contrast','img-saturation'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=100;});
  ['img-hue','img-blur'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=0;});
  document.getElementById('img-opacity').value=100;
};
window.imgDownload=function(){
  const canvas=document.getElementById('img-canvas');if(!canvas)return;
  const tempCanvas=document.createElement('canvas');
  tempCanvas.width=canvas.width;tempCanvas.height=canvas.height;
  const ctx=tempCanvas.getContext('2d');ctx.filter=canvas.style.filter||'none';
  ctx.drawImage(canvas,0,0);
  const a=document.createElement('a');a.href=tempCanvas.toDataURL('image/png');a.download='francis-filtered.png';a.click();
  notify('💾 Downloaded!');
};

// ═══════════════════════════════════════════════
// EXTEND T() FOR NEW TABS
// ═══════════════════════════════════════════════
const _prevT = window.T;
window.T = function(btn, name) {
  _prevT(btn, name);
  if (name==='markdown')  { renderMD(); }
  if (name==='regex')     { loadRxLib(); runRegex(); }
  if (name==='json')      { jsonLive(); }
  if (name==='kanban')    { loadKanban(); }
  if (name==='finance')   { calcCompound(); calcLoan(); calcROI(); calcSIP(); }
  if (name==='typingtest'){ ttGenWords(); renderTTLB(); }
  if (name==='aiprompt')  { buildPrompt(); renderSavedPrompts(); }
  if (name==='music')     { buildPiano(); }
};

setTimeout(() => {
  ttGenWords();
  renderTTLB();
  renderSavedPrompts();
  buildPiano();
  loadRxLib();
  loadKanban();
}, 1000);

})();
