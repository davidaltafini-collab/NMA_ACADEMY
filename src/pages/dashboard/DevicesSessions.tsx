import React from "react";
import { Monitor, Smartphone, Globe, LogOut, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { deviceService, ApiSession } from "../../services/deviceService";
import { useAuth } from "../../context/AuthContext";
import LogoLoader from "../../components/ui/LogoLoader";

export default function DevicesSessions() {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const [sessions, setSessions]   = React.useState<ApiSession[]>([]);
  const [loading, setLoading]     = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [revoking, setRevoking]   = React.useState<number | null>(null);
  const [revokeError, setRevokeError] = React.useState<string | null>(null);

  React.useEffect(() => {
    deviceService.getSessions()
      .then(setSessions)
      .catch(() => setLoadError("Nu am putut incarca sesiunile. Incearca din nou."))
      .finally(() => setLoading(false));
  }, []);

  const handleRevoke = async (session: ApiSession) => {
    setRevoking(session.id);
    setRevokeError(null);

    try {
      const result = await deviceService.revokeSession(session.id);

      if (result.revokedCurrentSession) {
        // Current session was revoked — clear auth state and redirect to login
        await logout();
        navigate("/auth/login");
        return;
      }

      // Remove the revoked session from the list
      setSessions((prev) => prev.filter((s) => s.id !== session.id));
    } catch {
      setRevokeError("Nu am putut revoca sesiunea. Incearca din nou.");
    } finally {
      setRevoking(null);
    }
  };

  if (loading) return <LogoLoader minHeight={320} />;
  if (loadError) return <div className="text-red-400 p-4">{loadError}</div>;

  return (
    <div className="space-y-10 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dispozitive & Sesiuni</h1>
        <p className="text-gray-400">Gestionează dispozitivele active. Limita: maxim 3 sesiuni active.</p>
      </div>

      {revokeError && (
        <div className="flex items-center gap-2 text-sm rounded-xl px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {revokeError}
        </div>
      )}

      <div className="space-y-4">
        {sessions.length === 0 ? (
          <div className="text-gray-400 text-sm">Nu exista sesiuni active.</div>
        ) : (
          sessions.map((session) => {
            const isMobile = session.device.includes("iOS") || session.device.includes("Android");
            const isBeingRevoked = revoking === session.id;

            return (
              <div
                key={session.id}
                className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                  session.is_current_session
                    ? "border-nma-purple/30 bg-nma-purple/5"
                    : "border-white/10 bg-[#141419]/50"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-black/50 border border-white/5 flex items-center justify-center shrink-0">
                    {isMobile
                      ? <Smartphone className="w-6 h-6 text-gray-400" />
                      : <Monitor className="w-6 h-6 text-gray-400" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-3">
                      {session.device}
                      {session.is_current_session && (
                        <span className="text-[0.625rem] uppercase tracking-widest bg-nma-purple text-white px-2 py-0.5 rounded-md font-bold">
                          Acest dispozitiv
                        </span>
                      )}
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5" /> {session.device}
                      </span>
                      <span className="hidden sm:inline text-gray-700">•</span>
                      <span className="font-mono text-xs mt-0.5">IP: {session.ip_address}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start md:items-end gap-3 mt-4 md:mt-0">
                  <span className="text-xs text-gray-400">
                    Ultima activitate:{" "}
                    {session.last_active_at
                      ? new Date(session.last_active_at).toLocaleString("ro-RO", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </span>

                  {session.is_current_session ? (
                    <button
                      onClick={() => handleRevoke(session)}
                      disabled={isBeingRevoked}
                      className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {isBeingRevoked
                        ? <LogoLoader size={20} minHeight={0} />
                        : <LogOut className="w-4 h-4" />}
                      Deconecteaza aceasta sesiune
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRevoke(session)}
                      disabled={isBeingRevoked}
                      className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {isBeingRevoked
                        ? <LogoLoader size={20} minHeight={0} />
                        : <LogOut className="w-4 h-4" />}
                      Deconecteaza dispozitiv
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
        <h4 className="font-bold text-white mb-2">Politica de securitate NMA</h4>
        <p className="text-sm text-gray-400 leading-relaxed">
          Sistemul nostru anti-leaking blochează automat conturile care depășesc limita de dispozitive sau care prezintă activitate suspectă. Dacă observi un dispozitiv necunoscut, revocă-i accesul imediat și schimbă parola.
        </p>
      </div>
    </div>
  );
}
