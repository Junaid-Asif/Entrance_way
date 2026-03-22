"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, UserCheck, AlertCircle, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function Home() {
  const [expiredVisitors, setExpiredVisitors] = useState<any[]>([]);

  useEffect(() => {
    const checkExpired = async () => {
      try {
        const res = await fetch("/api/admin/visitors");
        const data = await res.json();
        if (res.ok && data.visitors) {
          const expired = data.visitors.filter((v: any) =>
            v.status !== "exited" && new Date() > new Date(v.expectedExitTimestamp || v.expected_exit_timestamp)
          );
          setExpiredVisitors(expired);
        }
      } catch (e) {
        console.error("Polling error", e);
      }
    };
    checkExpired();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans relative">
      {/* Global Expiry Notifications */}
      <div className="fixed top-6 right-6 z-50 space-y-4">
        {expiredVisitors.map((v) => (
          <div key={v.id} className="bg-red-50 border-l-4 border-red-500 text-red-900 p-5 rounded-r-xl shadow-xl shadow-red-500/10 flex items-start gap-4 w-96 animate-in slide-in-from-right-8 fade-in duration-500">
            <AlertCircle className="shrink-0 mt-0.5 text-red-500" size={24} />
            <div className="flex-1">
              <h4 className="font-bold flex justify-between items-center text-red-800">
                Time Expired!
                <button onClick={() => setExpiredVisitors(prev => prev.filter(x => x.id !== v.id))} className="text-red-400 hover:text-red-700 transition-colors bg-red-100/50 rounded-full p-1 border border-red-200">
                  <X size={14} />
                </button>
              </h4>
              <p className="text-red-700/90 text-sm mt-2 leading-relaxed">
                Visitor <b className="text-red-800">{v.visitorName || v.visitor_name}</b> at House <b className="font-mono text-red-900 bg-red-200/50 px-1 rounded">{v.houseNo}</b> has exceeded their allowed time limits inside the premises.
              </p>
            </div>
          </div>
        ))}
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 text-center relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400 rounded-full blur-[120px] opacity-20"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px] opacity-20"></div>
        </div>

        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/50 text-blue-700 font-medium text-sm border border-blue-200 shadow-sm backdrop-blur-sm">
            <ShieldCheck size={18} />
            <span>Unified Security Platform</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-slate-900 py-2">
            Intelligent <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">Access Control</span>
          </h1>

          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Secure, fast, and seamless entry management. Utilizing advanced QR technology and real-time tracking for employees and visitors.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link
              href="/register"
              className="group relative flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/30 w-full sm:w-auto overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              <span className="relative flex items-center gap-2">
                Identity Card <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            <Link
              href="/admin"
              className="flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 shadow-sm hover:shadow-md w-full sm:w-auto"
            >
              <UserCheck size={20} />
              Admin Portal
            </Link>

            <Link
              href="/scan"
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 shadow-sm hover:shadow-md w-full sm:w-auto"
            >
              Hardware Sensor
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-slate-500 text-sm border-t border-slate-200/60 bg-white/80 backdrop-blur-md">
        © {new Date().getFullYear()} Security Interchange Platform. Built for precision.
      </footer>
    </div>
  );
}
