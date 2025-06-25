import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { supabase } from './supabaseClient';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import MainTabs from './navigation/MainTabs';
import ChoosePlanScreen from './screens/ChoosePlanScreen';
import AuthWrapper from './components/AuthWrapper';
import EditSubscriptionScreen from './screens/EditSubscriptionScreen';

const Stack = createNativeStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  useEffect(() => {
    const registerForPushNotifications = async () => {
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          alert('Permission de recevoir des notifications refusée');
          return;
        }

        const token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log('📱 Expo Push Token:', token);

        const {
          data: { session },
        } = await supabase.auth.getSession();

        const user_id = session?.user?.id;

        if (user_id) {
          console.log('✅ Enregistrement du token vers le backend :', { token, user_id });

          await fetch('http://192.168.1.71:3000/api/notifications/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, user_id }),
          });
        }
      } else {
        alert('Notifications disponibles uniquement sur un vrai appareil');
      }
    };

    registerForPushNotifications();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="AuthWrapper" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="AuthWrapper" component={AuthWrapper} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="ChoosePlan" component={ChoosePlanScreen} />
          <Stack.Screen name="EditSubscriptionScreen" component={EditSubscriptionScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}