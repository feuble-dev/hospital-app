import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { query } from '../db';
import { useTheme } from '../contexts/ThemeContext';
import { ModernStatsGrid, ModernBarChart, ModernProgressChart, ModernDonutChart } from '../components/Charts';

export default function AccueilScreen() {
  const { colors } = useTheme();
  const [stats, setStats] = useState({ patients: 0, consultations: 0, examens: 0, donnees: 0 });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [p, c, e, d] = await Promise.all([
        query<{ c: any }>('SELECT COUNT(*) as c FROM patients'),
        query<{ c: any }>('SELECT COUNT(*) as c FROM consultations'),
        query<{ c: any }>('SELECT COUNT(*) as c FROM examens'),
        query<{ c: any }>('SELECT COUNT(*) as c FROM donnees_sanitaires'),
      ]);
      
      const safeParseInt = (value: any): number => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') return parseInt(value, 10) || 0;
        return 0;
      };

      setStats({
        patients: safeParseInt(p[0]?.c),
        consultations: safeParseInt(c[0]?.c),
        examens: safeParseInt(e[0]?.c),
        donnees: safeParseInt(d[0]?.c),
      });
    } catch (error) {
      console.log('Erreur chargement données:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollView: { flex: 1 },
    header: { backgroundColor: colors.surface, padding: 20, margin: 16, borderRadius: 16, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    title: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 8 },
    subtitle: { fontSize: 16, color: colors.textSecondary, fontWeight: '500' },
    
    cardRow: { flexDirection: 'row', gap: 12, marginHorizontal: 16, marginBottom: 12 },
    card: { 
      flex: 1, 
      backgroundColor: colors.surface, 
      borderRadius: 12, 
      padding: 16, 
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    cardIcon: { fontSize: 24, marginBottom: 8 },
    cardValue: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 4 },
    cardLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
    
    section: { backgroundColor: colors.surface, margin: 16, borderRadius: 16, padding: 20, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 },
    
    themeDemo: { alignItems: 'center', paddingVertical: 20 },
    themeDemoText: { fontSize: 16, color: colors.text, marginBottom: 12 },
    themeDemoButton: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
    themeDemoButtonText: { color: colors.surface, fontWeight: '600' },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadData} />
        }
      >
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.title}>🏥 Hospital Manager</Text>
          <Text style={styles.subtitle}>Tableau de bord médical</Text>
        </View>

        {/* Statistiques avec graphiques modernes */}
        <ModernStatsGrid 
          data={[
            { label: 'Patients', value: stats.patients, color: colors.primary, icon: '👥' },
            { label: 'Consultations', value: stats.consultations, color: '#10b981', icon: '🩺' },
            { label: 'Examens', value: stats.examens, color: '#f59e0b', icon: '🔬' },
            { label: 'Données', value: stats.donnees, color: '#ef4444', icon: '📊' },
          ]}
        />

        {/* Graphique en barres */}
        <ModernBarChart
          title="📈 Répartition des Activités"
          data={[
            { label: 'Patients', value: stats.patients, color: colors.primary, icon: '👥' },
            { label: 'Consultations', value: stats.consultations, color: '#10b981', icon: '🩺' },
            { label: 'Examens', value: stats.examens, color: '#f59e0b', icon: '🔬' },
            { label: 'Données', value: stats.donnees, color: '#ef4444', icon: '📊' },
          ]}
        />

        {/* Graphique de progression */}
        <ModernProgressChart
          title="📊 Analyse Comparative"
          data={[
            { label: 'Patients Enregistrés', value: stats.patients, color: colors.primary, icon: '👥' },
            { label: 'Consultations Réalisées', value: stats.consultations, color: '#10b981', icon: '🩺' },
            { label: 'Examens Effectués', value: stats.examens, color: '#f59e0b', icon: '🔬' },
            { label: 'Données Collectées', value: stats.donnees, color: '#ef4444', icon: '📊' },
          ]}
        />

        {/* Graphique donut */}
        <ModernDonutChart
          title="🎯 Vue d'Ensemble"
          total={stats.patients + stats.consultations + stats.examens + stats.donnees}
          data={[
            { label: 'Patients', value: stats.patients, color: colors.primary, icon: '👥' },
            { label: 'Consultations', value: stats.consultations, color: '#10b981', icon: '🩺' },
            { label: 'Examens', value: stats.examens, color: '#f59e0b', icon: '🔬' },
            { label: 'Données', value: stats.donnees, color: '#ef4444', icon: '📊' },
          ]}
        />

        {/* Section de démonstration du thème */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Thème Actuel</Text>
          <View style={styles.themeDemo}>
            <Text style={styles.themeDemoText}>
              Le thème s'adapte automatiquement à vos préférences
            </Text>
            <View style={styles.themeDemoButton}>
              <Text style={styles.themeDemoButtonText}>Exemple de bouton</Text>
            </View>
          </View>
        </View>

        {/* Informations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ Informations</Text>
          <Text style={[styles.themeDemoText, { textAlign: 'left' }]}>
            • Gérez vos patients et leurs dossiers médicaux{'\n'}
            • Consultez les statistiques en temps réel{'\n'}
            • Personnalisez l'apparence dans les paramètres{'\n'}
            • Toutes vos données sont stockées localement
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
