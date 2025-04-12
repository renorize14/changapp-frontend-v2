import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Button, Menu } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import env from '../config/env';
import CustomPin from './../assets/images/default-avatar.png';
import { Image } from 'react-native-svg';

const { width } = Dimensions.get('window');

const MapScreen = () => {
  const { token, email } = useAuth();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);

  const [selectedSport, setSelectedSport] = useState('Fútbol 7');
  const [visible, setVisible] = useState(false);

  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [user, setUser] = useState({
    name: 'Javier Martínez',
    position: 'Delantero, Centrocampista',
    latitude: 0,
    longitude: 0,
  });

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', nickname: '', category: '',
    basketball: false, basketball3x3: false, football7: false, football5: false,
    birthdate: '', profilePhoto: '', georeference: ''
  });

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  const handleSelect = (sport: string) => {
    setSelectedSport(sport);
    closeMenu();
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
            firstName: data.firstName || '', lastName: data.lastName || '',
            email: data.email || '', nickname: data.nickname || '', category: data.category || '',
            basketball: data.basketball || false, basketball3x3: data.basketball3x3 || false,
            football7: data.football7 || false, football5: data.football5 || false,
            birthdate: data.birthdate || '', profilePhoto: data.profilePhoto || '',
            georeference: data.geoReference || ''
          });

          setLatitude(lat);
          setLongitude(lng);
          setUser({
            name: data.nickname || 'Sin nombre',
            position: '',
            latitude: lat,
            longitude: lng,
          });
        } catch (error) {
          console.error('Error:', error);
        } finally {
          setIsLoading(false); // finish loading
        }
      };

      fetchUserData();
    }, [email, token])
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003366" />
      </View>
    );
  }

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
            <Menu.Item onPress={() => handleSelect('Fútbol 5')} title="Fútbol 5" />
            <Menu.Item onPress={() => handleSelect('Fútbol 7')} title="Fútbol 7" />
            <Menu.Item onPress={() => handleSelect('Básquetbol')} title="Básquetbol" />
            <Menu.Item onPress={() => handleSelect('Básquetbol 3x3')} title="Básquetbol 3x3" />
          </Menu>
        </View>
      </View>

      {/* Mapa */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 0.09,
          longitudeDelta: 0.04,
        }}
      >
        
      </MapView>
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
});

export default MapScreen;
