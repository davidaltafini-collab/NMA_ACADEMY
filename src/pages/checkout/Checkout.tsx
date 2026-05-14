import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { courseService } from "../../services/courseService";
import { paymentService } from "../../services/paymentService";
import { Course } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { ShieldCheck, Lock, CreditCard } from "lucide-react";
import { GlassFilter } from "../../components/ui/liquid-glass";
import { NmaGlassButton, NmaGlassSurface } from "../../components/ui/nma-glass";
import LogoLoader from "../../components/ui/LogoLoader";

export default function Checkout() {
  const { courseSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [discountCode, setDiscountCode] = useState("");
  const [discountStatus, setDiscountStatus] = useState<"idle" | "validating" | "valid" | "invalid">("idle");
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    // If not logged in, redirect to register with redirect
    if (!user) {
      navigate(`/register?redirect=/checkout/${courseSlug}`);
      return;
    }

    const fetchCourse = async () => {
      if (courseSlug) {
        const data = await courseService.getCourseBySlug(courseSlug);
        setCourse(data || null);
      }
      setLoading(false);
    };
    fetchCourse();
  }, [courseSlug, user, navigate]);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    setDiscountStatus("validating");
    const { valid, percentage } = await paymentService.validateDiscount(discountCode);
    if (valid) {
      setDiscountPercentage(percentage);
      setDiscountStatus("valid");
    } else {
      setDiscountPercentage(0);
      setDiscountStatus("invalid");
    }
  };

  const handleCheckout = async () => {
    if (!course) return;
    setCheckingOut(true);
    try {
      const response = await paymentService.createCheckoutSession(course.slug, discountStatus === "valid" ? discountCode : undefined);
      // Simulate real redirect to Netopia By redirecting to our pending page
      navigate(response.url);
    } catch (e) {
      console.error(e);
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#030305] flex items-center justify-center pt-20">
        <LogoLoader minHeight={0} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-[100dvh] bg-[#030305] flex flex-col items-center justify-center p-6 pt-20">
        <h1 className="text-2xl font-bold text-white mb-4">Eroare</h1>
        <p className="text-gray-400 text-center">Cursul nu a fost găsit pentru checkout.</p>
        <NmaGlassButton
          glow="neutral"
          onClick={() => navigate("/")}
          className="mt-6 px-5 py-2.5 rounded-xl text-sm font-medium"
        >
          Return to home
        </NmaGlassButton>
      </div>
    );
  }

  const discountAmount = discountPercentage > 0 ? (course.price * discountPercentage) / 100 : 0;
  const totalAmount = course.price - discountAmount;

  return (
    <div className="min-h-[100dvh] bg-[#030305] pt-32 pb-20">
      <GlassFilter />
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-white mb-8">Finalizează Comanda</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-2 space-y-6">
            <NmaGlassSurface radius="3xl" tone="clear" className="p-8">
              <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-nma-purple" /> Detalii Facturare
              </h2>
              <div className="space-y-4">
                <p className="text-sm text-gray-400">Autentificat ca:</p>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col">
                  <span className="text-white font-medium">{user?.name}</span>
                  <span className="text-gray-400 text-sm">{user?.email}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Aceste detalii vor fi folosite pentru a genera factura fiscală în Oblio după finalizarea plății cu Netopia. Vă rugăm să vă asigurați referintele din profil. <br/>
                  *In acest demo mock, datele sunt completate de la profil.
                </p>
                <p className="text-xs">
                  <button onClick={() => navigate("/dashboard/billing")} className="text-nma-purple hover:underline">Editează detaliile de facturare</button>
                </p>
              </div>
            </NmaGlassSurface>
            
            <NmaGlassSurface radius="3xl" tone="clear" className="p-8">
              <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-nma-purple" /> Plata Securizata Netopia
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                Urmatorul pas te va redirecționa către procesatorul de plăți sigur Netopia Payments. Nu stocăm datele cardului.
              </p>
              <div className="flex gap-4 items-center">
                <div className="w-12 h-8 bg-gray-800 rounded flex items-center justify-center text-[0.625rem] font-bold text-gray-400">VISA</div>
                <div className="w-12 h-8 bg-gray-800 rounded flex items-center justify-center text-[0.625rem] font-bold text-gray-400">MC</div>
                <Lock className="w-4 h-4 text-gray-500 ml-auto" />
              </div>
            </NmaGlassSurface>
          </div>
          
          <div className="md:col-span-1">
            <NmaGlassSurface radius="3xl" tone="purple" className="sticky top-24 p-6">
               <h3 className="text-lg font-bold text-white mb-4">Sumar</h3>
               
               <div className="flex gap-4 mb-6">
                 <img src={course.thumbnail} alt="thumbnail" className="w-16 h-16 object-cover rounded-xl border border-white/10" />
                 <div>
                   <h4 className="text-white font-medium text-sm">{course.title}</h4>
                   <p className="text-gray-400 text-xs">Acces pe viață</p>
                 </div>
               </div>
               
               <div className="border-t border-white/10 pt-4 mb-4 space-y-2">
                 <div className="flex justify-between text-sm">
                   <span className="text-gray-400">Subtotal</span>
                   <span className="text-white">{course.price} &euro;</span>
                 </div>
                 {discountPercentage > 0 && (
                   <div className="flex justify-between text-sm text-green-400">
                     <span>Reducere ({discountPercentage}%)</span>
                     <span>- {discountAmount.toFixed(2)} &euro;</span>
                   </div>
                 )}
               </div>
               
               <div className="border-t border-white/10 pt-4 mb-6">
                 <div className="flex justify-between items-baseline">
                   <span className="text-gray-300 font-medium">Total</span>
                   <span className="text-2xl font-bold text-white">{totalAmount} &euro;</span>
                 </div>
               </div>
               
               <div className="mb-6">
                 <label className="text-xs text-gray-400 block mb-2">Cod de reducere (Demo: NMA20)</label>
                 <div className="flex gap-2">
                   <input 
                     type="text" 
                     value={discountCode}
                     onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                     disabled={discountStatus === "valid" || discountStatus === "validating"}
                     className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nma-purple"
                     placeholder="Cod promo..."
                   />
                   {discountStatus === "valid" ? (
                      <NmaGlassButton
                        glow="green"
                        disabled
                        className="px-3 py-2 rounded-lg text-sm"
                      >
                       Aplicat
                      </NmaGlassButton>
                   ) : (
                      <NmaGlassButton
                        glow="neutral"
                        onClick={handleApplyDiscount}
                        disabled={discountStatus === "validating"}
                        className="px-3 py-2 rounded-lg text-sm"
                      >
                       {discountStatus === "validating" ? <LogoLoader size={20} minHeight={0} /> : 'Aplică'}
                      </NmaGlassButton>
                   )}
                 </div>
                 {discountStatus === "invalid" && <p className="text-red-400 text-xs mt-2">Cod invalid.</p>}
               </div>
               
               <NmaGlassButton
                 glow="purple"
                 onClick={handleCheckout}
                 disabled={checkingOut}
                 className="w-full py-4 rounded-xl font-bold tracking-wider uppercase text-xs transition-all flex justify-center items-center gap-2"
               >
                 {checkingOut ? <LogoLoader size={22} minHeight={0} /> : `Plătește ${totalAmount} €`}
               </NmaGlassButton>
            </NmaGlassSurface>
          </div>
          
        </div>
      </div>
    </div>
  );
}
