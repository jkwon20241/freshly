/* About page: the brand grid, the Fresh Cut slider, kinetic type and the type tester, copyable palette, doodles. */
(() => {
  const F = window.Fresh, { h, PRODUCE, tok } = F;
  const moving = !F.reduce && window.gsap;
  const $ = id => document.getElementById(id);
  F.chrome('about.html');
  F.weightWave($('about-title'));

  /* the system at a glance: six tiles that toss themselves into place whenever the grid comes into view; each one answers the pointer */
  const stackw = h('div', { class: 'stackw' }, F.wordmark(), F.wordmark(), F.wordmark());
  stackw.children[1].style.color = 'var(--oat)';
  const tiles = [
    h('div', { class: 'wide on-oat' }, h('div', { style: { width: '78%' } }, F.wordmark())),
    h('div', { class: 'on-blossom cuttable' }, h('div', { style: { width: '46%' } }, F.symbol())),
    h('div', { class: 'bars' }, ...['kale', 'carrot', 'lemon', 'beet', 'blueberry'].map(c => h('span', { style: { background: tok(c) } }))),
    h('div', { class: 'on-lemon aa', text: 'Aa' }),
    h('div', { class: 'on-beet cuttable' }, h('div', { style: { width: '54%', color: 'var(--oat)' } }, F.icon('strawberry'))),
    h('div', { class: 'wide on-carrot', style: { color: 'var(--lemon)' } }, stackw),
  ];
  $('bento').append(...tiles);
  const toss = () => { if (moving && !document.hidden) gsap.fromTo(tiles, { y: 60, scale: 0.7, rotation: () => gsap.utils.random(-9, 9) }, { y: 0, scale: 1, rotation: 0, duration: 0.8, stagger: 0.07, ease: 'back.out(1.7)', overwrite: true, clearProps: 'transform' }); };
  F.inView($('st-bento'), toss, null, 0.35);
  F.squishy(tiles[0].querySelector('.wm'));

  /* one slider opens the cut in the orange and five icons at once; until it is touched, the cut runs along the row by itself */
  const line = $('cutline'), range = $('cut-range');
  const sym = F.symbol(); line.append(sym);
  const icons = ['beet', 'kale', 'orange', 'strawberry', 'carrot'].map(name => { const el = h('div', { style: { color: tok(PRODUCE[name].color) } }, F.icon(name)); line.append(el); return el; });
  const parts = [
    { tops: [[sym.querySelector('.sym-dome'), 40, 11], [sym.querySelector('.sym-leaf-g'), 52, 18]] },
    ...icons.map(i => ({ tops: [[i.querySelector('.ico-top'), 40, 11]], bot: i.querySelector('.ico-bot') })),
  ];
  const lift = parts.map(() => ({ v: 0 }));                  // what the passing wave adds on top of the slider
  const openCut = () => parts.forEach((p, i) => {
    const k = Math.max(+range.value, lift[i].v) / 100;
    for (const [t, y, deg] of p.tops) { t.style.transition = 'none'; t.style.transform = `translateY(${-y * k}px) rotate(${-deg * k}deg)`; }
    if (p.bot) { p.bot.style.transition = 'none'; p.bot.style.transform = `translateY(${10 * k}px)`; }
  });
  let touched = false, wave;
  const runWave = () => { if (moving && !touched) wave = gsap.fromTo(lift, { v: 0 }, { v: 100, duration: 0.42, ease: 'back.out(1.6)', stagger: { each: 0.13, repeat: 1, yoyo: true }, onUpdate: openCut, overwrite: true }); };
  range.addEventListener('input', () => { touched = true; if (wave) wave.kill(); lift.forEach(l => { l.v = 0; }); openCut(); });
  openCut();
  F.inView(line, runWave, null, 0.6);

  /* kinetic type: the steps roll past a fixed arrow while the list is on screen; a pointer on it rolls it faster */
  const WORDS = ['Picked', 'Packed', 'Poured', 'Blended', 'Sipped', 'Delivered'];
  const track = h('div', { class: 'k-track' });
  for (let rep = 0; rep < 3; rep++) for (const w of WORDS) track.append(h('span', { text: w + '.' }));
  const arrow = F.arrow('right'); arrow.classList.add('k-arrow');
  $('st-words').append(h('div', { class: 'klist' }, arrow, h('div', { class: 'k-window' }, track)));
  const spans = [...track.children];
  let ki = WORDS.length, roll;
  const place = animate => {
    const lh = spans[0].offsetHeight || 60;
    track.style.transition = animate ? '' : 'none';
    track.style.transform = `translateY(${-(ki + 0.5) * lh}px)`;
    spans.forEach((sp, i) => sp.classList.toggle('on', i === ki));
  };
  const next = () => {
    if (ki >= WORDS.length * 2) { ki -= WORDS.length; place(false); void track.offsetWidth; }   // hop back a set, unseen, before rolling on
    ki++; place(true);
  };
  const auto = every => { clearInterval(roll); if (!F.reduce) roll = setInterval(next, every); };
  place(false);
  F.inView($('st-words'), () => auto(1300), () => clearInterval(roll), 0.2);
  $('st-words').addEventListener('pointerenter', e => { if (e.pointerType !== 'touch' && !F.reduce) { next(); auto(520); } });
  $('st-words').addEventListener('pointerleave', () => auto(1300));
  addEventListener('resize', () => place(false));
  if (document.fonts) document.fonts.ready.then(() => place(false));   // the line height changes once Parkinsans lands

  /* type tester */
  const tester = $('tester');
  $('tw').addEventListener('input', e => { tester.style.setProperty('--tw', e.target.value); $('tw-out').textContent = e.target.value; });
  $('cut-toggle').addEventListener('click', e => e.currentTarget.setAttribute('aria-pressed', String(tester.classList.toggle('cut'))));
  const grounds = ['lemon', 'carrot', 'kale', 'beet', 'deep', 'blossom'];
  grounds.forEach((g, i) => {
    const b = h('button', { class: 'chip', type: 'button', 'aria-pressed': String(i === 0), 'aria-label': g, style: { background: tok(g), boxShadow: 'inset 0 0 0 2px var(--deep)', width: '38px', height: '38px', padding: '0' } });
    b.addEventListener('click', () => {
      tester.className = `tester on-${g}` + (tester.classList.contains('cut') ? ' cut' : '');
      $('grounds').querySelectorAll('button').forEach(x => { x.setAttribute('aria-pressed', String(x === b)); x.style.outline = x === b ? '3px solid var(--deep)' : ''; x.style.outlineOffset = '2px'; });
    });
    if (i === 0) { b.style.outline = '3px solid var(--deep)'; b.style.outlineOffset = '2px'; }
    $('grounds').append(b);
  });

  /* palette: tap to copy */
  const COLORS = [['Kale', '#08AC7C', 'oat'], ['Deep Kale', '#0B3B2C', 'oat'], ['Oat', '#FFF8EC', 'deep'], ['Carrot', '#F85C34', 'oat'], ['Blueberry', '#1F2B5B', 'oat'], ['Beet', '#F0549C', 'oat'], ['Lemon', '#FFD404', 'deep'], ['Strawberry Milk', '#F8ACCC', 'deep'], ['Blossom', '#FFD4E4', 'deep'], ['Cucumber', '#E8EC94', 'deep']];
  for (const [name, hex, ink] of COLORS) {
    const b = h('button', { class: 'swatch', type: 'button', 'aria-label': `Copy ${name} ${hex}`, style: { '--c': hex, '--i': tok(ink), boxShadow: name === 'Oat' ? 'inset 0 0 0 2px var(--line)' : '' } }, h('b', { text: name }), h('span', { text: hex }));
    b.addEventListener('click', () => {
      const done = () => F.toast(`${hex} copied`);
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(hex).then(done, () => F.toast(`${name} is ${hex}`));
      else F.toast(`${name} is ${hex}`);
    });
    $('swatches').append(b);
  }

  /* doodles */
  ['mascot', 'carrot', 'bowl', 'lemon', 'kale', 'strawberry'].forEach(n => $('doodles').append(F.doodle(n)));
})();
