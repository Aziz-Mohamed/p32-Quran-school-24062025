import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CartesianChart, Line } from 'victory-native';

import { semantic } from '@/theme/colors';
import { normalize } from '@/theme/normalize';

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

export function Sparkline({
  data,
  color = semantic.success,
  width,
  height = normalize(60),
}: SparklineProps) {
  if (data.length < 2) return null;

  const chartData = data.map((value, index) => ({ x: index, y: value }));

  return (
    <View style={[styles.container, { height }, width ? { width } : undefined]}>
      <CartesianChart
        data={chartData}
        xKey="x"
        yKeys={['y']}
        padding={0}
        domainPadding={{ top: 4, bottom: 4 }}
        axisOptions={{ display: false } as any}
      >
        {({ points }) => (
          <Line
            points={points.y}
            color={color}
            strokeWidth={2}
            curveType="natural"
          />
        )}
      </CartesianChart>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
