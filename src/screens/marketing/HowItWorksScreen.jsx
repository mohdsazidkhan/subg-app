import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import TopBar from '../../components/TopBar';
import Button from '../../components/Button';

const HowItWorksScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const steps = [
    {
      number: 1,
      title: 'Create Your Account',
      description: 'Sign up with your email or social media account to get started.',
      icon: 'person-add',
    },
    {
      number: 2,
      title: 'Choose Your Level',
      description: 'Select from beginner to advanced levels based on your knowledge.',
      icon: 'trending-up',
    },
    {
      number: 3,
      title: 'Take Quizzes',
      description: 'Answer questions across various categories and difficulty levels.',
      icon: 'quiz',
    },
    {
      number: 4,
      title: 'Track Progress',
      description: 'Monitor your performance and see your improvement over time.',
      icon: 'analytics',
    },
    {
      number: 5,
      title: 'Compete & Learn',
      description: 'Climb leaderboards and compete with other students globally.',
      icon: 'emoji-events',
    },
    {
      number: 6,
      title: 'Earn Rewards',
      description: 'Get points, badges, and recognition for your achievements.',
      icon: 'card-giftcard',
    },
  ];

  const features = [
    {
      title: 'Interactive Learning',
      description: 'Engage with thousands of questions designed to test and improve your knowledge.',
      icon: 'school',
    },
    {
      title: 'Real-time Competition',
      description: 'Compete with other students in real-time and see live leaderboards.',
      icon: 'timer',
    },
    {
      title: 'Personalized Experience',
      description: 'Get questions tailored to your level and learning preferences.',
      icon: 'tune',
    },
    {
      title: 'Progress Tracking',
        description: 'Detailed analytics help you understand your strengths and weaknesses.',
      icon: 'bar-chart',
    },
  ];

  const renderStep = step => (
    <View key={step.number} style={[styles.stepCard, { backgroundColor: colors.surface }]}>
      <View style={styles.stepHeader}>
        <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
          <Text style={styles.stepNumberText}>{step.number}</Text>
        </View>
        <View style={styles.stepIcon}>
          <Icon name={step.icon} size={30} color={colors.primary} />
        </View>
      </View>
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        {step.title}
      </Text>
      <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
        {step.description}
      </Text>
    </View>
  );

  const renderFeature = feature => (
    <View key={feature.title} style={[styles.featureCard, { backgroundColor: colors.surface }]}>
      <View style={[styles.featureIcon, { backgroundColor: colors.primary + '20' }]}>
        <Icon name={feature.icon} size={24} color={colors.primary} />
      </View>
      <Text style={[styles.featureTitle, { color: colors.text }]}>
        {feature.title}
      </Text>
      <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
        {feature.description}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title="How It Works"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerDecorations}>
            <View style={[styles.headerBubble, styles.headerBubbleTopLeft]} />
            <View style={[styles.headerBubble, styles.headerBubbleBottomRight]} />
          </View>
          <Text style={styles.headerTitle}>How SUBG QUIZ Works</Text>
          <Text style={styles.headerSubtitle}>Learn how to get the most out of our platform</Text>
        </LinearGradient>

        {/* Steps Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Getting Started
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Follow these simple steps to begin your learning journey
          </Text>
          <View style={styles.stepsContainer}>
            {steps.map(renderStep)}
          </View>
        </View>

        {/* Features Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Key Features
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Discover what makes our platform special
          </Text>
          <View style={styles.featuresContainer}>
            {features.map(renderFeature)}
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Pro Tips
          </Text>
          <View style={[styles.tipsCard, { backgroundColor: colors.primary + '10' }]}>
            <Text style={[styles.tipTitle, { color: colors.primary }]}>
              💡 Maximize Your Learning
            </Text>
            <Text style={[styles.tipText, { color: colors.text }]}>
              • Take quizzes regularly to maintain consistency{'\n'}
              • Review explanations to understand concepts better{'\n'}
              • Challenge yourself with higher difficulty levels{'\n'}
              • Participate in community discussions{'\n'}
              • Set daily goals to stay motivated
            </Text>
          </View>
        </View>

        {/* CTA Section */}
        <View style={[styles.ctaSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.ctaTitle, { color: colors.text }]}>
            Ready to Start Learning?
          </Text>
          <Text style={[styles.ctaDescription, { color: colors.textSecondary }]}>
            Join thousands of students who are already improving their knowledge
          </Text>
          <View style={styles.ctaButtons}>
            <Button
              title="Get Started"
              onPress={() => navigation.navigate('Auth')}
              style={[styles.ctaButton, { backgroundColor: colors.primary }]}
              textStyle={styles.ctaPrimaryText}
            />
            <Button
              title="Learn More"
              onPress={() => navigation.navigate('AboutUs')}
              style={[styles.ctaButton, styles.ctaButtonSecondary]}
              textStyle={{ color: colors.primary }}
            />
          </View>
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
    padding: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
  },
  headerDecorations: {
    position: 'absolute',
    inset: 0,
  },
  headerBubble: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  headerBubbleTopLeft: {
    top: -20,
    left: -30,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  headerBubbleBottomRight: {
    bottom: -30,
    right: -30,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  stepsContainer: {
    gap: 16,
  },
  stepCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  stepIcon: {
    flex: 1,
    alignItems: 'flex-end',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  featuresContainer: {
    gap: 16,
  },
  featureCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    flex: 1,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  tipsCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  },
  ctaSection: {
    padding: 20,
    alignItems: 'center',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  ctaButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  ctaButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 120,
  },
  ctaButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  ctaPrimaryText: {
    color: 'white',
  },
});

export default HowItWorksScreen;