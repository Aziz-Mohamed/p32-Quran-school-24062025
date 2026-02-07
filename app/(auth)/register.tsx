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
import { useRegister } from '@/features/auth/hooks/useRegister';
import type { UserRole } from '@/types/common.types';
import { typography } from '@/theme/typography';
import { lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';

// ─── Validation Schema ────────────────────────────────────────────────────────

const registerSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
    fullName: z.string().min(2),
    role: z.enum(['student', 'teacher', 'parent', 'admin']),
    schoolId: z.string().uuid(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// ─── Register Screen ──────────────────────────────────────────────────────────

export default function RegisterScreen() {
  const { t } = useTranslation();
  const { mutate: register, isPending } = useRegister();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      role: 'student',
      schoolId: '00000000-0000-0000-0000-000000000001', // MVP: Single school
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    setErrorMessage(null);
    register(data, {
      onError: (error) => {
        setErrorMessage(error.message || t('auth.registerError'));
      },
    });
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setValue('role', role);
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>{t('auth.register')}</Text>
        <Text style={styles.subtitle}>{t('auth.registerSubtitle')}</Text>

        {errorMessage && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        <View style={styles.form}>
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, value } }) => (
              <TextField
                label={t('auth.fullName')}
                placeholder={t('auth.fullNamePlaceholder')}
                value={value}
                onChangeText={onChange}
                error={errors.fullName?.message}
              />
            )}
          />

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

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <TextField
                label={t('auth.confirmPassword')}
                placeholder={t('auth.confirmPasswordPlaceholder')}
                value={value}
                onChangeText={onChange}
                secureTextEntry
                error={errors.confirmPassword?.message}
              />
            )}
          />

          <View style={styles.roleSection}>
            <Text style={styles.roleLabel}>{t('auth.selectRole')}</Text>
            <View style={styles.roleButtons}>
              {(['student', 'teacher', 'parent'] as UserRole[]).map((role) => (
                <Pressable
                  key={role}
                  style={[
                    styles.roleButton,
                    selectedRole === role && styles.roleButtonActive,
                  ]}
                  onPress={() => handleRoleSelect(role)}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      selectedRole === role && styles.roleButtonTextActive,
                    ]}
                  >
                    {t(`auth.role.${role}`)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Button
            title={t('auth.register')}
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
            loading={isPending}
            style={styles.button}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('auth.haveAccount')}</Text>
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
  roleSection: {
    gap: spacing.sm,
  },
  roleLabel: {
    ...typography.label,
    color: lightTheme.text,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  roleButton: {
    flex: 1,
    paddingBlock: spacing.sm,
    paddingInline: spacing.base,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: lightTheme.border,
    backgroundColor: lightTheme.background,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: lightTheme.primary,
    borderColor: lightTheme.primary,
  },
  roleButtonText: {
    ...typography.caption,
    color: lightTheme.text,
  },
  roleButtonTextActive: {
    color: '#FFFFFF',
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
