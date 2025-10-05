import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { SOCIAL_LINKS } from '../../config/env';
import API from '../../services/api';
import { showMessage } from 'react-native-flash-message';
import TopBar from '../../components/TopBar';
import Button from '../../components/Button';

const ContactUsScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      const response = await API.submitContactForm(formData);

      if (response.success) {
        showMessage({
          message: 'Message sent successfully! We\'ll get back to you soon.',
          type: 'success',
        });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        showMessage({
          message: 'Failed to send message. Please try again.',
          type: 'danger',
        });
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      showMessage({
        message: 'Failed to send message. Please try again.',
        type: 'danger',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSocialPress = (platform) => {
    const platformMap = {
      facebook: SOCIAL_LINKS.FACEBOOK_URL,
        
      twitter: SOCIAL_LINKS.X_URL,
      instagram: SOCIAL_LINKS.INSTAGRAM_URL,
      youtube: SOCIAL_LINKS.YOUTUBE_URL,
      linkedin: SOCIAL_LINKS.LINKEDIN_URL,
    };
    
    const url = platformMap[platform];
    if (url) Linking.openURL(url);
  };

  const handleEmailPress = () => {
    Linking.openURL('mailto:support@subgquiz.com');
  };

  const handlePhonePress = () => {
    Linking.openURL('tel:+1234567890');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title="Contact Us"
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
          <Text style={styles.headerTitle}>Get in Touch</Text>
          <Text style={styles.headerSubtitle}>
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </Text>
        </LinearGradient>

        {/* Contact Form */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Send us a Message
          </Text>
          
          <View style={[styles.form, { backgroundColor: colors.surface }]}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Name *</Text>
              <TextInput
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.border, backgroundColor: colors.background },
                ]}
                placeholder="Your full name"
                placeholderTextColor={colors.textSecondary}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Email *</Text>
              <TextInput
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.border, backgroundColor: colors.background },
                ]}
                placeholder="your.email@example.com"
                placeholderTextColor={colors.textSecondary}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Subject *</Text>
              <TextInput
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.border, backgroundColor: colors.background },
                ]}
                placeholder="What's this about?"
                placeholderTextColor={colors.textSecondary}
                value={formData.subject}
                onChangeText={(value) => handleInputChange('subject', value)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Message *</Text>
              <TextInput
                style={[
                  styles.textArea,
                  { color: colors.text, borderColor: colors.border, backgroundColor: colors.background },
                ]}
                placeholder="Tell us more about your inquiry..."
                placeholderTextColor={colors.textSecondary}
                value={formData.message}
                onChangeText={(value) => handleInputChange('message', value)}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>

            <Button
              title={submitting ? "Sending..." : "Send Message"}
              onPress={handleSubmit}
              disabled={submitting}
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              textStyle={{ color: 'white' }}
            />
          </View>
        </View>

        {/* Contact Information */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Other Ways to Reach Us
          </Text>
          
          <View style={styles.contactInfo}>
            <TouchableOpacity
              style={[styles.contactItem, { backgroundColor: colors.background }]}
              onPress={handleEmailPress}
            >
              <Icon name="email" size={24} color={colors.primary} />
              <View style={styles.contactDetails}>
                <Text style={[styles.contactTitle, { color: colors.text }]}>Email</Text>
                <Text style={[styles.contactValue, { color: colors.textSecondary }]}>
                  support@subgquiz.com
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactItem, { backgroundColor: colors.background }]}
              onPress={handlePhonePress}
            >
              <Icon name="phone" size={24} color={colors.primary} />
              <View style={styles.contactDetails}>
                <Text style={[styles.contactTitle, { color: colors.text }]}>Phone</Text>
                <Text style={[styles.contactValue, { color: colors.textSecondary }]}>
                  +1 (234) 567-8900
                </Text>
              </View>
            </TouchableOpacity>

            <View style={[styles.contactItem, { backgroundColor: colors.background }]}>
              <Icon name="location-on" size={24} color={colors.primary} />
              <View style={styles.contactDetails}>
                <Text style={[styles.contactTitle, { color: colors.text }]}>Address</Text>
                <Text style={[styles.contactValue, { color: colors.textSecondary }]}>
                  123 Education Street{'\n'}
                  Learning City, LC 12345
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Social Media */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Follow Us
          </Text>
          
          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: colors.primary }]}
              onPress={() => handleSocialPress('facebook')}
            >
              <Icon name="facebook" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: colors.primary }]}
              onPress={() => handleSocialPress('twitter')}
            >
              <Icon name="twitter" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: colors.primary }]}
              onPress={() => handleSocialPress('instagram')}
            >
              <Icon name="instagram" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: colors.primary }]}
              onPress={() => handleSocialPress('youtube')}
            >
              <Icon name="youtube" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: colors.primary }]}
              onPress={() => handleSocialPress('linkedin')}
            >
              <Icon name="linkedin" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Frequently Asked Questions
          </Text>
          
          <View style={styles.faqContainer}>
            <View style={styles.faqItem}>
              <Text style={[styles.faqQuestion, { color: colors.text }]}>
                How do I reset my password?
              </Text>
              <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
                Go to the login screen and tap "Forgot Password". Enter your email and follow the instructions.
              </Text>
            </View>

            <View style={styles.faqItem}>
              <Text style={[styles.faqQuestion, { color: colors.text }]}>
                How do I earn money by posting questions?
              </Text>
              <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
                Post quality questions and earn ₹10 for each approved question. Questions are reviewed before approval.
              </Text>
            </View>

            <View style={styles.faqItem}>
              <Text style={[styles.faqQuestion, { color: colors.text }]}>
                Can I use the app offline?
              </Text>
              <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
                Some features work offline, but you'll need an internet connection for most quiz activities.
              </Text>
            </View>
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
    padding: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
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
    lineHeight: 24,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  form: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    height: 120,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  contactInfo: {
    gap: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  contactDetails: {
    marginLeft: 16,
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 14,
    lineHeight: 20,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faqContainer: {
    gap: 20,
  },
  faqItem: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ContactUsScreen;