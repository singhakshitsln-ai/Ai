// FRANCIS — AI Monitor Agent
// Add to index.html before </body>: <script src="./ai-agent.js"></script>

(function () {

  // ── STYLES ──────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #ai-fab {
      position: fixed;
      bottom: 24px;
      right: 18px;
      z-index: 9999;
      width: 52px;
      height: 52px;
      background: #00ff41;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 0 20px rgba(0,255,65,.5), 0 4px 16px rgba(0,0,0,.4);
      font-size: 1.4rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform .2s, box-shadow .2s;
      animation: fabPulse 2.5s infinite;
    }
    @keyframes fabPulse {
      0%,100% { box-shadow: 0 0 20px rgba(0,255,65,.5); }
      50%      { box-shadow: 0 0 36px rgba(0,255,65,.9); }
    }
    #ai-fab:hover { transform: scale(1.1); }
    #ai-fab.open  { background: #003a0d; animation: none; box-shadow: 0 0 16px rgba(0,255,65,.3); }

    #ai-panel {
      display: none;
      position: fixed;
      bottom: 86px;
      right: 14px;
      z-index: 9998;
      width: calc(100vw - 28px);
      max-width: 400px;
      background: rgba(5,13,5,.98);
      border: 2px solid #00ff41;
      border-radius: 18px;
      box-shadow: 0 0 40px rgba(0,255,65,.25);
      font-family: 'Courier New', Courier, monospace;
      animation: aiSlide .22s ease;
      overflow: hidden;
    }
    @keyframes aiSlide {
      from { transform: translateY(20px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }
    #ai-panel.on { display: flex; flex-direction: column; }

    #ai-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 15px;
      border-bottom: 1px solid #003a0d;
      background: rgba(5,13,5,.99);
      flex-shrink: 0;
    }
    #ai-head-left { display: flex; align-items: center; gap: 9px; }
    #ai-dot {
      width: 8px; height: 8px;
      background: #00ff41;
      border-radius: 50%;
      box-shadow: 0 0 8px #00ff41;
      animation: aiDot 1.5s infinite;
    }
    @keyframes aiDot { 0%,100%{opacity:1} 50%{opacity:.2} }
    #ai-title {
      font-size: .8rem;
      font-weight: bold;
      color: #00ff41;
      text-shadow: 0 0 8px #00ff41;
      letter-spacing: 1.5px;
    }
    #ai-subtitle { font-size: .55rem; color: #006615; letter-spacing: 1px; }
    #ai-close-btn {
      background: none;
      border: 1px solid #003a0d;
      color: #006615;
      width: 26px; height: 26px;
      border-radius: 6px;
      cursor: pointer;
      font-family: monospace;
      font-size: .8rem;
      display: flex; align-items: center; justify-content: center;
      transition: all .15s;
    }
    #ai-close-btn:hover { border-color: #ff4444; color: #ff4444; }

    #ai-messages {
      flex: 1;
      overflow-y: auto;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 9px;
      max-height: 320px;
      min-height: 120px;
    }
    #ai-messages::-webkit-scrollbar { width: 3px; }
    #ai-messages::-webkit-scrollbar-thumb { background: #006615; border-radius: 2px; }

    .ai-msg {
      display: flex;
      gap: 8px;
      animation: msgIn .18s ease;
    }
    @keyframes msgIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }

    .ai-msg.user { flex-direction: row-reverse; }

    .ai-avatar {
      width: 26px; height: 26px;
      border-radius: 50%;
      background: rgba(0,255,65,.1);
      border: 1.5px solid #00aa22;
      display: flex; align-items: center; justify-content: center;
      font-size: .75rem;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .ai-msg.user .ai-avatar {
      background: rgba(0,255,65,.15);
      border-color: #00ff41;
    }

    .ai-bubble {
      max-width: 82%;
      padding: 9px 12px;
      border-radius: 12px;
      font-size: .76rem;
      line-height: 1.55;
      letter-spacing: .3px;
      word-break: break-word;
    }
    .ai-msg.bot .ai-bubble {
      background: rgba(0,0,0,.5);
      border: 1.5px solid #003a0d;
      border-bottom-left-radius: 4px;
      color: #00cc33;
    }
    .ai-msg.user .ai-bubble {
      background: rgba(0,255,65,.08);
      border: 1.5px solid #00aa22;
      border-bottom-right-radius: 4px;
      color: #00ff41;
    }

    .ai-typing {
      display: flex;
      gap: 4px;
      padding: 4px 0;
    }
    .ai-typing span {
      width: 6px; height: 6px;
      background: #00aa22;
      border-radius: 50%;
      animation: typDot .8s infinite;
    }
    .ai-typing span:nth-child(2) { animation-delay: .15s; }
    .ai-typing span:nth-child(3) { animation-delay: .3s; }
    @keyframes typDot { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }

    #ai-input-row {
      display: flex;
      gap: 7px;
      padding: 10px 13px 12px;
      border-top: 1px solid #003a0d;
      flex-shrink: 0;
    }
    #ai-input {
      flex: 1;
      padding: 9px 11px;
      background: rgba(0,0,0,.6);
      border: 1.5px solid #003a0d;
      border-radius: 8px;
      color: #00ff41;
      font-family: 'Courier New', monospace;
      font-size: .78rem;
      outline: none;
      transition: border-color .18s;
    }
    #ai-input:focus { border-color: #00ff41; }
    #ai-input::placeholder { color: #003a0d; }
    #ai-send {
      width: 36px; height: 36px;
      background: #00ff41;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      display: flex; align-items: center; justify-content: center;
      transition: opacity .18s;
      flex-shrink: 0;
    }
    #ai-send:hover { opacity: .82; }
    #ai-send:disabled { opacity: .4; cursor: not-allowed; }

    /* quick chips */
    #ai-chips {
      display: flex;
      gap: 6px;
      padding: 0 13px 9px;
      overflow-x: auto;
      flex-shrink: 0;
    }
    #ai-chips::-webkit-scrollbar { display: none; }
    .ai-chip {
      background: rgba(0,0,0,.4);
      border: 1px solid #003a0d;
      border-radius: 20px;
      color: #006615;
      font-family: 'Courier New', monospace;
      font-size: .6rem;
      padding: 5px 11px;
      cursor: pointer;
      white-space: nowrap;
      transition: all .15s;
      flex-shrink: 0;
    }
    .ai-chip:hover { border-color: #00aa22; color: #00aa22; }
  `;
  document.head.appendChild(style);

  // ── FAB BUTTON ───────────────────────────────────────────────
  const fab = document.createElement('button');
  fab.id = 'ai-fab';
  fab.textContent = '🤖';
  fab.title = 'AI Agent';
  document.body.appendChild(fab);

  // ── PANEL ────────────────────────────────────────────────────
  const panel = document.createElement('div');
  panel.id = 'ai-panel';
  panel.innerHTML = `
    <div id="ai-head">
      <div id="ai-head-left">
        <div id="ai-dot"></div>
        <div>
          <div id="ai-title">FRANCIS AI AGENT</div>
          <div id="ai-subtitle">ONLINE · READY</div>
        </div>
      </div>
      <button id="ai-close-btn" onclick="aiToggle()">✕</button>
    </div>
    <div id="ai-messages"></div>
    <div id="ai-chips">
      <button class="ai-chip" onclick="aiChip('What tools do you have?')">🔧 Tools</button>
      <button class="ai-chip" onclick="aiChip('Analyze my site')">📊 Analyze</button>
      <button class="ai-chip" onclick="aiChip('Give me a tip')">💡 Tip</button>
      <button class="ai-chip" onclick="aiChip('What can you do?')">🤖 Help</button>
      <button class="ai-chip" onclick="aiChip('Show site stats')">📈 Stats</button>
    </div>
    <div id="ai-input-row">
      <input id="ai-input" placeholder="Ask me anything..." maxlength="300"
        onkeydown="if(event.key==='Enter')aiSend()">
      <button id="ai-send" onclick="aiSend()">➤</button>
    </div>
  `;
  document.body.appendChild(panel);

  // ── STATE ────────────────────────────────────────────────────
  let isOpen = false;
  let isTyping = false;
  let msgHistory = [];

  // ── TOGGLE ───────────────────────────────────────────────────
  window.aiToggle = function () {
    isOpen = !isOpen;
    panel.classList.toggle('on', isOpen);
    fab.classList.toggle('open', isOpen);
    fab.textContent = isOpen ? '✕' : '🤖';
    if (isOpen && msgHistory.length === 0) {
      setTimeout(() => aiBot("Hey! I'm your FRANCIS AI Agent 🤖\n\nI can answer questions about this site, help you find tools, analyze your usage, or just chat. What would you like to know?"), 300);
    }
    if (isOpen) setTimeout(() => document.getElementById('ai-input')?.focus(), 350);
  };
  fab.onclick = aiToggle;

  // ── QUICK CHIPS ──────────────────────────────────────────────
  window.aiChip = function (text) {
    document.getElementById('ai-input').value = text;
    aiSend();
  };

  // ── SEND ─────────────────────────────────────────────────────
  window.aiSend = function () {
    const inp = document.getElementById('ai-input');
    const txt = inp.value.trim();
    if (!txt || isTyping) return;
    inp.value = '';
    addMsg('user', txt);
    msgHistory.push({ role: 'user', content: txt });
    showTyping();
    callClaude(txt);
  };

  // ── ADD MESSAGE ──────────────────────────────────────────────
  function addMsg(role, text) {
    const box = document.getElementById('ai-messages');
    const div = document.createElement('div');
    div.className = 'ai-msg ' + (role === 'user' ? 'user' : 'bot');
    div.innerHTML = `
      <div class="ai-avatar">${role === 'user' ? '👤' : '🤖'}</div>
      <div class="ai-bubble">${text.replace(/\n/g, '<br>')}</div>
    `;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  }

  function aiBot(text) {
    addMsg('bot', text);
    msgHistory.push({ role: 'assistant', content: text });
  }

  function showTyping() {
    isTyping = true;
    document.getElementById('ai-send').disabled = true;
    const box = document.getElementById('ai-messages');
    const div = document.createElement('div');
    div.className = 'ai-msg bot';
    div.id = 'ai-typing-indicator';
    div.innerHTML = `
      <div class="ai-avatar">🤖</div>
      <div class="ai-bubble">
        <div class="ai-typing"><span></span><span></span><span></span></div>
      </div>
    `;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  }

  function hideTyping() {
    isTyping = false;
    document.getElementById('ai-send').disabled = false;
    document.getElementById('ai-typing-indicator')?.remove();
  }

  // ── SITE CONTEXT ─────────────────────────────────────────────
  function getSiteContext() {
    const toolCount = (typeof TR !== 'undefined' && Array.isArray(TR)) ? TR.length : '500+';
    const stored = (() => { try { return JSON.parse(localStorage.getItem('francis_monitor') || '{}'); } catch { return {}; } })();
    return `You are the AI Agent for FRANCIS — a free offline tools website built by Akshit Singh.
FRANCIS has ${toolCount} tools across 20 categories: Text, Crypto, Encode, Math, Convert, Web, Color, Date, Generate, Dev, Random, Units, Util, Finance, Health, Fun, String, Image, AI.
The site runs 100% offline as a PWA with a green Matrix aesthetic.
Site stats: ${stored.visits || 1} visits, ${stored.toolsOpened || 0} tools opened, ${stored.totalClicks || 0} clicks.
Top tools used: ${Object.entries(stored.toolsUsed || {}).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v])=>k+'('+v+'x)').join(', ') || 'none yet'}.
Be helpful, concise, and friendly. Use a slightly techy tone. Keep replies under 120 words. Use line breaks for readability.`;
  }

  // ── CLAUDE API CALL ──────────────────────────────────────────
  async function callClaude(userMsg) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 200,
          system: getSiteContext(),
          messages: msgHistory.slice(-6).filter(m => m.role === 'user' || m.role === 'assistant'),
        })
      });
      const data = await res.json();
      hideTyping();
      const reply = data?.content?.[0]?.text || 'Sorry, I had trouble responding. Try again!';
      aiBot(reply);
    } catch (err) {
      hideTyping();
      // Fallback local responses if API fails
      aiBot(localFallback(userMsg));
    }
  }

  // ── LOCAL FALLBACK (works without API) ──────────────────────
  function localFallback(q) {
    q = q.toLowerCase();
    const toolCount = (typeof TR !== 'undefined' && Array.isArray(TR)) ? TR.length : '500+';
    const stored = (() => { try { return JSON.parse(localStorage.getItem('francis_monitor') || '{}'); } catch { return {}; } })();

    if (q.includes('tool') && (q.includes('how many') || q.includes('count')))
      return `FRANCIS has ${toolCount} tools across 20 categories! 🔧`;

    if (q.includes('stat') || q.includes('analyz') || q.includes('usage'))
      return `📊 Site Stats:\n• Visits: ${stored.visits || 1}\n• Tools opened: ${stored.toolsOpened || 0}\n• Clicks: ${stored.totalClicks || 0}\n• Searches: ${stored.searchCount || 0}`;

    if (q.includes('best') || q.includes('top') || q.includes('popular')) {
      const top = Object.entries(stored.toolsUsed || {}).sort((a,b)=>b[1]-a[1]).slice(0,3);
      return top.length ? `🏆 Your top tools:\n${top.map(([k,v],i)=>`${i+1}. ${k} (${v}×)`).join('\n')}` : "You haven't used any tools yet — go explore! 🚀";
    }

    if (q.includes('tip') || q.includes('suggest'))
      return `💡 Tip: Press Ctrl twice to open the full site monitor with charts and stats!\n\nAlso try the Search bar to quickly find any of the ${toolCount} tools.`;

    if (q.includes('who') || q.includes('made') || q.includes('built') || q.includes('design'))
      return `FRANCIS was designed and built by Akshit Singh. 👤\nA ${toolCount}-tool offline PWA with a Matrix green aesthetic.`;

    if (q.includes('offline') || q.includes('pwa') || q.includes('install'))
      return `✅ Yes! FRANCIS works 100% offline.\nTap the install banner or your browser's "Add to Home Screen" to install it as a PWA.`;

    if (q.includes('hello') || q.includes('hi') || q.includes('hey'))
      return `Hey! 👋 I'm your FRANCIS AI Agent.\nAsk me about tools, site stats, tips, or anything about this site!`;

    if (q.includes('help') || q.includes('what can'))
      return `I can help you:\n• 🔍 Find the right tool\n• 📊 Show your usage stats\n• 💡 Give tips & suggestions\n• 🤖 Answer questions about FRANCIS`;

    return `I'm not sure about that, but FRANCIS has ${toolCount} tools to explore!\nTry the search bar or ask me to "show stats" or "give me a tip". 💚`;
  }

})();
