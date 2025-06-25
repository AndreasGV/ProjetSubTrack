import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { supabase } from '../supabaseClient';
import { useFocusEffect } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

export default function StatsScreen() {
  const [abonnements, setAbonnements] = useState({});
  const [totalMensuel, setTotalMensuel] = useState(0);
  const [totalAnnuel, setTotalAnnuel] = useState(0);

  const fetchData = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) return;

    const { data } = await supabase
      .from('abonnements_utilisateurs')
      .select('*, abonnements(name)')
      .eq('user_id', session.user.id);

    if (data) {
      const grouped = {};
      let month = 0;
      let year = 0;

      data.forEach((a) => {
        const rawPrice = parseFloat(a.plan_price);
        const price = isNaN(rawPrice) ? 0 : rawPrice;
        const isAnnuel = a.plan_name?.toLowerCase().includes('annuel');
        const serviceName = a.abonnements?.name || a.plan_name || 'Inconnu';

        const monthlyPrice = isAnnuel ? price / 12 : price;

        if (!grouped[serviceName]) grouped[serviceName] = 0;
        grouped[serviceName] += monthlyPrice;

        month += monthlyPrice;
        year += isAnnuel ? price : price * 12;
      });

      setAbonnements(grouped);
      setTotalMensuel(month);
      setTotalAnnuel(year);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#66bb6a', '#9575cd', '#f06292', '#ff8a65', '#4dd0e1'];

  const chartData = Object.entries(abonnements)
    .filter(([_, value]) => typeof value === 'number' && isFinite(value) && value > 0)
    .map(([name, value], index) => ({
      name,
      population: value,
      color: colors[index % colors.length],
      legendFontColor: '#333',
      legendFontSize: 14,
    }));

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  const subscriptionsSorted = Object.entries(abonnements).sort((a, b) => b[1] - a[1]);

  const weeklyEstimate = totalMensuel / 4;
  const dailyEstimate = totalMensuel / 30;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📊 Statistiques</Text>

      {chartData.length > 0 ? (
        <PieChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="10"
        />
      ) : (
        <Text style={styles.text}>Aucun abonnement enregistré</Text>
      )}

      <Text style={styles.text}>Total mensuel estimé : {totalMensuel.toFixed(2)}€</Text>
      <Text style={styles.text}>Total annuel estimé : {totalAnnuel.toFixed(2)}€</Text>
      <Text style={styles.text}>Par semaine : {weeklyEstimate.toFixed(2)}€</Text>
      <Text style={styles.text}>Par jour : {dailyEstimate.toFixed(2)}€</Text>

      {subscriptionsSorted.length > 0 && (
        <>
          <Text style={styles.subTitle}>🏆 Classement des abonnements</Text>
          {subscriptionsSorted.map(([name, value], i) => (
            <Text key={i} style={styles.ranking}>
              {i + 1}. {name} — {value.toFixed(2)}€/mois
            </Text>
          ))}
        </>
      )}

      <Text style={styles.summary}>
        Vous avez {Object.keys(abonnements).length} abonnement(s) actif(s).
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 40, paddingHorizontal: 20, backgroundColor: '#fff', paddingTop: 100 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  text: { fontSize: 16, textAlign: 'center', marginVertical: 5 },
  summary: { fontSize: 16, textAlign: 'center', marginTop: 10, fontStyle: 'italic' },
  subTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  ranking: { fontSize: 15, marginVertical: 2 },
});