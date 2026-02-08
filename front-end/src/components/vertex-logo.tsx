import React from 'react';

export const VertexLogo = ({ className = "h-8 w-auto" }: { className?: string }) => {
  // Warna Biru Arbitrum Solid (#12AAFF)
  const primaryColor = "#12AAFF";
  
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 240 64" // Viewbox yang pas buat icon + text
      className={`fill-none ${className}`}
      aria-label="VERTEX Logo"
    >
      {/* === BAGIAN ICON (GUNUNG & PANAH) === */}
      <g stroke={primaryColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
        {/* Bentuk Gunung 'M' */}
        <path d="M6 58 L30 18 L54 50 L78 10" />
        {/* Kepala Panah di ujung kanan */}
        <path d="M66 10 H78 V22" />
      </g>
      
      {/* === BAGIAN TEXT "VERTEX" === */}
      <text 
        x="100" 
        y="48" 
        fill={primaryColor}
        fontFamily="sans-serif"
        fontWeight="900" // Extra Bold biar gagah
        fontSize="44"
        letterSpacing="-1"
      >
        VERTEX
      </text>
    </svg>
  );
};