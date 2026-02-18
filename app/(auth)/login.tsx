import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Screen } from '@/components/layout';
import { TextField } from '@/components/ui';
import { Button } from '@/components/ui';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { useAuthStore } from '@/stores/authStore';
import { typography } from '@/theme/typography';
import { lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';

// ─── Validation Schema ────────────────────────────────────────────────────────

const loginSchema = z.object({
  schoolSlug: z.string().min(1, 'School code is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ─── Login Screen ─────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const { t } = useTranslation();
  const { mutate: login, isPending } = useLogin();
  const schoolSlug = useAuthStore((s) => s.schoolSlug);
  const setSchoolSlug = useAuthStore((s) => s.setSchoolSlug);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      schoolSlug: schoolSlug ?? '',
      username: '',
      password: '',
    },
  });

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
});
