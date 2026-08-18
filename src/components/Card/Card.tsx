import React, {PropsWithChildren} from 'react';
import {StyleSheet, View} from 'react-native';

import {colors, radius, spacing} from '../../theme';

type CardProps = PropsWithChildren<{
  elevated?: boolean;
}>;

const Card = ({children, elevated = false}: CardProps) => {
  return (
    <View style={[styles.container, elevated && styles.elevated]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },

  elevated: {
    backgroundColor: colors.surfaceElevated,
  },
});

export default Card;