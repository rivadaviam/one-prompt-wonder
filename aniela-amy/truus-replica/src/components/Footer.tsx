import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <footer className="border-t border-black/10 pt-20 pb-10 px-6 md:px-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mb-16"
      >
        <h2 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter mb-6">
          Let's make<br />
          <span className="italic">something great.</span>
        </h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <a
            href="mailto:hello@truus.co"
            className="text-xl md:text-2xl font-bold underline underline-offset-4 hover:opacity-50 transition-opacity duration-200"
          >
            hello@truus.co
          </a>
          <span className="hidden sm:inline text-black/20">·</span>
          <a
            href="https://wa.me/31000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-bold bg-[#25D366] text-white px-5 py-3 hover:opacity-80 transition-opacity duration-200"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp us
          </a>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-10 border-t border-black/10 pt-10"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-black/40 mb-3">Address</p>
          <address className="not-italic text-sm font-medium leading-relaxed">
            Papaverhof 21<br />
            Amsterdam<br />
            The Netherlands
          </address>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-black/40 mb-3">Social</p>
          <div className="flex flex-col gap-2">
            {[
              { label: 'Instagram', href: '#' },
              { label: 'TikTok', href: '#' },
              { label: 'LinkedIn', href: '#' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-bold hover:opacity-40 transition-opacity duration-200 w-fit"
              >
                {link.label} ↗
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-black/40 mb-3">Studio</p>
          <p className="text-sm font-medium text-black/60 leading-relaxed">
            Founded in Amsterdam.<br />
            Making advertising<br />
            for the new mainstream.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-16 pt-8 border-t border-black/10"
      >
        <p className="text-xs text-black/30 font-medium">
          © {new Date().getFullYear()} Truus — All rights reserved
        </p>
        <p className="text-xs text-black/30 font-medium">
          Design by Jordan & Dennis
        </p>
      </motion.div>
    </footer>
  )
}
