import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { GlassFilter } from "../../components/ui/liquid-glass";
import { NmaGlassButton, NmaGlassSurface } from "../../components/ui/nma-glass";
import LogoLoader from "../../components/ui/LogoLoader";

export default function PaymentPending() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-[#030305] pt-32 pb-20 flex flex-col items-center justify-center">
      <GlassFilter />
      <NmaGlassSurface radius="3xl" tone="clear" className="p-10 max-w-lg w-full text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-nma-purple/20 blur-3xl rounded-full" />
        
        <LogoLoader className="relative z-10 mb-8" size={160} minHeight={0} />

        <div className="space-y-4 relative z-10">
          <NmaGlassButton
            glow="green"
            onClick={() => navigate("/payment/success")}
            className="w-full py-4 rounded-xl font-bold tracking-wider uppercase text-xs transition-all flex items-center justify-center gap-2"
          >
            Simulează Succes <ArrowRight className="w-4 h-4" />
          </NmaGlassButton>
          
          <NmaGlassButton
            glow="danger"
            onClick={() => navigate("/payment/failed")}
            className="w-full py-4 rounded-xl font-bold tracking-wider uppercase text-xs transition-all flex items-center justify-center gap-2"
          >
            Simulează Eroare <ArrowRight className="w-4 h-4" />
          </NmaGlassButton>
        </div>
      </NmaGlassSurface>
    </div>
  );
}
