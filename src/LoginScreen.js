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
} from 'react-native';

// O componente agora recebe uma prop: onLoginSuccess
// Esta é a função que ele deve chamar quando o login for bem-sucedido
const LoginScreen = ({ onLoginSuccess }) => {
  // Estados: Variáveis que o React Native monitora
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [telaAtiva, setTelaAtiva] = useState('login'); // 'login' ou 'otp'
  const [codigoGerado, setCodigoGerado] = useState('');
  const [isLoading, setIsLoading] = useState(false); 

  // ... (A função gerarOTP continua igual)
  const gerarOTP = () => {
    // Gera um número aleatório de 6 dígitos
    const novoCodigo = Math.floor(100000 + Math.random() * 900000).toString();
    setCodigoGerado(novoCodigo);
    console.log('CÓDIGO OTP GERADO: ' + novoCodigo);
    return novoCodigo;
  };

  // ... (A função handleEnviarCodigo continua igual)
  const handleEnviarCodigo = async () => {
    if (!email) {
      Alert.alert('Erro', 'Por favor, digite seu e-mail.');
      return;
    }
    
    setIsLoading(true); // Ativa o carregamento

    // 1. Gerar o código
    const codigo = gerarOTP();

    // 2. Definir os dados para o EmailJS
    // (!! IMPORTANTE: Substitua pelas suas chaves do EmailJS !!)
    const data = {
      service_id: 'service_fd1wa9i', // Substitua (Passo 3 do README)
      template_id: 'template_xqr2l0v', // Substitua (Passo 3 do README)
      
      // -- CORREÇÃO ABAIXO --
      // Como a opção "Use Private Key" está DESMARCADA (como na sua imagem),
      // devemos usar a "Public Key" (user_id) aqui.
      // Você encontra esta chave em Account > Profile.
      user_id: '5DoQDfYY_bWMtrkYv', 
      // accessToken: 'SUA_PRIVATE_KEY_AQUI', // <- Não use esta
      // -- FIM DA CORREÇÃO --

      template_params: {
        to_email: email, // O e-mail digitado pelo usuário
        message: codigo, // O código OTP gerado
        from_name: 'Seu Aplicativo', // Nome do seu app
      },
    };

    // 3. Enviar o e-mail usando a API REST do EmailJS
    try {
      // Usamos fetch, pois o @emailjs/browser não funciona no React Native
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Sucesso!
        setTelaAtiva('otp');
        Alert.alert(
          'Código Enviado',
          `Enviamos um código de verificação para ${email}.`
        );
      } else {
        // Erro do EmailJS
        const errorText = await response.text();
        throw new Error(`Falha ao enviar o e-mail: ${errorText}`);
      }
    } catch (error) {
      console.error('Erro no EmailJS:', error);
      Alert.alert('Erro', 'Não foi possível enviar o código. Verifique suas chaves do EmailJS e a conexão.');
    } finally {
      setIsLoading(false); // Desativa o carregamento
    }
  };

  const handleVerificarCodigo = () => {
    if (otpCode.length !== 6) {
      Alert.alert('Erro', 'O código deve ter 6 dígitos.');
      return;
    }

    // Lógica principal: Comparar o que o usuário digitou com o código gerado
    if (otpCode === codigoGerado) {
      
      // -- MUDANÇA PRINCIPAL AQUI --
      // Em vez de mostrar um alerta, chamamos a função
      // que recebemos do App.js para mudar de tela.
      onLoginSuccess();
      // -- FIM DA MUDANÇA --

    } else {
      Alert.alert('Erro', 'Código OTP inválido. Tente novamente.');
      setOtpCode(''); // Limpa o campo para nova tentativa
    }
  };

  // ------------------------------------------
  // Renderização das Telas (continua igual)
  // ------------------------------------------

  // Tela 1: Solicitar E-mail
  const renderLoginTela = () => (
    <View style={styles.container}>
      <Text style={styles.title}>Acesse sua Conta</Text>
      <Text style={styles.subtitle}>
        Informe seu e-mail para receber o código de acesso.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Seu e-mail"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]} // Estilo condicional
        onPress={handleEnviarCodigo}
        disabled={isLoading} // Desabilita o botão enquanto carrega
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Receber Código OTP</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  // Tela 2: Inserir o Código OTP
  const renderOTPTela = () => (
    <View style={styles.container}>
      <Text style={styles.title}>Verificação de Código</Text>
      <Text style={styles.subtitle}>
        Digite o código de 6 dígitos enviado para:
      </Text>
      <Text style={styles.emailText}>{email}</Text>

      <TextInput
        style={styles.otpInput}
        placeholder="------"
        keyboardType="numeric"
        maxLength={6}
        value={otpCode}
        onChangeText={setOtpCode}
        textAlign="center" // Centraliza o texto no campo
        autoFocus={true} // Foca no campo automaticamente
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleVerificarCodigo}
      >
        <Text style={styles.buttonText}>Verificar e Entrar</Text>
      </TouchableOpacity>
      
      {/* Botão de Reenviar (chama a mesma função de envio) */}
      <TouchableOpacity 
        onPress={handleEnviarCodigo} 
        disabled={isLoading}
        style={styles.reenviarButton}
      >
        <Text style={[styles.reenviarText, isLoading && styles.reenviarTextDisabled]}>
          {isLoading ? 'Reenviando...' : 'Reenviar Código'}
        </Text>
      </TouchableOpacity>

      {/* Botão para voltar e trocar e-mail */}
      <TouchableOpacity 
        onPress={() => {
          setTelaAtiva('login');
          setOtpCode(''); // Limpa o código antigo
        }} 
        style={styles.voltarButton}
      >
        <Text style={styles.reenviarText}>Trocar e-mail</Text>
      </TouchableOpacity>
    </View>
  );

  // O componente renderiza a tela que estiver ativa
  // Usamos KeyboardAvoidingView para o teclado não tampar os inputs
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      {telaAtiva === 'login' ? renderLoginTela() : renderOTPTela()}
    </KeyboardAvoidingView>
  );
};
// ------------------------------------------
// Estilos (StyleSheet)
// ------------------------------------------
const styles = StyleSheet.create({
// ... (Estilos continuam os mesmos)
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1, // Faz a tela ocupar todo o espaço
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20, // Ajustado
  },
  emailText: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
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
  otpInput: {
    width: '80%',
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#007bff',
    fontSize: 28,
    letterSpacing: 10, // Simula o espaçamento entre os dígitos
  },

  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007bff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#99caff', // Cor mais clara quando desabilitado
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reenviarButton: {
    marginTop: 20,
  },
  voltarButton: {
    marginTop: 15,
  },
  reenviarText: {
    color: '#007bff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  reenviarTextDisabled: {
    color: '#aaa',
  }
});
export default LoginScreen;