"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function SplashPage() {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleInitialize = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      router.push("/login");
    }, 800);
  };

  return (
    <main
      className="text-white min-h-screen overflow-hidden flex flex-col relative"
      style={{
        backgroundColor: "#020205",
        backgroundImage:
          "radial-gradient(circle at 50% 0%, #1e1b4b 0%, transparent 60%), radial-gradient(circle at 100% 100%, #2e1065 0%, transparent 50%)",
        fontFamily: "var(--font-montserrat), sans-serif",
      }}
    >
      {/* Cyber grid background */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundSize: "40px 40px",
          backgroundImage:
            "linear-gradient(to right, rgba(0, 243, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(189, 0, 255, 0.05) 1px, transparent 1px)",
          maskImage: "linear-gradient(to bottom, black 40%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 40%, transparent 100%)",
        }}
      />

      {/* Scanlines overlay */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-70"
        style={{
          background: "linear-gradient(to bottom, transparent 50%, rgba(0, 243, 255, 0.02) 50%)",
          backgroundSize: "100% 4px",
        }}
      />

      {/* Horizontal neon pulse lines */}
      <div
        className="fixed left-0 w-full h-[1px] animate-pulse"
        style={{
          top: "15%",
          background: "linear-gradient(to right, transparent, rgba(0, 243, 255, 0.3), transparent)",
        }}
      />
      <div
        className="fixed left-0 w-full h-[1px] animate-pulse"
        style={{
          bottom: "30%",
          background: "linear-gradient(to right, transparent, rgba(189, 0, 255, 0.3), transparent)",
          animationDelay: "1s",
        }}
      />

      {/* Main content */}
      <div
        className={`relative z-10 w-full h-full flex flex-col items-center justify-between py-12 px-6 flex-grow transition-opacity duration-700 ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        {/* Header */}
        <header className="w-full text-center mt-8 relative">
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              backgroundColor: "rgba(0, 243, 255, 0.2)",
              filter: "blur(100px)",
            }}
          />
          <h1
            className="font-black text-5xl md:text-6xl text-white tracking-widest leading-none relative z-10"
            style={{
              fontFamily: "var(--font-cinzel), serif",
              textShadow:
                "0 0 10px rgba(0, 243, 255, 0.7), 0 0 20px rgba(0, 243, 255, 0.5), 0 0 30px rgba(0, 243, 255, 0.3)",
              animation: "flicker 3s linear infinite",
            }}
          >
            SHERLOCK<span style={{ color: "#00f3ff" }}>IT</span>
            <span
              className="block text-2xl md:text-3xl mt-2 tracking-[0.5em] opacity-90"
              style={{
                fontFamily: "var(--font-orbitron), sans-serif",
                color: "#bd00ff",
                textShadow: "none",
              }}
            >
              2.0
            </span>
          </h1>
          <div
            className="h-[2px] w-32 mx-auto mt-6"
            style={{
              background: "linear-gradient(to right, transparent, #00f3ff, transparent)",
            }}
          />
        </header>

        {/* Hero Image */}
        <div className="relative w-full max-w-sm aspect-[4/5] flex items-center justify-center my-4">
          {/* Neon border frame */}
          <div
            className="absolute inset-0 rounded-sm opacity-80"
            style={{
              background: "linear-gradient(45deg, #00f3ff, transparent 40%, transparent 60%, #bd00ff)",
              padding: "1px",
            }}
          >
            <div
              className="absolute inset-[1px] rounded-sm overflow-hidden"
              style={{ backgroundColor: "rgba(3, 0, 5, 0.9)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Detective Silhouette"
                className="w-full h-full object-cover"
                style={{
                  opacity: 0.6,
                  filter: "grayscale(1) brightness(0.75) contrast(1.25)",
                  mixBlendMode: "luminosity",
                  maskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
                  WebkitMaskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
                }}
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4uBG6J-fNcv5ySXf3ZqFhVMQssrEHHKY2FYSxo2bL0Hdggyxu2Vw75afEINXoNNOfEfhWN0OfhvKfIeqAk0QHXIuWdYyVH-onGTrKmVfS0elwC-vnrQUTbgeS9bqr8WZ_zwstziWHTxuuBNP9D022WsNiaHt4zzaysI3DxiFnhPMMSbCGG27ZlZxfQLBcWTo01mFB1HSH1AZzH0FqmFDn1iwP-UG3CF8ZR72ri1kFNQLjsnTXOcNWd0WAXzgBtYvtou0hLRdIUQ"
              />

              {/* Color overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(189, 0, 255, 0.2), transparent, rgba(0, 243, 255, 0.1))",
                  mixBlendMode: "overlay",
                }}
              />

              {/* Inner glow */}
              <div
                className="absolute inset-0"
                style={{ boxShadow: "inset 0 0 50px rgba(0, 243, 255, 0.15)" }}
              />

              {/* MULTIVERSE text */}
              <div
                className="absolute left-0 w-full text-center"
                style={{
                  bottom: "25%",
                  transform: "rotate(-6deg)",
                  opacity: 0.8,
                  mixBlendMode: "screen",
                }}
              >
                <span
                  className="text-4xl font-bold text-transparent bg-clip-text"
                  style={{
                    fontFamily: "var(--font-orbitron), sans-serif",
                    backgroundImage: "linear-gradient(to right, #00f3ff, white, #00f3ff)",
                    filter: "blur(0.5px)",
                  }}
                >
                  MULTIVERSE
                </span>
              </div>
            </div>
          </div>

          {/* Side accent bars */}
          <div
            className="absolute w-1 h-16"
            style={{ left: "-8px", top: "40px", backgroundColor: "rgba(189, 0, 255, 0.5)" }}
          />
          <div
            className="absolute w-1 h-16"
            style={{ right: "-8px", bottom: "40px", backgroundColor: "rgba(0, 243, 255, 0.5)" }}
          />
        </div>

        {/* Footer */}
        <footer className="w-full text-center pb-8 flex flex-col items-center gap-6 relative z-20">
          <div className="flex flex-col items-center space-y-3">
            <div className="flex items-center gap-3 opacity-80">
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: "#00f3ff" }}
              />
              <p
                className="text-xl md:text-2xl text-white tracking-[0.2em] font-medium uppercase"
                style={{
                  fontFamily: "var(--font-orbitron), sans-serif",
                  filter: "drop-shadow(0 0 5px rgba(255, 255, 255, 0.5))",
                }}
              >
                Case Open
              </p>
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: "#00f3ff" }}
              />
            </div>
            <p
              className="text-xs tracking-widest uppercase"
              style={{
                color: "#94a3b8",
                fontFamily: "var(--font-montserrat), sans-serif",
              }}
            >
              System Online // Awaiting Input
            </p>
          </div>

          {/* INITIALIZE button */}
          <button
            onClick={handleInitialize}
            className="group relative px-8 py-4 bg-transparent overflow-hidden rounded transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            <div
              className="absolute inset-0 transition-colors duration-500"
              style={{
                border: "1px solid rgba(189, 0, 255, 0.5)",
                boxShadow: "0 0 15px rgba(0, 243, 255, 0.2), inset 0 0 20px rgba(189, 0, 255, 0.1)",
              }}
            />
            <div
              className="absolute inset-0 transition-colors duration-500"
              style={{ backgroundColor: "rgba(189, 0, 255, 0.05)" }}
            />
            <div className="relative flex items-center gap-3">
              <span
                className="text-sm tracking-widest text-white group-hover:text-cyan-400 transition-colors"
                style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
              >
                INITIALIZE
              </span>
              <ArrowRight className="w-4 h-4 text-purple-500 group-hover:text-cyan-400 transition-colors" />
            </div>
          </button>
        </footer>
      </div>

      {/* Bottom fade */}
      <div
        className="fixed bottom-0 left-0 w-full h-32 pointer-events-none z-0"
        style={{
          background: "linear-gradient(to top, #020205, rgba(2, 2, 5, 0.8), transparent)",
        }}
      />

      {/* Transition overlay */}
      <div
        className={`fixed inset-0 z-50 pointer-events-none transition-opacity duration-700 ${
          isTransitioning ? "opacity-100" : "opacity-0"
        }`}
        style={{ backgroundColor: "#020205" }}
      />

      <style jsx global>{`
        @keyframes flicker {
          0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100% { opacity: 0.99; }
          20%, 21.999%, 63%, 63.999%, 65%, 69.999% { opacity: 0.4; }
        }
      `}</style>
    </main>
  );
}
