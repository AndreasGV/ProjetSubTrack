import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { supabase } from '../supabaseClient';

export default function EditSubscriptionScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { abonnement } = route.params;

  const { id, abonnement_id, plan_name, plan_price, payment_day, abonnements } = abonnement;
  const { name, plans } = abonnements;

  const [selectedPlan, setSelectedPlan] = useState(
    plans.find((plan) => plan.name === plan_name) || plans[0]
  );
  const [day, setDay] = useState(payment_day.toString());

  const handleUpdate = async () => {
    if (!day || isNaN(day) || parseInt(day) < 1 || parseInt(day) > 31) {
      Alert.alert('Erreur', 'Jour de paiement invalide (1 à 31).');
      return;
    }

    const { error } = await supabase
      .from('abonnements_utilisateurs')
      .update({
        plan_name: selectedPlan.name,
        plan_price: selectedPlan.price,
        payment_day: parseInt(day, 10),
      })
      .eq('id', id);

    if (error) {
      Alert.alert("Erreur", "Impossible de modifier l'abonnement.");
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modifier {name}</Text>

      <FlatList
        data={plans}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.plan,
              item.name === selectedPlan.name && styles.selected,
            ]}
            onPress={() => setSelectedPlan(item)}
          >
            <Text style={styles.planText}>{item.name}</Text>
            <Text>{item.price}€ / {item.frequency}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <TextInput
        placeholder="Jour de paiement (1 à 31)"
        keyboardType="numeric"
        maxLength={2}
        value={day}
        onChangeText={setDay}
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Modifier l’abonnement</Text>
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
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#008b53',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});