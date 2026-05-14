import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminUserDetail, adminService } from "../../services/adminService";
import { Search, Mail, Ban, Download, ShieldCheck } from "lucide-react";
import LogoLoader from "../../components/ui/LogoLoader";

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUserDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    adminService.getUsers().then(data => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <LogoLoader minHeight={320} />;

  const filteredUsers = users.filter((user) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q);
  });

  const toggleStatus = async (user: AdminUserDetail) => {
    const nextStatus = user.status === "suspended" ? "active" : "suspended";
    const updated = await adminService.updateUserStatus(user.user_id, nextStatus);
    setUsers((prev) => prev.map((item) => item.user_id === updated.user_id ? updated : item));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Users Management</h1>
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
             <input
               type="text"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               placeholder="Search by name or email..."
               className="w-full bg-black/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
             />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/40 text-xs uppercase tracking-wider text-gray-500 font-bold border-b border-white/5">
                <th className="p-4 pl-6">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Access</th>
                <th className="p-4">Joined</th>
                <th className="p-4 text-right pr-6">Actiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map(u => (
                <tr key={u.user_id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 font-bold flex items-center justify-center">
                        {u.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">
                          <Link to={`/admin/users/${u.user_id}`} className="hover:underline">{u.name}</Link>
                        </div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded bg-white/5 text-xs text-gray-300 font-mono">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-mono ${
                      u.status === "active"
                        ? "bg-green-500/10 text-green-400"
                        : u.status === "suspended"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-yellow-500/10 text-yellow-400"
                    }`}>
                      {u.status ?? "active"}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-400">
                    {u.active_courses_count ?? 0} cursuri · {u.active_sessions_count ?? 0} sesiuni
                  </td>
                  <td className="p-4 text-sm text-gray-400">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 pr-6 text-right space-x-2">
                    <button className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg transition-colors" title="Send Email">
                      <Mail className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleStatus(u)}
                      className="p-2 text-gray-400 hover:text-red-500 bg-white/5 rounded-lg transition-colors"
                      title={u.status === "suspended" ? "Activate" : "Suspend"}
                    >
                      {u.status === "suspended" ? <ShieldCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
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
