import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { query } from '../db';
import AttachmentManager from '../components/AttachmentManager';

export default function DonneeDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const donneeId = route.params?.donneeId;
  const [donnee, setDonnee] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);

  useEffect(() => {
    if (donneeId) {
      loadDonneeDetail();
    }
  }, [donneeId]);

  const loadDonneeDetail = async () => {
    try {
      const [donneeResult] = await query(`
        SELECT ds.*, td.nom_type, td.description, p.nom, p.prenom 
        FROM donnees_sanitaires ds 
        JOIN types_donnees td ON td.type_donnee_id = ds.type_donnee_id 
        JOIN patients p ON p.patient_id = ds.patient_id 
        WHERE ds.donnee_id = ?
      `, [donneeId]);
      
      if (donneeResult) {
        setDonnee(donneeResult);
        setPatient({ nom: donneeResult.nom, prenom: donneeResult.prenom });
      }
    } catch (error) {
      console.log('Erreur chargement détail donnée:', error);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!donnee) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Donnée non trouvée</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* En-tête */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Retour</Text>
          </Pressable>
          <Text style={styles.title}>Donnée Sanitaire</Text>
        </View>

        {/* Informations patient */}
        <View style={styles.patientCard}>
          <Text style={styles.sectionTitle}>👤 Patient</Text>
          <Text style={styles.patientName}>{patient.prenom} {patient.nom}</Text>
        </View>

        {/* Détails de la donnée */}
        <View style={styles.detailCard}>
          <View style={styles.iconHeader}>
            <Text style={styles.icon}>📊</Text>
            <View style={styles.headerInfo}>
              <Text style={styles.cardTitle}>{donnee.nom_type}</Text>
              <Text style={styles.cardSubtitle}>{donnee.description}</Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Valeur</Text>
              <Text style={styles.infoValue}>{donnee.valeur}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Date d'enregistrement</Text>
              <Text style={styles.infoValue}>{formatDate(donnee.date_enregistrement)}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>ID de la donnée</Text>
              <Text style={styles.infoValue}>#{donnee.donnee_id}</Text>
            </View>
          </View>
        </View>

        {/* Pièces jointes */}
        <AttachmentManager cibleType="donnee" cibleId={donnee.donnee_id} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  scrollView: {
    flex: 1
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  backButton: {
    marginBottom: 12
  },
  backButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600'
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b'
  },
  patientCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 8
  },
  patientName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b'
  },
  detailCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  iconHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  icon: {
    fontSize: 32,
    marginRight: 16
  },
  headerInfo: {
    flex: 1
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500'
  },
  infoGrid: {
    gap: 16
  },
  infoItem: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  infoValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600'
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 50
  }
});
