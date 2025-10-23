import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import authService from '../services/auth';
import offlineService from '../services/offline';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [isOnline, setIsOnline] = useState(true);
  const [pendingActions, setPendingActions] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Subscribe to auth state changes
    const authUnsubscribe = authService.subscribe((state) => {
      setUser(state.user);
    });

    // Subscribe to offline state changes
    const offlineUnsubscribe = offlineService.subscribe((state) => {
      setIsOnline(state.isOnline);
      setPendingActions(state.pendingActions.length);
    });

    return () => {
      authUnsubscribe();
      offlineUnsubscribe();
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh user data
      await authService.initialize();
      
      // Process pending actions if online
      if (isOnline) {
        await offlineService.processPendingActions();
      }
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'read-letters':
        navigation.navigate('Letters');
        break;
      case 'create-project':
        navigation.navigate('Projects', { screen: 'CreateProject' });
        break;
      case 'view-dashboard':
        navigation.navigate('Dashboard');
        break;
      case 'view-profile':
        navigation.navigate('Profile');
        break;
      default:
        Alert.alert('Coming Soon', 'This feature is coming soon!');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const QuickActionButton = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    color = '#00ff88' 
  }: {
    icon: string;
    title: string;
    subtitle: string;
    onPress: () => void;
    color?: string;
  }) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <LinearGradient
        colors={[`${color}20`, `${color}10`]}
        style={styles.quickActionGradient}
      >
        <Icon name={icon} size={32} color={color} />
        <Text style={[styles.quickActionTitle, { color }]}>{title}</Text>
        <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#00ff88"
          colors={['#00ff88']}
        />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={['#00ff8820', '#00ff8805']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{user?.name || 'Revolutionary'}</Text>
          </View>
          
          <View style={styles.statusContainer}>
            {!isOnline && (
              <View style={styles.offlineIndicator}>
                <Icon name="offline-bolt" size={16} color="#ff6b6b" />
                <Text style={styles.offlineText}>Offline</Text>
              </View>
            )}
            
            {pendingActions > 0 && (
              <TouchableOpacity
                style={styles.pendingActionsIndicator}
                onPress={() => navigation.navigate('Offline')}
              >
                <Icon name="sync" size={16} color="#ffa500" />
                <Text style={styles.pendingActionsText}>
                  {pendingActions} pending
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Progress Section */}
      {user?.letterProgress && (
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <LinearGradient
            colors={['#00ff8820', '#00ff8805']}
            style={styles.progressCard}
          >
            <View style={styles.progressHeader}>
              <Icon name="menu-book" size={24} color="#00ff88" />
              <Text style={styles.progressTitle}>Anthony Letters</Text>
            </View>
            
            <View style={styles.progressStats}>
              <View style={styles.progressStat}>
                <Text style={styles.progressStatNumber}>
                  {user.letterProgress.completedLetters.length}
                </Text>
                <Text style={styles.progressStatLabel}>Completed</Text>
              </View>
              
              <View style={styles.progressStat}>
                <Text style={styles.progressStatNumber}>
                  {Math.round(user.letterProgress.totalProgress)}%
                </Text>
                <Text style={styles.progressStatLabel}>Progress</Text>
              </View>
              
              <View style={styles.progressStat}>
                <Text style={styles.progressStatNumber}>
                  Book {user.letterProgress.currentBook}
                </Text>
                <Text style={styles.progressStatLabel}>Current</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <QuickActionButton
            icon="menu-book"
            title="Read Letters"
            subtitle="Continue your journey"
            onPress={() => handleQuickAction('read-letters')}
          />
          
          <QuickActionButton
            icon="add-circle"
            title="Create Project"
            subtitle="Start a revolution"
            onPress={() => handleQuickAction('create-project')}
          />
          
          <QuickActionButton
            icon="dashboard"
            title="Dashboard"
            subtitle="View your stats"
            onPress={() => handleQuickAction('view-dashboard')}
          />
          
          <QuickActionButton
            icon="person"
            title="Profile"
            subtitle="Manage account"
            onPress={() => handleQuickAction('view-profile')}
          />
        </View>
      </View>

      {/* Stats Section */}
      {user?.stats && (
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Impact</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Icon name="favorite" size={24} color="#ff6b6b" />
              <Text style={styles.statNumber}>${user.stats.totalDonations}</Text>
              <Text style={styles.statLabel}>Donated</Text>
            </View>
            
            <View style={styles.statCard}>
              <Icon name="work" size={24} color="#4ecdc4" />
              <Text style={styles.statNumber}>{user.stats.totalProjects}</Text>
              <Text style={styles.statLabel}>Projects</Text>
            </View>
            
            <View style={styles.statCard}>
              <Icon name="menu-book" size={24} color="#45b7d1" />
              <Text style={styles.statNumber}>{user.stats.totalLettersRead}</Text>
              <Text style={styles.statLabel}>Letters Read</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#00ff8820',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#666666',
    fontFamily: 'monospace',
  },
  userName: {
    fontSize: 24,
    color: '#00ff88',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginTop: 4,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6b6b20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  offlineText: {
    color: '#ff6b6b',
    fontSize: 12,
    fontFamily: 'monospace',
    marginLeft: 4,
  },
  pendingActionsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffa50020',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingActionsText: {
    color: '#ffa500',
    fontSize: 12,
    fontFamily: 'monospace',
    marginLeft: 4,
  },
  progressSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#00ff88',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  progressCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00ff8820',
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 16,
    color: '#00ff88',
    fontFamily: 'monospace',
    marginLeft: 8,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressStat: {
    alignItems: 'center',
  },
  progressStatNumber: {
    fontSize: 20,
    color: '#ffffff',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  progressStatLabel: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'monospace',
    marginTop: 4,
  },
  quickActionsSection: {
    padding: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: '48%',
    marginBottom: 16,
  },
  quickActionGradient: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00ff8820',
    alignItems: 'center',
  },
  quickActionTitle: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  statsSection: {
    padding: 20,
    paddingBottom: 40,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#111111',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00ff8820',
    flex: 1,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 18,
    color: '#ffffff',
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
});

export default HomeScreen;
