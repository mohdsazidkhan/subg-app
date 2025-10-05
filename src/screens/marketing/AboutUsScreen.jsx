import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';
import Button from '../../components/Button';

const AboutUsScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();

  const handleLanguageToggle = async () => {
    const newLanguage = currentLanguage === 'en' ? 'hi' : 'en';
    await changeLanguage(newLanguage);
  };

  const handleSocialMediaPress = async (url) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening social media:', error);
    }
  };

  const renderFeatureItem = (icon, title, description) => (
    <View style={styles.featureItem}>
      <View style={[styles.featureIcon, { backgroundColor: colors.primary + '20' }]}>
        <Icon name={icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.featureContent}>
        <Text style={[styles.featureTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
    </View>
  );

  const renderTeamMember = (name, role, avatar) => (
    <Card key={name} style={styles.teamMemberCard}>
      <View style={styles.teamMemberContent}>
        <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary + '20' }]}>
          <Icon name="person" size={32} color={colors.primary} />
        </View>
        <View style={styles.teamMemberInfo}>
          <Text style={[styles.memberName, { color: colors.text }]}>
            {name}
          </Text>
          <Text style={[styles.memberRole, { color: colors.textSecondary }]}>
            {role}
          </Text>
        </View>
      </View>
    </Card>
  );

  const renderStatItem = (icon, value, label) => (
    <View style={styles.statItem}>
      <Icon name={icon} size={24} color={colors.primary} />
      <Text style={[styles.statValue, { color: colors.text }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
    </View>
  );

  const teamMembers = [
    { name: 'Dr. Akash Kumar', role: 'Founder & CEO', avatar: null },
    { name: 'Priya Singh', role: 'CTO', avatar: null },
    { name: 'Rajesh Patel', role: 'Head of Content', avatar: null },
    { name: 'Anita Sharma', role: 'Marketing Director', avatar: null },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title="About Us"
        showBackButton={true}
        showLanguageToggle={true}
        onBackPress={() => navigation.goBack()}
        onLanguageToggle={handleLanguageToggle}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={colors.backgroundGradient} style={styles.header}>
          <View style={styles.headerContent}>
            <Icon name="info" size={40} color="white" />
            <Text style={styles.headerTitle}>About SUBG</Text>
            <Text style={styles.headerSubtitle}>
              Empowering learning through interactive quizzes and comprehensive education
            </Text>
          </View>
        </LinearGradient>

        {/* Company Stats */}
        <Card style={styles.statsCard}>
          <Text style={[styles.statsTitle, { color: colors.text }]}>
            Our Impact
          </Text>
          <View style={styles.statsContainer}>
            {renderStatItem('people', '500K+', 'Students')}
            {renderStatItem('quiz', '50K+', 'Quizzes')}
            {renderStatItem('school', '1000+', 'Topics')}
            {renderStatItem('emoji-events', '10K+', 'Certificates')}
          </View>
        </Card>

        {/* Mission Section */}
        <Card style={styles.missionCard}>
          <View style={styles.missionContent}>
            <Icon name="visibility" size={32} color={colors.primary} />
            <Text style={[styles.missionTitle, { color: colors.text }]}>
              Our Mission
            </Text>
            <Text style={[styles.missionDescription, { color: colors.textSecondary }]}>
              To make quality education accessible to everyone through innovative e-learning solutions. 
              We believe that interactive learning experiences create better outcomes for students 
              of all backgrounds and learning styles.
            </Text>
          </View>
        </Card>

        {/* Vision Section */}
        <Card style={styles.visionCard}>
          <View style={styles.visionContent}>
            <Icon name="star" size={32} color={colors.success} />
            <Text style={[styles.visionTitle, { color: colors.text }]}>
              Our Vision
            </Text>
            <Text style={[styles.visionDescription, { color: colors.textSecondary }]}>
              To become the leading platform for interactive learning and assessment solutions,
              empowering educators and learners worldwide to achieve their educational goals
              through technology and innovation.
            </Text>
          </View>
        </Card>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={[styles.featuresTitle, { color: colors.text }]}>
            What Makes Us Different
          </Text>
          
          <View style={styles.featuresContainer}>
            {renderFeatureItem(
              'school',
              'Comprehensive Curriculum',
              'Covering subjects from K-12 to competitive exams with expert-created content.'
            )}
            {renderFeatureItem(
              'quiz',
              'Interactive Learning',
              'Engaging quizzes and assessments that adapt to individual learning pace.'
            )}
            {renderFeatureItem(
              'analytics',
              'Smart Analytics',
              'Detailed performance tracking and personalized learning recommendations.'
            )}
            {renderFeatureItem(
              'accessibility',
              'Accessible Design',
              'Making education inclusive for learners with diverse needs and abilities.'
            )}
          </View>
        </View>

        {/* Team Section */}
        <View style={styles.teamSection}>
          <Text style={[styles.teamTitle, { color: colors.text }]}>
            Meet Our Team
          </Text>
          <Text style={[styles.teamSubtitle, { color: colors.textSecondary }]}>
            Passionate educators and technologists working together
          </Text>
          
          <View style={styles.teamContainer}>
            {teamMembers.map((member) => renderTeamMember(member.name, member.role, member.avatar))}
          </View>
        </View>

        {/* Contact Section */}
        <Card style={styles.contactCard}>
          <Text style={[styles.contactTitle, { color: colors.text }]}>
            Get In Touch
          </Text>
          <Text style={[styles.contactDescription, { color: colors.textSecondary }]}>
            Have questions or feedback? We'd love to hear from you!
          </Text>
          
          <View style={styles.contactOptions}>
            <TouchableOpacity
              style={styles.contactOption}
              onPress={() => navigation.navigate('ContactUs')}
            >
              <Icon name="email" size={20} color={colors.primary} />
              <Text style={[styles.contactOptionText, { color: colors.text }]}>
                Contact Us
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.contactOption}
              onPress={() => handleSocialMediaPress('https://www.linkedin.com/company/subg')}
            >
              <Icon name="linkedin" size={20} color={colors.primary} />
              <Text style={[styles.contactOptionText, { color: colors.text }]}>
                LinkedIn
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.contactOption}
              onPress={() => handleSocialMediaPress('https://twitter.com/subg_app')}
            >
              <Icon name="twitter" size={20} color={colors.primary} />
              <Text style={[styles.contactOptionText, { color: colors.text }]}>
                Twitter
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Company Info */}
        <View style={styles.companyInfo}>
          <Text style={[styles.companyName, { color: colors.textSecondary }]}>
            SUBG Education Technologies Pvt. Ltd.
          </Text>
          <Text style={[styles.companyAddress, { color: colors.textSecondary }]}>
            Mumbai, Maharashtra, India
          </Text>
          <Text style={[styles.companyFounded, { color: colors.textSecondary }]}>
            Established 2023
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
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  statsCard: {
    margin: 20,
    marginTop: 16,
    padding: 20,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  missionCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
  },
  missionContent: {
    alignItems: 'center',
  },
  missionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 12,
  },
  missionDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  visionCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
  },
  visionContent: {
    alignItems: 'center',
  },
  visionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 12,
  },
  visionDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  featuresContainer: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  teamSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  teamTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  teamSubtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  teamContainer: {
    gap: 12,
  },
  teamMemberCard: {
    padding: 16,
  },
  teamMemberContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  teamMemberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 14,
  },
  contactCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  contactDescription: {
    fontSize: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  contactOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  contactOption: {
    alignItems: 'center',
    padding: 12,
  },
  contactOptionText: {
    fontSize: 14,
    marginTop: 4,
  },
  companyInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  companyAddress: {
    fontSize: 14,
    marginBottom: 4,
  },
  companyFounded: {
    fontSize: 14,
  },
});

export default AboutUsScreen;