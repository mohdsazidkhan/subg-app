/**
 * @fileoverview App Navigator for Subg App
 * 
 * This file defines the main navigation structure including
 * authentication flow, tab navigation, and screen routing.
 * 
 * @author Subg Development Team
 * @version 1.0.0
 */

import React, { useState, useCallback } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
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
import CreateUserQuizScreen from '../screens/pro/CreateUserQuizScreen';
import LandingScreen from '../screens/marketing/LandingScreen';
import HowItWorksScreen from '../screens/marketing/HowItWorksScreen';
import ContactUsScreen from '../screens/marketing/ContactUsScreen';
import AboutUsScreen from '../screens/marketing/AboutUsScreen';
import TermsScreen from '../screens/marketing/TermsScreen';
import PrivacyScreen from '../screens/marketing/PrivacyScreen';
import RefundScreen from '../screens/marketing/RefundScreen';
import MoreScreen from '../screens/main/MoreScreen';
import PublicProfileScreen from '../screens/profile/PublicProfileScreen';
import FollowersListScreen from '../screens/profile/FollowersListScreen';
import FollowingListScreen from '../screens/profile/FollowingListScreen';
import UserSearchScreen from '../screens/profile/UserSearchScreen';

// Components
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import BottomSheetCreate from '../components/ui/BottomSheetCreate';
import TopBar from '../components/TopBar';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const QuestionsStack = createStackNavigator();
const PostStack = createStackNavigator();
const SearchStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const MoreStack = createStackNavigator();
const PlansStack = createStackNavigator();

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
    case 'Plans':
      iconName = 'workspace-premium';
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

// Home stack to keep bottom tabs visible on inner pages opened from Home
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator 
      screenOptions={{ 
        headerShown: false,
        gestureEnabled: false,
        gestureDirection: 'horizontal'
      }}
    >
      <HomeStack.Screen name="HomeRoot" component={HomeScreen} />
      <HomeStack.Screen name="LevelDetail" component={LevelDetailScreen} />
      <HomeStack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
      <HomeStack.Screen name="SubcategoryDetail" component={SubcategoryDetailScreen} />
      <HomeStack.Screen name="Articles" component={ArticlesScreen} />
      <HomeStack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
    </HomeStack.Navigator>
  );
}

function QuestionsStackNavigator() {
  return (
    <QuestionsStack.Navigator 
      screenOptions={{ 
        headerShown: false,
        gestureEnabled: false,
        gestureDirection: 'horizontal'
      }}
    >
      <QuestionsStack.Screen name="QuestionsRoot" component={PublicQuestionsScreen} options={{ headerShown: false }} />
    </QuestionsStack.Navigator>
  );
}

function PostStackNavigator() {
  return (
    <PostStack.Navigator 
      screenOptions={{ 
        headerShown: false,
        gestureEnabled: false,
        gestureDirection: 'horizontal'
      }}
    >
      <PostStack.Screen name="PostRoot" component={PostQuestionScreen} options={{ headerShown: false }} />
      <PostStack.Screen name="MyQuestions" component={MyQuestionsScreen} options={{ headerShown: false }} />
      <PostStack.Screen name="CreateUserQuiz" component={CreateUserQuizScreen} options={{ headerShown: false }} />
    </PostStack.Navigator>
  );
}

function SearchStackNavigator() {
  return (
    <SearchStack.Navigator 
      screenOptions={{ 
        headerShown: false,
        gestureEnabled: false,
        gestureDirection: 'horizontal'
      }}
    >
      <SearchStack.Screen name="SearchRoot" component={SearchScreen} options={{ headerShown: false }} />
    </SearchStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator 
      screenOptions={{ 
        headerShown: false,
        gestureEnabled: false,
        gestureDirection: 'horizontal'
      }}
    >
      <ProfileStack.Screen name="ProfileRoot" component={ProfileScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name="PublicProfile" component={PublicProfileScreen} />
      <ProfileStack.Screen name="FollowersList" component={FollowersListScreen} />
      <ProfileStack.Screen name="FollowingList" component={FollowingListScreen} />
      <ProfileStack.Screen name="UserSearch" component={UserSearchScreen} />
    </ProfileStack.Navigator>
  );
}

function MoreStackNavigator() {
  return (
    <MoreStack.Navigator 
      screenOptions={{ 
        headerShown: false,
        gestureEnabled: false,
        gestureDirection: 'horizontal'
      }}
    >
      <MoreStack.Screen name="MoreRoot" component={MoreScreen} options={{ headerShown: false }} />
      <MoreStack.Screen name="Subscription" component={SubscriptionScreen} />
      <MoreStack.Screen name="HowItWorks" component={HowItWorksScreen} />
      <MoreStack.Screen name="AboutUs" component={AboutUsScreen} />
      <MoreStack.Screen name="ContactUs" component={ContactUsScreen} />
      <MoreStack.Screen name="Terms" component={TermsScreen} />
      <MoreStack.Screen name="Privacy" component={PrivacyScreen} />
      <MoreStack.Screen name="Refund" component={RefundScreen} />
    </MoreStack.Navigator>
  );
}

function PlansStackNavigator() {
  return (
    <PlansStack.Navigator 
      screenOptions={{ 
        headerShown: false,
        gestureEnabled: false,
        gestureDirection: 'horizontal'
      }}
    >
      {/* Directly show subscription plans page */}
      <PlansStack.Screen name="PlansRoot" component={SubscriptionScreen} />
    </PlansStack.Navigator>
  );
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
        gestureEnabled: false,
        gestureDirection: 'horizontal'
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
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  
  // Check if user can create quiz/question
  const canCreate = useCallback(() => {
    // Any user with active paid subscription can create
    if (!user || !user?.subscriptionStatus) {
      return false;
    }
    
    const paidPlans = ['basic', 'premium', 'pro'];
    if (!paidPlans.includes(user.subscriptionStatus.toLowerCase())) {
      return false;
    }
    
    // Check if subscription is expired
    if (user.subscriptionExpiry) {
      const now = new Date();
      const expiryDate = new Date(user.subscriptionExpiry);
      if (expiryDate < now) {
        return false; // Subscription expired
      }
    }
    
    return true;
  }, [user]);
  
  const openCreate = useCallback(() => {
    if (canCreate()) {
      setShowCreate(true);
    }
  }, [canCreate]);
  
  const closeCreate = useCallback(() => setShowCreate(false), []);
  const navigation = useNavigation();
  const StackNav = Stack; // access for navigate via screen props in callbacks if needed
  
  return (
    <>
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
        component={HomeStackNavigator} 
        options={{ tabBarLabel: 'Home' }} 
      />
      <Tab.Screen 
        name="PublicQuestions" 
        component={QuestionsStackNavigator} 
        options={{ tabBarLabel: 'Questions' }} 
      />
      <Tab.Screen 
        name="Plans" 
        component={PlansStackNavigator} 
        options={{ tabBarLabel: 'Plans' }} 
      />
      <Tab.Screen 
        name="PostQuestion" 
        component={PostStackNavigator} 
        options={{ tabBarLabel: 'Post' }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            openCreate();
          },
        }} 
      />
      <Tab.Screen 
        name="Search" 
        component={SearchStackNavigator} 
        options={{ tabBarLabel: 'Search' }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStackNavigator} 
        options={{ tabBarLabel: 'Profile' }} 
      />
      <Tab.Screen 
        name="More" 
        component={MoreStackNavigator} 
        options={{ tabBarLabel: 'More' }} 
      />
    </Tab.Navigator>
    <BottomSheetCreate
      visible={showCreate}
      onClose={closeCreate}
      onCreateQuiz={() => {
        closeCreate();
        // Navigate to nested screen inside Post tab
        navigation.navigate('PostQuestion', { screen: 'CreateUserQuiz' });
      }}
      onPostQuestion={() => {
        closeCreate();
        // Open Post tab root (which hosts PostQuestionScreen)
        navigation.navigate('PostQuestion', { screen: 'PostRoot' });
      }}
    />
    </>
  );
}

/**
 * Main App Navigator
 * Unified navigation that handles authentication flow and main app navigation
 * @returns {React.ReactElement} Main app navigator
 */
function AppNavigator() {
  const { isAuthenticated } = useAuth();
  const { Navigator, Screen } = Stack;
  
  return (
    <Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
        gestureEnabled: false,
        gestureDirection: 'horizontal'
      }}
    >
      {!isAuthenticated ? (
        <>
          <Screen name="Landing" component={LandingScreen} />
          <Screen name="Auth" component={AuthStack} />
        </>
      ) : (
        <Screen name="MainTabs" component={MainTabs} />
      )}
      
      <Screen 
        name="Quiz" 
        component={QuizScreen} 
        options={{ presentation: 'modal' }} 
      />
      <Screen 
        name="AttemptQuiz" 
        component={AttemptQuizScreen} 
        options={{ presentation: 'modal' }} 
      />
      <Screen 
        name="QuizResult" 
        component={QuizResultScreen} 
        options={{ presentation: 'modal' }} 
      />
      <Screen 
        name="PayUSuccess" 
        component={PayUSuccessScreen} 
        options={{ presentation: 'modal' }} 
      />
      <Screen 
        name="PayUFailure" 
        component={PayUFailureScreen} 
        options={{ presentation: 'modal' }} 
      />
      {/** Detail routes now live inside tab stacks so bottom bar stays visible */}
    </Navigator>
  );
}

export default AppNavigator;
