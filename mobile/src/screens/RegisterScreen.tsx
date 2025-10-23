import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import authService from '../services/auth';

interface RegisterScreenProps {
  navigation: any;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return false;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return false;
    }

    if (!acceptTerms) {
      Alert.alert('Error', 'Please accept the terms and conditions.');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const success = await authService.register(
        formData.name,
        formData.email,
        formData.password
      );
      
      if (success) {
        Alert.alert(
          'Success',
          'Account created successfully! Please check your email for verification.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthRegister = async (provider: 'google' | 'github' | 'discord') => {
    try {
      setLoading(true);
      
      const success = await authService.loginWithOAuth(provider);
      
      if (success) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        Alert.alert('Error', `${provider} registration failed.`);
      }
    } catch (error) {
      console.error(`${provider} registration error:`, error);
      Alert.alert('Error', `${provider} registration failed. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <LinearGradient
          colors={['#000000', '#001100']}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <Icon name="person-add" size={48} color="#00ff88" />
            <Text style={styles.title}>Join the Revolution</Text>
            <Text style={styles.subtitle}>Create your account</Text>
          </View>

          {/* OAuth Buttons */}
          <View style={styles.oauthContainer}>
            <TouchableOpacity
              style={styles.oauthButton}
              onPress={() => handleOAuthRegister('google')}
              disabled={loading}
            >
              <Icon name="google" size={20} color="#ffffff" />
              <Text style={styles.oauthButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.oauthButton}
              onPress={() => handleOAuthRegister('github')}
              disabled={loading}
            >
              <Icon name="code" size={20} color="#ffffff" />
              <Text style={styles.oauthButtonText}>Continue with GitHub</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.oauthButton}
              onPress={() => handleOAuthRegister('discord')}
              disabled={loading}
            >
              <Icon name="chat" size={20} color="#ffffff" />
              <Text style={styles.oauthButtonText}>Continue with Discord</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Registration Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Icon name="person" size={20} color="#00ff88" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#666666"
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="email" size={20} color="#00ff88" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#666666"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="lock" size={20} color="#00ff88" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#666666"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Icon
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={20}
                  color="#666666"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Icon name="lock" size={20} color="#00ff88" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#666666"
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Icon
                  name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                  size={20}
                  color="#666666"
                />
              </TouchableOpacity>
            </View>

            {/* Terms and Conditions */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setAcceptTerms(!acceptTerms)}
            >
              <View style={[styles.checkbox, acceptTerms && styles.checkedBox]}>
                {acceptTerms && <Icon name="check" size={16} color="#000000" />}
              </View>
              <Text style={styles.termsText}>
                I agree to the <Text style={styles.linkText}>Terms of Service</Text> and <Text style={styles.linkText}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.disabledButton]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <>
                  <Icon name="person-add" size={20} color="#000000" />
                  <Text style={styles.registerButtonText}>Create Account</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerText}>
                Already have an account? <Text style={styles.linkText}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    color: '#00ff88',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    fontFamily: 'monospace',
    marginTop: 8,
  },
  oauthContainer: {
    paddingHorizontal: 32,
    marginBottom: 20,
  },
  oauthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#00ff8820',
  },
  oauthButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#00ff8820',
  },
  dividerText: {
    color: '#666666',
    fontSize: 14,
    fontFamily: 'monospace',
    paddingHorizontal: 16,
  },
  formContainer: {
    paddingHorizontal: 32,
    paddingVertical: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#00ff8820',
  },
  inputIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    padding: 16,
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'monospace',
  },
  eyeIcon: {
    marginRight: 16,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#00ff88',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#00ff88',
  },
  termsText: {
    flex: 1,
    color: '#666666',
    fontSize: 14,
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  linkText: {
    color: '#00ff88',
    fontWeight: 'bold',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00ff88',
    padding: 16,
    borderRadius: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 20,
    paddingBottom: 40,
  },
  footerText: {
    color: '#666666',
    fontSize: 14,
    fontFamily: 'monospace',
  },
});

export default RegisterScreen;
