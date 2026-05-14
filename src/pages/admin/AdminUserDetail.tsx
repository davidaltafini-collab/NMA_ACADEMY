import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AdminUserDetail as AdminUser, adminService } from "../../services/adminService";
import { ArrowLeft, Mail, Ban, PlayCircle, Monitor } from "lucide-react";
import LogoLoader from "../../components/ui/LogoLoader";

export default function AdminUserDetail() {
  const { userId } = useParams();
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    if (userId) {
      adminService.getUserById(userId).then((data) => {
        if (data) setUser(data);
      });
    }
  }, [userId]);

  if (!user) return <LogoLoader minHeight={320} />;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center gap-4">
        <Link to="/admin/users" className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Profil User</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#141419]/50 border border-white/5 rounded-2xl p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-red-500/10 text-red-500 text-3xl font-bold flex items-center justify-center mb-4">
                {user.name[0]}
              </div>
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <p className="text-gray-400 text-sm mt-1">{user.email}</p>
              <div className="mt-4 flex gap-2">
                <span className="px-3 py-1 rounded bg-black border border-white/10 text-xs text-white font-mono">{user.role}</span>
                <span className={`px-3 py-1 rounded border text-xs font-bold ${
                  user.status === "suspended"
                    ? "bg-red-500/10 border-red-500/20 text-red-400"
                    : "bg-green-500/10 border-green-500/20 text-green-400"
                }`}>
                  {user.status ?? "active"}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/5 space-y-3 pb-6">
              <InfoRow label="Joined" value={new Date(user.created_at).toLocaleDateString()} />
              <InfoRow label="Last login" value={user.last_login_at ? new Date(user.last_login_at).toLocaleString() : "-"} />
              <InfoRow label="Cursuri active" value={String(user.active_courses_count ?? 0)} />
              <InfoRow label="Sesiuni active" value={String(user.active_sessions_count ?? 0)} />
              <InfoRow label="Marketing" value={user.marketing_consent ? "Da" : "Nu"} />
              <InfoRow label="ID" value={user.user_id} mono />
            </div>

            <div className="flex flex-col gap-2">
              <button className="w-full bg-white/5 hover:bg-white/10 text-white rounded-lg py-2 flex items-center justify-center gap-2 text-sm font-bold transition-colors">
                <Mail className="w-4 h-4" /> Trimite Email
              </button>
              <button className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg py-2 flex items-center justify-center gap-2 text-sm font-bold transition-colors">
                <Ban className="w-4 h-4" /> Suspenda Cont
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Panel title="Cursuri Cumpărate">
            <div className="space-y-4">
              {(user.courses ?? []).length === 0 && (
                <div className="text-gray-500 text-sm">Userul nu are cursuri cumpărate.</div>
              )}
              {(user.courses ?? []).map((access) => (
                <div key={access.id} className="p-4 rounded-xl border border-white/5 bg-black/30 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center">
                      <PlayCircle className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{access.course_title ?? "Curs șters"}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {access.purchased_at ? new Date(access.purchased_at).toLocaleDateString() : "Fără dată de achiziție"}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-green-400">{access.access_status}</div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Device-uri & Sesiuni">
            <div className="space-y-3">
              {(user.sessions ?? []).length === 0 && (
                <div className="text-gray-500 text-sm">Nu există sesiuni înregistrate.</div>
              )}
              {(user.sessions ?? []).map((session) => (
                <div key={session.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-black/30 p-4 text-sm">
                  <div className="flex items-center gap-3 text-gray-300">
                    <Monitor className="w-4 h-4 text-red-400" />
                    {session.device_name ?? session.browser ?? "Dispozitiv necunoscut"}
                  </div>
                  <div className="text-gray-500">
                    {session.last_active_at ? new Date(session.last_active_at).toLocaleString() : "-"}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`text-gray-300 text-right ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#141419]/50 border border-white/5 rounded-2xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}
