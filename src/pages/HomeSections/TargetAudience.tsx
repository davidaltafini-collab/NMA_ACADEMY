import { motion } from "motion/react";
import { X, Check } from "lucide-react";

export default function TargetAudience() {
  return (
    <section className="py-24 bg-[#0a0a0c] border-y border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          
          {/* NOT for */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-red-500/80">✗</span> Pentru cine NU este
            </h3>
            <div className="space-y-6">
              {[
                "Cei care cauta bani usori peste noapte",
                "Spectatorii care consuma continut fara sa aplice",
                "Cei care dau vina pe algoritm sau pe ghinion",
                "Persoanele fara rabdare sa construiasca fundatii"
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                  <X className="w-5 h-5 text-red-500/50 shrink-0 mt-0.5" />
                  <span className="text-gray-400">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* IS for */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8 relative"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-nma-purple/10 blur-[6.25rem] rounded-full pointer-events-none" />
            
            <h3 className="text-2xl font-bold text-white flex items-center gap-3 relative z-10">
              <span className="text-nma-purple-light">✓</span> Pentru cine ESTE
            </h3>
            <div className="space-y-6 relative z-10">
              {[
                "Oameni decisi sa munceasca pentru viitorul lor",
                "Cei care inteleg valoarea unei structuri clare",
                "Antreprenori la inceput de drum pregatiti sa investeasca in ei",
                "Persoane care vor rezultate masurabile, nu doar teorie"
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl glass-card-purple relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-nma-purple/0 via-nma-purple/5 to-nma-purple/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <Check className="w-5 h-5 text-nma-purple-light shrink-0 mt-0.5 relative z-10" />
                  <span className="text-white relative z-10">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
