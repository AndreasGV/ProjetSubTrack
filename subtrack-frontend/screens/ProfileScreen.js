import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView, Alert } from 'react-native';
import { supabase } from '../supabaseClient';

export default function ProfileScreen({ navigation }) {
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (user) {
        setEmail(user.email);
      } else {
        console.error('Erreur récupération utilisateur', error);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.replace('Login');
  };

  const handlePremiumClick = () => {
    Alert.alert('Bientôt disponible', 'La version Premium arrive très bientôt 😉');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.avatar}
          resizeMode="contain"
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
    width: 120,
    height: 120,
    alignSelf: 'center',
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
    backgroundColor: '#008b53', // VERT
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  premiumText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
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