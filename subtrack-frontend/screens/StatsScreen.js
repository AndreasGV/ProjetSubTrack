import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { supabase } from '../supabaseClient';
import { useFocusEffect } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

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

  const generatePDF = async () => {
    const now = new Date();
    const monthYear = now.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
    const cleanMonthYear = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
    const fileName = `Stats-SubTrack-${cleanMonthYear.replace(/\s/g, '-')}.pdf`;

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #333; }
            h1 { text-align: center; color: #008b53; }
            ul { padding-left: 20px; }
            li { margin-bottom: 5px; }
            .section { margin-top: 20px; }
            .italic { font-style: italic; margin-top: 15px; }
            .footer { text-align: center; font-size: 12px; margin-top: 40px; color: gray; }
          </style>
        </head>
        <body>
          <h1>Statistiques SubTrack</h1>
          <div class="section">
            <p><strong>Total mensuel estimé :</strong> ${totalMensuel.toFixed(2)} €</p>
            <p><strong>Total annuel estimé :</strong> ${totalAnnuel.toFixed(2)} €</p>
            <p><strong>Par semaine :</strong> ${weeklyEstimate.toFixed(2)} €</p>
            <p><strong>Par jour :</strong> ${dailyEstimate.toFixed(2)} €</p>
          </div>
          <div class="section">
            <h2>🏆 Classement des abonnements</h2>
            <ul>
              ${subscriptionsSorted
                .map(([name, value], i) => `<li>${i + 1}. ${name} — ${value.toFixed(2)} €/mois</li>`)
                .join('')}
            </ul>
          </div>
          <p class="italic">Vous avez ${Object.keys(abonnements).length} abonnement(s) actif(s).</p>
          <p class="footer">Exporté en PDF — ${cleanMonthYear}</p>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    const renamedUri = uri.replace(/[^\/]+\.pdf$/, fileName);

    await FileSystem.moveAsync({ from: uri, to: renamedUri });
    await Sharing.shareAsync(renamedUri);
  };

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

      <TouchableOpacity style={styles.pdfButton} onPress={generatePDF}>
        <Text style={styles.pdfButtonText}>📄 Exporter en PDF</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    paddingTop: 100,
  },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  text: { fontSize: 16, textAlign: 'center', marginVertical: 5 },
  summary: { fontSize: 16, textAlign: 'center', marginTop: 10, fontStyle: 'italic' },
  subTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  ranking: { fontSize: 15, marginVertical: 2 },
  pdfButton: {
    marginTop: 30,
    backgroundColor: '#008b53',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  pdfButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});