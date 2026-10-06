/* Kit menu: filterable grid that slices in a wave, detail sheet, and a box whose orange reacts as you fill it. */
(() => {
  const F = window.Fresh, { h, PRODUCE, KITS, PRICE, Box, tok, money } = F;
  const $ = id => document.getElementById(id);
  F.chrome('menu.html');
  F.weightWave($('menu-title'));

  /* grid */
  const cards = new Map();
  for (const kit of KITS) { const c = F.kitCard(kit, { onOpen: openSheet }); cards.set(kit.id, c); $('grid').append(c); }

  /* filters: one at a time */
  const FILTERS = [['all', 'All'], ['greens', 'Greens'], ['citrus', 'Citrus'], ['berry', 'Berry'], ['roots', 'Roots'], ['light', 'Under 180 cal']];
  let active = 'all';
  const chips = FILTERS.map(([key, label]) => {
    const b = h('button', { class: 'chip', type: 'button', 'aria-pressed': String(key === active), text: label });
    b.addEventListener('click', () => { active = key; applyFilter(true); });
    $('chips').append(b); return [key, b];
  });
  function applyFilter(animate) {
    let shown = 0;
    for (const [key, b] of chips) b.setAttribute('aria-pressed', String(key === active));
    for (const kit of KITS) {
      const c = cards.get(kit.id), on = active === 'all' || kit.tags.includes(active);
      c.hidden = !on; if (on) shown++;
    }
    $('count').textContent = `${shown} ${shown === 1 ? 'kit' : 'kits'}` + (active === 'all' ? '' : `, ${FILTERS.find(f => f[0] === active)[1].toLowerCase()}`);
    const showing = [...cards.values()].filter(c => !c.hidden);
    if (animate && window.gsap && !F.reduce) gsap.from(showing, { y: 26, rotation: -2, scale: 0.94, duration: 0.5, stagger: 0.045, ease: 'back.out(1.8)', clearProps: 'all' });
    clearTimeout(waveT); waveT = setTimeout(() => F.sliceWave(showing, { step: 110, hold: 650 }), animate ? 420 : 500);   // then the cut runs across the kits
  }
  let waveT;
  applyFilter(false);

  /* detail sheet */
  const sheet = $('sheet');
  function openSheet(kit) {
    const stat = (n, label) => h('div', {}, h('b', { text: n }), h('span', { text: label }));
    const inside = [kit.hero, ...kit.also].map(name => h('span', { class: 'cuttable', style: { display: 'grid', justifyItems: 'center', gap: '4px', width: '74px', color: tok(PRODUCE[name].color) }, tabindex: '0' },
      F.icon(name), h('span', { style: { color: 'var(--deep)', fontSize: '.72rem', fontWeight: '600', letterSpacing: '.06em', textTransform: 'uppercase' }, text: PRODUCE[name].label })));
    sheet.replaceChildren(
      h('button', { class: 'close-x', type: 'button', 'aria-label': 'Close', text: '×', onclick: () => sheet.close() }),
      h('div', { class: 'sheet-grid' },
        h('div', { class: 'sheet-art cuttable', style: { '--kc': tok(kit.bg), '--kb': tok(kit.block) } }, F.icon(kit.hero)),
        h('div', { class: 'sheet-body' },
          h('p', { class: 'eyebrow', text: 'Picked ripe · Frozen fast' }),
          h('h2', { id: 'sheet-title', text: kit.name }),
          h('p', { text: kit.desc + ' Cut at peak and frozen the same day.' }),
          h('div', { class: 'facts' }, stat(kit.cal, 'calories'), stat(kit.fiber + ' g', 'fiber'), stat(kit.protein + ' g', 'protein'), stat(kit.carbs + ' g', 'carbs')),
          h('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap' } }, inside),
          h('ol', { class: 'how' }, h('li', { text: 'Tip the cup into a blender.' }), h('li', { text: 'Add 1 cup of milk or juice.' }), h('li', { text: 'Blend 60 seconds. Sip.' })),
          h('div', { style: { display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' } }, F.stepper(kit), h('span', { class: 'meta', id: 'sheet-price', style: { fontWeight: '600' } })))));
    $('sheet-price').textContent = `${money(Box.each())} a kit in a box of ${Box.size}`;
    sheet.showModal();
    if (window.gsap && !F.reduce) gsap.from(sheet.querySelector('.sheet-art .icon'), { scale: 0.6, rotation: -14, duration: 0.7, ease: 'elastic.out(1, 0.5)' });
  }
  sheet.addEventListener('click', e => { if (e.target === sheet) sheet.close(); });   // click on the backdrop

  /* the box */
  const sizeButtons = Object.keys(PRICE).map(Number).map(n => {
    const b = h('button', { type: 'button', 'aria-pressed': 'false', text: String(n) });
    b.addEventListener('click', () => { if (Box.count() > n) return F.toast(`Take out ${Box.count() - n} ${Box.count() - n === 1 ? 'kit' : 'kits'} to fit a box of ${n}.`); Box.size = n; });
    $('sizes').append(b); return [n, b];
  });
  function renderBox() {
    const list = Box.list(), n = list.length;
    for (const [size, b] of sizeButtons) b.setAttribute('aria-pressed', String(size === Box.size));
    $('sum').textContent = `${n} of ${Box.size} kits · ${money(Box.total())}`;
    const slots = $('slots'); slots.replaceChildren();
    for (let i = 0; i < Box.size; i++) {
      const kit = list[i] && KITS.find(k => k.id === list[i]);
      slots.append(h('span', { class: 'slot' + (kit ? ' full' : ''), style: kit ? { background: tok(kit.bg === 'blueberry' ? 'milk' : kit.bg) } : {} }));
    }
    $('checkout').textContent = n < Box.size ? `Add ${Box.size - n} more` : 'Check out';
    const price = $('sheet-price'); if (price) price.textContent = `${money(Box.each())} a kit in a box of ${Box.size}`;
  }
  document.addEventListener('box:change', renderBox); renderBox();
  // the orange in the box bar: its lid pops for every kit added, it spins when the box is full, and it rolls off at checkout
  const mascot = F.orange(); $('box-orange').append(mascot.svg);
  let had = Box.count();
  document.addEventListener('box:change', () => { const n = Box.count(); if (n > had) mascot.play(Box.room() ? 'cut' : 'blend'); had = n; });
  $('empty').addEventListener('click', () => { if (Box.count()) { Box.clear(); F.toast('Box emptied.'); } });
  $('checkout').addEventListener('click', () => {
    if (Box.room()) return F.toast(`Your box has room for ${Box.room()} more.`);
    mascot.play('deliver'); F.toast('This is a concept site, so no order is placed. Nice box, though.');
  });

  /* arriving from a link to one kit */
  const target = location.hash.startsWith('#kit-') && document.getElementById(location.hash.slice(1));
  if (target) { target.scrollIntoView({ block: 'center' }); target.classList.add('is-open'); setTimeout(() => target.classList.remove('is-open'), 1600); }
})();
