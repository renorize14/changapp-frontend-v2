import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Appbar, Card, Text, Avatar, ActivityIndicator, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import env from '../config/env';
import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
    Chats: undefined;
    ChatDetail: {
      receiverId: string;
      name: string;
      profilePhoto: string;
    };
    MessageRequests: undefined;
  };

export default function ChatsScreen() {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  type NavigationProp = StackNavigationProp<RootStackParamList, 'Chats'>;

    const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('token');
        const email = await AsyncStorage.getItem('email');

        const response = await fetch(`${env.API_URL}chat/user?email=${email}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Error al cargar chats');

        const data = await response.json();
        setChats(data);

      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Chats" />
        <Appbar.Action icon="account-plus" onPress={() => navigation.navigate('MessageRequests')} />
      </Appbar.Header>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 30 }} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 10 }}>
          {chats.map((chat, idx) => (
            <Card
              key={idx}
              style={{ marginBottom: 10 }}
              onPress={() =>
                navigation.navigate('ChatDetail', {
                  receiverId: chat.receiverId,
                  name: chat.name,
                  profilePhoto: chat.profilePhoto,
                })
              }
            >
              <Card.Title
                title={chat.name}
                subtitle={chat.lastMessage}
                left={(props) => (
                  <Avatar.Image
                    {...props}
                    source={{ uri: chat.profilePhoto }}
                    size={40}
                  />
                )}
              />
            </Card>
          ))}
        </ScrollView>
      )}
    </>
  );
}
