import React, { useState } from 'react';
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
import * as Google from 'expo-auth-session/providers/google';

const LoginScreen = () => {
  const { signIn } = useAuth(); // función que debe guardar token/usuario en contexto
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  AsyncStorage.removeItem('token');

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: env.GOOGLE_CLIENT_ID, // Obtén tu CLIENT_ID desde Google Cloud Console
    iosClientId: env.GOOGLE_IOS_CLIENT_ID, // ID de cliente para iOS
    androidClientId: env.GOOGLE_ANDROID_CLIENT_ID, // ID de cliente para Android
  });

  /*React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params; // El id_token es el que se obtiene al autenticarse
      handleGoogleSignIn(id_token);
    }
  }, [response]);*/

  React.useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        const response = await fetch(`${env.API_URL}users`); 
        if (!response.ok) throw new Error('Servidor no responde');
      } catch (error) {
        Alert.alert(
          'Error de conexión',
          'No se pudo establecer comunicación con el servidor. Intenta más tarde.'
        );
      }
    };
  
    checkBackendConnection();
  }, []);

  const handleGoogleSignIn = async (idToken : any) => {
    try {
      const response = await fetch(`${env.API_URL}api/oauth2/success`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_token: idToken }),
      });
      const json = await response.json();

      if (json.token) {
        // Guarda el token en AsyncStorage y en contexto
        await AsyncStorage.setItem('token', json.token);
        signIn(json.token, json.user.email); // Asume que el backend te devuelve el token y los datos del usuario
        navigation.navigate('Home'); // Redirige a la pantalla principal
      } else {
        Alert.alert('Error', 'No se pudo autenticar con Google');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Ocurrió un error al procesar tu solicitud.');
    }
  };
  

  const handleLogin = async () => {
    try {
      setLoading(true);
      let jsonObject : any = { 
        'email' : email, 
        'password' : password 
      };
      const response : any = await fetch(`${env.API_URL}auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonObject),
      })
      .then(function (a) {
        return a.json(); 
      })
      .then(function (json : any) {
        if (!json.token) {
          throw new Error('Error al iniciar sesión');
        }
        else{
          AsyncStorage.setItem('token', json.token);
          signIn(json.token, email);

        }
      })


    } catch (error: any) {
      Alert.alert('Login fallido', "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
      

      
  };

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

              <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
                <Text style={styles.loginButtonText}>{loading ? 'Cargando...' : 'Ingresar'}</Text>
              </TouchableOpacity>

              {/* Barra superior <Button
                icon={() => <AntDesign name="google" size={20} color="#DB4437" />}
                mode="outlined"
                style={styles.socialButton}
                onPress={() => promptAsync()}
              >
                Acceder con Google
              </Button>*/}
              
              <TouchableOpacity onPress={ () => navigation.navigate('Register')}>
                <Text style={styles.signupText}>
                  ¿No tienes una cuenta? <Text style={styles.signupLink}>Regístrate</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </ImageBackground>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

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
    width: 200,
    height: 200,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
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
