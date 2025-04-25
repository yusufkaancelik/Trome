import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, View, StyleSheet } from 'react-native';

// Firebase konfigürasyonu dışarıdan alınıyor
import { firebaseConfig } from './src/config/appfbConfig';

import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Tema
import { ThemeProvider } from './src/context/ThemeContext';
import { colors } from './src/theme/colors';

// Ekranlar
import LoginScreen from './src/screens/Auth/LoginScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';
import HomeScreen from './src/screens/Home/HomeScreen';
import RoomScreen from './src/screens/Room/RoomScreen';
import ProfileScreen from './src/screens/Profile/ProfileScreen';
import CreateRoomScreen from './src/screens/CreateRoom/CreateRoomScreen';
import SearchScreen from './src/screens/Search/SearchScreen';
import NotificationScreen from './src/screens/Notification/NotificationsScreen';
import AllRoomsScreen from './src/screens/AllRooms/AllRoomsScreen';
import EditProfileScreen from './src/screens/Profile/EditProfileScreen';
import EmailVerificationScreen from './src/screens/Auth/EmailVerificationScreen';
import SetupProfileScreen from './src/screens/Profile/SetupProfileScreen';
import SelectInterestsScreen from './src/screens/Profile/SelectInterestsScreen';
import SelectThemeScreen from './src/screens/Profile/SelectThemeScreen';
import ForgotPassword from './src/screens/Auth/ForgotPasswordScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab icon placeholder
const TabIcon = ({ color }) => (
  <View style={[styles.tabIcon, { backgroundColor: color }]} />
);

// Ana tab navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background.dark,
          borderTopColor: colors.background.light,
          height: 60,
          paddingBottom: 8
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.disabled
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen} 
        options={{
          tabBarLabel: 'Ana Sayfa',
          tabBarIcon: ({ color }) => <TabIcon color={color} />
        }}
      />
      <Tab.Screen 
        name="SearchTab" 
        component={SearchScreen} 
        options={{
          tabBarLabel: 'Keşfet',
          tabBarIcon: ({ color }) => <TabIcon color={color} />
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen} 
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color }) => <TabIcon color={color} />
        }}
      />
    </Tab.Navigator>
  );
};

// Ana uygulama yapısı
const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  // Kullanıcı kimlik durumu değiştiğinde bu fonksiyon çalışır
  function onAuthStateChangedHandler(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    // Firebase Auth durumunu dinle
    const subscriber = onAuthStateChanged(auth, onAuthStateChangedHandler);
    return subscriber; // useEffect temizleme fonksiyonu
  }, []);

  if (initializing) {
    // Uygulama başlatılırken gösterilecek yükleme ekranı
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.dark }}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background.dark} />
      </View>
    );
  }

  return (
    // Tüm uygulamayı ThemeProvider ile sarın
    <ThemeProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor={colors.background.dark} />
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background.dark },
            animation: 'slide_from_right'
          }}
          initialRouteName={user ? "MainApp" : "LoginScreen"}
        >
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
          <Stack.Screen name="MainApp" component={TabNavigator} />
          <Stack.Screen name="RoomScreen" component={RoomScreen} />
          <Stack.Screen name="CreateRoomScreen" component={CreateRoomScreen} />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="NotificationsScreen" component={NotificationScreen} />
          <Stack.Screen name="AllRoomsScreen" component={AllRoomsScreen} />
          <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
          <Stack.Screen name="EmailVerificationScreen" component={EmailVerificationScreen} />
          <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
          <Stack.Screen name="SetupProfile" component={SetupProfileScreen} />
          <Stack.Screen name="SelectInterests" component={SelectInterestsScreen} />
          <Stack.Screen name="SelectTheme" component={SelectThemeScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  tabIcon: {
    width: 24,
    height: 24,
    borderRadius: 12
  }
});

export default App;
