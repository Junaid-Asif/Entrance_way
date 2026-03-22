"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, UserCheck, ScanLine, Clock, Users, CreditCard, Zap, Lock, BarChart3 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

// Animated counter
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, target]);

  return (
    <div ref={ref} className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">
      {count.toLocaleString()}{suffix}
    </div>
  );
}

// Floating particles background
function ParticlesBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      {/* Gradient blobs */}
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-indigo-400 dark:bg-indigo-600 rounded-full blur-[140px] opacity-15 dark:opacity-10 animate-blob" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-blue-400 dark:bg-blue-600 rounded-full blur-[140px] opacity-15 dark:opacity-10 animate-blob" style={{ animationDelay: "2s" }} />
      <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-violet-400 dark:bg-violet-700 rounded-full blur-[120px] opacity-10 dark:opacity-5 animate-blob" style={{ animationDelay: "4s" }} />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "40px 40px"
        }}
      />
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  })
};

export default function Home() {
  const features = [
    {
      icon: CreditCard,
      title: "Digital ID Cards",
      description: "Generate QR-based security passes with photo verification and instant validation.",
      gradient: "from-indigo-500 to-blue-500",
      shadowColor: "shadow-indigo-500/20"
    },
    {
      icon: Clock,
      title: "Real-time Tracking",
      description: "Monitor visitor entries, exits, and overstays with live dashboard updates.",
      gradient: "from-blue-500 to-cyan-500",
      shadowColor: "shadow-blue-500/20"
    },
    {
      icon: Lock,
      title: "QR Token Security",
      description: "UUID-based tokens with multi-level access clearance and encrypted validation.",
      gradient: "from-violet-500 to-purple-500",
      shadowColor: "shadow-violet-500/20"
    },
    {
      icon: Zap,
      title: "Instant Alerts",
      description: "Automatic notifications when visitors exceed their approved time limits.",
      gradient: "from-amber-500 to-orange-500",
      shadowColor: "shadow-amber-500/20"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Comprehensive insights on access patterns, peak hours, and security events.",
      gradient: "from-emerald-500 to-teal-500",
      shadowColor: "shadow-emerald-500/20"
    },
    {
      icon: Users,
      title: "Visitor Management",
      description: "Streamlined check-in/out with CNIC verification and house assignment.",
      gradient: "from-pink-500 to-rose-500",
      shadowColor: "shadow-pink-500/20"
    }
  ];

  const stats = [
    { value: 1250, suffix: "+", label: "Passes Generated" },
    { value: 99, suffix: "%", label: "Uptime" },
    { value: 340, suffix: "+", label: "Active Residents" },
    { value: 24, suffix: "/7", label: "Monitoring" },
  ];

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-6 sm:px-12 pt-16 sm:pt-24 pb-20 text-center overflow-hidden">
        <ParticlesBackground />

        <motion.div
          className="max-w-5xl space-y-8"
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div
            variants={fadeUp}
            custom={0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold text-sm border border-indigo-200 dark:border-indigo-500/20 shadow-sm animate-pulse-glow"
          >
            <ShieldCheck size={16} />
            <span>Enterprise Security Platform</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            custom={0.1}
            className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05]"
          >
            <span className="text-slate-900 dark:text-white">Intelligent </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-500 to-violet-500 dark:from-indigo-400 dark:via-blue-400 dark:to-violet-400 animate-gradient-shift">
              Access Control
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            custom={0.2}
            className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Secure, fast, and seamless entry management. Advanced QR technology
            and real-time tracking for employees and visitors.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeUp}
            custom={0.3}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
          >
            <Link
              href="/register"
              className="group relative flex items-center justify-center gap-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 w-full sm:w-auto overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative flex items-center gap-2.5">
                <CreditCard size={20} />
                Identity Card
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            <Link
              href="/admin"
              className="flex items-center justify-center gap-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-sm hover:shadow-lg w-full sm:w-auto"
            >
              <UserCheck size={20} />
              Admin Portal
            </Link>

            <Link
              href="/scan"
              className="flex items-center justify-center gap-2.5 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-sm hover:shadow-lg w-full sm:w-auto"
            >
              <ScanLine size={20} />
              Sensor Terminal
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-20 px-6 bg-white/50 dark:bg-white/[0.02] border-y border-slate-200/60 dark:border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                custom={i * 0.1}
                className="text-center"
              >
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-4"
            >
              Everything You Need
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={0.1}
              className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto"
            >
              A comprehensive suite of tools for modern security management
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                custom={i * 0.1}
                className="card-hover group p-7 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/50 shadow-sm"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg ${feature.shadowColor} group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-6 pb-20 sm:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-5xl mx-auto relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 p-10 sm:p-16 text-center text-white shadow-2xl shadow-indigo-500/20"
        >
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "30px 30px"
            }}
          />
          <div className="relative z-10">
            <h3 className="text-3xl sm:text-4xl font-extrabold mb-4">
              Ready to Secure Your Premises?
            </h3>
            <p className="text-indigo-100 text-lg max-w-xl mx-auto mb-8">
              Get started by registering your first identity card or exploring the admin dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="group bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                Get Started
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/admin"
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 px-8 py-4 rounded-2xl font-semibold text-lg transition-all flex items-center justify-center gap-2"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 dark:text-slate-500 text-sm border-t border-slate-200/60 dark:border-white/5 bg-white/50 dark:bg-white/[0.01]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Security Interchange Platform. Built for precision.</p>
          <div className="flex items-center gap-6 text-xs text-slate-400">
            <span>v2.0.4</span>
            <span>•</span>
            <span>Next.js 16</span>
            <span>•</span>
            <span>Supabase</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
