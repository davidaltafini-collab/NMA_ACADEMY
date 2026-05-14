import React from "react";
import {
  CreditCard, FileText, User as UserIcon,
  CheckCircle, AlertCircle,
  Lock, Eye, EyeOff, Mail, Trash2, X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { userService, UserProfile } from "../../services/userService";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../lib/apiClient";
import { NmaGlassButton, NmaGlassSurface } from "../../components/ui/nma-glass";
import LogoLoader from "../../components/ui/LogoLoader";

type EmailChangeStep = "idle" | "code_sent";
type Msg = { type: "success" | "error"; text: string };
type MsgState = Msg | null;

function FeedbackBanner({ msg }: { msg: { type: "success" | "error"; text: string } }) {
  return (
    <div className={`flex items-start gap-2 text-sm rounded-xl px-4 py-3 ${
      msg.type === "success"
        ? "bg-green-500/10 border border-green-500/20 text-green-400"
        : "bg-red-500/10 border border-red-500/20 text-red-400"
    }`}>
      {msg.type === "success"
        ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
        : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
      <span>{msg.text}</span>
    </div>
  );
}

function PasswordInput({
  value, onChange, show, onToggle, placeholder,
}: {
  value: string; onChange: (v: string) => void;
  show: boolean; onToggle: () => void; placeholder?: string;
}) {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white placeholder-gray-600 focus:border-nma-purple focus:outline-none"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function DeleteModal({
  onConfirm, onClose,
}: {
  onConfirm: (password: string, confirmation: string) => Promise<void>;
  onClose: () => void;
}) {
  const [pw, setPw]       = React.useState("");
  const [text, setText]   = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr]     = React.useState<string | null>(null);
  const [fieldErr, setFieldErr] = React.useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setFieldErr({});
    if (!pw) { setFieldErr({ password: "Parola este obligatorie." }); return; }
    if (text !== "DELETE") { setFieldErr({ confirmation: 'Trebuie sa scrii exact DELETE.' }); return; }
    setLoading(true);
    try {
      await onConfirm(pw, text);
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        const apiErrors = error.data?.errors ?? {};
        if (apiErrors.password) {
          setFieldErr({ password: Array.isArray(apiErrors.password) ? apiErrors.password[0] : String(apiErrors.password) });
        } else {
          setErr(error.data?.message ?? "Date invalide.");
        }
      } else if (error instanceof ApiError && error.status === 429) {
        setErr("Prea multe incercari. Asteapta cateva minute.");
      } else {
        setErr("A aparut o eroare. Incearca din nou.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md bg-[#18181f] border border-red-500/20 rounded-2xl p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Confirmare ștergere cont</h3>
            <p className="text-xs text-gray-500">Această acțiune este ireversibilă</p>
          </div>
        </div>

        <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4 mb-6 text-sm text-red-400 space-y-1">
          <p>• Contul tău va fi dezactivat și acces la cursuri revocat.</p>
          <p>• Toate sesiunile active vor fi deconectate.</p>
          <p>• Nu te vei putea autentifica cu acest cont.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Parola curentă</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                required value={pw}
                onChange={(e) => setPw(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white focus:border-red-500 focus:outline-none"
              />
              <button type="button" onClick={() => setShowPw((v) => !v)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {fieldErr.password && <p className="mt-1 text-xs text-red-400">{fieldErr.password}</p>}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Scrie <span className="font-mono font-bold text-white">DELETE</span> pentru a confirma
            </label>
            <input
              type="text" required value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="DELETE"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:border-red-500 focus:outline-none"
            />
            {fieldErr.confirmation && <p className="mt-1 text-xs text-red-400">{fieldErr.confirmation}</p>}
          </div>

          {err && (
            <div className="flex items-center gap-2 text-sm rounded-xl px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />{err}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
              Anulează
            </button>
            <button type="submit" disabled={loading || text !== "DELETE"}
              className="flex-1 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
              {loading ? <LogoLoader size={22} minHeight={0} /> : <><Trash2 className="w-4 h-4" /> Sterge contul</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BillingProfile() {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  // ── Profile form ──────────────────────────────────────────────────────────
  const [name, setName]   = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [saving, setSaving]     = React.useState(false);
  const [saveMsg, setSaveMsg]   = React.useState<MsgState>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  // ── Email change ──────────────────────────────────────────────────────────
  const [ecStep, setEcStep]               = React.useState<EmailChangeStep>("idle");
  const [ecNewEmail, setEcNewEmail]       = React.useState("");
  const [ecPassword, setEcPassword]       = React.useState("");
  const [ecShowPw, setEcShowPw]           = React.useState(false);
  const [ecCode, setEcCode]               = React.useState("");
  const [ecPendingEmail, setEcPendingEmail] = React.useState("");
  const [ecLoading, setEcLoading]         = React.useState(false);
  const [ecCancelLoading, setEcCancelLoading] = React.useState(false);
  const [ecMsg, setEcMsg]                 = React.useState<MsgState>(null);
  const [ecErrors, setEcErrors]           = React.useState<Record<string, string>>({});

  // ── Account deletion ─────────────────────────────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  // ── Password change ───────────────────────────────────────────────────────
  const [currentPw, setCurrentPw]     = React.useState("");
  const [newPw, setNewPw]             = React.useState("");
  const [confirmPw, setConfirmPw]     = React.useState("");
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew]         = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [pwSaving, setPwSaving]       = React.useState(false);
  const [pwMsg, setPwMsg]             = React.useState<MsgState>(null);
  const [pwErrors, setPwErrors]       = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    userService.getProfile()
      .then((p) => { setProfile(p); setName(p.name); setPhone(p.phone ?? ""); })
      .catch(() => setLoadError("Nu am putut incarca profilul. Incearca din nou."));
  }, []);

  // ── Handlers: account deletion ───────────────────────────────────────────
  const handleDeleteAccount = async (password: string, confirmation: string): Promise<void> => {
    await userService.deleteAccount({ password, confirmation });
    setShowDeleteModal(false);
    await logout();
    navigate("/");
  };

  // ── Handlers: profile ─────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setSaveMsg(null); setFieldErrors({});
    try {
      const updated = await userService.updateProfile({ name, phone: phone || null });
      setProfile(updated); setName(updated.name); setPhone(updated.phone ?? "");
      setSaveMsg({ type: "success", text: "Profilul a fost actualizat cu succes." });
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        const mapped: Record<string, string> = {};
        for (const [k, v] of Object.entries(err.data?.errors ?? {}))
          mapped[k] = Array.isArray(v) ? (v as string[])[0] : String(v);
        setFieldErrors(mapped);
      } else {
        setSaveMsg({ type: "error", text: "A aparut o eroare. Incearca din nou." });
      }
    } finally { setSaving(false); }
  };

  // ── Handlers: email change ────────────────────────────────────────────────
  const handleRequestEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setEcLoading(true); setEcMsg(null); setEcErrors({});
    try {
      await userService.requestEmailChange({ new_email: ecNewEmail, current_password: ecPassword });
      setEcPendingEmail(ecNewEmail);
      setEcPassword(""); setEcShowPw(false);
      setEcStep("code_sent");
      setEcMsg({ type: "success", text: `Codul a fost trimis la ${ecNewEmail}. Valabil 1 oră.` });
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        const apiErrors = err.data?.errors ?? {};
        if (Object.keys(apiErrors).length > 0) {
          const mapped: Record<string, string> = {};
          for (const [k, v] of Object.entries(apiErrors))
            mapped[k] = Array.isArray(v) ? (v as string[])[0] : String(v);
          setEcErrors(mapped);
        } else {
          setEcMsg({ type: "error", text: err.data?.message ?? "Date invalide." });
        }
      } else if (err instanceof ApiError && err.status === 429) {
        setEcMsg({ type: "error", text: "Prea multe cereri. Asteapta cateva minute." });
      } else {
        setEcMsg({ type: "error", text: "A aparut o eroare. Incearca din nou." });
      }
    } finally { setEcLoading(false); }
  };

  const handleConfirmEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setEcLoading(true); setEcMsg(null);
    try {
      const updatedUser = await userService.confirmEmailChange(ecCode);
      setProfile((prev) => prev ? { ...prev, email: updatedUser.email, email_verified_at: updatedUser.email_verified_at } : prev);
      setEcStep("idle");
      setEcNewEmail(""); setEcCode(""); setEcPendingEmail("");
      setEcMsg({ type: "success", text: "Adresa de email a fost schimbata cu succes." });
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        setEcMsg({ type: "error", text: err.data?.message ?? "Cod invalid sau expirat." });
      } else if (err instanceof ApiError && err.status === 429) {
        setEcMsg({ type: "error", text: "Prea multe incercari. Asteapta cateva minute." });
      } else {
        setEcMsg({ type: "error", text: "A aparut o eroare. Incearca din nou." });
      }
    } finally { setEcLoading(false); }
  };

  const handleCancelEmailChange = async () => {
    setEcCancelLoading(true); setEcMsg(null);
    try {
      await userService.cancelEmailChange();
      setEcStep("idle");
      setEcNewEmail(""); setEcCode(""); setEcPendingEmail(""); setEcErrors({});
      setEcMsg({ type: "success", text: "Schimbarea adresei de email a fost anulata." });
    } catch {
      setEcMsg({ type: "error", text: "A aparut o eroare. Incearca din nou." });
    } finally { setEcCancelLoading(false); }
  };

  // ── Handlers: password ────────────────────────────────────────────────────
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwSaving(true); setPwMsg(null); setPwErrors({});
    try {
      await userService.changePassword({ current_password: currentPw, password: newPw, password_confirmation: confirmPw });
      setPwMsg({ type: "success", text: "Parola a fost schimbata cu succes. Celelalte sesiuni active au fost deconectate." });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        const apiErrors = err.data?.errors ?? {};
        if (Object.keys(apiErrors).length > 0) {
          const mapped: Record<string, string> = {};
          for (const [k, v] of Object.entries(apiErrors))
            mapped[k] = Array.isArray(v) ? (v as string[])[0] : String(v);
          setPwErrors(mapped);
        } else {
          setPwMsg({ type: "error", text: err.data?.message ?? "Date invalide." });
        }
      } else if (err instanceof ApiError && err.status === 429) {
        setPwMsg({ type: "error", text: "Prea multe incercari. Asteapta un minut." });
      } else {
        setPwMsg({ type: "error", text: "A aparut o eroare. Incearca din nou." });
      }
    } finally { setPwSaving(false); }
  };

  // ─────────────────────────────────────────────────────────────────────────
  if (loadError) return <div className="text-red-400 p-4">{loadError}</div>;
  if (!profile)  return <LogoLoader minHeight={320} />;

  return (
    <div className="space-y-10 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Profil & Plăți</h1>
        <p className="text-gray-400">Păstrează-ți informațiile personale și facturile la zi.</p>
      </div>

      {/* ── Row 1: Profile + Invoices ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Card */}
        <NmaGlassSurface radius="2xl" tone="clear" className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-nma-purple to-nma-purple-dark flex items-center justify-center border border-white/20">
              <UserIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Date Personale</h3>
              <p className="text-sm text-gray-400">Gestionează profilul tău</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Nume Complet</label>
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                required maxLength={255}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-nma-purple focus:outline-none"
              />
              {fieldErrors.name && <p className="mt-1 text-xs text-red-400">{fieldErrors.name}</p>}
            </div>

            {/* Email — read-only display; change is handled in its own card below */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input
                type="email" disabled value={profile.email}
                className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Telefon</label>
              <input
                type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                maxLength={30} placeholder="+40 7xx xxx xxx"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-nma-purple focus:outline-none"
              />
              {fieldErrors.phone && <p className="mt-1 text-xs text-red-400">{fieldErrors.phone}</p>}
            </div>

            {saveMsg && <FeedbackBanner msg={saveMsg} />}

            <NmaGlassButton type="submit" disabled={saving}
              glow="neutral"
              className="px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              {saving ? <LogoLoader size={22} minHeight={0} /> : "Salvează Modificările"}
            </NmaGlassButton>
          </form>
        </NmaGlassSurface>

        {/* Invoices Card */}
        <NmaGlassSurface radius="2xl" tone="clear" className="p-8 flex flex-col">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <CreditCard className="w-6 h-6 text-nma-silver" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Istoric Facturi</h3>
              <p className="text-sm text-gray-400">Vezi achizițiile anterioare</p>
            </div>
          </div>
          <div className="flex-1 space-y-4">
            {[{ date: "12 Mar 2024", amount: "850 EUR", item: "E-Commerce Elite" }].map((inv, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div>
                  <div className="text-white font-medium mb-1">{inv.item}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <FileText className="w-3 h-3" /> Factura #{1024 + i} • {inv.date}
                  </div>
                </div>
                <div className="mt-3 sm:mt-0 flex items-center gap-4">
                  <span className="text-nma-purple-light font-mono text-sm">{inv.amount}</span>
                  <button className="text-xs font-semibold text-gray-400 hover:text-white uppercase tracking-wider">Descarca</button>
                </div>
              </div>
            ))}
          </div>
        </NmaGlassSurface>
      </div>

      {/* ── Email Change Card ───────────────────────────────────────────────── */}
      <NmaGlassSurface radius="2xl" tone="clear" className="p-8 max-w-lg">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
            <Mail className="w-6 h-6 text-nma-silver" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Schimbă Adresa de Email</h3>
            <p className="text-sm text-gray-400">Email curent: <span className="text-white">{profile.email}</span></p>
          </div>
        </div>

        {ecStep === "idle" ? (
          <form onSubmit={handleRequestEmailChange} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Adresa de email nouă</label>
              <input
                type="email" required value={ecNewEmail}
                onChange={(e) => setEcNewEmail(e.target.value)}
                placeholder="noua@adresa.com"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-nma-purple focus:outline-none"
              />
              {ecErrors.new_email && <p className="mt-1 text-xs text-red-400">{ecErrors.new_email}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Parola curentă</label>
              <PasswordInput
                value={ecPassword} onChange={setEcPassword}
                show={ecShowPw} onToggle={() => setEcShowPw((v) => !v)}
              />
              {ecErrors.current_password && <p className="mt-1 text-xs text-red-400">{ecErrors.current_password}</p>}
            </div>

            {ecMsg && <FeedbackBanner msg={ecMsg} />}

            <NmaGlassButton type="submit" disabled={ecLoading}
              glow="neutral"
              className="px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              {ecLoading ? <LogoLoader size={22} minHeight={0} /> : "Trimite cod de verificare"}
            </NmaGlassButton>
          </form>
        ) : (
          <div className="space-y-5">
            {ecMsg && <FeedbackBanner msg={ecMsg} />}

            <p className="text-sm text-gray-400">
              Introdu codul de 6 caractere trimis la{" "}
              <span className="text-white font-medium">{ecPendingEmail}</span>.
            </p>

            <form onSubmit={handleConfirmEmailChange} className="space-y-5">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Cod de verificare</label>
                <input
                  type="text" required
                  value={ecCode}
                  onChange={(e) => setEcCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  placeholder="Ex: A3K7PW"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono tracking-widest text-center text-lg uppercase focus:border-nma-purple focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <NmaGlassButton type="submit" disabled={ecLoading}
                  glow="purple"
                  className="flex-1 px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {ecLoading ? <LogoLoader size={22} minHeight={0} /> : "Confirmă emailul"}
                </NmaGlassButton>

                <NmaGlassButton
                  glow="neutral"
                  type="button"
                  onClick={handleCancelEmailChange}
                  disabled={ecCancelLoading}
                  className="px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                >
                  {ecCancelLoading ? <LogoLoader size={22} minHeight={0} /> : "Anulează"}
                </NmaGlassButton>
              </div>
            </form>
          </div>
        )}
      </NmaGlassSurface>

      {/* ── Password Change Card ──────────────────────────────────────────── */}
      <NmaGlassSurface radius="2xl" tone="clear" className="p-8 max-w-lg">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
            <Lock className="w-6 h-6 text-nma-silver" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Schimbă Parola</h3>
            <p className="text-sm text-gray-400">Actualizează parola contului tău</p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Parola curentă</label>
            <PasswordInput value={currentPw} onChange={setCurrentPw} show={showCurrent} onToggle={() => setShowCurrent((v) => !v)} />
            {pwErrors.current_password && <p className="mt-1 text-xs text-red-400">{pwErrors.current_password}</p>}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Parolă nouă</label>
            <PasswordInput value={newPw} onChange={setNewPw} show={showNew} onToggle={() => setShowNew((v) => !v)} placeholder="Minim 8 caractere, o majusculă, o cifră" />
            {pwErrors.password && <p className="mt-1 text-xs text-red-400">{pwErrors.password}</p>}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Confirmă parola nouă</label>
            <PasswordInput value={confirmPw} onChange={setConfirmPw} show={showConfirm} onToggle={() => setShowConfirm((v) => !v)} />
            {pwErrors.password_confirmation && <p className="mt-1 text-xs text-red-400">{pwErrors.password_confirmation}</p>}
          </div>

          {pwMsg && <FeedbackBanner msg={pwMsg} />}

          <NmaGlassButton type="submit" disabled={pwSaving}
            glow="neutral"
            className="px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            {pwSaving ? <LogoLoader size={22} minHeight={0} /> : "Schimbă Parola"}
          </NmaGlassButton>
        </form>
      </NmaGlassSurface>

      {/* ── Danger Zone Card ────────────────────────────────────────────────── */}
      <NmaGlassSurface radius="2xl" tone="clear" className="p-8 max-w-lg border-red-500/10">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
            <Trash2 className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Ștergere Cont</h3>
            <p className="text-sm text-red-400/70">Acțiune permanentă și ireversibilă</p>
          </div>
        </div>

        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
          Ștergerea contului va revoca accesul la toate cursurile, va deconecta toate
          dispozitivele active și va dezactiva contul. Datele nu sunt șterse permanent —
          ele pot fi recuperate de echipa de suport dacă te răzgândești.
        </p>

        <NmaGlassButton
          glow="danger"
          onClick={() => setShowDeleteModal(true)}
          className="px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Șterge contul
        </NmaGlassButton>
      </NmaGlassSurface>

      {/* Deletion confirmation modal */}
      {showDeleteModal && (
        <DeleteModal
          onConfirm={handleDeleteAccount}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
