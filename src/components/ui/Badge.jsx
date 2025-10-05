import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const Badge = ({
  text,
  variant = 'default',
  size = 'medium',
  style,
  textStyle,
  rounded = true,
}) => {
  const { colors } = useTheme();

  const getBadgeStyle = () => {
    const baseStyle = {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
    };

    const sizeStyles = {
      small: {
        paddingHorizontal: 6,
        paddingVertical: 3,
        minHeight: 20,
      },
      medium: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        minHeight: 24,
      },
      large: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        minHeight: 28,
      },
    };

    const variantStyles = {
      default: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      },
      primary: {
        backgroundColor: colors.primary,
      },
      secondary: {
        backgroundColor: colors.secondary,
      },
      success: {
        backgroundColor: colors.success,
      },
      warning: {
        backgroundColor: colors.warning,
      },
      error: {
        backgroundColor: colors.error,
      },
      info: {
        backgroundColor: colors.info,
      },
    };

    const borderRadiusStyle = rounded
      ? { borderRadius: 16 }
      : { borderRadius: 4 };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...borderRadiusStyle,
      ...style,
    };
  };

  const getTextStyle = () => {
    const baseStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };

    const sizeStyles = {
      small: {
        fontSize: 10,
      },
      medium: {
        fontSize: 12,
      },
      large: {
        fontSize: 14,
      },
    };

    const variantStyles = {
      default: {
        color: colors.text,
      },
      primary: {
        color: 'white',
      },
      secondary: {
        color: 'white',
      },
      success: {
        color: 'white',
      },
      warning: {
        color: 'white',
      },
      error: {
        color: 'white',
      },
      info: {
        color: 'white',
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...textStyle,
    };
  };

  return (
    <View style={getBadgeStyle()}>
      <Text style={getTextStyle()}>{text}</Text>
    </View>
  );
};

export default Badge;