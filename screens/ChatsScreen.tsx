import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, View, Image, Alert, Modal, FlatList } from 'react-native';
import { Appbar, Card, Text, Avatar, ActivityIndicator, Button } from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import env from '../config/env';
import { StackNavigationProp } from '@react-navigation/stack';
import { StyleSheet } from 'react-native';
import { RootStackParamList } from '../routes';
import { useAuth } from '../context/AuthContext';

interface UserData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  nickname: string;
  category: string;
  basketball: boolean;
  basketball3x3: boolean;
  football7: boolean;
  football5: boolean;
  padel: boolean;
  birthdate: string;
  geoReference: string;
  profilePhoto: string | null;
}

export default function ChatsScreen() {
  const [chatsReq, setChatsReq] = useState<any[]>([]);
  const [prevChats, setPrevChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [solNumber, setSolNumber] = useState<number>(0);
  const [chatNumber, setChatNumber] = useState<number>(0);
  const { token } = useAuth(); 
  const [activeTab, setActiveTab] = useState<'chats' | 'solicitudes'>('chats');


  type NavigationProp = StackNavigationProp<RootStackParamList, 'Chats'>;

  const navigation = useNavigation<NavigationProp>();

  useFocusEffect(
    useCallback(() => {
      const loadUser = async () => {
        try {
          const response = await fetch(`${env.API_URL}users/`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
          if (!response.ok) throw new Error('Error al obtener datos de usuario');
  
          const data = await response.json();
          setUserData(data);
        } catch (error) {
          console.error('Error cargando usuario:', error);
        }
      };
      loadUser();
    }, [token])
  );

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${env.API_URL}users/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener los datos del usuario');
      }

      const data = await response.json();
      
      setUserData(data);
    } catch (error) {
      console.error('Error trayendo datos de usuario:', error);
    }
  };

  useEffect(() => {
    if (!userData) return;
  
    fetchSolChats(userData.id);
    fetchChats(userData.id);
  }, [userData]);

  const fetchSolChats = async (user_id: number | undefined) => {
    if (!user_id) return;
  
    try {
      setLoading(true);
      const response = await fetch(`${env.API_URL}chat-requests/received/${user_id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) throw new Error('Error al cargar chats');
  
      const data = await response.json();
      setChatsReq(data);
      setSolNumber(data.length);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchChats = async (user_id: number | undefined) => {
    if (!user_id) return;
  
    try {
      setLoading(true);
      const response = await fetch(`${env.API_URL}chat/preview-chats/${user_id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) throw new Error('Error al cargar chats');
  
      const data = await response.json();
      setPrevChats(data);
      setChatNumber(data.length);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChatRequest = (chatId: number) => {
    Alert.alert(
      'Eliminar Solicitud',
      '¿Estás seguro de que deseas eliminar esta solicitud de mensaje?',
      [
        { text: 'Cancelar', onPress: () => setIsModalVisible(false) },
        { text: 'Eliminar', onPress: () => deleteChatRequest(chatId) },
      ]
    );
  };

  const deleteChatRequest = async (chatId: number) => {
    if (!userData) return; // <-- Prevenir acceso a id si userData aún no está cargado
  
    try {
      const response = await fetch(`${env.API_URL}chat-requests/${chatId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) throw new Error('Error al eliminar solicitud');
      setChatsReq(chatsReq.filter(req => req.id !== chatId));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsModalVisible(false);
      fetchSolChats(userData.id); // <-- Seguro porque validamos antes
    }
  };

  const renderMessagePreview = (message: string, senderId: number) => {
    if (!userData) return message; // <-- prevención
    let prefix = senderId === userData.id ? "Tú: " : "";
    const fullMessage = prefix + message;
    return fullMessage.length > 50 ? `${fullMessage.slice(0, 47)}...` : fullMessage;
  };

  if (!userData) {
    return <ActivityIndicator animating={true} size="large" color="#ffffff" />;
  }
  else{
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.goback}>{'←'}</Text>
          </TouchableOpacity>
    
          <View style={styles.logoContainer}>
            <Image source={require('./../assets/images/logo.png')} style={styles.logo} />
            <Text style={styles.changapp}>ChangApp</Text>
          </View>
        </View>
    
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'chats' && styles.tabButtonActive]}
            onPress={() => setActiveTab('chats')}
          >
            <Text style={styles.tabText}>Chats</Text>
          </TouchableOpacity>
    
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'solicitudes' && styles.tabButtonActive]}
            onPress={() => setActiveTab('solicitudes')}
          >
            <Text style={styles.tabText}>
              {solNumber > 0 ? `Solicitudes (${solNumber})` : 'Solicitudes'}
            </Text>
          </TouchableOpacity>
        </View>
    
        {/* Contenido del Tab */}
        {loading ? (
          <ActivityIndicator animating={true} size="large" color="#ffffff" />
        ) : activeTab === 'solicitudes' ? (
          <FlatList
            data={chatsReq}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('ChatDetail', {
                    completeItem: item,
                    request: true,
                  })
                }
                onLongPress={() => {
                  setSelectedChat(item);
                  setIsModalVisible(true);
                }}
              >
                <Card style={styles.postCard}>
                  <View style={styles.userRow}>
                    <Image
                      source={
                        item.requester?.profilePicture
                          ? { uri: item.requester.profilePicture }
                          : require('../assets/images/default-avatar.png')
                      }
                      style={styles.avatar}
                    />
                    <View>
                      <Text style={styles.userName}>
                        {item.requester?.firstName ?? 'Usuario'} {item.requester?.lastName ?? ''}
                      </Text>
                      <Text style={styles.postTime}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Text>
                      <Text style={styles.postContent}>
                        {renderMessagePreview(item.requestedMessage, 0)}
                      </Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            )}
          />
        ) : (
          <FlatList
            data={prevChats}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const chat = item.chat;
              const userOne = chat?.userOne;
              const userTwo = chat?.userTwo;
    
              if (!chat || !userOne || !userTwo || !userData) {
                return (
                  <View style={{ padding: 10 }}>
                    <Text style={{ color: 'red' }}>⚠️ Chat inválido</Text>
                  </View>
                );
              }
    
              const otherUser = userOne.id === userData.id ? userTwo : userOne;
    
              return (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('ChatDetail', {
                      completeItem: item,
                      request: false,
                    })
                  }
                  onLongPress={() => {
                    setSelectedChat(item);
                    setIsModalVisible(true);
                  }}
                >
                  <Card style={styles.postCard}>
                    <View style={styles.userRow}>
                      <Image
                        source={
                          otherUser.profilePicture
                            ? { uri: otherUser.profilePicture }
                            : require('../assets/images/default-avatar.png')
                        }
                        style={styles.avatar}
                      />
                      <View>
                        <Text style={styles.userName}>
                          {otherUser.firstName} {otherUser.lastName}
                        </Text>
                        <Text style={styles.postTime}>
                          {new Date(item.sentAt).toLocaleDateString()}
                        </Text>
                        <Text style={styles.postContent}>
                          {renderMessagePreview(item.message, item.sender?.id ?? 0)}
                        </Text>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            }}
          />
        )}
    
        {/* Modal Confirmación */}
        <Modal
          visible={isModalVisible}
          onRequestClose={() => setIsModalVisible(false)}
          transparent
          animationType="fade"
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Eliminar Solicitud</Text>
              <Button onPress={() => handleDeleteChatRequest(selectedChat?.id)}>
                Eliminar Solicitud
              </Button>
              <Button onPress={() => setIsModalVisible(false)}>Cancelar</Button>
            </View>
          </View>
        </Modal>
      </View>
    );
    
    
  }

  
  
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a4ea1',
    paddingHorizontal: 16,
    paddingTop: 50, 
  },
  topIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10
  },
  createNewsButton: {
    backgroundColor: '#5DADE2', // azul más claro para el botón "Crear noticia"
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  logo: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
    marginRight: 6,
  },
  createNewsText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#cccccc',
    marginRight: 10,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  postTime: {
    color: '#777',
    fontSize: 12,
  },
  postContent: {
    fontSize: 14,
    color: '#444',
    marginTop: 8,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  actionIcon: {
    marginRight: 20,
  },
  backButton: {
    marginRight: 10,
    borderColor: 'black',
    borderStyle: 'solid',
    borderRadius: 10
  },
  header: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  goback: {
    color: 'white',
    fontSize: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changapp: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    backgroundColor: '#083b7a',
    borderRadius: 12,
    padding: 6,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: '#ffffff33',
  },
  tabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  
});
