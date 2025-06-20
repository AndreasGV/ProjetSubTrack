import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Image,
} from 'react-native';
import moment from 'moment';
import 'moment/locale/fr';
import AsyncStorage from '@react-native-async-storage/async-storage';

const numColumns = 7;
const screenWidth = Dimensions.get('window').width;
const cellSize = screenWidth / numColumns;

export default function CalendarScreen() {
  const [calendarData, setCalendarData] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [monthTitle, setMonthTitle] = useState('');

  useEffect(() => {
    generateCalendar();
    loadSubscriptions();
  }, []);

  const generateCalendar = () => {
    const today = moment();
    const startOfMonth = today.clone().startOf('month');
    const endOfMonth = today.clone().endOf('month');

    const startDate = startOfMonth.clone().startOf('week');
    const endDate = endOfMonth.clone().endOf('week');

    const days = [];
    let date = startDate.clone();

    while (date.isBefore(endDate, 'day')) {
      days.push({
        date: date.clone(),
        isCurrentMonth: date.month() === today.month(),
      });
      date.add(1, 'day');
    }

    setCalendarData(days);
    setMonthTitle(today.format('MMMM YYYY'));
  };

  const loadSubscriptions = async () => {
    try {
      const stored = await AsyncStorage.getItem('abonnements');
      const parsed = stored ? JSON.parse(stored) : [];
      setSubscriptions(parsed);
    } catch (e) {
      console.log('Erreur chargement abonnements', e);
    }
  };

  const getLogosForDay = (dayNumber) => {
    return subscriptions.filter((sub) => parseInt(sub.paymentDay) === dayNumber);
  };

const renderItem = ({ item }) => {
  const logos = getLogosForDay(item.date.date());

  return (
    <View style={[styles.cell, !item.isCurrentMonth && styles.outMonth]}>
      <Text style={styles.dayText}>{item.date.date()}</Text>
      <View style={styles.logosContainer}>
        {logos.map((sub, idx) => (
          <Image
            key={idx}
            source={{ uri: sub.logo }}
            style={styles.logo}
            resizeMode="contain"
          />
        ))}
      </View>
    </View>
  );
};

  const renderHeader = () => {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    return (
      <View style={styles.headerRow}>
        {days.map((d, idx) => (
          <Text key={idx} style={styles.headerCell}>
            {d}
          </Text>
        ))}
      </View>
    );
  };

  const renderLegend = () => {
    const unique = {};
    subscriptions.forEach((s) => {
      if (!unique[s.name]) unique[s.name] = s.logo;
    });

    return (
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Légende :</Text>
        <View style={styles.legendItems}>
          {Object.entries(unique).map(([name, logo]) => (
            <View key={name} style={styles.legendItem}>
              <Image source={{ uri: logo }} style={styles.legendLogo} />
              <Text>{name}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.month}>{monthTitle.charAt(0).toUpperCase() + monthTitle.slice(1)}</Text>
      {renderHeader()}
      <FlatList
        data={calendarData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        numColumns={numColumns}
        scrollEnabled={false}
      />
      {renderLegend()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40, backgroundColor: '#fff' },
  month: { textAlign: 'center', fontSize: 24, fontWeight: 'bold', marginVertical: 10 },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 5,
  },
  headerCell: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
  },
cell: {
  width: cellSize,
  minHeight: cellSize, // hauteur minimale
  borderWidth: 0.5,
  borderColor: '#ccc',
  alignItems: 'center',
  paddingTop: 4,
  paddingBottom: 6,
},
  outMonth: {
    backgroundColor: '#f0f0f0',
  },
  logo: {
    width: 24,
    height: 24,
    marginTop: 3,
  },
    logosContainer: {
    marginTop: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 2,
    },
  legend: {
    marginTop: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 10,
  },
  legendTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 5,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  legendLogo: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
});