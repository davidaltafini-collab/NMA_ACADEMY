import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail, AlertCircle } from "lucide-react";
import { authService } from "../../services/authService";
import { ApiError } from "../../lib/apiClient";
import { NmaLogo } from "../../components/ui/nma-logo";
import LogoLoader from "../../components/ui/LogoLoader";

export default function ForgotPassword() {
  const [email, setEmail]   = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent]     = React.useState(false);
  const [error, setError]   = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        const firstError = Object.values(err.data?.errors ?? {})[0];
        setError(Array.isArray(firstError) ? firstError[0] : String(firstError));
      } else if (err instanceof ApiError && err.status === 429) {
        setError("Prea multe cereri. Te rugam sa astepti cateva minute.");
      } else {
        setError("A aparut o eroare. Incearca din nou.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-nma-darker flex flex-col justify-center py-12 px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex justify-center mb-8">
          <NmaLogo imageClassName="w-20 opacity-95" />
        </Link>
        <h2 className="text-center text-3xl font-bold tracking-tight text-white">Resetare Parolă</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-card p-8 rounded-2xl">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                <Mail className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Verifică inbox-ul!</h3>
              <p className="text-gray-400 text-sm mb-6">
                Dacă adresa există în sistem, vei primi un email cu instrucțiuni pentru resetarea parolei.
                Link-ul este valabil <strong className="text-white">1 oră</strong>.
              </p>
              <Link to="/login" className="text-nma-purple font-semibold hover:underline">
                Înapoi la login
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
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
                    className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-black/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nma-purple transition-all sm:text-sm"
                    placeholder="nume@email.com"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm rounded-xl px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-br from-nma-purple to-nma-purple-dark hover:brightness-110 focus:outline-none transition-all disabled:opacity-50"
              >
                {loading ? <LogoLoader size={22} minHeight={0} /> : <>Trimite Link <ArrowRight className="ml-2 h-4 w-4" /></>}
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
