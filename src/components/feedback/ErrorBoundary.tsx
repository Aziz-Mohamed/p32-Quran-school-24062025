import React, { Component, type ReactNode } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '@/components/ui/Button';
import { typography } from '@/theme/typography';
import { lightTheme, semantic } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * React error boundary that catches rendering errors
 * and displays a friendly fallback UI with retry.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Ionicons name="warning-outline" size={48} color={semantic.error} />
          <Text style={styles.title}>
            {this.props.fallbackTitle ?? 'Something went wrong'}
          </Text>
          <Text style={styles.description}>
            {this.props.fallbackDescription ?? this.state.error?.message ?? 'An unexpected error occurred'}
          </Text>
          <Button
            title="Try Again"
            onPress={this.handleRetry}
            variant="primary"
            size="md"
          />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
    backgroundColor: lightTheme.background,
  },
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
    textAlign: 'center',
  },
  description: {
    ...typography.textStyles.body,
    color: lightTheme.textSecondary,
    textAlign: 'center',
  },
});
