/* ====== DATA GALERI — ganti nama file & keterangan sesuai foto Anda ====== */
const photos = [
  { src: 'assets/images/foto-1.jpg',  cap: 'Aula utama gedung BEI' },
  { src: 'assets/images/foto-2.jpg',  cap: 'Pameran benda sejarah pasar modal indonesia' },
  { src: 'assets/images/foto-3.jpg',  cap: 'pertumbuhan investasi selama 10 tahun' },
  { src: 'assets/images/foto-4.jpg',  cap: 'Papan edukasi index saham dunia' },
  { src: 'assets/images/foto-5.jpg',  cap: 'Edukasi oleh narasumber' },
  { src: 'assets/images/foto-6.jpg',  cap: 'Galeri investasi bursa efek indonsia' },
  { src: 'assets/images/foto-7.jpg',  cap: 'Papan edukasi mengenai warkat saham' },
  { src: 'assets/images/foto-8.jpg',  cap: 'Simulasi iteratif tentang saham' },
  { src: 'assets/images/foto-9.jpg',  cap: 'Kebersamaan peserta kunjungan' },
  { src: 'assets/images/foto-10.jpg', cap: 'Area lobi bursa efek indonesia' }
];

const $ = (s, c = document) => c.querySelector(s);
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ====== NAV ====== */
const nav = $('#nav'), links = $('#navLinks'), toggle = $('#navToggle');
addEventListener('scroll', () => nav.classList.toggle('solid', scrollY > 40), { passive: true });
toggle.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});
links.addEventListener('click', e => { if (e.target.tagName === 'A') { links.classList.remove('open'); toggle.setAttribute('aria-expanded', false); } });
const secObs = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) links.querySelectorAll('a').forEach(a => a.classList.toggle('active', a.hash === '#' + e.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('main section[id]').forEach(s => secObs.observe(s));
$('#year').textContent = new Date().getFullYear();

/* ====== HERO: grafik candlestick yang tergambar saat halaman dibuka ====== */
(function chart() {
  const cv = $('#chart'), ctx = cv.getContext('2d');
  let candles = [], shown = 0, W, H;
  function build() {
    const dpr = devicePixelRatio || 1;
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.floor(W / 22); let v = H * .62, s = 7;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    candles = Array.from({ length: n }, () => {
      const o = v, c = o + (rnd() - .46) * 46 - 2.2; v = Math.min(H * .85, Math.max(H * .2, c));
      return { o, c: v, h: Math.min(o, v) - rnd() * 24, l: Math.max(o, v) + rnd() * 24 };
    });
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    candles.slice(0, shown).forEach((k, i) => {
      const x = i * 22 + 11, up = k.c <= k.o;
      ctx.strokeStyle = ctx.fillStyle = up ? '#19A974' : '#E4572E';
      ctx.beginPath(); ctx.moveTo(x, k.h); ctx.lineTo(x, k.l); ctx.stroke();
      ctx.fillRect(x - 5, Math.min(k.o, k.c), 10, Math.max(3, Math.abs(k.c - k.o)));
    });
  }
  function run() {
    build();
    if (reduceMotion) { shown = candles.length; draw(); return; }
    shown = 0;
    (function step() { shown += 1; draw(); if (shown < candles.length) requestAnimationFrame(step); })();
  }
  run(); let t; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(run, 200); });
})();

/* ====== GALERI + LIGHTBOX ====== */
const gallery = $('#gallery'), lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
let current = 0, lastFocus = null;

photos.forEach((p, i) => {
  const b = document.createElement('button');
  b.className = 'item'; b.dataset.cap = p.cap; b.setAttribute('aria-label', `Perbesar: ${p.cap}`);
  const img = new Image(); img.src = p.src; img.alt = p.cap; img.loading = 'lazy';
  img.onerror = () => img.replaceWith(Object.assign(document.createElement('div'), { className: 'ph', textContent: `Foto ${i + 1}` }));
  b.appendChild(img);
  b.addEventListener('click', () => openLb(i));
  gallery.appendChild(b);
});

function show(i) {
  current = (i + photos.length) % photos.length;
  const p = photos[current];
  lbCap.textContent = `${current + 1} / ${photos.length} · ${p.cap}`;
  $('.lightbox .ph')?.remove();
  const probe = new Image();
  probe.onload = () => { lbImg.hidden = false; lbImg.src = p.src; lbImg.alt = p.cap; };
  probe.onerror = () => { lbImg.hidden = true; $('.lightbox .ph')?.remove(); lbImg.insertAdjacentHTML('afterend', `<div class="ph">Foto ${current + 1}</div>`); };
  probe.src = p.src;
}
function openLb(i) { lastFocus = document.activeElement; lb.hidden = false; document.body.style.overflow = 'hidden'; show(i); $('#lbClose').focus(); }
function closeLb() { lb.hidden = true; document.body.style.overflow = ''; lastFocus?.focus(); }
$('#lbClose').onclick = closeLb; $('#lbPrev').onclick = () => show(current - 1); $('#lbNext').onclick = () => show(current + 1);
lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
addEventListener('keydown', e => {
  if (lb.hidden) return;
  if (e.key === 'Escape') closeLb();
  if (e.key === 'ArrowLeft') show(current - 1);
  if (e.key === 'ArrowRight') show(current + 1);
});

/* ====== SLIDER REFLEKSI ====== */
(function slider() {
  const track = $('.slides'), slides = [...track.children], dots = $('#dots'); let idx = 0;
  slides.forEach((_, i) => { const d = document.createElement('button'); d.setAttribute('aria-label', `Slide ${i + 1}`); d.onclick = () => go(i); dots.appendChild(d); });
  function go(i) { idx = (i + slides.length) % slides.length; track.scrollTo({ left: track.clientWidth * idx }); mark(); }
  function mark() { [...dots.children].forEach((d, i) => d.classList.toggle('on', i === idx)); }
  track.addEventListener('scroll', () => { idx = Math.round(track.scrollLeft / track.clientWidth); mark(); }, { passive: true });
  $('#prev').onclick = () => go(idx - 1); $('#next').onclick = () => go(idx + 1);
  mark();
})();
