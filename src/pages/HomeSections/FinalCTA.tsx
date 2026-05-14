import { motion } from "motion/react";
import { NmaGlassButton, NmaGlassSurface } from "../../components/ui/nma-glass";

export default function FinalCTA() {
  const scrollToCourses = () => {
    document.getElementById("courses")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-32 relative overflow-hidden bg-nma-dark flex items-center justify-center">
      {/* Background glow */}
      <div className="absolute inset-0 bg-radial-purple opacity-70 pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <NmaGlassSurface tone="purple" className="p-12 md:p-20 rounded-[3rem]">
            <div className="absolute top-0 right-0 w-[16rem] h-64 bg-nma-purple/10 blur-[5rem] rounded-full pointer-events-none" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight relative z-10">
              Ramai spectator sau intri in teren?
            </h2>
            <p className="text-xl text-nma-silver mb-12 max-w-2xl mx-auto relative z-10 font-light">
              Decizia ta de astazi va dicta cine vei fi peste un an. Intra in NMA si incepe sa construiesti.
            </p>
            <NmaGlassButton
              glow="purple"
              onClick={scrollToCourses}
              className="px-12 py-5 text-[0.875rem] font-bold uppercase tracking-[0.05em] rounded-full transition-all w-full sm:w-auto relative z-10"
            >
              Construieste Acum
            </NmaGlassButton>
          </NmaGlassSurface>
        </motion.div>
      </div>
    </section>
  );
}
