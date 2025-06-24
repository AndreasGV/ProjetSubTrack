import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import MainTabs from './navigation/MainTabs';
import ChoosePlanScreen from './screens/ChoosePlanScreen';
import AuthWrapper from './components/AuthWrapper';
import EditSubscriptionScreen from './screens/EditSubscriptionScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
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
  );
}