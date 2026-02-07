import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Screen } from '@/components/layout';
import { TextField } from '@/components/forms';
import { Button } from '@/components/ui';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { typography } from '@/theme/typography';
import { lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';

// ─── Validation Schema ────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ─── Login Screen ─────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const { t } = useTranslation();
  const { mutate: login, isPending } = useLogin();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setErrorMessage(null);
    login(data, {
      onError: (error) => {
        setErrorMessage(error.message || t('auth.loginError'));
      },
    });
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>{t('auth.login')}</Text>
        <Text style={styles.subtitle}>{t('auth.loginSubtitle')}</Text>

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

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <TextField
                label={t('auth.password')}
                placeholder={t('auth.passwordPlaceholder')}
                value={value}
                onChangeText={onChange}
                secureTextEntry
                error={errors.password?.message}
              />
            )}
          />

          <Link href="/(auth)/forgot-password" asChild>
            <Pressable style={styles.forgotLink}>
              <Text style={styles.forgotText}>{t('auth.forgotPassword')}</Text>
            </Pressable>
          </Link>

          <Button
            title={t('auth.login')}
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
            loading={isPending}
            style={styles.button}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('auth.noAccount')}</Text>
          <Link href="/(auth)/register" asChild>
            <Pressable>
              <Text style={styles.signupLink}>{t('auth.signUp')}</Text>
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
  forgotLink: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    ...typography.caption,
    color: lightTheme.primary,
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
  signupLink: {
    ...typography.label,
    color: lightTheme.primary,
  },
});
