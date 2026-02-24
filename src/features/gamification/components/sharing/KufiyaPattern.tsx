import React from 'react';
import { Pattern, Rect, Line, Path, Circle } from 'react-native-svg';

/**
 * Kufiya pattern SVG defs — renders inside a parent <Svg>'s <Defs>.
 * Palestinian kufiya geometric fishnet crosshatch with leaf/ogee motifs.
 */
export function KufiyaPatternDefs({
  id = 'kufiya',
  color = '#4B5563',
  tileSize = 20,
}: {
  id?: string;
  color?: string;
  tileSize?: number;
}) {
  const t = tileSize;
  const half = t / 2;

  return (
    <Pattern
      id={id}
      patternUnits="userSpaceOnUse"
      width={t}
      height={t}
    >
      {/* Crosshatch diagonal lines — the fishnet grid */}
      <Line x1={0} y1={0} x2={t} y2={t} stroke={color} strokeWidth={1} opacity={0.7} />
      <Line x1={t} y1={0} x2={0} y2={t} stroke={color} strokeWidth={1} opacity={0.7} />

      {/* Diamond outline connecting midpoints */}
      <Path
        d={`M${half},0 L${t},${half} L${half},${t} L0,${half} Z`}
        stroke={color}
        strokeWidth={0.7}
        fill="none"
        opacity={0.5}
      />

      {/* Leaf/ogee motifs at each diamond corner */}
      <Path
        d={`M${half - 2},${t * 0.1} Q${half},${t * 0.22} ${half + 2},${t * 0.1}`}
        stroke={color} strokeWidth={0.6} fill="none" opacity={0.6}
      />
      <Path
        d={`M${half - 2},${t * 0.9} Q${half},${t * 0.78} ${half + 2},${t * 0.9}`}
        stroke={color} strokeWidth={0.6} fill="none" opacity={0.6}
      />
      <Path
        d={`M${t * 0.9},${half - 2} Q${t * 0.78},${half} ${t * 0.9},${half + 2}`}
        stroke={color} strokeWidth={0.6} fill="none" opacity={0.6}
      />
      <Path
        d={`M${t * 0.1},${half - 2} Q${t * 0.22},${half} ${t * 0.1},${half + 2}`}
        stroke={color} strokeWidth={0.6} fill="none" opacity={0.6}
      />

      {/* Center dot */}
      <Circle cx={half} cy={half} r={1.2} fill={color} opacity={0.35} />
    </Pattern>
  );
}
