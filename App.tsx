import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './context/AuthContext'; // Asegúrate de que este tenga la lógica de persistencia con AsyncStorage
import Routes from './routes';
import { StyleSheet } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper'; // Importa el Provider de react-native-paper

export default function App() {
  return (
    // Envuelve toda la app con GestureHandlerRootView para gestos
    <GestureHandlerRootView style={styles.container}>
      {/* Proveedor de autenticación con persistencia de sesión */}
      <AuthProvider>
        {/* Proveedor de tema de react-native-paper */}
        <PaperProvider>
          {/* Contenedor de navegación principal */}
          <NavigationContainer>
            <Routes />
          </NavigationContainer>
        </PaperProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

// Estilos base
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
