import { motion } from 'framer-motion'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

const clients = [
  'Jumbo', 'Douwe Egberts', 'Hema', 'KFC', 'Netflix',
  'Bol', 'ANWB', 'Swapfiets', 'Oxxio', 'Ace & Tate',
  'Jumbo', 'Douwe Egberts', 'Hema', 'KFC', 'Netflix',
  'Bol', 'ANWB', 'Swapfiets', 'Oxxio', 'Ace & Tate',
]

export default function ClientsSection() {
  const { ref, isInView } = useScrollAnimation()

  return (
    <section className="py-24 border-t border-black/10 overflow-hidden">
      <div className="px-6 md:px-10 mb-12" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-black/40 mb-3">Clients</p>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter">
            Brands we've built for
          </h2>
        </motion.div>
      </div>

      {/* Marquee strip */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative border-y border-black/10 py-6 overflow-hidden"
      >
        <div className="marquee-track">
          {clients.map((client, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-6 px-8 text-xl md:text-2xl font-black tracking-tight whitespace-nowrap"
            >
              {client}
              <span className="w-2 h-2 rounded-full bg-black/20 flex-none" />
            </span>
          ))}
        </div>
      </motion.div>

      {/* Logo grid */}
      <div className="px-6 md:px-10 mt-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-px border border-black/10">
          {clients.slice(0, 10).map((client, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex items-center justify-center py-10 px-6 border border-black/10 hover:bg-black hover:text-white transition-colors duration-300 group cursor-default"
            >
              <span className="text-sm font-black uppercase tracking-wider text-black/40 group-hover:text-white/80 transition-colors duration-300">
                {client}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
