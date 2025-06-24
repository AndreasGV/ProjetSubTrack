import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, Image } from 'react-native';
import { supabase } from '../supabaseClient';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.log('Erreur login :', error);
      setMessage('Erreur de connexion ❌');
      Alert.alert('Erreur', 'Email ou mot de passe incorrect');
    } else {
      setMessage('Connecté ✅');
      navigation.replace('Main');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" />
      <TextInput placeholder="Mot de passe" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
      <Button title="Connexion" onPress={handleLogin} />
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.link} onPress={() => navigation.navigate('Register')}>Créer un compte</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  logo: { width: 200, height: 200, alignSelf: 'center', marginBottom: 30, marginTop: 20 },
  input: { borderWidth: 1, padding: 10, marginVertical: 5, borderRadius: 8 },
  message: { marginVertical: 10, color: 'red' },
  link: { color: 'blue', marginTop: 15, textAlign: 'center' },
});