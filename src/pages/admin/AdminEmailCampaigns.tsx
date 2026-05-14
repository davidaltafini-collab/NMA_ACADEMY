import React, { useState } from "react";
import { adminService } from "../../services/adminService";
import { Send, Users, Activity, MailCheck } from "lucide-react";
import LogoLoader from "../../components/ui/LogoLoader";

type Segment = "all" | "leads" | "active_buyers" | "non_buyers";

export default function AdminEmailCampaigns() {
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [segment, setSegment] = useState<Segment>("all");
  const [body, setBody] = useState("");
  const [sentCount, setSentCount] = useState<number | null>(null);

  const handleSend = async () => {
    if (!subject.trim()) return;
    setLoading(true);
    try {
      const result = await adminService.sendEmailCampaign({ subject, body, segment });
      setSentCount(result.sent_count);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-white">Email Campaigns</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Metric title="Campanii Logate" value="email_logs" icon={<Send className="w-5 h-5" />} />
        <Metric title="Segmentare" value="DB real" icon={<Users className="w-5 h-5" />} />
        <Metric title="Status" value="Tracked" icon={<Activity className="w-5 h-5" />} />
      </div>

      <div className="bg-[#141419]/50 border border-white/5 rounded-2xl p-6 space-y-6">
        <h2 className="text-lg font-bold text-white mb-2">Campanie Nouă</h2>

        {sentCount !== null && (
          <div className="flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            <MailCheck className="w-4 h-4" />
            Campania a fost înregistrată pentru {sentCount} destinatari reali.
          </div>
        )}

        <div>
          <label className="block text-sm text-gray-400 mb-1">Subiect</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500/50"
            placeholder="Reducere 50% doar astăzi"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Segment Audiență</label>
          <select
            value={segment}
            onChange={(e) => setSegment(e.target.value as Segment)}
            className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500/50 appearance-none"
          >
            <option value="all">Toți utilizatorii activi</option>
            <option value="leads">Leads cu marketing consent</option>
            <option value="active_buyers">Cumpărători activi</option>
            <option value="non_buyers">Utilizatori fără cumpărături</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Conținut</label>
          <textarea
            rows={6}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500/50"
            placeholder="Scrie mesajul aici..."
          />
        </div>

        <button
          onClick={handleSend}
          disabled={loading || !subject.trim()}
          className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors w-full sm:w-auto"
        >
          {loading ? <LogoLoader size={22} minHeight={0} /> : <><Send className="w-4 h-4" /> Trimite Campania</>}
        </button>
      </div>
    </div>
  );
}

function Metric({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-[#141419]/50 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
      <div className="w-10 h-10 bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <div>
        <div className="text-xs text-gray-400">{title}</div>
        <div className="text-xl font-bold text-white">{value}</div>
      </div>
    </div>
  );
}
