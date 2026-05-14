import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Clock, PlayCircle, Star, ArrowRight } from "lucide-react";
import { Course } from "../types";
import { Link } from "react-router-dom";
import { NmaGlassButton, NmaGlassSurface } from "./ui/nma-glass";

interface CoursePreviewModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CoursePreviewModal({ course, isOpen, onClose }: CoursePreviewModalProps) {
  if (!course) return null;

  const modulesCount = course.modules_count ?? course.modules?.length ?? 0;
  const lessonsCount = course.lessons_count ?? course.modules?.reduce((acc, mod) => acc + mod.lessons.length, 0) ?? 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-4xl h-[90vh] sm:h-auto max-h-[90vh] bg-[#0a0a0c] sm:rounded-[2rem] rounded-t-[2rem] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(139,92,246,0.15)] flex flex-col z-10"
          >
            <div className="absolute top-4 right-4 z-20">
              <NmaGlassButton
                onClick={onClose}
                size="icon"
                className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors"
               >
                 <X className="w-5 h-5" />
              </NmaGlassButton>
            </div>

            <div className="flex-1 overflow-y-auto">
               {/* Hero Area */}
               <div className="h-[30vh] sm:h-[40vh] relative">
                 <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover opacity-50" />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/60 to-transparent" />
                 
                 <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 pb-0">
                    <span className="text-[0.75rem] text-nma-purple font-semibold uppercase block mb-2 tracking-widest">Program Premium</span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{course.title}</h2>
                 </div>
               </div>

               <div className="p-6 sm:p-10 pt-4 flex flex-col md:flex-row gap-10">
                 <div className="flex-1">
                   <p className="text-nma-silver opacity-80 text-lg leading-relaxed mb-8">
                     {course.description}
                   </p>

                   {course.features && course.features.length > 0 && (
                     <div className="mb-8">
                       <h4 className="text-white font-bold mb-4">Ce promite acest curs:</h4>
                       <ul className="space-y-3">
                         {course.features.map((feature, idx) => (
                           <li key={idx} className="flex items-start gap-3">
                             <div className="mt-1 w-5 h-5 shrink-0 rounded-full bg-nma-purple/20 flex items-center justify-center border border-nma-purple/30">
                               <Star className="w-3 h-3 text-nma-purple-light" />
                             </div>
                             <span className="text-gray-300 text-sm leading-relaxed">{feature}</span>
                           </li>
                         ))}
                       </ul>
                     </div>
                   )}
                 </div>

                 <div className="w-full md:w-72 shrink-0">
                   <NmaGlassSurface radius="2xl" tone="clear" className="p-6 mb-6">
                      <div className="flex items-center gap-3 text-gray-300 mb-4 pb-4 border-b border-white/5">
                        <Clock className="w-5 h-5 text-nma-purple" />
                        <span className="text-sm font-medium">{course.total_duration_minutes || 0} minute conținut</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-300 mb-6">
                        <PlayCircle className="w-5 h-5 text-nma-purple" />
                        <span className="text-sm font-medium">{modulesCount} module · {lessonsCount} lecții</span>
                      </div>
                      
                      <div className="text-3xl font-bold text-white mb-6 text-center">
                        {course.price} &euro;
                      </div>

                      <div className="space-y-3">
                        <NmaGlassButton
                          glow="purple"
                          asChild
                          className="w-full flex items-center justify-center px-6 py-4 rounded-xl font-bold tracking-wider uppercase text-xs transition-all"
                        >
                          <Link to={`/checkout/${course.slug}`}>
                          Deblochează Cursul
                          </Link>
                        </NmaGlassButton>
                        <NmaGlassButton
                          glow="subtle"
                          asChild
                          className="w-full flex items-center justify-center px-6 py-4 rounded-xl font-bold tracking-wider uppercase text-xs transition-all"
                        >
                          <Link to={`/courses/${course.slug}`}>
                            Vezi Programul Complet <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </NmaGlassButton>
                      </div>
                   </NmaGlassSurface>
                 </div>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
