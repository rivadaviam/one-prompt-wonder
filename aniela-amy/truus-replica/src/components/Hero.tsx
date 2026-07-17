import { motion } from 'framer-motion'

const words = ['We', 'make', 'advertising', 'for', 'the', 'new', 'mainstream']
const italicWords = new Set(['advertising', 'mainstream'])

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.3,
    },
  },
}

const wordVariant = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

const subtitleVariant = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 1.1, ease: [0.22, 1, 0.36, 1] },
  },
}

const lineVariant = {
  hidden: { scaleX: 0 },
  show: {
    scaleX: 1,
    transition: { duration: 0.8, delay: 1.4, ease: [0.22, 1, 0.36, 1] },
  },
}

export default function Hero() {
  return (
    <section
      id="hero"
      className="min-h-screen flex flex-col justify-center px-6 md:px-10 pt-24 pb-16"
    >
      <div className="max-w-6xl">
        <motion.h1
          className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black leading-none tracking-tighter mb-10 flex flex-wrap gap-x-5 gap-y-2"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {words.map((word, i) => (
            <motion.span
              key={i}
              variants={wordVariant}
              className={italicWords.has(word) ? 'italic' : ''}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        <motion.div
          className="origin-left h-px bg-black mb-10"
          variants={lineVariant}
          initial="hidden"
          animate="show"
        />

        <motion.p
          className="text-xl md:text-2xl font-medium max-w-lg"
          variants={subtitleVariant}
          initial="hidden"
          animate="show"
        >
          We wanna be where the people are.
        </motion.p>

        <motion.div
          className="flex items-center gap-6 mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
        >
          <a
            href="#work"
            className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-widest group"
          >
            <span className="w-10 h-px bg-black group-hover:w-16 transition-all duration-300" />
            See our work
          </a>
          <a
            href="#team"
            className="text-sm font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors duration-200"
          >
            Meet the team
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 right-10 flex flex-col items-center gap-2 text-black/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
      >
        <span className="text-xs font-semibold uppercase tracking-widest rotate-90 origin-center">Scroll</span>
        <motion.div
          className="w-px h-12 bg-black/20 origin-top"
          animate={{ scaleY: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  )
}
