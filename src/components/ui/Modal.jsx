import React from 'react';
import {
  Modal as RNModal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../contexts/ThemeContext';

const Modal = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  transparent = true,
  animationType = 'slide',
  style,
  contentStyle,
}) => {
  const { colors } = useTheme();

  const getModalStyle = () => {
    const baseStyle = {
      backgroundColor: colors.surface,
      borderRadius: 16,
      maxHeight: '80%',
    };

    return {
      ...baseStyle,
      ...style,
    };
  };

  const getContentStyle = () => {
    return {
      padding: 20,
      ...contentStyle,
    };
  };

  return (
    <RNModal
      visible={visible}
      transparent={transparent}
      animationType={animationType}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={getModalStyle()}>
          {(title || showCloseButton) && (
            <View style={styles.header}>
              {title && (
                <Text style={[styles.title, { color: colors.text }]}>
                  {title}
                </Text>
              )}
              {showCloseButton && (
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                >
                  <Icon name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          )}
          <View style={getContentStyle()}>{children}</View>
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
});

export default Modal;