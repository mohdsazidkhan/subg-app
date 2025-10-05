/**
 * @fileoverview App Navigator for Subg App
 * 
 * This file defines the main navigation structure including
 * authentication flow, tab navigation, and screen routing.
 * 
 * @author Subg Development Team
 * @version 1.0.0
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import HomeScreen from '../screens/main/HomeScreen';
import SearchScreen from '../screens/main/SearchScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import QuizScreen from '../screens/quiz/QuizScreen';
import AttemptQuizScreen from '../screens/quiz/AttemptQuizScreen';
import QuizResultScreen from '../screens/quiz/QuizResultScreen';
import PayUSuccessScreen from '../screens/payment/PayUSuccessScreen';
import PayUFailureScreen from '../screens/payment/PayUFailureScreen';
import LevelDetailScreen from '../screens/levels/LevelDetailScreen';
import CategoryDetailScreen from '../screens/categories/CategoryDetailScreen';
import SubcategoryDetailScreen from '../screens/categories/SubcategoryDetailScreen';
import SubscriptionScreen from '../screens/subscription/SubscriptionScreen';

// New Screens
import ArticlesScreen from '../screens/articles/ArticlesScreen';
import ArticleDetailScreen from '../screens/articles/ArticleDetailScreen';
import PublicQuestionsScreen from '../screens/questions/PublicQuestionsScreen';
import PostQuestionScreen from '../screens/pro/PostQuestionScreen';
import MyQuestionsScreen from '../screens/pro/MyQuestionsScreen';
import LandingScreen from '../screens/marketing/LandingScreen';
import HowItWorksScreen from '../screens/marketing/HowItWorksScreen';
import ContactUsScreen from '../screens/marketing/ContactUsScreen';
import AboutUsScreen from '../screens/marketing/AboutUsScreen';
import TermsScreen from '../screens/marketing/TermsScreen';
import PrivacyScreen from '../screens/marketing/PrivacyScreen';
import RefundScreen from '../screens/marketing/RefundScreen';
import MoreScreen from '../screens/main/MoreScreen';

// Components
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Get tab bar icon for route
 * @param {string} routeName - Name of the route
 * @param {string} color - Icon color
 * @param {number} size - Icon size
 * @returns {React.ReactElement} Icon component
 */
function getTabBarIcon(routeName, color, size) {
  let iconName;
  switch (routeName) {
    case 'Home':
      iconName = 'home';
      break;
    case 'PublicQuestions':
      iconName = 'quiz';
      break;
    case 'PostQuestion':
      iconName = 'add-circle';
      break;
    case 'Search':
      iconName = 'search';
      break;
    case 'Profile':
      iconName = 'person';
      break;
    case 'More':
      iconName = 'menu';
      break;
    default:
      iconName = 'help';
  }
  return <Icon name={iconName} size={size} color={color} />;
}

/**
 * Authentication Stack Navigator
 * Handles login, register, forgot password screens
 * @returns {React.ReactElement} Auth stack navigator
 */
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}

/**
 * Main Tab Navigator
 * Shows bottom navigation for authenticated users
 * @returns {React.ReactElement} Tab navigator
 */
function MainTabs() {
  const { colors } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => getTabBarIcon(route.name, color, size),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarLabel: 'Home' }} 
      />
      <Tab.Screen 
        name="PublicQuestions" 
        component={PublicQuestionsScreen} 
        options={{ tabBarLabel: 'Questions' }} 
      />
      <Tab.Screen 
        name="PostQuestion" 
        component={PostQuestionScreen} 
        options={{ tabBarLabel: 'Post Question' }} 
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen} 
        options={{ tabBarLabel: 'Search' }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarLabel: 'Profile' }} 
      />
      <Tab.Screen 
        name="More" 
        component={MoreScreen} 
        options={{ tabBarLabel: 'More' }} 
      />
    </Tab.Navigator>
  );
}

/**
 * Main App Navigator
 * Unified navigation that handles authentication flow and main app navigation
 * @returns {React.ReactElement} Main app navigator
 */
function AppNavigator() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
      }}
    >
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Auth" component={AuthStack} />
        </>
      ) : (
        <Stack.Screen name="MainTabs" component={MainTabs} />
      )}
      
      <Stack.Screen 
        name="Quiz" 
        component={QuizScreen} 
        options={{ presentation: 'modal' }} 
      />
      <Stack.Screen 
        name="AttemptQuiz" 
        component={AttemptQuizScreen} 
        options={{ presentation: 'modal' }} 
      />
      <Stack.Screen 
        name="QuizResult" 
        component={QuizResultScreen} 
        options={{ presentation: 'modal' }} 
      />
      <Stack.Screen 
        name="PayUSuccess" 
        component={PayUSuccessScreen} 
        options={{ presentation: 'modal' }} 
      />
      <Stack.Screen 
        name="PayUFailure" 
        component={PayUFailureScreen} 
        options={{ presentation: 'modal' }} 
      />
      <Stack.Screen name="LevelDetail" component={LevelDetailScreen} />
      <Stack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
      <Stack.Screen name="SubcategoryDetail" component={SubcategoryDetailScreen} />
      <Stack.Screen name="Articles" component={ArticlesScreen} />
      <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
      <Stack.Screen name="PublicQuestions" component={PublicQuestionsScreen} />
      <Stack.Screen name="PostQuestion" component={PostQuestionScreen} />
      <Stack.Screen name="MyQuestions" component={MyQuestionsScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen name="HowItWorks" component={HowItWorksScreen} />
      <Stack.Screen name="AboutUs" component={AboutUsScreen} />
      <Stack.Screen name="ContactUs" component={ContactUsScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="Refund" component={RefundScreen} />
    </Stack.Navigator>
  );
}

export default AppNavigator;
