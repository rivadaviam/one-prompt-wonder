import { motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

const projects = [
  { id: 1, title: 'Jumbo Zomercampagne', client: 'Jumbo', category: '360°', color: '#FFD700' },
  { id: 2, title: 'Douwe Egberts Mornings', client: 'Douwe Egberts', category: 'Social', color: '#8B4513' },
  { id: 3, title: 'HEMA Sinterklaas', client: 'Hema', category: 'Activation', color: '#E74C3C' },
  { id: 4, title: 'KFC Fan Week', client: 'KFC', category: 'Design', color: '#E8423B' },
  { id: 5, title: 'Netflix Drop', client: 'Netflix', category: 'Social', color: '#141414' },
  { id: 6, title: 'Bol Black Friday', client: 'Bol', category: '360°', color: '#0077CC' },
  { id: 7, title: 'Swapfiets Spring', client: 'Swapfiets', category: 'Social', color: '#2563EB' },
  { id: 8, title: 'ANWB Roadtrip', client: 'ANWB', category: 'Video', color: '#F59E0B' },
  { id: 9, title: 'Oxxio Energie', client: 'Oxxio', category: 'Design', color: '#10B981' },
  { id: 10, title: 'Ace & Tate Lookbook', client: 'Ace & Tate', category: 'Social', color: '#1F2937' },
  { id: 11, title: 'Jumbo Summer 360', client: 'Jumbo', category: '360°', color: '#FCD34D' },
  { id: 12, title: 'KFC Nacho Relaunch', client: 'KFC', category: 'Activation', color: '#DC2626' },
  { id: 13, title: 'Netflix Serie Drop', client: 'Netflix', category: 'Design', color: '#7F1D1D' },
  { id: 14, title: 'HEMA Kids', client: 'Hema', category: 'Social', color: '#F97316' },
  { id: 15, title: 'Douwe Egberts Barista', client: 'Douwe Egberts', category: 'Video', color: '#92400E' },
  { id: 16, title: 'Bol Summer Campaign', client: 'Bol', category: '360°', color: '#3B82F6' },
  { id: 17, title: 'Swapfiets Amsterdam', client: 'Swapfiets', category: 'Activation', color: '#1D4ED8' },
]

const categoryColors: Record<string, string> = {
  '360°': 'bg-black text-white',
  Social: 'bg-pink-100 text-pink-800',
  Activation: 'bg-yellow-100 text-yellow-800',
  Design: 'bg-blue-100 text-blue-800',
  Video: 'bg-purple-100 text-purple-800',
}

export default function WorkSection() {
  const { ref, isInView } = useScrollAnimation()
  const galleryRef = useRef<HTMLDivElement>(null)

  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  function onMouseDown(e: React.MouseEvent) {
    if (!galleryRef.current) return
    setIsDragging(true)
    startX.current = e.pageX - galleryRef.current.offsetLeft
    scrollLeft.current = galleryRef.current.scrollLeft
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!isDragging || !galleryRef.current) return
    e.preventDefault()
    const x = e.pageX - galleryRef.current.offsetLeft
    const walk = (x - startX.current) * 1.5
    galleryRef.current.scrollLeft = scrollLeft.current - walk
  }

  function onMouseUp() {
    setIsDragging(false)
  }

  return (
    <section id="work" className="py-24 overflow-hidden">
      <div ref={ref} className="px-6 md:px-10 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-end justify-between"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-black/40 mb-3">Our work</p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Selected projects</h2>
          </div>
          <p className="hidden md:block text-sm text-black/50 font-medium max-w-xs text-right">
            Drag to explore — {projects.length} projects across brand, social & activations
          </p>
        </motion.div>
      </div>

      {/* Draggable gallery */}
      <div
        ref={galleryRef}
        className="flex gap-4 px-6 md:px-10 overflow-x-auto hide-scrollbar drag-cursor select-none"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {projects.map((project, i) => (
          <motion.article
            key={project.id}
            className="flex-none w-72 md:w-80 group"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: Math.min(i * 0.05, 0.4), ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Image area */}
            <div
              className="relative w-full aspect-[4/5] overflow-hidden mb-4"
              style={{ backgroundColor: project.color }}
            >
              {/* Abstract pattern overlay */}
              <div className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.3) 0px, rgba(255,255,255,0.3) 1px, transparent 1px, transparent 50%)`,
                  backgroundSize: '20px 20px',
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white/20 font-black text-7xl uppercase tracking-tighter">
                  {project.client.charAt(0)}
                </span>
              </div>
              <motion.div
                className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-end p-5"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-white font-bold text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  View project →
                </span>
              </motion.div>
            </div>

            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-black/40 font-semibold mb-1">{project.client}</p>
                <h3 className="font-bold text-base leading-tight">{project.title}</h3>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-none ${categoryColors[project.category] ?? 'bg-gray-100 text-gray-700'}`}>
                {project.category}
              </span>
            </div>
          </motion.article>
        ))}
      </div>

      <div className="px-6 md:px-10 mt-6">
        <p className="text-xs text-black/30 font-medium md:hidden">← Drag to explore →</p>
      </div>
    </section>
  )
}
