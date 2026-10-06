/* Landing page: logo build, sliceable shelf, the orange acting out the steps, blend lab, kit teaser, stacked marquee. */
(() => {
  const F = window.Fresh, { h, s, PRODUCE, KITS, tok } = F;
  const $ = id => document.getElementById(id);
  F.chrome('index.html');

  /* hero: the logo assembles from the cut when the page loads; after that its letters and its orange answer the pointer */
  const build = F.logoBuild($('lockup'));
  F.squishy(build.svg, { when: () => !build.tl || !build.tl.isActive() });
  // once the line has pulled back out of the logo, the cut carries on along the shelf
  if (build.tl) build.tl.eventCallback('onComplete', () => F.sliceWave($('shelf').children));
  build.play();
  F.ticker($('tick'), ['picked.', 'packed.', 'blended.', 'delivered.']);

  /* shelf: nine blocks peeking over the edge; hover or tap slices them */
  for (const [name, p] of Object.entries(PRODUCE)) {
    const b = h('button', { type: 'button', class: 'cuttable', 'aria-label': `Slice the ${p.label.toLowerCase()}`, 'aria-pressed': 'false', style: { color: tok(p.onDeep) } }, F.icon(name));
    b.addEventListener('click', () => b.setAttribute('aria-pressed', String(b.classList.toggle('is-open'))));
    $('shelf').append(b);
  }

  /* how it works: a real sequence, so it is numbered. The orange acts out each step, one card after the other;
     a pointer on a card (or a tap on a phone) plays its move straight away. */
  const steps = [
    { move: 'cut',     tone: 'on-deep',     still: 0.3,  title: 'Picked ripe, cut the same day.', text: 'Fruit and vegetables come in from the farm, get sliced and are frozen fast, so nothing sits around.' },
    { move: 'deliver', tone: 'on-cucumber', still: 0.86, title: 'Packed in a cup, shipped cold.', text: 'Your box lands frozen anywhere in the lower 48. Stack the cups in the freezer.' },
    { move: 'blend',   tone: 'on-lemon',    still: 0.42, title: 'Add milk. Blend 60 seconds.',    text: 'Tip a cup into the blender and pour in a cup of milk or juice.' },
    { move: 'pour',    tone: 'on-blossom',  still: 0.42, title: 'Pour. Sip. Done.',               text: 'Breakfast is in the glass, and the only thing to wash is the blender.' },
  ];
  let turn = 0, waiting = -1, relay = false, gap;
  const acts = steps.map((st, i) => {
    const o = F.orange({ viewBox: '-200 -60 640 400' });
    const act = () => { clearTimeout(gap); waiting = i; turn = (i + 1) % steps.length; o.play(st.move, () => { if (relay && waiting === i) gap = setTimeout(() => acts[turn](), 380); }); };
    const card = h('li', { class: `step ${st.tone}`, tabindex: '0' },
      h('span', { class: 'num', text: `Step ${i + 1}` }), h('div', { class: 'step-art' }, o.svg), h('h3', { text: st.title }), h('p', { text: st.text }));
    card.addEventListener('pointerenter', e => { if (e.pointerType !== 'touch') act(); });
    card.addEventListener('focus', act); card.addEventListener('click', act);
    $('steps').append(card);
    if (F.reduce) o.pose(st.move, st.still);                 // motion off: each card holds a frame of its own move
    return act;
  });
  if (!F.reduce) F.inView($('steps'), () => { if (!relay) { relay = true; acts[turn](); } }, () => { relay = false; clearTimeout(gap); }, 0.15);

  /* blend lab */
  const HEX = { blossom: '#FFD4E4', carrot: '#F85C34', lemon: '#FFD404', blueberry: '#1F2B5B', beet: '#F0549C', milk: '#F8ACCC', kale: '#08AC7C', cucumber: '#E8EC94' };
  const CUP = 'M 34 20 H 266 L 244 372 Q 242 392 222 392 H 78 Q 58 392 56 372 Z';
  const liquid = s('g', { class: 'liquid' });
  const straw = s('rect', { x: 196, y: -46, width: 22, height: 330, rx: 11, fill: 'var(--lemon)' });
  gsap.set(straw, { rotation: 11, svgOrigin: '207 120' });
  $('glass').append(s('svg', { viewBox: '0 -50 300 450', role: 'img', 'aria-label': 'A glass that fills with what you pick' },
    s('defs', {}, s('clipPath', { id: 'cup' }, s('path', { d: CUP }))),
    s('g', { 'clip-path': 'url(#cup)' }, s('rect', { x: 0, y: 0, width: 300, height: 400, fill: 'var(--oat)', opacity: 0.1 }), liquid),
    straw,
    s('path', { d: CUP, fill: 'none', stroke: 'var(--oat)', 'stroke-width': 7, 'stroke-linejoin': 'round' }),
    // the Fresh Cut runs through the glass too: 45% down, 7.4% thick
    s('rect', { x: 0, y: 20 + 372 * 0.4525, width: 300, height: 372 * 0.0738, fill: 'var(--bg)' })));

  let picked = [], blended = false;
  const layers = new Map();
  const buttons = new Map();
  const TOP = 96, BOTTOM = 392;                                 // liquid sits between these in cup units
  // Blend = average the layers, then snap to the nearest brand color so the result never turns muddy.
  const rgbOf = hex => hex.match(/\w\w/g).map(x => parseInt(x, 16));
  const mix = () => {
    const rgb = picked.map(n => rgbOf(HEX[PRODUCE[n].juice]));
    const avg = [0, 1, 2].map(i => rgb.reduce((a, c) => a + c[i], 0) / rgb.length);
    const dist = hex => rgbOf(hex).reduce((a, v, i) => a + (v - avg[i]) ** 2, 0);
    return Object.values(HEX).sort((a, b) => dist(a) - dist(b))[0];
  };
  function render() {
    const n = picked.length, each = n ? (BOTTOM - TOP) / n : 0, one = blended && n ? mix() : null;
    for (const [name, rect] of layers) if (!picked.includes(name)) { layers.delete(name); gsap.to(rect, { attr: { y: BOTTOM, height: 0 }, duration: 0.35, onComplete: () => rect.remove() }); }
    picked.forEach((name, i) => {
      let rect = layers.get(name);
      if (!rect) { rect = s('rect', { x: 0, width: 300, y: BOTTOM, height: 0, fill: HEX[PRODUCE[name].juice] }); liquid.append(rect); layers.set(name, rect); }
      gsap.to(rect, { attr: { y: BOTTOM - each * (i + 1), height: each + 1 }, fill: one || HEX[PRODUCE[name].juice], duration: F.reduce ? 0 : 0.7, ease: 'back.out(1.5)' });
    });
    for (const [name, b] of buttons) { const on = picked.includes(name); b.setAttribute('aria-pressed', String(on)); b.classList.toggle('is-open', on); b.disabled = !on && n >= 4; }
    const names = picked.map(x => PRODUCE[x].label);
    $('blend-name').textContent = n ? names.join(' + ') + (blended ? ', blended.' : '') : 'An empty glass';
    $('st-cal').textContent = n ? 60 + picked.reduce((a, x) => a + PRODUCE[x].cal, 0) : 0;
    $('st-fib').textContent = n ? Math.round(2 + picked.reduce((a, x) => a + PRODUCE[x].fiber, 0)) : 0;
    const best = n && KITS.map(k => [k, [k.hero, ...k.also].filter(x => picked.includes(x)).length]).sort((a, b) => b[1] - a[1])[0];
    $('closest').replaceChildren(...(best && best[1] ? ['Closest kit: ', h('a', { href: `menu.html#kit-${best[0].id}`, text: best[0].name })] : []));
  }
  for (const [name, p] of Object.entries(PRODUCE)) {
    const b = h('button', { type: 'button', class: 'pick cuttable', 'aria-pressed': 'false', style: { '--c': tok(p.onDeep), '--c-on': tok(p.color) } }, F.icon(name), h('span', { text: p.label }));
    b.addEventListener('click', () => { blended = false; picked = picked.includes(name) ? picked.filter(x => x !== name) : [...picked, name]; render(); });
    buttons.set(name, b); $('picker').append(b);
  }
  $('blend').addEventListener('click', () => {
    if (!picked.length) return F.toast('Slice something into the glass first.');
    blended = true; $('glass').classList.remove('blending'); void $('glass').offsetWidth; $('glass').classList.add('blending');
    gsap.fromTo(straw, { rotation: 11 }, { rotation: -9, duration: 0.25, yoyo: true, repeat: 3, ease: 'sine.inOut' });
    render();
  });
  $('rinse').addEventListener('click', () => { picked = []; blended = false; render(); });
  picked = ['kale', 'apple', 'lemon']; render();                // open with a real example in the glass

  /* teaser + marquee */
  KITS.slice(0, 4).forEach(k => $('teaser').append(F.kitCard(k, { teaser: true })));
  F.firstView($('teaser'), () => F.sliceWave($('teaser').children, { step: 130, hold: 700 }));
  F.stackMarquee($('stack'), 3);
})();
