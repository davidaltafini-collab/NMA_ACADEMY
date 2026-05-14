import React, { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import { Lead } from "../../types";
import { Search, Mail, Download } from "lucide-react";
import LogoLoader from "../../components/ui/LogoLoader";

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getLeads().then(data => {
      setLeads(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <LogoLoader minHeight={320} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Leads & Abonati</h1>
        <div className="flex gap-2">
          <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-[#141419]/50 border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex gap-4">
          <div className="relative flex-1 max-w-sm">
             <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
             <input type="text" placeholder="Search leads..." className="w-full bg-black/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-red-500/50" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/40 text-xs uppercase tracking-wider text-gray-500 font-bold border-b border-white/5">
                <th className="p-4 pl-6">Nume</th>
                <th className="p-4">Email</th>
                <th className="p-4">Sursa</th>
                <th className="p-4">Data</th>
                <th className="p-4 text-right pr-6">Actiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leads.map(l => (
                <tr key={l.lead_id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 pl-6 text-sm text-white font-medium">{l.name || "-"}</td>
                  <td className="p-4 text-sm text-gray-300">{l.email}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded bg-red-500/10 text-xs text-red-400 font-mono">
                      {l.source || "unknown"}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-400">
                    {new Date(l.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 pr-6 text-right space-x-2">
                    <button className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg transition-colors" title="Trimite Email">
                      <Mail className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
