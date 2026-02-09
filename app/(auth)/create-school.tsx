import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Screen } from '@/components/layout';
import { TextField } from '@/components/ui';
import { Button } from '@/components/ui';
import { authService } from '@/features/auth/services/auth.service';
import { useAuthStore, type Profile } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { generateUsername } from '@/lib/username';
import { typography } from '@/theme/typography';
import { lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';

// ─── Validation Schema ────────────────────────────────────────────────────────

const createSchoolSchema = z.object({
  schoolName: z.string().min(2, 'School name must be at least 2 characters'),
  adminFullName: z.string().min(2, 'Full name must be at least 2 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, and underscores'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type CreateSchoolFormData = z.infer<typeof createSchoolSchema>;

// ─── Create School Screen ─────────────────────────────────────────────────────

export default function CreateSchoolScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setSchoolSlug = useAuthStore((s) => s.setSchoolSlug);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateSchoolFormData>({
    resolver: zodResolver(createSchoolSchema),
    defaultValues: {
      schoolName: '',
      adminFullName: '',
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: CreateSchoolFormData) => {
    setIsLoading(true);
    setErrorMessage(null);

    const result = await authService.createSchool(data);

    if (result.error) {
      setErrorMessage(result.error.message);
      setIsLoading(false);
      return;
    }

    if (result.data) {
      // Store the school slug for future logins
      setSchoolSlug(result.data.school.slug);

      // Get session from Supabase client (was set by createSchool)
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        setSession(sessionData.session);

        // Fetch full profile
        const profileResult = await authService.getProfile(sessionData.session.user.id);
        if (profileResult.data) {
          setProfile(profileResult.data as Profile);
        }
      }
    }

    setIsLoading(false);
    // AuthGuard will redirect to admin dashboard
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>{t('auth.createSchool')}</Text>
        <Text style={styles.subtitle}>{t('auth.createSchoolSubtitle')}</Text>

        {errorMessage && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        <View style={styles.form}>
          <Controller
            control={control}
            name="schoolName"
            render={({ field: { onChange, value } }) => (
              <TextField
                label={t('auth.schoolName')}
                placeholder={t('auth.schoolNamePlaceholder')}
                value={value}
                onChangeText={onChange}
                error={errors.schoolName?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="adminFullName"
            render={({ field: { onChange, value } }) => (
              <TextField
                label={t('auth.fullName')}
                placeholder={t('auth.fullNamePlaceholder')}
                value={value}
                onChangeText={(text) => {
                  onChange(text);
                  if (text.trim().length >= 2) {
                    setValue('username', generateUsername(text), { shouldValidate: true });
                  }
                }}
                error={errors.adminFullName?.message}
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
            title={t('auth.createSchoolButton')}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            loading={isLoading}
            fullWidth
            style={styles.button}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('auth.alreadyHaveSchool')}</Text>
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text style={styles.loginLink}>{t('auth.signIn')}</Text>
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
  loginLink: {
    ...typography.textStyles.label,
    color: lightTheme.primary,
  },
});
