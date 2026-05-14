import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, KeyRound, Lock, Mail, RefreshCw, User as UserIcon } from "lucide-react";
import { authService } from "../../services/authService";
import { NmaLogo } from "../../components/ui/nma-logo";
import LogoLoader from "../../components/ui/LogoLoader";

type Step = "register" | "verify";

export default function Register() {
  const navigate = useNavigate();

  // ── Register step state ────────────────────────────────────────────────────
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // ── Verify step state ──────────────────────────────────────────────────────
  const [step, setStep] = React.useState<Step>("register");
  const [code, setCode] = React.useState("");
  const [verifyLoading, setVerifyLoading] = React.useState(false);
  const [verifyError, setVerifyError] = React.useState<string | null>(null);
  const [verifySuccess, setVerifySuccess] = React.useState(false);

  // ── Resend cooldown ────────────────────────────────────────────────────────
  const [resendCooldown, setResendCooldown] = React.useState(0);
  const [resendMsg, setResendMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authService.register({ name, email, password });
      setStep("verify");
      setResendCooldown(60);
    } catch (err: any) {
      const data = err?.data ?? {};
      // Show first field error if available, otherwise generic message
      const firstError =
        Object.values(data.errors ?? {})?.[0]?.[0] ??
        data.message ??
        "A apărut o eroare. Încearcă din nou.";
      setError(firstError as string);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError(null);
    setVerifyLoading(true);
    try {
      await authService.verifyEmailCode({ email, code: code.toUpperCase() });
      setVerifySuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      const data = err?.data ?? {};
      setVerifyError(data.message ?? "Cod incorect sau expirat.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResendMsg(null);
    try {
      const res = await authService.resendVerificationCode({ email });
      setResendMsg(res.message);
      setResendCooldown(60);
    } catch {
      setResendMsg("Nu s-a putut retrimite codul. Încearcă din nou.");
    }
  };

  // ── Render: verify step ────────────────────────────────────────────────────

  if (step === "verify") {
    return (
      <div className="min-h-[100dvh] bg-nma-darker flex flex-col justify-center py-12 px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute bottom-[-6.25rem] left-[-9.375rem] w-[25rem] h-[25rem] bg-nma-purple/10 blur-[6.25rem] rounded-full z-0 pointer-events-none" />

        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <Link to="/" className="flex justify-center mb-8">
            <NmaLogo imageClassName="w-20 opacity-95" />
          </Link>
          <h2 className="text-center text-3xl font-bold tracking-tight text-white">Verifică emailul</h2>
          <p className="mt-2 text-center text-sm text-nma-silver opacity-70">
            Am trimis un cod de 6 caractere la <span className="text-white">{email}</span>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="glass-card p-8 rounded-2xl">
            {verifySuccess ? (
              <div className="text-center py-4">
                <p className="text-green-400 font-semibold text-lg">Email verificat cu succes!</p>
                <p className="text-nma-silver opacity-70 text-sm mt-2">Te redirecționăm către login...</p>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleVerify}>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Cod de verificare</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyRound className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-black/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nma-purple focus:border-transparent transition-all sm:text-sm tracking-[0.3em] font-mono text-center uppercase"
                      placeholder="A1B2C3"
                      autoFocus
                      autoComplete="one-time-code"
                    />
                  </div>
                </div>

                {verifyError && (
                  <p className="text-red-400 text-sm text-center">{verifyError}</p>
                )}

                <button
                  type="submit"
                  disabled={verifyLoading || code.length < 6}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-gradient-to-br from-nma-dark to-nma-darker hover:border-nma-purple/50 focus:outline-none transition-all disabled:opacity-50"
                >
                  {verifyLoading ? <LogoLoader size={22} minHeight={0} /> : <>Verifică codul <ArrowRight className="ml-2 h-4 w-4" /></>}
                </button>
              </form>
            )}

            {!verifySuccess && (
              <div className="mt-6 border-t border-white/10 pt-6 text-center space-y-2">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  className="inline-flex items-center gap-2 text-sm text-nma-purple-light hover:text-nma-purple transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <RefreshCw className="h-4 w-4" />
                  {resendCooldown > 0
                    ? `Retrimite codul în ${resendCooldown}s`
                    : "Retrimite codul"}
                </button>
                {resendMsg && (
                  <p className="text-nma-silver opacity-70 text-xs">{resendMsg}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Render: register step ──────────────────────────────────────────────────

  return (
    <div className="min-h-[100dvh] bg-nma-darker flex flex-col justify-center py-12 px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute bottom-[-6.25rem] left-[-9.375rem] w-[25rem] h-[25rem] bg-nma-purple/10 blur-[6.25rem] rounded-full z-0 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex justify-center mb-8">
          <NmaLogo imageClassName="w-20 opacity-95" />
        </Link>
        <h2 className="text-center text-3xl font-bold tracking-tight text-white">Aplică pentru acces</h2>
        <p className="mt-2 text-center text-sm text-nma-silver opacity-70">
          Începe fundația noii tale afaceri.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-card p-8 rounded-2xl">
          <form className="space-y-6" onSubmit={handleRegister}>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Nume complet</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-black/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nma-purple focus:border-transparent transition-all sm:text-sm"
                  placeholder="Ion Popescu"
                />
              </div>
            </div>

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
                  placeholder="min. 8 caractere, majusculă, cifră"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Cel puțin 8 caractere, o literă mare și o cifră.</p>
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.2)] text-sm font-bold text-white bg-gradient-to-br from-nma-dark to-nma-darker hover:border-nma-purple/50 focus:outline-none transition-all disabled:opacity-50"
            >
              {loading ? <LogoLoader size={22} minHeight={0} /> : <>Crează Cont <ArrowRight className="ml-2 h-4 w-4" /></>}
            </button>
          </form>

          <div className="mt-6 border-t border-white/10 pt-6">
            <div className="text-sm text-center">
              <span className="text-gray-400">Ai deja cont?</span>{" "}
              <Link to="/login" className="font-medium text-white hover:text-nma-purple-light transition-colors relative inline-block">
                Intră aici
                <div className="absolute bottom-0 left-0 w-full h-px bg-nma-purple opacity-50"></div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
