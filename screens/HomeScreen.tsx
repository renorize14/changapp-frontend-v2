import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import env from '../config/env';

const posts = [
  {
    id: '1',
    user: 'Usao Man',
    time: 'Hace 3 h',
    content: 'Lorem ipsum oldorsit amet, consectetur adipiscing elit, duomaqur ada ludameda',
  },
  {
    id: '2',
    user: 'Usao Man',
    time: 'Hace 3 h',
    content: 'Lorem ipsum oldorsit amet, consectetur adipiscing elit, duomaqur ada ludameda',
  },
];

export default function HomeScreen() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  AsyncStorage.removeItem('token');
  const { signOut, email, token } = useAuth(); 
  const navigation = useNavigation();
  const [showGeoModal, setShowGeoModal] = useState(false);

  const handleLogout = () => {
    signOut();
    console.log('Sesión cerrada');
    setShowLogoutModal(false);
  };

  const renderPost = ({ item }: any) => (
    <View style={styles.post}>
      <View style={styles.postHeader}>
        <View style={styles.avatar} />
        <View>
          <Text style={styles.user}>{item.user}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
      </View>
      <Text style={styles.content}>{item.content}</Text>
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

      console.log('Enviando:', payload);

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

        <Icon name="bars" size={20} color="white" />
        <TouchableOpacity onPress={() => navigation.navigate("ProfileSettings")}>
          <Icon name="user" size={20} color="white" />
        </TouchableOpacity>
        
      </View>

      {/* Crear noticia */}
      <TouchableOpacity style={styles.newPostBox}>
        <Icon name="pencil" size={16} color="#fff" />
        <Text style={styles.newPostText}>Crear una noticia...</Text>
      </TouchableOpacity>

      {/* Lista de publicaciones */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={styles.postsContainer}
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
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E5D96',
    paddingHorizontal: 10,
    paddingTop: 50,
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
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
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
});
