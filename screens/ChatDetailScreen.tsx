import React, { useEffect, useState, useRef } from 'react';
import { FlatList, View } from 'react-native';
import { Appbar, Text, Avatar, ActivityIndicator } from 'react-native-paper';
import { RouteProp, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import env from '../config/env';
import { RootStackParamList } from '../routes';

export default function ChatDetailScreen() {
  const { receiverId, name, profilePhoto } = useRoute().params as any;
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);
  type ChatDetailRouteProp = RouteProp<RootStackParamList, 'ChatDetail'>;

const route = useRoute<ChatDetailRouteProp>();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const email = await AsyncStorage.getItem('email');

        const response = await fetch(`${env.API_URL}chat/messages?email=${email}&receiverId=${receiverId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Error al cargar mensajes');

        const data = await response.json();
        setMessages(data.slice(-30)); // últimos 30 mensajes
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => history.back()} />
        <Appbar.Content title={name} />
        <Avatar.Image source={{ uri: profilePhoto }} size={36} style={{ marginRight: 10 }} />
      </Appbar.Header>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          ref={flatListRef}
          contentContainerStyle={{ padding: 10 }}
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={{ marginVertical: 5, alignItems: item.sender === receiverId ? 'flex-start' : 'flex-end' }}>
              <Text style={{
                backgroundColor: item.sender === receiverId ? '#e0e0e0' : '#4caf50',
                padding: 10,
                borderRadius: 10,
                color: item.sender === receiverId ? '#000' : '#fff',
                maxWidth: '80%',
              }}>
                {item.content}
              </Text>
            </View>
          )}
        />
      )}
    </>
  );
}
