/**
 * SUBG Quiz Mobile App
 * React Native App with Navigation
 */

import React from 'react';
// ErrorBoundary to catch and display React child errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
  }
  render() {
    if (this.state.error) {
      return (
        <ScrollView contentContainerStyle={{ flex: 1, padding: 20, justifyContent: 'center' }}>
          <View style={{ padding: 16, borderRadius: 8, backgroundColor: '#fff' }}>
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8, color: '#000' }}>
              Render Error
            </Text>
            <Text style={{ marginBottom: 12, color: '#333' }}>{this.state.error.toString()}</Text>
            {this.state.errorInfo && (
              <Text style={{ color: '#555', fontSize: 12 }}>
                {this.state.errorInfo.componentStack}
              </Text>
            )}
          </View>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}
import { StatusBar, useColorScheme, StyleSheet, View, Text, ScrollView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import FlashMessage from 'react-native-flash-message';

import './src/i18n'; // Initialize i18n
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { NetworkProvider } from './src/contexts/NetworkContext';

function App(){
  const isDarkMode = useColorScheme() === 'dark';
  // Runtime diagnostics: validate that the things we import are renderable components
  const importedThings = {
    GestureHandlerRootView,
    SafeAreaProvider,
    NetworkProvider,
    LanguageProvider,
    ThemeProvider,
    AuthProvider,
    NavigationContainer,
    AppNavigator,
    FlashMessage,
  };

  const invalid = Object.entries(importedThings).filter(([name, value]) => {
    // Valid if it's a function (functional/class component) or a valid React element type
    const t = typeof value;
    // Some components may be objects (e.g. { default: ... }) which is invalid
    const looksLikeComponent = t === 'function' || (t === 'object' && value !== null && (value.$$typeof || value.render));
    return !looksLikeComponent;
  });

  // Wrap the app in the error boundary
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaProvider>
          <NetworkProvider>
            <LanguageProvider>
              <ThemeProvider>
                <AuthProvider>
                  <NavigationContainer>
                    <StatusBar 
                      barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
                      backgroundColor={isDarkMode ? '#1a1a1a' : '#ffffff'}
                    />
                    <AppNavigator />
                    <FlashMessage position="top" />
                  </NavigationContainer>
                </AuthProvider>
              </ThemeProvider>
            </LanguageProvider>
          </NetworkProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <NetworkProvider>
          <LanguageProvider>
            <ThemeProvider>
              <AuthProvider>
                <NavigationContainer>
                  <StatusBar 
                    barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
                    backgroundColor={isDarkMode ? '#1a1a1a' : '#ffffff'}
                  />
                  <AppNavigator />
                  <FlashMessage position="top" />
                </NavigationContainer>
              </AuthProvider>
            </ThemeProvider>
          </LanguageProvider>
        </NetworkProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
