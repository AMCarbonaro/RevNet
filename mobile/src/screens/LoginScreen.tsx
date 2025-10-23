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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import authService from '../services/auth';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      
      const success = await authService.login(email, password);
      
      if (success) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        Alert.alert('Error', 'Invalid email or password.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      setLoading(true);
      
      const success = await authService.loginWithBiometric();
      
      if (success) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        Alert.alert('Error', 'Biometric authentication failed.');
      }
    } catch (error) {
      console.error('Biometric login error:', error);
      Alert.alert('Error', 'Biometric authentication is not available.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setLoading(true);
      
      const success = await authService.loginAsDemo();
      
      if (success) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        Alert.alert('Error', 'Demo login failed.');
      }
    } catch (error) {
      console.error('Demo login error:', error);
      Alert.alert('Error', 'Demo login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#000000', '#001100']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Icon name="menu-book" size={48} color="#00ff88" />
          <Text style={styles.title}>Revolution Network</Text>
          <Text style={styles.subtitle}>Enter the Matrix</Text>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Icon name="email" size={20} color="#00ff88" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#666666"
              value={email}
              onChangeText={setEmail}
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
              value={password}
              onChangeText={setPassword}
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

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <>
                <Icon name="login" size={20} color="#000000" />
                <Text style={styles.loginButtonText}>Login</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Biometric Login */}
          <TouchableOpacity
            style={styles.biometricButton}
            onPress={handleBiometricLogin}
            disabled={loading}
          >
            <Icon name="fingerprint" size={24} color="#00ff88" />
            <Text style={styles.biometricButtonText}>Use Biometric</Text>
          </TouchableOpacity>

          {/* Demo Login */}
          <TouchableOpacity
            style={styles.demoButton}
            onPress={handleDemoLogin}
            disabled={loading}
          >
            <Icon name="play-circle" size={20} color="#ff6b6b" />
            <Text style={styles.demoButtonText}>Try Demo Mode</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerText}>
              Don't have an account? <Text style={styles.linkText}>Sign up</Text>
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.footerText}>
              <Text style={styles.linkText}>Forgot Password?</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
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
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00ff88',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#00ff88',
  },
  biometricButtonText: {
    color: '#00ff88',
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff6b6b20',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  demoButtonText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  footerText: {
    color: '#666666',
    fontSize: 14,
    fontFamily: 'monospace',
    marginBottom: 16,
  },
  linkText: {
    color: '#00ff88',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
