import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';

import {
  colors,
  radius,
  spacing,
  typography,
} from '../../theme';

type ButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

const Button = ({
  title,
  onPress,
  loading = false,
  disabled = false,
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.container,
        pressed &&
          !isDisabled &&
          styles.pressed,
        isDisabled && styles.disabled,
      ]}>

      <Text
        style={[
          styles.title,
          isDisabled && styles.disabledTitle,
        ]}>
        {loading ? '' : title}
      </Text>

      {loading && (
        <ActivityIndicator
          size="small"
          color={colors.white}
          style={styles.loader}
        />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 50,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: radius.lg,

    backgroundColor: colors.primary,

    borderWidth: 1,
    borderColor: colors.primaryBorder,

    paddingHorizontal: spacing.xl,

    /*
     * Premium depth
     */
    shadowColor: colors.primaryShadow,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.20,
    shadowRadius: 10,

    elevation: 4,
  },

  pressed: {
    backgroundColor: colors.primaryPressed,

    transform: [
      {
        scale: 0.98,
      },
    ],

    shadowOpacity: 0.10,
    elevation: 2,
  },

  disabled: {
    opacity: 0.45,
    shadowOpacity: 0,
    elevation: 0,
  },

  title: {
    color: colors.white,

    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,

    fontWeight: '700',

    letterSpacing: 0.15,
  },

  disabledTitle: {
    color: colors.white,
  },

  loader: {
    position: 'absolute',
  },
});

export default Button;