import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabaseClient';
import { logoMap } from '../assets/logoMap';
import { Swipeable } from 'react-native-gesture-handler';

export default function HomeScreen() {
  const [abonnements, setAbonnements] = useState([]);
  const [total, setTotal] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [userId, setUserId] = useState(null);
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
        fetchAbonnements(session.user.id);
        fetchSuggestions(session.user.id);
      }
    };
    fetchUser();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        fetchAbonnements(userId);
      }
    }, [userId])
  );

  const fetchAbonnements = async (uid) => {
    const { data, error } = await supabase
      .from('abonnements_utilisateurs')
      .select('*, abonnements(*)')
      .eq('user_id', uid);

    if (error) {
      console.log('Erreur récupération abonnements :', error);
      return;
    }

    setAbonnements(data);
    const totalEstime = data.reduce((sum, item) => {
      const rawPrice = parseFloat(item.plan_price) || 0;
      const isAnnuel = item.plan_name?.toLowerCase().includes('annuel');
      const monthlyPrice = isAnnuel ? rawPrice / 12 : rawPrice;
      return sum + monthlyPrice;
    }, 0);
    setTotal(totalEstime);
  };

  const fetchSuggestions = async (uid) => {
    const { data, error } = await supabase.rpc('suggest_abonnements', {
      p_user_id: uid,
    });

    if (error) {
      console.log('Erreur suggestions :', error);
      return;
    }
    setSuggestions(data);
  };

  const handleEdit = (abonnement) => {
    navigation.navigate('EditSubscriptionScreen', { abonnement });
  };

  const handleDelete = async (id) => {
    Alert.alert('Confirmation', 'Supprimer cet abonnement ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase
            .from('abonnements_utilisateurs')
            .delete()
            .eq('id', id);
          if (error) {
            Alert.alert('Erreur', error.message);
          } else {
            fetchAbonnements(userId);
          }
        },
      },
    ]);
  };

  const sortData = (key) => {
    const newOrder = sortBy === key && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(key);
    setSortOrder(newOrder);
    const sorted = [...abonnements].sort((a, b) => {
      if (key === 'name') {
        return newOrder === 'asc'
          ? a.abonnements?.name.localeCompare(b.abonnements?.name)
          : b.abonnements?.name.localeCompare(a.abonnements?.name);
      } else if (key === 'price') {
        return newOrder === 'asc'
          ? a.plan_price - b.plan_price
          : b.plan_price - a.plan_price;
      } else if (key === 'day') {
        return newOrder === 'asc'
          ? a.payment_day - b.payment_day
          : b.payment_day - a.payment_day;
      }
      return 0;
    });
    setAbonnements(sorted);
  };

  const renderAbonnement = ({ item }) => (
    <Swipeable
      renderRightActions={() => (
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={styles.swipeDeleteButton}
        >
          <Ionicons name="trash-outline" size={24} color="white" />
          <Text style={styles.swipeDeleteText}>Supprimer</Text>
        </TouchableOpacity>
      )}
    >
      <View style={styles.abonnementItem}>
        <Image
          source={logoMap[item.abonnements?.id] || require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.abonnementInfo}>
          <Text style={styles.name}>{item.abonnements?.name || 'Abonnement'}</Text>
          <Text>{item.plan_name} - {item.plan_price}€</Text>
          <Text style={styles.jourPaiement}>💳 Paiement le {item.payment_day}</Text>
        </View>
        <View style={styles.actions}>
          {item.abonnements?.unsubscribe_link && (
            <TouchableOpacity
              onPress={() => Linking.openURL(item.abonnements.unsubscribe_link)}
              style={{ marginRight: 8 }}
            >
              <Ionicons name="exit-outline" size={20} color="#008b53" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => handleEdit(item)} style={{ marginRight: 8 }}>
            <Ionicons name="create-outline" size={20} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <Ionicons name="close-outline" size={24} color="red" />
          </TouchableOpacity>
        </View>
      </View>
    </Swipeable>
  );

  const renderSuggestion = ({ item }) => (
    <View style={styles.suggestionCard}>
      <Image
        source={logoMap[item.id] || require('../assets/logo.png')}
        style={styles.suggestionLogo}
        resizeMode="contain"
      />
      <Text style={styles.suggestionName}>{item.name}</Text>
      <Text style={styles.suggestionCategory}>{item.category}</Text>
    </View>
  );

  const getArrow = (key) => sortBy === key ? (sortOrder === 'asc' ? '↑' : '↓') : '';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📅 Mes abonnements actifs</Text>
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterButton, sortBy === 'price' && styles.activeFilter]}
          onPress={() => sortData('price')}
        >
          <Text style={styles.filterText}>€ {getArrow('price')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, sortBy === 'name' && styles.activeFilter]}
          onPress={() => sortData('name')}
        >
          <Text style={styles.filterText}>Nom {getArrow('name')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, sortBy === 'day' && styles.activeFilter]}
          onPress={() => sortData('day')}
        >
          <Text style={styles.filterText}>Jour {getArrow('day')}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.total}>Total mensuel estimé : {total.toFixed(2)}€</Text>

      {abonnements.length === 0 ? (
        <Text style={styles.empty}>Aucun abonnement enregistré</Text>
      ) : (
        <FlatList
          data={abonnements}
          renderItem={renderAbonnement}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
        />
      )}

      <Text style={styles.subtitle}>Suggestions personnalisées</Text>
      <FlatList
        data={suggestions}
        horizontal
        renderItem={renderSuggestion}
        keyExtractor={(item) => item.id.toString()}
        style={styles.suggestionsList}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 70 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  total: { fontSize: 18, marginBottom: 10 },
  empty: { fontStyle: 'italic', color: 'gray' },
  list: { marginTop: 16 },
  abonnementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    borderColor: '#008b53',
    borderWidth: 1,
  },
  logo: { width: 40, height: 40, marginRight: 10 },
  abonnementInfo: { flex: 1 },
  name: { fontWeight: 'bold', fontSize: 16 },
  jourPaiement: { fontSize: 12, color: 'gray', marginTop: 2 },
  subtitle: { marginTop: 24, fontSize: 20, fontWeight: '600' },
  suggestionsList: { marginTop: 12 },
  suggestionCard: {
    width: 120,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  suggestionLogo: { width: 40, height: 40, marginBottom: 6 },
  suggestionName: { fontWeight: 'bold', textAlign: 'center' },
  suggestionCategory: { fontSize: 12, color: 'gray', textAlign: 'center' },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
    marginTop: 8,
  },
  filterButton: {
    backgroundColor: '#eee',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  activeFilter: {
    backgroundColor: '#008b53',
  },
  filterText: {
    color: '#000',
    fontWeight: 'bold',
  },
  swipeDeleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    borderRadius: 12,
    marginVertical: 6,
    padding: 10,
  },
  swipeDeleteText: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 4,
  },
});