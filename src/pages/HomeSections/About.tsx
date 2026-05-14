import { motion } from "motion/react";

export default function About() {
  return (
    <section id="manifesto" className="py-24 md:py-32 relative overflow-hidden bg-nma-dark border-t border-white/5">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-8">
            Nu suntem inca o platforma de <span className="text-nma-purple-light italic">"dezvoltare personala"</span>.
          </h2>
          
          <div className="space-y-6 text-lg md:text-xl text-nma-silver leading-relaxed font-light">
            <p>
              Am construit NMA pentru cei care s-au saturat de teorie de pe internet
              si vor sa construiasca sisteme care produc bani, ofera control si genereaza libertate.
            </p>
            <p className="text-white font-medium">
              E-commerce si Social Media nu sunt trenduri. Sunt noile fundatii ale afacerilor moderne.
            </p>
            <p>
              Iti dam strategia, pasii, template-urile si mentoratul.
              Tu trebuie sa aduci ambitia si executia.
            </p>
          </div>
          
          <div className="mt-16 w-px h-24 bg-gradient-to-b from-nma-purple/50 to-transparent mx-auto" />
        </motion.div>
      </div>
      
      {/* Decorative subtle glows */}
      <div className="absolute top-0 left-0 w-full h-full bg-radial-purple pointer-events-none opacity-50" />
    </section>
  );
}
