import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';

const Card = ({
  children,
  style,
  variant = 'default',
  onPress,
  gradientColors,
  padding = 'medium',
  borderRadius = 'medium',
  shadow = true,
}) => {
  const { colors } = useTheme();

  const getCardStyle = () => {
    const baseStyle = {
      backgroundColor: colors.surface,
    };

    const paddingStyles = {
      none: {},
      small: { padding: 8 },
      medium: { padding: 16 },
      large: { padding: 24 },
    };

    const borderRadiusStyles = {
      none: {},
      small: { borderRadius: 8 },
      medium: { borderRadius: 12 },
      large: { borderRadius: 16 },
    };

    const variantStyles = {
      default: {
        backgroundColor: colors.surface,
      },
      elevated: {
        backgroundColor: colors.surface,
        ...(shadow && {
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }),
      },
      outlined: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      },
      gradient: {
        backgroundColor: 'transparent',
      },
    };

    return {
      ...baseStyle,
      ...paddingStyles[padding],
      ...borderRadiusStyles[borderRadius],
      ...variantStyles[variant],
      ...style,
    };
  };

  const getGradientColors = () => {
    if (gradientColors) return gradientColors;
    return variant === 'gradient'
      ? [colors.surface, colors.background]
      : [colors.primary, colors.secondary];
  };

  const CardContent = () => (
    <View style={getCardStyle()}>
      {children}
    </View>
  );

  if (variant === 'gradient') {
    return (
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          getCardStyle(),
          { backgroundColor: 'transparent' },
          style,
        ]}
      >
        {children}
      </LinearGradient>
    );
  }

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={getCardStyle()}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <CardContent />;
};

export default Card;