import React from 'react';

export const LoginBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
      {/* Background Gradient fallback */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          background: 'linear-gradient(135deg, #0B4F9B 0%, #004B87 40%, #007799 100%)',
        }}
      />

      {/* Canva Embedded Background Container - Fitted cleanly to screen */}
      <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center">
        <iframe
          loading="lazy"
          title="Background Desain Giri Menang Lombok Barat"
          className="w-full h-full border-none pointer-events-none object-cover"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
            objectFit: 'cover',
          }}
          src="https://www.canva.com/design/DAHTMkoTTHo/HDRkgOVBNHWFmEAH_dXCwg/view?embed"
          allowFullScreen
          allow="fullscreen"
        />
      </div>

      {/* Atmospheric Soft Vignette Overlay for Readability */}
      <div className="absolute inset-0 w-full h-full bg-slate-900/15 backdrop-blur-[0.5px]" />
    </div>
  );
};

