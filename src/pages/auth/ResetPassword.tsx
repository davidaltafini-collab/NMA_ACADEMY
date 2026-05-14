import React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { authService } from "../../services/authService";
import { ApiError } from "../../lib/apiClient";
import { NmaLogo } from "../../components/ui/nma-logo";
import LogoLoader from "../../components/ui/LogoLoader";

export default function ResetPassword() {
  const [searchParams]  = useSearchParams();
  const navigate        = useNavigate();

  const emailFromUrl = searchParams.get("email") ?? "";
  const tokenFromUrl = searchParams.get("token") ?? "";

  const [password, setPassword]             = React.useState("");
  const [confirmation, setConfirmation]     = React.useState("");
  const [showPassword, setShowPassword]     = React.useState(false);
  const [showConfirm, setShowConfirm]       = React.useState(false);
  const [loading, setLoading]               = React.useState(false);
  const [success, setSuccess]               = React.useState(false);
  const [error, setError]                   = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors]       = React.useState<Record<string, string>>({});

  // Guard: if no token/email in URL, show a clear error
  const missingParams = !emailFromUrl || !tokenFromUrl;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    try {
      await authService.resetPassword({
        email:                 emailFromUrl,
        token:                 tokenFromUrl,
        password,
        password_confirmation: confirmation,
      });

      setSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        const apiErrors = err.data?.errors ?? {};
        if (Object.keys(apiErrors).length > 0) {
          const mapped: Record<string, string> = {};
          for (const [key, msgs] of Object.entries(apiErrors)) {
            mapped[key] = Array.isArray(msgs) ? (msgs as string[])[0] : String(msgs);
          }
          setFieldErrors(mapped);
        } else {
          setError(err.data?.message ?? "Date invalide.");
        }
      } else if (err instanceof ApiError && err.status === 429) {
        setError("Prea multe incercari. Te rugam sa astepti cateva minute.");
      } else if (err instanceof ApiError) {
        setError(err.data?.message ?? "A aparut o eroare. Incearca din nou.");
      } else {
        setError("A aparut o eroare. Incearca din nou.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (missingParams) {
    return (
      <div className="min-h-[100dvh] bg-nma-darker flex flex-col justify-center py-12 px-6 lg:px-8 relative overflow-hidden">
        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
          <Link to="/" className="flex justify-center mb-8">
            <NmaLogo imageClassName="w-20 opacity-95" />
          </Link>
          <div className="glass-card p-8 rounded-2xl">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Link invalid</h2>
            <p className="text-gray-400 text-sm mb-6">
              Link-ul de resetare este invalid sau incomplet. Solicită un nou link de resetare.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-nma-purple to-nma-purple-dark text-white font-bold text-sm hover:brightness-110 transition-all"
            >
              Solicită un nou link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-nma-darker flex flex-col justify-center py-12 px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex justify-center mb-8">
          <NmaLogo imageClassName="w-20 opacity-95" />
        </Link>
        <h2 className="text-center text-3xl font-bold tracking-tight text-white">Parolă Nouă</h2>
        <p className="text-center text-sm text-gray-400 mt-2">
          Setează o parolă nouă pentru <span className="text-white">{emailFromUrl}</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-card p-8 rounded-2xl">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Parolă resetată!</h3>
              <p className="text-gray-400 text-sm mb-4">
                Parola ta a fost actualizată cu succes. Ești redirecționat spre login...
              </p>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Parolă nouă</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-white/10 rounded-xl bg-black/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nma-purple transition-all sm:text-sm"
                    placeholder="Minim 8 caractere, o majusculă, o cifră"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="mt-1 text-xs text-red-400">{fieldErrors.password}</p>
                )}
              </div>

              {/* Confirmation */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Confirmă parola</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-white/10 rounded-xl bg-black/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nma-purple transition-all sm:text-sm"
                    placeholder="Repetă parola nouă"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.password_confirmation && (
                  <p className="mt-1 text-xs text-red-400">{fieldErrors.password_confirmation}</p>
                )}
              </div>

              {/* Generic error */}
              {error && (
                <div className="flex items-center gap-2 text-sm rounded-xl px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                  {(error.includes("invalid") || error.includes("expirat")) && (
                    <Link to="/forgot-password" className="ml-auto text-nma-purple font-semibold whitespace-nowrap hover:underline text-xs">
                      Solicită alt link
                    </Link>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-br from-nma-purple to-nma-purple-dark hover:brightness-110 focus:outline-none transition-all disabled:opacity-50"
              >
                {loading ? <LogoLoader size={22} minHeight={0} /> : <>Setează Parola Nouă <ArrowRight className="ml-2 h-4 w-4" /></>}
              </button>
            </form>
          )}

          <div className="mt-6 border-t border-white/10 pt-6">
            <div className="text-sm text-center">
              <Link to="/login" className="font-medium text-gray-400 hover:text-white transition-colors">
                Înapoi la Log In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
