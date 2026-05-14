import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { authService } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../lib/apiClient";
import { NmaLogo } from "../../components/ui/nma-logo";
import LogoLoader from "../../components/ui/LogoLoader";

export default function Login() {
  const navigate = useNavigate();
  const auth     = useAuth();

  const [email, setEmail]     = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError]     = React.useState<string | null>(null);
  // When backend says requires_verification, offer a shortcut to re-verify
  const [unverifiedEmail, setUnverifiedEmail] = React.useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUnverifiedEmail(null);
    setLoading(true);

    try {
      const res = await authService.login(email, password);
      auth.login(res.token, res.user);
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        const data = err.data ?? {};

        // Email not verified — surface a link to verify
        if (err.status === 403 && data.data?.requires_verification) {
          setUnverifiedEmail(data.data.email ?? email);
          setError("Adresa de email nu este verificată. Verifică-ți inbox-ul.");
          return;
        }

        // Temporary block — show retry countdown if provided
        if (err.status === 429) {
          const retryAfter = data.retry_after;
          const minutes = retryAfter ? Math.ceil(retryAfter / 60) : 15;
          setError(`Prea multe încercări eșuate. Încearcă din nou după ${minutes} minute.`);
          return;
        }

        // Suspended, wrong credentials, or any other structured error
        setError(data.message ?? "Autentificare eșuată. Încearcă din nou.");
      } else {
        setError("Eroare de rețea. Verifică conexiunea și încearcă din nou.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    setError(null);
    setUnverifiedEmail(null);
    setLoading(true);

    try {
      const res = await authService.login("admin@example.com", "password");
      auth.login(res.token, res.user);
      navigate("/admin");
    } catch {
      setError("Admin demo nu este seed-uit in baza de date. Ruleaza db:seed in backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-nma-darker flex flex-col justify-center py-12 px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-[-12.5rem] right-[-6.25rem] w-[31.25rem] h-[31.25rem] bg-nma-purple/15 blur-[6.25rem] rounded-full z-0 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex justify-center mb-8">
          <NmaLogo imageClassName="w-20 opacity-95" />
        </Link>
        <h2 className="text-center text-3xl font-bold tracking-tight text-white">Intră în cont</h2>
        <p className="mt-2 text-center text-sm text-nma-silver opacity-70">
          Nu e timp de joacă. Continuă construcția.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-card-purple p-8 rounded-2xl">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-black/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nma-purple focus:border-transparent transition-all sm:text-sm"
                  placeholder="nume@email.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Parolă</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-black/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nma-purple focus:border-transparent transition-all sm:text-sm"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-nma-purple-light hover:text-nma-purple transition-colors">
                  Ai uitat parola?
                </Link>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="text-sm text-center space-y-1">
                <p className="text-red-400">{error}</p>
                {unverifiedEmail && (
                  <Link
                    to="/register"
                    state={{ email: unverifiedEmail, step: "verify" }}
                    className="text-nma-purple-light underline text-xs hover:text-nma-purple"
                  >
                    Verifică adresa de email
                  </Link>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-br from-nma-purple to-nma-purple-dark hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nma-purple transition-all disabled:opacity-50"
            >
              {loading ? <LogoLoader size={22} minHeight={0} /> : <>Intră <ArrowRight className="ml-2 h-4 w-4" /></>}
            </button>
          </form>

          <div className="mt-6 border-t border-white/10 pt-6">
            <div className="text-sm text-center mb-4">
              <span className="text-gray-400">Nu ai cont?</span>{" "}
              <Link to="/register" className="font-medium text-white hover:text-nma-purple-light transition-colors relative inline-block">
                Aplica acum
                <div className="absolute bottom-0 left-0 w-full h-px bg-nma-purple opacity-50"></div>
              </Link>
            </div>

            {/* Admin shortcut uses the seeded admin account in the real backend. */}
            <button
              type="button"
              onClick={handleAdminLogin}
              disabled={loading}
              className="w-full flex justify-center items-center py-2 px-4 border border-nma-purple/30 rounded-xl shadow-sm text-xs font-bold text-nma-purple-light bg-nma-purple/10 hover:bg-nma-purple/20 transition-all"
            >
              Intră ca admin demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
