import { motion } from "motion/react";
import { Star } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Alexandru M.",
      role: "E-Commerce",
      text: "Dupa multe incercari esuate cu tutoriale de pe YouTube, aici am gasit in sfarsit o structura clara. Primul magazin a fost profitabil in saptamana 3."
    },
    {
      name: "Maria D.",
      role: "Social Media",
      text: "Nu credeam ca pot monetiza prezenta mea online atat de eficient. Informatiile primite au fost direct la obiect, fara timp pierdut."
    },
    {
      name: "Tudor V.",
      role: "E-Commerce",
      text: "Cel mai mult apreciez suportul. Faptul ca cineva iti analizeaza greselile din contul de ads face toata diferenta intre a pierde bani si a scala."
    }
  ];

  return (
    <section className="py-24 bg-[#0a0a0c]">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-bold text-center text-white mb-16">Vorbesc <span className="text-transparent bg-clip-text bg-gradient-to-r from-nma-purple-light to-white">Rezultatele</span></h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.6 }}
              className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-nma-purple text-nma-purple" />
                  ))}
                </div>
                <p className="text-gray-300 italic leading-relaxed mb-8">"{test.text}"</p>
              </div>
              <div className="pt-6 border-t border-white/5">
                <strong className="text-white block">{test.name}</strong>
                <span className="text-nma-purple-light text-sm">{test.role}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
