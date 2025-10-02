import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { query, run } from '../db';
import { useTheme } from '../contexts/ThemeContext';

interface Patient {
  patient_id: number;
  nom: string;
  prenom: string;
  date_naissance: string;
  sexe: string;
  telephone: string;
  adresse?: string;
}

export default function PatientsListScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchText, setSearchText] = useState('');

  const styles = createStyles(colors);

  useFocusEffect(
    useCallback(() => {
      loadPatients();
    }, [])
  );

  const loadPatients = async () => {
    try {
      const result = await query<Patient>('SELECT * FROM patients ORDER BY nom, prenom');
      setPatients(result);
    } catch (error) {
      console.log('Erreur chargement patients:', error);
    }
  };

  const filteredPatients = patients.filter(patient =>
    `${patient.nom} ${patient.prenom}`.toLowerCase().includes(searchText.toLowerCase()) ||
    patient.telephone?.includes(searchText)
  );

  const deletePatient = (patient: Patient) => {
    Alert.alert(
      'Supprimer le patient',
      `Êtes-vous sûr de vouloir supprimer ${patient.prenom} ${patient.nom} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await run('DELETE FROM patients WHERE patient_id = ?', [patient.patient_id]);
              await loadPatients();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le patient');
            }
          },
        },
      ]
    );
  };

  const renderPatient = ({ item }: { item: Patient }) => (
    <View style={styles.patientCard}>
      <Pressable
        style={styles.patientInfo}
        onPress={() => navigation.navigate('PatientDetail', { patient: item })}
      >
        <Text style={styles.patientName}>{item.prenom} {item.nom}</Text>
        <Text style={styles.patientDetails}>
          {item.sexe && `${item.sexe} • `}
          {item.date_naissance && `Né(e) le ${item.date_naissance} • `}
          Tél: {item.telephone || 'N/A'}
        </Text>
      </Pressable>
      <Pressable style={styles.deleteBtn} onPress={() => deletePatient(item)}>
        <Text style={styles.deleteBtnText}>×</Text>
      </Pressable>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* En-tête avec recherche et bouton ajouter */}
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un patient..."
          placeholderTextColor="#9ca3af"
          value={searchText}
          onChangeText={setSearchText}
        />
        <Pressable style={styles.addBtn} onPress={() => setShowAddForm(true)}>
          <Text style={styles.addBtnText}>+</Text>
        </Pressable>
      </View>

      {/* Formulaire d'ajout */}
      {showAddForm && (
        <PatientForm
          onSubmit={() => {
            setShowAddForm(false);
            loadPatients();
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Liste des patients */}
      <FlatList
        data={filteredPatients}
        keyExtractor={(item) => String(item.patient_id)}
        renderItem={renderPatient}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchText ? 'Aucun patient trouvé' : 'Aucun patient enregistré'}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />
    </KeyboardAvoidingView>
  );
}

function PatientForm({ onSubmit, onCancel }: { onSubmit: () => void; onCancel: () => void }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [dateNaissance, setDateNaissance] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [sexe, setSexe] = useState('');
  const [adresse, setAdresse] = useState('');
  const [telephone, setTelephone] = useState('');

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0]; // Format YYYY-MM-DD
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateNaissance(selectedDate);
    }
  };

  const handleSubmit = async () => {
    if (!nom.trim() || !prenom.trim()) {
      Alert.alert('Champs requis', 'Le nom et le prénom sont obligatoires.');
      return;
    }

    try {
      await run(
        'INSERT INTO patients (nom, prenom, date_naissance, sexe, adresse, telephone) VALUES (?, ?, ?, ?, ?, ?)',
        [nom.trim(), prenom.trim(), formatDate(dateNaissance), sexe || null, adresse.trim() || null, telephone.trim() || null]
      );
      onSubmit();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter le patient');
    }
  };

  return (
    <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.formTitle}>Nouveau patient</Text>
      
      <View style={styles.formRow}>
        <TextInput
          style={[styles.formInput, { flex: 1 }]}
          placeholder="Nom *"
          placeholderTextColor="#9ca3af"
          value={nom}
          onChangeText={setNom}
        />
        <TextInput
          style={[styles.formInput, { flex: 1 }]}
          placeholder="Prénom *"
          placeholderTextColor="#9ca3af"
          value={prenom}
          onChangeText={setPrenom}
        />
      </View>

      <View style={styles.formRow}>
        {/* Sélecteur de date de naissance */}
        <View style={[styles.dateContainer, { flex: 1 }]}>
          <Text style={styles.dateLabel}>Date de naissance</Text>
          <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateButtonText}>📅 {formatDate(dateNaissance)}</Text>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={dateNaissance}
              mode="date"
              display="default"
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* Sélecteur de sexe */}
        <View style={[styles.sexContainer, { flex: 1 }]}>
          <Text style={styles.sexLabel}>Sexe</Text>
          <View style={styles.sexButtons}>
            <Pressable
              style={[styles.sexButton, sexe === 'M' && styles.sexButtonSelected]}
              onPress={() => setSexe('M')}
            >
              <Text style={[styles.sexButtonText, sexe === 'M' && styles.sexButtonTextSelected]}>
                👨 Homme
              </Text>
            </Pressable>
            <Pressable
              style={[styles.sexButton, sexe === 'F' && styles.sexButtonSelected]}
              onPress={() => setSexe('F')}
            >
              <Text style={[styles.sexButtonText, sexe === 'F' && styles.sexButtonTextSelected]}>
                👩 Femme
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      <TextInput
        style={styles.formInput}
        placeholder="Adresse"
        placeholderTextColor="#9ca3af"
        value={adresse}
        onChangeText={setAdresse}
        multiline
        numberOfLines={2}
      />

      <TextInput
        style={styles.formInput}
        placeholder="Téléphone"
        placeholderTextColor="#9ca3af"
        value={telephone}
        onChangeText={setTelephone}
        keyboardType="phone-pad"
      />

      <View style={styles.formButtons}>
        <Pressable style={[styles.formBtn, styles.cancelBtn]} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>Annuler</Text>
        </Pressable>
        <Pressable style={[styles.formBtn, styles.submitBtn]} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Ajouter</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', padding: 16, gap: 12, alignItems: 'center' },
  searchInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
  },
  addBtn: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: colors.surface, fontSize: 24, fontWeight: 'bold' },
  listContainer: { paddingHorizontal: 16 },
  patientCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  patientInfo: { flex: 1 },
  patientName: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 },
  patientDetails: { fontSize: 14, color: colors.textSecondary },
  deleteBtn: {
    backgroundColor: '#ef4444',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, color: '#9ca3af', fontStyle: 'italic' },
  formContainer: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  formTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 },
  formRow: { flexDirection: 'row', gap: 12 },
  formInput: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    color: '#111827',
  },
  formButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  formBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#f3f4f6' },
  cancelBtnText: { color: '#374151', fontWeight: '600' },
  submitBtn: { backgroundColor: '#2563eb' },
  submitBtnText: { color: '#fff', fontWeight: '600' },
  
  // Styles pour le sélecteur de date
  dateContainer: { marginBottom: 12 },
  dateLabel: { fontSize: 14, color: '#374151', marginBottom: 8, fontWeight: '600' },
  dateButton: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  dateButtonText: { fontSize: 16, color: '#1e293b', fontWeight: '500' },
  
  // Styles pour le sélecteur de sexe
  sexContainer: { marginBottom: 12 },
  sexLabel: { fontSize: 14, color: '#374151', marginBottom: 8, fontWeight: '600' },
  sexButtons: { flexDirection: 'row', gap: 8 },
  sexButton: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  sexButtonSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  sexButtonText: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  sexButtonTextSelected: { color: '#fff', fontWeight: '600' },
});
