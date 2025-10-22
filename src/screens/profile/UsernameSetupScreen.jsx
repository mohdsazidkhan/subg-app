import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config/env';

const UsernameSetupScreen = ({ navigation, route }) => {
  const { currentUsername } = route.params || {};
  const { user } = useAuth();
  const [username, setUsername] = useState(currentUsername || '');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Debounce username availability check
    const timer = setTimeout(() => {
      if (username && username !== currentUsername && username.length >= 3) {
        checkUsernameAvailability();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username, currentUsername, checkUsernameAvailability]);

  const checkUsernameAvailability = async () => {
    try {
      setChecking(true);
      const response = await axios.get(
        `${API_URL}/api/student/check-username?username=${username}`
      );

      if (response.data.success) {
        setAvailable(response.data.available);
        setMessage(response.data.message);
      }
    } catch (error) {
      console.error('Failed to check username:', error);
      setMessage('Failed to check username availability');
      setAvailable(false);
    } finally {
      setChecking(false);
    }
  };

  const handleUsernameChange = (value) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(sanitized);
    setAvailable(null);
    setMessage('');
  };

  const handleSave = async () => {
    if (!username || username.length < 3 || username.length > 20) {
      Alert.alert('Invalid Username', 'Username must be 3-20 characters');
      return;
    }

    if (!available && username !== currentUsername) {
      Alert.alert('Username Taken', 'Please choose an available username');
      return;
    }

    try {
      setSaving(true);
      const response = await axios.put(
        `${API_URL}/api/student/username`,
        { username },
        {
          headers: { Authorization: `Bearer ${user.token}` }
        }
      );

      if (response.data.success) {
        Alert.alert('Success', 'Username updated successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to update username:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update username');
    } finally {
      setSaving(false);
    }
  };

  const isValid = username.length >= 3 && username.length <= 20;
  const canSave = isValid && (username === currentUsername || available === true);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Set Your Username</Text>
        <Text style={styles.subtitle}>
          Choose a unique username that others can use to find and follow you.
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.prefix}>@</Text>
          <TextInput
            style={[
              styles.input,
              available === true && styles.inputValid,
              available === false && styles.inputInvalid,
            ]}
            value={username}
            onChangeText={handleUsernameChange}
            placeholder="username"
            placeholderTextColor="#999"
            maxLength={20}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {checking && (
            <ActivityIndicator
              size="small"
              color="#007bff"
              style={styles.indicator}
            />
          )}
          {available === true && username !== currentUsername && (
            <Text style={styles.iconSuccess}>✓</Text>
          )}
          {available === false && (
            <Text style={styles.iconError}>✗</Text>
          )}
        </View>

        <View style={styles.rulesContainer}>
          <Text style={styles.rulesTitle}>Username Rules:</Text>
          <Text style={styles.rule}>• 3-20 characters</Text>
          <Text style={styles.rule}>• Only letters, numbers, and underscores</Text>
          <Text style={styles.rule}>• No spaces or special characters</Text>
        </View>

        {message && (
          <View
            style={[
              styles.messageBox,
              available === true && styles.messageSuccess,
              available === false && styles.messageError,
            ]}
          >
            <Text style={styles.messageText}>{message}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!canSave || saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Username</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 25,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  prefix: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginRight: 5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 12,
    color: '#333',
  },
  inputValid: {
    color: '#28a745',
  },
  inputInvalid: {
    color: '#dc3545',
  },
  indicator: {
    marginLeft: 10,
  },
  iconSuccess: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28a745',
    marginLeft: 10,
  },
  iconError: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc3545',
    marginLeft: 10,
  },
  rulesContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  rulesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  rule: {
    fontSize: 13,
    color: '#666',
    lineHeight: 22,
  },
  messageBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  messageSuccess: {
    backgroundColor: '#d4edda',
    borderWidth: 1,
    borderColor: '#c3e6cb',
  },
  messageError: {
    backgroundColor: '#f8d7da',
    borderWidth: 1,
    borderColor: '#f5c6cb',
  },
  messageText: {
    fontSize: 14,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#6c757d',
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UsernameSetupScreen;
