import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, Image } from 'react-native';
import { supabase } from '../supabaseClient'; 

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Merci de remplir tous les champs');
      return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      console.log('Erreur Supabase :', error.message);
      setMessage("Erreur d'inscription ❌");
      Alert.alert('Erreur', error.message);
    } else {
      console.log('Inscription réussie :', data);
      setMessage('Compte créé ✅');
      Alert.alert('Succès', 'Compte créé ! Vous pouvez vous connecter.');
      navigation.navigate('Login');
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
      <Button title="S'inscrire" onPress={handleRegister} />
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
        Déjà inscrit ? Se connecter
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  logo: {
    width: 140,
    height: 140,
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
  message: { marginVertical: 10, color: 'green', textAlign: 'center' },
  link: { color: 'blue', marginTop: 15, textAlign: 'center' },
});