"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus, Clock, History, AlertTriangle, CheckCircle, Clock3,
  ScanLine, ShieldAlert, Users, CreditCard, Activity, TrendingUp,
  ChevronRight, Search, Filter, ArrowLeft, Bell
} from "lucide-react";
import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";

// Skeleton loading component
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}

function TableSkeleton({ rows = 4, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Stat card
function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  color,
  delay = 0
}: {
  icon: any;
  label: string;
  value: string | number;
  trend?: string;
  color: string;
  delay?: number;
}) {
  const colorMap: Record<string, string> = {
    blue: "from-blue-500 to-indigo-600 shadow-blue-500/20",
    emerald: "from-emerald-500 to-teal-600 shadow-emerald-500/20",
    amber: "from-amber-500 to-orange-600 shadow-amber-500/20",
    violet: "from-violet-500 to-purple-600 shadow-violet-500/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/50 shadow-sm card-hover"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
          <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">{value}</p>
          {trend && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp size={12} /> {trend}
            </p>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center shadow-lg`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </motion.div>
  );
}

// Mini bar chart
function MiniChart() {
  const bars = [40, 65, 45, 80, 55, 70, 90, 60, 75, 50, 85, 65];
  return (
    <div className="flex items-end gap-1.5 h-16">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${h}%` }}
          transition={{ delay: i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 bg-gradient-to-t from-indigo-500 to-blue-400 dark:from-indigo-600 dark:to-blue-500 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
          title={`${h}% activity`}
        />
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("live");
  const [visitors, setVisitors] = useState<any[]>([]);
  const [scans, setScans] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [previewQR, setPreviewQR] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [visitorForm, setVisitorForm] = useState({
    name: "", cnic: "", houseNo: "", hours: 1
  });

  const fetchData = async () => {
    try {
      const [vRes, sRes, cRes] = await Promise.all([
        fetch("/api/admin/visitors"),
        fetch("/api/admin/scans"),
        fetch("/api/admin/cards"),
      ]);
      const [vData, sData, cData] = await Promise.all([
        vRes.json(),
        sRes.json(),
        cRes.json(),
      ]);
      if (vRes.ok) setVisitors(vData.visitors || []);
      if (sRes.ok) setScans(sData.scans || []);
      if (cRes.ok) setCards(cData.cards || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleVisitorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(visitorForm)
      });
      if (res.ok) {
        alert("Visitor logged gracefully.");
        setVisitorForm({ name: "", cnic: "", houseNo: "", hours: 1 });
        fetchData();
      }
    } catch (e) {
      console.error(e);
      alert("Error logging visitor.");
    }
  };

  const handleMarkExited = async (id: string) => {
    if (!confirm("Confirm visitor has exited the premises?")) return;
    try {
      const res = await fetch("/api/admin/visitors", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "exited" })
      });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
      alert("Error updating visitor status.");
    }
  };

  const activeVisitors = visitors.filter(v => v.status !== "exited");
  const expiredVisitors = visitors.filter(v => v.status !== "exited" && new Date() > new Date(v.expectedExitTimestamp || v.expected_exit_timestamp));
  const inputClass = "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500";

  const sidebarItems = [
    { key: "live", label: "Live Inside", icon: Clock },
    { key: "register", label: "Register Visitor", icon: UserPlus },
    { key: "history", label: "Access History", icon: History },
    { key: "sensor", label: "Sensor Records", icon: ScanLine },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 dark:bg-slate-950 text-slate-100 flex-col hidden md:flex border-r border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <ShieldAlert size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Admin Panel</h2>
              <p className="text-xs text-slate-500">Security Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-sm font-medium ${
                activeTab === key
                  ? "bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <Icon size={18} />
              {label}
              {key === "live" && activeVisitors.length > 0 && (
                <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${activeTab === key ? "bg-white/20" : "bg-indigo-500/20 text-indigo-400"}`}>
                  {activeVisitors.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Activity Chart */}
        <div className="p-4 border-t border-slate-800 mx-4 mb-4">
          <p className="text-xs text-slate-500 font-medium mb-3 uppercase tracking-wider">Activity (12h)</p>
          <MiniChart />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-8 pb-28 md:pb-8 w-full overflow-hidden">
        {/* Header with stats */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white capitalize">{activeTab.replace("-", " ")}</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage individuals and monitor security logs</p>
            </div>
            {(activeTab === "live" || activeTab === "history" || activeTab === "sensor") && (
              <div className="relative w-full sm:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 dark:text-white placeholder:text-slate-400"
                />
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Active Visitors" value={activeVisitors.length} color="blue" delay={0} />
            <StatCard icon={AlertTriangle} label="Overstaying" value={expiredVisitors.length} color="amber" delay={0.1} />
            <StatCard icon={CreditCard} label="Cards Issued" value={cards.length} color="violet" delay={0.2} />
            <StatCard icon={Activity} label="Sensor Scans" value={scans.length} color="emerald" delay={0.3} />
          </div>
        </motion.header>

        <AnimatePresence mode="wait">
          {/* Live Inside Tab */}
          {activeTab === "live" && (
            <motion.div
              key="live"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/50 overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Visitors Inside</h3>
                <div className="px-3 py-1 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-bold">
                  {activeVisitors.length} Active
                </div>
              </div>
              {loading ? <TableSkeleton rows={5} cols={6} /> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Visitor</th>
                        <th className="px-6 py-4 font-semibold">CNIC</th>
                        <th className="px-6 py-4 font-semibold">Entry Time</th>
                        <th className="px-6 py-4 font-semibold">Expected Exit</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {visitors.filter(v => v.status !== "exited").filter(v => {
                        if (!searchQuery) return true;
                        const name = (v.visitorName || v.visitor_name || "").toLowerCase();
                        return name.includes(searchQuery.toLowerCase());
                      }).map(v => {
                        const isExpired = new Date() > new Date(v.expectedExitTimestamp || v.expected_exit_timestamp);
                        return (
                          <tr key={v.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-800 dark:text-white">
                              {v.visitorName || v.visitor_name}
                              {v.houseNo && <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">House: {v.houseNo}</div>}
                            </td>
                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm font-mono">{v.visitorCnic || v.visitor_cnic}</td>
                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">{format(new Date(v.entryTimestamp || v.entry_timestamp), "p")}</td>
                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">{format(new Date(v.expectedExitTimestamp || v.expected_exit_timestamp), "p")}</td>
                            <td className="px-6 py-4">
                              {isExpired ? (
                                <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg w-max animate-pulse">
                                  <AlertTriangle size={13} /> EXPIRED
                                </span>
                              ) : (
                                <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20 rounded-lg w-max">
                                  <Clock3 size={13} /> Inside
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleMarkExited(v.id)}
                                className="px-4 py-2 bg-slate-800 dark:bg-slate-600 hover:bg-slate-900 dark:hover:bg-slate-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-slate-400"
                              >
                                Mark Exited
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {visitors.filter(v => v.status !== "exited").length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-16 text-center">
                            <Users size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                            <p className="text-slate-500 dark:text-slate-400 font-medium">No active visitors</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Visitors will appear here when checked in</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* Register Visitor Tab */}
          {activeTab === "register" && (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl bg-white dark:bg-slate-800/50 p-8 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/50"
            >
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <UserPlus size={22} className="text-indigo-500" />
                Log New Visitor
              </h3>
              <form onSubmit={handleVisitorSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                    <input required value={visitorForm.name} onChange={e => setVisitorForm({ ...visitorForm, name: e.target.value })} className={inputClass} placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">House No. (Visiting)</label>
                    <input required value={visitorForm.houseNo} onChange={e => setVisitorForm({ ...visitorForm, houseNo: e.target.value })} className={inputClass} placeholder="A-123" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">CNIC Held (e.g., ID Proof)</label>
                    <input required value={visitorForm.cnic} onChange={e => setVisitorForm({ ...visitorForm, cnic: e.target.value })} className={`${inputClass} font-mono`} placeholder="12345-6789101-1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Expected Stay (Hours)</label>
                    <input required type="number" min="1" max="12" value={visitorForm.hours} onChange={e => setVisitorForm({ ...visitorForm, hours: Number(e.target.value) })} className={inputClass} />
                  </div>
                </div>
                <button type="submit" className="mt-4 w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
                  <CheckCircle size={18} /> Register Entry
                </button>
              </form>
            </motion.div>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start"
            >
              {/* Generated Identity Cards */}
              <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/50 overflow-hidden">
                <div className="p-5 border-b border-slate-100 dark:border-slate-700/50 flex items-center gap-2">
                  <CreditCard size={18} className="text-indigo-500" />
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Generated Cards</h3>
                </div>
                {loading ? <TableSkeleton rows={4} cols={3} /> : (
                  <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-4 font-semibold">QR Key</th>
                          <th className="px-6 py-4 font-semibold">Name</th>
                          <th className="px-6 py-4 font-semibold">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {cards.filter(c => {
                          if (!searchQuery) return true;
                          const name = (c.user?.full_name || "").toLowerCase();
                          return name.includes(searchQuery.toLowerCase());
                        }).map(c => (
                          <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                            <td className="px-6 py-4">
                              <div onClick={() => setPreviewQR(c)} className="p-1.5 bg-white dark:bg-slate-700 inline-block rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all group">
                                <QRCodeSVG
                                  value={JSON.stringify({
                                    id: c.qr_token || "dummy-qr-token",
                                    name: c.user?.full_name,
                                    cnic: c.cnic,
                                    mrNo: c.mr_no || "",
                                    department: c.department || "",
                                    bloodGroup: c.blood_group || ""
                                  })}
                                  size={48}
                                  level="H"
                                />
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-800 dark:text-white">
                              {c.user?.full_name}<br />
                              <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">{c.cnic} • {c.department || 'N/A'}</span>
                            </td>
                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">{format(new Date(c.created_at), "PP p")}</td>
                          </tr>
                        ))}
                        {cards.length === 0 && (
                          <tr>
                            <td colSpan={3} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">No cards generated yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Visitor Records */}
              <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/50 overflow-hidden">
                <div className="p-5 border-b border-slate-100 dark:border-slate-700/50 flex items-center gap-2">
                  <Users size={18} className="text-emerald-500" />
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Visitor Records</h3>
                </div>
                {loading ? <TableSkeleton rows={4} cols={3} /> : (
                  <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-4 font-semibold">Visitor</th>
                          <th className="px-6 py-4 font-semibold">Stay Log</th>
                          <th className="px-6 py-4 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {visitors.filter(v => {
                          if (!searchQuery) return true;
                          const name = (v.visitorName || v.visitor_name || "").toLowerCase();
                          return name.includes(searchQuery.toLowerCase());
                        }).map(v => (
                          <tr key={v.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-800 dark:text-white">
                              {v.visitorName || v.visitor_name}<br />
                              {v.houseNo && <span className="text-xs text-indigo-500 dark:text-indigo-400 font-semibold block mb-0.5 mt-0.5">House: {v.houseNo}</span>}
                              <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">{v.visitorCnic || v.visitor_cnic}</span>
                            </td>
                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">
                              In: {format(new Date(v.entryTimestamp || v.entry_timestamp), "Pp")}<br />
                              Exp: {format(new Date(v.expectedExitTimestamp || v.expected_exit_timestamp), "p")}
                              {v.actualExitTimestamp && <><br /><span className="text-emerald-600 dark:text-emerald-400 font-medium block mt-1">Out: {format(new Date(v.actualExitTimestamp || v.actual_exit_timestamp), "p")}</span></>}
                            </td>
                            <td className="px-6 py-4">
                              {v.status !== "exited" ? (
                                <button onClick={() => handleMarkExited(v.id)} className="px-3 py-1.5 border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-700 dark:text-red-400 text-xs font-bold rounded-xl transition-all shadow-sm">Checkout</button>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 text-xs font-bold rounded-xl">Checked Out</span>
                              )}
                            </td>
                          </tr>
                        ))}
                        {visitors.length === 0 && (
                          <tr>
                            <td colSpan={3} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">No visitors logged yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Sensor Tab */}
          {activeTab === "sensor" && (
            <motion.div
              key="sensor"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/50 overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-700/50 flex items-center gap-2">
                <ScanLine size={18} className="text-blue-500" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Hardware Sensor Logs</h3>
              </div>
              {loading ? <TableSkeleton rows={5} cols={4} /> : (
                <div className="overflow-x-auto max-h-[700px] overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold">User</th>
                        <th className="px-6 py-4 font-semibold">Gate Terminal</th>
                        <th className="px-6 py-4 font-semibold">Scan Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {scans.filter(s => {
                        if (!searchQuery) return true;
                        const name = (s.identity_cards?.users?.full_name || "").toLowerCase();
                        return name.includes(searchQuery.toLowerCase());
                      }).map(s => (
                        <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                          <td className="px-6 py-4">
                            {s.access_granted ? (
                              <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 rounded-xl w-max shadow-sm border border-emerald-200/50 dark:border-emerald-500/20">
                                <CheckCircle size={13} /> GRANTED
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-500/10 rounded-xl w-max shadow-sm border border-red-200/50 dark:border-red-500/20">
                                <ShieldAlert size={13} /> DENIED
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-800 dark:text-white">
                            {s.identity_cards?.users?.full_name || "Unknown"}<br />
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">{s.identity_cards?.cnic_number || "No CNIC"}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-sm font-medium">{s.location_name}</td>
                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">{format(new Date(s.scanned_at), "PPp")}</td>
                        </tr>
                      ))}
                      {scans.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-16 text-center">
                            <ScanLine size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                            <p className="text-slate-500 dark:text-slate-400 font-medium">No sensor scans recorded</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Scans will appear here when QR codes are validated</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* QR Preview Modal */}
      <AnimatePresence>
        {previewQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setPreviewQR(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center border border-slate-200 dark:border-slate-700"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 uppercase tracking-wide">QR Access Key</h3>
              <div className="p-4 bg-white border-2 border-slate-100 dark:border-slate-600 shadow-sm rounded-2xl">
                <QRCodeSVG
                  value={JSON.stringify({
                    id: previewQR.qr_token || "dummy-qr-token",
                    name: previewQR.user?.full_name,
                    cnic: previewQR.cnic,
                    mrNo: previewQR.mr_no || "",
                    department: previewQR.department || "",
                    bloodGroup: previewQR.blood_group || ""
                  })}
                  size={250}
                  level="H"
                />
              </div>
              <p className="mt-6 text-2xl font-bold text-slate-800 dark:text-white">{previewQR.user?.full_name}</p>
              <p className="text-md text-slate-500 dark:text-slate-400 font-mono mt-1">{previewQR.cnic}</p>
              {previewQR.department && <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1">{previewQR.department}</p>}
              <button
                onClick={() => setPreviewQR(null)}
                className="mt-8 w-full py-3 bg-slate-800 dark:bg-slate-600 hover:bg-slate-900 dark:hover:bg-slate-500 text-white rounded-xl font-medium transition-colors shadow-md"
              >
                Close Preview
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-40 pb-safe">
        <div className="flex justify-around items-center p-2 pt-3 pb-4">
          {sidebarItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex flex-col items-center flex-1 rounded-lg transition-all ${
                activeTab === key
                  ? "text-indigo-600 dark:text-indigo-400 font-bold"
                  : "text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              <Icon size={22} className={activeTab === key ? "stroke-[2.5px]" : "stroke-2"} />
              <span className="text-[10px] sm:text-xs mt-1">{label.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
