import React from 'react';

// Generates high-performance inline SVG car replicas based on category or ID
export default function CarGraphic({ category, productId, className = "" }) {
  // Select styling parameters based on category
  let gradientId = `grad-${productId || 'default'}`;
  let primaryColor = "#00f0ff"; // neon cyan
  let secondaryColor = "#3b82f6"; // neon blue
  let glowColor = "rgba(0, 240, 255, 0.4)";
  
  if (category === "Supercar") {
    primaryColor = "#ff0055"; // racing red
    secondaryColor = "#ff7700"; // gold orange
    glowColor = "rgba(255, 0, 85, 0.4)";
  } else if (category === "JDM") {
    primaryColor = "#00f0ff"; // cyan
    secondaryColor = "#a855f7"; // purple
    glowColor = "rgba(0, 240, 255, 0.4)";
  } else if (category === "Classic") {
    primaryColor = "#eab308"; // chrome gold
    secondaryColor = "#854d0e"; // bronze brown
    glowColor = "rgba(234, 179, 8, 0.3)";
  } else if (category === "Muscle") {
    primaryColor = "#3b82f6"; // blue
    secondaryColor = "#1e3a8a"; // dark blue
    glowColor = "rgba(59, 130, 246, 0.4)";
  }

  return (
    <svg 
      viewBox="0 0 400 200" 
      className={className} 
      style={{ width: '100%', height: '100%' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Sleek dark grid background */}
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
        </pattern>
        
        {/* Car body gradient */}
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={primaryColor} />
          <stop offset="100%" stopColor={secondaryColor} />
        </linearGradient>

        {/* Glow filter */}
        <filter id="neon-glow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Grid background */}
      <rect width="100%" height="100%" fill="url(#grid)" />
      <rect width="100%" height="100%" fill="rgba(10, 11, 13, 0.4)" />

      {/* Speed lines */}
      <g stroke="rgba(255, 255, 255, 0.08)" strokeWidth="2" strokeLinecap="round">
        <line x1="20" y1="140" x2="80" y2="140" strokeDasharray="10 5" />
        <line x1="40" y1="110" x2="100" y2="110" strokeDasharray="5 15" />
        <line x1="10" y1="165" x2="70" y2="165" strokeDasharray="20 10" />
        <line x1="300" y1="50" x2="360" y2="50" strokeDasharray="2 10" />
      </g>

      {/* Ground shadow */}
      <ellipse cx="200" cy="170" rx="140" ry="12" fill="rgba(0, 0, 0, 0.6)" />
      
      {/* Neon underglow */}
      <ellipse cx="200" cy="168" rx="120" ry="8" fill={primaryColor} opacity="0.3" filter="url(#neon-glow)" />

      {/* Car Silhouette body based on category */}
      {category === "Supercar" && (
        <g id="supercar-body">
          {/* Low hypercar chassis */}
          <path 
            d="M 60 160 L 80 150 Q 110 120 160 110 Q 220 90 280 115 T 350 145 Q 360 150 365 160 Z" 
            fill={`url(#${gradientId})`} 
          />
          {/* Aero spoiler */}
          <path d="M 50 145 L 75 140 L 70 155 Z" fill="#111" />
          <line x1="50" y1="145" x2="60" y2="160" stroke="#111" strokeWidth="3" />
          {/* Cockpit glass */}
          <path d="M 160 110 Q 200 93 250 105 L 270 120 Q 220 112 160 110 Z" fill="#111" opacity="0.75" />
          {/* Neon body highlight lines */}
          <path d="M 110 135 Q 200 115 280 135" fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="2" />
        </g>
      )}

      {category === "JDM" && (
        <g id="jdm-body">
          {/* Tuner chassis (Skyline / AE86) */}
          <path 
            d="M 65 160 L 65 135 L 90 135 L 140 115 L 260 115 L 305 140 L 355 145 L 360 160 Z" 
            fill={`url(#${gradientId})`} 
          />
          {/* Drift wing */}
          <path d="M 55 125 L 75 125 L 70 138 L 60 138 Z" fill="#111" />
          {/* Cockpit / Windows */}
          <path d="M 145 118 L 255 118 L 285 138 L 130 138 Z" fill="#111" opacity="0.8" />
          {/* Side skirt line */}
          <line x1="120" y1="158" x2="290" y2="158" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1.5" />
        </g>
      )}

      {category === "Classic" && (
        <g id="classic-body">
          {/* Curvy Classic roadster body */}
          <path 
            d="M 60 160 C 60 140 85 130 130 128 C 170 110 240 110 280 125 C 320 125 350 135 365 160 Z" 
            fill={`url(#${gradientId})`} 
          />
          {/* Spoke detailing & vintage grill accent */}
          <path d="M 355 140 Q 362 148 360 160" fill="none" stroke="#fff" strokeWidth="2" />
          {/* Convertible windshield */}
          <path d="M 190 122 L 210 110 L 235 125 Z" fill="#111" opacity="0.6" />
          {/* Chrome side line */}
          <path d="M 90 142 C 160 138 230 138 320 148" fill="none" stroke="#fff" strokeWidth="1.5" />
        </g>
      )}

      {category === "Muscle" && (
        <g id="muscle-body">
          {/* Bold, boxy muscle car */}
          <path 
            d="M 55 160 L 55 140 L 105 135 L 145 118 L 270 118 L 285 135 L 365 135 L 365 160 Z" 
            fill={`url(#${gradientId})`} 
          />
          {/* Racing stripes */}
          <path d="M 170 118 L 190 118 L 190 160 L 170 160 Z" fill="rgba(0, 0, 0, 0.3)" />
          <path d="M 200 118 L 220 118 L 220 160 L 200 160 Z" fill="rgba(0, 0, 0, 0.3)" />
          {/* Muscle cabin */}
          <path d="M 152 121 L 263 121 L 276 135 L 140 135 Z" fill="#111" opacity="0.85" />
          {/* Quad headlights and engine blower details */}
          <rect x="110" y="130" width="15" height="6" fill="#222" />
        </g>
      )}

      {/* Wheel Wells (Black circular cutouts) */}
      <circle cx="110" cy="160" r="28" fill="#0a0b0d" />
      <circle cx="290" cy="160" r="28" fill="#0a0b0d" />

      {/* Rear Wheel */}
      <g>
        <circle cx="110" cy="160" r="24" fill="#1a1d29" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="2" />
        <circle cx="110" cy="160" r="14" fill="#000" />
        {/* Neon Spokes */}
        <circle cx="110" cy="160" r="18" fill="none" stroke={primaryColor} strokeWidth="2" strokeDasharray="4 8" filter="url(#neon-glow)" />
        {/* Brake Disc */}
        <circle cx="110" cy="160" r="8" fill="none" stroke="#fff" strokeWidth="1" />
      </g>

      {/* Front Wheel */}
      <g>
        <circle cx="290" cy="160" r="24" fill="#1a1d29" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="2" />
        <circle cx="290" cy="160" r="14" fill="#000" />
        {/* Neon Spokes */}
        <circle cx="290" cy="160" r="18" fill="none" stroke={primaryColor} strokeWidth="2" strokeDasharray="4 8" filter="url(#neon-glow)" />
        {/* Brake Disc */}
        <circle cx="290" cy="160" r="8" fill="none" stroke="#fff" strokeWidth="1" />
      </g>
    </svg>
  );
}
