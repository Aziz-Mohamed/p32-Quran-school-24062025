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
  Rect,
  Path,
  Line,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

import type { RubCoverage } from '../utils/rub-coverage';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { normalize } from '@/theme/normalize';
import { radius } from '@/theme/radius';

// ─── Layout ──────────────────────────────────────────────────────────────────

const SCREEN_WIDTH = Dimensions.get('window').width;
const COLUMNS = 3;
const HORIZONTAL_PADDING = spacing.lg * 2;
const GAP = spacing.sm;
export const BLOCK_SIZE = Math.floor(
  (SCREEN_WIDTH - HORIZONTAL_PADDING - (COLUMNS - 1) * GAP) / COLUMNS,
);

const BS = BLOCK_SIZE; // shorthand for SVG paths

// ─── Glossy Arc Path ─────────────────────────────────────────────────────────
// Curved highlight blob covering the upper ~40% of the card

const GLOSS_ARC = [
  `M 0,0`,
  `L ${BS},0`,
  `L ${BS},${BS * 0.30}`,
  `Q ${BS * 0.5},${BS * 0.16} 0,${BS * 0.42}`,
  `Z`,
].join(' ');

// ─── Animated SVG ────────────────────────────────────────────────────────────

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

  const fillProps = useAnimatedProps(() => {
    const h = fillPct.value * BS;
    return { y: BS - h, height: h };
  });

  const glossProps = useAnimatedProps(() => {
    const h = fillPct.value * BS;
    return { y: BS - h, height: h };
  });

  const edgeLineProps = useAnimatedProps(() => {
    const yPos = BS - fillPct.value * BS;
    return { y1: yPos, y2: yPos };
  });

  return (
    <View style={styles.card}>
      <Svg width={BS} height={BS}>
        <Defs>
          {/* Card background — light warm cream */}
          <LinearGradient id={`${uid}bg`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#F0FDF4" />
            <Stop offset="0.5" stopColor="#ECFDF5" />
            <Stop offset="1" stopColor="#D1FAE5" />
          </LinearGradient>

          {/* Green fill — rich multi-stop */}
          <LinearGradient id={`${uid}fg`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#4ADE80" />
            <Stop offset="0.35" stopColor="#22C55E" />
            <Stop offset="0.7" stopColor="#1DB954" />
            <Stop offset="1" stopColor="#16A34A" />
          </LinearGradient>

          {/* Fill gloss — specular highlight on filled area */}
          <LinearGradient id={`${uid}fs`} x1="0.1" y1="0" x2="0.3" y2="1">
            <Stop offset="0" stopColor="#FFF" stopOpacity="0.35" />
            <Stop offset="0.18" stopColor="#FFF" stopOpacity="0.15" />
            <Stop offset="0.45" stopColor="#FFF" stopOpacity="0" />
            <Stop offset="1" stopColor="#000" stopOpacity="0.08" />
          </LinearGradient>

          {/* Glossy arc — permanent candy-like highlight */}
          <LinearGradient id={`${uid}ga`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFF" stopOpacity="0.22" />
            <Stop offset="0.5" stopColor="#FFF" stopOpacity="0.06" />
            <Stop offset="1" stopColor="#FFF" stopOpacity="0" />
          </LinearGradient>

        </Defs>

        {/* ── Layer 1: Card background ── */}
        <Rect x={0} y={0} width={BS} height={BS} fill={`url(#${uid}bg)`} />

        {/* ── Layer 2: Animated green fill ── */}
        <AnimatedRect x={0} width={BS} fill={`url(#${uid}fg)`} animatedProps={fillProps} />

        {/* ── Layer 3: Fill gloss overlay ── */}
        <AnimatedRect x={0} width={BS} fill={`url(#${uid}fs)`} animatedProps={glossProps} />

        {/* ── Layer 4: Meniscus line at fill level ── */}
        <AnimatedLine
          x1={0}
          x2={BS}
          stroke="#86EFAC"
          strokeWidth={normalize(2)}
          strokeOpacity={0.65}
          animatedProps={edgeLineProps}
        />

        {/* ── Layer 5: Glossy highlight arc ── */}
        <Path d={GLOSS_ARC} fill={`url(#${uid}ga)`} />

      </Svg>

      {/* ── Text overlay ── */}
      <View style={styles.content} pointerEvents="box-none">
        <View style={styles.rubBadge}>
          <Text style={styles.rubNum}>{coverage.rubNumber}</Text>
        </View>

        <View style={styles.infoBar}>
          {isComplete ? (
            <View style={styles.completeRow}>
              <Ionicons name="checkmark-circle" size={normalize(14)} color="#14532D" />
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
  card: {
    width: BLOCK_SIZE,
    height: BLOCK_SIZE,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(187, 247, 208, 0.5)',
    boxShadow: '0px 4px 14px rgba(22, 163, 74, 0.15), 0px 2px 6px rgba(0, 0, 0, 0.08)',
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: spacing.sm,
  },
  rubBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: normalize(8),
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: normalize(2),
    alignSelf: 'flex-start',
    marginTop: normalize(18),
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.06)',
  },
  rubNum: {
    fontFamily: typography.fontFamily.bold,
    fontSize: normalize(22),
    color: '#14532D',
    textShadowColor: 'rgba(255, 255, 255, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: normalize(8),
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: normalize(4),
  },
  ayahCount: {
    fontFamily: typography.fontFamily.medium,
    fontSize: normalize(12),
    color: '#14532D',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  pctLabel: {
    fontFamily: typography.fontFamily.bold,
    fontSize: normalize(14),
    color: '#14532D',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    color: '#14532D',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
