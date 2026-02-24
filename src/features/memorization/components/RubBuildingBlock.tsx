import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
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
  Pattern,
} from 'react-native-svg';

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

const SPRING_CONFIG = { damping: 18, stiffness: 80 };

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
  onPress?: () => void;
}

function RubBuildingBlockInner({ coverage, onPress }: RubBuildingBlockProps) {
  const uid = `rb${coverage.rubNumber}`;

  const hasUncertified = coverage.uncertifiedAyahs > 0;
  const hasCertified = coverage.memorizedAyahs > 0;
  const totalAyahsTracked = coverage.memorizedAyahs + coverage.uncertifiedAyahs;

  // Animated fill percentages
  const certifiedPct = useDerivedValue(() =>
    withSpring(coverage.percentage / 100, SPRING_CONFIG),
  );

  const uncertifiedPct = useDerivedValue(() =>
    withSpring(coverage.uncertifiedPercentage / 100, SPRING_CONFIG),
  );

  const totalPct = useDerivedValue(() =>
    withSpring(coverage.totalPercentage / 100, SPRING_CONFIG),
  );

  // Layer 2: Green (certified) fill — from bottom
  const greenFillProps = useAnimatedProps(() => {
    const h = certifiedPct.value * BS;
    return { y: BS - h, height: h };
  });

  // Layer 2.5: Amber (uncertified) fill — stacked above green
  const amberFillProps = useAnimatedProps(() => {
    const greenH = certifiedPct.value * BS;
    const amberH = uncertifiedPct.value * BS;
    return { y: BS - greenH - amberH, height: amberH };
  });

  // Layer 3: Fill gloss — covers total fill height
  const glossProps = useAnimatedProps(() => {
    const h = totalPct.value * BS;
    return { y: BS - h, height: h };
  });

  // Layer 4: Meniscus edge at total fill level
  const edgeLineProps = useAnimatedProps(() => {
    const yPos = BS - totalPct.value * BS;
    return { y1: yPos, y2: yPos };
  });

  // Meniscus color: lighter green when uncertified is the top layer
  const meniscusColor = hasUncertified ? '#BBF7D0' : '#86EFAC';

  // Border + shadow — always green family
  const borderColor = 'rgba(187, 247, 208, 0.5)';
  const shadowStyle = '0px 4px 14px rgba(22, 163, 74, 0.15), 0px 2px 6px rgba(0, 0, 0, 0.08)';

  // Text color — always green-dark
  const textColor = '#14532D';

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const cardContent = (
    <View style={[styles.card, { borderColor, boxShadow: shadowStyle }]}>
      <Svg width={BS} height={BS}>
        <Defs>
          {/* Card background — green-tinted */}
          <LinearGradient id={`${uid}bg`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#F0FDF4" />
            <Stop offset="0.5" stopColor="#ECFDF5" />
            <Stop offset="1" stopColor="#D1FAE5" />
          </LinearGradient>

          {/* Green fill — rich multi-stop (certified) */}
          <LinearGradient id={`${uid}fg`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#4ADE80" />
            <Stop offset="0.35" stopColor="#22C55E" />
            <Stop offset="0.7" stopColor="#1DB954" />
            <Stop offset="1" stopColor="#16A34A" />
          </LinearGradient>

          {/* Striped pattern — diagonal green stripes (uncertified / pending) */}
          <Pattern
            id={`${uid}stripe`}
            patternUnits="userSpaceOnUse"
            width={8}
            height={8}
            patternTransform="rotate(45)"
          >
            <Rect x={0} y={0} width={8} height={8} fill="#BBF7D0" />
            <Line x1={0} y1={0} x2={0} y2={8} stroke="#86EFAC" strokeWidth={3} />
          </Pattern>

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

        {/* ── Layer 2: Animated green fill (certified) ── */}
        {hasCertified && (
          <AnimatedRect x={0} width={BS} fill={`url(#${uid}fg)`} animatedProps={greenFillProps} />
        )}

        {/* ── Layer 2.5: Animated striped fill (uncertified) — stacked above green ── */}
        {hasUncertified && (
          <AnimatedRect x={0} width={BS} fill={`url(#${uid}stripe)`} animatedProps={amberFillProps} />
        )}

        {/* ── Layer 3: Fill gloss overlay ── */}
        <AnimatedRect x={0} width={BS} fill={`url(#${uid}fs)`} animatedProps={glossProps} />

        {/* ── Layer 4: Meniscus line at total fill level ── */}
        <AnimatedLine
          x1={0}
          x2={BS}
          stroke={meniscusColor}
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
          <Text style={[styles.rubNum, { color: textColor }]}>{coverage.rubNumber}</Text>
        </View>

        <View style={styles.infoBar}>
          <Text style={[styles.ayahCount, { color: textColor }]}>
            {totalAyahsTracked}/{coverage.totalAyahs}
          </Text>
          <Text style={[styles.pctLabel, { color: textColor }]}>
            {coverage.totalPercentage}%
          </Text>
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`Rub' ${coverage.rubNumber}`}
      >
        {cardContent}
      </Pressable>
    );
  }

  return cardContent;
}

export const RubBuildingBlock = React.memo(
  RubBuildingBlockInner,
  (prev, next) =>
    prev.coverage.rubNumber === next.coverage.rubNumber &&
    prev.coverage.percentage === next.coverage.percentage &&
    prev.coverage.uncertifiedPercentage === next.coverage.uncertifiedPercentage &&
    prev.coverage.totalPercentage === next.coverage.totalPercentage &&
    prev.onPress === next.onPress,
);

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    width: BLOCK_SIZE,
    height: BLOCK_SIZE,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
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
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  pctLabel: {
    fontFamily: typography.fontFamily.bold,
    fontSize: normalize(14),
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
