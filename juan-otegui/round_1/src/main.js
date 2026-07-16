import './style.css';

const projects = [
  { client: 'KFC', type: '360°', title: 'Kipsalon', image: '/assets/work-kfc.webp', color: '#ff3232' },
  { client: 'HEMA', type: '360°', title: 'Skibidi school', image: '/assets/work-hema.webp', color: '#f3f408' },
  { client: 'CheapTickets', type: 'Brand', title: 'Your next story', image: '/assets/work-travel.webp', color: '#fa81c5' },
  { client: 'Douwe Egberts', type: 'Social', title: 'Feestje bouwen?', image: '/assets/work-coffee.webp', color: '#ff7339' },
];

const services = [
  ['brand', 'Brand strategy · 360° creative · Art direction · Copywriting · Motion graphics'],
  ['social', 'Social strategy · TikTok shoots · Influencer campaigns · Community management'],
  ['activations', 'Activation strategy · Event planning · Creative production · Spectacular OOH'],
  ['video production', 'Campaign films · Branded content · Social content · Post production'],
];

document.querySelector('#app').innerHTML = `
  <div class="loader" aria-hidden="true"><div class="loader-word">TRUUS<span>.</span></div><div class="loader-count">00</div></div>
  <div class="cursor" aria-hidden="true"><span>DRAG</span></div>
  <div class="progress" aria-hidden="true"></div>

  <header class="nav">
    <a class="logo" href="#home" aria-label="Truus home">TRUUS<span>.</span></a>
    <p class="nav-note">Advertising for<br>the new mainstream</p>
    <a class="contact-pill magnetic" href="mailto:hello@truus.co">LET'S TALK <span>↗</span></a>
    <button class="menu-btn magnetic" aria-label="Open menu" aria-expanded="false"><span></span><span></span></button>
  </header>

  <aside class="menu" aria-hidden="true">
    <div class="menu-top"><span>MENU</span><button class="menu-close" aria-label="Close menu">CLOSE ✕</button></div>
    <nav>
      <a href="#home">Home <sup>01</sup></a>
      <a href="#work">Work <sup>02</sup></a>
      <a href="#about">About <sup>03</sup></a>
      <a href="#contact">Contact <sup>04</sup></a>
    </nav>
    <div class="menu-foot">AMSTERDAM — NL<br><a href="mailto:hello@truus.co">HELLO@TRUUS.CO</a></div>
  </aside>

  <main>
    <section id="home" class="hero blue">
      <div class="hero-copy">
        <div class="eyebrow reveal">AMSTERDAM / 2026</div>
        <h1 aria-label="We make advertising for the new mainstream">
          <span class="hero-line line-a">WE MAKE</span>
          <span class="hero-line line-b">ADVERTISING</span>
          <span class="hero-small reveal">FOR THE NEW</span>
          <span class="hero-line line-c">MAINSTREAM</span>
        </h1>
      </div>
      <div class="scroll-cue"><span>SCROLL TO EXPLORE</span><b>↓</b></div>
      <div class="hero-orbit orbit-one">✦</div><div class="hero-orbit orbit-two">SMILE<br>:)</div>
    </section>

    <section class="ticker" aria-label="Agency statement">
      <div class="ticker-track"><span>TV TO TIKTOK ✳ TV TO TIKTOK ✳ TV TO TIKTOK ✳ TV TO TIKTOK ✳&nbsp;</span><span>TV TO TIKTOK ✳ TV TO TIKTOK ✳ TV TO TIKTOK ✳ TV TO TIKTOK ✳&nbsp;</span></div>
    </section>

    <section class="statement yellow" id="about">
      <p class="kicker reveal">01 — WHY TRUUS?</p>
      <h2 class="statement-title">WE WANNA BE<br><em>WHERE</em> THE<br>PEOPLE ARE</h2>
      <div class="statement-bottom">
        <p class="body-copy reveal">Audiences are more scattered and more reachable than ever. We help brands become leaders on the channels of the new mainstream.</p>
        <div class="roundel" aria-hidden="true"><span>FUTURE PROOF • FUTURE PROOF •&nbsp;</span><b>↘</b></div>
      </div>
      <div class="scribble" aria-hidden="true">NEW<br>NEW<br>NEW!</div>
    </section>

    <section class="manifesto blue">
      <div class="manifesto-sticky"><p class="kicker">02 — OUR VIEW</p><h2>AN AGENCY<br>BUILT FOR<br>THE <span>FUTURE.</span></h2></div>
      <div class="manifesto-notes">
        <article class="note n1 reveal"><span>01</span><h3>GIRLS JUST<br>WANNA HAVE FUN!</h3><p>Culture moves fast. We move with it.</p></article>
        <article class="note n2 reveal"><span>02</span><h3>MAINSTREAM IS<br>NOT A DIRTY WORD</h3><p>Popular is powerful when it feels personal.</p></article>
        <article class="note n3 reveal"><span>03</span><h3>ARROGANCE =<br>OLD FASHIONED</h3><p>Listen first, create second, earn attention always.</p></article>
      </div>
    </section>

    <section class="work" id="work">
      <div class="work-head"><div><p class="kicker reveal">03 — SELECTED WORK</p><h2 class="reveal">THINGS WE<br>MADE PEOPLE<br><em>FEEL.</em></h2></div><p class="work-instruction">DRAG OR SCROLL<br>TO EXPLORE ↔</p></div>
      <div class="work-rail" tabindex="0" aria-label="Scrollable project gallery">
        ${projects.map((project, index) => `<article class="project" style="--accent:${project.color}" data-index="0${index + 1}">
          <a href="https://truus.co/" target="_blank" rel="noreferrer" aria-label="View ${project.title} project on Truus">
            <div class="project-img"><img src="${project.image}" alt="${project.title} campaign" draggable="false"><span class="project-view">VIEW<br>PROJECT ↗</span></div>
            <div class="project-meta"><h3>${project.title}</h3><span>${project.client}<br>${project.type}</span></div>
          </a>
        </article>`).join('')}
        <article class="project project-all"><a href="https://truus.co/" target="_blank" rel="noreferrer"><span>ALL OUR<br>WORK ↗</span></a></article>
      </div>
    </section>

    <section class="team">
      <div class="team-image parallax"><img src="/assets/team-hero.png" alt="A joyful team of young creatives"></div>
      <div class="team-overlay"><p class="kicker">04 — THE PEOPLE</p><h2>YOUNG.<br>DIGITAL.<br><span>RESTLESS.</span></h2><p>We are a future-proof team of</p><strong class="team-count">00</strong><p>digitally native wunderkinder.<br>Not to brag!</p></div>
    </section>

    <section class="services yellow">
      <div class="services-intro"><p class="kicker reveal">05 — WHAT WE DO</p><h2 class="reveal">CALL US<br>IF YOU NEED:</h2><span class="asterisk">✳</span></div>
      <div class="service-list">
        ${services.map(([name, detail], i) => `<article class="service"><button aria-expanded="${i === 0}"><span>0${i + 1}</span><b>${name}</b><i>+</i></button><div class="service-detail"><p>${detail}</p></div></article>`).join('')}
      </div>
    </section>

    <section class="clients blue">
      <p class="kicker reveal">PROUD TO HAVE WORKED WITH</p>
      <div class="client-marquee"><div>NETFLIX ✦ KFC ✦ HEMA ✦ BOL ✦ JUMBO ✦ OXXIO ✦ ACE & TATE ✦&nbsp;</div><div>NETFLIX ✦ KFC ✦ HEMA ✦ BOL ✦ JUMBO ✦ OXXIO ✦ ACE & TATE ✦&nbsp;</div></div>
    </section>
  </main>

  <footer id="contact" class="footer pink">
    <p class="kicker reveal">GOT SOMETHING IN MIND?</p>
    <a class="footer-cta magnetic" href="mailto:hello@truus.co"><span>LET'S MAKE</span><span>SOMETHING</span><span>PEOPLE LOVE ↗</span></a>
    <div class="footer-grid"><div><b>OFFICE</b><p>PAPAVERHOF 21<br>1032 LX AMSTERDAM</p></div><div><b>CONTACT</b><p><a href="mailto:hello@truus.co">HELLO@TRUUS.CO</a><br><a href="https://wa.me/31202104106" target="_blank" rel="noreferrer">WHATSAPP US ↗</a></p></div><div><b>SOCIAL</b><p><a href="https://instagram.com" target="_blank" rel="noreferrer">INSTAGRAM ↗</a><br><a href="https://linkedin.com" target="_blank" rel="noreferrer">LINKEDIN ↗</a></p></div><div class="footer-logo">TRUUS<span>.</span></div></div>
  </footer>
`;

const root = document.documentElement;
const loader = document.querySelector('.loader');
const loaderCount = document.querySelector('.loader-count');
let loaded = 0;
const loadTimer = setInterval(() => {
  loaded = Math.min(100, loaded + Math.ceil(Math.random() * 16));
  loaderCount.textContent = String(loaded).padStart(2, '0');
  if (loaded === 100) {
    clearInterval(loadTimer);
    setTimeout(() => loader.classList.add('is-done'), 180);
  }
}, 45);

const menu = document.querySelector('.menu');
const menuButton = document.querySelector('.menu-btn');
const closeButton = document.querySelector('.menu-close');
function setMenu(open) {
  menu.classList.toggle('is-open', open);
  menu.setAttribute('aria-hidden', String(!open));
  menuButton.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('menu-open', open);
}
menuButton.addEventListener('click', () => setMenu(true));
closeButton.addEventListener('click', () => setMenu(false));
menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (event) => event.key === 'Escape' && setMenu(false));

const cursor = document.querySelector('.cursor');
let mouseX = -100, mouseY = -100, cursorX = -100, cursorY = -100;
document.addEventListener('pointermove', (event) => { mouseX = event.clientX; mouseY = event.clientY; });
function moveCursor() {
  cursorX += (mouseX - cursorX) * .16;
  cursorY += (mouseY - cursorY) * .16;
  cursor.style.transform = `translate3d(${cursorX}px,${cursorY}px,0)`;
  requestAnimationFrame(moveCursor);
}
moveCursor();
document.querySelectorAll('a, button').forEach((element) => {
  element.addEventListener('mouseenter', () => cursor.classList.add('is-link'));
  element.addEventListener('mouseleave', () => cursor.classList.remove('is-link'));
});

const rail = document.querySelector('.work-rail');
rail.addEventListener('mouseenter', () => cursor.classList.add('is-drag'));
rail.addEventListener('mouseleave', () => cursor.classList.remove('is-drag'));
rail.addEventListener('wheel', (event) => {
  if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
    rail.scrollLeft += event.deltaY;
    event.preventDefault();
  }
}, { passive: false });
let dragging = false, startX = 0, startScroll = 0;
rail.addEventListener('pointerdown', (event) => { dragging = true; startX = event.clientX; startScroll = rail.scrollLeft; rail.setPointerCapture(event.pointerId); });
rail.addEventListener('pointermove', (event) => { if (dragging) rail.scrollLeft = startScroll - (event.clientX - startX) * 1.5; });
rail.addEventListener('pointerup', () => { dragging = false; });

const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (entry.isIntersecting) entry.target.classList.add('in-view');
}), { threshold: .16 });
document.querySelectorAll('.reveal, .project, .note').forEach((element) => observer.observe(element));

document.querySelectorAll('.service button').forEach((button, index) => {
  if (index === 0) button.closest('.service').classList.add('open');
  button.addEventListener('click', () => {
    const service = button.closest('.service');
    const open = !service.classList.contains('open');
    document.querySelectorAll('.service').forEach((item) => {
      item.classList.remove('open');
      item.querySelector('button').setAttribute('aria-expanded', 'false');
    });
    if (open) { service.classList.add('open'); button.setAttribute('aria-expanded', 'true'); }
  });
});

let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    root.style.setProperty('--scroll', `${max ? y / max * 100 : 0}%`);
    document.querySelector('.hero-copy').style.transform = `translate3d(0,${y * .18}px,0)`;
    document.querySelectorAll('.parallax img').forEach((img) => {
      const rect = img.parentElement.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < innerHeight) img.style.transform = `translate3d(0,${rect.top * -.08}px,0) scale(1.08)`;
    });
    const team = document.querySelector('.team');
    const teamRect = team.getBoundingClientRect();
    if (teamRect.top < innerHeight && teamRect.bottom > 0) {
      const progress = Math.max(0, Math.min(1, (innerHeight - teamRect.top) / (innerHeight + teamRect.height)));
      document.querySelector('.team-count').textContent = String(Math.round(progress * 47)).padStart(2, '0');
    }
    ticking = false;
  });
}, { passive: true });

document.querySelectorAll('.magnetic').forEach((element) => {
  element.addEventListener('pointermove', (event) => {
    const rect = element.getBoundingClientRect();
    element.style.transform = `translate(${(event.clientX - rect.left - rect.width / 2) * .12}px, ${(event.clientY - rect.top - rect.height / 2) * .12}px)`;
  });
  element.addEventListener('pointerleave', () => { element.style.transform = ''; });
});
