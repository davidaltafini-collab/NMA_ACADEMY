import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { courseService } from "../../services/courseService";
import { Course } from "../../types";
import { Plus, Edit, Copy, Archive, Search, MoreHorizontal } from "lucide-react";
import LogoLoader from "../../components/ui/LogoLoader";

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const data = await courseService.getAllCoursesForAdmin();
    setCourses(data);
    setLoading(false);
  }

  const handleDuplicate = async (id: string) => {
    await courseService.duplicateCourse(id);
    load();
  };

  const handleArchive = async (id: string) => {
    if(confirm("Are you sure you want to archive this course?")) {
      await courseService.archiveCourse(id);
      load();
    }
  };

  const filtered = courses.filter(c => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter !== "all" && c.status !== filter) return false;
    return true;
  });

  if (loading) return <LogoLoader minHeight={320} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Administrare Cursuri</h1>
        <button 
          onClick={() => navigate('/admin/courses/new')}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Adaugă Curs
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#141419]/50 p-4 rounded-xl border border-white/5">
        <div className="flex gap-2">
          {["all", "published", "draft", "archived"].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${filter === f ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-[16rem]">
           <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
           <input 
             type="text" 
             placeholder="Caută curs..."
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="w-full bg-black/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
           />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(course => (
          <div key={course.course_id} className="bg-[#141419]/50 border border-white/5 rounded-2xl overflow-hidden group">
            <div className="h-40 relative group">
              <img src={course.thumbnail || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"} className="w-full h-full object-cover opacity-60" alt="" />
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[0.625rem] font-bold text-green-400 uppercase tracking-widest border border-white/10">
                {course.status ?? "published"}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#141419] to-transparent"></div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-white text-lg mb-1">{course.title}</h3>
              <div className="text-xs text-gray-500 font-mono mb-4">{course.slug}</div>
              
              <div className="flex items-center justify-between text-sm text-gray-400 mb-6">
                <div>Price: <span className="text-white font-medium">{course.price} {course.currency ?? "RON"}</span></div>
                <div>Modules: <span className="text-white font-medium">{course.modules_count ?? course.modules?.length ?? 0}</span></div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => navigate(`/admin/courses/${course.course_id}/edit`)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                  <Edit className="w-4 h-4" /> Edit
                </button>
                <div className="flex gap-1 relative">
                  <button onClick={() => handleDuplicate(course.course_id)} className="w-10 h-10 bg-white/5 hover:bg-white/10 text-white rounded-lg flex items-center justify-center transition-colors" title="Duplicate">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleArchive(course.course_id)} className="w-10 h-10 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg flex items-center justify-center transition-colors" title="Archive">
                    <Archive className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            Nu exista cursuri conform filtrelor alese.
          </div>
        )}
      </div>
    </div>
  );
}
