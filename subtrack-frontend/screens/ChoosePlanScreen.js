import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChoosePlanScreen({ route, navigation }) {
  const { name, plans, category, logo, id, planName, planPrice, paymentDay } = route.params;

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [customPrice, setCustomPrice] = useState('');
  const [currentDay, setCurrentDay] = useState('');
  const [isCustomOnly, setIsCustomOnly] = useState(false);

  useEffect(() => {
    if (planName && planPrice) {
      setSelectedPlan({ name: planName, price: planPrice, frequency: 'mensuel' });
    }
    if (paymentDay) {
      setCurrentDay(paymentDay.toString());
    }
    if (plans && plans.every(p => p.name.toLowerCase().includes('perso'))) {
      setIsCustomOnly(true);
    }
  }, []);

  const handleValidate = async () => {
    const finalPlan = selectedPlan || {
      name: 'Personnalisé',
      price: customPrice,
      frequency: 'mensuel',
    };

    if (!finalPlan.price || isNaN(finalPlan.price)) {
      return Alert.alert('Erreur', 'Veuillez entrer un prix valide');
    }

    if (!currentDay) {
      return Alert.alert('Erreur', 'Veuillez indiquer un jour de paiement');
    }

    const newItem = {
      id: id || Date.now().toString(),
      name,
      logo,
      category,
      planName: finalPlan.name,
      planPrice: finalPlan.price,
      paymentDay: currentDay,
    };

    try {
      const existing = await AsyncStorage.getItem('abonnements');
      const parsed = existing ? JSON.parse(existing) : [];

      const existingIndex = parsed.findIndex((a) => a.id === id);
      if (existingIndex !== -1) {
        parsed[existingIndex] = { ...parsed[existingIndex], ...newItem };
      } else {
        parsed.push(newItem);
      }

      await AsyncStorage.setItem('abonnements', JSON.stringify(parsed));
      navigation.navigate('Main');
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de sauvegarder');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{name}</Text>

      {!isCustomOnly && plans?.length > 0 && plans.map((plan, idx) => (
        <Button
          key={idx}
          title={`${plan.name} - ${plan.price}€/${plan.frequency}`}
          onPress={() => setSelectedPlan(plan)}
          color={selectedPlan?.name === plan.name ? 'green' : undefined}
        />
      ))}

      {(isCustomOnly || !selectedPlan) && (
        <TextInput
          placeholder="Entrez votre propre tarif"
          keyboardType="numeric"
          value={customPrice}
          onChangeText={setCustomPrice}
          style={styles.input}
        />
      )}

      <TextInput
        placeholder="Jour de paiement (1-31)"
        keyboardType="numeric"
        value={currentDay}
        onChangeText={setCurrentDay}
        style={styles.input}
      />

      <Button title="Valider l’abonnement" onPress={handleValidate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20, gap: 15 }, // ⬅️ Espace haut
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  input: { borderWidth: 1, padding: 10, borderRadius: 8, marginVertical: 5 },
});