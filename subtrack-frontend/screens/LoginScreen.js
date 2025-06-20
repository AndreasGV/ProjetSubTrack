import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
// 192.168.1.60
  const handleLogin = async () => {
    try {
      const res = await axios.post('http://10.2.106.112:3000/api/auth/login', {
        email,
        password,
      });
      await AsyncStorage.setItem('token', res.data.token);
      setMessage('Connecté ✅');
      navigation.replace('Main');
    } catch (err) {
      setMessage('Erreur de connexion ❌');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
      <TextInput
        placeholder="Email"
        onChangeText={setEmail}
        value={email}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Mot de passe"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
        style={styles.input}
      />
      <Button title="Connexion" onPress={handleLogin} />
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
        Créer un compte
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  logo: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
  message: { marginVertical: 10, color: 'red' },
  link: { color: 'blue', marginTop: 15, textAlign: 'center' },
});