import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  PlayCircle,
  Clock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  MonitorPlay,
  Lock,
  X,
  BookOpen,
  Layers,
} from "lucide-react";
import { Course, CourseModule, Lesson } from "../types";
import { courseService } from "../services/courseService";
import { useAuth } from "../context/AuthContext";
import ProtectedVideoPlayer from "../components/ProtectedVideoPlayer";
import { GlassFilter } from "../components/ui/liquid-glass";
import { NmaGlassButton, NmaGlassSurface } from "../components/ui/nma-glass";
import LogoLoader from "../components/ui/LogoLoader";

// ─── Player panel state ───────────────────────────────────────────────────────

type PlayerPanelState =
  | null
  | { type: "video"; lesson: Lesson }
  | { type: "locked"; title: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function moduleTotalMinutes(mod: CourseModule): number {
  return mod.lessons.reduce((acc, l) => acc + (l.duration_minutes || 0), 0);
}

function hasAnyFreeLesson(mod: CourseModule): boolean {
  return mod.is_free_preview === true || mod.lessons.some((l) => l.is_free_preview);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CourseDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse]           = useState<Course | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(false);
  const [playerPanel, setPlayerPanel] = useState<PlayerPanelState>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchCourse = async () => {
      setLoading(true);
      setError(false);
      if (slug) {
        try {
          const data = await courseService.getCourseBySlug(slug);
          setCourse(data || null);
          if (!data) setError(true);
        } catch {
          setError(true);
        }
      }
      setLoading(false);
    };
    fetchCourse();
  }, [slug]);

  useEffect(() => {
    setPlayerPanel(null);
  }, [slug]);

  const handleUnlock = () => {
    if (!user) {
      navigate(`/register?redirect=/checkout/${course?.slug}`);
    } else {
      navigate(`/checkout/${course?.slug}`);
    }
  };

  const handleLessonClick = (lesson: Lesson) => {
    if (!lesson.video_id) return;
    if (lesson.is_free_preview) {
      setPlayerPanel({ type: "video", lesson });
    } else {
      setPlayerPanel({ type: "locked", title: lesson.title });
    }
    setTimeout(() => {
      document.getElementById("course-player-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#030305] flex items-center justify-center">
        <LogoLoader minHeight={0} />
      </div>
    );
  }

  // ── Not found / error ──────────────────────────────────────────────────────

  if (!course || error) {
    return (
      <div className="min-h-[100dvh] bg-[#030305] flex flex-col items-center justify-center text-center p-6 gap-6">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-gray-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Cursul nu a fost găsit</h1>
          <p className="text-gray-500">Ne pare rău, cursul pe care îl cauți nu există sau nu mai este disponibil.</p>
        </div>
        <Link to="/" className="flex items-center gap-2 text-nma-purple hover:text-white transition-colors text-sm font-medium">
          &larr; Înapoi la cursuri
        </Link>
      </div>
    );
  }

  const sortedModules = (course.modules ?? []).slice().sort((a, b) => a.order - b.order);
  const totalLessons  = sortedModules.reduce((acc, m) => acc + m.lessons.length, 0);

  return (
    <div className="min-h-[100dvh] bg-[#030305] pt-24 pb-28 lg:pb-20">
      <GlassFilter />
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative w-full max-w-6xl mx-auto px-6 mb-16 pt-10">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            <span className="text-[0.75rem] text-nma-purple font-semibold uppercase block mb-4 tracking-widest">
              Masterclass Premium
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {course.title}
            </h1>
            <p className="text-xl text-nma-silver opacity-80 mb-10 leading-relaxed max-w-2xl">
              {course.description}
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-6 mb-10">
              <div className="flex items-center gap-2 text-gray-300">
                <Clock className="w-5 h-5 text-nma-purple" />
                <span>{course.total_duration_minutes || 0} minute conținut</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Layers className="w-5 h-5 text-nma-purple" />
                <span>{sortedModules.length} module</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <MonitorPlay className="w-5 h-5 text-nma-purple" />
                <span>{totalLessons} lecții</span>
              </div>
            </div>

            {/* CTA — hero */}
            <div className="flex flex-col sm:flex-row gap-3">
              <NmaGlassButton
                glow="purple"
                onClick={handleUnlock}
                className="px-8 py-4 rounded-xl font-bold tracking-wider uppercase text-sm transition-all flex items-center justify-center gap-3"
              >
                Cumpără cursul — {course.price} &euro;
                <ArrowRight className="w-5 h-5" />
              </NmaGlassButton>
            </div>
          </motion.div>

          {/* Thumbnail */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-[31.25rem] shrink-0"
          >
            <NmaGlassSurface radius="2xl" tone="clear" className="relative group aspect-video">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-nma-purple/20 to-black flex items-center justify-center">
                  <MonitorPlay className="w-16 h-16 text-nma-purple/40" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                <PlayCircle className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
              </div>
            </NmaGlassSurface>
          </motion.div>
        </div>
      </section>

      {/* ── Inline player panel ───────────────────────────────────────────── */}
      <AnimatePresence>
        {playerPanel !== null && (
          <motion.section
            id="course-player-panel"
            key="player-panel"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="max-w-6xl mx-auto px-6 mb-12"
          >
            <NmaGlassSurface radius="3xl" tone="clear" className="p-6 relative">
              <NmaGlassButton
                onClick={() => setPlayerPanel(null)}
                size="icon"
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all z-10"
                aria-label="Închide player"
              >
                <X className="w-4 h-4" />
              </NmaGlassButton>

              {playerPanel.type === "video" ? (
                <>
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-3">
                    Vizionezi acum — Preview gratuit
                  </p>
                  <ProtectedVideoPlayer
                    videoId={playerPanel.lesson.video_id!}
                    title={playerPanel.lesson.title}
                    durationSeconds={(playerPanel.lesson.duration_minutes ?? 0) * 60}
                    isLocked={false}
                    courseSlug={course.slug}
                  />
                </>
              ) : (
                /* Locked content panel */
                <div className="flex flex-col sm:flex-row items-center gap-6 py-4">
                  <div className="w-14 h-14 shrink-0 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                    <Lock className="w-7 h-7 text-yellow-400" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-white font-bold text-base mb-1">{playerPanel.title}</p>
                    <p className="text-gray-400 text-sm">
                      Această lecție face parte din conținutul plătit. Achiziționează cursul pentru acces complet.
                    </p>
                  </div>
                  <NmaGlassButton
                    glow="purple"
                    onClick={handleUnlock}
                    className="shrink-0 px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
                  >
                    Deblochează cursul <ArrowRight className="w-4 h-4" />
                  </NmaGlassButton>
                </div>
              )}
            </NmaGlassSurface>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Course details + sidebar ──────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-16">

          {/* Target audience + Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {course.target_audience && course.target_audience.length > 0 && (
              <NmaGlassSurface radius="3xl" tone="clear" className="p-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-nma-purple" />
                  Pentru cine este?
                </h3>
                <ul className="space-y-4">
                  {course.target_audience.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-nma-silver">
                      <CheckCircle2 className="w-5 h-5 text-nma-purple shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </NmaGlassSurface>
            )}

            {course.results_promised && course.results_promised.length > 0 && (
              <NmaGlassSurface radius="3xl" tone="clear" className="p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-nma-purple/10 blur-3xl rounded-full" />
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3 relative z-10">
                  <StarIcon className="w-6 h-6 text-nma-purple" />
                  Ce vei dobândi
                </h3>
                <ul className="space-y-4 relative z-10">
                  {course.results_promised.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-nma-silver">
                      <ArrowRight className="w-5 h-5 text-nma-purple shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </NmaGlassSurface>
            )}
          </div>

          {/* Curriculum */}
          {sortedModules.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                <h3 className="text-3xl font-bold text-white">Curriculum</h3>
                <span className="text-sm text-gray-500">
                  {sortedModules.length} module · {totalLessons} lecții
                </span>
              </div>

              <div className="space-y-3">
                {sortedModules.map((module) => {
                  const freeLessons   = module.lessons.filter((l) => l.is_free_preview && l.video_id);
                  const lockedLessons = module.lessons.filter((l) => !l.is_free_preview && l.video_id);
                  const modMinutes    = moduleTotalMinutes(module);
                  const isModFree     = hasAnyFreeLesson(module);

                  return (
                    <div
                      key={module.module_id}
                      className="bg-[#0a0a0c] border border-white/[0.04] shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-2xl overflow-hidden"
                    >
                      <details className="group" open={module.order === 1}>
                        <summary className="flex items-center justify-between p-5 cursor-pointer bg-transparent hover:bg-white/[0.02] transition-colors select-none">
                          <div className="flex items-center gap-4 min-w-0">
                            {/* Module number */}
                            <div className="w-9 h-9 shrink-0 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white font-bold text-xs">
                              {module.order}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-base font-bold text-white leading-snug">{module.title}</h4>
                                {isModFree && (
                                  <span className="shrink-0 text-[0.6rem] uppercase font-bold tracking-wider px-2 py-0.5 bg-green-500/15 text-green-400 border border-green-500/25 rounded-full">
                                    Preview gratuit
                                  </span>
                                )}
                              </div>
                              {/* Module stats */}
                              <div className="flex items-center gap-3 mt-1 text-[0.68rem] text-gray-500">
                                <span>{module.lessons.length} lecții</span>
                                {modMinutes > 0 && (
                                  <>
                                    <span>·</span>
                                    <span>{modMinutes} min</span>
                                  </>
                                )}
                                {freeLessons.length > 0 && (
                                  <>
                                    <span>·</span>
                                    <span className="text-green-500/70">{freeLessons.length} gratuit{freeLessons.length !== 1 ? "e" : ""}</span>
                                  </>
                                )}
                                {lockedLessons.length > 0 && (
                                  <>
                                    <span>·</span>
                                    <span className="text-gray-600">{lockedLessons.length} blocat{lockedLessons.length !== 1 ? "e" : ""}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <ChevronDown className="w-4 h-4 text-gray-500 shrink-0 group-open:rotate-180 transition-transform ml-3" />
                        </summary>

                        {/* Lesson list */}
                        <div className="px-4 pb-4 pt-1 bg-black/20">
                          <div className="space-y-1">
                            {module.lessons
                              .slice()
                              .sort((a, b) => a.order - b.order)
                              .map((lesson) => {
                                const hasVideo   = !!lesson.video_id;
                                const isPlayable = hasVideo && !!lesson.is_free_preview;
                                const isLocked   = hasVideo && !lesson.is_free_preview;
                                const isActive   =
                                  playerPanel?.type === "video" &&
                                  playerPanel.lesson.lesson_id === lesson.lesson_id;

                                return (
                                  <button
                                    key={lesson.lesson_id}
                                    onClick={() => hasVideo && handleLessonClick(lesson)}
                                    disabled={!hasVideo}
                                    className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-colors gap-3 text-left ${
                                      isActive
                                        ? "bg-nma-purple/15 border border-nma-purple/30"
                                        : isPlayable
                                        ? "hover:bg-white/5 border border-transparent cursor-pointer"
                                        : isLocked
                                        ? "hover:bg-white/3 border border-transparent cursor-pointer"
                                        : "border border-transparent opacity-40 cursor-default"
                                    }`}
                                  >
                                    {/* Icon + title */}
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="shrink-0">
                                        {isLocked ? (
                                          <Lock className="w-4 h-4 text-gray-600" />
                                        ) : isActive ? (
                                          <PlayCircle className="w-4 h-4 text-nma-purple-light" />
                                        ) : isPlayable ? (
                                          <PlayCircle className="w-4 h-4 text-nma-purple" />
                                        ) : (
                                          <PlayCircle className="w-4 h-4 text-gray-700" />
                                        )}
                                      </div>
                                      <span
                                        className={`text-sm font-medium truncate ${
                                          isActive
                                            ? "text-nma-purple-light"
                                            : isLocked
                                            ? "text-gray-500"
                                            : isPlayable
                                            ? "text-white"
                                            : "text-gray-600"
                                        }`}
                                      >
                                        {lesson.title}
                                      </span>
                                    </div>

                                    {/* Right badges + duration */}
                                    <div className="flex items-center gap-2 shrink-0">
                                      {isActive && (
                                        <span className="text-[0.6rem] uppercase font-bold tracking-wider px-2 py-0.5 bg-nma-purple/30 text-nma-purple-light rounded-full animate-pulse">
                                          ▶ Redare
                                        </span>
                                      )}
                                      {isPlayable && !isActive && (
                                        <span className="text-[0.6rem] uppercase font-bold tracking-wider px-2 py-0.5 bg-green-500/15 text-green-400 border border-green-500/20 rounded-full">
                                          Gratuit
                                        </span>
                                      )}
                                      {isLocked && (
                                        <span className="text-[0.6rem] uppercase font-bold tracking-wider px-2 py-0.5 bg-white/4 text-gray-600 border border-white/5 rounded-full flex items-center gap-1">
                                          <Lock className="w-2.5 h-2.5" /> Plătit
                                        </span>
                                      )}
                                      {lesson.duration_minutes > 0 && (
                                        <span className="text-xs text-gray-600 font-mono">
                                          {lesson.duration_minutes}m
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                          </div>
                        </div>
                      </details>
                    </div>
                  );
                })}
              </div>

              {/* Bottom CTA below curriculum */}
              <NmaGlassSurface radius="2xl" tone="purple" className="mt-8 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-white font-bold mb-0.5">Deblochează toate lecțiile</p>
                  <p className="text-gray-400 text-sm">Acces complet la {totalLessons} lecții · Plată unică</p>
                </div>
                <NmaGlassButton
                  glow="purple"
                  onClick={handleUnlock}
                  className="shrink-0 px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
                >
                  Cumpără cursul — {course.price} &euro; <ArrowRight className="w-4 h-4" />
                </NmaGlassButton>
              </NmaGlassSurface>
            </div>
          )}
        </div>

        {/* ── Sticky sidebar CTA ─────────────────────────────────────────── */}
        <div className="lg:col-span-1 hidden lg:block">
          <NmaGlassSurface radius="3xl" tone="clear" className="sticky top-24 p-8">
            <div className="text-3xl font-bold text-white mb-1">{course.price} &euro;</div>
            <p className="text-sm text-gray-400 mb-6">Plată unică. Acces pe viață.</p>

            <NmaGlassButton
              glow="purple"
              onClick={handleUnlock}
              className="w-full py-4 rounded-xl font-bold tracking-wider uppercase text-sm transition-all mb-4"
            >
              Cumpără cursul
            </NmaGlassButton>

            <ul className="space-y-3 mb-4 pt-5 border-t border-white/10">
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-nma-purple shrink-0" /> Acces imediat la toate lecțiile
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-nma-purple shrink-0" /> {totalLessons} lecții în {sortedModules.length} module
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-nma-purple shrink-0" /> Actualizări viitoare gratuite
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-nma-purple shrink-0" /> Suport în comunitate
              </li>
            </ul>
          </NmaGlassSurface>
        </div>
      </section>

      {/* ── Mobile floating CTA (visible only on mobile/tablet) ──────────── */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-[#0a0a0c]/95 backdrop-blur-md border-t border-white/10 p-4 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm truncate">{course.title}</p>
          <p className="text-gray-400 text-xs">{course.price} € · Plată unică</p>
        </div>
        <NmaGlassButton
          glow="purple"
          onClick={handleUnlock}
          className="shrink-0 px-5 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
        >
          Cumpără <ArrowRight className="w-4 h-4" />
        </NmaGlassButton>
      </div>
    </div>
  );
}

function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
