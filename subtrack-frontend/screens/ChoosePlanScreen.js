import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, TextInput, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { supabase } from '../supabaseClient';

export default function ChoosePlanScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id, name, logo, category, plans } = route.params;

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [customPrice, setCustomPrice] = useState('');
  const [day, setDay] = useState('');

  const allPlans = [{ name: 'Personnalisé', price: null, frequency: '' }, ...plans];

  const handleSubmit = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      Alert.alert('Erreur', 'Utilisateur non connecté.');
      return;
    }

    if (!day || isNaN(day) || parseInt(day) < 1 || parseInt(day) > 31) {
      Alert.alert('Erreur', 'Jour de paiement invalide (1 à 31).');
      return;
    }

    const priceToUse =
      selectedPlan?.price !== null && selectedPlan?.price !== undefined
        ? selectedPlan.price
        : parseFloat(customPrice);

    if (isNaN(priceToUse) || priceToUse < 0) {
      Alert.alert("Erreur", "Prix invalide.");
      return;
    }

    const planName = selectedPlan?.name || 'Perso';

    const { error } = await supabase.from('abonnements_utilisateurs').insert([
      {
        user_id: userData.user.id,
        abonnement_id: id,
        plan_name: planName,
        plan_price: priceToUse,
        payment_day: parseInt(day, 10),
      },
    ]);

    if (error) {
      Alert.alert("Erreur", "Échec de l'enregistrement.");
    } else {
      navigation.navigate('Main');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choisir un plan pour {name}</Text>

      <FlatList
        data={allPlans}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.plan,
              selectedPlan?.name === item.name && styles.selected,
            ]}
            onPress={() => setSelectedPlan(item)}
          >
            <Text style={styles.planText}>{item.name}</Text>
            {item.price !== null ? (
              <Text>{item.price}€ / {item.frequency}</Text>
            ) : (
              <Text>Entrer un prix personnalisé</Text>
            )}
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {(!selectedPlan || selectedPlan.price === null) && (
        <TextInput
          placeholder="Prix personnalisé (€)"
          keyboardType="numeric"
          value={customPrice}
          onChangeText={setCustomPrice}
          style={styles.input}
        />
      )}

      <TextInput
        placeholder="Jour de paiement (1 à 31)"
        keyboardType="numeric"
        maxLength={2}
        value={day}
        onChangeText={setDay}
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Ajouter l’abonnement</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 50, flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  plan: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f3f3f3',
    marginBottom: 10,
  },
  selected: {
    borderWidth: 2,
    borderColor: 'green',
  },
  planText: { fontWeight: 'bold', fontSize: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#008b53',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});