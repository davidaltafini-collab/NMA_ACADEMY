import { Link } from "react-router-dom";
import { NmaLogo } from "../ui/nma-logo";

export default function Footer() {
  return (
    <footer className="bg-[#030304] border-t border-white/5 py-12 px-6 md:px-12 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-nma-purple/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="flex items-center gap-3">
             <NmaLogo imageClassName="w-16 opacity-90" />
             <span className="font-bold tracking-[0.2em] text-white">NOUA MEA AFACERE</span>
          </div>
          <p className="text-nma-silver-dark max-w-sm text-sm leading-relaxed">
            Platforma premium pentru cei care vor sa construiasca o afacere reala, nu doar sa viseze. Nu e timp de joaca.
          </p>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-6 tracking-wide text-sm">Platforma</h4>
          <ul className="space-y-3 text-sm">
            <li><Link to="#courses" className="text-nma-silver-dark hover:text-white transition-colors">Cursuri</Link></li>
            <li><Link to="#manifesto" className="text-nma-silver-dark hover:text-white transition-colors">Manifesto</Link></li>
            <li><Link to="#results" className="text-nma-silver-dark hover:text-white transition-colors">Rezultate</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-6 tracking-wide text-sm">Legal</h4>
          <ul className="space-y-3 text-sm">
            <li><Link to="#" className="text-nma-silver-dark hover:text-white transition-colors">Termeni si Conditii</Link></li>
            <li><Link to="#" className="text-nma-silver-dark hover:text-white transition-colors">Politica de Confidentialitate</Link></li>
            <li><Link to="#" className="text-nma-silver-dark hover:text-white transition-colors">Politica de Cookies</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-nma-silver-dark">
        <p>&copy; {new Date().getFullYear()} NMA. Toate drepturile rezervate.</p>
        <p>Construieste. Nu astepta.</p>
      </div>
    </footer>
  );
}
