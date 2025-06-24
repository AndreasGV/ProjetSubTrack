import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { PieChart, LineChart } from 'react-native-chart-kit';
import { supabase } from '../supabaseClient';

const screenWidth = Dimensions.get('window').width;

export default function StatsScreen() {
  const [abonnements, setAbonnements] = useState({});
  const [totalMensuel, setTotalMensuel] = useState(0);
  const [totalAnnuel, setTotalAnnuel] = useState(0);
  const [monthlySpending, setMonthlySpending] = useState([]);
  const [classement, setClassement] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from('abonnements_utilisateurs')
        .select('*, abonnements(name)')
        .eq('user_id', session.user.id);

      if (data) {
        const grouped = {};
        let month = 0;
        let year = 0;

        data.forEach((a) => {
          const price = parseFloat(a.plan_price || 0);
          const isAnnuel = a.plan_name?.toLowerCase().includes('annuel');
          const name = a.abonnements?.name || a.plan_name;

          const monthly = isAnnuel ? price / 12 : price;

          if (!grouped[name]) grouped[name] = 0;
          grouped[name] += monthly;

          month += monthly;
          year += isAnnuel ? price : price * 12;
        });

        setAbonnements(grouped);
        setTotalMensuel(month);
        setTotalAnnuel(year);

        const sorted = Object.entries(grouped)
          .sort(([, a], [, b]) => b - a)
          .map(([name, value]) => ({ name, price: value }));
        setClassement(sorted);

        // Exemple de mise à jour des dépenses mensuelles (remplacé par API Supabase dans la vraie app)
        setMonthlySpending([0, 0, 0, 0, 0, 0, month]);
      }
    };

    fetchData();
  }, []);

  const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#66bb6a', '#9575cd', '#f06292', '#ff8a65', '#4dd0e1'];

  const chartData = Object.entries(abonnements).map(([name, value], index) => ({
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

  return (
    <ScrollView style={styles.container}>
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
      <Text style={styles.summary}>Vous avez {Object.keys(abonnements).length} abonnement(s) actif(s).</Text>

      {classement.length > 0 && (
        <View style={styles.block}>
          <Text style={styles.subtitle}>🏆 Classement des abonnements</Text>
          {classement.map((item, i) => (
            <Text key={i} style={styles.listItem}>
              {i + 1}. {item.name} - {item.price.toFixed(2)}€/mois
            </Text>
          ))}
        </View>
      )}

      <View style={styles.block}>
        <Text style={styles.subtitle}>📅 Estimations</Text>
        <Text style={styles.listItem}>Par semaine : {(totalMensuel / 4).toFixed(2)}€</Text>
        <Text style={styles.listItem}>Par jour : {(totalMensuel / 30).toFixed(2)}€</Text>
      </View>

      <View style={styles.block}>
        <Text style={styles.subtitle}>📈 Dépenses mensuelles (estimées)</Text>
        <LineChart
          data={{
            labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Ce mois'],
            datasets: [
              {
                data: monthlySpending,
              },
            ],
          }}
          width={screenWidth - 40}
          height={220}
          yAxisSuffix="€"
          chartConfig={chartConfig}
          bezier
          style={{ marginTop: 10, borderRadius: 12 }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  text: { fontSize: 16, textAlign: 'center', marginVertical: 5 },
  summary: { fontSize: 16, textAlign: 'center', marginTop: 10, fontStyle: 'italic' },
  block: { marginTop: 30 },
  subtitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  listItem: { fontSize: 15, marginVertical: 2 },
});