import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Course } from "../../types";
import CoursePreviewModal from "../../components/CoursePreviewModal";
import { courseService } from "../../services/courseService";
import { CourseGlassCard } from "../../components/course/CourseGlassCard";
import { GlassFilter } from "../../components/ui/liquid-glass";
import { cn } from "../../lib/utils";

export default function Courses() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const hasSingleCourse = courses.length === 1;

  useEffect(() => {
    courseService.getPublicCourses().then(setCourses);
  }, []);

  const openPreview = async (course: Course) => {
    setSelectedCourse(course);
    const detail = await courseService.getCourseBySlug(course.slug);
    if (detail) setSelectedCourse(detail);
  };

  return (
    <section id="courses" className="py-24 md:py-32 relative bg-[#060608]">
      <GlassFilter />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6"
          >
            Alege-ti <span className="text-transparent bg-clip-text bg-gradient-to-r from-nma-purple to-white">Terenul de Lupta</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-nma-silver max-w-2xl mx-auto text-lg"
          >
            {hasSingleCourse
              ? "Un sistem complet, de la zero la profit, construit intr-un singur parcurs coerent."
              : "Doua modele de business dovedite. Sistem complet, de la zero la profit."}
          </motion.p>
        </div>

        <div
          className={cn(
            "grid grid-cols-1 gap-8 lg:gap-12",
            hasSingleCourse
              ? "max-w-[42rem] mx-auto"
              : "md:grid-cols-2",
          )}
        >
          {courses.map((course, index) => (
            <CourseGlassCard
              key={course.course_id} 
              course={course} 
              index={index} 
              onPreview={() => openPreview(course)}
            />
          ))}
        </div>
      </div>
      
      <CoursePreviewModal 
        course={selectedCourse} 
        isOpen={!!selectedCourse} 
        onClose={() => setSelectedCourse(null)} 
      />
    </section>
  );
}
