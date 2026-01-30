"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionTemplate,
} from "framer-motion";
import {
  ArrowRight,
  Github,
  Zap,
  FileText,
  Brain,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const springScroll = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 20,
  });

  // Parallax & Background Logic
  const yBackground = useTransform(springScroll, [0, 1], ["0%", "20%"]);
  const rotateCircle = useTransform(springScroll, [0, 1], [0, 180]);
  const opacityHero = useTransform(springScroll, [0, 0.15], [1, 0]);
  const scaleHero = useTransform(springScroll, [0, 0.15], [1, 0.9]);

  // MOUSE PARALLAX EFFECT
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    mouseX.set((clientX - left) / width - 0.5);
    mouseY.set((clientY - top) / height - 0.5);
  }

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), {
    stiffness: 150,
    damping: 20,
  });

  return (
    <div
      ref={containerRef}
      className="relative min-h-[400vh] bg-[#050505] text-white selection:bg-emerald-500/30 overflow-hidden font-sans perspective-1000"
      onMouseMove={handleMouseMove}
    >
      {/* 1. THE DEEP GRAPHITE FIELD */}
      <motion.div
        style={{ y: yBackground }}
        className="fixed inset-0 z-0 pointer-events-none"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:60px_60px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050505_100%)]"></div>

        {/* Breathing Emerald Core */}
        <motion.div
          animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] rounded-full bg-emerald-500/10 blur-[150px]"
        />
      </motion.div>

      {/* 2. AMBIENT DATA STREAMS */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <DataStream top="20%" duration={15} delay={0} />
        <DataStream top="60%" duration={20} delay={5} />
        <DataStream top="85%" duration={12} delay={2} />
      </div>

      {/* 3. HERO SECTION */}
      <div className="h-screen flex flex-col items-center justify-center relative z-10 sticky top-0 perspective-1000">
        <motion.div
          style={{ rotateX, rotateY, opacity: opacityHero, scale: scaleHero }}
          className="relative text-center space-y-10 max-w-5xl mx-auto px-4"
        >
          {/* Pulsing Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="flex justify-center mb-8 relative"
          >
            <div className="absolute inset-0 bg-emerald-500/10 blur-2xl rounded-full animate-pulse-slow" />
            <div className="relative z-10 font-brand font-bold text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-emerald-700 text-lg tracking-widest uppercase">
              SignalForge System v1.0
            </div>
          </motion.div>

          {/* The Assembling Headline */}
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-[1.1]">
            <WordReveal text="The Market is Noisy." delay={0.5} />
            <br />
            <span className="text-emerald-500/90 drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <WordReveal text="We are the Signal." delay={1.5} />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5, duration: 1 }}
            className="text-xl md:text-2xl text-zinc-400/80 max-w-2xl mx-auto font-light leading-relaxed"
          >
            Autonomous intelligence suspended in depth. <br />
            Waiting for your command.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.5, duration: 1 }}
            className="absolute -bottom-40 left-1/2 -translate-x-1/2"
          >
            <div className="flex flex-col items-center gap-3">
              <span className="text-[10px] tracking-[0.2em] text-zinc-600 uppercase">
                Initialize
              </span>
              <div className="w-[1px] h-16 bg-gradient-to-b from-emerald-500/0 via-emerald-500/50 to-emerald-500/0" />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* 4. SCROLLING HOLOGRAPHIC TERMINALS */}
      <div className="relative z-20 space-y-64 pb-60 pt-[20vh] max-w-7xl mx-auto px-6">
        {/* FEATURE 1 */}
        <FeatureSection
          direction="left"
          icon={<Zap className="w-5 h-5 text-emerald-400" />}
          title="Live Synthesis"
          description="Data doesn't just appear; it materializes. Our engines ingest live market feeds, earnings transcripts, and sentiment instantly."
        >
          {/* Graph Hologram */}
          <div className="h-64 w-full bg-black/40 backdrop-blur-md rounded-xl border border-white/5 relative overflow-hidden flex items-end px-4 pb-4 gap-2 group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-900/10 pointer-events-none" />
            {[30, 50, 45, 60, 80, 55, 70, 90, 65, 85, 95, 75].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0, opacity: 0 }}
                whileInView={{ height: `${h}%`, opacity: 1 }}
                transition={{ duration: 0.8, delay: i * 0.05, ease: "backOut" }}
                className="flex-1 bg-emerald-500/40 border-t border-emerald-400/60 rounded-sm hover:bg-emerald-400/80 transition-colors"
              />
            ))}
          </div>
        </FeatureSection>

        {/* FEATURE 2 */}
        <FeatureSection
          direction="right"
          icon={<Brain className="w-5 h-5 text-purple-400" />}
          title="Sentiment Engine"
          description="We detect fear, greed, and uncertainty in global news cycles. The system observes the invisible emotional currents of the market."
        >
          {/* Scanner Hologram */}
          <div className="h-64 w-full bg-black/40 backdrop-blur-md rounded-xl border border-white/5 relative overflow-hidden flex flex-col justify-center items-center p-8">
            <div className="w-full max-w-sm space-y-3 opacity-30">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-2 bg-zinc-600 rounded w-full" />
              ))}
            </div>
            <motion.div
              initial={{ top: "0%", opacity: 0 }}
              whileInView={{ top: "100%", opacity: 1 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-[1px] bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.6)] z-10"
            />
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-2 bg-purple-900/20 border border-purple-500/30 text-purple-200 text-xs font-mono tracking-widest backdrop-blur-xl"
            >
              DETECTING PATTERNS...
            </motion.div>
          </div>
        </FeatureSection>

        {/* FEATURE 3 */}
        <FeatureSection
          direction="left"
          icon={<FileText className="w-5 h-5 text-blue-400" />}
          title="Instant Briefings"
          description="Charts draw themselves. Numbers tick upward. A comprehensive PDF report constructed in seconds, ready for your command."
        >
          {/* Document Hologram */}
          <div className="h-64 w-full bg-black/40 backdrop-blur-md rounded-xl border border-white/5 relative flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-48 h-56 bg-zinc-900/80 border border-zinc-700/50 rounded-lg p-4 space-y-3 shadow-2xl relative"
            >
              <div className="absolute -right-2 -top-2 w-full h-full border border-emerald-500/20 rounded-lg" />
              <div className="h-20 w-full bg-white/5 rounded mb-4 flex items-center justify-center">
                <TrendingUp className="text-emerald-500/50 w-8 h-8" />
              </div>
              <div className="h-1 w-full bg-zinc-700/50 rounded" />
              <div className="h-1 w-2/3 bg-zinc-700/50 rounded" />
            </motion.div>
          </div>
        </FeatureSection>

        {/* 5. FINAL CTA: THE TERMINAL */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="flex flex-col items-center justify-center pt-32 pb-20 text-center relative"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-12">
            System Ready. <span className="text-emerald-400">Initialize?</span>
          </h2>

          <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md relative z-10">
            <Link href="/auth/signin" className="w-full group">
              <Button className="w-full h-14 text-lg bg-zinc-900/80 border border-zinc-800 text-white hover:bg-emerald-500 hover:text-black hover:border-emerald-400 transition-all duration-500 backdrop-blur-md group-hover:shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                Execute Protocol{" "}
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <a
              href="https://github.com/CaSh007s/signal-forge"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button
                variant="outline"
                className="w-full h-14 text-lg border-zinc-800 bg-transparent text-zinc-400 hover:text-white hover:border-zinc-600 transition-all duration-300"
              >
                <Github className="mr-2 w-4 h-4" /> Source Code
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// SUB-COMPONENTS
// ------------------------------------------------------------------

function WordReveal({ text, delay }: { text: string; delay: number }) {
  const words = text.split(" ");
  return (
    <span className="inline-block">
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.8,
            delay: delay + i * 0.15,
            ease: [0.2, 0.65, 0.3, 0.9],
          }}
          className="inline-block mr-[0.25em] last:mr-0"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

function DataStream({
  top,
  duration,
  delay,
}: {
  top: string;
  duration: number;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ left: "-10%", opacity: 0 }}
      animate={{ left: "110%", opacity: [0, 1, 0] }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "linear",
        delay: delay,
      }}
      style={{ top }}
      className="absolute h-[1px] w-[200px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent blur-[1px]"
    />
  );
}

interface FeatureSectionProps {
  direction: "left" | "right";
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}

function FeatureSection({
  direction,
  icon,
  title,
  description,
  children,
}: FeatureSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ margin: "-20%", once: true }}
      transition={{ duration: 1, ease: "easeOut" }}
      className={`flex flex-col md:flex-row items-center gap-16 ${direction === "right" ? "md:flex-row-reverse" : ""}`}
    >
      <div className="flex-1 space-y-6 text-left">
        <div className="inline-flex p-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
          {icon}
        </div>
        <h3 className="text-3xl md:text-4xl font-bold">{title}</h3>
        <p className="text-lg text-zinc-400 font-light leading-relaxed">
          {description}
        </p>
      </div>

      <div className="flex-1 w-full perspective-1000">
        <motion.div
          whileHover={{ rotateY: direction === "left" ? 2 : -2, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative"
        >
          {/* Glass Panel */}
          <div className="absolute inset-0 bg-emerald-500/5 blur-xl -z-10 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-700" />
          {children}
        </motion.div>
      </div>
    </motion.div>
  );
}
