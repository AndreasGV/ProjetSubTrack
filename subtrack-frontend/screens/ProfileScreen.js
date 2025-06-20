import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ navigation }) {
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchEmail = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setEmail(decoded.email);
      }
    };
    fetchEmail();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    navigation.replace('Login');
  };

  const handlePremiumClick = () => {
    Alert.alert('Bientôt disponible', 'La version Premium arrive très bientôt 😉');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Image
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/847/847969.png' }}
          style={styles.avatar}
        />
        <Text style={styles.title}>Profil</Text>
        <View style={styles.infoBlock}>
          <Text style={styles.label}>Email :</Text>
          <Text style={styles.value}>{email}</Text>

          <Text style={styles.label}>Abonnement :</Text>
          <Text style={styles.value}>Freemium (5 abonnements max)</Text>

          <Text style={styles.label}>Support :</Text>
          <Text style={styles.value}>support@subtrack.app</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.premiumButton} onPress={handlePremiumClick}>
          <Text style={styles.premiumText}>🌟 Passer au Premium</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  scroll: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  avatar: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    borderRadius: 40,
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
  },
  infoBlock: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 1,
    gap: 8,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  value: {
    marginBottom: 10,
    fontSize: 15,
  },
  footer: {
    paddingBottom: 20,
    paddingTop: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  premiumButton: {
    backgroundColor: '#FFD700',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  premiumText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#fff',
    padding: 16,
  },
  logoutText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
});