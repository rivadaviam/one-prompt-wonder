import { useState } from "react";
import heroImage from "./assets/banh-mi-hero.png";

const navItems = [
  { label: "Top", href: "#top" },
  { label: "Story", href: "#story" },
  { label: "Anatomy", href: "#anatomy" },
  { label: "Fillings", href: "#fillings" },
  { label: "Street icon", href: "#street" },
];

const timeline = [
  {
    year: "1859",
    title: "The arrival",
    text: "Originally brought to Saigon as the French baguette, it was a luxury reserved for the elite and known simply as Western Bread.",
  },
  {
    year: "1958",
    title: "The rebirth",
    text: "At Hòa Mã, the baguette was transformed with local flavors, lighter crunch, and a design built for the city's fast-moving street life.",
  },
  {
    year: "2011",
    title: "Global recognition",
    text: "The word Banh Mi entered the Oxford English Dictionary, becoming a global ambassador for Vietnam's creativity and resilience.",
  },
];

const ingredients = [
  "Baguette",
  "Cold cuts",
  "Pork rolls",
  "Margarine",
  "Sauce",
  "Pate",
  "Pickled daikon",
  "Cucumber",
  "Coriander",
  "Pepper",
  "Carrot",
  "Chilli",
];

const fillings = [
  "Classic pate and cold cuts",
  "Grilled pork",
  "Chicken with herbs",
  "Egg breakfast style",
  "Tofu and pickles",
  "Sardine tomato sauce",
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="site-shell" id="top">
      <header className="topbar">
        <a className="brand" href="#top" onClick={closeMenu}>
          Bánh Mì Vietnam
        </a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <button
          className="menu-button"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span>{menuOpen ? "Close" : "Menu"}</span>
        </button>
      </header>

      {menuOpen && (
        <nav className="mobile-nav" id="mobile-menu" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={closeMenu}>
              {item.label}
            </a>
          ))}
        </nav>
      )}

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-tags" aria-hidden="true">
            <span>Crispy</span>
            <span>Tasty</span>
            <span>Irresistible</span>
          </div>
          <div className="hero-copy">
            <p className="taste">#TheTasteOfVietnam</p>
            <h1 id="hero-title">
              <span>Banh mi</span>
              <span>Viet nam</span>
            </h1>
            <p className="pronunciation">/ˌbɑːn ˈmiː/ (noun)</p>
            <p className="hero-text">
              More than just a sandwich, it is a legendary, crispy flavor that resonates
              through generations. Feel the soul of Vietnam with every bite.
            </p>
            <a className="cta" href="#anatomy">
              Discover the crunch
            </a>
          </div>
          <div className="hero-media" aria-label="Vietnamese banh mi sandwich">
            <img src={heroImage} alt="Vietnamese banh mi sandwich with herbs and pickles" />
          </div>
        </section>

        <section className="story section-band" id="story" aria-labelledby="story-title">
          <div className="section-heading">
            <p>From a French delicacy to a Vietnamese street icon</p>
            <h2 id="story-title">The Evolution of bánh mì</h2>
          </div>
          <div className="timeline">
            {timeline.map((item) => (
              <article className="timeline-card" key={item.year}>
                <span className="year">{item.year}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="anatomy section-band" id="anatomy" aria-labelledby="anatomy-title">
          <div className="section-heading wide">
            <p>Discover the delicate balance of textures and flavors</p>
            <h2 id="anatomy-title">Anatomy</h2>
          </div>
          <div className="anatomy-layout">
            <div className="sandwich-diagram" aria-hidden="true">
              <div className="bread top"></div>
              <div className="layer herbs"></div>
              <div className="layer pickles"></div>
              <div className="layer meat"></div>
              <div className="layer sauce"></div>
              <div className="bread bottom"></div>
            </div>
            <ul className="ingredient-list">
              {ingredients.map((ingredient) => (
                <li key={ingredient}>{ingredient}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="fillings section-band" id="fillings" aria-labelledby="fillings-title">
          <div className="section-heading">
            <p>Banh mi pairs with countless Vietnamese dishes</p>
            <h2 id="fillings-title">
              Types of <span>Bánh mì</span> Fillings
            </h2>
          </div>
          <div className="filling-grid">
            {fillings.map((filling, index) => (
              <article className="filling-card" key={filling}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{filling}</h3>
              </article>
            ))}
          </div>
        </section>

        <section className="street" id="street" aria-labelledby="street-title">
          <div>
            <p>Street icon</p>
            <h2 id="street-title">Bánh mì can easily be found anywhere on the streets of Vietnam</h2>
          </div>
          <a className="back-top" href="#top">
            Go to top
          </a>
        </section>
      </main>

      <footer>
        <p>©2026. Created by HoQuan</p>
      </footer>
    </div>
  );
}

export default App;
