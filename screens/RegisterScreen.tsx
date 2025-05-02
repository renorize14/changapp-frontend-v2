import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';
import { useAuth } from '../context/AuthContext';
import env from '../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import * as Location from 'expo-location';

const RegisterScreen = () => {
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [apodo, setApodo] = useState('');
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaValue, setCaptchaValue] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [georeference, setGeoreference] = useState('');

  const validateAndRegister = async () => {
    if (!nombre || !apellidos || !apodo || !email || !password || !confirmPassword) {
      return Alert.alert('Error', 'Todos los campos son obligatorios');
    }

    if (password !== confirmPassword) {
      return Alert.alert('Error', 'Las contraseñas no coinciden');
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecialChar = /[.\-_/\\]/.test(password);

    if (!hasUppercase || !hasSpecialChar) {
      return Alert.alert(
        'Error',
        'La contraseña debe tener al menos una letra mayúscula y un carácter especial (., -, /, etc.)'
      );
    }

    if (captchaInput !== captchaAnswer) {
      return Alert.alert('Error', 'Captcha incorrecto');
    }

    setLoading(true);
    try {
      const response = await fetch(`${env.API_URL}auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: nombre,
          lastName: apellidos,
          nickname: apodo,
          email,
          password,
          georeference
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ocurrió un error');
      }

      Alert.alert('Éxito', 'Cuenta creada correctamente');
      navigation.navigate('Login');
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

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
      setGeoreference(`${latitude},${longitude}`);

    }
    catch (error) {
      console.error(error);
      Alert.alert('Error', 'Ocurrió un problema al obtener la ubicación');
    } 
  };

  useEffect(() => {
    handleGeolocationUpdate();
    const a = Math.floor(Math.random() * 10);
    const b = Math.floor(Math.random() * 10);
    setCaptchaValue(`${a} + ${b}`);
    setCaptchaAnswer((a + b).toString());
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ImageBackground
          source={require('../assets/images/background.png')}
          style={styles.background}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.inner}>
              <Image
                source={require('../assets/images/logo.png')}
                style={styles.logo}
              />
              <Text style={styles.title}>ChangApp</Text>
              <Text style={styles.subTitle}>Registro</Text>

              <TextInput
                style={styles.input}
                placeholder="Nombres"
                placeholderTextColor="#aaa"
                autoCapitalize="none"
                value={nombre}
                onChangeText={setNombre}
              />

              <TextInput
                style={styles.input}
                placeholder="Apellidos"
                placeholderTextColor="#aaa"
                autoCapitalize="none"
                value={apellidos}
                onChangeText={setApellidos}
              />

              <TextInput
                style={styles.input}
                placeholder="Apodo"
                placeholderTextColor="#aaa"
                autoCapitalize="none"
                value={apodo}
                onChangeText={setApodo}
              />

              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#aaa"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Password"
                  placeholderTextColor="#aaa"
                  secureTextEntry={!passwordVisible}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                  <Ionicons name={passwordVisible ? 'eye' : 'eye-off'} size={24} color="#888" />
                </TouchableOpacity>


              </View>

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirmar password"
                  placeholderTextColor="#aaa"
                  secureTextEntry={!confirmPasswordVisible}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}>
                  <Ionicons name={confirmPasswordVisible ? 'eye' : 'eye-off'} size={24} color="#888" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder={`¿Cuánto es ${captchaValue}?`}
                placeholderTextColor="#aaa"
                keyboardType="numeric"
                value={captchaInput}
                onChangeText={setCaptchaInput}
              />

              <TouchableOpacity style={styles.loginButton} onPress={validateAndRegister} disabled={loading}>
                <Text style={styles.loginButtonText}>{loading ? 'Cargando...' : 'Registrarse'}</Text>
              </TouchableOpacity>

              <Button
                icon={() => <AntDesign name="google" size={20} color="#DB4437" />}
                mode="outlined"
                style={styles.socialButton}
                onPress={() => { }}
              >
                Crear cuenta con Google
              </Button>

              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.signupText}>
                  ¿Ya tienes una cuenta? <Text style={styles.signupLink}>Ingresar</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </ImageBackground>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  inner: {
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subTitle: {
    fontSize: 15,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 15,
    fontSize: 16,
  },
  passwordContainer: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#1E63F1',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButton: {
    width: '100%',
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
  },
  googleButtonText: {
    fontSize: 16,
    color: '#333',
  },
  signupText: {
    fontSize: 14,
    color: '#fff',
    marginTop: 10,
  },
  signupLink: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  socialButton: {
    width: '100%',
    marginVertical: 5,
    backgroundColor: '#fff',
  },
});

export default RegisterScreen;
