import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Image,
  TouchableOpacity,
  Modal,
} from 'react-native';
import moment from 'moment';
import 'moment/locale/fr';
import { supabase } from '../supabaseClient';
import { logoMap } from '../assets/logoMap';

const numColumns = 7;
const screenWidth = Dimensions.get('window').width;
const cellSize = screenWidth / numColumns;

export default function CalendarScreen() {
  const [calendarData, setCalendarData] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [monthTitle, setMonthTitle] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState([]);

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
      days.push({ date: date.clone(), isCurrentMonth: date.month() === today.month() });
      date.add(1, 'day');
    }

    setCalendarData(days);
    setMonthTitle(today.format('MMMM YYYY'));
  };

  const loadSubscriptions = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) return;

    const { data } = await supabase
      .from('abonnements_utilisateurs')
      .select('*, abonnements(id, logo, name)')
      .eq('user_id', session.user.id);

    if (data) setSubscriptions(data);
  };

  const getLogosForDay = (dayNumber) => {
    return subscriptions.filter((sub) => parseInt(sub.payment_day) === dayNumber);
  };

  const getLogoSource = (sub) => {
    const id = sub.abonnements?.id;
    if (logoMap[id]) return logoMap[id];
    if (sub.abonnements?.logo) return { uri: sub.abonnements.logo };
    return require('../assets/logo.png');
  };

  const renderItem = ({ item }) => {
    const logos = getLogosForDay(item.date.date());

    return (
      <TouchableOpacity
        style={[styles.cell, !item.isCurrentMonth && styles.outMonth]}
        onPress={() => {
          if (logos.length > 1) {
            setModalContent(logos);
            setModalVisible(true);
          }
        }}
      >
        <Text style={styles.dayText}>{item.date.date()}</Text>
        <View style={styles.logosContainer}>
          {logos.length === 1 && (
            <Image
              source={getLogoSource(logos[0])}
              style={styles.logo}
              resizeMode="contain"
            />
          )}
          {logos.length > 1 && (
            <View style={styles.multiCount}>
              <Text style={{ color: 'white', fontSize: 12 }}>{logos.length}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    return (
      <View style={styles.headerRow}>
        {days.map((d, idx) => (
          <Text key={idx} style={styles.headerCell}>{d}</Text>
        ))}
      </View>
    );
  };

  const renderLegend = () => {
    const unique = {};
    subscriptions.forEach((s) => {
      const name = s.abonnements?.name || s.plan_name;
      if (!unique[name]) {
        unique[name] = getLogoSource(s);
      }
    });

    return (
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Légende :</Text>
        <View style={styles.legendItems}>
          {Object.entries(unique).map(([name, logo]) => (
            <View key={name} style={styles.legendItem}>
              <Image source={logo} style={styles.legendLogo} resizeMode="contain" />
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

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Abonnements du jour</Text>
            <View style={styles.modalContent}>
              {modalContent.map((sub, idx) => (
                <Image
                  key={idx}
                  source={getLogoSource(sub)}
                  style={styles.modalLogo}
                  resizeMode="contain"
                />
              ))}
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40, backgroundColor: '#fff' },
  month: { textAlign: 'center', fontSize: 24, fontWeight: 'bold', marginVertical: 10 },
  headerRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ddd', paddingBottom: 5 },
  headerCell: { flex: 1, textAlign: 'center', fontWeight: '600', fontSize: 14 },
  cell: { width: cellSize, minHeight: cellSize, borderWidth: 0.5, borderColor: '#ccc', alignItems: 'center', paddingTop: 4, paddingBottom: 6 },
  outMonth: { backgroundColor: '#f0f0f0' },
  logo: { width: 26, height: 26, marginTop: 3 },
  logosContainer: { marginTop: 4, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 2 },
  multiCount: { backgroundColor: 'green', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, marginTop: 4 },
  legend: { marginTop: 15, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: '#ccc', paddingTop: 10 },
  legendTitle: { fontWeight: 'bold', fontSize: 16, textAlign: 'center', marginBottom: 5 },
  legendItems: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 10, marginVertical: 5 },
  legendLogo: { width: 24, height: 24, marginRight: 6 },
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '80%', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalContent: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  modalLogo: { width: 40, height: 40, margin: 5 },
  closeButton: {
    backgroundColor: '#008b53',
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});