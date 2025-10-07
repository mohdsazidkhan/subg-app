import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../contexts/ThemeContext';

const TopBar = ({
  title,
  showBackButton = false,
  showMenuButton = false,
  showLanguageToggle = false,
  showThemeToggle = false,
  rightIcon,
  onBackPress,
  onMenuPress,
  onRightIconPress,
  onLanguageToggle,
  onThemeToggle,
}) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.surface}
      />
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.surface,
            paddingTop: insets.top,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.content}>
          {/* Left side */}
          <View style={styles.leftContainer}>
            {showBackButton ? (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={onBackPress}
                activeOpacity={0.7}
              >
                <Icon name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
            ) : showMenuButton ? (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={onMenuPress}
                activeOpacity={0.7}
              >
                <Icon name="menu" size={24} color={colors.text} />
              </TouchableOpacity>
            ) : (
              <Image
                source={require('../assets/logo.png')}
                style={[styles.logoImage]}
                resizeMode="contain"
              />
            )}
          </View>

          {/* Title */}
          {title && (
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: colors.text }]}>
                {title}
              </Text>
            </View>
          )}

          {/* Right side */}
          <View style={styles.rightContainer}>
            {showThemeToggle && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={onThemeToggle}
                activeOpacity={0.7}
              >
                <Icon
                  name={isDark ? 'light-mode' : 'dark-mode'}
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
            )}
            {showLanguageToggle && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={onLanguageToggle}
                activeOpacity={0.7}
              >
                <Icon name="language" size={24} color={colors.text} />
              </TouchableOpacity>
            )}
            {rightIcon && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={onRightIconPress}
                activeOpacity={0.7}
              >
                <Icon name={rightIcon} size={24} color={colors.text} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 40,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 40,
    justifyContent: 'flex-end',
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
});

export default TopBar;