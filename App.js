import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar } from 'react-native';
import LoginScreen from './src/LoginScreen';
import CepScreen from './src/CepScreen'; // Importamos a nova tela

/**
 * Este componente agora controla o fluxo do aplicativo.
 * Ele decide qual tela mostrar: Login ou a tela principal (BuscaCEP).
 */
export default function App() {
  // Estado para saber se o usuário está logado ou não
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Função que será chamada pela LoginScreen quando o OTP for correto
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  // Função para fazer logout (será usada pela CepScreen)
  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Renderização condicional:
        Se isLoggedIn for true, mostra a tela de CEP.
        Se não, mostra a tela de Login.
      */}
      {isLoggedIn ? (
        <CepScreen onLogout={handleLogout} />
      ) : (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});