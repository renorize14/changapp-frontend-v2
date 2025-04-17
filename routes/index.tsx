import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from './../screens/LoginScreen';
import RegisterScreen from './../screens/RegisterScreen';
import HomeScreen from './../screens/HomeScreen';
import ProfileSettingsScreen from '../screens/ProfileSettingsScreen';
import MapScreen from '../screens/MapScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import PublishScreen from '../screens/PublishScreen';
import ChatsListScreen from '../screens/ChatsScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  ProfileSettings : undefined;
  MapSearch: undefined;
  Chats: undefined;
  ChatDetail: undefined;
  Publish: undefined;
  PostItem :undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Routes() {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }}/>
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }}/>
          <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} options={{ headerShown: false }}/>
          <Stack.Screen name="MapSearch" component={MapScreen} options={{ headerShown: false }}/>
          <Stack.Screen name="Chats" component={ChatsListScreen}  options={{ headerShown: false }}/>
          <Stack.Screen name="ChatDetail" component={ChatDetailScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Publish" component={PublishScreen} options={{ headerShown: false }} />
          

        </>
        
      )}
    </Stack.Navigator>
  );
}
