import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import abonnementsData from '../assets/abonnements.json';

export default function HomeScreen({ navigation }) {
  const [abonnements, setAbonnements] = useState([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    const loadAbonnements = async () => {
      try {
        const data = await AsyncStorage.getItem('abonnements');
        const parsed = data ? JSON.parse(data) : [];
        const sorted = parsed.sort((a, b) => parseInt(a.paymentDay) - parseInt(b.paymentDay));
        setAbonnements(sorted);
      } catch (e) {
        console.error("Erreur chargement", e);
      }
    };
    if (isFocused) loadAbonnements();
  }, [isFocused]);

  const handleDelete = (index) => {
    Alert.alert('Supprimer', 'Confirmer la suppression ?', [
      { text: 'Annuler' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          const newList = [...abonnements];
          newList.splice(index, 1);
          setAbonnements(newList);
          await AsyncStorage.setItem('abonnements', JSON.stringify(newList));
        }
      }
    ]);
  };

  const handleEdit = (item) => {
    const abonnementBase = abonnementsData.find((a) => a.name === item.name);

    navigation.navigate('ChoosePlan', {
      ...item,
      plans: abonnementBase?.plans || [
        { name: item.planName, price: item.planPrice, frequency: 'mensuel' }
      ],
      type: 'fixe',
      editIndex: abonnements.findIndex((a) => a.id === item.id),
    });
  };

  const totalMensuel = abonnements.reduce((sum, a) => {
  const price = parseFloat(a.planPrice || 0);
  const isAnnuel = a.planName?.toLowerCase().includes('annuel');
  return sum + (isAnnuel ? price / 12 : price);
}, 0).toFixed(2);

  const renderItem = ({ item, index }) => (
    <TouchableOpacity onPress={() => handleEdit(item)} style={styles.card}>
      <Image source={{ uri: item.logo }} style={styles.logo} />
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text>{item.planName} - {item.planPrice}€</Text>
        <Text>Jour de paiement : {item.paymentDay}</Text>
      </View>
      <TouchableOpacity onPress={() => handleDelete(index)}>
        <Text style={styles.delete}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const userServices = abonnements.map(a => a.category);
  const recommandations = abonnementsData.filter(a =>
    !abonnements.find(ab => ab.name === a.name) && !userServices.includes(a.category)
  ).slice(0, 5);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📅 Mes abonnements actifs</Text>
      <Text style={styles.total}>Total mensuel estimé : {totalMensuel}€</Text>
      <FlatList
        data={abonnements}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={<Text style={{ marginTop: 50 }}>Aucun abonnement enregistré</Text>}
      />

      {recommandations.length > 0 && (
        <>
          <Text style={styles.recoTitle}>Suggestions personnalisées</Text>
          <FlatList
            horizontal
            data={recommandations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.recoCard}>
                <Image source={{ uri: item.logo }} style={styles.recoLogo} />
                <Text style={styles.recoName}>{item.name}</Text>
                <Text style={styles.recoCat}>{item.category}</Text>
              </View>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 10 }}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, paddingHorizontal: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  total: { fontSize: 16, marginBottom: 20, color: '#444' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 10,
    borderColor: '#ddd',
    borderWidth: 1
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 10,
    resizeMode: 'contain',
    borderRadius: 10,
    backgroundColor: '#fff'
  },
  name: { fontWeight: 'bold', fontSize: 16 },
  delete: { fontSize: 20, color: 'red', paddingLeft: 10 },
  recoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10
  },
  recoCard: {
    width: 140,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 10,
    marginRight: 12,
    alignItems: 'center'
  },
  recoLogo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginBottom: 8
  },
  recoName: { fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
  recoCat: { fontSize: 12, color: '#666' }
});
