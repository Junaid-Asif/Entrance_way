"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserCheck, Shield, ChevronRight } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        cardType: "company", // 'company' or 'prohibited'
        companyName: "",
        accessLevel: "",
        fullName: "",
        email: "",
        cnic: "",
        department: "",
        mrNo: "",
        relation: "",
        relationName: "",
        rank: "",
        bloodGroup: "",
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [photo, setPhoto] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [generatedCard, setGeneratedCard] = useState<any>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);

    // Ensure camera stops if user unmounts component
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(t => t.stop());
            }
        };
    }, [stream]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
            setCameraActive(true);
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            }, 100);
        } catch (err) {
            console.error(err);
            alert("Could not access laptop camera.");
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
                context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

                canvasRef.current.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], "laptop_camera.jpg", { type: "image/jpeg" });
                        setPhoto(file);
                        stopCamera();
                    }
                }, 'image/jpeg');
            }
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setCameraActive(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPhoto(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!photo) {
            alert("Please provide a photo before generating the card.");
            return;
        }

        setIsSubmitting(true);
        try {
            const submitData = new FormData();
            Object.entries(formData).forEach(([key, value]) => submitData.append(key, value));
            if (photo) submitData.append("photo", photo);

            // Simulate API call to Prisma
            const res = await fetch("/api/register", {
                method: "POST",
                body: submitData,
            });
            const data = await res.json();
            if (res.ok) {
                setGeneratedCard(data.card);
                setIsSubmitted(true);
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to submit");
        } finally {
            setIsSubmitting(false);
        }
    };

    const downloadAsPNG = async () => {
        const element = document.getElementById("identity-card");
        if (!element) return;
        const { toPng } = await import("html-to-image");
        const dataUrl = await toPng(element, { quality: 1, pixelRatio: 2, skipFonts: true });
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `${formData.fullName.replace(/\s+/g, "_")}_ID_Card.png`;
        link.click();
    };

    const downloadAsPDF = async () => {
        const element = document.getElementById("identity-card");
        if (!element) return;
        const { toPng } = await import("html-to-image");
        const jsPDF = (await import("jspdf")).default;
        const dataUrl = await toPng(element, { quality: 1, pixelRatio: 2, skipFonts: true });
        const pdf = new jsPDF({
            orientation: "landscape",
            unit: "px",
            format: [element.offsetWidth, element.offsetHeight]
        });
        pdf.addImage(dataUrl, "PNG", 0, 0, element.offsetWidth, element.offsetHeight);
        pdf.save(`${formData.fullName.replace(/\s+/g, "_")}_ID_Card.pdf`);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 py-12">
            <div className="w-full max-w-lg bg-white shadow-xl shadow-blue-900/5 rounded-2xl overflow-hidden border border-slate-100">
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-white relative">
                    <div className="absolute top-4 right-4 bg-white/20 p-2 rounded-full backdrop-blur-sm">
                        <Shield size={24} />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Digital Security Card</h2>
                    <p className="text-blue-100/80">Complete the form to generate your access QR.</p>
                </div>

                {isSubmitted === false ? (
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">

                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-2">Registration Category</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, cardType: 'company' })}
                                        className={`py-3 px-4 rounded-xl border-2 font-semibold transition-all flex items-center justify-center gap-2 ${formData.cardType === 'company' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                                    >
                                        <Shield size={18} /> Company Staff
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, cardType: 'prohibited' })}
                                        className={`py-3 px-4 rounded-xl border-2 font-semibold transition-all flex items-center justify-center gap-2 ${formData.cardType === 'prohibited' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                                    >
                                        <Shield size={18} /> Prohibited Area
                                    </button>
                                </div>
                            </div>

                            <hr className="border-slate-100 my-6" />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                    <input required name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all font-medium" placeholder="Enter full name" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">CNIC</label>
                                    <input required name="cnic" value={formData.cnic} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all font-mono" placeholder="12345-6789012-3" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all" placeholder="name@company.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Blood Group</label>
                                    <input name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all" placeholder="O+, A-, etc." />
                                </div>
                            </div>

                            {/* DYNAMIC FIELDS BASED ON CATEGORY */}
                            {formData.cardType === 'company' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                                    <div className="col-span-1 sm:col-span-1">
                                        <label className="block text-sm font-medium text-blue-900 mb-1">Company / Org Name</label>
                                        <input required name="companyName" value={formData.companyName} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Enter Organization" />
                                    </div>
                                    <div className="col-span-1 sm:col-span-1">
                                        <label className="block text-sm font-medium text-blue-900 mb-1">Department</label>
                                        <input name="department" value={formData.department} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all" placeholder="IT, Operations, etc." />
                                    </div>
                                    <div className="col-span-1 sm:col-span-2">
                                        <label className="block text-sm font-medium text-blue-900 mb-1">Designation</label>
                                        <input name="rank" value={formData.rank} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Manager, Engineer, etc." />
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-red-50/50 rounded-xl border border-red-100">
                                    <div className="col-span-1 sm:col-span-1">
                                        <label className="block text-sm font-medium text-red-900 mb-1">Clearance Level</label>
                                        <select required name="accessLevel" value={formData.accessLevel} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 transition-all">
                                            <option value="">Select Level</option>
                                            <option value="Level 1 - Restricted">Level 1 - Restricted</option>
                                            <option value="Level 2 - Supervised">Level 2 - Supervised</option>
                                            <option value="Level 3 - Escorted">Level 3 - Escorted</option>
                                        </select>
                                    </div>
                                    <div className="col-span-1 sm:col-span-1">
                                        <label className="block text-sm font-medium text-red-900 mb-1">MR No / Protocol</label>
                                        <input required name="mrNo" value={formData.mrNo} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 transition-all font-mono" placeholder="MR 12345" />
                                    </div>
                                    <div className="col-span-1 sm:col-span-2">
                                        <label className="block text-sm font-medium text-red-900 mb-1">HouseNumber/FlatNumber - Zone</label>
                                        <input required name="department" value={formData.department} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 transition-all" placeholder="Specific high-security zone" />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 mt-2">Dependent Reference (Optional)</label>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <input name="relationName" value={formData.relationName} onChange={handleInputChange} className="flex-1 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Reference Name" />
                                    <input name="relation" value={formData.relation} onChange={handleInputChange} className="w-full sm:w-1/3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Relation (e.g. Father)" />
                                </div>
                            </div>

                            <hr className="border-slate-100 my-4" />

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Upload or Capture Photo (Required)</label>

                                {!cameraActive ? (
                                    <div className="flex flex-col gap-3">
                                        {photo && (
                                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex justify-between items-center">
                                                <span>📷 {photo.name}</span>
                                                <button type="button" onClick={() => setPhoto(null)} className="text-red-500 font-bold hover:underline">Remove</button>
                                            </div>
                                        )}

                                        {!photo && (
                                            <>
                                                <input type="file" accept="image/*" onChange={handleFileChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all" />
                                                <div className="text-center text-slate-400 text-sm font-medium my-1">OR</div>
                                                <button type="button" onClick={startCamera} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all">
                                                    <UserCheck size={18} /> Use Laptop Camera
                                                </button>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-black rounded-lg overflow-hidden relative border-2 border-slate-800 flex flex-col items-center">
                                        <video ref={videoRef} className="w-full max-h-64 object-cover" autoPlay playsInline muted />
                                        <canvas ref={canvasRef} className="hidden" />
                                        <div className="p-3 w-full flex justify-between bg-slate-900 gap-3">
                                            <button type="button" onClick={stopCamera} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">Cancel</button>
                                            <button type="button" onClick={capturePhoto} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">Capture</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="bg-blue-50 text-blue-700 p-4 rounded-lg flex gap-3 text-sm border border-blue-100">
                                <UserCheck className="shrink-0 mt-0.5" size={18} />
                                <p>By registering, you agree to the access policies. Your data will be secured via Supabase and verified via strict QR tokenization.</p>
                            </div>
                        </div>

                        <div className="flex justify-center pt-6 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={isSubmitting || !photo}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-6 shadow-sm shadow-blue-500/20 transition-all rounded-xl mt-4"
                            >
                                {isSubmitting ? "Generating Security Pass..." : "Generate Security Pass"}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="p-8 flex flex-col items-center animate-in zoom-in-95 duration-500">
                        <div id="identity-card" style={{ backgroundColor: "#f8fafc", color: "#1e293b", borderColor: "#f1f5f9" }} className="w-full max-w-lg border-2 rounded-xl p-6 text-center relative overflow-hidden flex flex-col sm:flex-row gap-6 text-left shadow-sm">
                            <div className="flex-shrink-0 flex flex-col items-center border-[color:var(--slate-200,#e2e8f0)] sm:border-r border-r-0 sm:pr-6">
                                {generatedCard?.photoUrl ? (
                                    <img src={generatedCard.photoUrl} alt="Profile" className="w-28 h-28 rounded-xl object-cover shadow-sm mb-4 border border-[color:var(--slate-200,#e2e8f0)]" />
                                ) : (
                                    <div style={{ backgroundColor: "#e2e8f0", color: "#94a3b8" }} className="w-28 h-28 rounded-xl flex items-center justify-center mb-4 font-medium text-xs">No Photo</div>
                                )}
                                <div style={{ backgroundColor: "#ffffff" }} className="p-2 rounded-lg shadow-sm border border-[color:var(--slate-200,#e2e8f0)] mb-3">
                                    <QRCodeSVG
                                        value={JSON.stringify({
                                            id: generatedCard?.qrCodeId || "dummy-qr-token",
                                            type: formData.cardType,
                                            company: formData.cardType === 'company' ? formData.companyName : null,
                                            level: formData.cardType === 'prohibited' ? formData.accessLevel : null,
                                            name: formData.fullName,
                                            cnic: formData.cnic,
                                            mrNo: formData.mrNo || "",
                                            department: formData.department,
                                            bloodGroup: formData.bloodGroup
                                        })}
                                        size={90}
                                        level="H"
                                    />
                                </div>
                                <p style={{ color: "#059669" }} className="text-xs font-bold flex items-center gap-1 uppercase tracking-wide">
                                    <span style={{ backgroundColor: "#10b981" }} className="w-2 h-2 rounded-full inline-block"></span> Active
                                </p>
                            </div>

                            <div className="flex-1 space-y-3 pt-2">
                                <div className="border-b border-[color:var(--slate-200,#e2e8f0)] pb-3">
                                    <h3 style={{ color: "#1e293b" }} className="text-xl font-bold leading-tight mb-1">{formData.fullName}</h3>
                                    <p style={{ color: formData.cardType === 'prohibited' ? "#dc2626" : "#2563eb" }} className="text-xs font-bold uppercase tracking-wider block">
                                        {formData.cardType === 'prohibited' ? 'PROHIBITED AREA' : 'COMPANY ACCESS'}
                                    </p>
                                    <p style={{ color: "#64748b" }} className="text-[10px] font-bold uppercase break-words tracking-wider mt-0.5">
                                        {formData.cardType === 'prohibited' ? formData.accessLevel : formData.companyName || formData.department || 'N/A'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-y-3 gap-x-3 text-sm pt-1">
                                    {(formData.mrNo || formData.rank) && (
                                        <div className="col-span-1">
                                            <span style={{ color: "#94a3b8" }} className="font-bold text-[10px] uppercase tracking-wider block">{formData.cardType === 'prohibited' ? 'MR No' : 'Designation'}</span>
                                            <span style={{ color: "#1e293b" }} className="font-semibold">{formData.cardType === 'prohibited' ? formData.mrNo : formData.rank || '-'}</span>
                                        </div>
                                    )}
                                    <div>
                                        <span style={{ color: "#94a3b8" }} className="font-bold text-[10px] uppercase tracking-wider block">Blood Group</span>
                                        <span style={{ color: "#e11d48" }} className="font-semibold">{formData.bloodGroup || '-'}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span style={{ color: "#94a3b8" }} className="font-bold text-[10px] uppercase tracking-wider block">CNIC</span>
                                        <span style={{ color: "#334155" }} className="font-semibold font-mono text-xs">{formData.cnic}</span>
                                    </div>
                                    {formData.relation && (
                                        <div style={{ backgroundColor: "#f1f5f9" }} className="col-span-2 p-2 rounded relative mt-1">
                                            <span style={{ color: "#94a3b8" }} className="font-bold text-[10px] uppercase tracking-wider block">Relation / Dependent</span>
                                            <span style={{ color: "#334155" }} className="font-semibold">{formData.relationName || '-'} <span style={{ color: "#64748b" }} className="font-medium">({formData.relation})</span></span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-lg md:px-0">
                            <button
                                onClick={downloadAsPNG}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                Save as PNG
                            </button>
                            <button
                                onClick={downloadAsPDF}
                                className="flex-1 bg-slate-800 hover:bg-slate-900 text-white py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-sm"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>
                                Save as PDF
                            </button>
                        </div>

                        <button
                            onClick={() => router.push("/")}
                            className="mt-6 text-slate-500 hover:text-slate-800 font-medium transition-colors"
                        >
                            Return to Home
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
