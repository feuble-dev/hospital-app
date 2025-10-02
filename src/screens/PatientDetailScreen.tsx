import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, FlatList, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRoute, useNavigation } from '@react-navigation/native';
import { query, run } from '../db';
import AttachmentManager from '../components/AttachmentManager';
import TypePicker from '../components/TypePicker';
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
  
  const [typeDonneeId, setTypeDonneeId] = useState<number | null>(editingItem ? editingItem.type_donnee_id : null);
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
    if (!typeDonneeId) {
      Alert.alert('Erreur', 'Veuillez sélectionner un type de donnée');
      return;
    }
    
    if (!valeur.trim()) {
      Alert.alert('Champ requis', 'Veuillez saisir une valeur.');
      return;
    }
    try {
      if (editingItem) {
        // Mode édition
        await run('UPDATE donnees_sanitaires SET type_donnee_id=?, valeur=?, date_enregistrement=? WHERE donnee_id=?', 
          [typeDonneeId, valeur.trim(), formatDate(dateEnregistrement), editingItem.donnee_id]);
        Alert.alert('Succès', 'Donnée modifiée avec succès');
      } else {
        // Mode création
        await run('INSERT INTO donnees_sanitaires (patient_id, type_donnee_id, valeur, date_enregistrement) VALUES (?, ?, ?, ?)', 
          [patientId, typeDonneeId, valeur.trim(), formatDate(dateEnregistrement)]);
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
      
      <TypePicker
        label="Type de donnée"
        value={typeDonneeId}
        items={types.map(t => ({ id: t.type_donnee_id, nom_type: t.nom_type, description: t.description }))}
        onValueChange={setTypeDonneeId}
        placeholder="Sélectionner un type"
        icon="📊"
      />

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Valeur *</Text>
        <TextInput
          style={styles.formInput}
          placeholder="Valeur (ex: A+, 70kg, 175cm)"
          placeholderTextColor="#9ca3af"
          value={valeur}
          onChangeText={setValeur}
        />
      </View>
      
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
  
  const [typeConsultationId, setTypeConsultationId] = useState<number | null>(editingItem ? editingItem.type_consultation_id : null);
  const [diagnostic, setDiagnostic] = useState(editingItem ? editingItem.diagnostic || '' : '');
  const [traitement, setTraitement] = useState(editingItem ? editingItem.traitement || '' : '');
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
    if (!typeConsultationId) {
      Alert.alert('Erreur', 'Veuillez sélectionner un type de consultation');
      return;
    }
    
    if (!diagnostic.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un diagnostic');
      return;
    }
    
    try {
      if (editingItem) {
        // Mode édition
        await run('UPDATE consultations SET type_consultation_id=?, date_consultation=?, diagnostic=?, traitement=? WHERE consultation_id=?', 
          [typeConsultationId, formatDate(dateConsultation), diagnostic.trim(), traitement.trim() || null, editingItem.consultation_id]);
        Alert.alert('Succès', 'Consultation modifiée avec succès');
      } else {
        // Mode création
        await run('INSERT INTO consultations (patient_id, type_consultation_id, date_consultation, diagnostic, traitement) VALUES (?, ?, ?, ?, ?)', 
          [patientId, typeConsultationId, formatDate(dateConsultation), diagnostic.trim(), traitement.trim() || null]);
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
      
      <TypePicker
        label="Type de consultation"
        value={typeConsultationId}
        items={types.map(t => ({ id: t.type_consultation_id, nom_type: t.nom_type, description: t.description }))}
        onValueChange={setTypeConsultationId}
        placeholder="Sélectionner un type"
        icon="🩺"
      />

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

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Diagnostic *</Text>
        <TextInput
          style={[styles.formInput, styles.textArea]}
          placeholder="Diagnostic du patient..."
          placeholderTextColor="#9ca3af"
          value={diagnostic}
          onChangeText={setDiagnostic}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Traitement</Text>
        <TextInput
          style={[styles.formInput, styles.textArea]}
          placeholder="Traitement prescrit..."
          placeholderTextColor="#9ca3af"
          value={traitement}
          onChangeText={setTraitement}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
      
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
  
  const [typeExamenId, setTypeExamenId] = useState<number | null>(editingItem ? editingItem.type_examen_id : null);
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
    if (!typeExamenId) {
      Alert.alert('Erreur', 'Veuillez sélectionner un type d\'examen');
      return;
    }
    
    try {
      if (editingItem) {
        // Mode édition
        await run('UPDATE examens SET type_examen_id=?, objet_examen=?, date_examen=?, resultat=?, notes=? WHERE examen_id=?', 
          [typeExamenId, objetExamen.trim() || null, formatDate(dateExamen), resultat.trim() || null, notes.trim() || null, editingItem.examen_id]);
        Alert.alert('Succès', 'Examen modifié avec succès');
      } else {
        // Mode création
        await run('INSERT INTO examens (patient_id, type_examen_id, objet_examen, date_examen, resultat, notes) VALUES (?, ?, ?, ?, ?, ?)', 
          [patientId, typeExamenId, objetExamen.trim() || null, formatDate(dateExamen), resultat.trim() || null, notes.trim() || null]);
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
      
      <TypePicker
        label="Type d'examen"
        value={typeExamenId}
        items={types.map(t => ({ id: t.type_examen_id, nom_type: t.nom_type, description: t.description }))}
        onValueChange={setTypeExamenId}
        placeholder="Sélectionner un type"
        icon="🔬"
      />

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Objet de l'examen</Text>
        <TextInput
          style={styles.formInput}
          placeholder="Contrôle annuel, Suivi post-opératoire..."
          placeholderTextColor="#9ca3af"
          value={objetExamen}
          onChangeText={setObjetExamen}
        />
      </View>

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

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Résultat</Text>
        <TextInput
          style={[styles.formInput, styles.textArea]}
          placeholder="Résultat de l'examen..."
          placeholderTextColor="#9ca3af"
          value={resultat}
          onChangeText={setResultat}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Notes complémentaires</Text>
        <TextInput
          style={[styles.formInput, styles.textArea]}
          placeholder="Notes additionnelles..."
          placeholderTextColor="#9ca3af"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>
      
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
  header: { backgroundColor: '#fff', padding: 24, marginBottom: 16, borderRadius: 24, margin: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 8, borderWidth: 1, borderColor: '#f1f5f9' },
  patientHeaderMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  patientName: { fontSize: 28, fontWeight: '900', color: '#0f172a', flex: 1, letterSpacing: -0.5 },
  patientHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ageContainer: { backgroundColor: '#6366f1', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, shadowColor: '#6366f1', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  ageText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  editPatientBtn: { backgroundColor: '#f59e0b', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', shadowColor: '#f59e0b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 6 },
  editPatientBtnText: { fontSize: 16 },
  patientInfo: { color: '#64748b', fontSize: 16, fontWeight: '500', marginBottom: 4 },
  patientAddress: { color: '#64748b', fontSize: 14, fontStyle: 'italic' },
  
  // Statistiques
  statsCard: { backgroundColor: '#fff', margin: 16, padding: 24, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 6, borderWidth: 1, borderColor: '#f1f5f9' },
  statsTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 20, textAlign: 'center', letterSpacing: -0.3 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 32, fontWeight: '900', color: '#6366f1', marginBottom: 6 },
  statLabel: { fontSize: 13, color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  // Onglets
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4, borderWidth: 1, borderColor: '#e2e8f0' },
  tab: { flex: 1, paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12, alignItems: 'center' },
  activeTab: { backgroundColor: '#6366f1', shadowColor: '#6366f1', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  tabText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
  activeTabText: { color: '#fff', fontWeight: '800' },
  
  // Contenu
  tabContent: { padding: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b', marginBottom: 16 },
  
  // Section header
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  addBtn: { backgroundColor: '#6366f1', width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  addBtnText: { color: '#fff', fontSize: 28, fontWeight: '700' },
  
  // Cards
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 14, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4, borderWidth: 1, borderColor: '#f1f5f9' },
  cardContent: { flex: 1 },
  itemTitle: { fontSize: 17, fontWeight: '700', color: '#0f172a', marginBottom: 6, letterSpacing: -0.2 },
  itemSub: { fontSize: 14, color: '#64748b', marginBottom: 3, lineHeight: 20 },
  viewDetailText: { fontSize: 13, color: '#6366f1', fontWeight: '700', marginTop: 6 },
  cardActions: { flexDirection: 'row', gap: 8 },
  editBtn: { backgroundColor: '#f59e0b', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  editBtnText: { fontSize: 14 },
  deleteBtn: { backgroundColor: '#ef4444', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#94a3b8', fontSize: 16, fontStyle: 'italic', marginTop: 20 },
  
  // Formulaires
  formContainer: { backgroundColor: '#fff', borderRadius: 20, padding: 24, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  formTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 20, textAlign: 'center', letterSpacing: -0.3 },
  formInput: { backgroundColor: '#f8fafc', borderColor: '#e2e8f0', borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 16, color: '#0f172a', marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2, elevation: 1 },
  inputContainer: { marginBottom: 16 },
  textArea: { minHeight: 100, textAlignVertical: 'top', paddingTop: 12 },
  
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
  formButtons: { flexDirection: 'row', gap: 14, marginTop: 12 },
  formBtn: { flex: 1, paddingVertical: 16, paddingHorizontal: 24, borderRadius: 14, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0', borderWidth: 1 },
  cancelBtnText: { color: '#64748b', fontWeight: '700', fontSize: 16 },
  submitBtn: { backgroundColor: '#6366f1', shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  
  // Sélecteur de sexe
  sexeContainer: { flexDirection: 'row', gap: 8 },
  sexeBtn: { flex: 1, backgroundColor: '#f8fafc', borderColor: '#e2e8f0', borderWidth: 1, borderRadius: 8, padding: 12, alignItems: 'center' },
  sexeBtnSelected: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  sexeText: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  sexeTextSelected: { color: '#fff', fontWeight: '600' },
});
