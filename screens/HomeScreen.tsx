import React from 'react';
import { View, Text, Button } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen() {
  const { logout } = useAuth();

  return (
    <View>
      <Text>Bienvenido a la App</Text>
      <Button title="Cerrar sesión" onPress={logout} />
    </View>
  );
}
