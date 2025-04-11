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
import { Ionicons } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';
import { useAuth } from '../context/AuthContext';
import env from '../config/env';

const LoginScreen = () => {
  const { login } = useAuth(); // función que debe guardar token/usuario en contexto
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      let jsonObject : any = { 
        'email' : email, 
        'password' : password 
      };
      const response = await fetch(`${env.API_URL}auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonObject),
      })
      .then(function (a) {
        console.log("a")
        return a.json(); // call the json method on the response to get JSON
      })
      .then(function (json) {
        console.log("json")
          console.log(json)
      })


      /*if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al iniciar sesión');
      }

      const data: any = await response.json();
      console.log(data)
      login(); // aquí puedes guardar token, user, etc]
*/
    } catch (error: any) {
      Alert.alert('Login fallido', error.message);
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

              <TouchableOpacity style={styles.googleButton}>
                <Text style={styles.googleButtonText}>
                  <Text>🟢 </Text>
                  Ingresar con Google
                </Text>
              </TouchableOpacity>

              <TouchableOpacity>
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
});
