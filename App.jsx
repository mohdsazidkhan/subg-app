/**
 * SUBG Quiz Mobile App
 * React Native App with Navigation
 */

import React from 'react';
import { StatusBar, useColorScheme, StyleSheet } from 'react-native';
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
