import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import {colors, radius, spacing, typography} from '../../theme';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
};

const Input = ({label, error, ...textInputProps}: InputProps) => {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <TextInput
        placeholderTextColor={colors.textMuted}
        {...textInputProps}
        style={[styles.input, error && styles.inputError]}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },

  label: {
    color: colors.textSecondary,
    fontSize: typography.size.sm,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },

  input: {
    minHeight: 52,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    fontSize: typography.size.md,
    paddingHorizontal: spacing.lg,
  },

  inputError: {
    borderColor: colors.danger,
  },

  error: {
    color: colors.danger,
    fontSize: typography.size.xs,
    marginTop: spacing.xs,
  },
});

export default Input;