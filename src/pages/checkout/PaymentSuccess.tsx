import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { GlassFilter } from "../../components/ui/liquid-glass";
import { NmaGlassButton, NmaGlassSurface } from "../../components/ui/nma-glass";

export default function PaymentSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-[#030305] flex flex-col items-center justify-center p-6 pt-20">
      <GlassFilter />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full"
      >
        <NmaGlassSurface radius="3xl" tone="clear" className="p-10 text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-green-500/20 blur-3xl rounded-full" />
        
        <motion.div
           initial={{ scale: 0 }}
           animate={{ scale: 1 }}
           transition={{ type: "spring", delay: 0.2 }}
           className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 border border-green-500/30"
        >
          <CheckCircle2 className="w-10 h-10 text-green-400" />
        </motion.div>

        <h1 className="text-3xl font-bold text-white mb-2 relative z-10">Plată Confirmată!</h1>
        <p className="text-gray-400 mb-8 relative z-10">
          Mulțumim pentru comandă! Accesul tău a fost activat și am emis factura. Un email a fost trimis către adresa ta.
        </p>

        <div className="relative z-10 space-y-4">
          <NmaGlassButton
            glow="purple"
            onClick={() => navigate("/dashboard/courses")}
            className="w-full py-4 rounded-xl font-bold tracking-wider uppercase text-xs transition-all flex items-center justify-center gap-2"
          >
            Mergi la Cursuri <ArrowRight className="w-4 h-4" />
          </NmaGlassButton>
        </div>
        </NmaGlassSurface>
      </motion.div>
    </div>
  );
}
