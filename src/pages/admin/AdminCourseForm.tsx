import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, ArrowLeft, Plus, Trash2, GripVertical } from "lucide-react";
import { Course, CourseModule, Lesson } from "../../types";
import { courseService } from "../../services/courseService";
import LogoLoader from "../../components/ui/LogoLoader";

export default function AdminCourseForm() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const isEdit = !!courseId;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [course, setCourse] = useState<Partial<Course>>({
    title: "",
    slug: "",
    short_description: "",
    description: "",
    price: 0,
    currency: "RON",
    thumbnail: "",
    status: "published",
    features: [],
    target_audience: [],
    results_promised: [],
    modules: []
  });

  useEffect(() => {
    if (isEdit && courseId) {
      courseService.getCourseById(courseId).then(data => {
        if (data) setCourse(data);
        setLoading(false);
      });
    }
  }, [courseId, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCourse({ ...course, [e.target.name]: e.target.value });
  };

  const setListField = (
    field: "features" | "target_audience" | "results_promised",
    value: string,
  ) => {
    setCourse({
      ...course,
      [field]: value.split("\n"),
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isEdit && courseId) {
        await courseService.updateCourse(courseId, course);
      } else {
        await courseService.createCourse(course);
      }
      navigate('/admin/courses');
    } catch (e) {
      console.error(e);
      alert("Error saving course");
    } finally {
      setSaving(false);
    }
  };

  const addModule = () => {
    const modules = course.modules || [];
    const newModule: CourseModule = {
      module_id: `m_${Date.now()}`,
      course_id: course.course_id || "",
      title: "New Module",
      order: modules.length,
      lessons: []
    };
    setCourse({ ...course, modules: [...modules, newModule] });
  };

  const updateModule = (idx: number, title: string) => {
    const mods = [...(course.modules || [])];
    mods[idx].title = title;
    setCourse({ ...course, modules: mods });
  };

  const updateModuleFreePreview = (idx: number, isFree: boolean) => {
    const mods = [...(course.modules || [])];
    mods[idx].is_free_preview = isFree;
    mods[idx].lessons = mods[idx].lessons.map((lesson) => ({
      ...lesson,
      is_free_preview: isFree,
    }));
    setCourse({ ...course, modules: mods });
  };

  const removeModule = (idx: number) => {
    const mods = [...(course.modules || [])];
    mods.splice(idx, 1);
    setCourse({ ...course, modules: mods });
  };

  const addLesson = (modIdx: number) => {
    const mods = [...(course.modules || [])];
    const newLesson: Lesson = {
      lesson_id: `l_${Date.now()}`,
      module_id: mods[modIdx].module_id,
      title: "New Lesson",
      video_url: "",
      duration_minutes: 0,
      order: mods[modIdx].lessons.length
    };
    mods[modIdx].lessons.push(newLesson);
    setCourse({ ...course, modules: mods });
  };

  const updateLesson = (modIdx: number, lesIdx: number, field: string, val: any) => {
    const mods = [...(course.modules || [])];
    mods[modIdx].lessons[lesIdx] = { ...mods[modIdx].lessons[lesIdx], [field]: val };
    setCourse({ ...course, modules: mods });
  };

  const removeLesson = (modIdx: number, lesIdx: number) => {
    const mods = [...(course.modules || [])];
    mods[modIdx].lessons.splice(lesIdx, 1);
    setCourse({ ...course, modules: mods });
  };

  if (loading) return <LogoLoader minHeight={320} />;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => navigate('/admin/courses')} className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-white">{isEdit ? "Edit Course" : "New Course"}</h1>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
        >
          {saving ? <LogoLoader size={22} minHeight={0} /> : <><Save className="w-4 h-4" /> Save Changes</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#141419]/50 border border-white/5 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white border-b border-white/5 pb-4 mb-4">Informații Generale</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Titlu Curs</label>
                <input name="title" value={course.title} onChange={handleChange} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500/50" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Descriere scurtă pentru card</label>
                <input
                  name="short_description"
                  value={course.short_description ?? ""}
                  onChange={handleChange}
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500/50"
                  placeholder="O propoziție clară care apare în carduri și liste."
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-1">Slug (URL)</label>
                  <input name="slug" value={course.slug} onChange={handleChange} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-red-500/50" />
                </div>
                <div className="w-32">
                  <label className="block text-sm text-gray-400 mb-1">Preț (€)</label>
                  <input name="price" type="number" value={course.price} onChange={handleChange} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500/50" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Descriere</label>
                <textarea name="description" value={course.description} onChange={handleChange} rows={4} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500/50"></textarea>
              </div>
              <div className="flex gap-4">
                <div className="w-32">
                  <label className="block text-sm text-gray-400 mb-1">Moneda</label>
                  <input name="currency" value={course.currency ?? "RON"} onChange={handleChange} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-red-500/50" />
                </div>
                <div className="w-44">
                  <label className="block text-sm text-gray-400 mb-1">Status</label>
                  <select
                    value={course.status ?? "published"}
                    onChange={(e) => setCourse({ ...course, status: e.target.value as Course["status"] })}
                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500/50"
                  >
                    <option value="published">published</option>
                    <option value="draft">draft</option>
                    <option value="archived">archived</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Features card public (unul pe linie)</label>
                <textarea value={(course.features ?? []).join("\n")} onChange={(e) => setListField("features", e.target.value)} rows={5} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500/50" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Public tinta (unul pe linie)</label>
                <textarea value={(course.target_audience ?? []).join("\n")} onChange={(e) => setListField("target_audience", e.target.value)} rows={4} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500/50" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Rezultate promise (unul pe linie)</label>
                <textarea value={(course.results_promised ?? []).join("\n")} onChange={(e) => setListField("results_promised", e.target.value)} rows={4} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500/50" />
              </div>
            </div>
          </div>

          {/* Modules Builder */}
          <div className="bg-[#141419]/50 border border-white/5 rounded-2xl p-6 space-y-4">
             <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
               <h2 className="text-lg font-bold text-white">Curriculum</h2>
               <button type="button" onClick={addModule} className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                 <Plus className="w-3 h-3" /> Modul
               </button>
             </div>

             <div className="space-y-6">
                {(course.modules || []).map((mod, modIdx) => (
                  <div key={modIdx} className="border border-white/10 bg-black/30 rounded-xl p-4">
                     <div className="flex gap-3 mb-4">
                       <input 
                         value={mod.title} 
                         onChange={(e) => updateModule(modIdx, e.target.value)} 
                         className="flex-1 bg-black border border-white/10 rounded-lg px-3 py-1.5 text-white font-bold text-sm focus:outline-none focus:border-red-500/50"
                       />
                       <button type="button" onClick={() => addLesson(modIdx)} className="bg-red-500/20 text-red-500 hover:bg-red-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                         + Lecție
                       </button>
                       <label className="flex items-center gap-2 text-xs text-gray-400 px-2">
                         <input type="checkbox" checked={!!mod.is_free_preview} onChange={e => updateModuleFreePreview(modIdx, e.target.checked)} className="accent-red-500" /> Free preview
                       </label>
                       <button type="button" onClick={() => removeModule(modIdx)} className="text-gray-500 hover:text-red-500 transition-colors">
                         <Trash2 className="w-4 h-4" />
                       </button>
                     </div>

                     <div className="space-y-2 pl-4 border-l-2 border-white/5">
                        {mod.lessons.map((les, lesIdx) => (
                          <div key={lesIdx} className="bg-[#0f0f13] border border-white/5 rounded-lg p-3 flex flex-col gap-2">
                             <div className="flex gap-2 items-center">
                               <GripVertical className="w-4 h-4 text-gray-600 cursor-move" />
                               <input value={les.title} onChange={e => updateLesson(modIdx, lesIdx, "title", e.target.value)} placeholder="Titlu lecție" className="flex-1 bg-black border border-white/5 rounded px-2 py-1 text-sm text-white focus:outline-none" />
                               <input type="number" value={les.duration_minutes} onChange={e => updateLesson(modIdx, lesIdx, "duration_minutes", Number(e.target.value || 0))} placeholder="Min" className="w-16 bg-black border border-white/5 rounded px-2 py-1 text-sm text-white focus:outline-none text-center" />
                               <label className="flex items-center gap-2 text-xs text-gray-400">
                                 <input type="checkbox" checked={!!les.is_free_preview} onChange={e => updateLesson(modIdx, lesIdx, "is_free_preview", e.target.checked)} className="accent-red-500" /> Free
                               </label>
                               <button type="button" onClick={() => removeLesson(modIdx, lesIdx)} className="text-gray-600 hover:text-red-500 ml-2"><Trash2 className="w-3.5 h-3.5" /></button>
                             </div>
                             <div className="pl-6">
                               <input value={les.video_url} onChange={e => updateLesson(modIdx, lesIdx, "video_url", e.target.value)} placeholder="HLS Video URL" className="w-full bg-black border border-white/5 rounded px-2 py-1 text-xs text-gray-400 font-mono focus:outline-none" />
                             </div>
                          </div>
                        ))}
                        {mod.lessons.length === 0 && <div className="text-xs text-gray-600 italic">Nu exista lectii in acest modul</div>}
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#141419]/50 border border-white/5 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-gray-400 tracking-widest uppercase mb-4">Media</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Thumbnail URL</label>
                <input name="thumbnail" value={course.thumbnail} onChange={handleChange} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-gray-300 text-sm focus:outline-none focus:border-red-500/50" />
                {course.thumbnail && (
                  <div className="mt-2 h-32 rounded-lg overflow-hidden border border-white/10">
                    <img src={course.thumbnail} className="w-full h-full object-cover" alt="" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
