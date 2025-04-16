import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import env from '../config/env';
import { Button, FAB, Menu, Portal, Provider, RadioButton } from 'react-native-paper';
import { Dimensions } from 'react-native';
import { ScrollView, TouchableWithoutFeedback } from 'react-native-gesture-handler';

const { height } = Dimensions.get('window');


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
  birthdate: string;
  geoReference: string;
  profilePhoto: string | null;
}


export default function HomeScreen() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { signOut, email, token } = useAuth(); 
  const navigation = useNavigation();
  const [showGeoModal, setShowGeoModal] = useState(false);
  const [news, setNews] = useState<any[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSport, setSelectedSport] = useState('Futbol 7');
  const [sportMenuVisible, setSportMenuVisible] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [body, setBody] = useState('');

  const sportButtonRef = useRef(null);
  const topicButtonRef = useRef(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownTopicVisible, setDropdownTopicVisible] = useState(false);

  const openSportsMenu = () => {
    setSportMenuVisible(true);
  }

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

  const fetchNews = async () => {
    try {
      setIsLoadingNews(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'No se pudo obtener tu ubicación para cargar noticias.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const latitude = location.coords.latitude;
      const longitude = location.coords.longitude;

      const response = await fetch(`${env.API_URL}news/all?lat=${latitude}&lon=${longitude}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNews(data);
      } else {
        Alert.alert('Error', 'No se pudieron obtener las noticias.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Ocurrió un error al cargar las noticias.');
    } finally {
      setIsLoadingNews(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
      fetchNews();
    }, [])
  );
  

  useEffect(() => {
    

    fetchNews();
  }, []);

  const handleLogout = () => {
    signOut();
    console.log('Sesión cerrada');
    setShowLogoutModal(false);
  };

  function getDistanceFromLatLonInKm(geo: string): number {

    let lat1 : number = parseFloat(userData?.geoReference.split(",")[0] || "");
    let lon1 : number = parseFloat(userData?.geoReference.split(",")[1] || "");

    let lat2 : number = parseFloat(geo.split(",")[0]);
    let lon2 : number = parseFloat(geo.split(",")[1]);
    const R = 6371; // Radio de la Tierra en km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
  }
  
  function deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  const renderPost = ({ item }: any) => (
    <View style={styles.post}>
      <View style={styles.postHeader}>
        <View style={styles.avatar} />
        <View>
          <Text style={styles.user}>{item.nickname}</Text>
          <Text style={styles.time}>{new Date(item.timestamp).toLocaleString()}</Text>
          <Text style={styles.time}>{item.sport} - {item.topic}</Text>
          <Text style={styles.time}>📍a { getDistanceFromLatLonInKm(item.georeference || ",").toFixed(2)} km de distancia</Text>

        </View>
      </View>
      <Text style={styles.content}>{item.body}</Text>
      <View style={styles.postFooter}>
        <Icon name="thumbs-up" size={20} color="#555" style={styles.iconFooter} />
        <Icon name="comment" size={20} color="#555" />
      </View>
    </View>

  );

  const handleGeolocationUpdate = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'No se pudo obtener tu ubicación.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const latitude = location.coords.latitude;
      const longitude = location.coords.longitude;
      const georeference = `${latitude},${longitude}`;

      const payload = {
        email: email,
        georeference,
      };


      const response = await fetch(`${env.API_URL}users/georeference`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        Alert.alert('Éxito', 'Ubicación actualizada correctamente');
      } else {
        Alert.alert('Error', 'No se pudo actualizar la ubicación');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Ocurrió un problema al obtener la ubicación');
    } finally {
      setShowGeoModal(false);
    }
  };

  

  

  return (

    
    <View style={styles.container}>
      {/* Barra superior */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => setShowLogoutModal(true)}>
          <Icon name="power-off" size={20} color="white" />
        </TouchableOpacity>      
        
        <TouchableOpacity onPress={() => setShowGeoModal(true)}>
          <Icon name="map-marker" size={20} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("MapSearch")}>
          <Icon name="map" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Chats")}>
          <Icon name="wechat" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("ProfileSettings")}>
          <Icon name="user" size={20} color="white" />
        </TouchableOpacity>
        
      </View>

      {/* Lista de publicaciones */}
      <FlatList
        data={news}
        keyExtractor={(item) => item.timestamp}
        renderItem={renderPost}
        contentContainerStyle={styles.postsContainer}
        refreshing={isLoadingNews}
        onRefresh={fetchNews}
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={showLogoutModal}
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>¿Cerrar sesión?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#ddd' }]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#d9534f' }]}
                onPress={handleLogout}
              >
                <Text style={{ color: '#fff' }}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal georeferencia */}
      <Modal animationType="fade" transparent={true} visible={showGeoModal} onRequestClose={() => setShowGeoModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>¿Desea actualizar su posición en el mapa?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#ddd' }]} onPress={() => setShowGeoModal(false)}>
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#5cb85c' }]} onPress={handleGeolocationUpdate}>
                <Text style={{ color: '#fff' }}>Actualizar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Modal noticia */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('Publish')}
        label=""
      />
    </View>
  );
}
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 2, 
  },
  radioGroup: {
    flex: 1,
    marginRight: 10,
    color: "#ffffff",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor : "#1a5081"
  },
  radioLabel: {
    fontSize: 14,
    color: "#ffffff",
  },
  publicationsContainer: {
    flex: 1,
    backgroundColor: '#1E5D96',
    paddingHorizontal: 20,
    paddingTop: 50,
    
  },
  publicationsLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: "#ffffff",
    textAlign: 'center'
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    height: 100,
    padding: 10,
    marginTop: 10,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 10,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#0a4ea1',
    paddingHorizontal: 15,
    paddingTop: 60,
    resizeMode: 'cover',
  },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  newPostBox: {
    backgroundColor: '#4682B4',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  newPostText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
  },
  postsContainer: {
    paddingBottom: 20,
  },
  post: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc',
    marginRight: 10,
  },
  user: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  time: {
    color: '#555',
    fontSize: 12,
  },
  content: {
    fontSize: 14,
    marginVertical: 10,
    color: '#333',
  },
  postFooter: {
    flexDirection: 'row',
    marginTop: 10,
  },
  iconFooter: {
    marginRight: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'cover',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    resizeMode: 'cover',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#ffffff'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#28a745',
    color: 'white'
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
    height: height * 0.5, // 50% de la altura de la pantalla
    justifyContent: 'space-between',
  },

  publictaionsModal: {
    backgroundColor: '#ffffff',
    padding: 40,
    margin: 20,
    borderRadius: 10,
    height: height * 0.5, // 50% de la altura de la pantalla
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    marginBottom: 16,
    fontWeight: 'bold',
    color: "#ffffff"
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
    minHeight: 100,
  },
});
