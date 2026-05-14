import { motion } from "motion/react";
import { PlayCircle, Users, Zap, Search } from "lucide-react";

export default function Deliverables() {
  const items = [
    {
      icon: <PlayCircle className="w-8 h-8" />,
      title: "Module Video HD",
      desc: "Zeci de ore de continut filmat premium, explicat pas cu pas. Fara ocolisuri, doar executie."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Sabloane & Resurse",
      desc: "Nu porni de la zero. Primesti structuri de reclame, strategii de continut si fisiere gata de implementat."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Comunitate Premium",
      desc: "Acces in grupul privat. Aici se discuta strategii, se impartasesc victorii si se fac parteneriate globale."
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: "Sesiuni Live de Feedback",
      desc: "Analizam magazinul sau conturile tale de social media ca sa optimizam constant performanta."
    }
  ];

  return (
    <section className="py-24 md:py-32 relative bg-[#050506]">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Ce incluzi in arsenalul tau</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Nu vindem doar teorie. Oferim un ecosistem complet pentru succes.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity group-hover:scale-110 duration-500">
                {item.icon}
              </div>
              <div className="text-nma-purple-light mb-6">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
