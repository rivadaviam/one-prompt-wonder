import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

const services = [
  {
    id: 'brand',
    title: 'Brand',
    number: '01',
    items: ['Strategy', 'Creative', 'Art direction', 'Copywriting', 'Editing', 'Motion graphics', 'DTP'],
    description: 'We build brands that resonate with a new generation of consumers.',
  },
  {
    id: 'social',
    title: 'Social',
    number: '02',
    items: ['Strategy', 'Content creation', 'TikTok shoots', 'Influencer campaigns', 'Community management'],
    description: 'Native social content that feels at home in any feed.',
  },
  {
    id: 'activations',
    title: 'Activations',
    number: '03',
    items: ['Strategy', 'Event planning', 'Production', 'Brand experiences', 'Guerrilla marketing'],
    description: 'Real-world moments that create online waves.',
  },
  {
    id: 'video',
    title: 'Video Production',
    number: '04',
    items: ['Campaign films', 'Branded content', 'Social video', 'Documentary', 'Live streaming'],
    description: 'Story-led video from concept through to final delivery.',
  },
  {
    id: 'partner',
    title: 'Partner Services',
    number: '05',
    items: ['PR', '3D / VFX', 'Food styling', 'Photography', 'Audio production'],
    description: 'Extended capabilities through our trusted partner network.',
  },
]

export default function ServicesSection() {
  const [open, setOpen] = useState<string | null>('brand')
  const { ref, isInView } = useScrollAnimation()

  return (
    <section id="services" className="py-24 border-t border-black/10">
      <div className="px-6 md:px-10">
        <div ref={ref}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-16"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-black/40 mb-3">What we do</p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Services</h2>
          </motion.div>
        </div>

        <div className="max-w-3xl">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="border-t border-black/10 last:border-b"
            >
              <button
                onClick={() => setOpen(open === service.id ? null : service.id)}
                className="w-full flex items-center justify-between py-6 text-left group"
              >
                <div className="flex items-center gap-6">
                  <span className="text-xs font-bold text-black/30 w-6">{service.number}</span>
                  <span className="text-2xl md:text-3xl font-black tracking-tight group-hover:opacity-60 transition-opacity duration-200">
                    {service.title}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: open === service.id ? 45 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-8 h-8 border border-black/20 flex items-center justify-center flex-none ml-4"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {open === service.id && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="pb-8 pl-12 flex flex-col md:flex-row gap-8">
                      <p className="text-black/50 font-medium text-sm max-w-xs">{service.description}</p>
                      <ul className="flex flex-wrap gap-2">
                        {service.items.map((item) => (
                          <li
                            key={item}
                            className="text-sm font-semibold px-4 py-2 border border-black/10 hover:border-black/40 transition-colors duration-200"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
