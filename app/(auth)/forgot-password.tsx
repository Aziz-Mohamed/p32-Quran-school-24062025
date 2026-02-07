import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Screen } from '@/components/layout';
import { TextField } from '@/components/forms';
import { Button } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { typography } from '@/theme/typography';
import { lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';

// ─── Validation Schema ────────────────────────────────────────────────────────

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// ─── Forgot Password Screen ───────────────────────────────────────────────────

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: 'quranschool://reset-password',
    });

    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message || t('auth.resetPasswordError'));
    } else {
      setSuccessMessage(t('auth.resetPasswordSuccess'));
    }
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>{t('auth.forgotPassword')}</Text>
        <Text style={styles.subtitle}>{t('auth.forgotPasswordSubtitle')}</Text>

        {successMessage && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        )}

        {errorMessage && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        <View style={styles.form}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <TextField
                label={t('auth.email')}
                placeholder={t('auth.emailPlaceholder')}
                value={value}
                onChangeText={onChange}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email?.message}
              />
            )}
          />

          <Button
            title={t('auth.sendResetLink')}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            loading={isLoading}
            style={styles.button}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('auth.rememberPassword')}</Text>
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text style={styles.loginLink}>{t('auth.login')}</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </Screen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBlockStart: spacing.xl * 2,
  },
  title: {
    ...typography.heading1,
    color: lightTheme.text,
    marginBlockEnd: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: lightTheme.textSecondary,
    marginBlockEnd: spacing.xl,
  },
  form: {
    gap: spacing.base,
  },
  successContainer: {
    backgroundColor: lightTheme.success + '20',
    paddingBlock: spacing.sm,
    paddingInline: spacing.base,
    borderRadius: radius.sm,
    marginBlockEnd: spacing.base,
  },
  successText: {
    ...typography.caption,
    color: lightTheme.success,
  },
  errorContainer: {
    backgroundColor: lightTheme.error + '20',
    paddingBlock: spacing.sm,
    paddingInline: spacing.base,
    borderRadius: radius.sm,
    marginBlockEnd: spacing.base,
  },
  errorText: {
    ...typography.caption,
    color: lightTheme.error,
  },
  button: {
    marginBlockStart: spacing.base,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBlockStart: spacing.xl,
    gap: spacing.xs,
  },
  footerText: {
    ...typography.body,
    color: lightTheme.textSecondary,
  },
  loginLink: {
    ...typography.label,
    color: lightTheme.primary,
  },
});
