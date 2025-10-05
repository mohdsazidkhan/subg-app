import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../contexts/ThemeContext';

const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  helperText,
  disabled = false,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  style,
  inputStyle,
  leftIcon,
  rightIcon,
  onRightIconPress,
  required = false,
  size = 'medium',
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const getContainerStyle = () => {
    const baseStyle = {
      marginBottom: 16,
    };
    return {
      ...baseStyle,
      ...style,
    };
  };

  const getInputContainerStyle = () => {
    const baseStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 12,
      backgroundColor: colors.surface,
      opacity: disabled ? 0.6 : 1,
    };

    const sizeStyles = {
      small: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        minHeight: 40,
      },
      medium: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        minHeight: 48,
      },
      large: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        minHeight: 56,
      },
    };

    const stateStyles = {
      borderColor: error
        ? colors.error
        : isFocused
        ? colors.primary
        : colors.border,
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...stateStyles,
    };
  };

  const getInputStyle = () => {
    const baseStyle = {
      flex: 1,
      color: colors.text,
      fontSize: 16,
    };

    const sizeStyles = {
      small: { fontSize: 14 },
      medium: { fontSize: 16 },
      large: { fontSize: 18 },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...inputStyle,
    };
  };

  const getLabelStyle = () => {
    return {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    };
  };

  const getHelperTextStyle = () => {
    return {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    };
  };

  const getErrorTextStyle = () => {
    return {
      fontSize: 12,
      color: colors.error,
      marginTop: 4,
    };
  };

  const getIconSize = () => {
    const sizeMap = {
      small: 16,
      medium: 20,
      large: 24,
    };
    return sizeMap[size];
  };

  return (
    <View style={getContainerStyle()}>
      {label && (
        <Text style={getLabelStyle()}>
          {label}
          {required && <Text style={{ color: colors.error }}> *</Text>}
        </Text>
      )}

      <View style={getInputContainerStyle()}>
        {leftIcon && (
          <Icon
            name={leftIcon}
            size={getIconSize()}
            color={colors.textSecondary}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={getInputStyle()}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
        />

        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIconContainer}
            disabled={!onRightIconPress}
          >
            <Icon
              name={rightIcon}
              size={getIconSize()}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={getErrorTextStyle()}>{error}</Text>}
      {helperText && !error && (
        <Text style={getHelperTextStyle()}>{helperText}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  leftIcon: {
    marginRight: 8,
  },
  rightIconContainer: {
    marginLeft: 8,
    padding: 4,
  },
});

export default Input;