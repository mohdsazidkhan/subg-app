import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import API from '../../services/api';
import TopBar from '../../components/TopBar';
import { showMessage } from 'react-native-flash-message';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const { colors, toggleTheme } = useTheme();
  
  const [profileStats, setProfileStats] = useState({
    quizzesCompleted: 0,
    totalScore: 0,
    rank: 0,
    achievements: 0,
  });
  const [playedQuizzes, setPlayedQuizzes] = useState([]);
  const [bankDetails, setBankDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  
  // Edit Profile State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    username: '',
    socialLinks: {
      instagram: '',
      facebook: '',
      x: '',
      youtube: ''
    }
  });
  const [editProfileErrors, setEditProfileErrors] = useState({});
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  // Profile Completion State
  const [profileCompletion, setProfileCompletion] = useState(null);
  
  // Bank Details State
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankFormData, setBankFormData] = useState({
    accountHolderName: '',
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    branchName: ''
  });
  const [bankFormErrors, setBankFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch profile data
      const profileRes = await API.getProfile();
      console.log('🔍 Profile API Response in ProfileScreen:', profileRes);
      
      // Set the user data correctly - match Next.js approach
      if (profileRes?.success && profileRes?.user) {
        setUser(profileRes.user);
        console.log('✅ User data set:', profileRes.user);
        
        setProfileStats({
          quizzesCompleted: profileRes.user.totalQuizzes || profileRes.user.quizzesPlayed || 0,
          totalScore: profileRes.user.totalScore || profileRes.user.averageScore || 0,
          rank: profileRes.user.rank || profileRes.user.globalRank || 0,
          achievements: profileRes.user.badges?.length || profileRes.user.achievements?.length || 0,
        });
        
        // Initialize edit profile data
        setEditProfileData({
          name: profileRes.user.name || '',
          email: profileRes.user.email || '',
          phone: profileRes.user.phone || '',
          username: profileRes.user.username || '',
          socialLinks: {
            instagram: profileRes.user.socialLinks?.instagram || '',
            facebook: profileRes.user.socialLinks?.facebook || '',
            x: profileRes.user.socialLinks?.x || '',
            youtube: profileRes.user.socialLinks?.youtube || ''
          }
        });
      } else {
        console.log('❌ No user data found in response');
        setUser({});
        setError('Failed to load profile data');
        
        // Set fallback data to prevent crashes
        setProfileStats({
          quizzesCompleted: 0,
          totalScore: 0,
          rank: 0,
          achievements: 0,
        });
      }
      
      // Set profile completion data if available - match Next.js approach
      if (profileRes?.user?.profileCompletion) {
        console.log('✅ Profile completion data found in ProfileScreen:', profileRes.user.profileCompletion);
        setProfileCompletion(profileRes.user.profileCompletion);
      } else {
        console.log('❌ Profile completion data not found in ProfileScreen response');
        console.log('Response structure:', {
          success: profileRes?.success,
          hasUser: !!profileRes?.user,
          hasProfileCompletion: !!profileRes?.user?.profileCompletion
        });
        
        // Set default profile completion data - match Next.js approach
        setProfileCompletion({
          percentage: 0,
          isComplete: false,
          fields: [
            { name: 'Full Name', completed: false, value: '' },
            { name: 'Email Address', completed: false, value: '' },
            { name: 'Phone Number', completed: false, value: '' },
            { name: 'Social Media Link', completed: false, value: '' }
          ],
          completedFields: 0,
          totalFields: 4
        });
      }

      // Fetch quiz history - match Next.js approach
      try {
        const historyRes = await API.getStudentQuizHistory();
        if (historyRes.success) {
          setPlayedQuizzes(historyRes.data?.attempts || []);
        }
      } catch (quizErr) {
        console.error('Error fetching quiz history:', quizErr);
        setPlayedQuizzes([]); // Still show profile even if quizzes fail
      }

      // Check if user is eligible for bank details - match Next.js approach
      console.log('🔍 Checking bank details eligibility for user:', profileRes?.user);
      if (isEligibleForBankDetails(profileRes?.user)) {
        console.log('✅ User is eligible for bank details, fetching...');
        try {
          const bankRes = await API.getBankDetails();
          console.log('📦 Bank details API response:', bankRes);
          if (bankRes.success && bankRes.bankDetail) {
            console.log('✅ Bank details found:', bankRes.bankDetail);
            setBankDetails(bankRes.bankDetail);
            // Pre-fill form data with existing bank details
            setBankFormData({
              accountHolderName: bankRes.bankDetail.accountHolderName,
              accountNumber: bankRes.bankDetail.accountNumber,
              bankName: bankRes.bankDetail.bankName,
              ifscCode: bankRes.bankDetail.ifscCode,
              branchName: bankRes.bankDetail.branchName
            });
          } else {
            console.log('❌ No bank details in response:', bankRes);
          }
        } catch (bankErr) {
          // Check if it's a 404 error (no bank details yet) vs other errors
          if (bankErr.response && bankErr.response.status === 404) {
            // User doesn't have bank details yet - this is normal
            console.log('ℹ️ No bank details found yet - user can add them');
            setBankDetails(null);
          } else {
            // Actual error occurred
            console.error('❌ Error fetching bank details:', bankErr);
            // Don't show error to user since bank details are optional
          }
        }
      } else {
        console.log('❌ User is not eligible for bank details');
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfileData();
    setRefreshing(false);
  };

  const isEligibleForBankDetails = (user) => {
    if (!user) {
      console.log('❌ No user data for eligibility check');
      return false;
    }
    
    const isLevelTen = user.levelInfo?.currentLevel?.number === 10;
    const isProPlan = user.subscriptionStatus === 'pro';
    
    // TEMPORARY: Allow all users to see bank details for testing
    // TODO: Remove this and use proper eligibility check
    console.log('🔧 TEMPORARY: Allowing all users to see bank details');
    return true;
    
    // Original eligibility check (commented out for testing)
    // return isLevelTen || isProPlan;
  };

  const getSubscriptionStatusText = (subscriptionStatus) => {
    switch (subscriptionStatus) {
      case 'free':
        return 'FREE';
      case 'basic':
        return 'BASIC';
      case 'premium':
        return 'PREMIUM';
      case 'pro':
        return 'PRO';
      default:
        return 'NO SUBSCRIPTION';
    }
  };

  const getSubscriptionStatusColor = (subscriptionStatus) => {
    switch (subscriptionStatus) {
      case 'free':
        return colors.warning;
      case 'basic':
        return '#F59E0B';
      case 'premium':
        return '#EF4444';
      case 'pro':
        return '#8B5CF6';
      default:
        return colors.textSecondary;
    }
  };

  const isFreeOrBasicPlanUser = (user) => {
    if (!user) {
      console.log('❌ No user data for Free/Basic plan check');
      return false;
    }
    
    const isFreePlan = user.subscriptionStatus === 'free';
    const isBasicPlan = user.subscriptionStatus === 'basic';
    
    console.log('🔍 Free/Basic Plan Check:', {
      subscriptionStatus: user.subscriptionStatus,
      isFreePlan,
      isBasicPlan,
      shouldShowProfileCompletion: isFreePlan || isBasicPlan
    });
    
    return isFreePlan || isBasicPlan;
  };

  // Edit Profile Handlers
  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setEditProfileErrors({});
  };

  const handleEditProfileChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEditProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEditProfileData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error for this field when user types
    if (editProfileErrors[field]) {
      setEditProfileErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setIsUpdatingProfile(true);
      setEditProfileErrors({});
      
      const response = await API.updateProfile(editProfileData);
      if (response.success) {
        showMessage({
          message: 'Profile updated successfully!',
          type: 'success',
        });
        setIsEditingProfile(false);
        await fetchProfileData(); // Refresh profile data
      } else {
        setEditProfileErrors(response.errors || {});
        showMessage({
          message: 'Failed to update profile',
          type: 'danger',
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showMessage({
        message: 'Error updating profile',
        type: 'danger',
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Bank Details Handlers
  const handleBankFormChange = (field, value) => {
    setBankFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user types
    if (bankFormErrors[field]) {
      setBankFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSaveBankDetails = async () => {
    try {
      setIsSaving(true);
      setBankFormErrors({});
      
      const response = await API.saveBankDetails(bankFormData);
      if (response.success) {
        showMessage({
          message: 'Bank details saved successfully!',
          type: 'success',
        });
        setShowBankForm(false);
        setBankDetails(response.bankDetail);
      } else {
        setBankFormErrors(response.errors || {});
        showMessage({
          message: 'Failed to save bank details',
          type: 'danger',
        });
      }
    } catch (error) {
      console.error('Error saving bank details:', error);
      showMessage({
        message: 'Error saving bank details',
        type: 'danger',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.navigate('Auth');
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      title: 'Quiz History',
      icon: 'history',
      onPress: () => {
        // Navigate to quiz history
      },
    },
    {
      title: 'Achievements',
      icon: 'emoji-events',
      onPress: () => {
        // Navigate to achievements
      },
    },
    {
      title: 'Create Question',
      icon: 'add-circle',
      onPress: () => {
        navigation.navigate('CreateQuestion');
      },
    },
    {
      title: 'Create Quiz',
      icon: 'quiz',
      onPress: () => {
        navigation.navigate('CreateQuiz');
      },
    },
    {
      title: 'Settings',
      icon: 'settings',
      onPress: () => {
        // Navigate to settings
      },
    },
    {
      title: 'Contact Us',
      icon: 'contact-support',
      onPress: () => {
        // Navigate to contact
      },
    },
  ];

  // Calculate stats - use both profile data and quiz history
  const quizzesPlayed = Math.max(playedQuizzes.length, profileStats.quizzesCompleted);
  const highScoreQuizzes = playedQuizzes.filter(quiz => quiz.score >= 80).length;
  const highScoreRate = quizzesPlayed > 0 ? Math.round((highScoreQuizzes / quizzesPlayed) * 100) : 0;

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TopBar
          title="Profile"
          showMenuButton={true}
          showThemeToggle={true}
          onMenuPress={() => navigation.navigate('MainTabs', { screen: 'More' })}
          onThemeToggle={toggleTheme}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading your profile...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TopBar
          title="Profile"
          showMenuButton={true}
          showThemeToggle={true}
          onMenuPress={() => navigation.navigate('MainTabs', { screen: 'More' })}
          onThemeToggle={toggleTheme}
        />
        <View style={styles.errorContainer}>
          <Icon name="error" size={60} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchProfileData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title="Profile"
        showMenuButton={true}
        showThemeToggle={true}
        onMenuPress={() => navigation.navigate('MainTabs', { screen: 'More' })}
        onThemeToggle={toggleTheme}
      />

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Header - Exact Next.js Design */}
        <View style={[styles.profileHeader, { backgroundColor: colors.surface }]}>
          {/* Cover Photo Area */}
          <LinearGradient
            colors={colors.isDark ? ['#1F2937', '#374151'] : ['#DC2626', '#F59E0B']}
            style={styles.coverPhoto}
          >
            <View style={styles.coverOverlay} />
          </LinearGradient>
          
          {/* Profile Info */}
          <View style={styles.profileInfo}>
            {/* Profile Picture */}
            <View style={styles.profilePictureContainer}>
              <View style={[styles.profilePicture, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.profileInitial, { color: colors.text }]}>
                  {user?.name?.charAt(0) || 'U'}
                </Text>
              </View>
            </View>
            
            <View style={styles.profileDetails}>
              <Text style={[styles.userName, { color: colors.text }]}>
                {user?.name || 'User'}
              </Text>
              {user?.username && (
                <Text style={[styles.username, { color: colors.primary }]}>
                  @{user.username}
                </Text>
              )}
              <Text style={[styles.userLevel, { color: colors.textSecondary }]}>
                <Text style={{ fontWeight: 'bold' }}>
                  {user?.levelInfo?.currentLevel?.name || 'Level 0'}
                </Text>
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditProfile}
            >
              <Icon name="edit" size={16} color="white" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Completion Progress - Only show for Free or Basic plan users */}
        {isFreeOrBasicPlanUser(user) && profileCompletion && (
          <View style={[styles.profileCompletionCard, { backgroundColor: colors.surface }]}>
            <View style={styles.profileCompletionHeader}>
              <View style={styles.profileCompletionTitleContainer}>
                <Icon name="school" size={20} color={colors.success} />
                <Text style={[styles.profileCompletionTitle, { color: colors.text }]}>
                  Profile Completion
                </Text>
              </View>
              <Text style={[
                styles.profileCompletionPercentage,
                { color: profileCompletion.percentage === 100 ? colors.success : colors.warning }
              ]}>
                {profileCompletion.percentage === 100 ? 'Completed ✅' : `${profileCompletion.percentage}%`}
              </Text>
            </View>
            
            {/* Progress Bar */}
            <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}>
              <View 
                style={[
                  styles.progressBar,
                  { 
                    width: `${profileCompletion.percentage}%`,
                    backgroundColor: profileCompletion.percentage === 100 ? colors.success : colors.warning
                  }
                ]}
              />
            </View>
            
            {/* Status Message */}
            <Text style={[styles.profileCompletionMessage, { color: colors.textSecondary }]}>
              {profileCompletion.percentage === 100 
                ? '🎉 Congratulations! Your profile is complete and you have received your Basic Subscription reward!'
                : `Complete ${4 - profileCompletion.completedFields} more field${4 - profileCompletion.completedFields === 1 ? '' : 's'} to get 100% and unlock your Basic Subscription reward!`
              }
            </Text>

            {/* Field Status */}
            <View style={styles.fieldStatusContainer}>
              {profileCompletion.fields.map((field, index) => (
                <View key={index} style={[styles.fieldStatusItem, { backgroundColor: colors.surface + '50' }]}>
                  <Text style={[styles.fieldStatusName, { color: colors.text }]}>{field.name}</Text>
                  <Text style={[styles.fieldStatusIcon, { color: field.completed ? colors.success : colors.error }]}>
                    {field.completed ? '✅' : '❌'}
                  </Text>
                </View>
              ))}
            </View>
            
            {/* Reward Info */}
            {profileCompletion.percentage === 100 && (
              <View style={[styles.rewardInfoCard, { backgroundColor: colors.success + '20', borderColor: colors.success }]}>
                <Icon name="star" size={20} color={colors.success} />
                <Text style={[styles.rewardInfoText, { color: colors.success }]}>
                  You've earned a Basic Subscription (₹9 value) for 30 days!
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Subscription Status Section */}
        <View style={[styles.subscriptionCard, { backgroundColor: colors.surface }]}>
          <View style={styles.subscriptionHeader}>
            <View style={styles.subscriptionTitleContainer}>
              <Icon name="workspace-premium" size={20} color={colors.primary} />
              <Text style={[styles.subscriptionTitle, { color: colors.text }]}>
                Subscription Status
              </Text>
            </View>
          </View>
          
          <View style={styles.subscriptionInfo}>
            <View style={styles.subscriptionPlanContainer}>
              <Text style={[styles.subscriptionPlanLabel, { color: colors.textSecondary }]}>Current Plan</Text>
              <Text style={[
                styles.subscriptionPlanValue, 
                { color: getSubscriptionStatusColor(user?.subscriptionStatus) }
              ]}>
                {getSubscriptionStatusText(user?.subscriptionStatus)}
              </Text>
            </View>
            
            {(user?.subscriptionExpiry || user?.subscription?.expiresAt) && user?.subscriptionStatus !== 'free' && (
              <View style={styles.subscriptionExpiryContainer}>
                <Text style={[styles.subscriptionExpiryLabel, { color: colors.textSecondary }]}>Expires</Text>
                <Text style={[styles.subscriptionExpiryValue, { color: colors.text }]}>
                  {new Date(user.subscriptionExpiry || user.subscription?.expiresAt).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity 
            style={[styles.subscriptionButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Subscription')}
          >
            <Text style={styles.subscriptionButtonText}>
              {user?.subscriptionStatus === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Rewards & Achievements Section */}
        <View style={[styles.rewardsCard, { backgroundColor: colors.surface }]}>
          <View style={styles.rewardsHeader}>
            <View style={styles.rewardsTitleContainer}>
              <Icon name="emoji-events" size={20} color={colors.primary} />
              <Text style={[styles.rewardsTitle, { color: colors.text }]}>
                Rewards & Achievements
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.viewRewardsButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('Rewards')}
            >
              <Text style={styles.viewRewardsButtonText}>View Rewards</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.rewardsStats}>
            <View style={[styles.rewardStatItem, { backgroundColor: colors.background }]}>
              <Text style={[styles.rewardStatValue, { color: colors.success }]}>
                ₹{user?.claimableRewards?.toLocaleString() || user?.totalRewards?.toLocaleString() || '0'}
              </Text>
              <Text style={[styles.rewardStatLabel, { color: colors.textSecondary }]}>
                Total Claimable
              </Text>
            </View>
          </View>
          
          <View style={styles.rewardsInfo}>
            <Text style={[styles.rewardsInfoText, { color: colors.textSecondary }]}>
              Track your progress and unlock rewards by completing quizzes and reaching milestones.
            </Text>
          </View>
        </View>

        {/* About Section */}
        <View style={[styles.aboutCard, { backgroundColor: colors.surface }]}>
          <View style={styles.aboutHeader}>
            <Text style={[styles.aboutTitle, { color: colors.text }]}>About</Text>
            {user?.username && (
              <View style={styles.followStats}>
                <TouchableOpacity style={styles.followStat}>
                  <Text style={[styles.followCount, { color: colors.text }]}>
                    {user?.followersCount || 0}
                  </Text>
                  <Text style={[styles.followLabel, { color: colors.textSecondary }]}>
                    Followers
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.followStat}>
                  <Text style={[styles.followCount, { color: colors.text }]}>
                    {user?.followingCount || 0}
                  </Text>
                  <Text style={[styles.followLabel, { color: colors.textSecondary }]}>
                    Following
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Profile Information - Show either details or edit form */}
          {!isEditingProfile ? (
            <View style={styles.profileInfoSection}>
              {/* Contact Info */}
              <View style={styles.contactInfo}>
                <View style={styles.contactItem}>
                  <Icon name="email" size={20} color={colors.textSecondary} />
                  <Text style={[styles.contactText, { color: colors.text }]}>
                    {user?.email || 'No email provided'}
                  </Text>
                </View>
                
                {user?.phone && (
                  <View style={styles.contactItem}>
                    <Icon name="phone" size={20} color={colors.textSecondary} />
                    <Text style={[styles.contactText, { color: colors.text }]}>
                      {user.phone}
                    </Text>
                  </View>
                )}
              </View>

              {/* Social Links */}
              {(user?.socialLinks?.instagram || user?.socialLinks?.facebook || 
                user?.socialLinks?.x || user?.socialLinks?.youtube) && (
                <View style={styles.socialLinks}>
                  <Text style={[styles.socialLinksTitle, { color: colors.text }]}>
                    Social Media
                  </Text>
                  <View style={styles.socialLinksList}>
                    {user?.socialLinks?.instagram && (
                      <TouchableOpacity style={styles.socialLink}>
                        <Icon name="instagram" size={20} color="#E4405F" />
                        <Text style={[styles.socialLinkText, { color: colors.text }]}>
                          Instagram
                        </Text>
                      </TouchableOpacity>
                    )}
                    {user?.socialLinks?.facebook && (
                      <TouchableOpacity style={styles.socialLink}>
                        <Icon name="facebook" size={20} color="#1877F2" />
                        <Text style={[styles.socialLinkText, { color: colors.text }]}>
                          Facebook
                        </Text>
                      </TouchableOpacity>
                    )}
                    {user?.socialLinks?.x && (
                      <TouchableOpacity style={styles.socialLink}>
                        <Icon name="twitter" size={20} color="#000000" />
                        <Text style={[styles.socialLinkText, { color: colors.text }]}>
                          X (Twitter)
                        </Text>
                      </TouchableOpacity>
                    )}
                    {user?.socialLinks?.youtube && (
                      <TouchableOpacity style={styles.socialLink}>
                        <Icon name="youtube" size={20} color="#FF0000" />
                        <Text style={[styles.socialLinkText, { color: colors.text }]}>
                          YouTube
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            </View>
          ) : (
            /* Edit Profile Form */
            <View style={styles.editProfileForm}>
              <Text style={[styles.formTitle, { color: colors.text }]}>
                Edit Profile Information
              </Text>
              
              {/* Name Field */}
              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Full Name</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { 
                      backgroundColor: colors.background,
                      color: colors.text,
                      borderColor: editProfileErrors.name ? colors.error : colors.border
                    }
                  ]}
                  value={editProfileData.name}
                  onChangeText={(value) => handleEditProfileChange('name', value)}
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.textSecondary}
                />
                {editProfileErrors.name && (
                  <Text style={[styles.fieldError, { color: colors.error }]}>
                    {editProfileErrors.name}
                  </Text>
                )}
              </View>

              {/* Email Field */}
              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Email Address</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { 
                      backgroundColor: colors.background,
                      color: colors.text,
                      borderColor: editProfileErrors.email ? colors.error : colors.border
                    }
                  ]}
                  value={editProfileData.email}
                  onChangeText={(value) => handleEditProfileChange('email', value)}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                />
                {editProfileErrors.email && (
                  <Text style={[styles.fieldError, { color: colors.error }]}>
                    {editProfileErrors.email}
                  </Text>
                )}
              </View>

              {/* Phone Field */}
              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Phone Number</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { 
                      backgroundColor: colors.background,
                      color: colors.text,
                      borderColor: editProfileErrors.phone ? colors.error : colors.border
                    }
                  ]}
                  value={editProfileData.phone}
                  onChangeText={(value) => handleEditProfileChange('phone', value)}
                  placeholder="Enter your phone number"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="phone-pad"
                />
                {editProfileErrors.phone && (
                  <Text style={[styles.fieldError, { color: colors.error }]}>
                    {editProfileErrors.phone}
                  </Text>
                )}
              </View>

              {/* Username Field */}
              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Username</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { 
                      backgroundColor: colors.background,
                      color: colors.text,
                      borderColor: editProfileErrors.username ? colors.error : colors.border
                    }
                  ]}
                  value={editProfileData.username}
                  onChangeText={(value) => handleEditProfileChange('username', value)}
                  placeholder="Enter your username"
                  placeholderTextColor={colors.textSecondary}
                />
                {editProfileErrors.username && (
                  <Text style={[styles.fieldError, { color: colors.error }]}>
                    {editProfileErrors.username}
                  </Text>
                )}
              </View>

              {/* Social Media Links */}
              <Text style={[styles.socialSectionTitle, { color: colors.text }]}>
                Social Media Links (Optional)
              </Text>

              {/* Instagram */}
              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  <Icon name="instagram" size={16} color="#E4405F" /> Instagram
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { 
                      backgroundColor: colors.background,
                      color: colors.text,
                      borderColor: editProfileErrors['socialLinks.instagram'] ? colors.error : colors.border
                    }
                  ]}
                  value={editProfileData.socialLinks.instagram}
                  onChangeText={(value) => handleEditProfileChange('socialLinks.instagram', value)}
                  placeholder="https://instagram.com/yourusername"
                  placeholderTextColor={colors.textSecondary}
                />
                {editProfileErrors['socialLinks.instagram'] && (
                  <Text style={[styles.fieldError, { color: colors.error }]}>
                    {editProfileErrors['socialLinks.instagram']}
                  </Text>
                )}
              </View>

              {/* Facebook */}
              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  <Icon name="facebook" size={16} color="#1877F2" /> Facebook
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { 
                      backgroundColor: colors.background,
                      color: colors.text,
                      borderColor: editProfileErrors['socialLinks.facebook'] ? colors.error : colors.border
                    }
                  ]}
                  value={editProfileData.socialLinks.facebook}
                  onChangeText={(value) => handleEditProfileChange('socialLinks.facebook', value)}
                  placeholder="https://facebook.com/yourusername"
                  placeholderTextColor={colors.textSecondary}
                />
                {editProfileErrors['socialLinks.facebook'] && (
                  <Text style={[styles.fieldError, { color: colors.error }]}>
                    {editProfileErrors['socialLinks.facebook']}
                  </Text>
                )}
              </View>

              {/* X (Twitter) */}
              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  <Icon name="twitter" size={16} color="#000000" /> X (Twitter)
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { 
                      backgroundColor: colors.background,
                      color: colors.text,
                      borderColor: editProfileErrors['socialLinks.x'] ? colors.error : colors.border
                    }
                  ]}
                  value={editProfileData.socialLinks.x}
                  onChangeText={(value) => handleEditProfileChange('socialLinks.x', value)}
                  placeholder="https://x.com/yourusername"
                  placeholderTextColor={colors.textSecondary}
                />
                {editProfileErrors['socialLinks.x'] && (
                  <Text style={[styles.fieldError, { color: colors.error }]}>
                    {editProfileErrors['socialLinks.x']}
                  </Text>
                )}
              </View>

              {/* YouTube */}
              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  <Icon name="youtube" size={16} color="#FF0000" /> YouTube
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { 
                      backgroundColor: colors.background,
                      color: colors.text,
                      borderColor: editProfileErrors['socialLinks.youtube'] ? colors.error : colors.border
                    }
                  ]}
                  value={editProfileData.socialLinks.youtube}
                  onChangeText={(value) => handleEditProfileChange('socialLinks.youtube', value)}
                  placeholder="https://youtube.com/@yourusername"
                  placeholderTextColor={colors.textSecondary}
                />
                {editProfileErrors['socialLinks.youtube'] && (
                  <Text style={[styles.fieldError, { color: colors.error }]}>
                    {editProfileErrors['socialLinks.youtube']}
                  </Text>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.formActions}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleUpdateProfile}
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Icon name="save" size={16} color="white" />
                  )}
                  <Text style={styles.saveButtonText}>
                    {isUpdatingProfile ? 'Updating...' : 'Save Changes'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancelEdit}
                  disabled={isUpdatingProfile}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Subscription Status */}
        <View style={[styles.subscriptionCard, { backgroundColor: colors.surface }]}>
          <View style={styles.subscriptionHeader}>
            <Icon name="star" size={24} color={colors.primary} />
            <Text style={[styles.subscriptionTitle, { color: colors.text }]}>
              Subscription Status
            </Text>
          </View>
          
          <View style={styles.subscriptionInfo}>
            <View style={styles.subscriptionPlanContainer}>
              <Text style={[styles.subscriptionPlanLabel, { color: colors.textSecondary }]}>
                Current Plan
              </Text>
              <Text style={[
                styles.subscriptionPlanValue,
                { 
                  color: user?.subscriptionStatus === 'free' ? colors.textSecondary : 
                        user?.subscriptionStatus === 'basic' ? '#F59E0B' :
                        user?.subscriptionStatus === 'premium' ? '#EF4444' :
                        user?.subscriptionStatus === 'pro' ? '#8B5CF6' : colors.text
                }
              ]}>
                {user?.subscriptionStatus?.toUpperCase() || user?.subscription?.planName?.toUpperCase() || 'FREE'}
              </Text>
            </View>
            
            {(user?.subscriptionExpiry || user?.subscription?.expiresAt) && user.subscriptionStatus !== 'free' && (
              <View style={styles.subscriptionExpiryContainer}>
                <Text style={[styles.subscriptionExpiryLabel, { color: colors.textSecondary }]}>
                  Expires On
                </Text>
                <Text style={[styles.subscriptionExpiryValue, { color: colors.text }]}>
                  {new Date(user.subscriptionExpiry || user.subscription?.expiresAt).toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.subscriptionButton}
            onPress={() => navigation.navigate('Subscription')}
          >
            <Icon name="rocket-launch" size={16} color="white" />
            <Text style={styles.subscriptionButtonText}>
              {user?.subscriptionStatus === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Achievement Badges */}
        <View style={[styles.achievementCard, { backgroundColor: colors.surface }]}>
          <View style={styles.achievementHeader}>
            <Icon name="emoji-events" size={24} color="#F59E0B" />
            <Text style={[styles.achievementTitle, { color: colors.text }]}>
              Achievement Badges
            </Text>
          </View>
          <Text style={[styles.achievementText, { color: colors.text }]}>
            {user?.badges && user.badges.length > 0
              ? user.badges.join(', ')
              : 'No badges yet'}
          </Text>
        </View>

        {/* Quiz Stats */}
        <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statsTitle, { color: colors.text }]}>Quiz Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#3B82F6' }]}>{quizzesPlayed}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Quizzes Played</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#10B981' }]}>{highScoreQuizzes}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>High Scores</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#8B5CF6' }]}>{highScoreRate}%</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Success Rate</Text>
            </View>
          </View>
        </View>

        {/* Create Content Section */}
        <View style={[styles.createContentCard, { backgroundColor: colors.surface }]}>
          <View style={styles.createContentHeader}>
            <Icon name="add-circle" size={32} color="#10B981" />
            <View style={styles.createContentTitleContainer}>
              <Text style={[styles.createContentTitle, { color: colors.text }]}>
                Create Content
              </Text>
              <Text style={[styles.createContentSubtitle, { color: colors.textSecondary }]}>
                Create questions and quizzes to earn money
              </Text>
            </View>
          </View>
          
          <View style={styles.createContentGrid}>
            {/* Create Question */}
            <TouchableOpacity
              style={[styles.createContentItem, { backgroundColor: colors.background }]}
              onPress={() => navigation.navigate('CreateQuestion')}
            >
              <Icon name="add-circle" size={24} color="#10B981" />
              <Text style={[styles.createContentItemTitle, { color: colors.text }]}>
                Create Question
              </Text>
              <Text style={[styles.createContentItemSubtitle, { color: colors.textSecondary }]}>
                Post new questions
              </Text>
            </TouchableOpacity>

            {/* Create Quiz */}
            <TouchableOpacity
              style={[styles.createContentItem, { backgroundColor: colors.background }]}
              onPress={() => navigation.navigate('CreateQuiz')}
            >
              <Icon name="quiz" size={24} color="#3B82F6" />
              <Text style={[styles.createContentItemTitle, { color: colors.text }]}>
                Create Quiz
              </Text>
              <Text style={[styles.createContentItemSubtitle, { color: colors.textSecondary }]}>
                Create quiz sets
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { backgroundColor: colors.surface }]}
              onPress={item.onPress}
            >
              <View style={styles.menuItemContent}>
                <Icon name={item.icon} size={24} color={colors.primary} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  {item.title}
                </Text>
                <Icon name="chevron-right" size={24} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bank Details Section - Only show if eligible */}
        {isEligibleForBankDetails(user) && (
          <View style={[styles.bankDetailsCard, { backgroundColor: colors.surface }]}>
            <View style={styles.bankDetailsHeader}>
              <Icon name="account-balance" size={24} color="#F59E0B" />
              <Text style={[styles.bankDetailsTitle, { color: colors.text }]}>
                Bank Details
              </Text>
              <TouchableOpacity
                style={styles.bankDetailsButton}
                onPress={() => setShowBankForm(!showBankForm)}
              >
                <Icon name={showBankForm ? "close" : "edit"} size={16} color="white" />
                <Text style={styles.bankDetailsButtonText}>
                  {showBankForm ? 'Cancel' : bankDetails ? 'Edit' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>

            {!showBankForm ? (
              /* Show Bank Details */
              bankDetails ? (
                <View style={styles.bankDetailsInfo}>
                  <View style={styles.bankDetailItem}>
                    <Text style={[styles.bankDetailLabel, { color: colors.textSecondary }]}>
                      Account Holder
                    </Text>
                    <Text style={[styles.bankDetailValue, { color: colors.text }]}>
                      {bankDetails.accountHolderName}
                    </Text>
                  </View>
                  <View style={styles.bankDetailItem}>
                    <Text style={[styles.bankDetailLabel, { color: colors.textSecondary }]}>
                      Bank Name
                    </Text>
                    <Text style={[styles.bankDetailValue, { color: colors.text }]}>
                      {bankDetails.bankName}
                    </Text>
                  </View>
                  <View style={styles.bankDetailItem}>
                    <Text style={[styles.bankDetailLabel, { color: colors.textSecondary }]}>
                      Account Number
                    </Text>
                    <Text style={[styles.bankDetailValue, { color: colors.text }]}>
                      {bankDetails.accountNumber}
                    </Text>
                  </View>
                  <View style={styles.bankDetailItem}>
                    <Text style={[styles.bankDetailLabel, { color: colors.textSecondary }]}>
                      IFSC Code
                    </Text>
                    <Text style={[styles.bankDetailValue, { color: colors.text }]}>
                      {bankDetails.ifscCode}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={[styles.noBankDetailsText, { color: colors.textSecondary }]}>
                  No bank details added yet. Add your bank details to receive payments.
                </Text>
              )
            ) : (
              /* Bank Details Form */
              <View style={styles.bankForm}>
                <View style={styles.formField}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Account Holder Name</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      { 
                        backgroundColor: colors.background,
                        color: colors.text,
                        borderColor: bankFormErrors.accountHolderName ? colors.error : colors.border
                      }
                    ]}
                    value={bankFormData.accountHolderName}
                    onChangeText={(value) => handleBankFormChange('accountHolderName', value)}
                    placeholder="Enter account holder name"
                    placeholderTextColor={colors.textSecondary}
                  />
                  {bankFormErrors.accountHolderName && (
                    <Text style={[styles.fieldError, { color: colors.error }]}>
                      {bankFormErrors.accountHolderName}
                    </Text>
                  )}
                </View>

                <View style={styles.formField}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Account Number</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      { 
                        backgroundColor: colors.background,
                        color: colors.text,
                        borderColor: bankFormErrors.accountNumber ? colors.error : colors.border
                      }
                    ]}
                    value={bankFormData.accountNumber}
                    onChangeText={(value) => handleBankFormChange('accountNumber', value)}
                    placeholder="Enter account number"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                  />
                  {bankFormErrors.accountNumber && (
                    <Text style={[styles.fieldError, { color: colors.error }]}>
                      {bankFormErrors.accountNumber}
                    </Text>
                  )}
                </View>

                <View style={styles.formField}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Bank Name</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      { 
                        backgroundColor: colors.background,
                        color: colors.text,
                        borderColor: bankFormErrors.bankName ? colors.error : colors.border
                      }
                    ]}
                    value={bankFormData.bankName}
                    onChangeText={(value) => handleBankFormChange('bankName', value)}
                    placeholder="Enter bank name"
                    placeholderTextColor={colors.textSecondary}
                  />
                  {bankFormErrors.bankName && (
                    <Text style={[styles.fieldError, { color: colors.error }]}>
                      {bankFormErrors.bankName}
                    </Text>
                  )}
                </View>

                <View style={styles.formField}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>IFSC Code</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      { 
                        backgroundColor: colors.background,
                        color: colors.text,
                        borderColor: bankFormErrors.ifscCode ? colors.error : colors.border
                      }
                    ]}
                    value={bankFormData.ifscCode}
                    onChangeText={(value) => handleBankFormChange('ifscCode', value)}
                    placeholder="Enter IFSC code"
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="characters"
                  />
                  {bankFormErrors.ifscCode && (
                    <Text style={[styles.fieldError, { color: colors.error }]}>
                      {bankFormErrors.ifscCode}
                    </Text>
                  )}
                </View>

                <View style={styles.formField}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Branch Name</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      { 
                        backgroundColor: colors.background,
                        color: colors.text,
                        borderColor: bankFormErrors.branchName ? colors.error : colors.border
                      }
                    ]}
                    value={bankFormData.branchName}
                    onChangeText={(value) => handleBankFormChange('branchName', value)}
                    placeholder="Enter branch name"
                    placeholderTextColor={colors.textSecondary}
                  />
                  {bankFormErrors.branchName && (
                    <Text style={[styles.fieldError, { color: colors.error }]}>
                      {bankFormErrors.branchName}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.saveBankButton}
                  onPress={handleSaveBankDetails}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Icon name="save" size={16} color="white" />
                  )}
                  <Text style={styles.saveBankButtonText}>
                    {isSaving ? 'Saving...' : 'Save Bank Details'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Quiz History Section */}
        <View style={[styles.quizHistoryCard, { backgroundColor: colors.surface }]}>
          <View style={styles.quizHistoryHeader}>
            <View style={styles.quizHistoryTitleContainer}>
              <Icon name="psychology" size={20} color={colors.primary} />
              <Text style={[styles.quizHistoryTitle, { color: colors.text }]}>
                Quiz History
              </Text>
            </View>
            <Text style={[styles.quizHistorySubtitle, { color: colors.textSecondary }]}>
              Your quiz attempts and achievements
            </Text>
          </View>
          
          {playedQuizzes?.length === 0 ? (
            <View style={styles.emptyQuizHistory}>
              <View style={[styles.emptyQuizIcon, { backgroundColor: colors.border }]}>
                <Icon name="psychology" size={40} color={colors.textSecondary} />
              </View>
              <Text style={[styles.emptyQuizTitle, { color: colors.text }]}>
                No quizzes played yet.
              </Text>
              <Text style={[styles.emptyQuizSubtitle, { color: colors.textSecondary }]}>
                Start your quiz journey today!
              </Text>
            </View>
          ) : (
            <View style={styles.quizHistoryGrid}>
              {playedQuizzes?.slice(0, 6).map((quiz, index) => (
                <TouchableOpacity 
                  key={quiz._id || index} 
                  style={[styles.quizHistoryItem, { backgroundColor: colors.background }]}
                  onPress={() => {
                    // Navigate to quiz result
                    navigation.navigate('QuizResult', { quizId: quiz._id });
                  }}
                >
                  <View style={styles.quizHistoryItemHeader}>
                    <View style={[styles.quizHistoryIcon, { backgroundColor: colors.primary }]}>
                      <Icon name="emoji-events" size={20} color="white" />
                    </View>
                    <View style={[
                      styles.quizHistoryBadge,
                      { backgroundColor: quiz.scorePercentage >= 75 ? colors.success + '20' : colors.error + '20' }
                    ]}>
                      <Text style={[
                        styles.quizHistoryBadgeText,
                        { color: quiz.scorePercentage >= 75 ? colors.success : colors.error }
                      ]}>
                        {quiz.scorePercentage >= 75 ? '✅ High Score' : '📝 Completed'}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={[styles.quizHistoryQuizTitle, { color: colors.text }]} numberOfLines={2}>
                    {quiz.quizTitle || 'Untitled Quiz'}
                  </Text>
                  
                  <View style={styles.quizHistoryStats}>
                    <View style={styles.quizHistoryStat}>
                      <Text style={[styles.quizHistoryStatLabel, { color: colors.textSecondary }]}>Score:</Text>
                      <Text style={[styles.quizHistoryStatValue, { color: colors.text }]}>{quiz.scorePercentage}%</Text>
                    </View>
                    <View style={styles.quizHistoryStat}>
                      <Text style={[styles.quizHistoryStatLabel, { color: colors.textSecondary }]}>Correct:</Text>
                      <Text style={[styles.quizHistoryStatValue, { color: colors.text }]}>{quiz.score}</Text>
                    </View>
                    <View style={styles.quizHistoryStat}>
                      <Text style={[styles.quizHistoryStatLabel, { color: colors.textSecondary }]}>Category:</Text>
                      <Text style={[styles.quizHistoryStatValue, { color: colors.primary }]}>{quiz.categoryName}</Text>
                    </View>
                    <View style={styles.quizHistoryStat}>
                      <Text style={[styles.quizHistoryStatLabel, { color: colors.textSecondary }]}>Date:</Text>
                      <Text style={[styles.quizHistoryStatValue, { color: colors.text }]}>
                        {new Date(quiz.attemptedAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity 
                    style={[styles.viewResultButton, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      navigation.navigate('QuizResult', { quizId: quiz._id });
                    }}
                  >
                    <Text style={styles.viewResultButtonText}>View Result</Text>
                    <Icon name="arrow-forward" size={16} color="white" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Logout Button */}
        <View style={[styles.logoutContainer, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Icon name="logout" size={20} color={colors.error} />
            <Text style={[styles.logoutButtonText, { color: colors.error }]}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>

        {/* Referral Code Section */}
        <View style={[styles.referralCard, { backgroundColor: colors.surface }]}>
          <View style={styles.referralHeader}>
            <Icon name="vpn-key" size={24} color={colors.primary} />
            <Text style={[styles.referralTitle, { color: colors.text }]}>
              Your Unique Referral Code
            </Text>
          </View>
          
          <View style={styles.referralCodeContainer}>
            <View style={[styles.referralCodeBox, { backgroundColor: colors.primary }]}>
              <Text style={styles.referralCodeText}>
                {user?.referralCode || 'REF123456'}
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.copyButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                // Copy to clipboard functionality
                showMessage({
                  message: 'Referral code copied to clipboard!',
                  type: 'success',
                });
              }}
            >
              <Icon name="content-copy" size={16} color="white" />
              <Text style={styles.copyButtonText}>Copy Code</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.referralInfo, { color: colors.textSecondary }]}>
            💡 Share this code with friends to start earning rewards!
          </Text>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appVersion, { color: colors.textSecondary }]}>Version 1.0.0</Text>
          <Text style={[styles.appName, { color: colors.textSecondary }]}>
            SUBG Quiz App
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  
  // Loading & Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Profile Header
  profileHeader: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  coverPhoto: {
    height: 80,
    position: 'relative',
  },
  coverOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  profileInfo: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: -40,
  },
  profilePictureContainer: {
    position: 'relative',
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileInitial: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FF6B35',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileDetails: {
    flex: 1,
    marginLeft: 16,
    marginBottom: 8,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  userLevel: {
    fontSize: 14,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
    marginBottom: 8,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  // Subscription Status Styles
  subscriptionCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  subscriptionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subscriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  subscriptionInfo: {
    marginBottom: 16,
  },
  subscriptionPlanContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subscriptionPlanLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  subscriptionPlanValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subscriptionExpiryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subscriptionExpiryLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  subscriptionExpiryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  subscriptionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  subscriptionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Rewards & Achievements Styles
  rewardsCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  rewardsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  rewardsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  viewRewardsButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewRewardsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  rewardsStats: {
    marginBottom: 16,
  },
  rewardStatItem: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  rewardStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  rewardStatLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  rewardsInfo: {
    marginTop: 8,
  },
  rewardsInfoText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  // About Section
  aboutCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  aboutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  followStats: {
    flexDirection: 'row',
    gap: 16,
  },
  followStat: {
    alignItems: 'center',
  },
  followCount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  followLabel: {
    fontSize: 12,
  },
  profileInfoSection: {
    padding: 16,
  },
  contactInfo: {
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  contactText: {
    fontSize: 14,
  },
  socialLinks: {
    marginTop: 8,
  },
  socialLinksTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  socialLinksList: {
    gap: 8,
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  socialLinkText: {
    fontSize: 14,
  },

  // Edit Profile Form
  editProfileForm: {
    padding: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  formField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  fieldError: {
    fontSize: 12,
    marginTop: 4,
  },
  socialSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B7280',
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Achievement Card
  achievementCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  achievementText: {
    fontSize: 14,
  },

  // Stats Card
  statsCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },

  // Create Content Card
  createContentCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  createContentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  createContentTitleContainer: {
    flex: 1,
  },
  createContentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  createContentSubtitle: {
    fontSize: 14,
  },
  createContentGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  createContentItem: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  createContentItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  createContentItemSubtitle: {
    fontSize: 12,
    textAlign: 'center',
  },

  // Menu Items
  menuContainer: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  menuItem: {
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuItemText: {
    fontSize: 16,
    flex: 1,
    marginLeft: 16,
  },

  // Bank Details
  bankDetailsCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bankDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  bankDetailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  bankDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  bankDetailsButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  bankDetailsInfo: {
    gap: 12,
  },
  bankDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankDetailLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  bankDetailValue: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  noBankDetailsText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bankForm: {
    gap: 16,
  },
  saveBankButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  saveBankButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Quiz History Styles
  quizHistoryCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quizHistoryHeader: {
    marginBottom: 16,
  },
  quizHistoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  quizHistoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  quizHistorySubtitle: {
    fontSize: 14,
    marginLeft: 28,
  },
  emptyQuizHistory: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyQuizIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyQuizTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyQuizSubtitle: {
    fontSize: 16,
  },
  quizHistoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quizHistoryItem: {
    width: '48%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quizHistoryItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quizHistoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizHistoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  quizHistoryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  quizHistoryQuizTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 18,
  },
  quizHistoryStats: {
    marginBottom: 12,
  },
  quizHistoryStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  quizHistoryStatLabel: {
    fontSize: 12,
  },
  quizHistoryStatValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  viewResultButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  viewResultButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },

  // Logout
  logoutContainer: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },

  // Referral Code Styles
  referralCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  referralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  referralTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  referralCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 12,
  },
  referralCodeBox: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  referralCodeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  copyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  referralInfo: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  // App Info
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  appVersion: {
    fontSize: 14,
    marginBottom: 4,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
  },

  // Profile Completion Styles
  profileCompletionCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileCompletionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileCompletionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileCompletionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  profileCompletionPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  profileCompletionMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  fieldStatusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  fieldStatusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    flex: 1,
    minWidth: '45%',
  },
  fieldStatusName: {
    fontSize: 12,
    flex: 1,
  },
  fieldStatusIcon: {
    fontSize: 14,
    marginLeft: 8,
  },
  rewardInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  rewardInfoText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },

  // Subscription Status Styles
  subscriptionCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  subscriptionInfo: {
    marginBottom: 16,
  },
  subscriptionPlanContainer: {
    marginBottom: 12,
  },
  subscriptionPlanLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  subscriptionPlanValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subscriptionExpiryContainer: {
    marginBottom: 12,
  },
  subscriptionExpiryLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  subscriptionExpiryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  subscriptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  subscriptionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;