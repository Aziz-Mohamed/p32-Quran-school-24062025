import React from 'react';
import Svg, { Path, Circle, Rect, G, Line, Ellipse, Polygon } from 'react-native-svg';
import type { IslamicIconProps } from './types';

// ─── Worship ─────────────────────────────────────────────────────────────────

export function MosqueIcon({ size = 24, color = '#000' }: IslamicIconProps) {
  const c = String(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Left minaret */}
      <Rect x="6" y="24" width="6" height="28" rx="1" fill={c} />
      <Path d="M9 14 C9 14 6 20 6 24 L12 24 C12 20 9 14 9 14Z" fill={c} />
      <Circle cx="9" cy="13" r="1.5" fill={c} />
      {/* Right minaret */}
      <Rect x="52" y="24" width="6" height="28" rx="1" fill={c} />
      <Path d="M55 14 C55 14 52 20 52 24 L58 24 C58 20 55 14 55 14Z" fill={c} />
      <Circle cx="55" cy="13" r="1.5" fill={c} />
      {/* Main body */}
      <Rect x="14" y="32" width="36" height="20" rx="2" fill={c} />
      {/* Dome */}
      <Path d="M18 32 Q32 10 46 32 Z" fill={c} />
      {/* Crescent on dome */}
      <Path d="M32 16 C29 16 27 18.5 27 21 C27 23.5 29 26 32 26 C30 26 28.5 23.5 28.5 21 C28.5 18.5 30 16 32 16Z" fill="white" />
      {/* Door */}
      <Path d="M27 52 L27 42 Q32 36 37 42 L37 52 Z" fill="white" />
    </Svg>
  );
}

export function QuranIcon({ size = 24, color = '#000' }: IslamicIconProps) {
  const c = String(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Left page */}
      <Path d="M6 10 C6 8 8 6 10 6 L30 6 L30 54 L10 54 C8 54 6 52 6 50 Z" fill={c} opacity={0.85} />
      {/* Right page */}
      <Path d="M58 10 C58 8 56 6 54 6 L34 6 L34 54 L54 54 C56 54 58 52 58 50 Z" fill={c} />
      {/* Spine */}
      <Rect x="30" y="6" width="4" height="48" fill={c} />
      {/* Page lines left */}
      <Line x1="12" y1="16" x2="26" y2="16" stroke="white" strokeWidth="1.5" opacity={0.5} />
      <Line x1="12" y1="22" x2="26" y2="22" stroke="white" strokeWidth="1.5" opacity={0.5} />
      <Line x1="12" y1="28" x2="26" y2="28" stroke="white" strokeWidth="1.5" opacity={0.5} />
      <Line x1="12" y1="34" x2="26" y2="34" stroke="white" strokeWidth="1.5" opacity={0.5} />
      {/* Page lines right */}
      <Line x1="38" y1="16" x2="52" y2="16" stroke="white" strokeWidth="1.5" opacity={0.5} />
      <Line x1="38" y1="22" x2="52" y2="22" stroke="white" strokeWidth="1.5" opacity={0.5} />
      <Line x1="38" y1="28" x2="52" y2="28" stroke="white" strokeWidth="1.5" opacity={0.5} />
      <Line x1="38" y1="34" x2="52" y2="34" stroke="white" strokeWidth="1.5" opacity={0.5} />
      {/* Decorative star on cover */}
      <Circle cx="32" cy="44" r="4" fill="white" opacity={0.4} />
    </Svg>
  );
}

export function KaabaIcon({ size = 24, color = '#000' }: IslamicIconProps) {
  const c = String(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Main cube - front face */}
      <Path d="M12 22 L32 14 L52 22 L52 54 L12 54 Z" fill={c} />
      {/* Top face */}
      <Path d="M12 22 L32 14 L52 22 L32 30 Z" fill={c} opacity={0.7} />
      {/* Gold band (kiswa) */}
      <Rect x="12" y="32" width="40" height="6" fill="white" opacity={0.3} />
      {/* Door */}
      <Path d="M28 54 L28 42 Q32 38 36 42 L36 54 Z" fill="white" opacity={0.25} />
    </Svg>
  );
}

export function PrayerBeadsIcon({ size = 24, color = '#000' }: IslamicIconProps) {
  const c = String(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Bead circle arrangement */}
      {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((angle, i) => {
        const r = 22;
        const cx = 32 + r * Math.cos((angle * Math.PI) / 180);
        const cy = 32 + r * Math.sin((angle * Math.PI) / 180);
        return <Circle key={i} cx={cx} cy={cy} r="4" fill={c} />;
      })}
      {/* Tassel at bottom */}
      <Line x1="32" y1="54" x2="32" y2="62" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
      <Circle cx="32" cy="57" r="2.5" fill={c} />
    </Svg>
  );
}

export function LanternIcon({ size = 24, color = '#000' }: IslamicIconProps) {
  const c = String(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Hook */}
      <Path d="M28 4 L28 2 Q32 0 36 2 L36 4" stroke={c} strokeWidth="2" fill="none" />
      <Line x1="32" y1="2" x2="32" y2="8" stroke={c} strokeWidth="2" />
      {/* Top cap */}
      <Path d="M24 8 L40 8 L38 14 L26 14 Z" fill={c} />
      {/* Body */}
      <Path d="M26 14 Q20 30 20 38 Q20 50 32 54 Q44 50 44 38 Q44 30 38 14 Z" fill={c} opacity={0.9} />
      {/* Glass panels */}
      <Path d="M28 18 Q24 30 24 38 Q24 46 32 50 L32 18 Z" fill="white" opacity={0.2} />
      <Path d="M36 18 Q40 30 40 38 Q40 46 32 50 L32 18 Z" fill="white" opacity={0.1} />
      {/* Bottom */}
      <Ellipse cx="32" cy="54" rx="6" ry="2" fill={c} />
    </Svg>
  );
}

export function PrayerMatIcon({ size = 24, color = '#000' }: IslamicIconProps) {
  const c = String(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Mat body */}
      <Path d="M4 18 L60 18 L56 58 L8 58 Z" fill={c} opacity={0.85} />
      {/* Mihrab arch */}
      <Path d="M22 18 L22 30 Q32 20 42 30 L42 18 Z" fill="white" opacity={0.3} />
      {/* Border decoration */}
      <Rect x="10" y="38" width="44" height="2" fill="white" opacity={0.2} />
      <Rect x="10" y="48" width="44" height="2" fill="white" opacity={0.2} />
      {/* Fringe top */}
      {[8, 16, 24, 32, 40, 48, 56].map((x, i) => (
        <Line key={i} x1={x} y1="14" x2={x} y2="18" stroke={c} strokeWidth="1.5" />
      ))}
      {/* Fringe bottom */}
      {[10, 18, 26, 34, 42, 50].map((x, i) => (
        <Line key={i} x1={x} y1="58" x2={x + 1} y2="62" stroke={c} strokeWidth="1.5" />
      ))}
    </Svg>
  );
}

export function DuaHandsIcon({ size = 24, color = '#000' }: IslamicIconProps) {
  const c = String(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Left hand */}
      <Path
        d="M18 50 L18 28 Q18 20 22 16 L24 14 Q26 12 26 16 L26 26 L26 14 Q26 10 28 12 L28 26 L28 12 Q28 8 30 12 L30 26 L30 16 Q30 12 32 16 L32 36"
        fill={c}
        opacity={0.9}
      />
      {/* Right hand */}
      <Path
        d="M46 50 L46 28 Q46 20 42 16 L40 14 Q38 12 38 16 L38 26 L38 14 Q38 10 36 12 L36 26 L36 12 Q36 8 34 12 L34 26 L34 16 Q34 12 32 16 L32 36"
        fill={c}
      />
      {/* Sleeves */}
      <Path d="M14 58 Q14 48 18 48 L32 48 L46 48 Q50 48 50 58 Z" fill={c} opacity={0.7} />
    </Svg>
  );
}

// ─── Celestial ───────────────────────────────────────────────────────────────

export function CrescentMoonIcon({ size = 24, color = '#000' }: IslamicIconProps) {
  const c = String(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Crescent */}
      <Path
        d="M38 6 C22 6 10 18 10 34 C10 50 22 62 38 62 C30 56 26 46 26 34 C26 22 30 12 38 6Z"
        fill={c}
      />
      {/* Star */}
      <Polygon
        points="48,16 50,22 56,22 51,26 53,32 48,28 43,32 45,26 40,22 46,22"
        fill={c}
      />
    </Svg>
  );
}

export function IslamicStarIcon({ size = 24, color = '#000' }: IslamicIconProps) {
  const c = String(color);
  // 8-pointed star
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Path
        d="M32 4 L37 22 L56 16 L42 28 L60 32 L42 36 L56 48 L37 42 L32 60 L27 42 L8 48 L22 36 L4 32 L22 28 L8 16 L27 22 Z"
        fill={c}
      />
      <Circle cx="32" cy="32" r="8" fill="white" opacity={0.2} />
    </Svg>
  );
}

export function SunIcon({ size = 24, color = '#000' }: IslamicIconProps) {
  const c = String(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Circle cx="32" cy="32" r="12" fill={c} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const x1 = 32 + 16 * Math.cos((angle * Math.PI) / 180);
        const y1 = 32 + 16 * Math.sin((angle * Math.PI) / 180);
        const x2 = 32 + 24 * Math.cos((angle * Math.PI) / 180);
        const y2 = 32 + 24 * Math.sin((angle * Math.PI) / 180);
        return <Line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth="3" strokeLinecap="round" />;
      })}
    </Svg>
  );
}

// ─── Architecture ────────────────────────────────────────────────────────────

export function DomeIcon({ size = 24, color = '#000' }: IslamicIconProps) {
  const c = String(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Base */}
      <Rect x="8" y="40" width="48" height="18" rx="2" fill={c} />
      {/* Dome */}
      <Path d="M8 40 Q8 12 32 8 Q56 12 56 40 Z" fill={c} opacity={0.9} />
      {/* Crescent finial */}
      <Path d="M32 8 L32 4" stroke={c} strokeWidth="2" />
      <Circle cx="32" cy="3" r="2" fill={c} />
      {/* Windows */}
      <Path d="M20 44 Q20 38 26 38 Q26 44 26 52 L20 52 Z" fill="white" opacity={0.25} />
      <Path d="M38 44 Q38 38 44 38 Q44 44 44 52 L38 52 Z" fill="white" opacity={0.25} />
    </Svg>
  );
}

export function MinaretIcon({ size = 24, color = '#000' }: IslamicIconProps) {
  const c = String(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Tower shaft */}
      <Path d="M26 22 L24 58 L40 58 L38 22 Z" fill={c} />
      {/* Pointed cap */}
      <Path d="M32 4 C32 4 24 16 24 22 L40 22 C40 16 32 4 32 4Z" fill={c} />
      {/* Crescent finial */}
      <Circle cx="32" cy="4" r="2" fill={c} />
      {/* Balcony */}
      <Rect x="20" y="30" width="24" height="3" rx="1" fill={c} opacity={0.8} />
      <Path d="M22 33 L22 36 L42 36 L42 33" fill={c} opacity={0.6} />
      {/* Base */}
      <Rect x="20" y="56" width="24" height="4" rx="1" fill={c} />
    </Svg>
  );
}

export function ArchIcon({ size = 24, color = '#000' }: IslamicIconProps) {
  const c = String(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Outer arch */}
      <Path
        d="M8 58 L8 24 Q8 4 32 4 Q56 4 56 24 L56 58 L48 58 L48 28 Q48 12 32 12 Q16 12 16 28 L16 58 Z"
        fill={c}
      />
      {/* Inner pointed arch */}
      <Path
        d="M20 58 L20 30 Q32 14 44 30 L44 58 Z"
        fill="white"
        opacity={0.2}
      />
    </Svg>
  );
}

export function GeometricPatternIcon({ size = 24, color = '#000' }: IslamicIconProps) {
  const c = String(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Outer octagon */}
      <Polygon
        points="24,4 40,4 56,16 56,36 56,48 40,60 24,60 8,48 8,16"
        fill="none"
        stroke={c}
        strokeWidth="3"
      />
      {/* Inner star pattern */}
      <Polygon
        points="32,10 38,24 52,20 42,32 52,44 38,40 32,54 26,40 12,44 22,32 12,20 26,24"
        fill={c}
        opacity={0.8}
      />
      {/* Center */}
      <Circle cx="32" cy="32" r="5" fill={c} />
    </Svg>
  );
}

// ─── Nature ──────────────────────────────────────────────────────────────────

export function PalmTreeIcon({ size = 24, color = '#000' }: IslamicIconProps) {
  const c = String(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Trunk */}
      <Path d="M30 32 Q28 46 26 60 L38 60 Q36 46 34 32 Z" fill={c} opacity={0.8} />
      {/* Fronds */}
      <Path d="M32 28 Q18 18 4 22 Q16 14 32 20 Z" fill={c} />
      <Path d="M32 28 Q46 18 60 22 Q48 14 32 20 Z" fill={c} />
      <Path d="M32 24 Q22 8 12 6 Q22 4 32 16 Z" fill={c} opacity={0.9} />
      <Path d="M32 24 Q42 8 52 6 Q42 4 32 16 Z" fill={c} opacity={0.9} />
      <Path d="M32 20 Q32 6 32 2 Q34 6 34 20 Z" fill={c} opacity={0.85} />
      {/* Dates */}
      <Circle cx="26" cy="28" r="2" fill={c} opacity={0.6} />
      <Circle cx="38" cy="28" r="2" fill={c} opacity={0.6} />
      <Circle cx="30" cy="30" r="1.5" fill={c} opacity={0.6} />
    </Svg>
  );
}

export function OliveBranchIcon({ size = 24, color = '#000' }: IslamicIconProps) {
  const c = String(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Main stem */}
      <Path d="M12 56 Q32 32 52 8" stroke={c} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Leaves - left side */}
      <Ellipse cx="20" cy="44" rx="6" ry="3" fill={c} transform="rotate(-30, 20, 44)" />
      <Ellipse cx="26" cy="36" rx="6" ry="3" fill={c} transform="rotate(-30, 26, 36)" />
      <Ellipse cx="34" cy="26" rx="6" ry="3" fill={c} transform="rotate(-30, 34, 26)" />
      <Ellipse cx="42" cy="18" rx="5" ry="2.5" fill={c} transform="rotate(-30, 42, 18)" />
      {/* Leaves - right side */}
      <Ellipse cx="24" cy="48" rx="6" ry="3" fill={c} opacity={0.8} transform="rotate(30, 24, 48)" />
      <Ellipse cx="32" cy="38" rx="6" ry="3" fill={c} opacity={0.8} transform="rotate(30, 32, 38)" />
      <Ellipse cx="40" cy="28" rx="5" ry="2.5" fill={c} opacity={0.8} transform="rotate(30, 40, 28)" />
      {/* Olives */}
      <Circle cx="18" cy="48" r="2.5" fill={c} opacity={0.5} />
      <Circle cx="30" cy="34" r="2.5" fill={c} opacity={0.5} />
    </Svg>
  );
}

export function DesertIcon({ size = 24, color = '#000' }: IslamicIconProps) {
  const c = String(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Sun */}
      <Circle cx="50" cy="16" r="8" fill={c} opacity={0.6} />
      {/* Dune 1 (back) */}
      <Path d="M0 52 Q16 28 36 40 Q48 32 64 44 L64 60 L0 60 Z" fill={c} opacity={0.5} />
      {/* Dune 2 (front) */}
      <Path d="M0 56 Q20 36 40 48 Q52 40 64 50 L64 60 L0 60 Z" fill={c} opacity={0.8} />
    </Svg>
  );
}

// ─── Achievement ─────────────────────────────────────────────────────────────

export function SwordIcon({ size = 24, color = '#000' }: IslamicIconProps) {
  const c = String(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Blade */}
      <Path d="M32 4 L36 40 L32 44 L28 40 Z" fill={c} />
      {/* Guard (cross) */}
      <Rect x="18" y="40" width="28" height="4" rx="2" fill={c} opacity={0.8} />
      {/* Grip */}
      <Rect x="29" y="44" width="6" height="12" rx="1" fill={c} opacity={0.9} />
      {/* Pommel */}
      <Circle cx="32" cy="58" r="3" fill={c} />
      {/* Blade highlight */}
      <Path d="M32 8 L34 38 L32 40 Z" fill="white" opacity={0.15} />
    </Svg>
  );
}

export function ShieldIcon({ size = 24, color = '#000' }: IslamicIconProps) {
  const c = String(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Shield body */}
      <Path
        d="M32 4 L56 14 L56 34 Q56 52 32 62 Q8 52 8 34 L8 14 Z"
        fill={c}
      />
      {/* Inner border */}
      <Path
        d="M32 10 L50 18 L50 34 Q50 48 32 56 Q14 48 14 34 L14 18 Z"
        fill="white"
        opacity={0.15}
      />
      {/* Star emblem */}
      <Polygon
        points="32,20 35,28 44,28 37,33 39,42 32,37 25,42 27,33 20,28 29,28"
        fill="white"
        opacity={0.3}
      />
    </Svg>
  );
}

export function CrownIcon({ size = 24, color = '#000' }: IslamicIconProps) {
  const c = String(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Crown body */}
      <Path
        d="M8 48 L12 20 L22 32 L32 12 L42 32 L52 20 L56 48 Z"
        fill={c}
      />
      {/* Base band */}
      <Rect x="8" y="48" width="48" height="6" rx="2" fill={c} />
      {/* Jewels */}
      <Circle cx="32" cy="42" r="3" fill="white" opacity={0.3} />
      <Circle cx="22" cy="44" r="2" fill="white" opacity={0.2} />
      <Circle cx="42" cy="44" r="2" fill="white" opacity={0.2} />
    </Svg>
  );
}

export function MedalIcon({ size = 24, color = '#000' }: IslamicIconProps) {
  const c = String(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Ribbon */}
      <Path d="M24 4 L20 28 L32 22 L44 28 L40 4 Z" fill={c} opacity={0.6} />
      {/* Medal circle */}
      <Circle cx="32" cy="40" r="18" fill={c} />
      {/* Inner circle */}
      <Circle cx="32" cy="40" r="14" fill="white" opacity={0.15} />
      {/* Star on medal */}
      <Polygon
        points="32,28 35,35 42,35 36,39 38,46 32,42 26,46 28,39 22,35 29,35"
        fill="white"
        opacity={0.3}
      />
    </Svg>
  );
}

// ─── Calligraphy ─────────────────────────────────────────────────────────────

export function BismillahIcon({ size = 24, color = '#000' }: IslamicIconProps) {
  const c = String(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Decorative frame */}
      <Path
        d="M8 16 Q32 4 56 16 L56 48 Q32 60 8 48 Z"
        fill={c}
        opacity={0.1}
      />
      <Path
        d="M8 16 Q32 4 56 16 L56 48 Q32 60 8 48 Z"
        stroke={c}
        strokeWidth="2"
        fill="none"
      />
      {/* Stylized Arabic-inspired flowing curves */}
      <Path
        d="M16 30 Q20 24 28 28 Q32 30 36 26 Q42 22 48 28"
        stroke={c}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M18 38 Q24 34 30 38 Q36 42 44 36"
        stroke={c}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Dots */}
      <Circle cx="24" cy="34" r="1.5" fill={c} />
      <Circle cx="36" cy="32" r="1.5" fill={c} />
      <Circle cx="40" cy="40" r="1.5" fill={c} />
    </Svg>
  );
}

export function MashallahIcon({ size = 24, color = '#000' }: IslamicIconProps) {
  const c = String(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Circular frame */}
      <Circle cx="32" cy="32" r="28" fill={c} opacity={0.1} />
      <Circle cx="32" cy="32" r="28" stroke={c} strokeWidth="2" fill="none" />
      <Circle cx="32" cy="32" r="24" stroke={c} strokeWidth="1" fill="none" opacity={0.5} />
      {/* Stylized flowing script lines */}
      <Path
        d="M14 28 Q18 20 26 26 Q32 30 38 24 Q44 18 50 26"
        stroke={c}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M16 38 Q22 32 30 38 Q38 44 46 36"
        stroke={c}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Dots */}
      <Circle cx="22" cy="32" r="1.5" fill={c} />
      <Circle cx="34" cy="30" r="1.5" fill={c} />
      <Circle cx="42" cy="42" r="1.5" fill={c} />
    </Svg>
  );
}

export function AlhamdulillahIcon({ size = 24, color = '#000' }: IslamicIconProps) {
  const c = String(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Ornate diamond frame */}
      <Path
        d="M32 4 L58 32 L32 60 L6 32 Z"
        fill={c}
        opacity={0.1}
      />
      <Path
        d="M32 4 L58 32 L32 60 L6 32 Z"
        stroke={c}
        strokeWidth="2"
        fill="none"
      />
      <Path
        d="M32 10 L52 32 L32 54 L12 32 Z"
        stroke={c}
        strokeWidth="1"
        fill="none"
        opacity={0.4}
      />
      {/* Flowing calligraphy curves */}
      <Path
        d="M18 30 Q24 22 32 28 Q40 34 46 26"
        stroke={c}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M20 38 Q28 34 34 40 Q40 44 44 38"
        stroke={c}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Dots */}
      <Circle cx="26" cy="34" r="1.5" fill={c} />
      <Circle cx="38" cy="32" r="1.5" fill={c} />
    </Svg>
  );
}
