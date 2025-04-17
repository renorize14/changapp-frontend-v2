import React, { useEffect, useState, useRef } from 'react';
import { FlatList, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Avatar, ActivityIndicator, Button } from 'react-native-paper';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import env from '../config/env';
import { RootStackParamList } from '../routes';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';

export interface Message {
  _id: string; 
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
  read: boolean;
  _class: string;
}

export default function ChatDetailScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { receiverId, name, profilePhoto, requestId, requesterId, message, timestamp } = useRoute().params as any;
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);
  const { email, token } = useAuth(); 

  const fetchMessages = async () => {
    try {

      const response = await fetch(`${env.API_URL}chat/messages?email=${email}&receiverId=${receiverId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Error al cargar mensajes');

      const data = await response.json();
      setMessages(data.slice(-30)); 
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    
    if ( !requestId ){
      fetchMessages();
    }
    else{
      let initMessage : any[] = [{
        senderId: requesterId,
        receiverId: receiverId,
        content: message,
        timestamp: timestamp,
        read: false
      }]

      setMessages(initMessage);

      setLoading(false);
    }
    
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.goback}>{'←'}</Text>
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Avatar.Image source={{ uri: profilePhoto }} size={36} style={{ marginRight: 10 }} />
          <Text style={styles.userName}>{name}</Text>
        </View>
      </View>

      {/* Mensajes */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 30 }} color="white" />
      ) : (
        <FlatList
          ref={flatListRef}
          contentContainerStyle={styles.messagesContainer}
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={{ alignItems: item.receiverId === receiverId ? 'flex-start' : 'flex-end' }}>
              <View
                style={[
                  styles.messageBubble,
                  {
                    backgroundColor: item.receiverId === receiverId ? '#ffffff' : '#5DADE2',
                    alignSelf: item.receiverId === receiverId ? 'flex-start' : 'flex-end',
                  },
                ]}
              >
                <Text style={{ color: item.receiverId === receiverId ? '#000' : '#fff' }}>
                  {item.content}
                </Text>
              </View>
            </View>
          )}
        />
      )}

      {/* Si hay requestId, mostramos botones */}
      {requestId && (
        <View style={styles.actionsContainer}>
          <Button mode="outlined" style={styles.rejectButton} onPress={() => console.log('Rechazar')}>
            Rechazar
          </Button>
          <Button mode="contained" style={styles.acceptButton} onPress={() => console.log('Aceptar')}>
            Aceptar
          </Button>          
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a4ea1',
    paddingHorizontal: 0,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16
  },
  goback: {
    color: 'white',
    fontSize: 24,
    marginRight: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  messagesContainer: {
    paddingBottom: 80,
    gap: 10,
    padding: 15
  },
  messageBubble: {
    padding: 10,
    borderRadius: 12,
    marginVertical: 4,
    maxWidth: '80%',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 30,
    margin:0,
    backgroundColor: '#0a4389',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingHorizontal: 20,
  },
  rejectButton: {
    borderColor: '#E74C3C',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 20,
  },
});
