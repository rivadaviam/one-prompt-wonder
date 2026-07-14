gsap.registerPlugin(ScrollTrigger, SplitText);

// Reload page
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

window.scrollTo(0, 0);
window.onbeforeunload = function () {
  window.scrollTo(0, 0);
};

// Lenis scroll
const lenis = new Lenis({
  duration: 1,
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 0.9,
});

lenis.on("scroll", ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);
lenis.stop();

// Global
const activeSplitTexts = [];
const activeSwipers = [];
let hasHeroPreloaded = false;
let isHeroPreloading = false;
let hasPendingResponsiveRebuild = false;
let runPendingResponsiveRebuild = null;
let isInitialRevealSettling = false;
let initialRevealTimer;

function resetScrollToTop() {
  if (window.location.hash) {
    history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
  }

  const scrollingElement =
    document.scrollingElement || document.documentElement;

  scrollingElement.scrollTop = 0;
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  window.scrollTo(0, 0);
  lenis.resize();
  lenis.scrollTo(0, { immediate: true, force: true });
  lenis.raf(performance.now());
  ScrollTrigger.update();
}

function completeHeroPreload({ shouldRefresh = true } = {}) {
  const preload = document.querySelector(".preload");
  const isInitialPreload = !hasHeroPreloaded;

  function endInitialRevealSettling() {
    clearTimeout(initialRevealTimer);
    initialRevealTimer = setTimeout(() => {
      isInitialRevealSettling = false;
    }, 350);
  }

  function finishPreload({ refresh = shouldRefresh } = {}) {
    if (preload) preload.style.display = "none";
    if (refresh) ScrollTrigger.refresh();
  }

  hasHeroPreloaded = true;
  isHeroPreloading = false;
  lenis.start();

  if (isInitialPreload) {
    isInitialRevealSettling = true;
    hasPendingResponsiveRebuild = false;
    resetScrollToTop();

    requestAnimationFrame(() => {
      resetScrollToTop();
      lenis.resize();
      ScrollTrigger.refresh();

      requestAnimationFrame(() => {
        finishPreload({ refresh: false });
        endInitialRevealSettling();
      });
    });

    return;
  }

  finishPreload();
}

function glbSplitText(el) {
  const splitText = SplitText.create(el, {
    type: "lines, words, chars",
    mask: "lines",
    aria: "hidden",
  });

  activeSplitTexts.push(splitText);
  return splitText;
}

function cleanupResponsiveAnimations(shouldRefresh = true) {
  activeSplitTexts.splice(0).forEach((splitText) => splitText.revert());
  activeSwipers.splice(0).forEach((swiper) => swiper.destroy(true, true));
  if (shouldRefresh) ScrollTrigger.refresh();
}

function getMilestoneSplitTextByIndex(index) {
  const heading = document.querySelectorAll(".ms-header h2")[index];
  const paragraph = document.querySelectorAll(".ms-header p")[index];

  return {
    heading: glbSplitText(heading),
    paragraph: glbSplitText(paragraph),
  };
}

// Tab status
const defaultTitle = document.title;

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    document.title = "Waiting for you...";
  } else {
    document.title = defaultTitle;
  }
});

// Progress bar
function initProgressBar() {
  const progressBar = document.querySelector(".progress-bar");

  if (!progressBar) return;

  ScrollTrigger.create({
    start: 0,
    end: "max",

    onUpdate: (self) => {
      gsap.set(progressBar, {
        width: `${self.progress * 100}%`,
      });
    },
  });
}

initProgressBar();

// Navmobile
const openMenus = document.querySelectorAll(".menu-mobile");
const closeMenu = document.querySelector(".navmobile-wrap p");
const menuMobileWrap = document.querySelector(".navmobile-wrap");
const menuMobile = document.querySelector(".navmobile");

openMenus.forEach((openMenu) => {
  openMenu.addEventListener("click", () => {
    gsap.to(menuMobileWrap, { display: "flex" });
    gsap.to(closeMenu, { opacity: 1 });
    gsap.fromTo(
      menuMobile,
      { rotate: 0, xPercent: 100, yPercent: -15 },
      { rotate: -10, xPercent: 8, yPercent: -15 },
    );
  });

  openMenu.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openMenu.click();
    }
  });
});

menuMobileWrap.addEventListener("click", () => {
  gsap.to(closeMenu, { opacity: 0 });
  gsap.fromTo(
    menuMobile,
    { rotate: -10, xPercent: 8, yPercent: -15 },
    { rotate: 0, xPercent: 100, yPercent: -15 },
  );
  gsap.to(menuMobileWrap, { display: "none" });
});

// Fixed menu
const fixedMenu = document.querySelector(".fixed-menu");
const footerSection = document.querySelector(".footer");

if (fixedMenu && footerSection) {
  ScrollTrigger.create({
    start: 1000,
    endTrigger: footerSection,
    end: "top 20%",
    toggleClass: {
      targets: fixedMenu,
      className: "is-appear",
    },
    invalidateOnRefresh: true,
  });
}

// Preload to hero
function initHeroPreload() {
  isHeroPreloading = true;
  // preload
  const preload = document.querySelector(".preload");
  const preloadContent = document.querySelector(".preload-content");
  const preloadCircle = document.querySelector(".bg-circle");
  const preloadH1 = document.querySelectorAll(".preload-content h1");
  // hero
  const heroTop = document.querySelector(".hero-top");
  const heroMid = document.querySelector(".hero-mid");
  const heroBottom = document.querySelector(".hero-bottom");
  const heroH1 = document.querySelectorAll(".hero-h1");
  const heroImg = document.querySelectorAll(".hero-img");
  const heroDuration = 1.8;
  // split text
  const heroTextST = glbSplitText(".hero-b2");
  const preloadH1ST = glbSplitText(preloadH1);
  // gsap set
  gsap.set([heroTop, heroBottom], { opacity: 0 });
  gsap.set(heroImg, { opacity: 0, scale: 0, rotate: 360 });

  const heroTl = gsap.timeline({
    onComplete: completeHeroPreload,
  });

  heroTl
    .from(preloadH1ST.lines, { yPercent: 100, delay: 0.8 })
    .to(preloadContent, { scale: 0, delay: 0.5, duration: 0.6 })
    .fromTo(
      preloadCircle,
      { clipPath: "circle(100% at 50% 50%);", scale: 1 },
      {
        clipPath: "circle(0% at 50% 50%)",
        scale: 0,
        duration: 0.8,
      },
      "<",
    );

  heroTl
    .fromTo(
      heroH1[0],
      { xPercent: -350 },
      { xPercent: 0, duration: heroDuration },
      "<",
    )
    .fromTo(
      heroH1[1],
      { xPercent: 350 },
      { xPercent: 0, duration: heroDuration },
      "<",
    )
    .to(
      heroImg,
      {
        opacity: 1,
        scale: 1,
        rotate: 0,
        duration: 1.2,
      },
      "<0.8",
    )
    .to([heroTop, heroBottom], {
      opacity: 1,
      duration: 1.3,
    })
    .from(heroTextST.lines, { y: 50, duration: 1 }, "<0.2");
}

function initHeroPreloadRes() {
  isHeroPreloading = true;
  // preload
  const preload = document.querySelector(".preload");
  const preloadContent = document.querySelector(".preload-content");
  const preloadCircle = document.querySelector(".bg-circle");
  const preloadH1 = document.querySelectorAll(".preload-content h1");
  // hero
  const heroTop = document.querySelector(".hero-top");
  const heroMid = document.querySelector(".hero-mid");
  const heroBottom = document.querySelector(".hero-bottom");
  const heroH1 = document.querySelectorAll(".hero-h1");
  const heroImg = document.querySelectorAll(".hero-img");
  const heroDuration = 1.2;
  // split text
  const preloadH1ST = glbSplitText(preloadH1);
  const heroTextST = glbSplitText(".hero-b2");
  // gsap set
  gsap.set([heroTop, heroBottom], { opacity: 0 });
  gsap.set(heroImg, { opacity: 0, scale: 0, rotate: 360 });

  const heroTl = gsap.timeline({
    onComplete: completeHeroPreload,
  });

  heroTl
    .from(preloadH1ST.lines, { yPercent: 100, delay: 0.8 })
    .to(preloadContent, { scale: 0, delay: 0.5, duration: 0.6 })
    .fromTo(
      preloadCircle,
      { clipPath: "circle(100% at 50% 50%);", scale: 1 },
      {
        clipPath: "circle(0% at 50% 50%)",
        scale: 0,
        duration: 0.8,
      },
      "<",
    );

  heroTl
    .fromTo(
      heroH1[0],
      { xPercent: -300 },
      { xPercent: 0, duration: heroDuration },
      "<",
    )
    .fromTo(
      heroH1[1],
      { xPercent: 300 },
      { xPercent: 0, duration: heroDuration },
      "<",
    )
    .to(
      heroImg,
      {
        opacity: 1,
        scale: 1,
        rotate: 0,
        duration: heroDuration,
        delay: 0.5,
      },
      "<0.3",
    )
    .to([heroTop, heroBottom], {
      opacity: 1,
      duration: heroDuration,
    })
    .from(heroTextST.lines, { y: 50 }, "<0.3");
}

// Evolution
function initEvolution() {
  const evoH1 = document.querySelector(".evo-wrap h1");
  const evoP = document.querySelector(".evo-wrap p");
  const evoH1ST = glbSplitText(evoH1);
  const evoPST = glbSplitText(evoP);

  const evoImgs = document.querySelectorAll(".evo-img");

  const evoTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".evolution-wrap",
      start: "top 30%",
      end: "bottom bottom",
      toggleActions: "play none none none",
    },
  });

  if (window.innerWidth >= 601) {
    evoTl.fromTo(
      evoImgs,
      { clipPath: "inset(50% 50% 50% 50%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.5,
        stagger: 0.1,
      },
    );
  }
  evoTl
    .from(evoH1ST.lines, { y: 150, stagger: 0.1 }, "<0.1")
    .from(evoPST.lines, { y: 100, stagger: 0.1 }, "<0.2");

  const evoTl2 = gsap.timeline({
    scrollTrigger: {
      trigger: ".evolution-wrap",
      start: "20% top",
      end: "80% bottom",
      scrub: 1,
    },
  });

  evoTl2.fromTo(
    "#msTop",
    { clipPath: "inset(50% 50% 50% 50%)" },
    {
      clipPath: "inset(0% 0% 0% 0%)",
      ease: "none",
    },
  );

  const evoTl3 = gsap.timeline({
    scrollTrigger: {
      trigger: ".evolution-wrap",
      start: "50% top",
      end: "bottom bottom",
      toggleActions: "play none none none",
    },
  });

  const msSplit = getMilestoneSplitTextByIndex(0);

  evoTl3
    .from(msSplit.heading.lines, { y: 150, stagger: 0.1 })
    .from(msSplit.paragraph.lines, { y: 100, stagger: 0.1 }, "<0.1");
}

// Milestone
const msImg = document.querySelectorAll(".ms-img-wrap-border");

function initMilestone() {
  const msSplit1 = getMilestoneSplitTextByIndex(1);
  const msSplit2 = getMilestoneSplitTextByIndex(2);

  const msTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".milestone-sticky",
      start: "10% top",
      end: "bottom bottom",
      scrub: 1,
    },
  });

  msTl.to("#ms2", { scale: 0.8, rotate: 5, opacity: 0.5 });
  msTl.to("#ms3", { scale: 0.8, rotate: -5 });

  const msTl2 = gsap.timeline({
    scrollTrigger: {
      trigger: ".milestone-sticky",
      start: "top 50%",
      end: "bottom bottom",
      toggleActions: "play none none none",
    },
  });

  msTl2
    .from(msSplit1.heading.lines, { y: 150, stagger: 0.1 })
    .from(msSplit1.paragraph.lines, { y: 100, stagger: 0.1 }, "<0.1")
    .fromTo(
      msImg[1],
      { clipPath: "inset(50% 50% 50% 50%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        ease: "none",
      },
      "<0.2",
    );

  const msTl3 = gsap.timeline({
    scrollTrigger: {
      trigger: ".milestone-sticky",
      start: "60% 85%",
      end: "bottom bottom",
      toggleActions: "play none none none",
    },
  });

  msTl3
    .from(msSplit2.heading.lines, { y: 150, stagger: 0.1 })
    .from(msSplit2.paragraph.lines, { y: 100, stagger: 0.1 }, "<0.1")
    .fromTo(
      msImg[2],
      { clipPath: "inset(50% 50% 50% 50%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        ease: "none",
      },
      "<0.1",
    );
}

function initMilestoneRes() {
  const msSplit1 = getMilestoneSplitTextByIndex(1);
  const msSplit2 = getMilestoneSplitTextByIndex(2);

  const msTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".milestone-sticky",
    },
  });

  const msTl2 = gsap.timeline({
    scrollTrigger: {
      trigger: ".milestone-sticky",
      start: "top 50%",
      end: "bottom bottom",
      toggleActions: "play none none none",
    },
  });

  msTl2
    .from(msSplit1.heading.lines, { y: 150, stagger: 0.1 })
    .from(msSplit1.paragraph.lines, { y: 100, stagger: 0.1 }, "<0.1")
    .fromTo(
      msImg[1],
      { clipPath: "inset(50% 50% 50% 50%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        ease: "none",
      },
      "<0.2",
    );

  const msTl3 = gsap.timeline({
    scrollTrigger: {
      trigger: ".milestone-sticky",
      start: "40% 50%",
      end: "bottom bottom",
      toggleActions: "play none none none",
    },
  });

  msTl3
    .from(msSplit2.heading.lines, { y: 150, stagger: 0.1 })
    .from(msSplit2.paragraph.lines, { y: 100, stagger: 0.1 }, "<0.1")
    .fromTo(
      msImg[2],
      { clipPath: "inset(50% 50% 50% 50%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        ease: "none",
      },
      "<0.1",
    );
}

// Anatomy
function initAnatomy() {
  const preH1 = document.querySelector(".pre-anatomy h1");
  const preH1ST = glbSplitText(preH1);
  const preImg = document.querySelector(".pre-img");
  const preImgInner = document.querySelector(".pre-img img");

  let imgPreMove = gsap
    .timeline({
      delay: 3,
      repeat: -1,
      yoyo: true,
      paused: true,
    })
    .to(".pre-img", { y: "-24px", duration: 1, ease: "power1.inOut" });

  let imgMainMove = gsap
    .timeline({
      delay: 3,
      repeat: -1,
      yoyo: true,
      paused: true,
    })
    .to("#anabm", {
      y: "-24px",
      duration: 1,
      ease: "power1.inOut",
    });

  // Pre anatomy
  const preAnaTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".anatomy-wrapper",
      start: "top 50%",
      end: "bottom bottom",
      toggleActions: "play none none reverse",
    },
  });

  preAnaTl.from(preH1ST.lines, { y: 150, stagger: 0.1 });
  preAnaTl.from(preImgInner, { scale: 0.5, opacity: 0 }, "<0.1");
  preAnaTl.from(preImg, { onComplete: () => imgPreMove.play() });

  // Main anatomy
  const anaTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".anatomy-wrapper",
      start: "20% 10%",
      end: "bottom bottom",
      scrub: 1,
    },
  });

  anaTl
    .to(preImg, { scale: 0, duration: 1 })
    .fromTo(
      ".anatomy",
      { clipPath: "polygon(60% 0, 60% 0, 40% 100%, 40% 100%)" },
      {
        clipPath: "polygon(0% 0, 100% 0, 100% 100%, 0% 100%)",
        ease: "none",
        duration: 1,
      },
      "<0.2",
    )
    .from("#startRed", { scale: 0, opacity: 0 }, "<0.6")
    .from("#anabm", { scale: 0, opacity: 0 }, "<0.1")
    .from(".ana-banhmi", { onComplete: () => imgMainMove.play() });

  const anaTl2 = gsap
    .timeline({
      scrollTrigger: {
        trigger: ".anatomy-wrapper",
        start: "50% 20%",
        end: "bottom bottom",
        toggleActions: "play none none reverse",
      },
    })
    .from(
      "#list1 p",
      {
        opacity: 0,
        stagger: { each: 0.1, from: "start" },
      },
      "<",
    )
    .from("#list2 p", { opacity: 0, stagger: { each: 0.1, from: "end" } }, "<");
}

// Anatomy
function initAnatomyRes() {
  const preH1 = document.querySelector(".pre-anatomy h1");
  const preH1ST = glbSplitText(preH1);
  const preImg = document.querySelector(".pre-img");
  const preImgInner = document.querySelector(".pre-img img");

  let imgPreMove = gsap
    .timeline({
      delay: 3,
      repeat: -1,
      yoyo: true,
      paused: true,
    })
    .to(".pre-img", { y: "-24px", duration: 1, ease: "power1.inOut" });

  let imgMainMove = gsap
    .timeline({
      delay: 3,
      repeat: -1,
      yoyo: true,
      paused: true,
    })
    .to("#anabm", {
      y: "-16px",
      duration: 1,
      ease: "power1.inOut",
    });

  // Pre anatomy
  const preAnaTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".anatomy-wrapper",
      start: "top 50%",
      end: "bottom bottom",
      toggleActions: "play none none reverse",
    },
  });

  preAnaTl.from(preH1ST.lines, { y: 150, stagger: 0.1 });
  preAnaTl.from(preImgInner, { scale: 0.5, opacity: 0 }, "<0.1");
  preAnaTl.from(preImg, { onComplete: () => imgPreMove.play() });

  // Main anatomy
  const anaTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".anatomy-wrapper",
      start: "20% top",
      end: "bottom bottom",
      scrub: 1,
    },
  });

  anaTl
    .to(preImg, { scale: 0, duration: 1 })
    .fromTo(
      ".anatomy",
      { clipPath: "polygon(60% 0, 60% 0, 40% 100%, 40% 100%)" },
      {
        clipPath: "polygon(0% 0, 100% 0, 100% 100%, 0% 100%)",
        ease: "none",
      },
      "<0.1",
    )
    .from("#startRed", { scale: 0, opacity: 0 }, "<0.6")
    .from("#anabm", { scale: 0, opacity: 0 }, "<0.2")
    .from(".ana-banhmi", { onComplete: () => imgMainMove.play() });

  const anaTl2 = gsap
    .timeline({
      scrollTrigger: {
        trigger: ".anatomy-wrapper",
        start: "50% 20%",
        end: "bottom bottom",
        toggleActions: "play none none reverse",
      },
    })
    .from(
      "#list1 p",
      {
        opacity: 0,
        stagger: { each: 0.1, from: "start" },
      },
      "<",
    )
    .from("#list2 p", { opacity: 0, stagger: { each: 0.1, from: "end" } }, "<");
}

// Fillings
function initFillings() {
  const flH1 = document.querySelectorAll(".fillings-content h1");
  const flText = document.querySelectorAll(".fl-wrap p");
  const flBgs = document.querySelectorAll(".fillings-bg");

  const flH1TopST = glbSplitText(flH1[0]);
  const flH1MidST = glbSplitText(flH1[1]);
  const flH1BottomST = glbSplitText(flH1[2]);

  const flTextST = glbSplitText(flText);

  const flTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".fl-wrapper",
      start: "top 10%",
      end: "bottom bottom",
      toggleActions: "play none none reverse",
    },
  });

  flTl
    .from(flH1TopST.lines, { y: 150 })
    .from(
      flBgs[0],
      { clipPath: "inset(0% 50% 0% 50%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        ease: "none",
      },
    )
    .from(flH1MidST.lines, { y: 150 }, "<0.1")
    .from(
      flBgs[1],
      { clipPath: "inset(0% 50% 0% 50%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        ease: "none",
      },
      "<0.1",
    )
    .from(flH1BottomST.lines, { y: 150 }, "<0.2")
    .from(
      flBgs[2],
      { clipPath: "inset(0% 50% 0% 50%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        ease: "none",
      },
      "<0.2",
    );

  const flRows = document.querySelectorAll(".fillings-content");

  const flTl2 = gsap.timeline({
    scrollTrigger: {
      trigger: ".fl-wrapper",
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
    },
  });

  flTl2
    .from(".fl-carousel", { display: "none" })
    .to([flRows[0], flRows[2]], {
      xPercent: 300,
      duration: 1.2,
      ease: "none",
      rotate: 80,
      scale: 0.2,
    })
    .to(
      flRows[1],
      {
        xPercent: -300,
        duration: 1.2,
        ease: "none",
        rotate: -80,
        scale: 0.2,
      },
      "<",
    )
    .fromTo(
      ".fl-slide-wrap",
      { clipPath: "inset(0% 50% 0% 50% )", scale: 0.2 },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        ease: "none",
        scale: 1,
      },
      "<0.3",
    );

  const flTl3 = gsap.timeline({
    scrollTrigger: {
      trigger: ".fl-wrapper",
      start: "60% 50%",
      end: "bottom bottom",
      toggleActions: "play none none reverse",
    },
  });

  flTl3
    .from(flTextST.lines, { y: 50, stagger: 0.01 })
    .from("#btnPrev", { xPercent: 80, rotate: 360, opacity: 0 }, "<0.1")
    .from("#btnNext", { xPercent: -80, rotate: 360, opacity: 0 }, "<");
}

// Carousel
function initSlide() {
  const carousel = new Swiper(".fl-slide-wrap", {
    wrapperClass: "fl-slide",
    slideClass: "fl-img",
    loop: true,
    navigation: {
      nextEl: "#btnNext",
      prevEl: "#btnPrev",
    },
    autoplay: {
      delay: 1800,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 16,
      },
      480: {
        slidesPerView: 2,
        spaceBetween: 16,
      },
      768: {
        slidesPerView: 2,
        spaceBetween: 16,
      },
      992: {
        slidesPerView: 3,
        spaceBetween: 24,
      },
      1439: {
        slidesPerView: 4,
        spaceBetween: 24,
      },
    },
    speed: 500,
  });

  activeSwipers.push(carousel);
}

document.querySelectorAll(".btn[role='button']").forEach((button) => {
  button.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      button.click();
    }
  });
});

// Street
const streetH1 = document.getElementById("h1BigTypo");
const streetImg = document.querySelectorAll(".st-img");

function initStreet() {
  const streetTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".street",
      start: "top 5%",
      end: "100% 90%",
      scrub: 1,
    },
  });

  streetTl.fromTo(
    streetH1,
    { clipPath: "inset(0% 0% 100% 0%)" },
    {
      clipPath: "inset(0% 0% 0% 0%)",
      ease: "none",
    },
  );
}

function initStreetRes() {
  const streetTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".street",
      start: "top 40%",
      end: "100% 80%",
      scrub: 1,
    },
  });

  streetTl.fromTo(
    streetH1,
    { clipPath: "inset(0% 0% 100% 0%)" },
    {
      clipPath: "inset(0% 0% 0% 0%)",
      ease: "none",
    },
  );
}

// Footer
function initFooter() {
  const ftBigTypo = document.querySelectorAll(".ft-content h1");
  const ftBigTypoST = glbSplitText(ftBigTypo);
  const ftBmvn = document.querySelectorAll(".ft-bmvn img");

  const footerTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".footer",
      start: "top 20%",
      end: "bottom 80%",
      toggleActions: "play none none none",
    },
  });

  footerTl.from("#ftPaper", { scale: 0 });
  footerTl.from(ftBmvn, { yPercent: 150, stagger: 0.1 }, "<");
  footerTl.from(".ft-img-top", { x: -400 }, "<0.1");
  footerTl.from(".ft-img-bottom", { x: 400 }, "<");
}

function initResponsive() {
  let ctx;
  let resizeTimer;
  let currentMode = null;
  let lastLayoutWidth = window.innerWidth;

  function getResponsiveMode() {
    return window.matchMedia("(min-width: 992px)").matches
      ? "desktop"
      : "responsive";
  }

  function resetHeroAfterResponsiveRebuild() {
    gsap.set(
      [".hero-top", ".hero-bottom", ".hero-h1", ".hero-img", ".hero-b2"],
      { clearProps: "all" },
    );
    lenis.start();
  }

  function initScrollAnimations(mode) {
    initEvolution();
    mode === "desktop" ? initMilestone() : initMilestoneRes();
    mode === "desktop" ? initAnatomy() : initAnatomyRes();
    mode === "desktop" ? initStreet() : initStreetRes();
    initFillings();
    initSlide();
    initFooter();
  }

  function initAll({ playHero = false } = {}) {
    if (!playHero && isHeroPreloading) {
      hasPendingResponsiveRebuild = true;
      return;
    }

    const mode = getResponsiveMode();
    const shouldResetBeforeInit = playHero && !hasHeroPreloaded;

    ctx?.revert();
    cleanupResponsiveAnimations(false);
    lenis.stop();

    if (shouldResetBeforeInit) resetScrollToTop();

    ctx = gsap.context(() => {
      if (playHero && !hasHeroPreloaded) {
        mode === "desktop" ? initHeroPreload() : initHeroPreloadRes();
      } else {
        completeHeroPreload({ shouldRefresh: false });
        resetHeroAfterResponsiveRebuild();
      }

      initScrollAnimations(mode);
    });

    currentMode = mode;
  }

  document.fonts.ready.then(() => {
    requestAnimationFrame(() => {
      initAll({ playHero: true });
    });
  });

  function queueResponsiveRebuild({ force = false } = {}) {
    const nextWidth = window.innerWidth;
    const nextMode = getResponsiveMode();
    const widthChanged = Math.abs(nextWidth - lastLayoutWidth) > 2;
    const modeChanged = nextMode !== currentMode;

    if (!force && !widthChanged && !modeChanged) return;

    if (isInitialRevealSettling && !force) {
      lastLayoutWidth = nextWidth;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        lenis.resize();
        ScrollTrigger.update();
      }, 150);
      return;
    }

    if (isHeroPreloading) {
      hasPendingResponsiveRebuild = true;
      lastLayoutWidth = nextWidth;
      return;
    }

    lastLayoutWidth = nextWidth;
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {
      initAll();
      ScrollTrigger.refresh();
    }, 150);
  }

  runPendingResponsiveRebuild = () => queueResponsiveRebuild({ force: true });

  window.addEventListener("resize", () => {
    queueResponsiveRebuild();
  });

  window.addEventListener("orientationchange", () => {
    queueResponsiveRebuild({ force: true });
  });
}

initResponsive();
