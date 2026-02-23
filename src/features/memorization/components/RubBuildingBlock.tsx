import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  useAnimatedProps,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Polygon,
  Rect,
  Line,
  ClipPath,
  G,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

import type { RubCoverage } from '../utils/rub-coverage';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { normalize } from '@/theme/normalize';

// ─── Layout ──────────────────────────────────────────────────────────────────

const SCREEN_WIDTH = Dimensions.get('window').width;
const COLUMNS = 3;
const HORIZONTAL_PADDING = spacing.lg * 2;
const GAP = spacing.sm;
export const BLOCK_SIZE = Math.floor(
  (SCREEN_WIDTH - HORIZONTAL_PADDING - (COLUMNS - 1) * GAP) / COLUMNS,
);

const DEPTH = normalize(18);
const FACE = BLOCK_SIZE - DEPTH;

// ─── Cube Vertices (isometric 45° projection) ───────────────────────────────
//
//        v0 ─────────── v1
//       ╱              ╱ │
//     v5 ─────────── v6  │
//     │               │  v2
//     │               │ ╱
//     v4 ─────────── v3
//

const v0: [number, number] = [DEPTH, 0];
const v1: [number, number] = [BLOCK_SIZE, 0];
const v2: [number, number] = [BLOCK_SIZE, FACE];
const v3: [number, number] = [FACE, BLOCK_SIZE];
const v4: [number, number] = [0, BLOCK_SIZE];
const v5: [number, number] = [0, DEPTH];
const v6: [number, number] = [FACE, DEPTH];

const pts = (...vs: [number, number][]) => vs.map((p) => p.join(',')).join(' ');

const TOP_PTS = pts(v5, v0, v1, v6);
const RIGHT_PTS = pts(v6, v1, v2, v3);
const FRONT_PTS = pts(v5, v6, v3, v4);

// ─── Animated SVG Rect ───────────────────────────────────────────────────────

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedLine = Animated.createAnimatedComponent(Line);

// ─── Component ───────────────────────────────────────────────────────────────

interface RubBuildingBlockProps {
  coverage: RubCoverage;
  isComplete: boolean;
}

function RubBuildingBlockInner({ coverage, isComplete }: RubBuildingBlockProps) {
  const { t } = useTranslation();
  const uid = `rb${coverage.rubNumber}`;

  const fillPct = useDerivedValue(() =>
    withSpring(coverage.percentage / 100, { damping: 18, stiffness: 80 }),
  );

  // Animated fill rect (green rising from bottom of front face)
  const fillProps = useAnimatedProps(() => {
    const h = fillPct.value * FACE;
    return { y: DEPTH + FACE - h, height: h };
  });

  // Animated gloss rect (rides on top of fill)
  const glossProps = useAnimatedProps(() => {
    const h = fillPct.value * FACE;
    return { y: DEPTH + FACE - h, height: h };
  });

  // Animated bright edge at liquid-level
  const edgeLineProps = useAnimatedProps(() => {
    const yPos = DEPTH + FACE - fillPct.value * FACE;
    return { y1: yPos, y2: yPos };
  });

  return (
    <View style={styles.wrapper}>
      {/* Soft drop shadow behind the cube */}
      <View style={styles.shadow} />

      <Svg width={BLOCK_SIZE} height={BLOCK_SIZE}>
        <Defs>
          {/* ── Top face: bright, lit from above ── */}
          <LinearGradient id={`${uid}tg`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#A7F3D0" />
            <Stop offset="1" stopColor="#34D399" />
          </LinearGradient>
          <LinearGradient id={`${uid}ts`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFF" stopOpacity="0.50" />
            <Stop offset="0.55" stopColor="#FFF" stopOpacity="0.10" />
            <Stop offset="1" stopColor="#FFF" stopOpacity="0" />
          </LinearGradient>

          {/* ── Right face: deep shadow ── */}
          <LinearGradient id={`${uid}rg`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#15803D" />
            <Stop offset="1" stopColor="#064E3B" />
          </LinearGradient>
          <LinearGradient id={`${uid}rs`} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#FFF" stopOpacity="0.14" />
            <Stop offset="1" stopColor="#FFF" stopOpacity="0" />
          </LinearGradient>

          {/* ── Front face fill: rich green ── */}
          <LinearGradient id={`${uid}fg`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#4ADE80" />
            <Stop offset="0.45" stopColor="#22C55E" />
            <Stop offset="1" stopColor="#16A34A" />
          </LinearGradient>
          {/* Gloss overlay on fill — specular from top */}
          <LinearGradient id={`${uid}fs`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFF" stopOpacity="0.38" />
            <Stop offset="0.25" stopColor="#FFF" stopOpacity="0.14" />
            <Stop offset="0.50" stopColor="#FFF" stopOpacity="0" />
            <Stop offset="1" stopColor="#000" stopOpacity="0.08" />
          </LinearGradient>

          {/* ── Empty front face ── */}
          <LinearGradient id={`${uid}eg`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#F0FDF4" />
            <Stop offset="1" stopColor="#DCFCE7" />
          </LinearGradient>

          {/* Clip to front face polygon */}
          <ClipPath id={`${uid}fc`}>
            <Polygon points={FRONT_PTS} />
          </ClipPath>
        </Defs>

        {/* ═══ Top Face ═══ */}
        <Polygon points={TOP_PTS} fill={`url(#${uid}tg)`} />
        <Polygon points={TOP_PTS} fill={`url(#${uid}ts)`} />
        {/* Specular shine line across top face */}
        <Line
          x1={DEPTH * 0.75}
          y1={DEPTH * 0.3}
          x2={FACE * 0.6 + DEPTH * 0.3}
          y2={DEPTH * 0.3}
          stroke="rgba(255,255,255,0.65)"
          strokeWidth={normalize(1.5)}
          strokeLinecap="round"
        />

        {/* ═══ Right Face ═══ */}
        <Polygon points={RIGHT_PTS} fill={`url(#${uid}rg)`} />
        <Polygon points={RIGHT_PTS} fill={`url(#${uid}rs)`} />

        {/* ═══ Front Face (clipped to polygon) ═══ */}
        <G clipPath={`url(#${uid}fc)`}>
          {/* Empty background */}
          <Rect x={0} y={DEPTH} width={FACE} height={FACE} fill={`url(#${uid}eg)`} />
          <Rect
            x={0}
            y={DEPTH}
            width={FACE}
            height={FACE}
            fill="none"
            stroke="#BBF7D0"
            strokeWidth={1}
          />

          {/* Animated green fill */}
          <AnimatedRect x={0} width={FACE} fill={`url(#${uid}fg)`} animatedProps={fillProps} />

          {/* Gloss overlay on fill */}
          <AnimatedRect x={0} width={FACE} fill={`url(#${uid}fs)`} animatedProps={glossProps} />
        </G>

        {/* Bright edge line at fill level (liquid meniscus) */}
        <AnimatedLine
          x1={0}
          x2={FACE}
          stroke="#86EFAC"
          strokeWidth={normalize(2.5)}
          strokeOpacity={0.85}
          animatedProps={edgeLineProps}
        />

        {/* ═══ Edge Lines (face boundaries for definition) ═══ */}
        {/* Top → Front edge (bright, light hitting edge) */}
        <Line
          x1={v5[0]}
          y1={v5[1]}
          x2={v6[0]}
          y2={v6[1]}
          stroke="rgba(134,239,172,0.7)"
          strokeWidth={1}
        />
        {/* Front → Right edge (dark, shadow edge) */}
        <Line
          x1={v6[0]}
          y1={v6[1]}
          x2={v3[0]}
          y2={v3[1]}
          stroke="rgba(21,128,61,0.5)"
          strokeWidth={1}
        />
        {/* Top → Right shared edge */}
        <Line
          x1={v6[0]}
          y1={v6[1]}
          x2={v1[0]}
          y2={v1[1]}
          stroke="rgba(52,211,153,0.4)"
          strokeWidth={0.5}
        />
      </Svg>

      {/* ── Text overlays — positioned over the front face ── */}
      <View style={styles.content} pointerEvents="box-none">
        <View style={styles.rubBadge}>
          <Text style={styles.rubNum}>{coverage.rubNumber}</Text>
        </View>

        <View style={styles.infoBar}>
          {isComplete ? (
            <View style={styles.completeRow}>
              <Ionicons name="checkmark-circle" size={normalize(14)} color="#FFF" />
              <Text style={styles.completeText}>
                {t('student.blockBuilder.ready')}
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.ayahCount}>
                {coverage.memorizedAyahs}/{coverage.totalAyahs}
              </Text>
              <Text style={styles.pctLabel}>{coverage.percentage}%</Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

export const RubBuildingBlock = React.memo(
  RubBuildingBlockInner,
  (prev, next) =>
    prev.coverage.rubNumber === next.coverage.rubNumber &&
    prev.coverage.percentage === next.coverage.percentage &&
    prev.isComplete === next.isComplete,
);

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    width: BLOCK_SIZE,
    height: BLOCK_SIZE,
  },
  shadow: {
    position: 'absolute',
    left: normalize(2),
    top: DEPTH + normalize(3),
    width: FACE,
    height: FACE,
    borderRadius: normalize(4),
    backgroundColor: 'transparent',
    boxShadow: '2px 4px 12px rgba(0, 0, 0, 0.16), 0px 1px 4px rgba(0, 0, 0, 0.08)',
  },
  content: {
    position: 'absolute',
    left: 0,
    top: DEPTH,
    width: FACE,
    height: FACE,
    justifyContent: 'space-between',
    padding: spacing.sm,
  },
  rubBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: normalize(8),
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: normalize(2),
    alignSelf: 'flex-start',
  },
  rubNum: {
    fontFamily: typography.fontFamily.bold,
    fontSize: normalize(20),
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.30)',
    borderRadius: normalize(6),
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: normalize(4),
    marginHorizontal: -spacing.sm,
    marginBottom: -spacing.sm,
  },
  ayahCount: {
    fontFamily: typography.fontFamily.medium,
    fontSize: normalize(12),
    color: 'rgba(255, 255, 255, 0.85)',
  },
  pctLabel: {
    fontFamily: typography.fontFamily.bold,
    fontSize: normalize(14),
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  completeRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: normalize(4),
  },
  completeText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: normalize(12),
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});
