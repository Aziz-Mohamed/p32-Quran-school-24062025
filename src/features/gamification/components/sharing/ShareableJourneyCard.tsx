import React from 'react';
import Svg, {
  Defs,
  G,
  Rect,
  Text as SvgText,
  Circle,
  Path,
  Polygon,
  type SvgProps,
} from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { I18nManager } from 'react-native';

import { KufiyaPatternDefs } from './KufiyaPattern';
import { getHeatMapColor } from '../../utils/heatmap-colors';
import { HEATMAP_LEGEND } from '../../utils/heatmap-colors';
import type { EnrichedCertification, RubReference } from '../../types/gamification.types';
import { typography } from '@/theme/typography';

// ─── Card dimensions ────────────────────────────────────────────────────────
const W = 360;
const H = 640;
const BAND = 36;       // kufiya border band height
const SIDE = 14;       // kufiya side strip width

// ─── Colors ─────────────────────────────────────────────────────────────────
const BG = '#0F172A';
const BG_INNER = '#111827';
const PRIMARY = '#22C55E';
const TEXT_PRIMARY = '#F8FAFC';
const TEXT_SECONDARY = '#94A3B8';
const TEXT_MUTED = '#64748B';
const SURFACE = 'rgba(255, 255, 255, 0.06)';
const SURFACE_BORDER = 'rgba(255, 255, 255, 0.1)';
const KUFIYA_COLOR = '#4B5563';

// ─── Grid constants ─────────────────────────────────────────────────────────
const CELL = 11;
const GAP = 1.5;
const JUZ_W = 18;
const GRID_COLS = 8;
const GRID_LEFT = SIDE + 18;           // content left padding
const GRID_TOP = 170;                   // Y offset for the grid
const GRID_ROW_H = CELL + GAP;
const GRID_WIDTH = JUZ_W + GRID_COLS * CELL + (GRID_COLS - 1) * GAP;

interface ShareableJourneyCardProps extends Pick<SvgProps, 'onLayout'> {
  svgRef: React.RefObject<Svg | null>;
  studentName: string;
  certifiedCount: number;
  totalReviews: number;
  certMap: Map<number, EnrichedCertification>;
  rubReference: RubReference[];
}

/**
 * Pure SVG shareable card — no native View capture needed.
 * Uses react-native-svg's toDataURL() for image export.
 */
export function ShareableJourneyCard({
  svgRef,
  studentName,
  certifiedCount,
  totalReviews,
  certMap,
  rubReference,
  ...svgProps
}: ShareableJourneyCardProps) {
  const { t } = useTranslation();
  const isRTL = I18nManager.isRTL;
  const percentage = Math.round((certifiedCount / 240) * 100);
  const cx = W / 2; // center X

  // Grid centering
  const gridOffsetX = (W - GRID_WIDTH) / 2;

  // Group rub reference into 30 juz rows
  const juzRows: RubReference[][] = [];
  for (let juz = 1; juz <= 30; juz++) {
    juzRows.push(rubReference.filter((r) => r.juz_number === juz));
  }

  // ─── Stats section Y position ───────────────────────────────────────────
  const statsY = GRID_TOP + 30 * GRID_ROW_H + 18;
  const statCardW = 95;
  const statCardH = 50;
  const statGap = 10;
  const statsLeftX = (W - (3 * statCardW + 2 * statGap)) / 2;

  // ─── Legend Y position ──────────────────────────────────────────────────
  const legendY = statsY + statCardH + 16;
  const legendDotR = 4;
  const legendItemW = 56;
  const legendLeftX = (W - HEATMAP_LEGEND.length * legendItemW) / 2;

  return (
    <Svg
      ref={svgRef}
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      {...svgProps}
    >
      <Defs>
        <KufiyaPatternDefs id="kufiya" color={KUFIYA_COLOR} tileSize={20} />
        <KufiyaPatternDefs id="kufiyaSm" color={KUFIYA_COLOR} tileSize={14} />
      </Defs>

      {/* ── Background ─────────────────────────────────────────────────── */}
      <Rect x={0} y={0} width={W} height={H} fill={BG} />

      {/* ── Kufiya borders ─────────────────────────────────────────────── */}
      <Rect x={0} y={0} width={W} height={BAND} fill="url(#kufiya)" />
      <Rect x={0} y={H - BAND} width={W} height={BAND} fill="url(#kufiya)" />
      <Rect x={0} y={BAND} width={SIDE} height={H - 2 * BAND} fill="url(#kufiyaSm)" />
      <Rect x={W - SIDE} y={BAND} width={SIDE} height={H - 2 * BAND} fill="url(#kufiyaSm)" />

      {/* ── Inner background ───────────────────────────────────────────── */}
      <Rect x={SIDE} y={BAND} width={W - 2 * SIDE} height={H - 2 * BAND} fill={BG_INNER} />

      {/* ── Branding bar ───────────────────────────────────────────────── */}
      {/* Crescent moon icon (scaled from 64x64 viewBox to ~18px) */}
      <G transform={`translate(${SIDE + 14}, ${BAND + 10}) scale(0.28)`}>
        <Path
          d="M38 6 C22 6 10 18 10 34 C10 50 22 62 38 62 C30 56 26 46 26 34 C26 22 30 12 38 6Z"
          fill={PRIMARY}
        />
        <Polygon
          points="48,16 50,22 56,22 51,26 53,32 48,28 43,32 45,26 40,22 46,22"
          fill={PRIMARY}
        />
      </G>
      <SvgText
        x={SIDE + 36}
        y={BAND + 27}
        fill={PRIMARY}
        fontFamily={typography.fontFamily.bold}
        fontSize={16}
        letterSpacing={0.5}
      >
        {t('student.journey.shareBranding')}
      </SvgText>

      {/* Islamic star icon (top right) */}
      <G transform={`translate(${W - SIDE - 30}, ${BAND + 8}) scale(0.25)`}>
        <Path
          d="M32 4 L37 22 L56 16 L42 28 L60 32 L42 36 L56 48 L37 42 L32 60 L27 42 L8 48 L22 36 L4 32 L22 28 L8 16 L27 22 Z"
          fill={TEXT_MUTED}
        />
        <Circle cx={32} cy={32} r={8} fill="white" opacity={0.2} />
      </G>

      {/* ── Divider 1 ──────────────────────────────────────────────────── */}
      <Rect x={SIDE + 16} y={BAND + 42} width={W - 2 * SIDE - 32} height={0.5} fill="rgba(255,255,255,0.1)" />

      {/* ── Title + student name ───────────────────────────────────────── */}
      <SvgText
        x={cx}
        y={BAND + 68}
        fill={TEXT_PRIMARY}
        fontFamily={typography.fontFamily.bold}
        fontSize={22}
        textAnchor="middle"
      >
        {t('student.journey.shareTitle')}
      </SvgText>
      <SvgText
        x={cx}
        y={BAND + 88}
        fill={TEXT_SECONDARY}
        fontFamily={typography.fontFamily.medium}
        fontSize={14}
        textAnchor="middle"
      >
        {studentName}
      </SvgText>

      {/* ── Divider 2 ──────────────────────────────────────────────────── */}
      <Rect x={SIDE + 16} y={BAND + 98} width={W - 2 * SIDE - 32} height={0.5} fill="rgba(255,255,255,0.1)" />

      {/* ── Grid container background ──────────────────────────────────── */}
      <Rect
        x={gridOffsetX - 8}
        y={GRID_TOP - 8}
        width={GRID_WIDTH + 16}
        height={30 * GRID_ROW_H + 12}
        rx={10}
        fill="rgba(255,255,255,0.03)"
        stroke={SURFACE_BORDER}
        strokeWidth={0.5}
      />

      {/* ── Heatmap grid (30 rows × 8 cols) ────────────────────────────── */}
      {juzRows.map((row, juzIdx) => {
        const juzNumber = juzIdx + 1;
        const rowY = GRID_TOP + juzIdx * GRID_ROW_H;

        return (
          <G key={juzNumber}>
            {/* Juz label */}
            <SvgText
              x={gridOffsetX + JUZ_W / 2}
              y={rowY + CELL * 0.75}
              fill="rgba(255,255,255,0.35)"
              fontFamily={typography.fontFamily.bold}
              fontSize={7}
              textAnchor="middle"
            >
              {juzNumber}
            </SvgText>

            {/* Cells */}
            {row.map((rub, colIdx) => {
              const cert = certMap.get(rub.rub_number);
              const state = cert ? cert.freshness.state : null;
              const bgColor = getHeatMapColor(state);
              const isCertified = state !== null && state !== 'uncertified';
              const cellX = isRTL
                ? gridOffsetX + JUZ_W + (GRID_COLS - 1 - colIdx) * (CELL + GAP)
                : gridOffsetX + JUZ_W + colIdx * (CELL + GAP);

              return (
                <Rect
                  key={rub.rub_number}
                  x={cellX}
                  y={rowY}
                  width={CELL}
                  height={CELL}
                  rx={2}
                  fill={bgColor}
                  stroke={isCertified ? bgColor : '#D1D5DB'}
                  strokeWidth={isCertified ? 0 : 0.5}
                  strokeDasharray={isCertified ? undefined : '2,1'}
                />
              );
            })}
          </G>
        );
      })}

      {/* ── Divider 3 ──────────────────────────────────────────────────── */}
      <Rect
        x={SIDE + 16}
        y={statsY - 10}
        width={W - 2 * SIDE - 32}
        height={0.5}
        fill="rgba(255,255,255,0.1)"
      />

      {/* ── Stats cards ────────────────────────────────────────────────── */}
      {[
        { value: String(certifiedCount), label: `/ 240 ${t('student.journey.shareCertified')}`, color: TEXT_PRIMARY },
        { value: `${percentage}%`, label: t('student.journey.shareComplete'), color: PRIMARY },
        { value: String(totalReviews), label: t('student.journey.shareReviews'), color: TEXT_PRIMARY },
      ].map((stat, i) => {
        const cardX = statsLeftX + i * (statCardW + statGap);
        return (
          <G key={i}>
            <Rect
              x={cardX}
              y={statsY}
              width={statCardW}
              height={statCardH}
              rx={8}
              fill={SURFACE}
              stroke={SURFACE_BORDER}
              strokeWidth={0.5}
            />
            <SvgText
              x={cardX + statCardW / 2}
              y={statsY + 22}
              fill={stat.color}
              fontFamily={typography.fontFamily.bold}
              fontSize={18}
              textAnchor="middle"
            >
              {stat.value}
            </SvgText>
            <SvgText
              x={cardX + statCardW / 2}
              y={statsY + 38}
              fill={TEXT_MUTED}
              fontFamily={typography.fontFamily.medium}
              fontSize={8.5}
              textAnchor="middle"
            >
              {stat.label}
            </SvgText>
          </G>
        );
      })}

      {/* ── Legend ──────────────────────────────────────────────────────── */}
      {HEATMAP_LEGEND.map((entry, i) => {
        const lx = legendLeftX + i * legendItemW;
        return (
          <G key={i}>
            <Circle
              cx={lx + legendDotR}
              cy={legendY}
              r={legendDotR}
              fill={entry.color}
            />
            <SvgText
              x={lx + legendDotR * 2 + 4}
              y={legendY + 3}
              fill={TEXT_MUTED}
              fontFamily={typography.fontFamily.medium}
              fontSize={8}
            >
              {t(`student.journey.legend.${entry.label}`)}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}
