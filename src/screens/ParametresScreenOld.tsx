import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, FlatList, Alert, TextInput } from 'react-native';
import { query, run } from '../db';

type SettingsTab = 'donnees' | 'consultations' | 'examens';

export default function ParametresScreen() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('donnees');
  const [typesDonnees, setTypesDonnees] = useState<any[]>([]);
  const [typesConsultations, setTypesConsultations] = useState<any[]>([]);
  const [typesExamens, setTypesExamens] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [td, tc, te] = await Promise.all([
        query('SELECT * FROM types_donnees ORDER BY nom_type'),
        query('SELECT * FROM types_consultations ORDER BY nom_type'),
        query('SELECT * FROM types_examens ORDER BY nom_type'),
      ]);
      setTypesDonnees(td);
      setTypesConsultations(tc);
      setTypesExamens(te);
    } catch (error) {
      console.log('Erreur chargement types:', error);
    }
  };

  const deleteType = async (table: string, idField: string, id: number, name: string) => {
    Alert.alert(
      'Supprimer le type',
      `Êtes-vous sûr de vouloir supprimer "${name}" ?\nCela supprimera aussi toutes les données associées.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await run(`DELETE FROM ${table} WHERE ${idField} = ?`, [id]);
              await loadData();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer ce type');
            }
          },
        },
      ]
    );
  };

  const renderTypesDonnees = () => (
    <View>
      {showForm && activeTab === 'donnees' && (
        <TypeForm
          table="types_donnees"
          onSubmit={() => {
            setShowForm(false);
            loadData();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}
      
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Types de données sanitaires ({typesDonnees.length})</Text>
        <Pressable style={styles.addBtn} onPress={() => setShowForm(true)}>
          <Text style={styles.addBtnText}>+</Text>
        </Pressable>
      </View>

      <FlatList
        data={typesDonnees}
        keyExtractor={(item) => String(item.type_donnee_id)}
        renderItem={({ item }) => (
          <View style={styles.typeCard}>
            <View style={styles.typeContent}>
              <Text style={styles.typeName}>{item.nom_type}</Text>
              <Text style={styles.typeDescription}>{item.description}</Text>
            </View>
            <Pressable
              style={styles.deleteBtn}
              onPress={() => deleteType('types_donnees', 'type_donnee_id', item.type_donnee_id, item.nom_type)}
            >
              <Text style={styles.deleteBtnText}>×</Text>
            </Pressable>
          </View>
        )}
        scrollEnabled={false}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucun type de donnée</Text>}
      />
    </View>
  );

  const renderTypesConsultations = () => (
    <View>
      {showForm && activeTab === 'consultations' && (
        <TypeForm
          table="types_consultations"
          onSubmit={() => {
            setShowForm(false);
            loadData();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}
      
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Types de consultations ({typesConsultations.length})</Text>
        <Pressable style={styles.addBtn} onPress={() => setShowForm(true)}>
          <Text style={styles.addBtnText}>+</Text>
        </Pressable>
      </View>

      <FlatList
        data={typesConsultations}
        keyExtractor={(item) => String(item.type_consultation_id)}
        renderItem={({ item }) => (
          <View style={styles.typeCard}>
            <View style={styles.typeContent}>
              <Text style={styles.typeName}>{item.nom_type}</Text>
              <Text style={styles.typeDescription}>{item.description}</Text>
            </View>
            <Pressable
              style={styles.deleteBtn}
              onPress={() => deleteType('types_consultations', 'type_consultation_id', item.type_consultation_id, item.nom_type)}
            >
              <Text style={styles.deleteBtnText}>×</Text>
            </Pressable>
          </View>
        )}
        scrollEnabled={false}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucun type de consultation</Text>}
      />
    </View>
  );

  const renderTypesExamens = () => (
    <View>
      {showForm && activeTab === 'examens' && (
        <TypeForm
          table="types_examens"
          onSubmit={() => {
            setShowForm(false);
            loadData();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}
      
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Types d'examens ({typesExamens.length})</Text>
        <Pressable style={styles.addBtn} onPress={() => setShowForm(true)}>
          <Text style={styles.addBtnText}>+</Text>
        </Pressable>
      </View>

      <FlatList
        data={typesExamens}
        keyExtractor={(item) => String(item.type_examen_id)}
        renderItem={({ item }) => (
          <View style={styles.typeCard}>
            <View style={styles.typeContent}>
              <Text style={styles.typeName}>{item.nom_type}</Text>
              <Text style={styles.typeDescription}>{item.description}</Text>
            </View>
            <Pressable
              style={styles.deleteBtn}
              onPress={() => deleteType('types_examens', 'type_examen_id', item.type_examen_id, item.nom_type)}
            >
              <Text style={styles.deleteBtnText}>×</Text>
            </Pressable>
          </View>
        )}
        scrollEnabled={false}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucun type d'examen</Text>}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Paramètres</Text>

      {/* Onglets */}
      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tab, activeTab === 'donnees' && styles.activeTab]}
          onPress={() => { setActiveTab('donnees'); setShowForm(false); }}
        >
          <Text style={[styles.tabText, activeTab === 'donnees' && styles.activeTabText]}>
            Données ({typesDonnees.length})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'consultations' && styles.activeTab]}
          onPress={() => { setActiveTab('consultations'); setShowForm(false); }}
        >
          <Text style={[styles.tabText, activeTab === 'consultations' && styles.activeTabText]}>
            Consultations ({typesConsultations.length})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'examens' && styles.activeTab]}
          onPress={() => { setActiveTab('examens'); setShowForm(false); }}
        >
          <Text style={[styles.tabText, activeTab === 'examens' && styles.activeTabText]}>
            Examens ({typesExamens.length})
          </Text>
        </Pressable>
      </View>

      {/* Contenu des onglets */}
      <View style={styles.tabContent}>
        {activeTab === 'donnees' && renderTypesDonnees()}
        {activeTab === 'consultations' && renderTypesConsultations()}
        {activeTab === 'examens' && renderTypesExamens()}
      </View>
    </ScrollView>
  );
}

function TypeForm({ table, onSubmit, onCancel }: { table: string; onSubmit: () => void; onCancel: () => void }) {
  const [nomType, setNomType] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    if (!nomType.trim()) {
      Alert.alert('Champ requis', 'Veuillez saisir un nom de type.');
      return;
    }

    try {
      await run(
        `INSERT INTO ${table} (nom_type, description) VALUES (?, ?)`,
        [nomType.trim(), description.trim() || null]
      );
      onSubmit();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter ce type');
    }
  };

  const getTitle = () => {
    switch (table) {
      case 'types_donnees': return 'Nouveau type de donnée sanitaire';
      case 'types_consultations': return 'Nouveau type de consultation';
      case 'types_examens': return 'Nouveau type d\'examen';
      default: return 'Nouveau type';
    }
  };

  const getPlaceholder = () => {
    switch (table) {
      case 'types_donnees': return 'Ex: Tension artérielle, Glycémie, IMC...';
      case 'types_consultations': return 'Ex: Urgence, Suivi, Contrôle...';
      case 'types_examens': return 'Ex: IRM, Scanner, Échographie...';
      default: return 'Nom du type';
    }
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>{getTitle()}</Text>
      
      <TextInput
        style={styles.formInput}
        placeholder={getPlaceholder()}
        placeholderTextColor="#9ca3af"
        value={nomType}
        onChangeText={setNomType}
      />

      <TextInput
        style={[styles.formInput, styles.textArea]}
        placeholder="Description (optionnelle)"
        placeholderTextColor="#9ca3af"
        value={description}
        onChangeText={setDescription}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7fb' },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', margin: 20, marginBottom: 10 },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', marginHorizontal: 20, borderRadius: 12 },
  tab: { flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#2563eb' },
  tabText: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
  activeTabText: { color: '#2563eb', fontWeight: '700' },
  tabContent: { padding: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  addBtn: { backgroundColor: '#2563eb', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  typeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  typeContent: { flex: 1 },
  typeName: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  typeDescription: { fontSize: 14, color: '#6b7280' },
  deleteBtn: {
    backgroundColor: '#ef4444',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#9ca3af', fontSize: 14, fontStyle: 'italic', paddingVertical: 40 },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  formTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 16 },
  formInput: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    color: '#111827',
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  formButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  formBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#f3f4f6' },
  cancelBtnText: { color: '#374151', fontWeight: '600' },
  submitBtn: { backgroundColor: '#2563eb' },
  submitBtnText: { color: '#fff', fontWeight: '600' },
});
