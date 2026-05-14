import { motion } from "framer-motion"; // Am corectat importul de la motion/react la framer-motion (standard)
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Course } from "../../types";
import { NmaGlassButton, NmaGlassSurface } from "../ui/nma-glass";

interface CourseGlassCardProps {
  key?: string | number;
  course: Course;
  index: number;
  onPreview: () => void;
}

export function CourseGlassCard({
  course,
  index,
  onPreview,
}: CourseGlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, delay: index * 0.2 }}
      // Am adăugat max-w-[550px] și mx-auto ca să nu se mai întindă urât când e un singur curs
      className="group relative rounded-[2rem] overflow-visible cursor-pointer w-full max-w-[550px] mx-auto h-full flex flex-col"
      onClick={onPreview}
    >
      <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-b from-white/10 via-white/0 to-white/0 z-0 pointer-events-none" />
      <div className="absolute inset-0 border border-white/10 rounded-[2rem] z-20 pointer-events-none group-hover:border-white/30 transition-colors duration-500" />
      <div className="absolute -inset-4 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.2),rgba(139,92,246,0.16)_38%,transparent_70%)] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <NmaGlassSurface
        radius="card"
        tone="clear"
        className="h-full w-full flex flex-col relative z-10 rounded-[2rem]"
      >
        {/* AICI ERA PROBLEMA 1: Am schimbat rounded-[inherit] cu rounded-[2rem] */}
        <div className="h-full flex flex-col overflow-hidden rounded-[2rem]">
          
          {/* AICI ERA PROBLEMA 2: Am schimbat rounded-t-[inherit] cu rounded-t-[2rem] pentru imagine */}
          <div className="h-48 md:h-64 overflow-hidden relative rounded-t-[2rem]">
            <div className="absolute inset-0 bg-nma-dark/30 z-10" />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0a0a0c]/95 via-[#0a0a0c]/70 to-transparent z-10" />
            <img
              src={course.thumbnail}
              alt={course.title}
              className="block w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <NmaGlassSurface
              radius="xl"
              tone="purple"
              className="absolute top-6 right-6 z-20 px-4 py-2 rounded-full"
            >
              <span className="text-white font-semibold">{course.price} &euro;</span>
            </NmaGlassSurface>
          </div>

          <div className="p-8 md:p-10 flex-1 flex flex-col pointer-events-none bg-[#0a0a0c]/40">
            <span className="text-[0.75rem] text-nma-purple-light font-semibold uppercase block mb-2 tracking-widest">
              Masterclass
            </span>
            <h3 className="text-[2rem] font-bold text-white mb-2 leading-tight">
              {course.title}
            </h3>
            <p className="text-nma-silver opacity-70 mb-8 leading-relaxed">
              {course.description}
            </p>

            <div className="space-y-4 mb-10 flex-1">
              {course.features?.map((feature: string, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-nma-purple shrink-0 mt-0.5" />
                  <span className="text-sm md:text-base text-gray-300">{feature}</span>
                </div>
              ))}
            </div>

            <NmaGlassButton
              glow="purple"
              className="w-full py-4 rounded-xl transition-all duration-300 font-semibold flex items-center justify-center gap-2 group/btn pointer-events-auto"
            >
              Vezi Programul
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </NmaGlassButton>
          </div>
        </div>
      </NmaGlassSurface>
    </motion.div>
  );
}