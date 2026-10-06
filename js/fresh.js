/* Freshly site — shared pieces: SVG builders, page chrome, the box, interactive type and the logo build. */
(() => {
  const A = window.FRESHLY_ASSETS;
  const NS = 'http://www.w3.org/2000/svg';
  // ?still freezes every animation on its finished frame (used for screenshots and review)
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]still\b/.test(location.search);
  let uid = 0;

  const setAttrs = (el, attrs) => {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined || v === false) continue;
      if (k === 'text') el.textContent = v;
      else if (k === 'style' && typeof v === 'object') { for (const [p, val] of Object.entries(v)) p.startsWith('--') ? el.style.setProperty(p, val) : (el.style[p] = val); }
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    return el;
  };
  const h = (tag, attrs = {}, ...kids) => { const el = setAttrs(document.createElement(tag), attrs); el.append(...kids.flat().filter(k => k !== null && k !== undefined && k !== false)); return el; };
  const s = (tag, attrs = {}, ...kids) => { const el = setAttrs(document.createElementNS(NS, tag), attrs); el.append(...kids.flat().filter(Boolean)); return el; };

  /* ---------- catalogue ---------- */
  // color = the icon's own color on a light ground; onDeep = what it flips to on Deep Kale; juice = its layer in the glass
  const PRODUCE = {
    apple:      { label: 'Apple',      color: 'beet',      onDeep: 'beet',   juice: 'blossom',   cal: 50, fiber: 2.4 },
    orange:     { label: 'Orange',     color: 'carrot',    onDeep: 'carrot', juice: 'carrot',    cal: 45, fiber: 2.3 },
    lemon:      { label: 'Lemon',      color: 'lemon',     onDeep: 'lemon',  juice: 'lemon',     cal: 10, fiber: 0.8 },
    blueberry:  { label: 'Blueberry',  color: 'blueberry', onDeep: 'oat',    juice: 'blueberry', cal: 40, fiber: 1.8 },
    carrot:     { label: 'Carrot',     color: 'carrot',    onDeep: 'carrot', juice: 'carrot',    cal: 25, fiber: 1.7 },
    beet:       { label: 'Beet',       color: 'beet',      onDeep: 'beet',   juice: 'beet',      cal: 30, fiber: 1.9 },
    strawberry: { label: 'Strawberry', color: 'beet',      onDeep: 'beet',   juice: 'milk',      cal: 25, fiber: 1.5 },
    kale:       { label: 'Kale',       color: 'deep',      onDeep: 'oat',    juice: 'kale',      cal: 15, fiber: 1.3 },
    cucumber:   { label: 'Cucumber',   color: 'kale',      onDeep: 'kale',   juice: 'cucumber',  cal: 8,  fiber: 0.4 },
  };
  const KITS = [
    { id: 'lemon-cucumber',   name: 'Lemon + Cucumber',   hero: 'lemon',      also: ['cucumber', 'apple'],     bg: 'lemon',     ink: 'deep', block: 'deep',   cal: 170, fiber: 6, protein: 4, carbs: 36, tags: ['citrus', 'greens', 'light'], desc: 'Cucumber, Meyer lemon, green apple and mint.' },
    { id: 'carrot-orange',    name: 'Carrot + Orange',    hero: 'carrot',     also: ['orange', 'lemon'],       bg: 'carrot',    ink: 'oat',  block: 'oat',    cal: 190, fiber: 5, protein: 3, carbs: 42, tags: ['citrus', 'roots'],           desc: 'Carrot, blood orange, mango and turmeric.' },
    { id: 'beet-strawberry',  name: 'Beet + Strawberry',  hero: 'beet',       also: ['strawberry', 'apple'],   bg: 'beet',      ink: 'oat',  block: 'oat',    cal: 180, fiber: 8, protein: 4, carbs: 38, tags: ['berry', 'roots'],            desc: 'Beet, strawberry, raspberry and chia.' },
    { id: 'kale-apple',       name: 'Kale + Apple',       hero: 'kale',       also: ['apple', 'cucumber'],     bg: 'kale',      ink: 'oat',  block: 'oat',    cal: 160, fiber: 7, protein: 4, carbs: 34, tags: ['greens', 'light'],           desc: 'Lacinato kale, green apple, banana and ginger.' },
    { id: 'blueberry-lemon',  name: 'Blueberry + Lemon',  hero: 'blueberry',  also: ['lemon', 'apple'],        bg: 'blueberry', ink: 'oat',  block: 'oat',    cal: 175, fiber: 6, protein: 5, carbs: 35, tags: ['berry', 'citrus', 'light'],  desc: 'Wild blueberry, lemon, banana and oats.' },
    { id: 'strawberry-apple', name: 'Strawberry + Apple', hero: 'strawberry', also: ['apple', 'beet'],         bg: 'milk',      ink: 'deep', block: 'beet',   cal: 165, fiber: 5, protein: 3, carbs: 37, tags: ['berry', 'light'],            desc: 'Strawberry, pink apple, banana and vanilla.' },
    { id: 'orange-lemon',     name: 'Orange + Lemon',     hero: 'orange',     also: ['lemon', 'carrot'],       bg: 'cucumber',  ink: 'deep', block: 'carrot', cal: 150, fiber: 4, protein: 2, carbs: 35, tags: ['citrus', 'light'],           desc: 'Navel orange, lemon, pineapple and ginger.' },
    { id: 'cucumber-kale',    name: 'Cucumber + Kale',    hero: 'cucumber',   also: ['kale', 'lemon'],         bg: 'blossom',   ink: 'deep', block: 'kale',   cal: 140, fiber: 6, protein: 3, carbs: 29, tags: ['greens', 'light'],           desc: 'Cucumber, kale, celery and lime.' },
  ];
  const PRICE = { 6: 7.5, 12: 6.5, 24: 5.75 };
  const tok = name => `var(--${name})`;
  const money = n => '$' + n.toFixed(2);

  /* ---------- SVG builders ---------- */
  function wordmark(opts = {}) {
    const W = A.wordmark;
    const svg = s('svg', { class: 'wm' + (opts.class ? ' ' + opts.class : ''), viewBox: `0 0 ${W.w} ${W.h}`, role: 'img', 'aria-label': 'Freshly' });
    for (const L of W.letters) {
      const g = s('g', { class: 'wm-l', 'data-ch': L.ch }, s('path', { class: 'wm-body', d: L.d }));
      if (opts.cut !== false) for (const c of L.cuts) g.append(s('path', { class: 'wm-cut', d: c.d }));
      svg.append(g);
    }
    return svg;
  }
  function symbol(opts = {}) {
    const S = A.symbol;
    const svg = s('svg', { class: 'sym' + (opts.class ? ' ' + opts.class : ''), viewBox: `0 0 ${S.w} ${S.h}`, role: 'img', 'aria-label': 'Freshly halved orange' });
    const leaf = s('g', { class: 'sym-leaf-g', style: { transformOrigin: `${S.leafBase[0]}px ${S.leafBase[1]}px` } }, s('path', { class: 'sym-leaf', d: S.leaf }));
    const dome = s('g', { class: 'sym-dome', style: { transformOrigin: `24px ${S.cutTop}px` } }, s('path', { class: 'sym-orange', d: S.dome }));
    const bowl = s('g', { class: 'sym-bowl' }, s('path', { class: 'sym-orange', d: S.bowl }));
    svg.append(bowl, dome, leaf);
    return svg;
  }
  function icon(name, opts = {}) {
    const B = A.blocks[name]; if (!B) throw new Error('no icon ' + name);
    const mid = (B.cut[0] + B.cut[1]) / 2, id = 'ic' + (++uid);
    const svg = s('svg', { class: 'icon' + (opts.class ? ' ' + opts.class : ''), viewBox: '0 0 240 240', 'aria-hidden': 'true' },
      s('defs', {},
        s('clipPath', { id: id + 't' }, s('rect', { x: -60, y: -60, width: 360, height: mid + 60 })),
        s('clipPath', { id: id + 'b' }, s('rect', { x: -60, y: mid, width: 360, height: 300 - mid }))),
      s('g', { class: 'ico-bot' }, s('g', { 'clip-path': `url(#${id}b)` }, s('path', { d: B.d }))),
      s('g', { class: 'ico-top', style: { transformOrigin: `36px ${mid}px` } }, s('g', { 'clip-path': `url(#${id}t)` }, s('path', { d: B.d }))));
    return svg;
  }
  const arrow = (dir = 'down') => s('svg', { class: 'arrow ' + dir, viewBox: `0 0 ${A.arrow.w} ${A.arrow.h}`, 'aria-hidden': 'true' }, s('path', { d: A.arrow.d }));
  function doodle(name) {
    const svg = s('svg', { class: 'doodle', viewBox: '0 0 240 240', 'aria-hidden': 'true' });
    svg.innerHTML = A.doodles[name] || '';
    return svg;
  }
  const echo = () => s('svg', { class: 'echo', viewBox: `0 0 ${A.echo.w} ${A.echo.h}`, role: 'img', 'aria-label': 'Freshly' }, s('path', { d: A.echo.d }));
  const mono = () => s('svg', { class: 'mono', viewBox: `0 0 ${A.mono.w} ${A.mono.h}`, 'aria-hidden': 'true' }, s('path', { d: A.mono.d, fill: 'currentColor' }));

  /* ---------- the box (kept in this browser only) ---------- */
  const Box = (() => {
    const KEY = 'freshly-box';
    let state = { size: 12, items: {} };
    try { const v = JSON.parse(localStorage.getItem(KEY)); if (v && v.items && PRICE[v.size]) state = v; } catch (e) { /* storage unavailable: start empty */ }
    const count = () => Object.values(state.items).reduce((a, b) => a + b, 0);
    const emit = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } document.dispatchEvent(new CustomEvent('box:change')); };
    return {
      get size() { return state.size; },
      set size(n) { if (PRICE[n]) { state.size = n; emit(); } },
      qty: id => state.items[id] || 0,
      count,
      room: () => Math.max(0, state.size - count()),
      set(id, n) {
        n = Math.max(0, Math.min(n, (state.items[id] || 0) + Math.max(0, state.size - count())));
        if (n) state.items[id] = n; else delete state.items[id];
        emit();
      },
      list: () => Object.entries(state.items).flatMap(([id, n]) => Array(n).fill(id)),
      each: () => PRICE[state.size],
      total: () => count() * PRICE[state.size],
      clear() { state.items = {}; emit(); },
    };
  })();

  /* ---------- page chrome ---------- */
  function chrome(current) {
    const link = (href, label, cls) => h('a', { href, class: cls, 'aria-current': current === href ? 'page' : null, text: label });
    const pill = h('a', { class: 'box-pill', href: 'menu.html#box', 'aria-label': 'Your box' }, 'Box', h('span', { class: 'n', text: '0' }));
    const head = h('header', { class: 'site-head' },
      h('a', { class: 'brand', href: 'index.html', 'aria-label': 'Freshly home' }, wordmark()),
      h('nav', { 'aria-label': 'Main' }, link('menu.html', 'Kits'), link('about.html', 'About'), pill));
    /* said up front on every page, not only in the footer: this is concept work, not the real company */
    const note = h('p', { class: 'concept-note', role: 'note' }, h('span', { text: 'Concept project by Jennie Kwon' }), h('span', { text: 'Not affiliated with Freshly or Nestlé' }));
    document.body.prepend(note, head);
    const sync = () => { const n = pill.querySelector('.n'); const c = Box.count(); if (n.textContent !== String(c)) { n.textContent = c; pill.classList.remove('bump'); void pill.offsetWidth; pill.classList.add('bump'); } };
    document.addEventListener('box:change', sync); sync(); pill.classList.remove('bump');

    // the footer signs off with the echo: its slats spring out of the wordmark when it scrolls into view, and when a pointer arrives
    const sign = echoMotion();
    const stage = h('div', { class: 'echo-stage', role: 'img', 'aria-label': 'Freshly' }, sign.svg);
    stage.addEventListener('pointerenter', e => { if (e.pointerType !== 'touch') sign.play(); });
    const foot = h('footer', { class: 'site-foot on-deep' },
      h('div', { class: 'wrap' }, stage),
      h('div', { class: 'wrap foot-grid' },
        h('div', {}, h('p', { class: 'eyebrow', text: 'Picked. Packed. Blended.' }),
          h('p', { class: 'fine', text: 'A speculative rebrand and concept website by Jennie Kwon, 2026. A student project. It is not affiliated with Freshly or Nestlé, nothing here is for sale and no orders are placed.' })),
        h('nav', { 'aria-label': 'Footer' }, link('index.html', 'Home'), link('menu.html', 'Kits'), link('about.html', 'About'))));
    document.body.append(foot);
    firstView(stage, sign.play);
  }


  /* ---------- kit card (home teaser + menu) ---------- */
  function stepper(kit) {
    const out = h('output', { text: '0', 'aria-live': 'polite' });
    const minus = h('button', { type: 'button', 'aria-label': `Remove one ${kit.name}`, text: '−', onclick: () => Box.set(kit.id, Box.qty(kit.id) - 1) });
    const plus = h('button', { type: 'button', 'aria-label': `Add one ${kit.name}`, text: '+', onclick: () => { if (!Box.room()) return toast('Your box is full. Pick a bigger box or swap a kit.'); Box.set(kit.id, Box.qty(kit.id) + 1); } });
    const step = h('div', { class: 'stepper' }, minus, out, plus);
    const add = h('button', { class: 'add', type: 'button', text: 'Add to box', onclick: () => plus.click() });
    const wrap = h('div', {}, add, step);
    const sync = () => { const q = Box.qty(kit.id); out.textContent = q; step.hidden = !q; add.hidden = !!q; };
    document.addEventListener('box:change', sync); sync();
    return wrap;
  }
  function kitCard(kit, { onOpen, teaser } = {}) {
    const open = teaser
      ? h('a', { class: 'open cuttable', href: `menu.html#kit-${kit.id}` })
      : h('button', { class: 'open cuttable', type: 'button', 'aria-haspopup': 'dialog', onclick: () => onOpen && onOpen(kit) });
    open.append(h('h3', { text: kit.name }), h('p', { class: 'desc', text: kit.desc }), icon(kit.hero, { class: 'hero-ico' }));
    return h('article', { class: 'kit', id: `kit-${kit.id}`, 'data-tags': kit.tags.join(' '), style: { '--kc': tok(kit.bg), '--ki': tok(kit.ink), '--kb': tok(kit.block) } },
      h('div', { class: 'lid' }, wordmark(), h('span', { text: 'Picked ripe · Frozen fast' })),
      open,
      h('div', { class: 'foot' }, h('span', { class: 'meta', text: `${kit.cal} cal · ${kit.fiber} g fiber` }), teaser ? h('a', { class: 'add', href: `menu.html#kit-${kit.id}`, style: { textDecoration: 'none' }, text: 'See kit' }) : stepper(kit)));
  }

  let toastEl, toastT;
  function toast(msg) {
    if (!toastEl) { toastEl = h('div', { class: 'toast', role: 'status', 'aria-live': 'polite' }); document.body.append(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), 1900);
  }

  /* ---------- interactive type ---------- */
  // Weight wave: every character's weight swells toward the pointer (Parkinsans is a variable font, 300–800).
  // The heading pours in once when it first shows, light to heavy; after that it only works while a pointer is over
  // its section. Each character keeps a fixed-width box, so a weight change repaints that letter and nothing else
  // moves, and positions are measured once per pointer visit instead of on every frame.
  function weightWave(el, { rest = 700, peak = 800, low = 300 } = {}) {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.textContent = ''; el.classList.add('wave');
    const chars = [];
    words.forEach((w, wi) => {
      const word = h('span', { style: { display: 'inline-block', whiteSpace: 'nowrap' }, 'aria-hidden': 'true' });
      for (const c of w) { const ch = h('span', { class: 'ch', text: c }); word.append(ch); chars.push(ch); }
      el.append(word); if (wi < words.length - 1) el.append(' ');   // a real space, so lines wrap and never start indented
    });
    if (reduce) return;
    const cur = chars.map(() => low), goal = chars.map(() => low);
    let raf = 0, spots = null, box = null, pointer = null, locked = false;
    const write = i => chars[i].style.setProperty('--w', Math.round(cur[i]));
    chars.forEach((ch, i) => write(i));                        // starts light, then pours in
    const frame = () => {
      raf = 0;
      if (pointer) {
        if (!spots) {
          spots = chars.map(ch => { const r = ch.getBoundingClientRect(); return [r.left + r.width / 2 + scrollX, r.top + r.height / 2 + scrollY, Math.max(200, r.height * 2.6)]; });
          const r = el.getBoundingClientRect(); box = [r.left + scrollX, r.top + scrollY, r.right + scrollX, r.bottom + scrollY, Math.max(60, spots[0][2] * 0.5)];
        }
        // the effect fades out as the pointer moves away from the heading, so the heading rests while the rest of the section is used
        const away = Math.hypot(Math.max(box[0] - pointer[0], 0, pointer[0] - box[2]), Math.max(box[1] - pointer[1], 0, pointer[1] - box[3]));
        const near = Math.max(0, 1 - away / box[4]);
        spots.forEach(([x, y, reach], i) => { const k = Math.max(0, 1 - Math.hypot(x - pointer[0], y - pointer[1]) / reach); goal[i] = rest + (low + (peak - low) * (k * k * (3 - 2 * k)) - rest) * near; });
      }
      let busy = false;
      for (let i = 0; i < chars.length; i++) {
        const d = goal[i] - cur[i];
        if (Math.abs(d) < 1.5) { if (d) { cur[i] = goal[i]; write(i); } continue; }
        cur[i] += d * 0.2; write(i); busy = true;
      }
      if (busy) raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
    // once the real font is in, lock each character's box at its resting width (in em, so it scales with the heading)
    const lock = () => {
      el.classList.add('measuring');
      const fs = parseFloat(getComputedStyle(el).fontSize), ws = chars.map(ch => ch.getBoundingClientRect().width);
      el.classList.remove('measuring');
      chars.forEach((ch, i) => { ch.style.width = (ws[i] / fs).toFixed(4) + 'em'; });
      locked = true; spots = null;
    };
    const fonts = document.fonts ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]) : Promise.resolve();
    fonts.then(() => { lock(); firstView(el, () => chars.forEach((ch, i) => setTimeout(() => { if (!pointer) { goal[i] = rest; kick(); } }, i * 38)), 0.2); });
    const area = el.closest('section') || el;
    area.addEventListener('pointermove', e => { if (e.pointerType === 'touch' || !locked) return; pointer = [e.pageX, e.pageY]; kick(); });
    area.addEventListener('pointerleave', () => { pointer = null; spots = null; goal.fill(rest); kick(); });
    addEventListener('resize', () => { spots = null; });
  }

  // Squishy wordmark: a letter hops like something soft when the pointer arrives on it.
  // The pointer is read from still, invisible boxes laid over the letters, never from the letters themselves:
  // a letter that jumps out from under a resting cursor would "leave" and "enter" it again and again and never settle.
  function squishy(svg, { when = () => true } = {}) {
    if (!window.gsap || reduce) return;
    const letters = [...svg.querySelectorAll('.wm-l')];
    const hop = (g, amt) => {
      const now = performance.now();
      if (amt === 1) { if (now < (g._full || 0)) return; g._full = g._any = now + 450; }   // one full hop at a time
      else { if (now < (g._any || 0)) return; g._any = now + 260; }                           // a nudge never cuts a hop short
      gsap.killTweensOf(g);
      gsap.timeline()
        .to(g, { scaleY: 1 - 0.2 * amt, scaleX: 1 + 0.12 * amt, duration: 0.09, ease: 'power2.out', transformOrigin: '50% 100%' })
        .to(g, { y: -26 * amt, scaleY: 1 + 0.1 * amt, scaleX: 1 - 0.05 * amt, rotation: (Math.random() - 0.5) * 10 * amt, duration: 0.18, ease: 'power2.out' })
        .to(g, { y: 0, scaleX: 1, scaleY: 1, rotation: 0, duration: 0.9, ease: 'elastic.out(1, 0.32)' });
    };
    const hits = s('g', {});
    letters.forEach((g, i) => {
      const b = g.getBBox();
      const hit = s('rect', { x: b.x, y: b.y, width: b.width, height: b.height, fill: 'none', 'pointer-events': 'all' });
      const go = () => { if (!when()) return; hop(g, 1); if (letters[i - 1]) hop(letters[i - 1], 0.35); if (letters[i + 1]) hop(letters[i + 1], 0.35); };
      hit.addEventListener('pointerenter', go); hit.addEventListener('pointerdown', go);
      hits.append(hit);
    });
    letters[0].parentNode.append(hits);
  }

  // Word ticker: one slot, words roll through it.
  function ticker(el, words, every = 1700) {
    el.classList.add('ticker'); el.setAttribute('aria-label', words.join(' '));
    const spans = words.map(w => h('span', { text: w, 'aria-hidden': 'true' }));
    el.replaceChildren(...spans);
    let i = 0; spans[0].classList.add('in');
    if (reduce) return;
    setInterval(() => {
      const cur = spans[i]; i = (i + 1) % spans.length; const next = spans[i];
      cur.classList.remove('in'); cur.classList.add('out');
      next.classList.remove('out'); void next.offsetWidth; next.classList.add('in');
      setTimeout(() => cur.classList.remove('out'), 500);
    }, every);
  }

  // Stacked wordmark rows that drift in opposite directions and speed up with the scroll. They only run while on screen.
  function stackMarquee(el, rows = 3) {
    el.classList.add('stack-marquee');
    const tracks = [];
    for (let r = 0; r < rows; r++) {
      const row = h('div', { class: 'row', 'aria-hidden': r ? 'true' : null });
      for (let i = 0; i < 8; i++) row.append(wordmark());
      el.append(row); tracks.push({ row, x: 0, unit: 0, dir: r % 2 ? 1 : -1 });
    }
    if (reduce) return;
    let lastY = scrollY, vel = 0, last = 0, raf = 0, shown = false;
    const size = () => { for (const t of tracks) t.unit = t.row.scrollWidth / 8; };
    const step = now => {
      raf = 0; if (!shown) return;
      const dt = Math.min(50, now - last); last = now;
      vel += ((scrollY - lastY) - vel) * 0.2; lastY = scrollY;
      for (const t of tracks) {
        t.x += t.dir * (0.045 * dt + Math.abs(vel) * 0.9);
        if (t.x <= -t.unit) t.x += t.unit; if (t.x >= 0) t.x -= t.unit;
        t.row.style.transform = `translate3d(${t.x}px,0,0)`;
      }
      raf = requestAnimationFrame(step);
    };
    addEventListener('resize', size);
    new IntersectionObserver(es => { shown = es[0].isIntersecting; if (shown && !raf) { size(); last = performance.now(); lastY = scrollY; raf = requestAnimationFrame(step); } }).observe(el);
  }

  /* ---------- logo build (after BUCK's Instrumentl mark: the logo assembles from its own gesture) ---------- */
  // The cut is drawn first as one line; the orange and every letter grow out of it; the line retracts and leaves the cuts behind.
  function logoBuild(container, { line = 'var(--lemon)' } = {}) {
    const S = A.symbol, W = A.wordmark, k = 176.4 / S.w, wx = 240, wy = 37;
    const cutY = wy + 81.5, cutH = 13.2;
    const svg = s('svg', { viewBox: `-10 -24 ${wx + W.w + 20} 265`, role: 'img', 'aria-label': 'Freshly' });
    const sym = s('g', { transform: `scale(${k})` });
    const leaf = s('path', { d: S.leaf, fill: 'var(--leaf, var(--kale))' });
    const dome = s('path', { d: S.dome, fill: 'var(--orange, var(--carrot))' });
    const bowl = s('path', { d: S.bowl, fill: 'var(--orange, var(--carrot))' });
    sym.append(bowl, dome, leaf);
    const wm = s('g', { transform: `translate(${wx} ${wy})`, class: 'wm', fill: 'currentColor' });
    const letters = W.letters.map(L => { const g = s('g', { class: 'wm-l' }, s('path', { class: 'wm-body', d: L.d }), ...L.cuts.map(c => s('path', { class: 'wm-cut', d: c.d }))); wm.append(g); return g; });
    const bar = s('rect', { x: -10, y: cutY, width: wx + W.w + 20, height: cutH, rx: cutH / 2, fill: line, opacity: 0, 'pointer-events': 'none' });   // hidden at rest; only the animation shows it
    svg.append(sym, wm, bar);
    container.replaceChildren(svg);
    if (!window.gsap) return { play() {}, svg, letters };
    const cy = cutY / k;                                   // the cut line in the symbol's own units
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'back.out(1.7)' } });
    tl.set(bar, { scaleX: 0, transformOrigin: '0% 50%', opacity: 1 })
      .set(dome, { scaleY: 0, svgOrigin: `${S.w / 2} ${cy}` })
      .set(bowl, { scaleY: 0, svgOrigin: `${S.w / 2} ${cy + cutH / k}` })
      .set(leaf, { scale: 0, rotation: -70, svgOrigin: `${S.leafBase[0]} ${S.leafBase[1]}` })
      .set(letters, { scaleY: 0, transformOrigin: '50% 49%' })
      .to(bar, { scaleX: 1, duration: 0.55, ease: 'power3.inOut' })
      .to(dome, { scaleY: 1, duration: 0.6 }, '>-0.05')
      .to(bowl, { scaleY: 1, duration: 0.6 }, '<0.06')
      .to(leaf, { scale: 1, rotation: 0, duration: 0.7, ease: 'elastic.out(1, 0.45)' }, '<0.22')
      .to(letters, { scaleY: 1, duration: 0.55, stagger: 0.055 }, '<-0.25')
      .set(bar, { transformOrigin: '100% 50%' })
      .to(bar, { scaleX: 0, duration: 0.5, ease: 'power3.inOut' }, '>-0.1')
      .to(letters, { y: -10, duration: 0.14, stagger: 0.03, ease: 'power2.out' }, '<0.1')
      .to(letters, { y: 0, duration: 0.6, stagger: 0.03, ease: 'elastic.out(1, 0.4)' }, '<0.14');
    // The orange answers the pointer too: its lid lifts while a pointer is on it. The pointer is read from a still box.
    const hit = s('rect', { x: 0, y: 0, width: S.w, height: S.h, fill: 'none', 'pointer-events': 'all' }); sym.append(hit);
    hit.addEventListener('pointerenter', e => {
      if (reduce || e.pointerType === 'touch' || tl.isActive()) return;
      gsap.to(dome, { y: -34, rotation: -11, svgOrigin: `24 ${S.cutTop}`, duration: 0.45, ease: 'back.out(2)', overwrite: 'auto' });
      gsap.to(leaf, { y: -48, rotation: -24, svgOrigin: S.leafBase.join(' '), duration: 0.5, ease: 'back.out(2.4)', overwrite: 'auto' });
    });
    hit.addEventListener('pointerleave', () => { if (!reduce && !tl.isActive()) gsap.to([dome, leaf], { y: 0, rotation: 0, duration: 0.6, ease: 'bounce.out', overwrite: 'auto' }); });
    // Never leave the logo blank: with reduced motion, or in a background tab (where frames are paused),
    // show the finished mark and save the animation for when the tab is actually looked at.
    const play = () => {
      if (reduce) return tl.progress(1);
      if (document.hidden) { tl.progress(1); document.addEventListener('visibilitychange', () => { if (!document.hidden) tl.restart(); }, { once: true }); return; }
      tl.restart();
    };
    return { play, tl, svg, letters };
  }

  /* ---------- motion that lives around the site ---------- */
  const inView = (el, enter, leave, threshold = 0.3) => new IntersectionObserver(es => (es[0].isIntersecting ? enter() : leave && leave()), { threshold }).observe(el);
  function firstView(el, fn, threshold = 0.3) { const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); fn(); } }, { threshold }); io.observe(el); }

  // The orange has four moves: cut, blend, pour, deliver. Each is one pass that ends where it began,
  // so a page can chain them or fire one as feedback. The frame (viewBox) decides where "out of sight" is.
  function orange({ viewBox = '-80 -54 400 400' } = {}) {
    const S = A.symbol, spin = `${S.w / 2} ${S.h - S.w / 2}`, HINGE = `24 ${S.cutTop}`, LEAF = S.leafBase.join(' ');
    const [vx, , vw] = viewBox.split(' ').map(Number), off = vx + vw + 20;
    const dome = s('path', { class: 'sym-orange', d: S.dome }), bowl = s('path', { class: 'sym-orange', d: S.bowl }), leaf = s('path', { class: 'sym-leaf', d: S.leaf });
    const all = s('g', {}, bowl, dome, leaf), extra = s('g', {});
    const svg = s('svg', { class: 'sym', viewBox, 'aria-hidden': 'true' }, extra, all);
    const MOVES = {
      cut: () => gsap.timeline()                             // the lid lifts off
        .to(dome, { y: -36, rotation: -12, svgOrigin: HINGE, duration: 0.45, ease: 'back.out(2)' }, 0.05)
        .to(leaf, { y: -50, rotation: -26, svgOrigin: LEAF, duration: 0.5, ease: 'back.out(2.4)' }, '<0.03')
        .to([dome, leaf], { y: 0, rotation: 0, duration: 0.7, ease: 'bounce.out' }, '+=0.5'),
      blend: () => gsap.timeline()                           // two halves, opposite ways
        .to(dome, { rotation: 360, svgOrigin: spin, duration: 1.15, ease: 'power3.inOut' }, 0.05)
        .to(bowl, { rotation: -360, svgOrigin: spin, duration: 1.15, ease: 'power3.inOut' }, '<')
        .to(leaf, { rotation: 30, svgOrigin: LEAF, duration: 0.19, yoyo: true, repeat: 5, ease: 'sine.inOut' }, '<0.1'),
      pour: () => {                                          // tip it, out come the slats
        const bars = [[214, 86], [238, 60], [260, 38]].map(([x, hgt]) => { const b = s('rect', { x, y: 150, width: 15, height: hgt, rx: 7.5, fill: 'var(--orange, var(--carrot))', opacity: 0 }); extra.append(b); return b; });
        return gsap.timeline()
          .to(all, { rotation: 104, svgOrigin: spin, duration: 0.6, ease: 'back.out(1.6)' }, 0.05)
          .fromTo(bars, { y: -10, opacity: 1, scaleY: 0.2, transformOrigin: '50% 0%' }, { y: 112, scaleY: 1, duration: 0.5, ease: 'power2.in', stagger: 0.11, immediateRender: false }, '<0.3')
          .to(bars, { opacity: 0, duration: 0.12 }, '>-0.1')
          .to(all, { rotation: 0, duration: 0.75, ease: 'elastic.out(1, 0.5)' }, '>0.1');
      },
      deliver: () => gsap.timeline()                         // rolls out one side, back in the other
        .to(all, { x: off, rotation: off * 0.9, svgOrigin: spin, duration: 0.45 + off / 1100, ease: 'power2.in' }, 0.05)
        .set(all, { x: -off, rotation: -off * 0.9 })
        .to(all, { x: 0, rotation: 0, duration: 0.6 + off / 1100, ease: 'power3.out' })
        .to(all, { scaleY: 0.9, scaleX: 1.07, transformOrigin: '50% 100%', duration: 0.1, yoyo: true, repeat: 1, ease: 'sine.inOut' }),
    };
    let live = null;
    const rest = () => { if (live) live.kill(); extra.replaceChildren(); gsap.set([dome, bowl, leaf, all], { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 }); };
    return {
      svg,
      play(kind, onDone) { if (reduce || !window.gsap) return; rest(); live = MOVES[kind](); if (onDone) live.eventCallback('onComplete', onDone); },
      pose(kind, at) { if (!window.gsap) return; rest(); live = MOVES[kind]().pause().progress(at); },   // a still frame, for when motion is off
    };
  }

  // Slice wave: the cut opens along a row of things, one after the other, then closes behind itself.
  function sliceWave(els, { step = 90, hold = 520 } = {}) {
    if (reduce) return;
    const mine = el => el.getAttribute('aria-pressed') !== 'true';   // leave alone anything the visitor opened
    [...els].filter(mine).forEach((el, i) => setTimeout(() => {
      el.classList.add('is-open');
      setTimeout(() => { if (mine(el)) el.classList.remove('is-open'); }, hold);
    }, i * step));
  }

  // Echo: slices of the wordmark's top and bottom edges travel out and thin. At rest it is fully spread.
  function echoMotion() {
    const W = A.wordmark, N = 7, GAP = 16, id = 'ec' + (++uid);
    const defs = s('defs', {}, s('g', { id }, ...W.letters.map(L => s('path', { d: L.d }))));
    const svg = s('svg', { class: 'echo', viewBox: `0 ${-N * GAP - 8} ${W.w} ${W.h + 2 * N * GAP + 16}`, 'aria-hidden': 'true' }, defs);
    const slices = [];
    for (let i = 1; i <= N; i++) {
      const t = Math.max(2.2, 13 * Math.pow(0.78, i));
      defs.append(s('clipPath', { id: `${id}t${i}` }, s('rect', { x: 0, y: 0, width: W.w, height: t })), s('clipPath', { id: `${id}b${i}` }, s('rect', { x: 0, y: W.h - 2 - t, width: W.w, height: t + 2 })));
      for (const [clip, dir] of [[`${id}t${i}`, -1], [`${id}b${i}`, 1]]) {
        const g = s('g', { fill: 'currentColor', transform: `translate(0 ${dir * i * GAP})` }, s('g', { 'clip-path': `url(#${clip})` }, s('use', { href: '#' + id })));
        svg.append(g); slices.push({ g, to: dir * i * GAP, i });
      }
    }
    const main = wordmark();
    svg.append(s('g', { class: 'wm', fill: 'currentColor' }, ...main.childNodes));
    let busy = 0;
    const play = () => {
      if (reduce || !window.gsap || document.hidden || performance.now() < busy) return;
      busy = performance.now() + 1300;                       // let one spring finish before the next
      slices.forEach(({ g, to, i }) => gsap.fromTo(g, { attr: { transform: 'translate(0 0)' } }, { attr: { transform: `translate(0 ${to})` }, duration: 0.9, delay: i * 0.05, ease: 'elastic.out(1, 0.55)', overwrite: true }));
    };
    return { svg, play };
  }

  window.Fresh = { A, h, s, reduce, PRODUCE, KITS, PRICE, tok, money, wordmark, symbol, icon, arrow, doodle, echo, mono, Box, chrome, toast, kitCard, stepper, weightWave, squishy, ticker, stackMarquee, logoBuild, inView, firstView, orange, sliceWave, echoMotion };
})();
