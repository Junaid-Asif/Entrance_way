"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { ScanLine, CheckCircle, XCircle } from "lucide-react";

export default function HardwareSensorPage() {
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [status, setStatus] = useState<"scanning" | "success" | "error">("scanning");
    const [message, setMessage] = useState("Ready to scan...");

    useEffect(() => {
        // Only init if we haven't already
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 300, height: 300 } },
            false
        );

        const onScanSuccess = async (decodedText: string) => {
            // Pause scanner while validating
            scanner.pause(true);
            setScanResult(decodedText);
            setStatus("scanning");
            setMessage("Validating access...");

            try {
                // The QR code contains a JSON payload
                let parsedQR: any;
                try {
                    parsedQR = JSON.parse(decodedText);
                } catch (e) {
                    // Fallback just in case it's a plain token
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
                } else {
                    setStatus("error");
                    setMessage(data.error || "Access Denied");
                }
            } catch (err) {
                setStatus("error");
                setMessage("Connection error. Try again.");
            }

            // Resume scanning after 4 seconds
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
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg bg-slate-800 rounded-3xl shadow-2xl p-8 border border-slate-700 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-blue-500"></div>

                <div className="text-center mb-8">
                    <ScanLine size={48} className="mx-auto text-blue-400 mb-4" />
                    <h2 className="text-3xl font-bold text-white tracking-widest uppercase">Sensor Terminal</h2>
                    <p className="text-slate-400 font-mono mt-2">v2.0.4 - Main Gate</p>
                </div>

                <div className="bg-black rounded-2xl overflow-hidden mb-6 relative min-h-[300px] flex items-center justify-center border-4 border-slate-700">
                    <div id="reader" className="w-full h-full text-white"></div>

                    {status !== "scanning" && (
                        <div className={`absolute inset-0 flex flex-col items-center justify-center z-10 backdrop-blur-md ${status === 'success' ? 'bg-emerald-900/80' : 'bg-red-900/80'}`}>
                            {status === "success" ? (
                                <CheckCircle size={80} className="text-emerald-400 animate-bounce mb-4" />
                            ) : (
                                <XCircle size={80} className="text-red-400 animate-pulse mb-4" />
                            )}
                            <h3 className="text-2xl font-bold text-white tracking-wide">{message}</h3>
                        </div>
                    )}
                </div>

                <div className={`rounded-lg p-4 font-mono text-center tracking-wider border transition-colors ${status === 'scanning' ? 'bg-blue-900/30 text-blue-400 border-blue-900/50' :
                    status === 'success' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-900/50' :
                        'bg-red-900/30 text-red-400 border-red-900/50'
                    }`}>
                    {message}
                </div>
            </div>
        </div>
    );
}
