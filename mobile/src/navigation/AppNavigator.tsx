import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Screens
import SplashScreen from '../screens/SplashScreen';
import SignInScreen from '../screens/auth/SignInScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import LettersScreen from '../screens/LettersScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import OfflineScreen from '../screens/OfflineScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

// Services
import authService from '../services/auth';
import offlineService from '../services/offline';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const TabNavigator = () => {
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
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#00ff88',
        tabBarInactiveTintColor: '#666666',
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopColor: '#00ff88',
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: '#000000',
          borderBottomColor: '#00ff88',
          borderBottomWidth: 1,
        },
        headerTintColor: '#00ff88',
        headerTitleStyle: {
          fontFamily: 'monospace',
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Revolution Network' }}
      />
      <Tab.Screen 
        name="Letters" 
        component={LettersScreen}
        options={{ title: 'Anthony Letters' }}
      />
      <Tab.Screen 
        name="Projects" 
        component={ProjectsScreen}
        options={{ title: 'Projects' }}
      />
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerStyle: {
          backgroundColor: '#000000',
          width: 280,
        },
        drawerActiveTintColor: '#00ff88',
        drawerInactiveTintColor: '#666666',
        headerStyle: {
          backgroundColor: '#000000',
          borderBottomColor: '#00ff88',
          borderBottomWidth: 1,
        },
        headerTintColor: '#00ff88',
      }}
    >
      <Drawer.Screen 
        name="Main" 
        component={TabNavigator}
        options={{ 
          title: 'Revolution Network',
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: 'Settings',
          drawerIcon: ({ color, size }) => (
            <Icon name="settings" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{
          title: 'Notifications',
          drawerIcon: ({ color, size }) => (
            <Icon name="notifications" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Offline" 
        component={OfflineScreen}
        options={{
          title: 'Offline Actions',
          drawerIcon: ({ color, size }) => (
            <Icon name="offline-bolt" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize services
      await authService.initialize();
      await offlineService.initialize();

      // Check authentication status
      const authState = authService.getState();
      setIsAuthenticated(authState.isAuthenticated);

      // Subscribe to auth state changes
      const unsubscribe = authService.subscribe((state) => {
        setIsAuthenticated(state.isAuthenticated);
      });

      // Cleanup subscription on unmount
      return () => unsubscribe();
    } catch (error) {
      console.error('App initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Auth Stack
          <>
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        ) : (
          // Main App Stack
          <Stack.Screen name="Main" component={DrawerNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
