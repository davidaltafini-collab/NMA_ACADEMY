import { motion } from "motion/react";

export default function Benefits() {
  return (
    <section id="results" className="py-24 relative overflow-hidden bg-nma-dark border-y border-white/5">
       <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[50rem] h-[50rem] bg-nma-purple/10 rounded-full blur-[7.5rem] pointer-events-none" />
       
       <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Sistemul este conceput sa aduca <span className="text-transparent bg-clip-text bg-gradient-to-r from-nma-purple-light to-white">Rezultate.</span>
              </h2>
              <p className="text-lg text-gray-400 mb-8 font-light">
                Indiferent ca alegi E-Commerce sau Social Media, metodologia noastra se bazeaza pe numere, date si optimizare constanta. Nu lasam deciziile la voia intamplarii.
              </p>
              
              <ul className="space-y-6">
                {[
                  { title: "Control", desc: "Invata sa creezi trafic la cerere, fara sa depinzi doar de intamplare." },
                  { title: "Scalabilitate", desc: "Sisteme gandite sa functioneze si atunci cand dormi." },
                  { title: "Independenta", desc: "Tu esti proprietarul brandului tau si al afacerii tale." }
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-4">
                     <div className="w-1.5 h-1.5 rounded-full bg-nma-purple mt-2.5 shrink-0" />
                     <div>
                       <strong className="text-white block mb-1">{item.title}</strong>
                       <span className="text-sm text-gray-400">{item.desc}</span>
                     </div>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative aspect-square lg:aspect-auto lg:h-[37.5rem] rounded-3xl overflow-hidden glass-card flex flex-col justify-end p-8"
            >
               {/* Decorative background image */}
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618044733300-9472054094ee?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-30 mix-blend-luminosity" />
               <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/60 to-transparent" />
               <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(112,0,255,0.2)] pointer-events-none" />
               
               <div className="relative z-10 border-l-2 border-nma-purple pl-6 py-2">
                 <p className="text-2xl font-bold text-white mb-2">"Succesul lasa indicii."</p>
                 <p className="text-nma-silver-dark uppercase tracking-widest text-sm text-nma-purple-light">Manifesto NMA</p>
               </div>
            </motion.div>

          </div>
       </div>
    </section>
  );
}
