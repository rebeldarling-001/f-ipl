/**
 * FREEFIREXIPL — MAINTENANCE MODE
 * Add <script src="maintenance.js"></script> before </body> on every page.
 * Run the SQL in Supabase once. That's it.
 */
(function () {
  'use strict';

  const SUPABASE_URL      = 'https://ndioutmihxodqknvgfju.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kaW91dG1paHhvZHFrbnZnZmp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNTg2NDMsImV4cCI6MjA5ODYzNDY0M30.KeSyXI6DFvYnKbBxICmrmQ8t8eFIoxPn9Ln1aBU0OUk';
  const TABLE             = 'site_settings';

  const PAGE_KEYS = {
    'home.html':'home','arena.html':'arena',
    'registration-center.html':'registration-center','play-ins.html':'play-ins',
    'auction-center.html':'auction-center','teams.html':'teams',
    'schedule.html':'schedule','leaderboard.html':'leaderboard',
    'hall-of-fame.html':'hall-of-fame','rules.html':'rules','about.html':'about'
  };
  const PAGE_LABELS = {
    'home':'Home','arena':'Arena','registration-center':'Registration Center',
    'play-ins':'Play-Ins','auction-center':'Auction Night','teams':'Teams',
    'schedule':'Schedule','leaderboard':'Leaderboard',
    'hall-of-fame':'Hall of Fame','rules':'Rules','about':'About'
  };

  const filename = window.location.pathname.split('/').pop() || 'home.html';
  const PAGE_KEY = PAGE_KEYS[filename] || filename.replace('.html','');

  /* ── CSS ── */
  const css = `
    #mnt{position:fixed;inset:0;z-index:99999;display:none;flex-direction:column;align-items:center;justify-content:center;padding:20px;overflow:hidden;background:#040201;}
    #mnt.mnt-show{display:flex;}
    #mnt-bg{position:absolute;inset:0;background:radial-gradient(ellipse 100% 70% at 50% -10%,rgba(240,185,61,.18) 0%,transparent 55%),radial-gradient(ellipse 70% 50% at 10% 110%,rgba(180,90,10,.12) 0%,transparent 50%),radial-gradient(ellipse 70% 50% at 90% 110%,rgba(240,140,20,.1) 0%,transparent 50%),#040201;animation:mntBgP 5s ease-in-out infinite alternate;}
    @keyframes mntBgP{0%{opacity:.6;}100%{opacity:1;}}
    #mnt-grid{position:absolute;inset:0;background:linear-gradient(rgba(240,185,61,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(240,185,61,.03) 1px,transparent 1px);background-size:40px 40px;animation:mntGrid 15s linear infinite;}
    @keyframes mntGrid{from{transform:perspective(400px) rotateX(8deg) translateY(0);}to{transform:perspective(400px) rotateX(8deg) translateY(40px);}}
    #mnt-scan{position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,transparent 0%,rgba(240,185,61,.05) 50%,transparent 100%);background-size:100% 180px;animation:mntScan 2.5s linear infinite;}
    @keyframes mntScan{from{background-position:0 -180px;}to{background-position:0 100vh;}}
    #mnt-vig{position:absolute;inset:0;background:radial-gradient(ellipse 80% 80% at 50% 50%,transparent 40%,rgba(0,0,0,.7) 100%);pointer-events:none;}
    #mnt-cv{position:absolute;inset:0;pointer-events:none;}
    #mnt-cnt{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;max-width:340px;width:100%;}
    #mnt-icon{position:relative;width:150px;height:150px;margin-bottom:30px;flex-shrink:0;}
    .mnt-ring{position:absolute;border-radius:50%;animation:mntRingR linear infinite;}
    .mnt-r1{inset:0;border:1px dashed rgba(240,185,61,.18);animation-duration:25s;}
    .mnt-r2{inset:14px;border:1px dashed rgba(240,185,61,.28);animation-duration:18s;animation-direction:reverse;}
    .mnt-r3{inset:27px;border:1.5px solid rgba(240,185,61,.2);animation-duration:11s;}
    .mnt-r4{inset:40px;border:2px solid rgba(240,185,61,.4);animation-duration:7s;animation-direction:reverse;}
    .mnt-r5{inset:52px;border:2px solid rgba(240,185,61,.6);animation-duration:4s;}
    @keyframes mntRingR{to{transform:rotate(360deg);}}
    .mnt-ring::before{content:'';position:absolute;border-radius:50%;background:rgba(240,185,61,.8);}
    .mnt-r1::before{width:5px;height:5px;top:-3px;left:50%;}
    .mnt-r2::before{width:4px;height:4px;bottom:-2px;left:30%;}
    .mnt-r3::before{width:3px;height:3px;top:-2px;right:20%;}
    .mnt-r4::before{width:3px;height:3px;left:-1.5px;top:50%;}
    .mnt-r5::before{width:4px;height:4px;right:-2px;top:50%;}
    #mnt-glow{position:absolute;inset:58px;border-radius:50%;background:radial-gradient(circle,rgba(240,185,61,.55) 0%,rgba(240,185,61,.1) 55%,transparent 100%);animation:mntGlowP 2s ease-in-out infinite;}
    @keyframes mntGlowP{0%,100%{transform:scale(.8);opacity:.6;}50%{transform:scale(1.25);opacity:1;}}
    #mnt-gsv{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;}
    #mnt-gear{animation:mntGearS 2.5s linear infinite;}
    @keyframes mntGearS{to{transform:rotate(360deg);}}
    #mnt-bdg{display:inline-flex;align-items:center;gap:7px;background:rgba(240,185,61,.07);border:1px solid rgba(240,185,61,.22);border-radius:20px;padding:5px 14px;margin-bottom:16px;font-family:'Space Mono',monospace;font-size:9px;letter-spacing:.25em;color:rgba(240,185,61,.65);text-transform:uppercase;animation:mntBdg 2.5s ease-in-out infinite;}
    .mnt-bdot{width:7px;height:7px;border-radius:50%;background:#f0b93d;animation:mntBdotP 1s ease-in-out infinite;}
    @keyframes mntBdg{0%,100%{border-color:rgba(240,185,61,.15);box-shadow:none;}50%{border-color:rgba(240,185,61,.45);box-shadow:0 0 14px rgba(240,185,61,.15);}}
    @keyframes mntBdotP{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.2;transform:scale(.6);}}
    #mnt-ttl{font-family:'Anton',sans-serif;font-size:clamp(38px,11vw,62px);letter-spacing:.03em;text-transform:uppercase;text-align:center;line-height:.9;margin:0 0 14px;animation:mntTtlF 3s ease-in-out infinite alternate;}
    @keyframes mntTtlF{
      0%{background:linear-gradient(180deg,#fff5d6,#f0b93d 50%,#b3811f);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 15px rgba(240,185,61,.3));}
      50%{background:linear-gradient(180deg,#fbe4a6,#e8a82a 50%,#9a6b18);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 30px rgba(240,185,61,.5));}
      100%{background:linear-gradient(180deg,#ffffff,#ffe080 45%,#d4920a);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 40px rgba(240,185,61,.65));}
    }
    #mnt-sub{font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:500;color:rgba(244,236,216,.4);text-align:center;max-width:260px;line-height:1.65;margin:0 0 6px;}
    #mnt-cusmsg{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.08em;color:rgba(240,185,61,.55);text-align:center;max-width:280px;min-height:16px;line-height:1.7;margin-bottom:4px;}
    #mnt-pw{width:min(220px,70vw);height:2px;background:rgba(255,255,255,.06);border-radius:2px;margin:20px 0 12px;overflow:hidden;position:relative;}
    #mnt-pb{position:absolute;left:0;top:0;height:100%;width:35%;background:linear-gradient(90deg,transparent,rgba(240,185,61,.9),rgba(240,185,61,.4),transparent);border-radius:2px;animation:mntPbS 2s ease-in-out infinite;}
    @keyframes mntPbS{0%{left:-35%;opacity:0;}15%{opacity:1;}85%{opacity:1;}100%{left:100%;opacity:0;}}
    #mnt-dots{display:flex;gap:7px;margin-bottom:18px;}
    .mnt-d{width:6px;height:6px;border-radius:50%;background:rgba(240,185,61,.25);animation:mntDotB 1.5s ease-in-out infinite;}
    .mnt-d:nth-child(2){animation-delay:.25s;}.mnt-d:nth-child(3){animation-delay:.5s;}
    @keyframes mntDotB{0%,100%{transform:translateY(0);opacity:.25;background:rgba(240,185,61,.25);}50%{transform:translateY(-9px);opacity:1;background:#f0b93d;box-shadow:0 0 10px rgba(240,185,61,.6);}}
    #mnt-tkw{width:100%;max-width:340px;overflow:hidden;border-top:1px solid rgba(240,185,61,.07);padding-top:14px;margin-top:4px;}
    #mnt-tk{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:.12em;color:rgba(240,185,61,.3);white-space:nowrap;animation:mntTkR 20s linear infinite;}
    @keyframes mntTkR{from{transform:translateX(100%);}to{transform:translateX(-100%);}}
    body.mnt-active > *:not(#mnt):not(#mnt-abtn):not(#mnt-apnl){visibility:hidden!important;pointer-events:none!important;}
    #mnt-abtn{position:fixed;bottom:20px;right:20px;z-index:100000;width:46px;height:46px;border-radius:50%;background:rgba(240,185,61,.08);border:1px solid rgba(240,185,61,.2);color:rgba(240,185,61,.5);font-size:20px;cursor:pointer;display:none;align-items:center;justify-content:center;transition:all .2s;-webkit-tap-highlight-color:transparent;animation:mntAbtnS 8s linear infinite;}
    #mnt-abtn.mnt-vis{display:flex;}
    #mnt-abtn:hover{background:rgba(240,185,61,.18);color:#f0b93d;}
    @keyframes mntAbtnS{to{transform:rotate(360deg);}}
    #mnt-apnl{position:fixed;bottom:78px;right:16px;z-index:100001;background:#0c0806;border:1px solid rgba(240,185,61,.22);border-radius:18px;padding:20px;width:min(300px,calc(100vw - 32px));box-shadow:0 12px 50px rgba(0,0,0,.85);display:none;flex-direction:column;gap:11px;}
    #mnt-apnl.mnt-open{display:flex;animation:mntApnlS .22s ease;}
    @keyframes mntApnlS{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
    .mnt-aphead{font-family:'Anton',sans-serif;font-size:15px;letter-spacing:.08em;color:#f0b93d;text-transform:uppercase;border-bottom:1px solid rgba(240,185,61,.12);padding-bottom:10px;}
    .mnt-aplbl{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:.1em;color:rgba(240,185,61,.35);text-transform:uppercase;margin-top:2px;}
    .mnt-aprow{display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.04);}
    .mnt-aprow:last-of-type{border:none;}
    .mnt-apname{font-size:13px;font-weight:600;color:#f4ecd8;font-family:'Rajdhani',sans-serif;}
    .mnt-apname.mnt-cur{color:#f0b93d;}
    .mnt-tog{position:relative;width:44px;height:24px;flex-shrink:0;}
    .mnt-tog input{opacity:0;width:0;height:0;}
    .mnt-togsl{position:absolute;inset:0;cursor:pointer;background:rgba(255,255,255,.08);border-radius:24px;transition:background .2s;}
    .mnt-togsl:before{content:'';position:absolute;width:18px;height:18px;border-radius:50%;background:#444;left:3px;top:3px;transition:transform .2s,background .2s;}
    .mnt-tog input:checked + .mnt-togsl{background:rgba(240,185,61,.18);}
    .mnt-tog input:checked + .mnt-togsl:before{transform:translateX(20px);background:#f0b93d;}
    .mnt-apta{background:rgba(255,255,255,.04);border:1px solid rgba(240,185,61,.15);border-radius:8px;padding:10px 12px;color:#f4ecd8;font-family:'Rajdhani',sans-serif;font-size:13px;resize:none;width:100%;min-height:50px;outline:none;}
    .mnt-apta:focus{border-color:rgba(240,185,61,.4);}
    .mnt-apbtn{background:linear-gradient(135deg,#f0b93d,#b3811f);border:none;border-radius:8px;padding:10px;color:#1a1206;font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;letter-spacing:.06em;cursor:pointer;text-transform:uppercase;width:100%;transition:opacity .15s;}
    .mnt-apbtn:hover{opacity:.85;}
    .mnt-apbtn.ghost{background:transparent;border:1px solid rgba(240,185,61,.25);color:rgba(240,185,61,.7);}
    .mnt-apsvd{font-family:'Rajdhani',sans-serif;font-size:11px;color:rgba(240,185,61,.6);text-align:center;min-height:14px;}
    #mnt-logwrap{position:fixed;inset:0;z-index:100002;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;}
    .mnt-loginbox{background:#120c07;border:1px solid rgba(240,185,61,.25);border-radius:18px;padding:24px;width:min(300px,calc(100vw - 40px));display:flex;flex-direction:column;gap:12px;}
    .mnt-loginttl{font-family:'Anton',sans-serif;font-size:18px;letter-spacing:.06em;color:#f0b93d;text-transform:uppercase;}
    .mnt-inp{background:rgba(255,255,255,.04);border:1px solid rgba(240,185,61,.15);border-radius:8px;padding:10px 12px;color:#f4ecd8;font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:500;outline:none;width:100%;}
    .mnt-inp:focus{border-color:rgba(240,185,61,.4);}
    .mnt-loginerr{font-family:'Rajdhani',sans-serif;font-size:12px;color:#ff4433;text-align:center;min-height:14px;}
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ── STATE ── */
  let sb = null, allSettings = {}, isAdmin = false;
  let pts = [], raf = null;

  /* ── SUPABASE ── */
  function initSB() {
    if (window.supabase && window.supabase.createClient) {
      sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      return true;
    }
    return false;
  }

  async function check() {
    if (!sb) return;
    try {
      const { data } = await sb.from(TABLE).select('*');
      allSettings = {};
      (data || []).forEach(r => { allSettings[r.page] = r; });
      const cur = allSettings[PAGE_KEY];
      if (cur && cur.maintenance) showOverlay(cur.message || '');
      const { data: { session } } = await sb.auth.getSession();
      if (session) { isAdmin = true; showAdminBtn(); }
    } catch (e) { console.warn('[MNT]', e.message); }
  }

  /* ── OVERLAY ── */
  function buildOverlay(msg) {
    const el = document.createElement('div');
    el.id = 'mnt';
    el.innerHTML = `
      <div id="mnt-bg"></div>
      <div id="mnt-grid"></div>
      <div id="mnt-scan"></div>
      <div id="mnt-vig"></div>
      <canvas id="mnt-cv"></canvas>
      <div id="mnt-cnt">
        <div id="mnt-icon">
          <div class="mnt-ring mnt-r1"></div>
          <div class="mnt-ring mnt-r2"></div>
          <div class="mnt-ring mnt-r3"></div>
          <div class="mnt-ring mnt-r4"></div>
          <div class="mnt-ring mnt-r5"></div>
          <div id="mnt-glow"></div>
          <div id="mnt-gsv">
            <svg id="mnt-gear" width="46" height="46" viewBox="0 0 24 24" fill="none">
              <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" fill="rgba(240,185,61,.95)"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="rgba(240,185,61,.65)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
        <div id="mnt-bdg"><span class="mnt-bdot"></span>System Maintenance</div>
        <h1 id="mnt-ttl">WE'RE<br>COOKING</h1>
        <p id="mnt-sub">The admin is working on something. Back soon.</p>
        <p id="mnt-cusmsg">${msg ? '"' + msg + '"' : ''}</p>
        <div id="mnt-pw"><div id="mnt-pb"></div></div>
        <div id="mnt-dots"><div class="mnt-d"></div><div class="mnt-d"></div><div class="mnt-d"></div></div>
        <div id="mnt-tkw">
          <div id="mnt-tk">⚙ MAINTENANCE IN PROGRESS &nbsp;·&nbsp; FREEFIREXIPL SEASON 12 &nbsp;·&nbsp; ADMIN IS COOKING &nbsp;·&nbsp; BACK SOON &nbsp;·&nbsp; ⚙ MAINTENANCE IN PROGRESS &nbsp;·&nbsp; FREEFIREXIPL SEASON 12 &nbsp;·&nbsp;</div>
        </div>
      </div>`;
    document.body.appendChild(el);
    return el;
  }

  function startParticles() {
    const cv = document.getElementById('mnt-cv');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    cv.width = innerWidth; cv.height = innerHeight;
    pts = [];
    const n = Math.min(80, Math.floor(innerWidth / 6));
    for (let i = 0; i < n; i++) {
      const t = Math.random();
      pts.push({ x:Math.random()*cv.width, y:Math.random()*cv.height, r:Math.random()*1.8+.3,
        vx:(Math.random()-.5)*.5, vy:(Math.random()-.5)*.5, a:Math.random()*.7+.1,
        ph:Math.random()*Math.PI*2, spd:Math.random()*.025+.008,
        kind: t<.15?'diamond':t<.35?'cross':'ember' });
    }
    function frame() {
      ctx.clearRect(0,0,cv.width,cv.height);
      pts.forEach(p => {
        p.ph+=p.spd; p.x+=p.vx; p.y+=p.vy;
        if(p.x<0)p.x=cv.width; if(p.x>cv.width)p.x=0;
        if(p.y<0)p.y=cv.height; if(p.y>cv.height)p.y=0;
        const a = p.a*(.4+.6*Math.abs(Math.sin(p.ph)));
        if(p.kind==='diamond'){
          ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.ph);
          ctx.beginPath(); ctx.moveTo(0,-p.r*5); ctx.lineTo(p.r*1.5,0); ctx.lineTo(0,p.r*5); ctx.lineTo(-p.r*1.5,0); ctx.closePath();
          ctx.fillStyle=`rgba(240,185,61,${a*.9})`; ctx.shadowBlur=8; ctx.shadowColor=`rgba(240,185,61,${a})`; ctx.fill(); ctx.restore();
        } else if(p.kind==='cross'){
          ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.ph*.5);
          ctx.strokeStyle=`rgba(240,185,61,${a*.6})`; ctx.lineWidth=.8;
          ctx.beginPath(); ctx.moveTo(-p.r*3,0); ctx.lineTo(p.r*3,0); ctx.moveTo(0,-p.r*3); ctx.lineTo(0,p.r*3); ctx.stroke(); ctx.restore();
        } else {
          const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*4);
          g.addColorStop(0,`rgba(240,185,61,${a})`); g.addColorStop(1,`rgba(240,130,20,0)`);
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r*4,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
        }
      });
      raf = requestAnimationFrame(frame);
    }
    frame();
  }

  function showOverlay(msg) {
    document.body.classList.add('mnt-active');
    if (!document.getElementById('mnt')) buildOverlay(msg);
    document.getElementById('mnt').classList.add('mnt-show');
    startParticles();
  }

  function hideOverlay() {
    document.body.classList.remove('mnt-active');
    const el = document.getElementById('mnt');
    if (el) el.classList.remove('mnt-show');
    cancelAnimationFrame(raf);
  }

  /* ── ADMIN BTN ── */
  function showAdminBtn() {
    let btn = document.getElementById('mnt-abtn');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'mnt-abtn'; btn.textContent = '⚙';
      btn.setAttribute('aria-label', 'Maintenance controls');
      document.body.appendChild(btn);
      btn.addEventListener('click', e => { e.stopPropagation(); togglePanel(); });
      document.addEventListener('click', e => {
        const p = document.getElementById('mnt-apnl');
        if (p && !p.contains(e.target) && e.target !== btn) p.classList.remove('mnt-open');
      });
    }
    btn.classList.add('mnt-vis');
    if (!document.getElementById('mnt-apnl')) buildPanel();
  }

  function togglePanel() {
    const p = document.getElementById('mnt-apnl');
    if (p) p.classList.toggle('mnt-open');
  }

  function buildPanel() {
    const pages = Object.keys(PAGE_LABELS);
    const rows = pages.map(p => {
      const on = (allSettings[p] || {}).maintenance || false;
      const isCur = p === PAGE_KEY;
      return `<div class="mnt-aprow"><span class="mnt-apname${isCur?' mnt-cur':''}">${PAGE_LABELS[p]}${isCur?' ●':''}</span>
        <label class="mnt-tog"><input type="checkbox" data-page="${p}"${on?' checked':''}><span class="mnt-togsl"></span></label></div>`;
    }).join('');

    const curMsg = (allSettings[PAGE_KEY] || {}).message || '';
    const panel = document.createElement('div');
    panel.id = 'mnt-apnl';
    panel.innerHTML = `
      <div class="mnt-aphead">⚙ Maintenance Control</div>
      <div class="mnt-aplbl">Pages</div>
      ${rows}
      <div class="mnt-aplbl" style="margin-top:4px;">Message for this page</div>
      <textarea class="mnt-apta" id="mnt-apta" placeholder="Admin is cooking something — back soon! 🔥">${curMsg}</textarea>
      <button class="mnt-apbtn" id="mnt-apsave">Save Message</button>
      <div class="mnt-apsvd" id="mnt-apsvd"></div>
      <button class="mnt-apbtn ghost" id="mnt-aplogout">Sign Out</button>`;
    document.body.appendChild(panel);

    panel.querySelectorAll('.mnt-tog input').forEach(inp => {
      inp.addEventListener('change', async () => {
        const page = inp.dataset.page, on = inp.checked;
        try {
          await sb.from(TABLE).update({ maintenance: on, updated_at: new Date().toISOString() }).eq('page', page);
          allSettings[page] = { ...(allSettings[page]||{}), maintenance: on };
          if (page === PAGE_KEY) { on ? showOverlay((allSettings[page]||{}).message||'') : hideOverlay(); }
          const svd = document.getElementById('mnt-apsvd');
          svd.textContent = `✓ ${PAGE_LABELS[page]} ${on?'ON':'OFF'}`;
          clearTimeout(svd._t); svd._t = setTimeout(()=>svd.textContent='', 2000);
        } catch(e) { alert('Error: '+e.message); inp.checked = !on; }
      });
    });

    document.getElementById('mnt-apsave').addEventListener('click', async () => {
      const msg = document.getElementById('mnt-apta').value.trim();
      const svd = document.getElementById('mnt-apsvd');
      try {
        await sb.from(TABLE).update({ message: msg, updated_at: new Date().toISOString() }).eq('page', PAGE_KEY);
        allSettings[PAGE_KEY] = { ...(allSettings[PAGE_KEY]||{}), message: msg };
        const cm = document.getElementById('mnt-cusmsg');
        if (cm) cm.textContent = msg ? `"${msg}"` : '';
        svd.textContent = '✓ Saved'; clearTimeout(svd._t); svd._t = setTimeout(()=>svd.textContent='', 2000);
      } catch(e) { alert('Error: '+e.message); }
    });

    document.getElementById('mnt-aplogout').addEventListener('click', async () => {
      await sb.auth.signOut(); isAdmin = false;
      document.getElementById('mnt-abtn')?.remove();
      document.getElementById('mnt-apnl')?.remove();
    });
  }

  /* ── LOGIN ── */
  window.MNT = {
    showLogin() {
      if (isAdmin) { showAdminBtn(); togglePanel(); return; }
      const wrap = document.createElement('div');
      wrap.id = 'mnt-logwrap';
      wrap.innerHTML = `<div class="mnt-loginbox">
        <div class="mnt-loginttl">Maintenance Login</div>
        <input class="mnt-inp" id="mnt-le" type="email" placeholder="Admin email" autocomplete="email">
        <input class="mnt-inp" id="mnt-lp" type="password" placeholder="Password" autocomplete="current-password">
        <div class="mnt-loginerr" id="mnt-lerr"></div>
        <button class="mnt-apbtn" id="mnt-lsub">Sign In</button>
        <button class="mnt-apbtn ghost" id="mnt-lcan">Cancel</button>
      </div>`;
      document.body.appendChild(wrap);
      wrap.querySelector('#mnt-lcan').addEventListener('click', () => wrap.remove());
      wrap.querySelector('#mnt-lsub').addEventListener('click', async () => {
        const email = wrap.querySelector('#mnt-le').value.trim();
        const pass  = wrap.querySelector('#mnt-lp').value;
        const err   = wrap.querySelector('#mnt-lerr');
        const btn   = wrap.querySelector('#mnt-lsub');
        btn.textContent = 'Signing in…'; btn.disabled = true;
        try {
          const { error } = await sb.auth.signInWithPassword({ email, password: pass });
          if (error) throw error;
          isAdmin = true; wrap.remove();
          await check(); showAdminBtn(); togglePanel();
        } catch(e) {
          err.textContent = e.message || 'Invalid credentials';
          btn.textContent = 'Sign In'; btn.disabled = false;
        }
      });
    }
  };

  /* ── TRIPLE-TAP LOGO → LOGIN ── */
  function attachTripleTap() {
    let taps = 0, timer;
    document.querySelectorAll('.brand, .logo-link, .footer-brand, header .brand').forEach(el => {
      el.addEventListener('click', () => {
        taps++; clearTimeout(timer);
        if (taps >= 3) { taps = 0; window.MNT.showLogin(); }
        timer = setTimeout(() => taps = 0, 800);
      });
    });
  }

  /* ── BOOT ── */
  function boot() {
    if (!initSB()) { setTimeout(boot, 100); return; }
    check();
    attachTripleTap();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();