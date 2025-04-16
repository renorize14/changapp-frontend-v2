import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';
import { Button, Menu, Modal, Portal, useTheme } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import env from '../config/env';
import Slider from '@react-native-community/slider';
import { Circle } from 'react-native-maps';
import { TextInput } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

type UserLocation = {
  id: number;
  nickname: string;
  primaryPosition: string;
  secondaryPosition: string;
  georeference: string; 
  age: number;
};

const MapScreen = () => {
  const { token, email } = useAuth();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [radius, setRadius] = useState(1000);
  const [nearbyUsers, setNearbyUsers] = useState<UserLocation[]>([]);
  const [selectedSport, setSelectedSport] = useState('Fútbol 7');
  const [selectedSportId, setSelectedSportId] = useState(1);
  const [visible, setVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [recieverId, setRecieverId] = useState(0);

  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);

  const mapRef = useRef<MapView>(null);

  const [formData, setFormData] = useState({
    userId: '', firstName: '', lastName: '', email: '', nickname: '', category: '',
    basketball: false, basketball3x3: false, football7: false, football5: false,
    birthdate: '', profilePhoto: '', georeference: ''
  });

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  const handleSelect = (sport: string) => {
    try {
      setSelectedSport(sport);
      if ( sport == "Futbol 7" ){
        setSelectedSportId(1);
        handleChangeRadious(1);
      }
      else if ( sport == "Futbol 5" ){
        setSelectedSportId(2);
        handleChangeRadious(2);
      }
      else if ( sport == "Basquetbol" ){
        setSelectedSportId(3);
        handleChangeRadious(3);
      }
      else if ( sport == "Basquetbol 3x3" ){
        setSelectedSportId(4);
        handleChangeRadious(4);
      }
      closeMenu();
    } catch (error) {
      
    }
    
  };

  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        try {
          setIsLoading(true); // start loading

          const encodedEmail = encodeURIComponent(email || '');
          const response = await fetch(`${env.API_URL}users/email?email=${encodedEmail}`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) throw new Error('Error al obtener datos del usuario');

          const data = await response.json();

          const lat = parseFloat(data.geoReference.split(",")[0]);
          const lng = parseFloat(data.geoReference.split(",")[1]);

          setFormData({
            userId : data.id, firstName: data.firstName || '', lastName: data.lastName || '',
            email: data.email || '', nickname: data.nickname || '', category: data.category || '',
            basketball: data.basketball || false, basketball3x3: data.basketball3x3 || false,
            football7: data.football7 || false, football5: data.football5 || false,
            birthdate: data.birthdate || '', profilePhoto: data.profilePhoto || '',
            georeference: data.geoReference || ''
          });

          setLatitude(lat);
          setLongitude(lng);


          //mostrar jugadores cercanos
          handleChangeRadious(1);

        } catch (error) {
          console.error('Error:', error);
        } finally {
          setIsLoading(false); // finish loading
        }
        
      };

      fetchUserData();
    }, [email, token])
  );

    const [confirmVisible, setConfirmVisible] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const theme = useTheme();
  
    const showModal = async () => {
      setModalVisible(true)
    };
    const hideModal = () => setModalVisible(false);
  
    const showConfirmModal = () => setConfirmVisible(true);
    const hideConfirmModal = () => setConfirmVisible(false);
  
    const handleEnviar = async () => {
      hideConfirmModal();
  
      try {
        let jsonObject = {
          senderId: formData.userId,
          receiverId: recieverId,
          message: mensaje
        };
        const response = await fetch(`${env.API_URL}chat-requests/create`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jsonObject),
        });       
  
        const data = await response.text();

        console.log(response.ok)
  
        if (response.ok) {
          navigation.navigate("Chats")
        } else {
          Alert.alert('❌ Error', 'Ya tienes un chat abierto con este usuario');
        }
      } catch (err) {
        Alert.alert('❌ Error', 'No se pudo conectar al servidor.');
      }
  
      setMensaje('');
    };

  const handleChangeRadious = async (sportId : number) => {
    try {
      let numRadius = radius/1000;
      let jsonObject = {
        userId: formData.userId,
        georeference: formData.georeference,
        radius: numRadius,
        sport: sportId
      }
      const response = await fetch(`${env.API_URL}users/close-users`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body : JSON.stringify(jsonObject)
      });

      if (!response.ok) throw new Error('Error al obtener datos del usuario');
      
      const data = await response.json();
      setNearbyUsers(data);
    } catch (error) {
      console.log(error);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003366" />
      </View>
    );
  }

  const adjustMapRegion = (lat: number, lng: number, rad: number) => {
    const region = {
      latitude: lat,
      longitude: lng,
      latitudeDelta: rad / 100000, // ajuste rápido, no exacto pero funcional
      longitudeDelta: rad / 100000,
    };
  
    mapRef?.current?.animateToRegion(region, 500);
  };

  return (
    <View style={styles.container}>
      {/* Header superior */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#003366" />
        </TouchableOpacity>
        <View style={styles.menuContainer}>
          <Text style={styles.label}>Elegir deporte</Text>
          <Menu
            visible={visible}
            onDismiss={closeMenu}
            anchor={
              <Button mode="outlined" onPress={openMenu}>
                {selectedSport}
              </Button>
            }
          >
            <Menu.Item onPress={() => handleSelect('Futbol 7')} title="Fútbol 7" />
            <Menu.Item onPress={() => handleSelect('Futbol 5')} title="Fútbol 5" />
            <Menu.Item onPress={() => handleSelect('Basquetbol')} title="Básquetbol" />
            <Menu.Item onPress={() => handleSelect('Basquetbol 3x3')} title="Básquetbol 3x3" />
          </Menu>
          <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>Radio de búsqueda: {(radius / 1000).toFixed(1)} km</Text>
          <Slider
            style={{ width: width * 0.9, height: 40 }}
            minimumValue={1000}
            maximumValue={10000}
            step={500}
            value={radius}
            onValueChange={(value) => {
              setRadius(value);
              adjustMapRegion(latitude, longitude, value);
              handleChangeRadious(selectedSportId);
            }}
            minimumTrackTintColor="#003366"
            maximumTrackTintColor="#ccc"
            thumbTintColor="#003366"
          />
        </View>
        </View>
        
      </View>
      {isLoading && (
        <View style={styles.mapLoading}>
          <ActivityIndicator size="large" color="#003366" />
        </View>
      )}
      {/* Mapa */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 0.09,
          longitudeDelta: 0.04,
        }}
      >
        <Marker coordinate={{ latitude, longitude }} />
        <Circle
          center={{ latitude, longitude }}
          radius={radius}
          strokeWidth={1}
          strokeColor="#003366"
          fillColor="rgba(0, 51, 102, 0.1)"
        />
        {nearbyUsers.map((user) => {
          const [latStr, lngStr] = user.georeference.split(',');
          const latitude = parseFloat(latStr.trim());
          const longitude = parseFloat(lngStr.trim());

          return (
            <Marker
              key={user.id}
              coordinate={{ latitude, longitude }}
              title={user.nickname}
              description={`${user.primaryPosition} / ${user.secondaryPosition}`}
            >
              <Callout onPress={() => {
                    setRecieverId(user.id);
                    showModal();
                  }}>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>{user.nickname}</Text>
                  <Text style={styles.callaoutDesc}>{user.primaryPosition} / {user.secondaryPosition}</Text>
                  <Text style={styles.callaoutDesc}>Edad: {user.age}</Text>
                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() => showModal()}
                  >
                    <Text style={styles.contactButtonText}>Contactar</Text>
                  </TouchableOpacity>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>


      {/* Primer Modal con TextInput */}
      <Portal>
        <Modal visible={modalVisible} onDismiss={hideModal} contentContainerStyle={{ backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 10 }}>
          <Text style={{ marginBottom: 10 }}>Mensaje</Text>
          <TextInput
            placeholder="Escribe un mensaje inicial..."
            value={mensaje}
            onChangeText={setMensaje}
            multiline
          />
          <Button mode="contained" onPress={() => { hideModal(); showConfirmModal(); }} style={{ marginTop: 20 }}>
            Enviar
          </Button>
        </Modal>
      </Portal>

      {/* Segundo Modal de confirmación */}
      <Portal>
        <Modal visible={confirmVisible} onDismiss={hideConfirmModal} contentContainerStyle={{ backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 10 }}>
          <Text>¿Estás seguro de que quieres enviar este mensaje?</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 }}>
            <Button onPress={hideConfirmModal}>Cancelar</Button>
            <Button onPress={handleEnviar}>Confirmar</Button>
          </View>
        </Modal>
      </Portal>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 10,
    paddingBottom: 10,
    backgroundColor: 'white',
    zIndex: 10,
    elevation: 6,
  },
  backButton: {
    marginRight: 10,
  },
  menuContainer: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },

  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  sliderContainer: {
    backgroundColor: 'white',
    paddingVertical: 10,
    alignItems: 'center',
  },
  sliderLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#003366',
    fontWeight: 'bold',
  },
  calloutContainer: {
    width: 150,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  calloutTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  callaoutDesc: {
    marginBottom: 5,
    fontSize: 10
  },
  contactButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  contactButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  mapLoading: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    zIndex: 20,
  },
  
});

export default MapScreen;
