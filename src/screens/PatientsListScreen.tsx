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
    <ScrollView 
      style={styles.formContainer} 
      contentContainerStyle={styles.formContentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.formHeader}>
        <Text style={styles.formHeaderIcon}>👤</Text>
        <Text style={styles.formTitle}>Nouveau patient</Text>
      </View>
      
      {/* Section Identité */}
      <View style={styles.formSection}>
        <Text style={styles.sectionLabel}>📋 Identité</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Nom *</Text>
          <TextInput
            style={styles.formInput}
            placeholder="Dupont"
            placeholderTextColor="#9ca3af"
            value={nom}
            onChangeText={setNom}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Prénom *</Text>
          <TextInput
            style={styles.formInput}
            placeholder="Marie"
            placeholderTextColor="#9ca3af"
            value={prenom}
            onChangeText={setPrenom}
            autoCapitalize="words"
          />
        </View>
      </View>

      {/* Section Informations personnelles */}
      <View style={styles.formSection}>
        <Text style={styles.sectionLabel}>📅 Informations personnelles</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Date de naissance</Text>
          <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateIcon}>📅</Text>
            <Text style={styles.dateButtonText}>{formatDate(dateNaissance)}</Text>
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

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Sexe</Text>
          <View style={styles.sexButtons}>
            <Pressable
              style={[styles.sexButton, sexe === 'M' && styles.sexButtonSelected]}
              onPress={() => setSexe('M')}
            >
              <Text style={styles.sexButtonIcon}>👨</Text>
              <Text style={[styles.sexButtonText, sexe === 'M' && styles.sexButtonTextSelected]}>
                Homme
              </Text>
            </Pressable>
            <Pressable
              style={[styles.sexButton, sexe === 'F' && styles.sexButtonSelected]}
              onPress={() => setSexe('F')}
            >
              <Text style={styles.sexButtonIcon}>👩</Text>
              <Text style={[styles.sexButtonText, sexe === 'F' && styles.sexButtonTextSelected]}>
                Femme
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Section Contact */}
      <View style={styles.formSection}>
        <Text style={styles.sectionLabel}>📞 Contact</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Téléphone</Text>
          <TextInput
            style={styles.formInput}
            placeholder="06 12 34 56 78"
            placeholderTextColor="#9ca3af"
            value={telephone}
            onChangeText={setTelephone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Adresse</Text>
          <TextInput
            style={[styles.formInput, styles.textArea]}
            placeholder="12 Rue des Fleurs, 75001 Paris"
            placeholderTextColor="#9ca3af"
            value={adresse}
            onChangeText={setAdresse}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </View>

      <View style={styles.formButtons}>
        <Pressable style={[styles.formBtn, styles.cancelBtn]} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>Annuler</Text>
        </Pressable>
        <Pressable style={[styles.formBtn, styles.submitBtn]} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Ajouter le patient</Text>
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
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  addBtn: {
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addBtnText: { color: '#ffffff', fontSize: 28, fontWeight: 'bold' },
  listContainer: { paddingHorizontal: 16, paddingBottom: 16 },
  patientCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  patientInfo: { flex: 1 },
  patientName: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 6, letterSpacing: -0.3 },
  patientDetails: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  deleteBtn: {
    backgroundColor: '#ef4444',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteBtnText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, color: '#9ca3af', fontStyle: 'italic' },
  formContainer: {
    backgroundColor: colors.surface,
    margin: 16,
    borderRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: '90%',
  },
  formContentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  formHeaderIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  formTitle: { 
    fontSize: 24, 
    fontWeight: '900', 
    color: colors.text, 
    letterSpacing: -0.5 
  },
  
  // Sections du formulaire
  formSection: {
    marginBottom: 20,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  formInput: {
    backgroundColor: '#f8fafc',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    color: colors.text,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  
  formButtons: { flexDirection: 'row', gap: 14, marginTop: 20 },
  formBtn: { flex: 1, paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  cancelBtn: { 
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelBtnText: { color: colors.textSecondary, fontWeight: '700', fontSize: 16 },
  submitBtn: { 
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  submitBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 16 },
  
  // Styles pour le sélecteur de date
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  dateIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  dateButtonText: { fontSize: 16, color: colors.text, fontWeight: '600', flex: 1 },
  
  // Styles pour le sélecteur de sexe
  sexButtons: { flexDirection: 'row', gap: 10 },
  sexButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  sexButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sexButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  sexButtonText: { fontSize: 15, color: colors.textSecondary, fontWeight: '600' },
  sexButtonTextSelected: { color: '#ffffff', fontWeight: '700' },
});
