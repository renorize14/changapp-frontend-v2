import React, { useEffect, useState, useRef } from 'react';
import { FlatList, View, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Text, Avatar, ActivityIndicator, Button } from 'react-native-paper';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import env from '../config/env';
import { RootStackParamList } from '../routes';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { TextInput } from 'react-native-gesture-handler';
import { useWebSocketNotifications } from './../components/useWebSocketNotifications';



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
  const { request, completeItem } = useRoute().params as any;
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList<any>>(null);
  const { email, token } = useAuth();
  const [otherUser, setOtherUser] = useState<any>();
  const [userData, setUserData] = useState<any>();
  const [newMessage, setNewMessage] = useState('');

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    if (isToday) {
      return `Hoy - ${hours}:${minutes}`;
    } else {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      return `${day}/${month} - ${hours}:${minutes}`;
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    flatListRef.current?.scrollToEnd({ animated: true });
    

    const payload = {
      chatId: completeItem.chat.id,
      senderId: userData.id,
      receiverId: otherUser.id,
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: false,
    };

    try {
      const response = await fetch(`${env.API_URL}chat/send-message`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data]);
        setNewMessage('');
        fetchMessages();
        flatListRef.current?.scrollToEnd({ animated: false });
      } else {
        Alert.alert('Error', 'No se pudo enviar el mensaje.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Error al conectar con el servidor.');
    }
  };

  const fetchMessages = async () => {
    try {

      const response = await fetch(`${env.API_URL}chat/chats/${completeItem.chat.userOne.id}/${completeItem.chat.userTwo.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Error al cargar mensajes');

      const data = await response.json();
      setMessages(data.slice(-30));
      if (completeItem.chat.userOne.email == email) {
        setOtherUser(completeItem.chat.userTwo)
        setUserData(completeItem.chat.userOne);
      }
      else {
        setOtherUser(completeItem.chat.userOne)
        setUserData(completeItem.chat.userTwo)
      }

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptChat = async () => {
    const payload = {
      chatId: completeItem.id,
      senderId: completeItem.requester.id,
      receiverId: completeItem.requested.id,
      content: completeItem.requestedMessage,
      timestamp: completeItem.createdAt,
      read: true
    };

    try {
      const response = await fetch(`${env.API_URL}chat/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.slice(-30));
        Alert.alert('Exito', 'Se ha aceptado la solicitud de chat, ahora pueden conversar');
        navigation.goBack();
      } else {
        const errorText = await response.text();
        Alert.alert('Error al publicar', 'Hubo un problema.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    }
  }

  useEffect(() => {

    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: false });
    }

    if (!request) {
      fetchMessages();
    }
    else {
      let initMessage: any[] = [{
        senderId: completeItem.requester.id,
        receiverId: completeItem.requested.id,
        content: completeItem.requestedMessage,
        timestamp: completeItem.createdAt,
        read: false
      }]
      setMessages(initMessage);

      setLoading(false);
    }

  }, []);

  useWebSocketNotifications( (msg : any) => {
    console.log("📲 Mensaje nuevo por WebSocket:", msg);
    if (msg.chatId === completeItem.chat.id) {
      fetchMessages();
    }
  });

  return (

    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.goback}>{'←'}</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 30 }} color="white" />
        ) : request ? (
          <View style={styles.logoContainer}>
            <Avatar.Image source={{ uri: completeItem.requester.profilePicture }} size={36} style={{ marginRight: 10 }} />
            <Text style={styles.userName}>{completeItem.requester.firstName} {completeItem.requester.lastName}</Text>
          </View>
        ) : (
          <View style={styles.logoContainer}>
            <Avatar.Image source={{ uri: otherUser.profilePicture }} size={36} style={{ marginRight: 10 }} />
            <Text style={styles.userName}>{otherUser.firstName} {otherUser.lastName}</Text>
          </View>
        )}

      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>


            {/* Mensajes */}
            {loading ? (
              <ActivityIndicator style={{ marginTop: 30 }} color="white" />
            ) : request ? (
              <FlatList
                onContentSizeChange={() => {
                  flatListRef.current?.scrollToEnd({ animated: true });
                }}
                onLayout={() => flatListRef.current?.scrollToEnd({animated: true})}
                style={{ flex: 1 }}
                ref={flatListRef}
                contentContainerStyle={styles.messagesContainer}
                data={messages}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <View
                    style={{
                      alignItems:
                        item.receiverId === completeItem.requested.id
                          ? 'flex-start'
                          : 'flex-end',
                    }}
                  >
                    <View
                      style={[
                        styles.messageBubble,
                        {
                          backgroundColor:
                            item.receiverId === completeItem.requested.id
                              ? '#ffffff'
                              : '#5DADE2',
                          alignSelf:
                            item.receiverId === completeItem.requested.id
                              ? 'flex-start'
                              : 'flex-end',
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color:
                            item.receiverId === completeItem.requested.id
                              ? '#000'
                              : '#fff',
                        }}
                      >
                        {item.content}
                      </Text>
                    </View>
                  </View>
                )}
              />
            ) : (
              <FlatList
                onContentSizeChange={() => {
                  flatListRef.current?.scrollToEnd({ animated: true });
                }}
                onLayout={() => flatListRef.current?.scrollToEnd({animated: true})}
                style={{ flex: 1 }}
                ref={flatListRef}
                contentContainerStyle={styles.messagesContainer}
                data={messages}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <View
                    style={{
                      alignItems:
                        item.senderId === otherUser.id ? 'flex-start' : 'flex-end',
                      marginBottom: 10,
                    }}
                  >
                    <View
                      style={[
                        styles.messageBubble,
                        {
                          backgroundColor:
                            item.senderId === otherUser.id ? '#ffffff' : '#5DADE2',
                          alignSelf:
                            item.senderId === otherUser.id ? 'flex-start' : 'flex-end',
                        },
                      ]}
                    >
                      <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>
                        {item.senderId === otherUser.id
                          ? `${otherUser.firstName} ${otherUser.lastName}`
                          : `${userData.firstName} ${userData.lastName}`}
                      </Text>

                      {/* Contenido del mensaje */}
                      <Text
                        style={{
                          color: item.senderId === otherUser.id ? '#000' : '#fff',
                        }}
                      >
                        {item.content}
                      </Text>

                      {/* Fecha y hora */}
                      <Text
                        style={{
                          fontSize: 10,
                          color: item.senderId === otherUser.id ? '#555' : '#eee',
                          alignSelf: 'flex-end',
                          marginTop: 4,
                        }}
                      >
                        {formatDate(item.timestamp)}
                      </Text>
                    </View>
                  </View>

                )}
              />
            )}

        </TouchableWithoutFeedback>
        {!request && (
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Escribe un mensaje..."
              style={styles.input}
              placeholderTextColor="#aaa"
              value={newMessage}
              onChangeText={setNewMessage}
            />
            <Button
              mode="contained"
              style={styles.sendButton}
              onPress={handleSendMessage}
            >
              Enviar
            </Button>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Si hay requestId, mostramos botones */}
      {request && (
        <View style={styles.actionsContainer}>
          <Button mode="outlined" style={styles.rejectButton} onPress={() => console.log('Rechazar')}>
            Rechazar
          </Button>
          <Button mode="contained" style={styles.acceptButton} onPress={() => handleAcceptChat()}>
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
    margin: 0,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    backgroundColor: '#eee',
    borderRadius: 20,
    marginRight: 10,
  },
  sendButton: {
    borderRadius: 20,
    backgroundColor: '#0a4ea1',
    paddingHorizontal: 12,
  },
});
