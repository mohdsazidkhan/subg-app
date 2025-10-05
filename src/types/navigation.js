/**
 * Navigation type definitions for the Subg App
 * 
 * This file defines the navigation structure and parameter types
 * for React Navigation in the Subg application.
 */

/**
 * Root Stack Navigator parameter list
 * @typedef {Object} RootStackParamList
 * @property {undefined} Splash - Splash screen
 * @property {undefined} MainTabs - Main tab navigator
 * @property {undefined} Auth - Authentication screen
 * @property {undefined} Landing - Landing screen
 * @property {undefined} Login - Login screen
 * @property {undefined} Register - Register screen
 * @property {undefined} ForgotPassword - Forgot password screen
 * @property {{token?: string}} ResetPassword - Reset password screen with optional token
 * @property {undefined} HowItWorks - How it works screen
 * @property {undefined} AboutUs - About us screen
 * @property {undefined} ContactUs - Contact us screen
 * @property {undefined} Terms - Terms and conditions screen
 * @property {undefined} Privacy - Privacy policy screen
 * @property {undefined} Refund - Refund policy screen
 * @property {{quizId: string}} Quiz - Quiz screen with quiz ID
 * @property {{quizId: string}} AttemptQuiz - Attempt quiz screen with quiz ID
 * @property {{quizId: string, result: any}} QuizResult - Quiz result screen
 * @property {{paymentId: string}} PayUSuccess - Payment success screen
 * @property {{paymentId: string}} PayUFailure - Payment failure screen
 * @property {{levelId: string}} LevelDetail - Level detail screen
 * @property {{categoryId: string}} CategoryDetail - Category detail screen
 * @property {{subcategoryId: string}} SubcategoryDetail - Subcategory detail screen
 * @property {{filter?: string, value?: string}} Articles - Articles screen with optional filters
 * @property {{articleId: string}} ArticleDetail - Article detail screen
 * @property {undefined} PublicQuestions - Public questions screen
 * @property {undefined} PostQuestion - Post question screen
 * @property {undefined} MyQuestions - My questions screen
 * @property {undefined} Subscription - Subscription screen
 * @property {undefined} ProQuestions - Pro questions screen
 * @property {undefined} Wallet - Wallet screen
 * @property {undefined} QuizHistory - Quiz history screen
 * @property {undefined} Notifications - Notifications screen
 * @property {undefined} Leaderboard - Leaderboard screen
 * @property {undefined} Levels - Levels screen
 */

/**
 * Main Tab Navigator parameter list
 * @typedef {Object} MainTabParamList
 * @property {undefined} Home - Home tab
 * @property {undefined} Search - Search tab
 * @property {undefined} Rewards - Rewards tab
 * @property {undefined} PostQuestion - Post question tab
 * @property {undefined} PublicQuestions - Public questions tab
 * @property {undefined} Wallet - Wallet tab
 * @property {undefined} QuizHistory - Quiz history tab
 * @property {undefined} Notifications - Notifications tab
 * @property {undefined} Leaderboard - Leaderboard tab
 * @property {undefined} Levels - Levels tab
 * @property {undefined} Profile - Profile tab
 * @property {undefined} More - More tab
 */

/**
 * Route parameter types for individual screens
 * These are used for type checking in navigation props
 */

/**
 * @typedef {import('@react-navigation/native').RouteProp<RootStackParamList, 'Login'>} LoginRouteProp
 */

/**
 * @typedef {import('@react-navigation/native').RouteProp<RootStackParamList, 'Register'>} RegisterRouteProp
 */

/**
 * @typedef {import('@react-navigation/native').RouteProp<RootStackParamList, 'ResetPassword'>} ResetPasswordRouteProp
 */

/**
 * @typedef {import('@react-navigation/native').RouteProp<RootStackParamList, 'Quiz'>} QuizRouteProp
 */

/**
 * @typedef {import('@react-navigation/native').RouteProp<RootStackParamList, 'AttemptQuiz'>} AttemptQuizRouteProp
 */

/**
 * @typedef {import('@react-navigation/native').RouteProp<RootStackParamList, 'QuizResult'>} QuizResultRouteProp
 */

/**
 * @typedef {import('@react-navigation/native').RouteProp<RootStackParamList, 'PayUSuccess'>} PayUSuccessRouteProp
 */

/**
 * @typedef {import('@react-navigation/native').RouteProp<RootStackParamList, 'PayUFailure'>} PayUFailureRouteProp
 */

/**
 * @typedef {import('@react-navigation/native').RouteProp<RootStackParamList, 'LevelDetail'>} LevelDetailRouteProp
 */

/**
 * @typedef {import('@react-navigation/native').RouteProp<RootStackParamList, 'CategoryDetail'>} CategoryDetailRouteProp
 */

/**
 * @typedef {import('@react-navigation/native').RouteProp<RootStackParamList, 'SubcategoryDetail'>} SubcategoryDetailRouteProp
 */

/**
 * @typedef {import('@react-navigation/native').RouteProp<RootStackParamList, 'Articles'>} ArticlesRouteProp
 */

/**
 * @typedef {import('@react-navigation/native').RouteProp<RootStackParamList, 'ArticleDetail'>} ArticleDetailRouteProp
 */

/**
 * Import example:
 * import { NAVIGATION_PARAMS } from '../types/navigation';
 * 
 * Usage example:
 * navigation.navigate(NAVIGATION_PARAMS.ROOT_STACK.QUIZ, { quizId: '123' });
 */

// Export the navigation parameter lists as constants for use in other files
export const NAVIGATION_PARAMS = {
  ROOT_STACK: {
    SPLASH: 'Splash',
    MAIN_TABS: 'MainTabs',
    AUTH: 'Auth',
    LANDING: 'Landing',
    LOGIN: 'Login',
    REGISTER: 'Register',
    FORGOT_PASSWORD: 'ForgotPassword',
    RESET_PASSWORD: 'ResetPassword',
    HOW_IT_WORKS: 'HowItWorks',
    ABOUT_US: 'AboutUs',
    CONTACT_US: 'ContactUs',
    TERMS: 'Terms',
    PRIVACY: 'Privacy',
    REFUND: 'Refund',
    QUIZ: 'Quiz',
    ATTEMPT_QUIZ: 'AttemptQuiz',
    QUIZ_RESULT: 'QuizResult',
    PAYU_SUCCESS: 'PayUSuccess',
    PAYU_FAILURE: 'PayUFailure',
    LEVEL_DETAIL: 'LevelDetail',
    CATEGORY_DETAIL: 'CategoryDetail',
    SUBCATEGORY_DETAIL: 'SubcategoryDetail',
    ARTICLES: 'Articles',
    ARTICLE_DETAIL: 'ArticleDetail',
    PUBLIC_QUESTIONS: 'PublicQuestions',
    POST_QUESTION: 'PostQuestion',
    MY_QUESTIONS: 'MyQuestions',
    SUBSCRIPTION: 'Subscription',
    PRO_QUESTIONS: 'ProQuestions',
    WALLET: 'Wallet',
    QUIZ_HISTORY: 'QuizHistory',
    NOTIFICATIONS: 'Notifications',
    LEADERBOARD: 'Leaderboard',
    LEVELS: 'Levels'
  },
  MAIN_TABS: {
    HOME: 'Home',
    SEARCH: 'Search',
    REWARDS: 'Rewards',
    POST_QUESTION: 'PostQuestion',
    PUBLIC_QUESTIONS: 'PublicQuestions',
    WALLET: 'Wallet',
    QUIZ_HISTORY: 'QuizHistory',
    NOTIFICATIONS: 'Notifications',
    LEADERBOARD: 'Leaderboard',
    LEVELS: 'Levels',
    PROFILE: 'Profile',
    MORE: 'More'
  }
};
