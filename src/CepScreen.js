import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

// Nova tela que recebe a função onLogout do App.js
const CepScreen = ({ onLogout }) => {
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState(null); // Armazena os dados do CEP
  const [isLoading, setIsLoading] = useState(false);

  // Função para limpar o CEP para a máscara
  const formatarCep = (text) => {
    const numeros = text.replace(/\D/g, ''); // Remove tudo que não é número
    if (numeros.length > 5) {
      // Aplica a máscara 12345-678
      return numeros.slice(0, 5) + '-' + numeros.slice(5, 8);
    }
    return numeros;
  };

  const handleBuscarCep = async () => {
    const cepLimpo = cep.replace(/\D/g, ''); // Remove o traço para a API

    if (cepLimpo.length !== 8) {
      Alert.alert('Erro', 'O CEP deve conter 8 dígitos.');
      return;
    }

    setIsLoading(true);
    setEndereco(null); // Limpa resultados anteriores

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        Alert.alert('Erro', 'CEP não encontrado.');
      } else {
        // Sucesso! Armazena os dados no estado
        setEndereco(data);
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      Alert.alert('Erro', 'Não foi possível buscar o CEP. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Busca de Endereço via CEP</Text>
        <Text style={styles.subtitle}>
          Digite um CEP válido para ver os detalhes.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Digite o CEP (ex: 01001-000)"
          keyboardType="numeric"
          value={cep}
          onChangeText={(text) => setCep(formatarCep(text))}
          maxLength={9} // 8 números + 1 traço
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleBuscarCep}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Buscar CEP</Text>
          )}
        </TouchableOpacity>

        {/* Área de Resultado */}
        {endereco && (
          <View style={styles.resultadoContainer}>
            <Text style={styles.resultadoTitle}>Resultado:</Text>
            <Text style={styles.resultadoItem}>
              Logradouro: {endereco.logradouro || 'N/D'}
            </Text>
            <Text style={styles.resultadoItem}>
              Bairro: {endereco.bairro || 'N/D'}
            </Text>
            <Text style={styles.resultadoItem}>
              Cidade: {endereco.localidade || 'N/D'}
            </Text>
            <Text style={styles.resultadoItem}>
              Estado: {endereco.uf || 'N/D'}
            </Text>
            <Text style={styles.resultadoItem}>
              DDD: {endereco.ddd || 'N/D'}
            </Text>
          </View>
        )}

        {/* Botão de Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>Sair (Logout)</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Estilos para a tela de CEP
const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#28a745', // Cor verde para diferenciar
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#90d8a0',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultadoContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 20,
    marginTop: 30,
  },
  resultadoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  resultadoItem: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  logoutButton: {
    marginTop: 40,
    padding: 10,
  },
  logoutButtonText: {
    color: '#dc3545', // Vermelho para logout
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default CepScreen;