import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, BookOpen, CreditCard, MonitorSmartphone, LogOut, Menu, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { NmaLogo } from "../ui/nma-logo";
import { GlassFilter } from "../ui/liquid-glass";
import { NmaGlassButton } from "../ui/nma-glass";

export default function DashboardLayout() {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: "/dashboard/courses", label: "Cursurile Mele", icon: <BookOpen className="w-5 h-5" /> },
    { href: "/dashboard/billing", label: "Profil & Facturare", icon: <CreditCard className="w-5 h-5" /> },
    { href: "/dashboard/devices", label: "Sesiuni & Dispozitive", icon: <MonitorSmartphone className="w-5 h-5" /> },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-[100dvh] bg-nma-darker flex">
      <GlassFilter />
      {/* Sidebar - Desktop */}
      <aside className="w-[16rem] border-r border-white/5 bg-[#050506] hidden md:flex flex-col h-[100dvh] sticky top-0">
        <div className="h-20 flex items-center px-8 border-b border-white/5">
           <Link to="/" className="flex items-center gap-3">
            <NmaLogo imageClassName="w-16 opacity-95" />
            <span className="font-bold tracking-[0.1em] text-[0.875rem] text-white">ACADEMY</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {links.map(link => {
            const isActive = location.pathname === link.href;
            return (
              <Link 
                key={link.href} 
                to={link.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium",
                  isActive 
                    ? "bg-nma-purple/10 text-nma-purple border border-nma-purple/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]" 
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
          <NmaGlassButton
            glow="danger"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium justify-start"
            contentClassName="justify-start"
          >
             <LogOut className="w-5 h-5" />
             Ieși din cont
          </NmaGlassButton>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-[100dvh] relative">
         <header className="h-20 border-b border-white/5 bg-[#050506]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6 md:px-10">
           <div className="flex items-center gap-4">
             <NmaGlassButton
               glow="neutral"
               size="icon"
               className="md:hidden w-10 h-10 rounded-xl"
               onClick={() => setMobileMenuOpen(true)}
             >
               <Menu className="w-5 h-5" />
             </NmaGlassButton>
             <div className="font-bold text-white text-lg hidden sm:block">Platforma Cursanti</div>
           </div>
           
           <div className="flex items-center gap-4">
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-nma-purple to-nma-purple-dark border border-white/20 flex items-center justify-center text-white font-bold text-sm">
               A
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
              className="fixed inset-y-0 left-0 w-[80%] max-w-[20rem] bg-[#050506] border-r border-white/10 z-50 flex flex-col md:hidden shadow-[0_0_50px_rgba(139,92,246,0.15)]"
            >
               <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
                 <Link to="/" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
                  <NmaLogo imageClassName="w-14 opacity-95" />
                  <span className="font-bold tracking-[0.1em] text-[0.75rem] text-white">ACADEMY</span>
                </Link>
                <NmaGlassButton
                  glow="neutral"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-10 h-10 rounded-full"
                >
                  <X className="w-5 h-5" />
                </NmaGlassButton>
               </div>

               <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                {links.map(link => {
                  const isActive = location.pathname === link.href;
                  return (
                    <Link 
                      key={link.href} 
                      to={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-4 rounded-xl transition-all text-sm font-medium",
                        isActive 
                          ? "bg-nma-purple/10 text-nma-purple border border-nma-purple/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]" 
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
                <NmaGlassButton
                  glow="danger"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }} 
                  className="w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all text-sm font-medium justify-start"
                  contentClassName="justify-start"
                >
                   <LogOut className="w-5 h-5" />
                   Ieși din cont
                </NmaGlassButton>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
