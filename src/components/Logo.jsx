import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const Logo = ({ size = 64, showText = true }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo.png')}
        style={[styles.logoImage, { width: size, height: size }]}
        resizeMode="contain"
      />
      {showText && (
        <View style={styles.textContainer}>
          <Text style={[styles.brandText, { color: colors.text }]}>
            SUBG QUIZ
          </Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Student Unknown's Battle Ground Quiz
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoText: {
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  textContainer: {
    alignItems: 'center',
  },
  brandText: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  logoImage: {
    marginBottom: 8,
  },
});

export default Logo;