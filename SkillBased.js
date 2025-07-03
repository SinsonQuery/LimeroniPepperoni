(function() {

  const humiliateNames = ['dumb', 'i failed to hack you', 'loser', 'slow', 'pooperoni', 'fatstack', 'dung eater', 'daddys girl', 'daddys boy', 'dump truck', 'public stool', 'isaacs toilet', 'heihos seat', 'heihos lover', 'isaacool fan', 'dumbass', 'lonely', 'creep', 'toilet licker', 'shit ass', 'i love you', 'touch me', 'racist', 'soyboy', 'logan'];
  const humiliateTexts = ['i pooped my pants', 'my wee wee small', 'hack failed. scanning brain.... 0% intelligence found.', 'my asshole burns', 'be patient, i have down syndrome', 'i have a crush on you', 'sometimes i feel like theres a little girl in me', 'sometimes when im lonely i put my dick on bologne', 'i want you so baddd...', 'hitler did nothing wrong', 'add me on discord and send me nudes'];

  const style = document.createElement('style');
  style.innerHTML = `

    .gi-flash, .gi-red-flash { position: fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; animation:gi-flash 0.5s ease-out; }
    .gi-flash { background: rgba(0,255,0,0.5); }
    .gi-red-flash { background: rgba(255,0,0,0.5); }
    @keyframes gi-flash { 0% { opacity:1; } 100%{ opacity:0; } }

    .gi-glitch { position:fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.95); z-index:10000; }
    .dialogue { position:fixed; top:40%; width:100%; text-align:center; color:#f00; font-size:32px; font-family:sans-serif; z-index:10001; white-space:pre; animation:twitch 0.1s infinite alternate; }
    @keyframes twitch { from{transform:translate(0,0);} to{transform:translate(2px,-2px);} }

    .gi-interface { position:absolute; background:#111; border:2px solid #0f0; box-shadow:0 0 10px #0f0; border-radius:8px; }
    .gi-header { background:#000; color:#0f0; cursor:grab; padding:5px; display:flex; justify-content:space-between; user-select:none; }
    .gi-close { cursor:pointer; color:#f00; }
    .gi-body { padding:10px; color:#0f0; font-family:sans-serif; }
    .gi-button { margin:5px 0; padding:5px; background:#0f0; color:#000; cursor:pointer; text-align:center; }
    .gi-input { width:100%; padding:5px; background:#222; color:#0f0; border:1px solid #0f0; }

    .qte-overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; overflow:hidden; }
    .qte-char { position:absolute; font-size:32px; color:#fff; }
    .fail-line { position:absolute; top:0; left:0; width:2px; height:100%; background:red; z-index:10000; }

    .wheel-overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:10003; display:flex; align-items:center; justify-content:center; }
    .wheel { position:relative; width:300px; height:300px; }
    .wheel-canvas { background:#fff; border-radius:50%; }
    .wheel-pointer { position:absolute; top:50%; left:-20px; width:0; height:0; border-top:10px solid transparent; border-bottom:10px solid transparent; border-left:15px solid #f00; transform:translateY(-50%); z-index:10004; }

    .cooldown-timer { position:fixed; top:10px; left:50%; transform:translateX(-50%); color:#f00; font-family:sans-serif; font-size:24px; z-index:10004; }
  `;
  document.head.appendChild(style);

  let interfaces = [];
  const origPos = { x:50, y:50 };
  let gravityOn = false;
  const gravityVal = 800;
  const gravity = 0.5, restitution = 0.7, damping = 0.99, rotStab = 0.02;
  const floorBuffer = 5;
  let menuCooldown = false;
  let isTranslating = false;
  let isSpinning = false;
  let hasSpun = false;

  function flash(type='green') {
    const f = document.createElement('div');
    f.className = type==='red'?'gi-red-flash':'gi-flash';
    document.body.appendChild(f);
    f.addEventListener('animationend', ()=>f.remove());
    if(type==='green') ig.game.sounds.environment_lightning_1.play();
  }

  function destroyAll() { interfaces.forEach(s=>s.el.remove()); interfaces=[]; flash(); }
  function destroyInterface(state){ if(!state) return; state.el.remove(); interfaces=interfaces.filter(s=>s!==state); }
  function getInterfaceByTitle(title){ return interfaces.find(i=>i.title===title); }

  function typeDialogue(text, cb){
    const dlg = document.createElement('div'); dlg.className='dialogue'; document.body.appendChild(dlg);
    let i=0;
    (function typeChar(){ if(i<text.length){ dlg.textContent+=text[i++]; setTimeout(typeChar,50+Math.random()*50);} else setTimeout(()=>{dlg.remove();cb();},500);}());
  }

  function createDeathDialog(){
    const fog = document.createElement('div'); fog.className='gi-glitch'; document.body.appendChild(fog);
    typeDialogue('Now.. you get to taste death.', ()=>{
      fog.remove(); flash('red'); ig.game.O4269.kill(); setTimeout(()=>location.reload(),5000);
    });
  }

  function slowTypeMulti(texts) {
    let idx=0, ci=0, lineCount=0;
    function nextChar(){
      if(idx<texts.length){
        const txt=texts[idx];
        const c=txt.charAt(ci);
        ig.game.O884.say('_s'+c);
        ci++; lineCount++;
        if(lineCount>20&&(c===' '||c==='~')){ ig.game.O884.say('_nl'); lineCount=0; }
        if(ci>=txt.length){ idx++; ci=0; }
       setTimeout(nextChar, 50 + Math.random() * 19 + 1);
       }
    }
    nextChar();
  }

  function startQTE(cb){
    hasSpun=false;
    const overlay=document.createElement('div'); overlay.className='qte-overlay'; document.body.appendChild(overlay);
    const line=document.createElement('div'); line.className='fail-line'; overlay.appendChild(line);
    const total=15; let count=0;
    const chars='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const diff=[{speed:3000,int:500},{speed:2000,int:400},{speed:1000,int:300}][Math.floor(Math.random()*3)];
    const spawned=[];
    for(let i=0;i<total;i++){
      setTimeout(()=>{
        const ch=chars.charAt(Math.floor(Math.random()*chars.length));
        const span=document.createElement('div');
        span.textContent=ch; span.className='qte-char'; span.style.top=`${10+Math.floor(i/5)*30}%`; span.style.left='100%';
        overlay.appendChild(span); spawned.push(span);
        setTimeout(()=>{ span.style.transition=`left ${diff.speed}ms linear`; span.style.left='-50px'; },50);
        span.failTimer=setTimeout(()=>{ end(false); }, diff.speed+50);
        span.fall=()=>{ clearTimeout(span.failTimer); span.style.transition='top 0.7s, opacity 0.7s'; span.style.top='110%'; span.style.opacity=0; setTimeout(()=>span.remove(),1000); };
      }, i*diff.int);
    }
    function keyHandler(e){ const next=spawned.find(s=>!s.dataset.done); if(!next) return; if(e.key.toUpperCase()===next.textContent){ next.dataset.done=1; next.fall(); count++; if(count>=total) end(true); } else end(false); }
    function end(success){ document.removeEventListener('keydown',keyHandler); overlay.remove(); spawned.forEach(s=>clearTimeout(s.failTimer)); if(!success && !hasSpun){ hasSpun=true; typeDialogue('YOU FAILED', spinWheel); createCooldown(); } if(success) cb(); }
    document.addEventListener('keydown',keyHandler);
  }
  function spinWheel(){
    if(isSpinning) return;
    isSpinning = true;
    document.querySelector('.wheel-overlay')?.remove();
    const overlay = document.createElement('div');
    overlay.className = 'wheel-overlay';
    document.body.appendChild(overlay);

    const wheelDiv = document.createElement('div');
    wheelDiv.className = 'wheel';
    overlay.appendChild(wheelDiv);

    const canvas = document.createElement('canvas');
    canvas.className = 'wheel-canvas';
    canvas.width = 300;
    canvas.height = 300;
    wheelDiv.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const cx = 150, cy = 150, r = 140;
    const segments = ['Translate','Death','Humiliate'];
    const n = segments.length;

    ctx.clearRect(0, 0, 300, 300);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2*Math.PI);
    ctx.fill();

    ctx.strokeStyle = '#000';
    for (let i = 0; i < n; i++) {
      const ang = i * 2*Math.PI/n;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(ang)*r, cy + Math.sin(ang)*r);
      ctx.stroke();
    }

    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.font = '16px sans-serif';
    for (let i = 0; i < n; i++) {
      const mid = i * 2*Math.PI/n + Math.PI/n;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(mid);
      ctx.fillText(segments[i], r - 50, 0);
      ctx.restore();
    }

    const ptr = document.createElement('div');
    ptr.className = 'wheel-pointer';
    wheelDiv.appendChild(ptr);

    const choice = Math.floor(Math.random() * n);
    const angle = 360*3 + (choice*360/n + 180/n);
    canvas.style.transition = 'transform 3s ease-out';
    canvas.style.transformOrigin = '150px 150px';
    setTimeout(() => {
      canvas.style.transform = `rotate(${angle}deg)`;
    }, 50);

    canvas.addEventListener('transitionend', function handler() {
      canvas.removeEventListener('transitionend', handler);

      const mid = choice*2*Math.PI/n + Math.PI/n;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(mid);
      ctx.fillStyle = 'rgba(255,0,0,0.3)';
      ctx.beginPath();
      ctx.moveTo(0,0);
      ctx.arc(0,0,r,-Math.PI/n,Math.PI/n);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      setTimeout(() => {
        overlay.remove();
        isSpinning = false;
        if (choice === 0) {
          translateMenu();
        } else if (choice === 1) {
          createDeathDialog();
        } else {
          const name = humiliateNames[Math.floor(Math.random()*humiliateNames.length)];
          ig.game.O4269.screenName = name;
          ig.game.O4349.O2137(name);
          slowTypeMulti([humiliateTexts[Math.floor(Math.random()*humiliateTexts.length)]]);
        }
      }, 500);
    });
  }

  async function translateMenu() {
    if (menuCooldown) return;
    isTranslating = true;
    const elements = [...document.querySelectorAll('.gi-header span, .gi-button, .gi-input')];
    const originals = elements.map(el => el.textContent);
    const translations = await Promise.all(elements.map(el =>
      fetch(`https:
        .then(res => res.json())
        .then(data => data[0].map(p => p[0]).join(''))
    ));
    elements.forEach((el, i) => el.textContent = translations[i]);

    const timerDiv = document.createElement('div');
    timerDiv.className = 'cooldown-timer';
    document.body.appendChild(timerDiv);
    let t = 120;
    timerDiv.textContent = `Translation time: ${t}s`;
    const iv = setInterval(() => {
      t--;
      if (t <= 0) {
        clearInterval(iv);
        timerDiv.remove();
        elements.forEach((el, i) => el.textContent = originals[i]);
        isTranslating = false;
      } else {
        timerDiv.textContent = `Translation time: ${t}s`;
      }
    }, 1000);
    menuCooldown = true;
    setTimeout(() => { menuCooldown = false; }, 120000);
  }

  function createCooldown() {
    menuCooldown = true;
    const timer = document.createElement('div');
    timer.className = 'cooldown-timer';
    document.body.appendChild(timer);
    let c = 5;
    timer.textContent = `Cooldown: ${c}`;
    const iv = setInterval(() => {
      c--;
      if (c <= 0) {
        clearInterval(iv);
        timer.remove();
        menuCooldown = false;
      } else {
        timer.textContent = `Cooldown: ${c}`;
      }
    }, 1000);
  }

  function createInterface() {
    if (menuCooldown) return;
    destroyAll();
    const {el} = createWindow('LIMERONIS GODINTERFACE', origPos.x, origPos.y, 300, 250);
    const body = el.querySelector('.gi-body');
    ['MORPH','TELEPORT','EQUIP','GRAVITY'].forEach(txt => {
      const fn = { MORPH: spawnMorph, TELEPORT: spawnTeleport, EQUIP: spawnEquip, GRAVITY: toggleGravity }[txt];
      createButton(txt, fn, body);
    });
    flash();
  }

   function createButton(txt, fn, container) {
    const btn = document.createElement('div');
    btn.className = 'gi-button';
    btn.textContent = txt;
    if (isTranslating) {

      fetch(`https:
        .then(res => res.json())
        .then(data => {
          btn.textContent = data[0].map(p => p[0]).join('');
        });
    }
    btn.addEventListener('click', fn);
    container.appendChild(btn);
  }

  function spawnMorph() {
    const ex = getInterfaceByTitle('MORPH PLAYERS');
    if (ex) { destroyInterface(ex); return; }
    const players = ig.game.O413.player.slice(1);
    const { el, state } = createWindow('MORPH PLAYERS',
      origPos.x + 20, origPos.y + 20,
      300, Math.min(players.length * 40 + 60, window.innerHeight - origPos.y - 20),
      true
    );
    const body = el.querySelector('.gi-body');

    createButton('RESTORE', () => {
      if (state.original) {
        ig.game.O4349.O2137(state.original.screenName);
        ig.game.O4269.screenName = state.original.screenName;
        ig.game.O7510.O4416(ig.game.O4269, ig.game.O7510.slots.BODY, state.original.id, null, 'STACKWEARB');
      }
    }, body);

    players.forEach(p => {
      createButton(p.screenName, () => {
        startQTE(() => {
          const key = p.O2507?.toLowerCase();
          if (['663b68152e9a99760000008c','66142bb0108c291a00000027'].includes(key)) {
            return createDeathDialog();
          }

          state.original = {
            screenName: ig.game.O4269.screenName,
            id: ig.game.O4269.attachments.b.id
          };
          ig.game.O4349.O2137(p.screenName);

          ig.game.O7510.O4416(ig.game.O4269, ig.game.O7510.slots.BODY, p.attachments.b.id, null, 'STACKWEARB');
        });
      }, body);
    });

    flash();
  }

  function spawnTeleport() {
    const ex = getInterfaceByTitle('TELEPORT PLAYERS');
    if (ex) { destroyInterface(ex); return; }
    const players = ig.game.O413.player.slice(1);
    const { el } = createWindow('TELEPORT PLAYERS',
      origPos.x + 20, origPos.y + 20,
      300, Math.min(players.length * 40 + 40, window.innerHeight - origPos.y - 20),
      true
    );
    const body = el.querySelector('.gi-body');

    players.forEach(p => {
      createButton(p.screenName, () => {
        if (p.pos) {
          ig.game.O4269.pos.x = p.pos.x;
          ig.game.O4269.pos.y = p.pos.y;
        }
      }, body);
    });

    flash();
  }

  function spawnEquip() {
    const ex = getInterfaceByTitle('EQUIP ID');
    if (ex) { destroyInterface(ex); return; }
    const { el } = createWindow('EQUIP ID',
      origPos.x + 20, origPos.y + 20, 300, 120, false
    );
    const body = el.querySelector('.gi-body');
    const input = document.createElement('input');
    input.className = 'gi-input';
    input.placeholder = 'Enter attachment ID';
    body.appendChild(input);

    createButton('EQUIP', () => {
      const id = input.value.trim();
      if (id) {
        ig.game.O7510.O4416(ig.game.O4269, ig.game.O7510.slots.BODY, id, null, 'STACKWEARB');
      }
    }, body);

    flash();
  }

  function toggleGravity() {
    gravityOn = !gravityOn;
    ig.game.gravity = gravityOn ? 0 : gravityVal;
    this.classList.toggle('active', gravityOn);
    flash();
  }
  function createWindow(title, x, y, w, h = 200, scroll = false) {
    const existing = getInterfaceByTitle(title);
    if (existing) return existing;
    const el = document.createElement('div');
    el.className = 'gi-interface';
    el.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px;`;
    const hdr = document.createElement('div');
    hdr.className = 'gi-header';
    hdr.innerHTML = `<span>${title}</span><span class="gi-close">X</span>`;
    el.appendChild(hdr);
    const body = document.createElement('div');
    body.className = 'gi-body';
    if (!scroll) body.style.maxHeight = (h - 30) + 'px';
    el.appendChild(body);
    document.body.appendChild(el);

    const state = { title, el, x, y, w, h, vx:0, vy:0, angle:0, av:0, dragging:false, offsetX:0, offsetY:0 };
    interfaces.push(state);

    hdr.addEventListener('mousedown', e => startDrag(state, e));
    document.addEventListener('mousemove', e => drag(state, e));
    document.addEventListener('mouseup', () => endDrag(state));
    hdr.querySelector('.gi-close').addEventListener('click', () => destroyInterface(state));

    return { el, state };
  }

  function startDrag(s, e) {
    s.dragging = true;
    s.offsetX = e.clientX - s.x;
    s.offsetY = e.clientY - s.y;
    s.vx = s.vy = s.av = 0;
  }

  function drag(s, e) {
    if (!s.dragging) return;
    const nx = e.clientX - s.offsetX;
    const ny = e.clientY - s.offsetY;
    s.vx = nx - s.x;
    s.vy = ny - s.y;
    s.x = nx; s.y = ny;
    s.el.style.left = s.x + 'px';
    s.el.style.top = s.y + 'px';
  }

  function endDrag(s) {
    s.dragging = false;
  }

  function update() {
    const iw = window.innerWidth;
    const ih = window.innerHeight - floorBuffer;
    interfaces.forEach(s => {
      if (s.dragging) return;
      s.vy += gravity;
      s.x += s.vx;
      s.y += s.vy;
      if (s.x < 0) { s.x = 0; s.vx = -s.vx * restitution; }
      if (s.x + s.w > iw) { s.x = iw - s.w; s.vx = -s.vx * restitution; }
      if (s.y < 0) { s.y = 0; s.vy = -s.vy * restitution; }
      if (s.y + s.h >= ih) { s.y = ih - s.h; s.vy = -s.vy * restitution; s.av *= rotStab; }
      s.vx *= damping; s.vy *= damping;
      s.el.style.left = s.x + 'px';
      s.el.style.top = s.y + 'px';
      s.el.style.transform = `rotate(${s.angle}deg)`;
    });
    requestAnimationFrame(update);
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'F2') createInterface();
    if (e.ctrlKey && e.key.toLowerCase() === 'g') toggleGravity();
  });

  update();
})();
