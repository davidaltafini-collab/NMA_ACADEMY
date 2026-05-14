import React from "react";
import { AdminStats, adminService } from "../../services/adminService";
import { Users, BookOpen, Target, DollarSign, Mail, ShieldCheck } from "lucide-react";
import LogoLoader from "../../components/ui/LogoLoader";

export default function AdminOverview() {
  const [stats, setStats] = React.useState<AdminStats | null>(null);

  React.useEffect(() => {
    adminService.getAdminStats().then(setStats);
  }, []);

  if (!stats) return <LogoLoader minHeight={320} />;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Platform Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.totalUsers} icon={<Users />} />
        <StatCard title="Total Leads" value={stats.totalLeads} icon={<Target />} />
        <StatCard title="Published Courses" value={stats.publishedCourses} icon={<BookOpen />} />
        <StatCard title="Revenue Confirmat" value={`${stats.revenue} RON`} icon={<DollarSign />} />
        <StatCard title="Acces Activ" value={stats.activeAccesses} icon={<ShieldCheck />} />
        <StatCard title="Acces Pending" value={stats.pendingAccesses} icon={<DollarSign />} />
        <StatCard title="Emails Sent" value={stats.emailsSent} icon={<Mail />} />
        <StatCard title="Admins" value={stats.totalAdmins} icon={<Users />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#141419]/50 border border-white/5 p-6 rounded-2xl">
          <h2 className="text-lg font-bold text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {stats.recentActivity.length === 0 && (
              <div className="text-sm text-gray-500">Nu există activitate recentă.</div>
            )}
            {stats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex justify-between gap-4 text-sm">
                <span className="text-gray-300">{activity.action}</span>
                <span className="text-gray-500 font-mono whitespace-nowrap">{activity.time ?? "-"}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#141419]/50 border border-white/5 p-6 rounded-2xl">
          <h2 className="text-lg font-bold text-white mb-4">Course Status</h2>
          <div className="space-y-2 text-sm text-gray-300">
            <StatusRow label="Total Courses" value={stats.totalCourses} />
            <StatusRow label="Published" value={stats.publishedCourses} className="text-green-400" />
            <StatusRow label="Drafts" value={stats.draftCourses} className="text-yellow-400" />
            <StatusRow label="Archived" value={stats.archivedCourses} className="text-gray-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="bg-[#141419]/50 border border-white/5 p-6 rounded-2xl flex items-center gap-4">
      <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <div>
        <div className="text-gray-400 text-sm font-medium">{title}</div>
        <div className="text-2xl font-bold text-white mt-1">{value}</div>
      </div>
    </div>
  );
}

function StatusRow({ label, value, className = "" }: { label: string; value: number; className?: string }) {
  return (
    <div className={`flex justify-between ${className}`}>
      <span>{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
