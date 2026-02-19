import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Image } from 'react-native';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Screen } from '@/components/layout';
import { TextField } from '@/components/ui';
import { Button } from '@/components/ui';
import { LanguageToggleButton } from '@/components/ui/LanguageToggleButton';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { useAuthStore } from '@/stores/authStore';
import { typography } from '@/theme/typography';
import { lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { normalize } from '@/theme/normalize';

// ─── Dev Quick Login ──────────────────────────────────────────────────────────

const DEV_ACCOUNTS = [
  { label: 'Admin', role: 'admin' as const, username: 'aliomar', schoolSlug: 'ahl-elquran', password: 'Test#123', color: '#8B5CF6' },
  { label: 'Teacher', role: 'teacher' as const, username: 'teacher_123', schoolSlug: 'ahl-elquran', password: 'Test#123', color: '#3B82F6' },
  { label: 'Student', role: 'student' as const, username: 'student_123', schoolSlug: 'ahl-elquran', password: 'Test#123', color: '#10B981' },
  { label: 'Parent', role: 'parent' as const, username: 'parent_123', schoolSlug: 'ahl-elquran', password: 'Test#123', color: '#F59E0B' },
] as const;

// ─── Validation Schema ────────────────────────────────────────────────────────

const createLoginSchema = (t: (key: string) => string) =>
  z.object({
    schoolSlug: z.string().min(1, t('auth.validation.schoolCodeRequired')),
    username: z.string().min(1, t('auth.validation.usernameRequired')),
    password: z.string().min(6, t('auth.validation.passwordMin')),
  });

type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;

// ─── Login Screen ─────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const { t } = useTranslation();
  const { mutate: login, isPending } = useLogin();
  const schoolSlug = useAuthStore((s) => s.schoolSlug);
  const setSchoolSlug = useAuthStore((s) => s.setSchoolSlug);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginSchema = createLoginSchema(t);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      schoolSlug: schoolSlug ?? '',
      username: '',
      password: '',
    },
  });

  const quickLogin = (account: (typeof DEV_ACCOUNTS)[number]) => {
    setErrorMessage(null);
    setSchoolSlug(account.schoolSlug);
    login(
      { schoolSlug: account.schoolSlug, username: account.username, password: account.password },
      {
        onError: (error) => {
          setErrorMessage(error.message || t('auth.loginError'));
        },
      },
    );
  };

  const onSubmit = (data: LoginFormData) => {
    setErrorMessage(null);
    setSchoolSlug(data.schoolSlug);
    login(data, {
      onError: (error) => {
        setErrorMessage(error.message || t('auth.loginError'));
      },
    });
  };

  return (
    <Screen>
      <View style={styles.container}>
        <LanguageToggleButton />

        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/app-icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

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
            name="schoolSlug"
            render={({ field: { onChange, value } }) => (
              <TextField
                label={t('auth.schoolCode')}
                placeholder={t('auth.schoolCodePlaceholder')}
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                error={errors.schoolSlug?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, value } }) => (
              <TextField
                label={t('auth.username')}
                placeholder={t('auth.usernamePlaceholder')}
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                error={errors.username?.message}
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

          <Button
            title={t('auth.signIn')}
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
            loading={isPending}
            fullWidth
            style={styles.button}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('auth.noSchool')}</Text>
          <Link href="/(auth)/create-school" asChild>
            <Pressable>
              <Text style={styles.createLink}>{t('auth.createSchool')}</Text>
            </Pressable>
          </Link>
        </View>

      </View>

      <View style={styles.devSection}>
        <View style={styles.devPills}>
          {DEV_ACCOUNTS.map((account) => (
            <Pressable
              key={account.role}
              style={[styles.devPill, { borderColor: account.color }]}
              onPress={() => quickLogin(account)}
              disabled={isPending}
            >
              <View style={[styles.devDot, { backgroundColor: account.color }]} />
              <Text style={styles.devPillText}>{account.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBlockStart: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBlockEnd: spacing.xl,
  },
  logo: {
    width: normalize(100),
    height: normalize(100),
  },
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
    marginBlockEnd: spacing.xs,
  },
  subtitle: {
    ...typography.textStyles.body,
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
    ...typography.textStyles.caption,
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
    ...typography.textStyles.body,
    color: lightTheme.textSecondary,
  },
  createLink: {
    ...typography.textStyles.label,
    color: lightTheme.primary,
  },
  devSection: {
    paddingBlockEnd: spacing.base,
    alignItems: 'center',
  },
  devPills: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  devPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingBlock: normalize(6),
    paddingInline: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: lightTheme.border,
  },
  devDot: {
    width: normalize(6),
    height: normalize(6),
    borderRadius: normalize(3),
  },
  devPillText: {
    fontSize: normalize(11),
    color: lightTheme.textSecondary,
  },
});
