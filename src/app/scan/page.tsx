"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { ScanLine, CheckCircle, XCircle, Wifi, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function HardwareSensorPage() {
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [status, setStatus] = useState<"scanning" | "success" | "error">("scanning");
    const [message, setMessage] = useState("Ready to scan...");
    const [scanCount, setScanCount] = useState(0);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 300, height: 300 } },
            false
        );

        const onScanSuccess = async (decodedText: string) => {
            scanner.pause(true);
            setScanResult(decodedText);
            setStatus("scanning");
            setMessage("Validating access...");

            try {
                let parsedQR: any;
                try {
                    parsedQR = JSON.parse(decodedText);
                } catch (e) {
                    parsedQR = { id: decodedText };
                }

                const res = await fetch("/api/scan", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ qrCodeId: parsedQR.id || decodedText })
                });
                const data = await res.json();

                if (res.ok && data.success) {
                    setStatus("success");
                    setMessage(`Access Granted: ${data.user.fullName || data.user.email}`);
                    setScanCount(prev => prev + 1);
                } else {
                    setStatus("error");
                    setMessage(data.error || "Access Denied");
                }
            } catch (err) {
                setStatus("error");
                setMessage("Connection error. Try again.");
            }

            setTimeout(() => {
                setScanResult(null);
                setStatus("scanning");
                setMessage("Ready to scan...");
                scanner.resume();
            }, 4000);
        };

        scanner.render(onScanSuccess, undefined);

        return () => {
            scanner.clear().catch(console.error);
        };
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600 rounded-full blur-[200px] opacity-10" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[200px] opacity-10" />
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                        backgroundSize: "40px 40px"
                    }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg relative z-10"
            >
                <div className="bg-slate-900 rounded-3xl shadow-2xl shadow-black/50 p-8 border border-slate-800 relative overflow-hidden">
                    {/* Top accent bar */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-violet-500" />

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="relative inline-block mb-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-xl shadow-indigo-500/30 mx-auto">
                                <ScanLine size={32} className="text-white" />
                            </div>
                            {/* Status indicator */}
                            <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
                                status === "scanning" ? "bg-blue-500 animate-pulse" :
                                status === "success" ? "bg-emerald-500" : "bg-red-500"
                            }`} />
                        </div>
                        <h2 className="text-3xl font-extrabold text-white tracking-wide uppercase">Sensor Terminal</h2>
                        <div className="flex items-center justify-center gap-3 mt-3">
                            <span className="text-slate-500 font-mono text-sm">v2.0.4</span>
                            <span className="text-slate-700">•</span>
                            <span className="flex items-center gap-1.5 text-slate-500 text-sm">
                                <Wifi size={12} className="text-emerald-500" /> Main Gate
                            </span>
                        </div>
                    </div>

                    {/* Scanner Area */}
                    <div className="bg-black rounded-2xl overflow-hidden mb-6 relative min-h-[300px] flex items-center justify-center border-2 border-slate-800">
                        {/* Scan line animation */}
                        {status === "scanning" && (
                            <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent z-20 animate-scan-line" />
                        )}

                        <div id="reader" className="w-full h-full text-white" />

                        <AnimatePresence>
                            {status !== "scanning" && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className={`absolute inset-0 flex flex-col items-center justify-center z-10 backdrop-blur-lg ${
                                        status === 'success' ? 'bg-emerald-900/80' : 'bg-red-900/80'
                                    }`}
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", bounce: 0.4 }}
                                    >
                                        {status === "success" ? (
                                            <CheckCircle size={80} className="text-emerald-400 mb-4" />
                                        ) : (
                                            <XCircle size={80} className="text-red-400 mb-4" />
                                        )}
                                    </motion.div>
                                    <h3 className="text-xl font-bold text-white tracking-wide text-center px-4">{message}</h3>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Status Bar */}
                    <div className={`rounded-xl p-4 font-mono text-center tracking-wider border transition-all duration-300 ${
                        status === 'scanning'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : status === 'success'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                        <div className="flex items-center justify-center gap-2">
                            {status === "scanning" && <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />}
                            {message}
                        </div>
                    </div>

                    {/* Footer Stats */}
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800">
                        <div className="flex items-center gap-2 text-slate-600 text-xs">
                            <Shield size={12} />
                            <span>Encrypted QR Validation</span>
                        </div>
                        <div className="text-slate-600 text-xs font-mono">
                            Scans: {scanCount}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
