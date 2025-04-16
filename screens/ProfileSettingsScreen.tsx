// ProfileSettingsScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  Text,
  TextInput,
  Checkbox,
  Button,
  ActivityIndicator,
  Menu,
  Dialog,
  Portal,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import env from '../config/env';




const ProfileSettingsScreen = () => {
  const { token, email } = useAuth();
  const [selectedSport, setSelectedSport] = useState<number>(0);
  const [selectedSportName, setSelectedSportName] = useState<String>("");
  const [userId, setUserId] = useState<number>(0);
  const [sportInfo, setSportInfo] = useState({
    primary_position: '',
    secondary_position: '',
    description: '',
  });

  const [isSportModalVisible, setIsSportModalVisible] = useState(false);


  const handleEditSport = async (field: string) => {
    let sportId : number = 0;
    if ( field == 'basketball'){
      sportId = 3;
      setSelectedSportName("Basquetbol");
    }
    else if ( field == 'basketball3x3'){
      sportId = 4;
      setSelectedSportName("Basquetbol 3x3");
    }
    else if ( field == 'football7'){
      sportId = 1;
      setSelectedSportName("Fútbol 7");
    }
    else if ( field == 'football5'){
      sportId = 2;
      setSelectedSportName("Fútbol 5");
    }
    if (!sportId || !email) return;

    try {
      const res = await fetch(`${env.API_URL}users/sport?email=${email}&sportId=${sportId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Error al obtener info del deporte');

      const data = await res.json();
      setUserId(data.userId);
      setSportInfo({
        primary_position: data.primaryPosition || '',
        secondary_position: data.secondaryPosition || '',
        description: data.description || '',
      });
      setSelectedSport(sportId);
      setIsSportModalVisible(true);
    } catch (error) {
      console.error('Error al cargar deporte:', error);
      alert('No se pudo cargar la información del deporte');
    }
  };

  const handleSaveSportInfo = async () => {
    if (!selectedSport || !email) return;

    try {

      let jsonInput = {
        sportId : selectedSport,
        userEmail: email,
        userId: userId,
        primaryPosition: sportInfo.primary_position,
        secondaryPosition : sportInfo.secondary_position,
        description : sportInfo.description
      }

      const res = await fetch(`${env.API_URL}sport-users/`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonInput),
      });

      if (!res.ok) throw new Error('Error al guardar info del deporte');

      alert('Información actualizada correctamente');
      setIsSportModalVisible(false);
    } catch (error) {
      console.error('Error al guardar deporte:', error);
      alert('No se pudo guardar la información del deporte');
    }
  };
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    nickname: '',
    category: '',
    basketball: false,
    basketball3x3: false,
    football7: false,
    football5: false,
    birthdate: '',
    profilePhoto: '',
    georeference : ''
  });

  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Estado para controlar el modal de confirmación

  useEffect(() => {
    const fetchUserData = async () => {
      try {
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
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          nickname: data.nickname || '',
          category: data.category || '',
          basketball: data.basketball || false,
          basketball3x3: data.basketball3x3 || false,
          football7: data.football7 || false,
          football5: data.football5 || false,
          birthdate: data.birthdate || '',
          profilePhoto: data.profilePhoto || '',
          georeference: data.geoReference || ''
        });
        console.log(data.geoReference)
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [email, token]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }
  
    if (selectedDate) {
      setTempDate(selectedDate); // Guardamos la fecha seleccionada temporalmente
    }
  };

  const confirmDate = () => {
    if (tempDate) {
      const adjustedDate = new Date(
        tempDate.getFullYear(),
        tempDate.getMonth(),
        tempDate.getDate()
      );
      setFormData({ ...formData, birthdate: adjustedDate.toISOString().split('T')[0] });
    }
    setShowDatePicker(false);
  };

  const cancelDate = () => {
    setTempDate(null);
    setShowDatePicker(false);
  };

  const handleSaveChanges = async () => {
    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        nickname: formData.nickname,
        category: formData.category,
        basketball: formData.basketball,
        basketball3x3: formData.basketball3x3,
        football7: formData.football7,
        football5: formData.football5,
        birthdate: formData.birthdate,
        geoReference : formData.georeference,
      };

      const response = await fetch(`${env.API_URL}users/`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Error al guardar los cambios');
      }

      alert('Datos actualizados correctamente');
      navigation.goBack();
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un problema al guardar los cambios');
    }
  };

  const showConfirmationModal = () => {
    setShowConfirmModal(true);
  };

  const hideConfirmationModal = () => {
    setShowConfirmModal(false);
  };

  const handleConfirmChanges = () => {
    handleSaveChanges();
    hideConfirmationModal();
  };

  const renderCheckbox = (label: string, field: keyof typeof formData) => (
    <View style={styles.checkboxContainer} key={field}>
      <Checkbox
        status={formData[field] ? 'checked' : 'unchecked'}
        onPress={() => handleChange(field, !formData[field])}
        color="#fff"
        uncheckedColor="#fff"
      />
      <Text style={styles.checkboxLabel}>{label}</Text>
      {formData[field] && (
        <TouchableOpacity onPress={() => handleEditSport(field)}>
          <Icon name="pencil" size={20} color="#fff" style={styles.editIcon} />
        </TouchableOpacity>
      )}
    </View>
  );

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Se necesita permiso para acceder a la galería.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      handleChange('profilePhoto', uri);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} color="#fff" size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#2264A7' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Image source={require('../assets/images/logo.png')} style={styles.logo} />
            <Text style={styles.headerText}>ChangApp</Text>
          </View>
        </View>

        <Text style={styles.title}>Configuración de perfil</Text>

        <View style={styles.avatarContainer}>
          <Image
            source={
              formData.profilePhoto
                ? { uri: formData.profilePhoto }
                : require('../assets/images/default-avatar.png')
            }
            style={styles.avatar}
          />
          <Button mode="contained" onPress={pickImage} style={styles.pickImageButton} labelStyle={styles.saveButtonText}>
            Seleccionar nueva foto
          </Button>
        </View>

        <Text style={styles.inputLabel}>Nombre</Text>
        <TextInput
          value={formData.firstName}
          onChangeText={text => handleChange('firstName', text)}
          style={styles.input}
          mode="outlined"
        />

        <Text style={styles.inputLabel}>Apellido</Text>
        <TextInput
          value={formData.lastName}
          onChangeText={text => handleChange('lastName', text)}
          style={styles.input}
          mode="outlined"
        />

        <Text style={styles.inputLabel}>Correo electrónico</Text>
        <TextInput
          value={formData.email}
          editable={false}
          style={styles.input}
          mode="outlined"
        />

        <Text style={styles.inputLabel}>Apodo</Text>
        <TextInput
          value={formData.nickname}
          onChangeText={text => handleChange('nickname', text)}
          style={styles.input}
          mode="outlined"
        />

        <View style={styles.container}>
          <Text style={styles.inputLabel}>Categoría</Text>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity onPress={() => setMenuVisible(true)}>
                <TextInput
                  value={formData.category}
                  style={styles.input}
                  mode="outlined"
                  editable={false}
                  pointerEvents="none" // importante para evitar conflictos de touch
                  right={<TextInput.Icon icon="menu-down" />}
                />
              </TouchableOpacity>
            }
          >
            <Menu.Item onPress={() => {handleChange('category', 'masculino'); setMenuVisible(false);}} title="Masculino" />
            <Menu.Item onPress={() => {handleChange('category', 'femenino'); setMenuVisible(false);}} title="Femenino" />
            <Menu.Item onPress={() => {handleChange('category', 'mixto'); setMenuVisible(false);}} title="Mixto" />
          </Menu>
        </View>

        <Text style={styles.inputLabel}>Fecha de nacimiento</Text>
        <TextInput
          value={formData.birthdate}
          style={styles.input}
          mode="outlined"
          editable={false}
          onPressIn={() => setShowDatePicker(true)}
          right={<TextInput.Icon icon="calendar" />}
        />
        {showDatePicker && (
          <View style={{ backgroundColor: '#fff', padding: 10, borderRadius: 10 }}>
            <DateTimePicker
              value={tempDate || (formData.birthdate ? new Date(formData.birthdate) : new Date())}
              mode="date"
              display={Platform.OS === 'android' ? 'calendar' : 'spinner'}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
              <Button onPress={cancelDate} mode="outlined" textColor="#2264A7" style={{ borderColor: '#fff' }}>
                Cancelar
              </Button>
              <Button onPress={confirmDate} mode="contained" buttonColor="#fff" textColor="#2264A7">
                Confirmar
              </Button>
            </View>
          </View>
        )}

        <Text style={styles.checkboxSectionTitle}>Presiona sobre un deporte para activarlo/desactivarlo:</Text>
        {renderCheckbox('Básquetbol', 'basketball')}
        {renderCheckbox('Básquetbol 3x3', 'basketball3x3')}
        {renderCheckbox('Fútbol 7', 'football7')}
        {renderCheckbox('Fútbol 5', 'football5')}

        <Button mode="contained" onPress={showConfirmationModal} style={styles.saveButton} labelStyle={styles.saveButtonText}>
          Guardar cambios
        </Button>
        <Portal>
          <Dialog visible={showConfirmModal} onDismiss={hideConfirmationModal}>
            <Dialog.Title>Confirmar cambios</Dialog.Title>
            <Dialog.Content>
              <Text>¿Estás seguro de que deseas guardar estos cambios?</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideConfirmationModal} textColor="#2264A7">Cancelar</Button>
              <Button onPress={handleConfirmChanges} textColor="#2264A7">Confirmar</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        <Portal>
          <Dialog visible={isSportModalVisible} onDismiss={() => setIsSportModalVisible(false)} >
            <Dialog.Title>Preferencias para {selectedSportName}</Dialog.Title>
            <Dialog.Content>
              <Text>Posición favorita</Text>
                <TextInput
                  value={sportInfo.primary_position}
                  onChangeText={value => setSportInfo(prev => ({ ...prev, primary_position: value }))}
                  style={styles.input}
                  mode="outlined"
                />

              <Text>Posición alternativa</Text>
                <TextInput
                  value={sportInfo.secondary_position}
                  onChangeText={value => setSportInfo(prev => ({ ...prev, secondary_position: value }))}
                  style={styles.input}
                  mode="outlined"
                />

              <Text>Describete</Text>
                <TextInput
                  multiline
                  mode="outlined"
                  value={sportInfo.description}
                  onChangeText={text => setSportInfo(prev => ({ ...prev, description: text }))}
                />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setIsSportModalVisible(false)}>Cancelar</Button>
              <Button onPress={handleSaveSportInfo}>Guardar</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ScrollView>

      
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  
  backButton: {
    padding: 5,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  logo: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  
  headerText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  container: {
    padding: 20,
    backgroundColor: '#0a4ea1',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a4ea1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'left',
  },
  inputLabel: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 5,
    marginLeft: 3,
  },
  input: {
    backgroundColor: '#ffffff',
    marginBottom: 15,
    borderRadius: 12,
  },
  saveButton: {
    marginTop: 30,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  saveButtonText: {
    color: '#2264A7',
    fontWeight: 'bold',
  },
  checkboxContainer: {
    backgroundColor: '#468acf',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  checkboxLabel: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 4,
  },
  editIcon: {
    marginLeft: 10,
  },
  checkboxSectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 10,
    marginBottom: 5,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ccc',
    marginBottom: 10,
  },
  pickImageButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  
});

export default ProfileSettingsScreen;