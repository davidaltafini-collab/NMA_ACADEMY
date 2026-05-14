import React from "react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion"; // Am adăugat AnimatePresence pentru ieșiri fluide
import { Menu, X } from "lucide-react";
import { NmaLogo } from "../ui/nma-logo";
import { GlassFilter } from "../ui/liquid-glass";
import { NmaGlassButton, NmaGlassSurface } from "../ui/nma-glass";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      // Am optimizat durata la 0.6s și am folosit un ease mai "snappy" pentru a evita blocajele
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed left-0 right-0 z-50 px-3 md:px-8",
        isScrolled ? "top-3" : "top-5",
      )}
    >
      <GlassFilter />
      <NmaGlassSurface
        radius="3xl"
        tone={isScrolled ? "panel" : "clear"}
        className={cn(
          "mx-auto max-w-7xl cursor-default rounded-full max-md:bg-[#050506]/80 max-md:border-white/15 transition-shadow duration-500",
          isScrolled ? "shadow-[0_18px_60px_rgba(0,0,0,0.35)]" : "shadow-[0_14px_46px_rgba(0,0,0,0.22)]",
        )}
      >
        <div
          className={cn(
            "relative flex items-center justify-between px-4 transition-all duration-500 md:grid md:grid-cols-[20rem_minmax(0,1fr)_12rem] md:px-8",
            isScrolled ? "py-3" : "py-4",
          )}
        >
          <Link to="/" className="flex items-center gap-2 group justify-self-start">
            <NmaLogo
              className="transition-transform duration-500 group-hover:scale-105"
              imageClassName="w-[6rem] md:w-[7.5rem] opacity-95" // Am mărit logo-ul
            />
            {/* Am mărit textul ACADEMY (text-1.4rem) și am crescut tracking-ul */}
            <span className="font-bold tracking-[0.12em] text-[1.3rem] text-white hidden md:block">ACADEMY</span>
          </Link>

          <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 font-bold tracking-[0.12em] text-[0.82rem] text-white md:hidden">
            ACADEMY
          </span>

          {/* Meniul central: justify-end îl duce spre dreapta, gap-8 pentru apropiere optimă */}
          <div className="hidden md:flex items-center justify-end gap-8 pr-12 justify-self-stretch">
            <NavLink href="#manifesto">Metoda</NavLink>
            <NavLink href="#courses">Curriculum</NavLink>
            <NavLink href="#results">Sistem</NavLink>
            <NavLink href="#faq">Rezultate</NavLink>
          </div>

          <div className="hidden md:flex justify-end">
            <NmaGlassButton
              asChild
              glow="purple"
              className="px-6 py-2.5 text-[0.75rem] font-bold text-white transition-all duration-300 rounded-full uppercase tracking-[0.05em]"
              contentClassName="whitespace-nowrap"
            >
              <Link to="/login">
                Acces Exclusiv
              </Link>
            </NmaGlassButton>
          </div>

          <NmaGlassButton
            glow="neutral"
            size="icon"
            className="md:hidden h-11 w-11 rounded-full"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Închide meniul" : "Deschide meniul"}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </NmaGlassButton>
        </div>
      </NmaGlassSurface>

      {/* Meniul Mobile cu animație "Liquid/Stretching" */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10, filter: "blur(10px)" }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0, 
              filter: "blur(0px)",
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 20, // Acest damping mic creează efectul elastic (liquid)
                mass: 1
              }
            }}
            exit={{ opacity: 0, scale: 0.95, y: -10, filter: "blur(10px)" }}
            className="md:hidden absolute top-[calc(100%+0.6rem)] left-3 right-3 origin-top"
          >
            <NmaGlassSurface
              radius="3xl"
              tone="panel"
              className="p-5 bg-[#050506]/95 border-white/15 shadow-[0_24px_70px_rgba(0,0,0,0.55)]"
            >
              <div className="flex flex-col gap-4">
                <MobileNavLink href="#manifesto" onClick={() => setIsMobileMenuOpen(false)}>Manifesto</MobileNavLink>
                <MobileNavLink href="#courses" onClick={() => setIsMobileMenuOpen(false)}>Cursuri</MobileNavLink>
                <MobileNavLink href="#results" onClick={() => setIsMobileMenuOpen(false)}>Rezultate</MobileNavLink>
                <MobileNavLink href="#faq" onClick={() => setIsMobileMenuOpen(false)}>FAQ</MobileNavLink>
              </div>
            </NmaGlassSurface>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// NavLink-ul de desktop cu font mărit (0.9rem)
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className="text-[0.9rem] font-semibold text-white/85 hover:text-white transition-all hover:scale-105 active:scale-95 uppercase tracking-[0.12em]"
    >
      {children}
    </a>
  );
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onClick();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className="text-lg font-medium text-white/80 hover:text-white transition-colors py-3 border-b border-white/5 uppercase tracking-wide block"
    >
      {children}
    </a>
  );
}