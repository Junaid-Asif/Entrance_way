"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserCheck, Shield, ChevronRight, Camera, Upload, Trash2, Download, FileText, ArrowLeft } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        cardType: "company",
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

    const inputClass = "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500";
    const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5";

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg"
            >
                <div className="bg-white dark:bg-slate-900 shadow-2xl shadow-indigo-900/5 dark:shadow-black/20 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 p-8 text-white relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10"
                            style={{
                                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                                backgroundSize: "24px 24px"
                            }}
                        />
                        <div className="relative z-10">
                            <div className="absolute top-0 right-0 bg-white/15 p-2.5 rounded-xl backdrop-blur-sm border border-white/10">
                                <Shield size={22} />
                            </div>
                            <h2 className="text-3xl font-extrabold mb-2">Digital Security Card</h2>
                            <p className="text-indigo-100/80 text-sm">Complete the form to generate your access QR.</p>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {!isSubmitted ? (
                            <motion.form
                                key="form"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleSubmit}
                                className="p-8 space-y-6"
                            >
                                <div className="space-y-5">
                                    {/* Registration Category */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-800 dark:text-white mb-3">Registration Category</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, cardType: 'company' })}
                                                className={`py-3.5 px-4 rounded-xl border-2 font-semibold transition-all flex items-center justify-center gap-2 text-sm ${formData.cardType === 'company'
                                                    ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 text-indigo-700 dark:text-indigo-400 shadow-sm'
                                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}
                                            >
                                                <Shield size={16} /> Company Staff
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, cardType: 'prohibited' })}
                                                className={`py-3.5 px-4 rounded-xl border-2 font-semibold transition-all flex items-center justify-center gap-2 text-sm ${formData.cardType === 'prohibited'
                                                    ? 'bg-red-50 dark:bg-red-500/10 border-red-500 text-red-700 dark:text-red-400 shadow-sm'
                                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}
                                            >
                                                <Shield size={16} /> Prohibited Area
                                            </button>
                                        </div>
                                    </div>

                                    <hr className="border-slate-100 dark:border-slate-800" />

                                    {/* Basic Info */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Full Name</label>
                                            <input required name="fullName" value={formData.fullName} onChange={handleInputChange} className={inputClass} placeholder="Enter full name" />
                                        </div>
                                        <div>
                                            <label className={labelClass}>CNIC</label>
                                            <input required name="cnic" value={formData.cnic} onChange={handleInputChange} className={`${inputClass} font-mono`} placeholder="12345-6789012-3" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Email</label>
                                            <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className={inputClass} placeholder="name@company.com" />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Blood Group</label>
                                            <input name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className={inputClass} placeholder="O+, A-, etc." />
                                        </div>
                                    </div>

                                    {/* Dynamic Fields */}
                                    {formData.cardType === 'company' ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-2xl border border-indigo-100 dark:border-indigo-500/10">
                                            <div>
                                                <label className="block text-sm font-medium text-indigo-900 dark:text-indigo-300 mb-1.5">Company / Org Name</label>
                                                <input required name="companyName" value={formData.companyName} onChange={handleInputChange} className={`${inputClass} !bg-white dark:!bg-slate-800 !border-indigo-200 dark:!border-indigo-500/20`} placeholder="Enter Organization" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-indigo-900 dark:text-indigo-300 mb-1.5">Department</label>
                                                <input name="department" value={formData.department} onChange={handleInputChange} className={`${inputClass} !bg-white dark:!bg-slate-800 !border-indigo-200 dark:!border-indigo-500/20`} placeholder="IT, Operations, etc." />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-medium text-indigo-900 dark:text-indigo-300 mb-1.5">Designation</label>
                                                <input name="rank" value={formData.rank} onChange={handleInputChange} className={`${inputClass} !bg-white dark:!bg-slate-800 !border-indigo-200 dark:!border-indigo-500/20`} placeholder="Manager, Engineer, etc." />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-red-50/50 dark:bg-red-500/5 rounded-2xl border border-red-100 dark:border-red-500/10">
                                            <div>
                                                <label className="block text-sm font-medium text-red-900 dark:text-red-300 mb-1.5">Clearance Level</label>
                                                <select required name="accessLevel" value={formData.accessLevel} onChange={handleInputChange} className={`${inputClass} !bg-white dark:!bg-slate-800 !border-red-200 dark:!border-red-500/20`}>
                                                    <option value="">Select Level</option>
                                                    <option value="Level 1 - Restricted">Level 1 - Restricted</option>
                                                    <option value="Level 2 - Supervised">Level 2 - Supervised</option>
                                                    <option value="Level 3 - Escorted">Level 3 - Escorted</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-red-900 dark:text-red-300 mb-1.5">MR No / Protocol</label>
                                                <input required name="mrNo" value={formData.mrNo} onChange={handleInputChange} className={`${inputClass} font-mono !bg-white dark:!bg-slate-800 !border-red-200 dark:!border-red-500/20`} placeholder="MR 12345" />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-medium text-red-900 dark:text-red-300 mb-1.5">HouseNumber/FlatNumber - Zone</label>
                                                <input required name="department" value={formData.department} onChange={handleInputChange} className={`${inputClass} !bg-white dark:!bg-slate-800 !border-red-200 dark:!border-red-500/20`} placeholder="Specific high-security zone" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Dependent Reference */}
                                    <div>
                                        <label className={`${labelClass} mt-2`}>Dependent Reference (Optional)</label>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <input name="relationName" value={formData.relationName} onChange={handleInputChange} className={`flex-1 ${inputClass}`} placeholder="Reference Name" />
                                            <input name="relation" value={formData.relation} onChange={handleInputChange} className={`w-full sm:w-1/3 ${inputClass}`} placeholder="Relation" />
                                        </div>
                                    </div>

                                    <hr className="border-slate-100 dark:border-slate-800" />

                                    {/* Photo Upload */}
                                    <div>
                                        <label className={`${labelClass} mb-3`}>Upload or Capture Photo (Required)</label>
                                        {!cameraActive ? (
                                            <div className="flex flex-col gap-3">
                                                {photo && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="p-3.5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-xl text-sm text-indigo-700 dark:text-indigo-400 flex justify-between items-center"
                                                    >
                                                        <span className="flex items-center gap-2"><Camera size={16} /> {photo.name}</span>
                                                        <button type="button" onClick={() => setPhoto(null)} className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </motion.div>
                                                )}
                                                {!photo && (
                                                    <>
                                                        <label className="w-full cursor-pointer">
                                                            <div className="w-full px-4 py-6 bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors group">
                                                                <Upload size={24} className="mx-auto mb-2 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                                                <p className="text-sm text-slate-500 dark:text-slate-400">Click to upload a photo</p>
                                                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">JPG, PNG up to 5MB</p>
                                                            </div>
                                                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                                        </label>
                                                        <div className="flex items-center gap-3">
                                                            <hr className="flex-1 border-slate-200 dark:border-slate-700" />
                                                            <span className="text-xs text-slate-400 font-medium">OR</span>
                                                            <hr className="flex-1 border-slate-200 dark:border-slate-700" />
                                                        </div>
                                                        <button type="button" onClick={startCamera} className="w-full bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white font-medium py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm">
                                                            <Camera size={18} /> Use Laptop Camera
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        ) : (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="bg-black rounded-2xl overflow-hidden relative border-2 border-slate-700 flex flex-col items-center"
                                            >
                                                <video ref={videoRef} className="w-full max-h-64 object-cover" autoPlay playsInline muted />
                                                <canvas ref={canvasRef} className="hidden" />
                                                <div className="p-3 w-full flex justify-between bg-slate-900 gap-3">
                                                    <button type="button" onClick={stopCamera} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">Cancel</button>
                                                    <button type="button" onClick={capturePhoto} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">Capture</button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Info Box */}
                                    <div className="bg-indigo-50 dark:bg-indigo-500/5 text-indigo-700 dark:text-indigo-400 p-4 rounded-xl flex gap-3 text-sm border border-indigo-100 dark:border-indigo-500/10">
                                        <UserCheck className="shrink-0 mt-0.5" size={18} />
                                        <p>By registering, you agree to the access policies. Your data will be secured via Supabase and verified via strict QR tokenization.</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !photo}
                                        className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 shadow-lg shadow-indigo-500/20 transition-all rounded-xl mt-2 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Generating Security Pass...
                                            </>
                                        ) : (
                                            <>
                                                <Shield size={18} />
                                                Generate Security Pass
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.form>
                        ) : (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-8 flex flex-col items-center"
                            >
                                <div id="identity-card" style={{ backgroundColor: "#f8fafc", color: "#1e293b", borderColor: "#f1f5f9" }} className="w-full max-w-lg border-2 rounded-2xl p-6 text-center relative overflow-hidden flex flex-col sm:flex-row gap-6 text-left shadow-sm">
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
                                            <p style={{ color: formData.cardType === 'prohibited' ? "#dc2626" : "#4f46e5" }} className="text-xs font-bold uppercase tracking-wider block">
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

                                <div className="flex flex-col sm:flex-row gap-3 mt-8 w-full max-w-lg">
                                    <button
                                        onClick={downloadAsPNG}
                                        className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white py-3.5 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                                    >
                                        <Download size={18} />
                                        Save as PNG
                                    </button>
                                    <button
                                        onClick={downloadAsPDF}
                                        className="flex-1 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white py-3.5 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <FileText size={18} />
                                        Save as PDF
                                    </button>
                                </div>

                                <button
                                    onClick={() => router.push("/")}
                                    className="mt-6 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-medium transition-colors flex items-center gap-2"
                                >
                                    <ArrowLeft size={16} /> Return to Home
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
