import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function StatsScreen() {
  const [abonnements, setAbonnements] = useState([]);
  const [totalMensuel, setTotalMensuel] = useState(0);
  const [totalAnnuel, setTotalAnnuel] = useState(0);

  useEffect(() => {
    const loadStats = async () => {
      const data = await AsyncStorage.getItem('abonnements');
      const parsed = data ? JSON.parse(data) : [];

      let totalMonth = 0;
      let totalYear = 0;

      parsed.forEach((a) => {
        const price = parseFloat(a.planPrice || 0);
        if (a.planName.toLowerCase().includes('annuel')) {
          totalYear += price;
          totalMonth += price / 12;
        } else {
          totalMonth += price;
          totalYear += price * 12;
        }
      });

      setAbonnements(parsed);
      setTotalMensuel(totalMonth);
      setTotalAnnuel(totalYear);
    };

    loadStats();
  }, []);

  const chartData = abonnements.map((a, i) => {
    const rawPrice = parseFloat(a.planPrice || 0);
    const value = a.planName.toLowerCase().includes('annuel')
      ? rawPrice / 12
      : rawPrice;

    return {
      name: a.name,
      population: value,
      color: colors[i % colors.length],
      legendFontColor: '#333',
      legendFontSize: 14,
    };
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Statistiques</Text>

      {abonnements.length > 0 ? (
        <PieChart
          data={chartData}
          width={screenWidth - 40}
          height={200}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="10"
        />
      ) : (
        <Text style={styles.text}>Aucun abonnement pour l'instant</Text>
      )}

      <Text style={styles.text}>Total mensuel estimé : {totalMensuel.toFixed(2)}€</Text>
      <Text style={styles.text}>Total annuel estimé : {totalAnnuel.toFixed(2)}€</Text>
      <Text style={styles.summary}>Vous avez {abonnements.length} abonnement(s) actif(s).</Text>
    </View>
  );
}

const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#66bb6a', '#9575cd', '#f06292'];

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  text: { fontSize: 16, textAlign: 'center', marginVertical: 5 },
  summary: { fontSize: 16, textAlign: 'center', marginTop: 10, fontStyle: 'italic' },
});