// ═══════════════════════════════════════════════════════
// FRANCIS AI MONITOR — Press Ctrl twice to show stats
// ═══════════════════════════════════════════════════════

(function() {
  'use strict';

  // ── STORAGE ─────────────────────────────────────────
  const KEY = 'francis_monitor';
  function loadData() {
    try { return JSON.parse(localStorage.getItem(KEY)) || initData(); }
    catch { return initData(); }
  }
  function saveData(d) {
    try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {}
  }
  function initData() {
    return {
      visits: 0,
      totalClicks: 0,
      toolsOpened: 0,
      toolsUsed: {},
      searchCount: 0,
      catClicks: {},
      sessions: [],
      firstVisit: Date.now(),
      lastVisit: Date.now(),
      totalTime: 0,
      pageviews: 0,
      keystrokes: 0,
      scrollDepth: 0,
      hourlyActivity: Array(24).fill(0),
      dailyVisits: {},
    };
  }

  let data = loadData();
  const sessionStart = Date.now();
  const today = new Date().toISOString().split('T')[0];

  // Count visit
  data.visits = (data.visits || 0) + 1;
  data.pageviews = (data.pageviews || 0) + 1;
  data.lastVisit = Date.now();
  data.hourlyActivity = data.hourlyActivity || Array(24).fill(0);
  data.hourlyActivity[new Date().getHours()]++;
  data.dailyVisits = data.dailyVisits || {};
  data.dailyVisits[today] = (data.dailyVisits[today] || 0) + 1;
  saveData(data);

  // ── TRACK EVENTS ────────────────────────────────────
  document.addEventListener('click', function(e) {
    data.totalClicks = (data.totalClicks || 0) + 1;

    // Track tool opens
    const btn = e.target.closest('.tb');
    if (btn) {
      data.toolsOpened = (data.toolsOpened || 0) + 1;
      const name = btn.querySelector('.tnm')?.textContent?.trim();
      if (name) {
        data.toolsUsed = data.toolsUsed || {};
        data.toolsUsed[name] = (data.toolsUsed[name] || 0) + 1;
      }
    }

    // Track category clicks
    const cat = e.target.closest('.cat');
    if (cat) {
      const label = cat.textContent.trim().replace(/[^\w\s]/g, '').trim();
      data.catClicks = data.catClicks || {};
      data.catClicks[label] = (data.catClicks[label] || 0) + 1;
    }

    saveData(data);
  });

  // Track search
  const srch = document.getElementById('srch');
  if (srch) {
    srch.addEventListener('input', function() {
      data.searchCount = (data.searchCount || 0) + 1;
      saveData(data);
    });
  }

  // Track keystrokes
  document.addEventListener('keydown', function() {
    data.keystrokes = (data.keystrokes || 0) + 1;
    saveData(data);
  });

  // Track scroll depth
  document.addEventListener('scroll', function() {
    const pct = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    if (pct > (data.scrollDepth || 0)) {
      data.scrollDepth = pct;
      saveData(data);
    }
  });

  // Update session time before leaving
  window.addEventListener('beforeunload', function() {
    const sessionTime = Math.round((Date.now() - sessionStart) / 1000);
    data.totalTime = (data.totalTime || 0) + sessionTime;
    data.sessions = data.sessions || [];
    data.sessions.push({ date: today, duration: sessionTime, tools: data.toolsOpened });
    if (data.sessions.length > 50) data.sessions = data.sessions.slice(-50);
    saveData(data);
  });

  // ── DOUBLE CTRL TRIGGER ─────────────────────────────
  let ctrlCount = 0;
  let ctrlTimer = null;
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Control') {
      ctrlCount++;
      clearTimeout(ctrlTimer);
      ctrlTimer = setTimeout(() => { ctrlCount = 0; }, 600);
      if (ctrlCount >= 2) {
        ctrlCount = 0;
        showMonitor();
      }
    }
  });

  // ── MONITOR UI ──────────────────────────────────────
  function showMonitor() {
    // Remove existing if any
    const existing = document.getElementById('ai_monitor');
    if (existing) { existing.remove(); return; }

    data = loadData(); // Refresh data
    const sessionTime = Math.round((Date.now() - sessionStart) / 1000);
    const totalTools = Object.keys(data.toolsUsed || {}).length;
    const topTools = Object.entries(data.toolsUsed || {})
      .sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topCats = Object.entries(data.catClicks || {})
      .sort((a, b) => b[1] - a[1]).slice(0, 3);
    const avgSession = data.sessions?.length
      ? Math.round(data.totalTime / data.sessions.length) : sessionTime;
    const firstVisitDate = new Date(data.firstVisit || Date.now()).toLocaleDateString();
    const recentDays = Object.entries(data.dailyVisits || {}).slice(-7);
    const maxDay = Math.max(...recentDays.map(([,v]) => v), 1);

    // Peak hour
    const hourly = data.hourlyActivity || Array(24).fill(0);
    const peakHour = hourly.indexOf(Math.max(...hourly));
    const peakLabel = peakHour === 0 ? '12 AM' : peakHour < 12 ? `${peakHour} AM` : peakHour === 12 ? '12 PM' : `${peakHour - 12} PM`;

    // Activity bar (24h)
    const maxH = Math.max(...hourly, 1);
    const activityBars = hourly.map((v, i) => {
      const h = Math.round((v / maxH) * 12);
      const active = i === new Date().getHours();
      return `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;flex:1">
        <div style="width:100%;background:${active ? '#00ff41' : v > 0 ? '#00aa22' : '#003a0d'};height:${Math.max(2, h * 4)}px;border-radius:2px;transition:all .3s"></div>
        ${i % 6 === 0 ? `<span style="font-size:.45rem;color:#003a0d">${i === 0 ? '12a' : i === 12 ? '12p' : i > 12 ? `${i-12}p` : `${i}a`}</span>` : '<span style="font-size:.45rem;color:transparent">·</span>'}
      </div>`;
    }).join('');

    // Build AI insight
    const insight = generateInsight(data, sessionTime, totalTools, topTools);

    const panel = document.createElement('div');
    panel.id = 'ai_monitor';
    panel.style.cssText = `
      position:fixed;bottom:0;left:50%;transform:translateX(-50%);
      width:100%;max-width:540px;
      background:rgba(3,10,3,.98);
      border:2px solid #00ff41;border-bottom:none;
      border-radius:18px 18px 0 0;
      z-index:9999;
      box-shadow:0 -4px 40px rgba(0,255,65,.25);
      font-family:'Courier New',monospace;
      animation:slideUp .3s ease;
      max-height:85vh;overflow-y:auto;
    `;

    panel.innerHTML = `
      <style>
        @keyframes slideUp{from{transform:translateX(-50%) translateY(100%)}to{transform:translateX(-50%) translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
        #ai_monitor::-webkit-scrollbar{width:4px}
        #ai_monitor::-webkit-scrollbar-track{background:transparent}
        #ai_monitor::-webkit-scrollbar-thumb{background:#003a0d;border-radius:4px}
        .mon-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px}
        .mon-stat{background:rgba(0,255,65,.05);border:1px solid #003a0d;border-radius:10px;padding:10px 12px}
        .mon-stat-num{font-size:1.4rem;font-weight:bold;color:#00ff41;text-shadow:0 0 10px #00ff41}
        .mon-stat-lbl{font-size:.55rem;color:#006615;letter-spacing:1.5px;margin-top:2px}
        .mon-bar-wrap{background:rgba(0,0,0,.4);border:1px solid #003a0d;border-radius:10px;padding:10px 12px;margin-bottom:8px}
        .mon-bar-title{font-size:.6rem;color:#00aa22;letter-spacing:2px;margin-bottom:8px}
        .tool-row{display:flex;align-items:center;gap:8px;margin-bottom:5px}
        .tool-bar{height:6px;background:linear-gradient(to right,#00ff41,#00aa22);border-radius:3px;transition:width .5s}
        .tool-name{font-size:.65rem;color:#00cc33;min-width:80px}
        .tool-cnt{font-size:.6rem;color:#006615;margin-left:auto}
        .ai-insight{background:rgba(0,255,65,.06);border:1.5px solid #00aa22;border-radius:12px;padding:13px;margin-bottom:8px}
        .ai-dot{display:inline-block;width:7px;height:7px;background:#00ff41;border-radius:50%;animation:blink 1.2s infinite;margin-right:6px}
      </style>

      <!-- Header -->
      <div style="padding:14px 16px 0;display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:1.2rem">🤖</span>
          <div>
            <div style="font-size:.85rem;font-weight:bold;color:#00ff41;letter-spacing:2px">AI MONITOR</div>
            <div style="font-size:.55rem;color:#006615;letter-spacing:1px">PRESS CTRL×2 TO CLOSE</div>
          </div>
        </div>
        <div style="text-align:right">
          <div style="font-size:.6rem;color:#00aa22">${new Date().toLocaleTimeString()}</div>
          <div style="font-size:.55rem;color:#006615">${today}</div>
        </div>
      </div>

      <div style="padding:12px 14px">

        <!-- AI Insight -->
        <div class="ai-insight">
          <div style="font-size:.6rem;color:#00aa22;letter-spacing:2px;margin-bottom:6px"><span class="ai-dot"></span>AI INSIGHT</div>
          <div style="font-size:.75rem;color:#00cc33;line-height:1.6">${insight}</div>
        </div>

        <!-- Key Stats -->
        <div class="mon-row">
          <div class="mon-stat">
            <div class="mon-stat-num">${data.visits || 1}</div>
            <div class="mon-stat-lbl">TOTAL VISITS</div>
          </div>
          <div class="mon-stat">
            <div class="mon-stat-num">${data.toolsOpened || 0}</div>
            <div class="mon-stat-lbl">TOOLS OPENED</div>
          </div>
        </div>
        <div class="mon-row">
          <div class="mon-stat">
            <div class="mon-stat-num">${formatTime(sessionTime)}</div>
            <div class="mon-stat-lbl">THIS SESSION</div>
          </div>
          <div class="mon-stat">
            <div class="mon-stat-num">${formatTime(avgSession)}</div>
            <div class="mon-stat-lbl">AVG SESSION</div>
          </div>
        </div>
        <div class="mon-row">
          <div class="mon-stat">
            <div class="mon-stat-num">${data.totalClicks || 0}</div>
            <div class="mon-stat-lbl">TOTAL CLICKS</div>
          </div>
          <div class="mon-stat">
            <div class="mon-stat-num">${data.searchCount || 0}</div>
            <div class="mon-stat-lbl">SEARCHES</div>
          </div>
        </div>
        <div class="mon-row">
          <div class="mon-stat">
            <div class="mon-stat-num">${totalTools}</div>
            <div class="mon-stat-lbl">UNIQUE TOOLS USED</div>
          </div>
          <div class="mon-stat">
            <div class="mon-stat-num">${data.scrollDepth || 0}%</div>
            <div class="mon-stat-lbl">MAX SCROLL DEPTH</div>
          </div>
        </div>

        <!-- 24h Activity Chart -->
        <div class="mon-bar-wrap">
          <div class="mon-bar-title">24-HOUR ACTIVITY  ◆  PEAK: ${peakLabel}</div>
          <div style="display:flex;align-items:flex-end;gap:1px;height:56px">
            ${activityBars}
          </div>
        </div>

        <!-- Top Tools -->
        ${topTools.length ? `
        <div class="mon-bar-wrap">
          <div class="mon-bar-title">TOP TOOLS USED</div>
          ${topTools.map(([name, count]) => `
            <div class="tool-row">
              <span class="tool-name">${name.length > 14 ? name.slice(0,13)+'…' : name}</span>
              <div style="flex:1;background:rgba(0,0,0,.4);border-radius:3px;height:6px">
                <div class="tool-bar" style="width:${Math.round((count / topTools[0][1]) * 100)}%"></div>
              </div>
              <span class="tool-cnt">${count}×</span>
            </div>
          `).join('')}
        </div>` : ''}

        <!-- Top Categories -->
        ${topCats.length ? `
        <div class="mon-bar-wrap">
          <div class="mon-bar-title">TOP CATEGORIES</div>
          ${topCats.map(([cat, count]) => `
            <div class="tool-row">
              <span class="tool-name">${cat.slice(0,14)}</span>
              <div style="flex:1;background:rgba(0,0,0,.4);border-radius:3px;height:6px">
                <div class="tool-bar" style="width:${Math.round((count / topCats[0][1]) * 100)}%;background:linear-gradient(to right,#a855f7,#7c3aed)"></div>
              </div>
              <span class="tool-cnt">${count}×</span>
            </div>
          `).join('')}
        </div>` : ''}

        <!-- 7-Day History -->
        ${recentDays.length ? `
        <div class="mon-bar-wrap">
          <div class="mon-bar-title">7-DAY VISIT HISTORY</div>
          <div style="display:flex;align-items:flex-end;gap:4px;height:40px">
            ${recentDays.map(([date, count]) => `
              <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px">
                <div style="width:100%;background:${date===today?'#00ff41':'#00aa22'};height:${Math.max(4,Math.round((count/maxDay)*36))}px;border-radius:3px 3px 0 0"></div>
                <span style="font-size:.45rem;color:#006615">${date.slice(5)}</span>
              </div>
            `).join('')}
          </div>
        </div>` : ''}

        <!-- Meta info -->
        <div style="display:flex;justify-content:space-between;padding:8px 4px;border-top:1px solid #003a0d;margin-top:4px">
          <span style="font-size:.6rem;color:#003a0d">First visit: ${firstVisitDate}</span>
          <span style="font-size:.6rem;color:#003a0d">Sessions: ${(data.sessions||[]).length + 1}</span>
          <button onclick="clearMonitorData()" style="font-size:.55rem;color:#003a0d;background:none;border:none;cursor:pointer;font-family:monospace;letter-spacing:1px">RESET DATA</button>
        </div>

      </div>
    `;

    document.body.appendChild(panel);

    // Close on outside tap
    setTimeout(() => {
      document.addEventListener('click', function outsideClick(e) {
        if (!panel.contains(e.target)) {
          panel.remove();
          document.removeEventListener('click', outsideClick);
        }
      });
    }, 200);
  }

  // ── HELPERS ─────────────────────────────────────────
  function formatTime(seconds) {
    if (seconds < 60) return seconds + 's';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm';
    return Math.floor(seconds / 3600) + 'h ' + Math.floor((seconds % 3600) / 60) + 'm';
  }

  function generateInsight(data, sessionTime, totalTools, topTools) {
    const visits = data.visits || 1;
    const tools = data.toolsOpened || 0;
    const clicks = data.totalClicks || 0;
    const searches = data.searchCount || 0;
    const topTool = topTools[0]?.[0] || null;

    const insights = [];

    if (visits === 1) insights.push('Welcome to FRANCIS! This is your first visit. Start exploring the tools!');
    else if (visits < 5) insights.push(`You've visited ${visits} times. You're getting familiar with FRANCIS!`);
    else if (visits < 20) insights.push(`${visits} visits — you're becoming a regular FRANCIS user! 💚`);
    else insights.push(`${visits} visits and counting — you're a true FRANCIS power user! 🔥`);

    if (topTool) insights.push(`Your most-used tool is <strong>${topTool}</strong>.`);
    if (searches > 5) insights.push(`You search a lot (${searches}×) — you know what you want!`);
    if (tools > 10) insights.push(`${tools} tool opens this session — you're highly productive!`);
    if (sessionTime > 300) insights.push(`You've been here ${formatTime(sessionTime)} — great focus!`);
    if (totalTools > 5) insights.push(`You've explored ${totalTools} different tools. Try even more!`);

    // Pick 2 random insights
    const shuffled = insights.sort(() => Math.random() - 0.5).slice(0, 2);
    return shuffled.join(' ');
  }

  // Expose reset function
  window.clearMonitorData = function() {
    if (confirm('Reset all monitor data?')) {
      localStorage.removeItem(KEY);
      document.getElementById('ai_monitor')?.remove();
    }
  };

  // ── FLOATING HINT (first time only) ─────────────────
  if ((data.visits || 1) <= 2) {
    setTimeout(() => {
      const hint = document.createElement('div');
      hint.style.cssText = `
        position:fixed;bottom:20px;right:16px;
        background:rgba(5,18,5,.95);
        border:1.5px solid #00aa22;
        border-radius:10px;padding:8px 12px;
        font-family:'Courier New',monospace;
        font-size:.62rem;color:#00aa22;letter-spacing:1px;
        z-index:8888;animation:slideUp .3s ease;
        cursor:pointer;
      `;
      hint.textContent = '🤖 Press Ctrl × 2 for Site Stats';
      hint.onclick = () => hint.remove();
      document.body.appendChild(hint);
      setTimeout(() => hint.remove(), 5000);
    }, 3000);
  }

})();
