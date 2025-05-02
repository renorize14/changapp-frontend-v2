import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import env from '../config/env';
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
  birthdate: string;
  geoReference: string;
  profilePhoto: string | null;
}

export default function PublishScreen() {
  const [deporte, setDeporte] = useState('Futbol 7');
  const [topico, setTopico] = useState('Jugar');
  const [texto, setTexto] = useState('');
  const textInputRef = useRef<TextInput>(null);
  const navigation = useNavigation();
  const [userData, setUserData] = useState<UserData | null>(null);
  const { token } = useAuth();

  const [showDeportePicker, setShowDeportePicker] = useState(false);
  const [showTopicoPicker, setShowTopicoPicker] = useState(false);

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

  const handlePublicar = async () => {
    if (!deporte || !topico || !texto.trim()) {
      Alert.alert('Campos requeridos', 'Por favor completa todos los campos antes de publicar.');
      return;
    }

    const payload = {
      nickname: userData?.nickname,
      user_id: userData?.id,
      sport: deporte,
      topic: topico,
      body: texto,
      image_url: '',
      timestamp: new Date().toISOString(),
      activo: true,
      georeference: userData?.geoReference,
      profilePicture : userData?.profilePhoto
    };

    try {
      const response = await fetch(`${env.API_URL}news`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        Alert.alert('Exito', 'Noticia publicada');
        navigation.goBack();
      } else {
        const errorText = await response.text();
        Alert.alert('Error al publicar', 'Hubo un problema con la publicación.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={60}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.goback}>{'←'}</Text>
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Image source={require('./../assets/images/logo.png')} style={styles.logo} />
            <Text style={styles.changapp}>ChangApp</Text>
          </View>
        </View>

        {/* Formulario */}
        <View style={styles.card}>
          <View style={styles.headerPublicacion}>            
            <Image
              source={
                userData?.profilePhoto
                  ? { uri: userData?.profilePhoto }
                  : require('../assets/images/default-avatar.png')
              }
              style={styles.avatar}
            />
            <Text style={styles.titulo}>Publica una noticia 🔥</Text>
          </View>
          <Text style={styles.label}>Deporte</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowDeportePicker(!showDeportePicker)}
          >
            <Text>{deporte ? deporte : 'Selecciona un deporte'}</Text>
          </TouchableOpacity>
          {showDeportePicker && (
            <Picker
              selectedValue={deporte}
              onValueChange={(itemValue) => {
                setDeporte(itemValue);
                setShowDeportePicker(false); // Ocultar después de seleccionar
              }}
              style={styles.picker}
            >
              <Picker.Item label="Futbol 7" value="Futbol 7" />
              <Picker.Item label="Futbol 5" value="Futbol 5" />
              <Picker.Item label="Basketball" value="Basketball" />
              <Picker.Item label="Basketball 3x3" value="Basketball 3x3" />
            </Picker>
          )}

          <Text style={styles.label}>Tópico</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowTopicoPicker(!showTopicoPicker)}
          >
            <Text>{topico ? topico : 'Selecciona un tópico'}</Text>
          </TouchableOpacity>
          {showTopicoPicker && (
            <Picker
              selectedValue={topico}
              onValueChange={(itemValue) => {
                setTopico(itemValue);
                setShowTopicoPicker(false);
              }}
              style={styles.picker}
            >
              <Picker.Item label="Jugar" value="Jugar" />
              <Picker.Item label="Busco jugadores" value="Busco jugadores" />
              <Picker.Item label="Liga" value="Liga" />
              <Picker.Item label="Equipo" value="Equipo" />
              <Picker.Item label="Otros" value="Otros" />
            </Picker>
          )}


          <TouchableOpacity onPress={() => textInputRef.current?.focus()}>
            <TextInput
              style={styles.textBox}
              placeholder="Escribe algo..."
              value={texto}
              onChangeText={setTexto}
              multiline
            />
          </TouchableOpacity>

          {/* Botones */}
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.botonVolver} onPress={() => navigation.goBack()}>
              <Text style={styles.textoBoton}>Volver</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.botonPublicar}>
              <Text style={styles.textoBoton} onPress={() => handlePublicar()}>Publicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  selector: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  container: {
    flex: 1,
    backgroundColor: '#0a4ea1',
  },
  scrollContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingBottom: 40,
  },

  goback: {
    color: 'white',
    fontSize: 24,
  },
  titulo: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    marginTop:5,
  },
  card: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
  },
  label: {
    marginBottom: 5,
    fontWeight: 'bold',
  },
  picker: {
    marginBottom: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  textBox: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  botonVolver: {
    backgroundColor: '#cccccc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  botonPublicar: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  textoBoton: {
    color: 'white',
    fontWeight: 'bold',
  },
  header: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logo: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
    marginRight: 6,
  },

  changapp: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  avatar: {
    width:80,
    height:80,
    borderRadius: 80,
    backgroundColor: '#ccc',
    marginRight: 10,
},
headerPublicacion: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 20,
},
});
