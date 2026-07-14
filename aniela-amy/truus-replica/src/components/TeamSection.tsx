import { motion } from 'framer-motion'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

const team = [
  { name: 'Lotte V.', role: 'Creative Director', color: '#F87171' },
  { name: 'Daan M.', role: 'Strategy Lead', color: '#60A5FA' },
  { name: 'Emma K.', role: 'Social Manager', color: '#34D399' },
  { name: 'Joris B.', role: 'Art Director', color: '#FBBF24' },
  { name: 'Roos A.', role: 'Copywriter', color: '#A78BFA' },
  { name: 'Tim H.', role: 'Motion Designer', color: '#FB923C' },
  { name: 'Sanne P.', role: 'Producer', color: '#38BDF8' },
  { name: 'Milan D.', role: 'Video Director', color: '#4ADE80' },
  { name: 'Fleur W.', role: 'Influencer Mgr', color: '#F472B6' },
  { name: 'Lars O.', role: 'Developer', color: '#94A3B8' },
  { name: 'Noor J.', role: 'Account Manager', color: '#FCD34D' },
  { name: 'Stef R.', role: 'Brand Strategist', color: '#6EE7B7' },
]

export default function TeamSection() {
  const { ref, isInView } = useScrollAnimation()

  return (
    <section id="team" className="py-24 border-t border-black/10">
      <div className="px-6 md:px-10">
        <div ref={ref}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-16"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-black/40 mb-3">The people</p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter max-w-xl">
              Young, digital-native & future-proof
            </h2>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
              className="group cursor-default"
            >
              {/* Avatar */}
              <div
                className="w-full aspect-square mb-3 overflow-hidden"
                style={{ backgroundColor: member.color }}
              >
                <div className="w-full h-full flex items-center justify-center relative">
                  {/* Abstract person silhouette */}
                  <svg viewBox="0 0 100 100" className="w-3/4 h-3/4 opacity-20">
                    <circle cx="50" cy="35" r="18" fill="white" />
                    <ellipse cx="50" cy="80" rx="28" ry="22" fill="white" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white/30 font-black text-4xl">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <motion.div
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200"
                  />
                </div>
              </div>
              <p className="font-bold text-sm leading-tight">{member.name}</p>
              <p className="text-xs text-black/40 font-medium mt-0.5">{member.role}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 flex items-center gap-6"
        >
          <p className="text-lg font-medium text-black/60">
            40+ digital natives. One shared goal: reach the new mainstream.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
