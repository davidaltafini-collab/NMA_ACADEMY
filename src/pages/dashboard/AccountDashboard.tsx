import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Clock, AlertTriangle } from "lucide-react";
import { userService, UserProfile } from "../../services/userService";
import { courseService } from "../../services/courseService";
import { UserCourse, Course } from "../../types";
import { NmaGlassButton, NmaGlassSurface } from "../../components/ui/nma-glass";
import LogoLoader from "../../components/ui/LogoLoader";

export default function AccountDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [purchases, setPurchases] = React.useState<UserCourse[]>([]);
  const [allCourses, setAllCourses] = React.useState<Course[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      const u = await userService.getProfile();
      const p = await userService.getUserCourses();
      const c = await courseService.getAllCourses();
      setUser(u);
      setPurchases(p);
      setAllCourses(c);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) return <LogoLoader minHeight={320} />;
  if (!user) return <div className="text-white">Eroare la incarcare.</div>;

  const purchasedCourseIds = purchases.map(p => p.course_id);
  const myCoursesDetailed = allCourses.filter(c => purchasedCourseIds.includes(c.course_id));
  const availableCourses = allCourses.filter(c => !purchasedCourseIds.includes(c.course_id));

  return (
    <div className="space-y-10">
      
      {/* Hello Section */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Salut, {user.name.split(' ')[0]}</h1>
        <p className="text-gray-400">Nu e timp de joacă. Să continuăm construcția.</p>
      </div>

      {/* Warnings / Alerts */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex items-start gap-4">
         <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
         <div>
           <h4 className="text-yellow-500 font-bold mb-1">Ai atins limita de dispozitive?</h4>
           <p className="text-sm text-yellow-500/80">Contul tău este conectat pe 2 dispozitive. Dacă te blochezi, accesează secțiunea Sesiuni pentru a revoca accesul unui dispozitiv vechi.</p>
         </div>
      </div>

      {/* Stats/Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <NmaGlassSurface radius="2xl" tone="clear" className="p-6">
           <div className="text-gray-400 text-sm mb-2 font-medium uppercase tracking-wider">Cursuri Active</div>
           <div className="text-3xl font-bold text-white">{purchases.length}</div>
        </NmaGlassSurface>
        <NmaGlassSurface radius="2xl" tone="clear" className="p-6">
           <div className="text-gray-400 text-sm mb-2 font-medium uppercase tracking-wider">Status Cont</div>
           <div className="text-xl font-bold text-green-400">Activ & Protejat</div>
        </NmaGlassSurface>
      </div>

      {/* My Courses */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Cursurile Tale</h2>
          <Link to="/dashboard/courses" className="text-nma-purple font-sm font-semibold hover:underline flex items-center gap-1">
            Vezi toate <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {myCoursesDetailed.length === 0 ? (
          <div className="p-8 border border-white/10 rounded-2xl bg-white/[0.02] text-center">
            <BookOpen className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Nu ai niciun curs activ</h3>
            <p className="text-gray-400 mb-6">Incepe calatoria chiar acum.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myCoursesDetailed.map(course => (
              <NmaGlassSurface key={course.course_id} radius="2xl" tone="clear" className="p-6 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                  <div className="w-full bg-white/10 rounded-full h-1.5 mb-2 mt-4">
                    <div className="bg-nma-purple h-1.5 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  <div className="text-xs text-gray-400 text-right">45% Finalizat</div>
                </div>
                <NmaGlassButton
                  asChild
                  glow="purple"
                  className="mt-6 w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Link to={`/course/${course.course_id}`}>
                  Continuă cursul
                  </Link>
                </NmaGlassButton>
              </NmaGlassSurface>
            ))}
          </div>
        )}
      </div>

      {/* Available Courses */}
      {availableCourses.length > 0 && (
         <div>
            <h2 className="text-2xl font-bold text-white mb-6">Deblochează următorul nivel</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableCourses.map(course => (
                <NmaGlassSurface
                  key={course.course_id} 
                  radius="2xl"
                  tone="clear"
                  className="group cursor-pointer"
                  onClick={() => navigate(`/courses/${course.slug}`)}
                >
                   <div className="h-32 overflow-hidden relative">
                     <img src={course.thumbnail} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" alt="" />
                     <div className="absolute inset-0 bg-gradient-to-t from-[#141419]/90 to-transparent"></div>
                   </div>
                   <div className="p-6 relative z-10 flex flex-col justify-between h-40">
                     <div>
                       <h3 className="text-lg font-bold text-white">{course.title}</h3>
                       <p className="text-sm text-gray-400 mt-1 line-clamp-2">{course.description}</p>
                     </div>
                     <div className="flex items-center gap-2 text-nma-purple font-semibold text-sm">
                       Află mai multe <ArrowRight className="w-4 h-4" />
                     </div>
                   </div>
                </NmaGlassSurface>
              ))}
            </div>
         </div>
      )}
    </div>
  );
}
