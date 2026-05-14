import React from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, CheckCircle2, Circle, Play, BookOpen, AlertTriangle } from "lucide-react";
import { cn } from "../../lib/utils";
import { courseService } from "../../services/courseService";
import { useAuth } from "../../context/AuthContext";
import { Course, Lesson } from "../../types";
import ProtectedVideoPlayer from "../../components/ProtectedVideoPlayer";
import { VideoPlaybackProgress } from "../../services/videoPlaybackService";
import LogoLoader from "../../components/ui/LogoLoader";

function formatSeconds(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function CoursePlayer() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();

  const [course, setCourse]             = React.useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = React.useState<Lesson | null>(null);
  const [loading, setLoading]           = React.useState(true);
  const [apiError, setApiError]         = React.useState(false);
  // Tracks which lessons have been completed during this session
  const [completedIds, setCompletedIds] = React.useState<Set<string>>(new Set());
  // Tracks resume positions reported by the player: lessonId -> seconds
  const [resumePositions, setResumePositions] = React.useState<Map<string, number>>(new Map());

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      setApiError(false);
      if (!slug) { setLoading(false); return; }

      try {
        const c = await courseService.getCourseBySlug(slug);
        if (c) {
          setCourse(c);
          // Auto-select the first lesson with a video
          const firstPlayable = c.modules
            ?.flatMap((m) => m.lessons.slice().sort((a, b) => a.order - b.order))
            .find((l) => l.video_id !== undefined);
          if (firstPlayable) setActiveLesson(firstPlayable);
        } else {
          setApiError(true);
        }
      } catch {
        setApiError(true);
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  const handleProgressSaved = React.useCallback(
    (progress: VideoPlaybackProgress, lesson: Lesson) => {
      // Update completed set
      if (progress.is_completed) {
        setCompletedIds((prev) => new Set(prev).add(lesson.lesson_id));
      }
      // Track last known position for resume display
      if (progress.last_position_seconds > 0) {
        setResumePositions((prev) => new Map(prev).set(lesson.lesson_id, progress.last_position_seconds));
      }
    },
    [],
  );

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="h-[100dvh] bg-[#020202] flex items-center justify-center">
        <LogoLoader minHeight={0} />
      </div>
    );
  }

  // ── Error / not found ──────────────────────────────────────────────────────

  if (!course || apiError) {
    return (
      <div className="h-[100dvh] bg-[#020202] flex flex-col items-center justify-center gap-5 text-center p-6">
        <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          {apiError ? (
            <AlertTriangle className="w-7 h-7 text-red-400" />
          ) : (
            <BookOpen className="w-7 h-7 text-gray-600" />
          )}
        </div>
        <div>
          <p className="text-white font-bold text-lg mb-1">
            {apiError ? "Eroare la încărcarea cursului" : "Cursul nu a fost găsit"}
          </p>
          <p className="text-gray-500 text-sm">
            {apiError
              ? "A apărut o eroare de rețea. Verifică conexiunea și încearcă din nou."
              : "Cursul pe care îl cauți nu există sau nu este disponibil."}
          </p>
        </div>
        <Link
          to="/dashboard/courses"
          className="flex items-center gap-2 text-nma-purple hover:text-white transition-colors text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4" /> Înapoi la cursuri
        </Link>
      </div>
    );
  }

  const sortedModules = (course.modules ?? []).slice().sort((a, b) => a.order - b.order);
  const allLessons    = sortedModules.flatMap((m) => m.lessons);
  const videoLessons  = allLessons.filter((l) => l.video_id !== undefined);
  const completedCount = completedIds.size;
  const totalVideoCount = videoLessons.length;
  const progressPct   = totalVideoCount > 0
    ? Math.round((completedCount / totalVideoCount) * 100)
    : 0;

  const activeResumePos = activeLesson
    ? (resumePositions.get(activeLesson.lesson_id) ?? 0)
    : 0;

  return (
    <div
      className="h-[100dvh] flex flex-col md:flex-row bg-[#020202] text-white"
      style={{ overflow: "hidden" }}
    >
      {/* ── Main video area ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col relative h-[55vh] md:h-[100dvh] w-full shrink-0 md:shrink overflow-hidden">

        {/* Header */}
        <header className="absolute top-0 left-0 right-0 p-4 md:p-6 z-20 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
          <Link
            to="/dashboard/courses"
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm font-medium bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10"
          >
            <ChevronLeft className="w-5 h-5" /> Înapoi
          </Link>

          {/* Progress indicator in header */}
          {totalVideoCount > 0 && (
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10 text-xs">
              <span className="text-gray-400">{completedCount}/{totalVideoCount} finalizate</span>
              <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-nma-purple rounded-full transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="text-nma-purple-light font-mono">{progressPct}%</span>
            </div>
          )}
        </header>

        {/* Player */}
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden w-full h-full p-4 md:p-6 pt-16 md:pt-20">
          {activeLesson && activeLesson.video_id !== undefined ? (
            <div key={activeLesson.lesson_id} className="w-full max-w-4xl">
              <ProtectedVideoPlayer
                videoId={activeLesson.video_id}
                title={activeLesson.title}
                durationSeconds={(activeLesson.duration_minutes ?? 0) * 60}
                isLocked={false}
                courseSlug={slug}
                onProgressSaved={(p) => handleProgressSaved(p, activeLesson)}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center p-8">
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Play className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="text-gray-400 text-sm font-medium">Selectează o lecție din sidebar</p>
                <p className="text-gray-600 text-xs mt-1">pentru a începe vizionarea</p>
              </div>
            </div>
          )}

          {/* Anti-leak watermark overlay */}
          {user && (
            <>
              <div className="absolute inset-0 pointer-events-none opacity-[0.025] flex flex-wrap gap-16 p-10 overflow-hidden mix-blend-overlay select-none">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="text-white font-mono text-xs whitespace-nowrap transform -rotate-45">
                    {user.email} • {user.user_id}
                  </div>
                ))}
              </div>
              <div className="absolute top-20 right-6 opacity-25 text-[0.6rem] font-mono text-white pointer-events-none z-10 select-none mix-blend-difference">
                NMA / {user.email}
              </div>
            </>
          )}
        </div>

        {/* Bottom info bar */}
        <div className="bg-[#050505] border-t border-white/5 px-4 md:px-8 py-3 flex items-center justify-between z-10 w-full shrink-0">
          <div className="min-w-0">
            <h2 className="text-sm md:text-base font-bold text-white mb-0 line-clamp-1">
              {activeLesson?.title ?? "Alege o lecție"}
            </h2>
            {/* Resume position shown under the title */}
            {activeLesson && activeResumePos > 0 && !completedIds.has(activeLesson.lesson_id) && (
              <p className="text-[0.65rem] text-nma-purple/70 mt-0.5">
                Reluare din: {formatSeconds(activeResumePos)}
              </p>
            )}
            {activeLesson && completedIds.has(activeLesson.lesson_id) && (
              <p className="text-[0.65rem] text-green-500/70 mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Finalizat · poți revedea oricând
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <div className="w-full md:w-80 lg:w-[22rem] border-l border-white/5 bg-[#050505] flex flex-col h-[45vh] md:h-[100dvh] shrink-0 overflow-hidden">

        {/* Sidebar header: course title + progress */}
        <div className="p-4 md:p-5 border-b border-white/5 bg-[#0a0a0c] shrink-0">
          <h3 className="font-bold text-sm text-white mb-3 line-clamp-2 leading-snug">{course.title}</h3>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">
                {completedCount} / {totalVideoCount} lecții finalizate
              </span>
              <span className="text-nma-purple-light font-mono font-bold">{progressPct}%</span>
            </div>
            <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-nma-purple to-nma-purple-light rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Module + lesson list */}
        <div className="flex-1 overflow-y-auto py-2">
          {sortedModules.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
              <BookOpen className="w-8 h-8 text-gray-700" />
              <p className="text-gray-500 text-sm">Nicio lecție disponibilă.</p>
            </div>
          ) : (
            sortedModules.map((mod) => {
              const sortedLessons = mod.lessons.slice().sort((a, b) => a.order - b.order);
              const modCompleted  = sortedLessons.filter((l) => completedIds.has(l.lesson_id)).length;

              return (
                <div key={mod.module_id} className="mb-1">
                  {/* Module header */}
                  <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                    <h4 className="text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest flex-1 pr-2 leading-tight">
                      {mod.title}
                    </h4>
                    {modCompleted > 0 && (
                      <span className="shrink-0 text-[0.6rem] text-nma-purple/60 font-mono whitespace-nowrap">
                        {modCompleted}/{sortedLessons.length}
                      </span>
                    )}
                  </div>

                  {/* Lessons */}
                  <div className="space-y-0.5 px-2">
                    {sortedLessons.map((lesson) => {
                      const isActive    = activeLesson?.lesson_id === lesson.lesson_id;
                      const isCompleted = completedIds.has(lesson.lesson_id);
                      const hasVideo    = lesson.video_id !== undefined;
                      const resumePos   = resumePositions.get(lesson.lesson_id) ?? 0;

                      return (
                        <button
                          key={lesson.lesson_id}
                          onClick={() => hasVideo && setActiveLesson(lesson)}
                          disabled={!hasVideo}
                          className={cn(
                            "w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all",
                            isActive
                              ? "bg-nma-purple/15 border border-nma-purple/30"
                              : hasVideo
                              ? "hover:bg-white/5 border border-transparent"
                              : "border border-transparent cursor-default opacity-40",
                          )}
                        >
                          {/* Status icon */}
                          <div className="mt-0.5 shrink-0">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-nma-purple" />
                            ) : isActive ? (
                              <Play className="w-4 h-4 text-nma-purple-light fill-nma-purple-light" />
                            ) : hasVideo ? (
                              <Circle className="w-4 h-4 text-gray-600" />
                            ) : (
                              <Circle className="w-4 h-4 text-gray-700" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div
                              className={cn(
                                "text-xs font-semibold leading-snug line-clamp-2",
                                isActive
                                  ? "text-nma-purple-light"
                                  : isCompleted
                                  ? "text-gray-300"
                                  : hasVideo
                                  ? "text-gray-200"
                                  : "text-gray-600",
                              )}
                            >
                              {lesson.title}
                            </div>

                            {/* Duration + resume/completed */}
                            <div className="flex items-center gap-2 mt-1 text-[0.6rem] text-gray-600">
                              {lesson.duration_minutes > 0 && (
                                <span>{lesson.duration_minutes} min</span>
                              )}
                              {isCompleted && (
                                <span className="text-green-500/60 flex items-center gap-0.5">
                                  · <CheckCircle2 className="w-2.5 h-2.5 inline" /> finalizat
                                </span>
                              )}
                              {!isCompleted && resumePos > 0 && isActive && (
                                <span className="text-nma-purple/60">
                                  · reia din {formatSeconds(resumePos)}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
