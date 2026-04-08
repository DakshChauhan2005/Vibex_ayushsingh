import { motion } from "framer-motion";

export default function SectionWrapper({ id, className = "", children, title, subtitle, eyebrow }) {
  return (
    <section id={id} className={`mx-auto w-full max-w-6xl px-4 py-16 md:px-6 ${className}`}>
      {(eyebrow || title || subtitle) ? (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.45 }}
          className="mb-10"
        >
          {eyebrow ? (
            <p className="type-display text-xs font-bold uppercase tracking-[0.22em] text-orange-600">{eyebrow}</p>
          ) : null}
          {title ? <h2 className="type-display mt-3 text-4xl font-black text-brand-950 md:text-5xl">{title}</h2> : null}
          {subtitle ? <p className="mt-3 max-w-2xl text-base text-brand-700 md:text-lg">{subtitle}</p> : null}
        </motion.div>
      ) : null}
      {children}
    </section>
  );
}
