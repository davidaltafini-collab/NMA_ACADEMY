import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Play, ArrowRight, CheckCircle2, BookOpen, RotateCcw } from "lucide-react";
import { courseService } from "../../services/courseService";
import { userService } from "../../services/userService";
import { Course, UserCourse } from "../../types";
import { NmaGlassButton } from "../../components/ui/nma-glass";
import LogoLoader from "../../components/ui/LogoLoader";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CourseWithAccess {
  course: Course;
  purchased: boolean;
  isLocked: boolean;
  progressPercent: number;       // 0–100 — from API when available
  completedVideos: number;
  totalVideos: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function CtaLabel({ pct, isLocked }: { pct: number; isLocked: boolean }) {
  if (isLocked) return <>Acces restricționat</>;
  if (pct >= 100) return <><RotateCcw className="w-4 h-4" /> Revizionează cursul</>;
  if (pct > 0)   return <><Play className="w-4 h-4" /> Continuă cursul</>;
  return <><Play className="w-4 h-4" /> Începe cursul</>;
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ pct }: { pct: number }) {
  if (pct <= 0) return null;
  return (
    <div className="mt-3 space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-500">Progres</span>
        <span className={`font-mono font-bold ${pct >= 100 ? "text-green-400" : "text-nma-purple-light"}`}>
          {pct}%
        </span>
      </div>
      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            pct >= 100
              ? "bg-gradient-to-r from-green-500 to-green-400"
              : "bg-gradient-to-r from-nma-purple to-nma-purple-light"
          }`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      {pct >= 100 && (
        <p className="text-[0.65rem] text-green-500/70 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Curs finalizat
        </p>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MyCourses() {
  const [items, setItems]   = React.useState<CourseWithAccess[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [apiError, setApiError] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      setApiError(false);
      try {
        const [courses, purchases] = await Promise.all([
          courseService.getAllCourses(),
          userService.getUserCourses(),
        ]);

        const purchaseMap = new Map<string, UserCourse>(
          purchases.map((p) => [p.course_id, p]),
        );

        const mapped: CourseWithAccess[] = courses.map((course) => {
          const purchase = purchaseMap.get(course.course_id);
          const purchased = !!purchase;
          const isLocked  = purchased && purchase!.access_status === "locked";

          // Progress fields — the backend may add these fields in the future.
          // For now we read them defensively from the purchase object.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const extra = purchase as any;
          const progressPercent  = typeof extra?.progress_percent === "number"  ? extra.progress_percent  : 0;
          const completedVideos  = typeof extra?.completed_videos  === "number"  ? extra.completed_videos  : 0;
          const totalVideos      = typeof extra?.total_videos      === "number"  ? extra.total_videos      : 0;

          return { course, purchased, isLocked, progressPercent, completedVideos, totalVideos };
        });

        // Purchased courses first, then alphabetical
        mapped.sort((a, b) => {
          if (a.purchased !== b.purchased) return a.purchased ? -1 : 1;
          return a.course.title.localeCompare(b.course.title, "ro");
        });

        setItems(mapped);
      } catch {
        setApiError(true);
      }
      setLoading(false);
    }
    load();
  }, []);

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <LogoLoader minHeight={320} />
    );
  }

  // ── API error ──────────────────────────────────────────────────────────────

  if (apiError) {
    return (
      <div className="space-y-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Toate Cursurile</h1>
        </div>
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-red-400" />
          </div>
          <div>
            <p className="text-white font-bold mb-1">Eroare la încărcarea cursurilor</p>
            <p className="text-gray-500 text-sm">Verifică conexiunea la internet și reîncarcă pagina.</p>
          </div>
          <NmaGlassButton
            glow="neutral"
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
          >
            Reîncarcă
          </NmaGlassButton>
        </div>
      </div>
    );
  }

  // ── Empty ──────────────────────────────────────────────────────────────────

  if (items.length === 0) {
    return (
      <div className="space-y-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Toate Cursurile</h1>
          <p className="text-gray-400">Nu există cursuri disponibile momentan.</p>
        </div>
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <BookOpen className="w-12 h-12 text-gray-700" />
          <p className="text-gray-500">Niciun curs nu este disponibil momentan.</p>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const purchasedItems = items.filter((i) => i.purchased);
  const availableItems = items.filter((i) => !i.purchased);

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Toate Cursurile</h1>
        <p className="text-gray-400">Accesează materialele tale sau deblochează programe noi.</p>
      </div>

      {/* ── Purchased courses ──────────────────────────────────────────────── */}
      {purchasedItems.length > 0 && (
        <div className="space-y-5">
          <h2 className="text-lg font-bold text-white border-b border-white/8 pb-3">Cursurile mele</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {purchasedItems.map(({ course, isLocked, progressPercent, completedVideos, totalVideos }) => (
              <div
                key={course.course_id}
                className="rounded-[1.5rem] overflow-hidden border border-nma-purple/25 bg-[#141419]/90 relative group"
              >
                {/* Glow effect */}
                {!isLocked && (
                  <div className="absolute top-0 right-0 w-64 h-64 bg-nma-purple/8 blur-[5rem] rounded-full pointer-events-none" />
                )}

                {/* Thumbnail */}
                <div className="h-44 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/40 z-10" />
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-nma-purple/20 to-black" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141419] to-transparent z-10" />

                  {/* Status badge */}
                  {isLocked ? (
                    <div className="absolute top-4 right-4 z-20 bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase backdrop-blur-md flex items-center gap-1.5">
                      <Lock className="w-3 h-3" /> Blocat
                    </div>
                  ) : (
                    <div className="absolute top-4 right-4 z-20 glass-card-purple px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1.5 text-white">
                      <CheckCircle2 className="w-3 h-3 text-nma-purple-light" /> Achiziționat
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 relative z-20 flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{course.description}</p>

                  {/* Progress bar — only when backend reports progress */}
                  {!isLocked && progressPercent > 0 && (
                    <ProgressBar pct={Math.round(progressPercent)} />
                  )}

                  {/* Video count if available */}
                  {!isLocked && totalVideos > 0 && (
                    <p className="text-[0.68rem] text-gray-600 mt-2">
                      {completedVideos}/{totalVideos} lecții finalizate
                    </p>
                  )}

                  {/* CTA button */}
                  <div className="mt-5">
                    {isLocked ? (
                      <NmaGlassButton
                        glow="danger"
                        disabled
                        className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 opacity-60 cursor-not-allowed text-sm"
                      >
                        <Lock className="w-4 h-4" /> Acces restricționat
                      </NmaGlassButton>
                    ) : (
                      <NmaGlassButton
                        asChild
                        glow="purple"
                        className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm"
                      >
                        <Link to={`/course/${course.slug}`}>
                          <CtaLabel pct={Math.round(progressPercent)} isLocked={false} />
                        </Link>
                      </NmaGlassButton>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Available courses (not purchased) ─────────────────────────────── */}
      {availableItems.length > 0 && (
        <div className="space-y-5">
          <h2 className="text-lg font-bold text-white border-b border-white/8 pb-3">
            {purchasedItems.length > 0 ? "Mai multe cursuri" : "Cursuri disponibile"}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {availableItems.map(({ course }) => (
              <div
                key={course.course_id}
                className="rounded-[1.5rem] overflow-hidden border border-white/8 bg-[#141419]/50 relative group"
              >
                {/* Thumbnail */}
                <div className="h-44 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/50 z-10" />
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-40"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-white/5 to-black" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141419] to-transparent z-10" />

                  {/* Locked badge */}
                  <div className="absolute top-4 right-4 z-20 bg-black/60 border border-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase text-gray-400 backdrop-blur-md flex items-center gap-1.5">
                    <Lock className="w-3 h-3" /> Blocat
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 relative z-20 flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-gray-400 text-sm mb-6 line-clamp-2 flex-1">{course.description}</p>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-2xl font-bold text-white">{course.price} &euro;</span>
                    <NmaGlassButton
                      glow="purple"
                      onClick={() => navigate(`/checkout/${course.slug}`)}
                      className="px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all text-sm group/btn"
                    >
                      Deblochează cursul
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                    </NmaGlassButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
