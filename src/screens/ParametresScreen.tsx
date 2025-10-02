import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  Switch,
  Alert,
  TextInput,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { query, run } from '../db';

type SettingsSection = 'theme' | 'types_donnees' | 'types_consultations' | 'types_examens';

export default function ParametresScreen() {
  const { mode, colors, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState<SettingsSection>('theme');
  const [typesDonnees, setTypesDonnees] = useState<any[]>([]);
  const [typesConsultations, setTypesConsultations] = useState<any[]>([]);
  const [typesExamens, setTypesExamens] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);

  const styles = createStyles(colors);

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = async () => {
    try {
      const [donnees, consultations, examens] = await Promise.all([
        query('SELECT * FROM types_donnees ORDER BY nom_type'),
        query('SELECT * FROM types_consultations ORDER BY nom_type'),
        query('SELECT * FROM types_examens ORDER BY nom_type'),
      ]);
      setTypesDonnees(donnees);
      setTypesConsultations(consultations);
      setTypesExamens(examens);
    } catch (error) {
      console.log('Erreur chargement types:', error);
    }
  };

  const deleteType = async (section: SettingsSection, id: number) => {
    const tables = {
      types_donnees: { table: 'types_donnees', idField: 'type_donnee_id' },
      types_consultations: { table: 'types_consultations', idField: 'type_consultation_id' },
      types_examens: { table: 'types_examens', idField: 'type_examen_id' }
    };

    Alert.alert('Confirmation', 'Supprimer ce type ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            const { table, idField } = tables[section as keyof typeof tables];
            await run(`DELETE FROM ${table} WHERE ${idField} = ?`, [id]);
            await loadTypes();
            Alert.alert('Succès', 'Type supprimé avec succès');
          } catch (error) {
            Alert.alert('Erreur', 'Impossible de supprimer le type. Il est peut-être utilisé.');
          }
        },
      },
    ]);
  };

  const getCurrentTypes = () => {
    switch (activeSection) {
      case 'types_donnees': return typesDonnees;
      case 'types_consultations': return typesConsultations;
      case 'types_examens': return typesExamens;
      default: return [];
    }
  };

  const getIdField = () => {
    switch (activeSection) {
      case 'types_donnees': return 'type_donnee_id';
      case 'types_consultations': return 'type_consultation_id';
      case 'types_examens': return 'type_examen_id';
      default: return 'id';
    }
  };

  const renderThemeSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🎨 Apparence</Text>
      
      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Mode sombre</Text>
          <Text style={styles.settingDescription}>
            {mode === 'dark' ? 'Interface sombre activée' : 'Interface claire activée'}
          </Text>
        </View>
        <Switch
          value={mode === 'dark'}
          onValueChange={toggleTheme}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.surface}
        />
      </View>

      <View style={styles.themePreview}>
        <Text style={styles.previewTitle}>Aperçu du thème</Text>
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewHeaderText}>Exemple de carte</Text>
          </View>
          <Text style={styles.previewText}>Texte principal</Text>
          <Text style={styles.previewSubText}>Texte secondaire</Text>
          <View style={styles.previewButton}>
            <Text style={styles.previewButtonText}>Bouton</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderTypeCard = ({ item }: { item: any }) => (
    <View style={styles.typeCard}>
      <View style={styles.typeCardContent}>
        <Text style={styles.typeName}>{item.nom_type}</Text>
        {item.description && <Text style={styles.typeDescription}>{item.description}</Text>}
      </View>
      <View style={styles.typeCardActions}>
        <Pressable
          style={styles.editBtn}
          onPress={() => {
            setEditingType(item);
            setShowForm(true);
          }}
        >
          <Text style={styles.editBtnText}>✏️</Text>
        </Pressable>
        <Pressable
          style={styles.deleteBtn}
          onPress={() => deleteType(activeSection, item[getIdField()])}
        >
          <Text style={styles.deleteBtnText}>×</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderTypesSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {activeSection === 'types_donnees' && '📊 Types de données'}
          {activeSection === 'types_consultations' && '🩺 Types de consultations'}
          {activeSection === 'types_examens' && '🔬 Types d\'examens'}
        </Text>
        <Pressable style={styles.addBtn} onPress={() => setShowForm(true)}>
          <Text style={styles.addBtnText}>+</Text>
        </Pressable>
      </View>

      {showForm && (
        <TypeForm
          section={activeSection}
          editingType={editingType}
          colors={colors}
          onSubmit={() => {
            setShowForm(false);
            setEditingType(null);
            loadTypes();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingType(null);
          }}
        />
      )}

      <FlatList
        data={getCurrentTypes()}
        keyExtractor={(item) => String(item[getIdField()])}
        renderItem={renderTypeCard}
        scrollEnabled={false}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucun type défini</Text>}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.title}>⚙️ Paramètres</Text>
          <Text style={styles.subtitle}>Configuration de l'application</Text>
        </View>

        {/* Menu de navigation */}
        <View style={styles.menuContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Pressable
              style={[styles.menuItem, activeSection === 'theme' && styles.activeMenuItem]}
              onPress={() => {
                setActiveSection('theme');
                setShowForm(false);
                setEditingType(null);
              }}
            >
              <Text style={[styles.menuText, activeSection === 'theme' && styles.activeMenuText]}>
                🎨 Thème
              </Text>
            </Pressable>
            <Pressable
              style={[styles.menuItem, activeSection === 'types_donnees' && styles.activeMenuItem]}
              onPress={() => {
                setActiveSection('types_donnees');
                setShowForm(false);
                setEditingType(null);
              }}
            >
              <Text style={[styles.menuText, activeSection === 'types_donnees' && styles.activeMenuText]}>
                📊 Données ({typesDonnees.length})
              </Text>
            </Pressable>
            <Pressable
              style={[styles.menuItem, activeSection === 'types_consultations' && styles.activeMenuItem]}
              onPress={() => {
                setActiveSection('types_consultations');
                setShowForm(false);
                setEditingType(null);
              }}
            >
              <Text style={[styles.menuText, activeSection === 'types_consultations' && styles.activeMenuText]}>
                🩺 Consultations ({typesConsultations.length})
              </Text>
            </Pressable>
            <Pressable
              style={[styles.menuItem, activeSection === 'types_examens' && styles.activeMenuItem]}
              onPress={() => {
                setActiveSection('types_examens');
                setShowForm(false);
                setEditingType(null);
              }}
            >
              <Text style={[styles.menuText, activeSection === 'types_examens' && styles.activeMenuText]}>
                🔬 Examens ({typesExamens.length})
              </Text>
            </Pressable>
          </ScrollView>
        </View>

        {/* Contenu */}
        {activeSection === 'theme' && renderThemeSection()}
        {activeSection !== 'theme' && renderTypesSection()}
      </ScrollView>
    </SafeAreaView>
  );
}

// Formulaire pour ajouter/modifier un type
function TypeForm({ section, editingType, colors, onSubmit, onCancel }: { 
  section: SettingsSection; 
  editingType?: any; 
  colors: any;
  onSubmit: () => void; 
  onCancel: () => void; 
}) {
  const [nomType, setNomType] = useState(editingType ? editingType.nom_type : '');
  const [description, setDescription] = useState(editingType ? editingType.description || '' : '');

  const styles = createStyles(colors);

  const handleSubmit = async () => {
    if (!nomType.trim()) {
      Alert.alert('Champ requis', 'Veuillez saisir le nom du type.');
      return;
    }

    const tables = {
      types_donnees: { table: 'types_donnees', idField: 'type_donnee_id' },
      types_consultations: { table: 'types_consultations', idField: 'type_consultation_id' },
      types_examens: { table: 'types_examens', idField: 'type_examen_id' }
    };

    try {
      const { table, idField } = tables[section as keyof typeof tables];
      
      if (editingType) {
        // Mode édition
        await run(`UPDATE ${table} SET nom_type=?, description=? WHERE ${idField}=?`, 
          [nomType.trim(), description.trim() || null, editingType[idField]]);
        Alert.alert('Succès', 'Type modifié avec succès');
      } else {
        // Mode création
        await run(`INSERT INTO ${table} (nom_type, description) VALUES (?, ?)`, 
          [nomType.trim(), description.trim() || null]);
        Alert.alert('Succès', 'Type ajouté avec succès');
      }
      onSubmit();
    } catch (error) {
      Alert.alert('Erreur', editingType ? 'Impossible de modifier le type' : 'Impossible d\'ajouter le type');
    }
  };

  const getCategoryLabel = () => {
    switch (section) {
      case 'types_donnees': return 'donnée sanitaire';
      case 'types_consultations': return 'consultation';
      case 'types_examens': return 'examen';
      default: return 'type';
    }
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>
        {editingType ? `Modifier le type de ${getCategoryLabel()}` : `Nouveau type de ${getCategoryLabel()}`}
      </Text>
      
      <TextInput
        style={styles.formInput}
        placeholder="Nom du type"
        placeholderTextColor={colors.textSecondary}
        value={nomType}
        onChangeText={setNomType}
      />
      
      <TextInput
        style={[styles.formInput, styles.textArea]}
        placeholder="Description (optionnelle)"
        placeholderTextColor={colors.textSecondary}
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
          <Text style={styles.submitBtnText}>{editingType ? 'Modifier' : 'Ajouter'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1 },
  
  // En-tête
  header: { backgroundColor: colors.surface, padding: 24, marginBottom: 16, borderRadius: 24, margin: 16, marginTop: 8, shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8, borderWidth: 1, borderColor: colors.border },
  title: { fontSize: 32, fontWeight: '900', color: colors.text, marginBottom: 4, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: colors.textSecondary, fontWeight: '600', opacity: 0.8 },
  
  // Menu
  menuContainer: { marginHorizontal: 16, marginBottom: 16 },
  menuItem: { backgroundColor: colors.surface, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 24, marginRight: 10, borderWidth: 1, borderColor: colors.border, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  activeMenuItem: { backgroundColor: colors.primary, borderColor: colors.primary, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },
  menuText: { fontSize: 14, fontWeight: '700', color: colors.textSecondary },
  activeMenuText: { color: '#ffffff', fontWeight: '800' },
  
  // Sections
  section: { backgroundColor: colors.surface, margin: 16, borderRadius: 20, padding: 24, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 6, borderWidth: 1, borderColor: colors.border },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  addBtn: { backgroundColor: colors.primary, width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  addBtnText: { color: '#ffffff', fontSize: 24, fontWeight: '700' },
  
  // Paramètre thème
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, marginBottom: 16 },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 },
  settingDescription: { fontSize: 14, color: colors.textSecondary },
  
  // Aperçu thème
  themePreview: { marginTop: 16 },
  previewTitle: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 12 },
  previewCard: { backgroundColor: colors.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border },
  previewHeader: { marginBottom: 12 },
  previewHeaderText: { fontSize: 16, fontWeight: '600', color: colors.text },
  previewText: { fontSize: 14, color: colors.text, marginBottom: 8 },
  previewSubText: { fontSize: 12, color: colors.textSecondary, marginBottom: 12 },
  previewButton: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, alignSelf: 'flex-start' },
  previewButtonText: { color: colors.surface, fontSize: 14, fontWeight: '600' },
  
  // Cards types
  typeCard: { backgroundColor: colors.card, borderRadius: 16, padding: 20, marginBottom: 14, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  typeCardContent: { flex: 1 },
  typeName: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 6, letterSpacing: -0.2 },
  typeDescription: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  typeCardActions: { flexDirection: 'row', gap: 8 },
  editBtn: { backgroundColor: colors.warning, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  editBtnText: { fontSize: 14 },
  deleteBtn: { backgroundColor: colors.error, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { color: colors.surface, fontSize: 18, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: colors.textSecondary, fontSize: 16, fontStyle: 'italic', marginTop: 20 },
  
  // Formulaires
  formContainer: { backgroundColor: colors.card, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  formTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 16, textAlign: 'center' },
  formInput: { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 16, color: colors.text, marginBottom: 12 },
  textArea: { height: 80, textAlignVertical: 'top' },
  
  // Form buttons
  formButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  formBtn: { flex: 1, paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, alignItems: 'center' },
  cancelBtn: { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 },
  cancelBtnText: { color: colors.textSecondary, fontWeight: '600', fontSize: 16 },
  submitBtn: { backgroundColor: colors.primary },
  submitBtnText: { color: colors.surface, fontWeight: '600', fontSize: 16 },
});
