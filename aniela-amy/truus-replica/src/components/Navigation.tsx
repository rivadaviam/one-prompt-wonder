import { motion, useScroll, useTransform } from 'framer-motion'
import { useState } from 'react'

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { scrollY } = useScroll()
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 1])

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 bg-white"
      style={{
        borderBottom: '1px solid',
        borderColor: borderOpacity.get() > 0 ? `rgba(0,0,0,${borderOpacity.get()})` : 'transparent',
      }}
    >
      <nav className="flex items-center justify-between px-6 md:px-10 h-16">
        <a
          href="#hero"
          className="text-xl font-black tracking-tight uppercase hover:opacity-60 transition-opacity duration-200"
        >
          Truus
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-10">
          <a href="#work" className="text-sm font-semibold tracking-wide uppercase hover:opacity-50 transition-opacity duration-200">
            Work
          </a>
          <a href="#team" className="text-sm font-semibold tracking-wide uppercase hover:opacity-50 transition-opacity duration-200">
            Team
          </a>
          <a href="#services" className="text-sm font-semibold tracking-wide uppercase hover:opacity-50 transition-opacity duration-200">
            Services
          </a>
          <a
            href="mailto:hello@truus.co"
            className="text-sm font-semibold tracking-wide uppercase border border-black px-5 py-2 hover:bg-black hover:text-white transition-colors duration-200"
          >
            Contact
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <motion.span
            className="block w-6 h-0.5 bg-black"
            animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 7 : 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.span
            className="block w-6 h-0.5 bg-black"
            animate={{ opacity: menuOpen ? 0 : 1 }}
            transition={{ duration: 0.2 }}
          />
          <motion.span
            className="block w-6 h-0.5 bg-black"
            animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -7 : 0 }}
            transition={{ duration: 0.2 }}
          />
        </button>
      </nav>

      {/* Mobile menu */}
      <motion.div
        className="md:hidden overflow-hidden bg-white border-t border-black"
        initial={false}
        animate={{ height: menuOpen ? 'auto' : 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="flex flex-col px-6 py-6 gap-5">
          {['Work', 'Team', 'Services'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-2xl font-black uppercase tracking-tight hover:opacity-50 transition-opacity"
              onClick={() => setMenuOpen(false)}
            >
              {item}
            </a>
          ))}
          <a
            href="mailto:hello@truus.co"
            className="text-2xl font-black uppercase tracking-tight hover:opacity-50 transition-opacity"
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </a>
        </div>
      </motion.div>
    </motion.header>
  )
}
