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

export default function ConsultationDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const consultationId = route.params?.consultationId;
  const [consultation, setConsultation] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);

  useEffect(() => {
    if (consultationId) {
      loadConsultationDetail();
    }
  }, [consultationId]);

  const loadConsultationDetail = async () => {
    try {
      const [consultationResult] = await query(`
        SELECT c.*, tc.nom_type, tc.description, p.nom, p.prenom 
        FROM consultations c 
        JOIN types_consultations tc ON tc.type_consultation_id = c.type_consultation_id 
        JOIN patients p ON p.patient_id = c.patient_id 
        WHERE c.consultation_id = ?
      `, [consultationId]);
      
      if (consultationResult) {
        setConsultation(consultationResult);
        setPatient({ nom: consultationResult.nom, prenom: consultationResult.prenom });
      }
    } catch (error) {
      console.log('Erreur chargement détail consultation:', error);
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

  if (!consultation) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Consultation non trouvée</Text>
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
          <Text style={styles.title}>Consultation</Text>
        </View>

        {/* Informations patient */}
        <View style={styles.patientCard}>
          <Text style={styles.sectionTitle}>👤 Patient</Text>
          <Text style={styles.patientName}>{patient.prenom} {patient.nom}</Text>
        </View>

        {/* Détails de la consultation */}
        <View style={styles.detailCard}>
          <View style={styles.iconHeader}>
            <Text style={styles.icon}>🩺</Text>
            <View style={styles.headerInfo}>
              <Text style={styles.cardTitle}>{consultation.nom_type}</Text>
              <Text style={styles.cardSubtitle}>{consultation.description}</Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Date de consultation</Text>
              <Text style={styles.infoValue}>{formatDate(consultation.date_consultation)}</Text>
            </View>
            
            {consultation.diagnostic && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Diagnostic</Text>
                <Text style={styles.infoValueLong}>{consultation.diagnostic}</Text>
              </View>
            )}

            {consultation.traitement && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Traitement</Text>
                <Text style={styles.infoValueLong}>{consultation.traitement}</Text>
              </View>
            )}

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>ID de la consultation</Text>
              <Text style={styles.infoValue}>#{consultation.consultation_id}</Text>
            </View>
          </View>
        </View>

        {/* Pièces jointes */}
        <AttachmentManager cibleType="consultation" cibleId={consultation.consultation_id} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8'
  },
  scrollView: {
    flex: 1
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6
  },
  backButton: {
    marginBottom: 12
  },
  backButtonText: {
    fontSize: 17,
    color: '#6366f1',
    fontWeight: '700'
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5
  },
  patientCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0'
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
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0'
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
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
    letterSpacing: -0.3
  },
  cardSubtitle: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '600',
    lineHeight: 22
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
  infoValueLong: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
    lineHeight: 24
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 50
  }
});
