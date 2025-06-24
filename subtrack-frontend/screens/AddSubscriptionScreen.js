import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { logoMap } from '../assets/logoMap';
import { supabase } from '../supabaseClient';
import { Ionicons } from '@expo/vector-icons';

export default function AddSubscriptionScreen({ navigation }) {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    const fetchAbonnements = async () => {
      const { data, error } = await supabase.from('abonnements').select('*');
      if (data) {
        setResults(data);
        setFilteredResults(data);
      }
    };
    fetchAbonnements();
  }, []);

  const handleSearch = (text) => {
    setSearch(text);
    const filtered = results.filter(item =>
      item.name.toLowerCase().includes(text.toLowerCase())
    );
    applyFilters(filtered, categoryFilter);
  };

  const handleCategoryFilter = (cat) => {
    const newCat = cat === categoryFilter ? '' : cat;
    setCategoryFilter(newCat);
    applyFilters(results, newCat, search);
  };

  const applyFilters = (baseList, category, searchText = search) => {
    let list = baseList;
    if (category) list = list.filter(item => item.category === category);
    if (searchText) list = list.filter(item => item.name.toLowerCase().includes(searchText.toLowerCase()));
    setFilteredResults(list);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('ChoosePlan', {
          id: item.id,
          name: item.name,
          category: item.category,
          plans: item.plans,
          logo: item.logo,
          type: 'fixe',
        })
      }
    >
      <Image
        source={logoMap[item.id] || { uri: item.logo || 'https://via.placeholder.com/100' }}
        style={styles.icon}
      />
      <View>
        <Text style={styles.title}>{item.name}</Text>
        <Text>{item.category}</Text>
        {item.plans && item.plans.length > 0 && (
          <Text>{item.plans.map((p) => `${p.name}: ${p.price}€/ ${p.frequency}`).join(' | ')}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const categories = [...new Set(results.map(item => item.category))];

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Rechercher un abonnement..."
        value={search}
        onChangeText={handleSearch}
      />

      <View style={styles.filterContainer}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.filterButton,
              categoryFilter === cat && styles.selectedFilter
            ]}
            onPress={() => handleCategoryFilter(cat)}
          >
            <Text style={styles.filterText}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredResults}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60,},
  searchBar: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    gap: 10,
  },
  filterButton: {
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  selectedFilter: {
    backgroundColor: '#008b53',
  },
  filterText: {
    color: 'black',
    fontWeight: '600',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    gap: 12,
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
    elevation: 2,
  },
  title: { fontWeight: 'bold', fontSize: 16 },
});