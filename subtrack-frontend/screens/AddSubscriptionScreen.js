import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import abonnementsData from '../assets/abonnements.json';

export default function AddSubscriptionScreen({ navigation }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    setResults(abonnementsData);
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
onPress={() => navigation.navigate('ChoosePlan', {
  id: item.id,
  name: item.name,
  category: item.category,
  plans: item.plans,
  logo: item.logo,
  type: 'fixe',
})}
    >
      <Image source={{ uri: item.logo || 'https://via.placeholder.com/100' }} style={styles.icon} />
      <View>
        <Text style={styles.title}>{item.name}</Text>
        <Text>{item.category}</Text>
        {item.plans && item.plans.length > 0 && (
          <Text>{item.plans.map(p => `${p.name}: ${p.price}€/ ${p.frequency}`).join(' | ')}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    gap: 12
  },
  icon: {
    width: 60,
    height: 60,
    marginRight: 10,
    borderRadius: 8,
    resizeMode: 'contain',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2
  },
  title: { fontWeight: 'bold', fontSize: 16 },
});