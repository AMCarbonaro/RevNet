import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import authService from '../services/auth';
import pushNotificationService from '../services/push-notifications';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  stats: {
    totalDonations: number;
    totalProjects: number;
    totalLettersRead: number;
  };
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    darkMode: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    biometricEnabled: boolean;
    lastLogin: string;
  };
}

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    biometricEnabled: false,
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    pushNotifications: true,
    emailUpdates: true,
    projectUpdates: true,
    letterUpdates: true,
    donationUpdates: true,
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const currentUser = authService.getCurrentUser();
      
      if (currentUser) {
        // Try to fetch updated profile from API
        if (await authService.isOnline()) {
          const response = await fetch('/api/user/profile');
          if (response.ok) {
            const profileData = await response.json();
            setUser(profileData);
          } else {
            setUser(currentUser);
          }
        } else {
          setUser(currentUser);
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      Alert.alert('Error', 'Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    if (user) {
      setEditForm({
        name: user.name,
        bio: user.bio || '',
      });
      setShowEditModal(true);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const updatedUser = { ...user, ...editForm };
        setUser(updatedUser);
        setShowEditModal(false);
        Alert.alert('Success', 'Profile updated successfully!');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
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
            await authService.logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Auth' }],
            });
          },
        },
      ]
    );
  };

  const handleToggleTwoFactor = async () => {
    try {
      const newValue = !securitySettings.twoFactorEnabled;
      
      if (newValue) {
        // Enable 2FA
        const response = await fetch('/api/auth/2fa/setup', {
          method: 'POST',
        });
        
        if (response.ok) {
          const { qrCode, secret } = await response.json();
          Alert.alert(
            '2FA Setup',
            'Scan the QR code with your authenticator app',
            [{ text: 'OK' }]
          );
          setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: true }));
        }
      } else {
        // Disable 2FA
        const response = await fetch('/api/auth/2fa/disable', {
          method: 'POST',
        });
        
        if (response.ok) {
          setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: false }));
          Alert.alert('Success', '2FA has been disabled.');
        }
      }
    } catch (error) {
      console.error('Error toggling 2FA:', error);
      Alert.alert('Error', 'Failed to update 2FA settings.');
    }
  };

  const handleToggleBiometric = async () => {
    try {
      const newValue = !securitySettings.biometricEnabled;
      
      if (newValue) {
        const success = await authService.enableBiometric();
        if (success) {
          setSecuritySettings(prev => ({ ...prev, biometricEnabled: true }));
        }
      } else {
        await authService.disableBiometric();
        setSecuritySettings(prev => ({ ...prev, biometricEnabled: false }));
      }
    } catch (error) {
      console.error('Error toggling biometric:', error);
      Alert.alert('Error', 'Failed to update biometric settings.');
    }
  };

  const handleToggleNotification = async (key: string) => {
    try {
      const newValue = !notificationSettings[key as keyof typeof notificationSettings];
      setNotificationSettings(prev => ({ ...prev, [key]: newValue }));
      
      // Update server preferences
      await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notifications: {
            ...notificationSettings,
            [key]: newValue,
          },
        }),
      });

      // Update local notification settings
      if (key === 'pushNotifications') {
        if (newValue) {
          await pushNotificationService.requestPermission();
        } else {
          await pushNotificationService.unsubscribe();
        }
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      Alert.alert('Error', 'Failed to update notification settings.');
    }
  };

  const renderStatCard = (icon: string, value: string, label: string, color: string) => (
    <View style={styles.statCard}>
      <LinearGradient
        colors={[`${color}20`, `${color}10`]}
        style={styles.statCardGradient}
      >
        <Icon name={icon} size={24} color={color} />
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </LinearGradient>
    </View>
  );

  const renderEditModal = () => (
    <Modal
      visible={showEditModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={() => setShowEditModal(false)}>
            <Icon name="close" size={24} color="#00ff88" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.modalContent}>
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#666666"
            value={editForm.name}
            onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))}
          />
          
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Bio"
            placeholderTextColor="#666666"
            value={editForm.bio}
            onChangeText={(text) => setEditForm(prev => ({ ...prev, bio: text }))}
            multiline
            numberOfLines={4}
          />
        </View>
        
        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowEditModal(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveProfile}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderSecurityModal = () => (
    <Modal
      visible={showSecurityModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Security Settings</Text>
          <TouchableOpacity onPress={() => setShowSecurityModal(false)}>
            <Icon name="close" size={24} color="#00ff88" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.modalContent}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="security" size={24} color="#00ff88" />
              <View style={styles.settingDetails}>
                <Text style={styles.settingTitle}>Two-Factor Authentication</Text>
                <Text style={styles.settingDescription}>
                  Add an extra layer of security to your account
                </Text>
              </View>
            </View>
            <Switch
              value={securitySettings.twoFactorEnabled}
              onValueChange={handleToggleTwoFactor}
              trackColor={{ false: '#333333', true: '#00ff88' }}
              thumbColor={securitySettings.twoFactorEnabled ? '#000000' : '#ffffff'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="fingerprint" size={24} color="#00ff88" />
              <View style={styles.settingDetails}>
                <Text style={styles.settingTitle}>Biometric Authentication</Text>
                <Text style={styles.settingDescription}>
                  Use fingerprint or face recognition to sign in
                </Text>
              </View>
            </View>
            <Switch
              value={securitySettings.biometricEnabled}
              onValueChange={handleToggleBiometric}
              trackColor={{ false: '#333333', true: '#00ff88' }}
              thumbColor={securitySettings.biometricEnabled ? '#000000' : '#ffffff'}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderNotificationModal = () => (
    <Modal
      visible={showNotificationModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Notification Settings</Text>
          <TouchableOpacity onPress={() => setShowNotificationModal(false)}>
            <Icon name="close" size={24} color="#00ff88" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.modalContent}>
          {Object.entries(notificationSettings).map(([key, value]) => (
            <View key={key} style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="notifications" size={24} color="#00ff88" />
                <View style={styles.settingDetails}>
                  <Text style={styles.settingTitle}>
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                  </Text>
                  <Text style={styles.settingDescription}>
                    {value ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>
              </View>
              <Switch
                value={value}
                onValueChange={() => handleToggleNotification(key)}
                trackColor={{ false: '#333333', true: '#00ff88' }}
                thumbColor={value ? '#000000' : '#ffffff'}
              />
            </View>
          ))}
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="person" size={48} color="#00ff88" />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error" size={48} color="#ff6b6b" />
        <Text style={styles.errorText}>Failed to load profile</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <LinearGradient
        colors={['#00ff8820', '#00ff8805']}
        style={styles.profileHeader}
      >
        <View style={styles.avatarContainer}>
          <Icon name="person" size={48} color="#00ff88" />
        </View>
        
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        
        {user.bio && (
          <Text style={styles.userBio}>{user.bio}</Text>
        )}
        
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Icon name="edit" size={16} color="#000000" />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Your Impact</Text>
        <View style={styles.statsGrid}>
          {renderStatCard(
            'favorite',
            `$${user.stats.totalDonations.toLocaleString()}`,
            'Donated',
            '#ff6b6b'
          )}
          {renderStatCard(
            'work',
            user.stats.totalProjects.toString(),
            'Projects',
            '#4ecdc4'
          )}
          {renderStatCard(
            'menu-book',
            user.stats.totalLettersRead.toString(),
            'Letters Read',
            '#45b7d1'
          )}
        </View>
      </View>

      {/* Settings Section */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => setShowSecurityModal(true)}
        >
          <View style={styles.settingInfo}>
            <Icon name="security" size={24} color="#00ff88" />
            <Text style={styles.settingTitle}>Security</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#666666" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => setShowNotificationModal(true)}
        >
          <View style={styles.settingInfo}>
            <Icon name="notifications" size={24} color="#00ff88" />
            <Text style={styles.settingTitle}>Notifications</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#666666" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="privacy-tip" size={24} color="#00ff88" />
            <Text style={styles.settingTitle}>Privacy</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#666666" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="help" size={24} color="#00ff88" />
            <Text style={styles.settingTitle}>Help & Support</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#666666" />
        </TouchableOpacity>
      </View>

      {/* Logout Section */}
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={24} color="#ff6b6b" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {renderEditModal()}
      {renderSecurityModal()}
      {renderNotificationModal()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#00ff88',
    fontSize: 16,
    fontFamily: 'monospace',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontFamily: 'monospace',
    marginTop: 16,
  },
  profileHeader: {
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#00ff8820',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#00ff88',
  },
  userName: {
    fontSize: 24,
    color: '#00ff88',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666666',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  userBio: {
    fontSize: 14,
    color: '#cccccc',
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00ff88',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#000000',
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  statsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#00ff88',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  statCardGradient: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00ff8820',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'monospace',
    marginTop: 4,
  },
  settingsSection: {
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111111',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#00ff8820',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingDetails: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#ffffff',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  settingDescription: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  logoutSection: {
    padding: 20,
    paddingBottom: 40,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff6b6b20',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  logoutButtonText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#00ff8820',
  },
  modalTitle: {
    fontSize: 20,
    color: '#00ff88',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  input: {
    backgroundColor: '#111111',
    borderRadius: 8,
    padding: 16,
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'monospace',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#00ff8820',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#00ff8820',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00ff88',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#00ff88',
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#00ff88',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
