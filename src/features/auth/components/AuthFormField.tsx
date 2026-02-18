import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Controller, Control, FieldValues, Path, RegisterOptions } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TextField } from '@/components/ui';
import { spacing } from '@/theme';
import type { KeyboardTypeOptions, TextInputProps } from 'react-native';

interface AuthFormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  rules?: RegisterOptions<T>;
}

export const AuthFormField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  rules,
}: AuthFormFieldProps<T>) => {
  const { t } = useTranslation();

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          <TextField
            label={label}
            placeholder={placeholder}
            value={value}
            onChangeText={onChange}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            error={error?.message || (error ? t('common.validationFailed') : undefined)}
          />
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
});
