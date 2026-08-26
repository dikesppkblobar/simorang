import React from 'react';

export const LoginBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
      {/* 1. Deep Corporate Blue & Rich Teal Oceanic Gradient Base */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background: 'linear-gradient(135deg, #041B33 0%, #072E54 30%, #004B87 65%, #006B7D 100%)',
        }}
      />

      {/* 2. Abstract Architectural / Governmental SVG Waves & Arches (Giri Menang Aesthetic) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-25"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="giriGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00D2DC" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#0072CE" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="giriGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0.05" />
          </linearGradient>
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00D2DC" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#00D2DC" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Mountain Rinjani / Sasak Arch silhouettes */}
        <path
          d="M-100 900 L200 450 L550 780 L900 350 L1250 680 L1600 250 L1600 900 Z"
          fill="url(#giriGradient1)"
        />
        <path
          d="M-50 900 L350 520 L700 820 L1050 480 L1400 750 L1650 400 L1650 900 Z"
          fill="url(#giriGradient2)"
        />

        {/* Geometric Motif Lines */}
        <circle cx="720" cy="450" r="380" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeDasharray="6 8" />
        <circle cx="720" cy="450" r="540" fill="none" stroke="rgba(0,210,220,0.12)" strokeWidth="2" strokeDasharray="12 12" />
        <circle cx="720" cy="450" r="700" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      </svg>

      {/* 3. Subtle Clean Geometric / Medical Grid Pattern */}
      <div
        className="absolute inset-0 w-full h-full opacity-15"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px), radial-gradient(rgba(0, 210, 220, 0.3) 1px, transparent 1px)`,
          backgroundSize: '36px 36px',
          backgroundPosition: '0 0, 18px 18px',
        }}
      />

      {/* 4. Ambient Glow Spheres */}
      <div className="absolute top-1/4 left-1/6 w-96 h-96 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/6 w-[32rem] h-[32rem] rounded-full bg-blue-500/25 blur-3xl pointer-events-none" />
      <div className="absolute top-3/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />

      {/* 5. Clean vignette overlay for optimal typography contrast */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-t from-slate-950/60 via-slate-950/25 to-slate-950/40" />
    </div>
  );
};
