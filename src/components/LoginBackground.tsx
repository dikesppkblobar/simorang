import React, { useState } from 'react';

export const LoginBackground: React.FC = () => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
      {/* Base Gradient Fallback */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background: 'linear-gradient(135deg, #041B33 0%, #072E54 30%, #004B87 65%, #006B7D 100%)',
        }}
      />

      {/* User Uploaded Background Image: /public/backkgroun login.png */}
      <img
        src="/backkgroun%20login.png"
        alt="Login Background SIMORANG"
        className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setImageLoaded(true)}
      />

      {/* Atmospheric Overlays for Optimal Text & Card Contrast */}
      <div className="absolute inset-0 w-full h-full bg-slate-950/40 backdrop-blur-[0.5px]" />
      <div className="absolute inset-0 w-full h-full bg-gradient-to-t from-slate-950/70 via-slate-900/30 to-slate-950/50" />
    </div>
  );
};
