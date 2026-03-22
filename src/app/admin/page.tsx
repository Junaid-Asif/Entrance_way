"use client";

import { useState, useEffect } from "react";
import { UserPlus, Clock, History, AlertTriangle, CheckCircle, Clock3, ScanLine, ShieldAlert } from "lucide-react";
import { format, differenceInMinutes, parseISO } from "date-fns";
import { QRCodeSVG } from "qrcode.react";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("live");
    const [visitors, setVisitors] = useState<any[]>([]);
    const [scans, setScans] = useState<any[]>([]);
    const [cards, setCards] = useState<any[]>([]);
    const [previewQR, setPreviewQR] = useState<any>(null);
    const [visitorForm, setVisitorForm] = useState({
        name: "", cnic: "", houseNo: "", hours: 1
    });

    const fetchData = async () => {
        try {
            const vRes = await fetch("/api/admin/visitors");
            const vData = await vRes.json();
            if (vRes.ok) setVisitors(vData.visitors || []);

            const sRes = await fetch("/api/admin/scans");
            const sData = await sRes.json();
            if (sRes.ok) setScans(sData.scans || []);

            const cRes = await fetch("/api/admin/cards");
            const cData = await cRes.json();
            if (cRes.ok) setCards(cData.cards || []);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Poll every 10s for simulation
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
            if (res.ok) {
                fetchData();
            }
        } catch (e) {
            console.error(e);
            alert("Error updating visitor status.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar sidebar */}
            <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col hidden sm:flex">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-white tracking-wide">Security Admin</h2>
                </div>
                <nav className="flex-1 mt-6 space-y-2 px-4">
                    <button onClick={() => setActiveTab("live")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "live" ? "bg-blue-600 font-semibold" : "hover:bg-slate-800 text-slate-400"}`}>
                        <Clock size={20} /> Live Inside
                    </button>
                    <button onClick={() => setActiveTab("register")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "register" ? "bg-blue-600 font-semibold" : "hover:bg-slate-800 text-slate-400"}`}>
                        <UserPlus size={20} /> Register Visitor
                    </button>
                    <button onClick={() => setActiveTab("history")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "history" ? "bg-blue-600 font-semibold" : "hover:bg-slate-800 text-slate-400"}`}>
                        <History size={20} /> Access History
                    </button>
                    <button onClick={() => setActiveTab("sensor")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "sensor" ? "bg-blue-600 font-semibold" : "hover:bg-slate-800 text-slate-400"}`}>
                        <ScanLine size={20} /> Sensor Records
                    </button>
                </nav>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-4 sm:p-10 pb-28 sm:pb-10 w-full overflow-hidden">
                <header className="mb-10 flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 capitalize">{activeTab.replace("-", " ")}</h1>
                        <p className="text-slate-500">Manage individuals and monitor security logs</p>
                    </div>
                </header>

                {activeTab === "live" && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-slate-700">Visitors Inside</h3>
                            <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                                {visitors.filter(v => v.status === "inside" || v.status === "overstaying").length} Active
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Visitor</th>
                                        <th className="px-6 py-4">CNIC</th>
                                        <th className="px-6 py-4">Entry Time</th>
                                        <th className="px-6 py-4">Expected Exit</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {visitors.filter(v => v.status !== "exited").map(v => {
                                        const isExpired = new Date() > new Date(v.expectedExitTimestamp || v.expected_exit_timestamp);
                                        return (
                                            <tr key={v.id} className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4 font-medium text-slate-800">
                                                    {v.visitorName || v.visitor_name}
                                                    {v.houseNo && <div className="text-xs text-slate-400 mt-1">House: {v.houseNo}</div>}
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 text-sm">{v.visitorCnic || v.visitor_cnic}</td>
                                                <td className="px-6 py-4 text-slate-500 text-sm">{format(new Date(v.entryTimestamp || v.entry_timestamp), "p")}</td>
                                                <td className="px-6 py-4 text-slate-500 text-sm">{format(new Date(v.expectedExitTimestamp || v.expected_exit_timestamp), "p")}</td>
                                                <td className="px-6 py-4">
                                                    {isExpired ? (
                                                        <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 text-red-700 bg-red-100 border border-red-200 rounded-lg w-max animate-pulse">
                                                            <AlertTriangle size={14} /> EXPIRED
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 text-emerald-700 bg-emerald-100 rounded-lg w-max">
                                                            <Clock3 size={14} /> Inside
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button onClick={() => handleMarkExited(v.id)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-slate-400">Mark Exited</button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    {visitors.filter(v => v.status !== "exited").length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-slate-500">No active visitors.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === "register" && (
                    <div className="max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-xl font-bold text-slate-800 mb-6">Log New Visitor</h3>
                        <form onSubmit={handleVisitorSubmit} className="space-y-5">
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                    <input required value={visitorForm.name} onChange={e => setVisitorForm({ ...visitorForm, name: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-slate-800" placeholder="John Doe" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">House No. (Visiting)</label>
                                    <input required value={visitorForm.houseNo} onChange={e => setVisitorForm({ ...visitorForm, houseNo: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-slate-800" placeholder="A-123" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">CNIC Held (e.g., ID Proof)</label>
                                    <input required value={visitorForm.cnic} onChange={e => setVisitorForm({ ...visitorForm, cnic: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-slate-800" placeholder="12345-6789101-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Expected Stay (Hours)</label>
                                    <input required type="number" min="1" max="12" value={visitorForm.hours} onChange={e => setVisitorForm({ ...visitorForm, hours: Number(e.target.value) })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-slate-800" />
                                </div>
                            </div>
                            <button type="submit" className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20">
                                <CheckCircle size={18} /> Register Entry
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === "history" && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                        {/* Generated Identity Cards List */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 bg-slate-50">
                                <h3 className="text-lg font-semibold text-slate-700">Generated Cards</h3>
                            </div>
                            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-4">QR Access Key</th>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {cards.map(c => (
                                            <tr key={c.id} className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4">
                                                    <div onClick={() => setPreviewQR(c)} className="p-1 bg-white inline-block rounded-md shadow-sm border border-slate-200 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group relative">
                                                        <QRCodeSVG
                                                            value={JSON.stringify({
                                                                id: c.qr_token || "dummy-qr-token",
                                                                name: c.user?.full_name,
                                                                cnic: c.cnic,
                                                                mrNo: c.mr_no || "",
                                                                department: c.department || "",
                                                                bloodGroup: c.blood_group || ""
                                                            })}
                                                            size={54}
                                                            level="H"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-slate-800">
                                                    {c.user?.full_name} <br />
                                                    <span className="text-xs text-slate-400 font-normal">{c.cnic} • {c.department || 'N/A'}</span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 text-sm align-top">{format(new Date(c.created_at), "PP p")}</td>
                                            </tr>
                                        ))}
                                        {cards.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-12 text-center text-slate-500">No cards generated yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Visitors List */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 bg-slate-50">
                                <h3 className="text-lg font-semibold text-slate-700">Visitor Records</h3>
                            </div>
                            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-4">Visitor</th>
                                            <th className="px-6 py-4">Stay Log</th>
                                            <th className="px-6 py-4">Status / Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {visitors.map(v => (
                                            <tr key={v.id} className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4 font-medium text-slate-800">
                                                    {v.visitorName || v.visitor_name} <br />
                                                    {v.houseNo && <span className="text-xs text-blue-500 font-semibold block mb-0.5 mt-0.5">House: {v.houseNo}</span>}
                                                    <span className="text-xs text-slate-400 font-normal">{v.visitorCnic || v.visitor_cnic}</span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 text-sm align-top">
                                                    In: {format(new Date(v.entryTimestamp || v.entry_timestamp), "Pp")}<br />
                                                    Exp: {format(new Date(v.expectedExitTimestamp || v.expected_exit_timestamp), "p")}
                                                    {v.actualExitTimestamp && <><br /><span className="text-emerald-700 font-medium block mt-1">Out: {format(new Date(v.actualExitTimestamp || v.actual_exit_timestamp), "p")}</span></>}
                                                </td>
                                                <td className="px-6 py-4 align-top">
                                                    {v.status !== "exited" ? (
                                                        <button onClick={() => handleMarkExited(v.id)} className="px-3 py-1.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg transition-all shadow-sm">Checkout manually</button>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-500 border border-slate-200 text-xs font-bold rounded-lg">Checked Out</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {visitors.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-12 text-center text-slate-500">No visitors logged yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "sensor" && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50">
                            <h3 className="text-lg font-semibold text-slate-700">Hardware Sensor Logs</h3>
                        </div>
                        <div className="overflow-x-auto max-h-[700px] overflow-y-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Gate Terminal</th>
                                        <th className="px-6 py-4">Scan Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {scans.map(s => (
                                        <tr key={s.id} className="hover:bg-slate-50/50">
                                            <td className="px-6 py-4">
                                                {s.access_granted ? (
                                                    <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 text-emerald-700 bg-emerald-100 rounded-lg w-max shadow-sm border border-emerald-200/50">
                                                        <CheckCircle size={14} /> GRANTED
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 text-red-700 bg-red-100 rounded-lg w-max shadow-sm border border-red-200/50">
                                                        <ShieldAlert size={14} /> DENIED
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-800">
                                                {s.identity_cards?.users?.full_name || "Unknown Identity"} <br />
                                                <span className="text-xs text-slate-400 font-normal">{s.identity_cards?.cnic_number || "No CNIC Linked"}</span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 text-sm font-medium">{s.location_name}</td>
                                            <td className="px-6 py-4 text-slate-500 text-sm align-middle">{format(new Date(s.scanned_at), "PPp")}</td>
                                        </tr>
                                    ))}
                                    {scans.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-500">No sensor scans recorded yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {previewQR && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setPreviewQR(null)}>
                    <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-slate-800 mb-6 uppercase tracking-wide">QR Access Key</h3>
                        <div className="p-4 bg-white border-2 border-slate-100 shadow-sm rounded-xl">
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
                        <p className="mt-8 text-2xl font-bold text-slate-800">{previewQR.user?.full_name}</p>
                        <p className="text-md text-slate-500 font-mono mt-1">{previewQR.cnic}</p>
                        {previewQR.department && <p className="text-sm font-semibold text-blue-600 mt-1">{previewQR.department}</p>}
                        <button
                            onClick={() => setPreviewQR(null)}
                            className="mt-8 w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-medium transition-colors shadow-md"
                        >
                            Close Preview
                        </button>
                    </div>
                </div>
            )}

            {/* Mobile Bottom Navigation */}
            <nav className="sm:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-40 pb-safe">
                <div className="flex justify-around items-center p-2 pt-3 pb-4">
                    <button onClick={() => setActiveTab("live")} className={`flex flex-col items-center flex-1 rounded-lg transition-all ${activeTab === "live" ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-800"}`}>
                        <Clock size={22} className={activeTab === "live" ? "stroke-[2.5px]" : "stroke-2"} />
                        <span className="text-[10px] sm:text-xs mt-1">Inside</span>
                    </button>
                    <button onClick={() => setActiveTab("register")} className={`flex flex-col items-center flex-1 rounded-lg transition-all ${activeTab === "register" ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-800"}`}>
                        <UserPlus size={22} className={activeTab === "register" ? "stroke-[2.5px]" : "stroke-2"} />
                        <span className="text-[10px] sm:text-xs mt-1">Register</span>
                    </button>
                    <button onClick={() => setActiveTab("history")} className={`flex flex-col items-center flex-1 rounded-lg transition-all ${activeTab === "history" ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-800"}`}>
                        <History size={22} className={activeTab === "history" ? "stroke-[2.5px]" : "stroke-2"} />
                        <span className="text-[10px] sm:text-xs mt-1">History</span>
                    </button>
                    <button onClick={() => setActiveTab("sensor")} className={`flex flex-col items-center flex-1 rounded-lg transition-all ${activeTab === "sensor" ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-800"}`}>
                        <ScanLine size={22} className={activeTab === "sensor" ? "stroke-[2.5px]" : "stroke-2"} />
                        <span className="text-[10px] sm:text-xs mt-1">Sensors</span>
                    </button>
                </div>
            </nav>
        </div>
    );
}
