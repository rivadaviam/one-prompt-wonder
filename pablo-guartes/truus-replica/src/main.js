import './styles.css';

const loader = document.querySelector('.loader');
window.addEventListener('load', () => setTimeout(() => loader.classList.add('is-gone'), 550));
setTimeout(() => loader.classList.add('is-gone'), 2600);

const cursor = document.querySelector('.cursor');
const cursorLabel = cursor.querySelector('span');
let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
window.addEventListener('pointermove', (event) => { tx = event.clientX; ty = event.clientY; });
function moveCursor(){ cx += (tx-cx)*.18; cy += (ty-cy)*.18; cursor.style.left = `${cx}px`; cursor.style.top = `${cy}px`; requestAnimationFrame(moveCursor); }
moveCursor();
document.querySelectorAll('.interactive, .all-work').forEach((el) => {
  el.addEventListener('pointerenter', () => { cursorLabel.textContent = el.classList.contains('all-work') ? 'more' : 'view'; cursor.classList.add('show'); });
  el.addEventListener('pointerleave', () => cursor.classList.remove('show'));
});

const reveals = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (entry.isIntersecting) { entry.target.classList.add('visible'); reveals.unobserve(entry.target); }
}), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
document.querySelectorAll('.reveal').forEach((el) => reveals.observe(el));

const counter = document.querySelector('[data-count]');
let counted = false;
new IntersectionObserver(([entry], observer) => {
  if (!entry.isIntersecting || counted) return;
  counted = true; observer.disconnect();
  const target = Number(counter.dataset.count); const start = performance.now();
  const tick = (now) => { const p = Math.min((now-start)/1200, 1); counter.textContent = String(Math.floor(target*(1-Math.pow(1-p,3)))).padStart(2,'0'); if (p<1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}).observe(counter);

const heroMedia = document.querySelector('.hero-media');
const floaters = [...document.querySelectorAll('[data-float]')];
let ticking = false;
function onScroll(){
  if (ticking) return; ticking = true;
  requestAnimationFrame(() => {
    const y = scrollY;
    if (y < innerHeight * 1.3) heroMedia.style.transform = `translateY(${y * .17}px) scale(${1 + y * .00008})`;
    floaters.forEach((el) => { const rect = el.parentElement.getBoundingClientRect(); const amount = Number(el.dataset.float); el.style.translate = `0 ${((innerHeight - rect.top) / innerHeight) * amount}px`; });
    ticking = false;
  });
}
addEventListener('scroll', onScroll, { passive:true }); onScroll();

document.querySelectorAll('.project').forEach((card) => {
  const image = card.querySelector('.project-image');
  card.addEventListener('pointermove', (event) => {
    const rect = card.getBoundingClientRect(); const x = (event.clientX-rect.left)/rect.width-.5; const y=(event.clientY-rect.top)/rect.height-.5;
    image.style.transform = `perspective(900px) rotateY(${x*3}deg) rotateX(${-y*3}deg)`;
  });
  card.addEventListener('pointerleave', () => image.style.transform = '');
});

document.querySelectorAll('a[href="#"]').forEach((link) => link.addEventListener('click', (event) => event.preventDefault()));
