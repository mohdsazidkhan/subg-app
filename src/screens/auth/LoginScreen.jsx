/**
 * @fileoverview Login Screen for Subg App
 * 
 * This screen handles user authentication including email/phone login,
 * Google authentication, and referral code input.
 * 
 * @author Subg Development Team
 * @version 1.0.0
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

/**
 * Login Screen Component
 * @returns {React.ReactElement} Login screen component
 */
const LoginScreen = () => {
  const navigation = useNavigation();
  const { login, isLoading } = useAuth();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef(null);

  /**
   * Handle login form submission
   */
  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      Alert.alert(t('common.error'), t('errors.loadingFailed'));
      return;
    }

    console.log('Attempting login with:', { identifier: identifier.trim(), hasPassword: !!password });
    
    const success = await login(identifier.trim(), password);
    if (success) {
      // Navigation will be handled by the AuthContext
    }
  };

  /**
   * Handle Google login (placeholder)
   */
  const handleGoogleLogin = () => {
    Alert.alert('Coming Soon', 'Google login will be available soon!');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={colors.backgroundGradient}
          style={styles.header}
        >
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </LinearGradient>

        {/* Login Form */}
        <View style={[styles.formContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.welcomeText, { color: colors.text }]}>
            {t('auth.welcomeBack')}
          </Text>
          <Text style={[styles.subtitleText, { color: colors.textSecondary }]}> 
            {t('auth.readyJourney')}
          </Text>

          {/* Referral Code Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}> 
              {t('auth.referralOptional')}
            </Text>
            <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
              <Icon name="tag" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={referralCode}
                onChangeText={setReferralCode}
                placeholder={t('auth.enterReferral')}
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="characters"
                maxLength={8}
              />
            </View>
          </View>

          {/* Google Login Button */}
          {/* <TouchableOpacity
            style={[styles.googleButton, { borderColor: colors.border }]}
            onPress={handleGoogleLogin}
          >
            <FAIcon name="google" size={20} color={colors.text} />
            <Text style={[styles.googleButtonText, { color: colors.text }]}>
              Sign in with Google
            </Text>
          </TouchableOpacity> */}

          {/* Divider */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textSecondary }]}> 
              {t('auth.continueWithEmail')}
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Email/Phone Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}> 
              {t('auth.emailOrPhone')}
            </Text>
            <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
              <Icon name="email" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={identifier}
                onChangeText={setIdentifier}
                placeholder={t('auth.enterEmailOrPhone')}
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => passwordRef.current && passwordRef.current.focus()}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}> 
              {t('auth.passwordRequiredStar')}
            </Text>
            <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
              <Icon name="lock" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={password}
                onChangeText={setPassword}
                placeholder={t('auth.enterPassword')}
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showPassword}
                ref={passwordRef}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Icon
                  name={showPassword ? 'visibility-off' : 'visibility'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={[styles.forgotPasswordText, { color: colors.primary }]}> 
              {t('auth.forgotPasswordShort')}
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={isLoading ? styles.loginButtonDisabled : styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={styles.loginButtonGradient}
            >
              {isLoading ? (
                <Text style={styles.loginButtonText}>{t('auth.signingIn')}</Text>
              ) : (
                <>
                  <Icon name="login" size={20} color="white" />
                  <Text style={styles.loginButtonText}>{t('auth.signIn')}</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>


          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={[styles.registerText, { color: colors.textSecondary }]}> 
              {t('auth.noAccount')}{' '}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={[styles.registerLink, { color: colors.primary }]}> 
                {t('auth.registerCta')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 15,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 5,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
    height: 50,
    marginBottom: 20,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: 14,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    marginBottom: 20,
  },
  loginButtonDisabled: {
    marginBottom: 20,
    opacity: 0.7,
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    height: 50,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  testButton: {
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  registerText: {
    fontSize: 16,
  },
  registerLink: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
