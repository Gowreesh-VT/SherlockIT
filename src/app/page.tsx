"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SplashPage() {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleInitialize = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      router.push("/login");
    }, 1000);
  };

  return (
    <main
      className="text-white min-h-screen overflow-hidden flex flex-col relative bg-[#1c1c1c]"
      style={{
        fontFamily: "var(--font-rajdhani), sans-serif",
      }}
    >
      {/* Background with Desk & Lamp Effect */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: "url('/detective_bw.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "grayscale(1) contrast(1.1) brightness(0.7)",
          }}
        />
        {/* Lamp Glow Overlay - Stark White for B&W */}
        <div
          className="absolute right-0 top-0 w-full h-full opacity-40 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 85% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 60%)",
          }}
        />
        {/* Dark Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 50% 50%, transparent 20%, rgba(0, 0, 0, 0.9) 100%)",
          }}
        />
      </div>

      {/* Main Content Container */}
      <div
        className={`relative z-10 w-full h-full flex flex-col items-center justify-between py-8 sm:py-12 px-4 sm:px-6 flex-grow transition-all duration-1000 ease-out ${isLoaded ? "opacity-100" : "opacity-0"
          } ${isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
      >
        {/* Top Section */}
        <div className="w-full flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4 sm:gap-0 pointer-events-none">
          {/* CLASSIFIED STAMP */}
          <div className="relative transform sm:-rotate-12 mt-2 sm:mt-4">
            <div className="border-[2px] sm:border-[3px] border-red-800/80 px-3 sm:px-4 py-1 sm:py-1.5 rounded-sm">
              <span className="text-xl sm:text-2xl md:text-3xl font-black text-red-800/80 tracking-[0.2em] uppercase italic" style={{ fontFamily: "Arial, sans-serif" }}>
                CLASSIFIED
              </span>
            </div>
            {/* Double Border Effect */}
            <div className="absolute -inset-1 border border-red-800/40 rounded-sm" />
          </div>

          {/* Technical Metadata Overlay */}
          <div className="text-[9px] sm:text-[10px] text-cyan-500/80 tracking-[0.15em] sm:tracking-widest text-center sm:text-right leading-relaxed mt-1 sm:mt-2" style={{ fontFamily: "monospace" }}>
            <div>LOC: 51.5074° N, 0.1278° W</div>
            <div className="hidden xs:block">SYS_ST: ENGAGED</div>
            <div>ENC: RSA_4096_SHA256</div>
            <div className="hidden sm:block">HEX: 0x53 0x48 0x45 0x4C</div>
          </div>
        </div>

        {/* Center Section: SHERLOCKIT 2.0 */}
        <div className="relative flex flex-col items-center w-full max-w-[90vw]">
          {/* Vertical Side Borders - Responsive positioning */}
          <div className="absolute left-[-10px] sm:left-[-20px] top-[-10px] bottom-[-10px] w-[1px] bg-cyan-500/40" />
          <div className="absolute right-[-10px] sm:right-[-20px] top-[-10px] bottom-[-10px] w-[1px] bg-cyan-500/40" />

          <header className="text-center relative w-full">
            <h1
              className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-bold tracking-[0.1em] sm:tracking-[0.15em] text-white flex flex-col items-center transition-all"
              style={{
                fontFamily: "var(--font-rajdhani), sans-serif",
                textShadow: "0 0 15px rgba(255, 255, 255, 0.3)",
              }}
            >
              SHERLOCKIT
              <span
                className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl text-cyan-400 mt-1 block"
                style={{
                  textShadow: "0 0 12px rgba(34, 211, 238, 0.8)",
                }}
              >
                2.0
              </span>
            </h1>

            <p className="mt-6 sm:mt-8 text-[9px] sm:text-[11px] font-medium tracking-[0.3em] sm:tracking-[0.4em] text-cyan-400/90 uppercase text-center w-full max-w-[240px] sm:max-w-[320px] mx-auto">
              Divide the Clues, Conquer the Worlds.
            </p>
          </header>
        </div>

        {/* Footer Section */}
        <footer className="w-full flex flex-col items-center gap-6 sm:gap-8 mb-2 sm:mb-4">
          <div className="w-full text-center sm:text-right pointer-events-none mb-1 sm:mb-2">
            <span className="text-[8px] sm:text-[9px] text-white/40 tracking-[0.2em] font-mono">SECURE_NODE_04</span>
          </div>

          {/* INITIALIZE BUTTON */}
          <button
            onClick={handleInitialize}
            className="w-full max-w-[280px] sm:max-w-[320px] group relative py-3 sm:py-4 bg-transparent transition-all duration-300 active:scale-95"
          >
            {/* Cyan Border Frame */}
            <div className="absolute inset-0 border border-cyan-400/60 shadow-[0_0_10px_rgba(34,211,238,0.3)] transition-all group-hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] group-hover:border-cyan-400" />

            {/* Button Content */}
            <div className="relative flex items-center justify-center">
              <span
                className="text-base sm:text-lg tracking-[0.4em] sm:tracking-[0.6em] font-bold text-cyan-400 group-hover:text-white transition-colors"
                style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
              >
                INITIALIZE
              </span>
            </div>
          </button>

          {/* Technical Metadata Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-center w-full text-[8px] sm:text-[9px] text-white/30 tracking-[0.1em] sm:tracking-[0.2em] font-mono mt-4 gap-2 sm:gap-0">
            <div className="flex gap-4">
              <span>KERNEL_V: 2.0.4-SH</span>
              <span>BUILD: 88A-X9</span>
            </div>
            <span>© MICROSOFT INNOVATION CLUB</span>
          </div>
        </footer>
      </div>

      {/* Global Style */}
      <style jsx global>{`
        body {
          background-color: #000;
        }
      `}</style>
    </main>
  );
}
