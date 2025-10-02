import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, FlatList, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRoute, useNavigation } from '@react-navigation/native';
import { query, run } from '../db';
import AttachmentManager from '../components/AttachmentManager';
import { useTheme } from '../contexts/ThemeContext';

type TabType = 'donnees' | 'consultations' | 'examens';

export default function PatientDetailScreen() {
  const route = useRoute<any>();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const patient = route.params?.patient;
  const [activeTab, setActiveTab] = useState<TabType>('donnees');
  const [donnees, setDonnees] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [examens, setExamens] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [patientStats, setPatientStats] = useState({ donnees: 0, consultations: 0, examens: 0 });
  const [showEditPatient, setShowEditPatient] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const styles = createStyles(colors);

  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  useEffect(() => {
    if (patient) {
      loadData();
    }
  }, [patient]);

  const loadData = async () => {
    try {
      const [d, c, e] = await Promise.all([
        query('SELECT ds.*, td.nom_type FROM donnees_sanitaires ds JOIN types_donnees td ON td.type_donnee_id=ds.type_donnee_id WHERE patient_id=? ORDER BY date_enregistrement DESC', [patient.patient_id]),
        query('SELECT co.*, tc.nom_type FROM consultations co JOIN types_consultations tc ON tc.type_consultation_id=co.type_consultation_id WHERE patient_id=? ORDER BY date_consultation DESC', [patient.patient_id]),
        query('SELECT ex.*, te.nom_type FROM examens ex JOIN types_examens te ON te.type_examen_id=ex.type_examen_id WHERE patient_id=? ORDER BY date_examen DESC', [patient.patient_id]),
      ]);
      setDonnees(d);
      setConsultations(c);
      setExamens(e);
      setPatientStats({ donnees: d.length, consultations: c.length, examens: e.length });
    } catch (error) {
      console.log('Erreur chargement données patient:', error);
    }
  };

  const deleteItem = async (table: string, idField: string, id: number) => {
    Alert.alert('Confirmation', 'Supprimer cet élément ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await run(`DELETE FROM ${table} WHERE ${idField} = ?`, [id]);
            await loadData();
          } catch (error) {
            Alert.alert('Erreur', 'Impossible de supprimer l\'élément');
          }
        },
      }
    ]);
  };

  const renderDonnees = () => (
    <View style={styles.tabContent}>
      {showForm && activeTab === 'donnees' && (
        <DonneeForm
          patientId={patient.patient_id}
          editingItem={editingItem?.type === 'donnee' ? editingItem.data : null}
          onSubmit={() => {
            setShowForm(false);
            setEditingItem(null);
            loadData();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      )}
      
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Données sanitaires ({donnees.length})</Text>
        <Pressable style={styles.addBtn} onPress={() => setShowForm(true)}>
          <Text style={styles.addBtnText}>+</Text>
        </Pressable>
      </View>

      <FlatList
        data={donnees}
        keyExtractor={(item) => String(item.donnee_id)}
        renderItem={({ item }) => (
          <Pressable 
            style={styles.card}
            onPress={() => navigation.navigate('DonneeDetail', { donneeId: item.donnee_id })}
          >
            <View style={styles.cardContent}>
              <Text style={styles.itemTitle}>{item.nom_type}: {item.valeur}</Text>
              <Text style={styles.itemSub}>Le {item.date_enregistrement}</Text>
              <Text style={styles.viewDetailText}>👁️ Voir détails et pièces jointes</Text>
            </View>
            <View style={styles.cardActions}>
              <Pressable
                style={styles.editBtn}
                onPress={(e) => {
                  e.stopPropagation();
                  setEditingItem({ type: 'donnee', data: item });
                  setShowForm(true);
                }}
              >
                <Text style={styles.editBtnText}>✏️</Text>
              </Pressable>
              <Pressable
                style={styles.deleteBtn}
                onPress={(e) => {
                  e.stopPropagation();
                  deleteItem('donnees_sanitaires', 'donnee_id', item.donnee_id);
                }}
              >
                <Text style={styles.deleteBtnText}>×</Text>
              </Pressable>
            </View>
          </Pressable>
        )}
        scrollEnabled={false}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucune donnée sanitaire</Text>}
      />
    </View>
  );

  const renderConsultations = () => (
    <View style={styles.tabContent}>
      {showForm && activeTab === 'consultations' && (
        <ConsultationForm
          patientId={patient.patient_id}
          editingItem={editingItem?.type === 'consultation' ? editingItem.data : null}
          onSubmit={() => {
            setShowForm(false);
            setEditingItem(null);
            loadData();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      )}
      
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Consultations ({consultations.length})</Text>
        <Pressable style={styles.addBtn} onPress={() => setShowForm(true)}>
          <Text style={styles.addBtnText}>+</Text>
        </Pressable>
      </View>

      <FlatList
        data={consultations}
        keyExtractor={(item) => String(item.consultation_id)}
        renderItem={({ item }) => (
          <Pressable 
            style={styles.card}
            onPress={() => navigation.navigate('ConsultationDetail', { consultationId: item.consultation_id })}
          >
            <View style={styles.cardContent}>
              <Text style={styles.itemTitle}>{item.nom_type}</Text>
              <Text style={styles.itemSub}>Date: {item.date_consultation}</Text>
              {item.notes && <Text style={styles.itemSub}>Notes: {item.notes}</Text>}
              <Text style={styles.viewDetailText}>👁️ Voir détails et pièces jointes</Text>
            </View>
            <View style={styles.cardActions}>
              <Pressable
                style={styles.editBtn}
                onPress={(e) => {
                  e.stopPropagation();
                  setEditingItem({ type: 'consultation', data: item });
                  setShowForm(true);
                }}
              >
                <Text style={styles.editBtnText}>✏️</Text>
              </Pressable>
              <Pressable
                style={styles.deleteBtn}
                onPress={(e) => {
                  e.stopPropagation();
                  deleteItem('consultations', 'consultation_id', item.consultation_id);
                }}
              >
                <Text style={styles.deleteBtnText}>×</Text>
              </Pressable>
            </View>
          </Pressable>
        )}
        scrollEnabled={false}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucune consultation</Text>}
      />
    </View>
  );

  const renderExamens = () => (
    <View style={styles.tabContent}>
      {showForm && activeTab === 'examens' && (
        <ExamenForm
          patientId={patient.patient_id}
          editingItem={editingItem?.type === 'examen' ? editingItem.data : null}
          onSubmit={() => {
            setShowForm(false);
            setEditingItem(null);
            loadData();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      )}
      
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Examens ({examens.length})</Text>
        <Pressable style={styles.addBtn} onPress={() => setShowForm(true)}>
          <Text style={styles.addBtnText}>+</Text>
        </Pressable>
      </View>

      <FlatList
        data={examens}
        keyExtractor={(item) => String(item.examen_id)}
        renderItem={({ item }) => (
          <Pressable 
            style={styles.card}
            onPress={() => navigation.navigate('ExamenDetail', { examenId: item.examen_id })}
          >
            <View style={styles.cardContent}>
              <Text style={styles.itemTitle}>{item.nom_type}</Text>
              <Text style={styles.itemSub}>Date: {item.date_examen}</Text>
              {item.objet_examen && <Text style={styles.itemSub}>Objet: {item.objet_examen}</Text>}
              {item.resultat && <Text style={styles.itemSub}>Résultat: {item.resultat}</Text>}
              {item.notes && <Text style={styles.itemSub}>Notes: {item.notes}</Text>}
              <Text style={styles.viewDetailText}>👁️ Voir détails et pièces jointes</Text>
            </View>
            <View style={styles.cardActions}>
              <Pressable
                style={styles.editBtn}
                onPress={(e) => {
                  e.stopPropagation();
                  setEditingItem({ type: 'examen', data: item });
                  setShowForm(true);
                }}
              >
                <Text style={styles.editBtnText}>✏️</Text>
              </Pressable>
              <Pressable
                style={styles.deleteBtn}
                onPress={(e) => {
                  e.stopPropagation();
                  deleteItem('examens', 'examen_id', item.examen_id);
                }}
              >
                <Text style={styles.deleteBtnText}>×</Text>
              </Pressable>
            </View>
          </Pressable>
        )}
        scrollEnabled={false}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucun examen</Text>}
      />
    </View>
  );

  if (!patient) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Patient non trouvé</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* En-tête patient */}
        <View style={styles.header}>
          <View style={styles.patientHeaderMain}>
            <Text style={styles.patientName}>{patient.prenom} {patient.nom}</Text>
            <View style={styles.patientHeaderActions}>
              {patient.date_naissance && (
                <View style={styles.ageContainer}>
                  <Text style={styles.ageText}>{calculateAge(patient.date_naissance)} ans</Text>
                </View>
              )}
              <Pressable style={styles.editPatientBtn} onPress={() => setShowEditPatient(true)}>
                <Text style={styles.editPatientBtnText}>✏️</Text>
              </Pressable>
            </View>
          </View>
          <Text style={styles.patientInfo}>
            {patient.sexe && `${patient.sexe === 'M' ? '👨' : '👩'} ${patient.sexe === 'M' ? 'Homme' : 'Femme'} • `}
            {patient.date_naissance && `Né(e) le ${patient.date_naissance} • `}
            📞 {patient.telephone || 'N/A'}
          </Text>
          {patient.adresse && (
            <Text style={styles.patientAddress}>📍 {patient.adresse}</Text>
          )}
        </View>

        {/* Statistiques patient */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>📊 Résumé du dossier</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{patientStats.donnees}</Text>
              <Text style={styles.statLabel}>Données</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{patientStats.consultations}</Text>
              <Text style={styles.statLabel}>Consultations</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{patientStats.examens}</Text>
              <Text style={styles.statLabel}>Examens</Text>
            </View>
          </View>
        </View>

        {/* Onglets */}
        <View style={styles.tabBar}>
          <Pressable
            style={[styles.tab, activeTab === 'donnees' && styles.activeTab]}
            onPress={() => setActiveTab('donnees')}
          >
            <Text style={[styles.tabText, activeTab === 'donnees' && styles.activeTabText]}>
              Données ({donnees.length})
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'consultations' && styles.activeTab]}
            onPress={() => setActiveTab('consultations')}
          >
            <Text style={[styles.tabText, activeTab === 'consultations' && styles.activeTabText]}>
              Consultations ({consultations.length})
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'examens' && styles.activeTab]}
            onPress={() => setActiveTab('examens')}
          >
            <Text style={[styles.tabText, activeTab === 'examens' && styles.activeTabText]}>
              Examens ({examens.length})
            </Text>
          </Pressable>
        </View>

        {/* Formulaire d'édition patient */}
        {showEditPatient && (
          <EditPatientForm
            patient={patient}
            onSubmit={() => {
              setShowEditPatient(false);
              // Recharger les données patient depuis la navigation
              navigation.setParams({ patient: { ...patient, updated: Date.now() } });
            }}
            onCancel={() => setShowEditPatient(false)}
          />
        )}

        {/* Contenu des onglets */}
        {activeTab === 'donnees' && renderDonnees()}
        {activeTab === 'consultations' && renderConsultations()}
        {activeTab === 'examens' && renderExamens()}
      </ScrollView>
    </SafeAreaView>
  );
}

// Formulaire d'édition du patient
function EditPatientForm({ patient, onSubmit, onCancel }: { patient: any; onSubmit: () => void; onCancel: () => void }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const [nom, setNom] = useState(patient.nom || '');
  const [prenom, setPrenom] = useState(patient.prenom || '');
  const [dateNaissance, setDateNaissance] = useState(() => {
    if (patient.date_naissance) {
      const date = new Date(patient.date_naissance);
      return isNaN(date.getTime()) ? new Date() : date;
    }
    return new Date();
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [sexe, setSexe] = useState(patient.sexe || 'M');
  const [adresse, setAdresse] = useState(patient.adresse || '');
  const [telephone, setTelephone] = useState(patient.telephone || '');

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateNaissance(selectedDate);
    }
  };

  const handleSubmit = async () => {
    if (!nom.trim() || !prenom.trim()) {
      Alert.alert('Champs requis', 'Veuillez saisir le nom et prénom.');
      return;
    }
    try {
      await run('UPDATE patients SET nom=?, prenom=?, date_naissance=?, sexe=?, adresse=?, telephone=? WHERE patient_id=?', 
        [nom.trim(), prenom.trim(), formatDate(dateNaissance), sexe, adresse.trim() || null, telephone.trim() || null, patient.patient_id]);
      Alert.alert('Succès', 'Patient modifié avec succès');
      onSubmit();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de modifier le patient');
    }
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Modifier le patient</Text>
      
      <TextInput
        style={styles.formInput}
        placeholder="Nom"
        placeholderTextColor="#9ca3af"
        value={nom}
        onChangeText={setNom}
      />
      
      <TextInput
        style={styles.formInput}
        placeholder="Prénom"
        placeholderTextColor="#9ca3af"
        value={prenom}
        onChangeText={setPrenom}
      />
      
      {/* Sélecteur de date de naissance */}
      <View style={styles.dateContainer}>
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
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Sexe:</Text>
        <View style={styles.sexeContainer}>
          <Pressable
            style={[styles.sexeBtn, sexe === 'M' && styles.sexeBtnSelected]}
            onPress={() => setSexe('M')}
          >
            <Text style={[styles.sexeText, sexe === 'M' && styles.sexeTextSelected]}>👨 Homme</Text>
          </Pressable>
          <Pressable
            style={[styles.sexeBtn, sexe === 'F' && styles.sexeBtnSelected]}
            onPress={() => setSexe('F')}
          >
            <Text style={[styles.sexeText, sexe === 'F' && styles.sexeTextSelected]}>👩 Femme</Text>
          </Pressable>
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
          <Text style={styles.submitBtnText}>Modifier</Text>
        </Pressable>
      </View>
    </View>
  );
}

// Formulaire pour les données sanitaires avec sélecteur de date
function DonneeForm({ patientId, editingItem, onSubmit, onCancel }: { patientId: number; editingItem?: any; onSubmit: () => void; onCancel: () => void }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const [typeDonneeId, setTypeDonneeId] = useState(editingItem ? String(editingItem.type_donnee_id) : '1');
  const [valeur, setValeur] = useState(editingItem ? editingItem.valeur : '');
  const [dateEnregistrement, setDateEnregistrement] = useState(() => {
    if (editingItem && editingItem.date_enregistrement) {
      const date = new Date(editingItem.date_enregistrement);
      return isNaN(date.getTime()) ? new Date() : date;
    }
    return new Date();
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [types, setTypes] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const result = await query('SELECT * FROM types_donnees ORDER BY nom_type');
      setTypes(result);
    })();
  }, []);

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateEnregistrement(selectedDate);
    }
  };

  const handleSubmit = async () => {
    if (!valeur.trim()) {
      Alert.alert('Champ requis', 'Veuillez saisir une valeur.');
      return;
    }
    try {
      if (editingItem) {
        // Mode édition
        await run('UPDATE donnees_sanitaires SET type_donnee_id=?, valeur=?, date_enregistrement=? WHERE donnee_id=?', 
          [parseInt(typeDonneeId), valeur.trim(), formatDate(dateEnregistrement), editingItem.donnee_id]);
        Alert.alert('Succès', 'Donnée modifiée avec succès');
      } else {
        // Mode création
        await run('INSERT INTO donnees_sanitaires (patient_id, type_donnee_id, valeur, date_enregistrement) VALUES (?, ?, ?, ?)', 
          [patientId, parseInt(typeDonneeId), valeur.trim(), formatDate(dateEnregistrement)]);
        Alert.alert('Succès', 'Donnée ajoutée avec succès');
      }
      onSubmit();
    } catch (error) {
      Alert.alert('Erreur', editingItem ? 'Impossible de modifier la donnée' : 'Impossible d\'ajouter la donnée');
    }
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>{editingItem ? 'Modifier la donnée sanitaire' : 'Nouvelle donnée sanitaire'}</Text>
      
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Type:</Text>
        {types.map(type => (
          <Pressable
            key={type.type_donnee_id}
            style={[styles.pickerItem, typeDonneeId === String(type.type_donnee_id) && styles.pickerItemSelected]}
            onPress={() => setTypeDonneeId(String(type.type_donnee_id))}
          >
            <Text style={[styles.pickerText, typeDonneeId === String(type.type_donnee_id) && styles.pickerTextSelected]}>
              {type.nom_type}
            </Text>
          </Pressable>
        ))}
      </View>

      <TextInput
        style={styles.formInput}
        placeholder="Valeur (ex: A+, 70kg, 175cm)"
        placeholderTextColor="#9ca3af"
        value={valeur}
        onChangeText={setValeur}
      />
      
      {/* Sélecteur de date */}
      <View style={styles.dateContainer}>
        <Text style={styles.dateLabel}>Date d'enregistrement</Text>
        <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateButtonText}>📅 {formatDate(dateEnregistrement)}</Text>
        </Pressable>
        {showDatePicker && (
          <DateTimePicker
            value={dateEnregistrement}
            mode="date"
            display="default"
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}
      </View>
      
      <View style={styles.formButtons}>
        <Pressable style={[styles.formBtn, styles.cancelBtn]} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>Annuler</Text>
        </Pressable>
        <Pressable style={[styles.formBtn, styles.submitBtn]} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>{editingItem ? 'Modifier' : 'Ajouter'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

// Formulaire pour les consultations avec sélecteur de date
function ConsultationForm({ patientId, editingItem, onSubmit, onCancel }: { patientId: number; editingItem?: any; onSubmit: () => void; onCancel: () => void }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const [typeConsultationId, setTypeConsultationId] = useState(editingItem ? String(editingItem.type_consultation_id) : '1');
  const [notes, setNotes] = useState(editingItem ? editingItem.notes || '' : '');
  const [dateConsultation, setDateConsultation] = useState(() => {
    if (editingItem && editingItem.date_consultation) {
      const date = new Date(editingItem.date_consultation);
      return isNaN(date.getTime()) ? new Date() : date;
    }
    return new Date();
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [types, setTypes] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const result = await query('SELECT * FROM types_consultations ORDER BY nom_type');
      setTypes(result);
    })();
  }, []);

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateConsultation(selectedDate);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingItem) {
        // Mode édition
        await run('UPDATE consultations SET type_consultation_id=?, date_consultation=?, notes=? WHERE consultation_id=?', 
          [parseInt(typeConsultationId), formatDate(dateConsultation), notes.trim() || null, editingItem.consultation_id]);
        Alert.alert('Succès', 'Consultation modifiée avec succès');
      } else {
        // Mode création
        await run('INSERT INTO consultations (patient_id, type_consultation_id, date_consultation, notes) VALUES (?, ?, ?, ?)', 
          [patientId, parseInt(typeConsultationId), formatDate(dateConsultation), notes.trim() || null]);
        Alert.alert('Succès', 'Consultation ajoutée avec succès');
      }
      onSubmit();
    } catch (error) {
      Alert.alert('Erreur', editingItem ? 'Impossible de modifier la consultation' : 'Impossible d\'ajouter la consultation');
    }
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>{editingItem ? 'Modifier la consultation' : 'Nouvelle consultation'}</Text>
      
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Type:</Text>
        {types.map(type => (
          <Pressable
            key={type.type_consultation_id}
            style={[styles.pickerItem, typeConsultationId === String(type.type_consultation_id) && styles.pickerItemSelected]}
            onPress={() => setTypeConsultationId(String(type.type_consultation_id))}
          >
            <Text style={[styles.pickerText, typeConsultationId === String(type.type_consultation_id) && styles.pickerTextSelected]}>
              {type.nom_type}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Sélecteur de date */}
      <View style={styles.dateContainer}>
        <Text style={styles.dateLabel}>Date de consultation</Text>
        <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateButtonText}>📅 {formatDate(dateConsultation)}</Text>
        </Pressable>
        {showDatePicker && (
          <DateTimePicker
            value={dateConsultation}
            mode="date"
            display="default"
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}
      </View>

      <TextInput
        style={styles.formInput}
        placeholder="Notes de consultation..."
        placeholderTextColor="#9ca3af"
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={4}
      />
      
      <View style={styles.formButtons}>
        <Pressable style={[styles.formBtn, styles.cancelBtn]} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>Annuler</Text>
        </Pressable>
        <Pressable style={[styles.formBtn, styles.submitBtn]} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Ajouter</Text>
        </Pressable>
      </View>
    </View>
  );
}

// Formulaire pour les examens avec sélecteur de date et champ objet_examen
function ExamenForm({ patientId, editingItem, onSubmit, onCancel }: { patientId: number; editingItem?: any; onSubmit: () => void; onCancel: () => void }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const [typeExamenId, setTypeExamenId] = useState(editingItem ? String(editingItem.type_examen_id) : '1');
  const [objetExamen, setObjetExamen] = useState(editingItem ? editingItem.objet_examen || '' : '');
  const [resultat, setResultat] = useState(editingItem ? editingItem.resultat || '' : '');
  const [notes, setNotes] = useState(editingItem ? editingItem.notes || '' : '');
  const [dateExamen, setDateExamen] = useState(() => {
    if (editingItem && editingItem.date_examen) {
      const date = new Date(editingItem.date_examen);
      return isNaN(date.getTime()) ? new Date() : date;
    }
    return new Date();
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [types, setTypes] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const result = await query('SELECT * FROM types_examens ORDER BY nom_type');
      setTypes(result);
    })();
  }, []);

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateExamen(selectedDate);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingItem) {
        // Mode édition
        await run('UPDATE examens SET type_examen_id=?, objet_examen=?, date_examen=?, resultat=?, notes=? WHERE examen_id=?', 
          [parseInt(typeExamenId), objetExamen.trim() || null, formatDate(dateExamen), resultat.trim() || null, notes.trim() || null, editingItem.examen_id]);
        Alert.alert('Succès', 'Examen modifié avec succès');
      } else {
        // Mode création
        await run('INSERT INTO examens (patient_id, type_examen_id, objet_examen, date_examen, resultat, notes) VALUES (?, ?, ?, ?, ?, ?)', 
          [patientId, parseInt(typeExamenId), objetExamen.trim() || null, formatDate(dateExamen), resultat.trim() || null, notes.trim() || null]);
        Alert.alert('Succès', 'Examen ajouté avec succès');
      }
      onSubmit();
    } catch (error) {
      Alert.alert('Erreur', editingItem ? 'Impossible de modifier l\'examen' : 'Impossible d\'ajouter l\'examen');
    }
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>{editingItem ? 'Modifier l\'examen' : 'Nouvel examen'}</Text>
      
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Type:</Text>
        {types.map(type => (
          <Pressable
            key={type.type_examen_id}
            style={[styles.pickerItem, typeExamenId === String(type.type_examen_id) && styles.pickerItemSelected]}
            onPress={() => setTypeExamenId(String(type.type_examen_id))}
          >
            <Text style={[styles.pickerText, typeExamenId === String(type.type_examen_id) && styles.pickerTextSelected]}>
              {type.nom_type}
            </Text>
          </Pressable>
        ))}
      </View>

      <TextInput
        style={styles.formInput}
        placeholder="Objet de l'examen (ex: Contrôle annuel, Suivi...)"
        placeholderTextColor="#9ca3af"
        value={objetExamen}
        onChangeText={setObjetExamen}
      />

      {/* Sélecteur de date */}
      <View style={styles.dateContainer}>
        <Text style={styles.dateLabel}>Date d'examen</Text>
        <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateButtonText}>📅 {formatDate(dateExamen)}</Text>
        </Pressable>
        {showDatePicker && (
          <DateTimePicker
            value={dateExamen}
            mode="date"
            display="default"
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}
      </View>

      <TextInput
        style={styles.formInput}
        placeholder="Résultat de l'examen..."
        placeholderTextColor="#9ca3af"
        value={resultat}
        onChangeText={setResultat}
        multiline
        numberOfLines={3}
      />
      
      <TextInput
        style={styles.formInput}
        placeholder="Notes complémentaires..."
        placeholderTextColor="#9ca3af"
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
      />
      
      <View style={styles.formButtons}>
        <Pressable style={[styles.formBtn, styles.cancelBtn]} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>Annuler</Text>
        </Pressable>
        <Pressable style={[styles.formBtn, styles.submitBtn]} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Ajouter</Text>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 18, color: colors.error },
  scrollView: { flex: 1 },
  
  // En-tête patient
  header: { backgroundColor: '#fff', padding: 20, marginBottom: 16, borderRadius: 16, margin: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  patientHeaderMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  patientName: { fontSize: 24, fontWeight: '800', color: '#1e293b', flex: 1 },
  patientHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ageContainer: { backgroundColor: '#3b82f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  ageText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  editPatientBtn: { backgroundColor: '#f59e0b', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', shadowColor: '#f59e0b', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 3 },
  editPatientBtnText: { fontSize: 16 },
  patientInfo: { color: '#64748b', fontSize: 16, fontWeight: '500', marginBottom: 4 },
  patientAddress: { color: '#64748b', fontSize: 14, fontStyle: 'italic' },
  
  // Statistiques
  statsCard: { backgroundColor: '#fff', margin: 16, padding: 20, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  statsTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 16, textAlign: 'center' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 28, fontWeight: '800', color: '#3b82f6', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#64748b', fontWeight: '600', textTransform: 'uppercase' },
  
  // Onglets
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', margin: 16, borderRadius: 12, padding: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  tab: { flex: 1, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center' },
  activeTab: { backgroundColor: '#3b82f6' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  activeTabText: { color: '#fff' },
  
  // Contenu
  tabContent: { padding: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b', marginBottom: 16 },
  
  // Section header
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  addBtn: { backgroundColor: '#3b82f6', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  addBtnText: { color: '#fff', fontSize: 24, fontWeight: '600' },
  
  // Cards
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  cardContent: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
  itemSub: { fontSize: 14, color: '#64748b', marginBottom: 2 },
  viewDetailText: { fontSize: 12, color: '#3b82f6', fontWeight: '500', marginTop: 4 },
  cardActions: { flexDirection: 'row', gap: 8 },
  editBtn: { backgroundColor: '#f59e0b', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  editBtnText: { fontSize: 14 },
  deleteBtn: { backgroundColor: '#ef4444', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#94a3b8', fontSize: 16, fontStyle: 'italic', marginTop: 20 },
  
  // Formulaires
  formContainer: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  formTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 16, textAlign: 'center' },
  formInput: { backgroundColor: '#f8fafc', borderColor: '#e2e8f0', borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 16, color: '#1e293b', marginBottom: 12 },
  
  // Picker
  pickerContainer: { marginBottom: 12 },
  label: { fontSize: 14, color: '#374151', marginBottom: 8, fontWeight: '600' },
  pickerItem: { backgroundColor: '#f8fafc', borderColor: '#e2e8f0', borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 8 },
  pickerItemSelected: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  pickerText: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  pickerTextSelected: { color: '#fff', fontWeight: '600' },
  
  // Date picker
  dateContainer: { marginBottom: 12 },
  dateLabel: { fontSize: 14, color: '#374151', marginBottom: 8, fontWeight: '600' },
  dateButton: { backgroundColor: '#f8fafc', borderColor: '#e2e8f0', borderWidth: 1, borderRadius: 12, padding: 16, alignItems: 'center' },
  dateButtonText: { fontSize: 16, color: '#1e293b', fontWeight: '500' },
  
  // Form buttons
  formButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  formBtn: { flex: 1, paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0', borderWidth: 1 },
  cancelBtnText: { color: '#64748b', fontWeight: '600', fontSize: 16 },
  submitBtn: { backgroundColor: '#3b82f6', shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  submitBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  
  // Sélecteur de sexe
  sexeContainer: { flexDirection: 'row', gap: 8 },
  sexeBtn: { flex: 1, backgroundColor: '#f8fafc', borderColor: '#e2e8f0', borderWidth: 1, borderRadius: 8, padding: 12, alignItems: 'center' },
  sexeBtnSelected: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  sexeText: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  sexeTextSelected: { color: '#fff', fontWeight: '600' },
});
