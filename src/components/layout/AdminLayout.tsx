import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Target, 
  Mail, 
  LogOut, 
  Menu, 
  X 
} from "lucide-react";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../context/AuthContext";
import { NmaLogo } from "../ui/nma-logo";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { href: "/admin", label: "Overview", icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: "/admin/courses", label: "Cursuri", icon: <BookOpen className="w-5 h-5" /> },
    { href: "/admin/users", label: "Users", icon: <Users className="w-5 h-5" /> },
    { href: "/admin/leads", label: "Leads", icon: <Target className="w-5 h-5" /> },
    { href: "/admin/email-campaigns", label: "Campanii", icon: <Mail className="w-5 h-5" /> },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initials = (user?.name ?? "Admin")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-[100dvh] bg-[#050506] flex">
      {/* Sidebar - Desktop */}
      <aside className="w-[16rem] border-r border-white/5 bg-[#0a0a0c] hidden md:flex flex-col h-[100dvh] sticky top-0">
        <div className="h-20 flex items-center px-8 border-b border-white/5">
           <Link to="/admin" className="flex items-center gap-3">
            <NmaLogo imageClassName="w-10 h-10 object-contain" />
            <div>
              <div className="font-bold tracking-[0.1em] text-xs text-white">NMA ACADEMY</div>
              <div className="text-[0.625rem] text-red-500 font-mono tracking-wider">CONTROL PANEL</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          {links.map(link => {
            // Check active state exactly or startsWith for sub-pages
            const isActive = link.href === "/admin" 
              ? location.pathname === "/admin" 
              : location.pathname.startsWith(link.href);
              
            return (
              <Link 
                key={link.href} 
                to={link.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium",
                  isActive 
                    ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                )}
              >
                {link.icon}
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium">
             <LogOut className="w-5 h-5" />
             Exit Admin Mode
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-[100dvh] relative">
         <header className="h-20 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6 md:px-10">
           <div className="flex items-center gap-4">
             <button 
               className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white"
               onClick={() => setMobileMenuOpen(true)}
             >
               <Menu className="w-5 h-5" />
             </button>
             <div className="font-bold text-white text-lg hidden sm:block font-mono">Control Panel</div>
           </div>
           
           <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
               <div className="text-sm font-bold text-white">{user?.name ?? "Admin"}</div>
               <div className="text-xs text-red-400 font-mono">Admin</div>
             </div>
             <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-500 font-bold text-sm">
               {initials}
             </div>
           </div>
         </header>
         
         <div className="flex-1 p-6 md:p-10">
           <Outlet />
         </div>
      </main>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[80%] max-w-[20rem] bg-[#0a0a0c] border-r border-white/10 z-50 flex flex-col md:hidden shadow-[0_0_50px_rgba(239,68,68,0.15)]"
            >
               <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
                 <Link to="/admin" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
                  <NmaLogo imageClassName="w-8 h-8 object-contain" />
                  <span className="font-bold tracking-[0.1em] text-[0.75rem] text-white">NMA ADMIN</span>
                </Link>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white"
                >
                  <X className="w-5 h-5" />
                </button>
               </div>

               <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                {links.map(link => {
                  const isActive = link.href === "/admin" 
                    ? location.pathname === "/admin" 
                    : location.pathname.startsWith(link.href);
                  return (
                    <Link 
                      key={link.href} 
                      to={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-4 rounded-xl transition-all text-sm font-medium",
                        isActive 
                          ? "bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]" 
                          : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                      )}
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  )
                })}
              </nav>

              <div className="p-4 border-t border-white/5 pb-8">
                <button 
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }} 
                  className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium"
                >
                   <LogOut className="w-5 h-5" />
                   Exit Admin Mode
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
