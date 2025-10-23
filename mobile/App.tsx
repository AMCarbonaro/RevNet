import React, { useEffect, useState } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

// Services
import authService from './src/services/auth';
import pushNotificationService from './src/services/push-notifications';
import offlineService from './src/services/offline';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import LettersScreen from './src/screens/LettersScreen';
import ProjectsScreen from './src/screens/ProjectsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  isAuthenticated: boolean;
}

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main Tab Navigator
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Letters':
              iconName = 'menu-book';
              break;
            case 'Projects':
              iconName = 'work';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'home';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#00ff88',
        tabBarInactiveTintColor: '#666666',
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopColor: '#00ff8820',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontFamily: 'monospace',
          fontSize: 12,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
        }}
      />
      <Tab.Screen
        name="Letters"
        component={LettersScreen}
        options={{
          title: 'Letters',
        }}
      />
      <Tab.Screen
        name="Projects"
        component={ProjectsScreen}
        options={{
          title: 'Projects',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

// Auth Stack Navigator
const AuthStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#000000' },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

// Main App Component
const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeApp();
    
    // Suppress specific warnings
    LogBox.ignoreLogs([
      'VirtualizedLists should never be nested',
      'Non-serializable values were found in the navigation state',
    ]);
  }, []);

  const initializeApp = async () => {
    try {
      setIsLoading(true);

      // Initialize services
      await authService.initialize();
      await pushNotificationService.initialize();
      await offlineService.initialize();

      // Check authentication status
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);

      // Subscribe to auth state changes
      authService.subscribe((authState) => {
        setUser(authState.user);
      });

      setIsInitialized(true);
    } catch (error) {
      console.error('App initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderApp = () => {
    if (isLoading || !isInitialized) {
      return (
        <LinearGradient
          colors={['#000000', '#001100']}
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Icon name="menu-book" size={48} color="#00ff88" />
          <StatusBar barStyle="light-content" backgroundColor="#000000" />
        </LinearGradient>
      );
    }

    return (
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        
        {user?.isAuthenticated ? (
          <MainTabNavigator />
        ) : (
          <AuthStackNavigator />
        )}
      </NavigationContainer>
    );
  };

  return renderApp();
};

export default App;
