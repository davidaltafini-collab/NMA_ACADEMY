import { Course } from "../types";
import { apiGet, apiPost, apiPut, delay } from "../lib/apiClient";

// ─── API response shapes ──────────────────────────────────────────────────────

interface ApiCourseListItem {
  id: number;
  title: string;
  slug: string;
  short_description: string | null;
  price: number;
  currency: string;
  thumbnail_url: string | null;
  published_at: string | null;
  features: string[];
  target_audience: string[];
  results_promised: string[];
  categories_count: number;
  subcategories_count: number;
  videos_count: number;
  total_duration_seconds?: number;
  free_preview_available: boolean;
}

interface ApiVideo {
  id: number;
  title: string;
  duration_seconds: number | null;
  thumbnail_url: string | null;
  is_locked: boolean;
}

interface ApiSubcategory {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  order_index: number;
  is_locked: boolean;
  video: ApiVideo | null;
}

interface ApiCategory {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  order_index: number;
  is_free_preview: boolean;
  is_locked: boolean;
  subcategories: ApiSubcategory[];
}

interface ApiCourseDetail {
  id: number;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: number;
  currency: string;
  thumbnail_url: string | null;
  published_at: string | null;
  features: string[];
  target_audience: string[];
  results_promised: string[];
  total_duration_seconds: number;
  categories: ApiCategory[];
}

interface ApiAdminCourse {
  id: number;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: number;
  currency: string;
  thumbnail_url: string | null;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  features: string[];
  target_audience: string[];
  results_promised: string[];
  categories_count?: number;
  subcategories_count?: number;
  videos_count?: number;
  categories?: Array<{
    id: number;
    title: string;
    slug: string;
    description: string | null;
    order_index: number;
    is_free_preview: boolean;
    subcategories: Array<{
      id: number;
      title: string;
      slug: string;
      description: string | null;
      order_index: number;
      video: {
        id: number;
        title: string;
        duration_seconds: number | null;
        playback_url: string | null;
        thumbnail_url: string | null;
      } | null;
    }>;
  }>;
}

// ─── Mapping helpers ──────────────────────────────────────────────────────────

function mapListItemToCourse(c: ApiCourseListItem): Course {
  return {
    course_id:             String(c.id),
    slug:                  c.slug,
    title:                 c.title,
    description:           c.short_description ?? c.title,
    price:                 c.price,
    thumbnail:             c.thumbnail_url ?? '',
    features:              c.features,
    target_audience:       c.target_audience,
    results_promised:      c.results_promised,
    total_duration_minutes: Math.round((c.total_duration_seconds ?? 0) / 60),
    modules_count:          c.categories_count,
    lessons_count:          c.videos_count,
  };
}

function mapDetailToCourse(c: ApiCourseDetail): Course {
  const modules = c.categories.map((cat) => ({
    module_id:      String(cat.id),
    course_id:      String(c.id),
    title:          cat.title,
    order:          cat.order_index,
    is_free_preview: cat.is_free_preview,
    lessons:   cat.subcategories.map((sub) => ({
      lesson_id:        String(sub.id),
      module_id:        String(cat.id),
      title:            sub.title,
      video_url:        '',
      video_id:         sub.video?.id,   // backend CourseVideo.id for ProtectedVideoPlayer
      duration_minutes: sub.video ? Math.round((sub.video.duration_seconds ?? 0) / 60) : 0,
      order:            sub.order_index,
      is_free_preview:  !sub.is_locked,
    })),
  }));

  return {
    course_id:             String(c.id),
    slug:                  c.slug,
    title:                 c.title,
    description:           c.description ?? c.short_description ?? c.title,
    price:                 c.price,
    thumbnail:             c.thumbnail_url ?? '',
    features:              c.features,
    target_audience:       c.target_audience,
    results_promised:      c.results_promised,
    total_duration_minutes: Math.round(c.total_duration_seconds / 60),
    modules_count:          modules.length,
    lessons_count:          modules.reduce((acc, mod) => acc + mod.lessons.length, 0),
    modules,
  };
}

function mapAdminCourse(c: ApiAdminCourse): Course {
  const modules = (c.categories ?? []).map((cat) => ({
    module_id:       String(cat.id),
    course_id:       String(c.id),
    title:           cat.title,
    description:     cat.description ?? undefined,
    order:           cat.order_index,
    is_free_preview: cat.is_free_preview,
    lessons:         cat.subcategories.map((sub) => ({
      lesson_id:        String(sub.id),
      module_id:        String(cat.id),
      title:            sub.title,
      description:      sub.description ?? undefined,
      video_url:        sub.video?.playback_url ?? '',
      video_id:         sub.video?.id,
      duration_minutes: Math.round((sub.video?.duration_seconds ?? 0) / 60),
      order:            sub.order_index,
      is_free_preview:  cat.is_free_preview,
    })),
  }));

  return {
    course_id:             String(c.id),
    slug:                  c.slug,
    title:                 c.title,
    short_description:     c.short_description ?? undefined,
    description:           c.description ?? c.short_description ?? c.title,
    price:                 c.price,
    currency:              c.currency,
    thumbnail:             c.thumbnail_url ?? '',
    status:                c.status,
    features:              c.features ?? [],
    target_audience:       c.target_audience ?? [],
    results_promised:      c.results_promised ?? [],
    total_duration_minutes: modules.reduce(
      (acc, mod) => acc + mod.lessons.reduce((sum, lesson) => sum + (lesson.duration_minutes ?? 0), 0),
      0,
    ),
    modules_count:          c.categories_count ?? modules.length,
    lessons_count:          c.videos_count ?? modules.reduce((acc, mod) => acc + mod.lessons.length, 0),
    modules,
  };
}

function cleanStringList(value?: string[]): string[] {
  return (value ?? []).map((item) => item.trim()).filter(Boolean);
}

function toAdminPayload(course: Partial<Course>) {
  return {
    title:             course.title,
    slug:              course.slug,
    short_description: course.short_description,
    description:       course.description,
    price:             Number(course.price ?? 0),
    currency:          course.currency ?? "RON",
    thumbnail:         course.thumbnail,
    status:            course.status ?? "published",
    features:          cleanStringList(course.features),
    target_audience:   cleanStringList(course.target_audience),
    results_promised:  cleanStringList(course.results_promised),
    modules:           (course.modules ?? []).map((mod, modIndex) => ({
      module_id:       mod.module_id,
      title:           mod.title,
      description:     mod.description,
      order:           mod.order ?? modIndex,
      is_free_preview: mod.is_free_preview ?? mod.lessons.some((lesson) => lesson.is_free_preview),
      lessons:         mod.lessons.map((lesson, lessonIndex) => ({
        lesson_id:        lesson.lesson_id,
        title:            lesson.title,
        description:      lesson.description,
        video_url:        lesson.video_url,
        duration_minutes: Number(lesson.duration_minutes ?? 0),
        order:            lesson.order ?? lessonIndex,
        is_free_preview:  lesson.is_free_preview ?? false,
      })),
    })),
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const courseService = {
  // GET /api/courses
  getPublicCourses: async (): Promise<Course[]> => {
    const res = await apiGet<{ success: boolean; data: { courses: ApiCourseListItem[] } }>('/courses');
    return res.data.courses.map(mapListItemToCourse);
  },

  getAllCourses: async (): Promise<Course[]> => {
    return courseService.getPublicCourses();
  },

  // GET /api/courses/{slug}
  getCourseBySlug: async (slug: string): Promise<Course | undefined> => {
    try {
      const res = await apiGet<{ success: boolean; data: { course: ApiCourseDetail } }>(`/courses/${slug}`);
      return mapDetailToCourse(res.data.course);
    } catch {
      return undefined;
    }
  },

  // GET /api/courses/{id} — kept for compatibility, delegates to slug lookup via list
  getCourseById: async (id: string): Promise<Course | undefined> => {
    try {
      const res = await apiGet<{ success: boolean; data: { course: ApiAdminCourse } }>(`/admin/courses/${id}`);
      return mapAdminCourse(res.data.course);
    } catch {
      return undefined;
    }
  },

  // Admin course management uses the real protected Laravel endpoints.

  getAllCoursesForAdmin: async (): Promise<Course[]> => {
    const res = await apiGet<{ success: boolean; data: { courses: ApiAdminCourse[] } }>('/admin/courses');
    return res.data.courses.map(mapAdminCourse);
  },

  createCourse: async (payload: Partial<Course>): Promise<Course> => {
    const res = await apiPost<{ success: boolean; data: { course: ApiAdminCourse } }>('/admin/courses', toAdminPayload(payload));
    return mapAdminCourse(res.data.course);
  },

  updateCourse: async (courseId: string, payload: Partial<Course>): Promise<Course> => {
    const res = await apiPut<{ success: boolean; data: { course: ApiAdminCourse } }>(`/admin/courses/${courseId}`, toAdminPayload(payload));
    return mapAdminCourse(res.data.course);
  },

  archiveCourse: async (courseId: string): Promise<void> => {
    await apiPost(`/admin/courses/${courseId}/archive`);
  },

  duplicateCourse: async (courseId: string): Promise<Course> => {
    const res = await apiPost<{ success: boolean; data: { course: ApiAdminCourse } }>(`/admin/courses/${courseId}/duplicate`);
    return mapAdminCourse(res.data.course);
  },

  markLessonComplete: async (_courseId: string, _lessonId: string): Promise<boolean> => {
    await delay(300);
    return true;
  },
};
