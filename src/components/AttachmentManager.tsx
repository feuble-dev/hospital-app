import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Alert, TextInput, Image, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { query, run } from '../db';

interface Attachment {
  piece_id: number;
  fichier_url: string;
  description: string;
  date_ajout: string;
}

interface AttachmentManagerProps {
  cibleType: 'donnee' | 'consultation' | 'examen';
  cibleId: number;
}

export default function AttachmentManager({ cibleType, cibleId }: AttachmentManagerProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'donnee': return 'Donnée sanitaire';
      case 'consultation': return 'Consultation';
      case 'examen': return 'Examen';
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'donnee': return '📊';
      case 'consultation': return '🩺';
      case 'examen': return '🔬';
      default: return '📎';
    }
  };

  const loadAttachments = async () => {
    try {
      const result = await query<Attachment>(
        'SELECT * FROM pieces_jointes WHERE cible_type = ? AND cible_id = ? ORDER BY date_ajout DESC',
        [cibleType, cibleId]
      );
      setAttachments(result);
    } catch (error) {
      console.log('Erreur chargement pièces jointes:', error);
    }
  };

  useEffect(() => {
    loadAttachments();
  }, [cibleType, cibleId]);

  const deleteAttachment = async (pieceId: number) => {
    Alert.alert(
      'Confirmation',
      'Supprimer cette pièce jointe ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await run('DELETE FROM pieces_jointes WHERE piece_id = ?', [pieceId]);
              await loadAttachments();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer la pièce jointe');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.typeIcon}>{getTypeIcon(cibleType)}</Text>
          <View>
            <Text style={styles.title}>Pièces jointes ({attachments.length})</Text>
            <Text style={styles.subtitle}>{getTypeLabel(cibleType)} #{cibleId}</Text>
          </View>
        </View>
        <Pressable style={styles.addBtn} onPress={() => setShowAddForm(true)}>
          <Text style={styles.addBtnText}>+</Text>
        </Pressable>
      </View>

      {showAddForm && (
        <AttachmentForm
          cibleType={cibleType}
          cibleId={cibleId}
          onSubmit={() => {
            setShowAddForm(false);
            loadAttachments();
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <FlatList
        data={attachments}
        keyExtractor={(item) => String(item.piece_id)}
        renderItem={({ item }) => {
          const isImage = item.fichier_url.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i);
          return (
            <View style={styles.attachmentCard}>
              <Pressable 
                style={styles.attachmentInfo}
                onPress={() => {
                  if (isImage) {
                    // Ouvrir l'image en plein écran
                    Alert.alert('Image', 'Fonctionnalité de visualisation à implémenter');
                  } else {
                    Alert.alert('Document', 'Fonctionnalité d\'ouverture de document à implémenter');
                  }
                }}
              >
                <View style={styles.attachmentHeader}>
                  <Text style={styles.fileTypeIcon}>
                    {isImage ? '🖼️' : '📄'}
                  </Text>
                  <View style={styles.attachmentDetails}>
                    <Text style={styles.attachmentName}>{item.description}</Text>
                    <Text style={styles.attachmentDate}>
                      Ajouté le {new Date(item.date_ajout).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                </View>
                {isImage && (
                  <Image 
                    source={{ uri: item.fichier_url }} 
                    style={styles.attachmentImagePreview}
                    resizeMode="cover"
                  />
                )}
                <Text style={styles.viewFileText}>👁️ Appuyer pour voir</Text>
              </Pressable>
              <Pressable
                style={styles.deleteBtn}
                onPress={() => deleteAttachment(item.piece_id)}
              >
                <Text style={styles.deleteBtnText}>×</Text>
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucune pièce jointe</Text>
        }
        scrollEnabled={false}
      />
    </View>
  );
}

function AttachmentForm({ cibleType, cibleId, onSubmit, onCancel }: {
  cibleType: string;
  cibleId: number;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const [description, setDescription] = useState('');
  const [fichierUrl, setFichierUrl] = useState('');
  const [fileType, setFileType] = useState('');
  const [showImagePreview, setShowImagePreview] = useState(false);

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission requise', 'L\'accès à la caméra est nécessaire pour prendre une photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'Images' as any,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFichierUrl(result.assets[0].uri);
        setFileType('image');
        if (!description.trim()) {
          setDescription('Photo prise le ' + new Date().toLocaleDateString('fr-FR'));
        }
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de prendre la photo');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setFichierUrl(result.assets[0].uri);
        setFileType(result.assets[0].mimeType?.startsWith('image/') ? 'image' : 'document');
        if (!description.trim()) {
          setDescription(result.assets[0].name || 'Document sélectionné');
        }
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sélectionner le fichier');
    }
  };

  const handleSubmit = async () => {
    if (!description.trim() || !fichierUrl.trim()) {
      Alert.alert('Champs requis', 'Veuillez ajouter une description et sélectionner un fichier.');
      return;
    }

    try {
      await run(
        'INSERT INTO pieces_jointes (cible_type, cible_id, fichier_url, description) VALUES (?, ?, ?, ?)',
        [cibleType, cibleId, fichierUrl.trim(), description.trim()]
      );
      onSubmit();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter la pièce jointe');
    }
  };

  return (
    <>
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Nouvelle pièce jointe</Text>
        
        {/* Boutons d'action */}
        <View style={styles.actionButtons}>
          <Pressable style={styles.actionBtn} onPress={takePhoto}>
            <Text style={styles.actionBtnIcon}>📷</Text>
            <Text style={styles.actionBtnText}>Prendre une photo</Text>
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={pickDocument}>
            <Text style={styles.actionBtnIcon}>📁</Text>
            <Text style={styles.actionBtnText}>Choisir un fichier</Text>
          </Pressable>
        </View>

        {/* Aperçu du fichier sélectionné */}
        {fichierUrl ? (
          <View style={styles.previewContainer}>
            <Text style={styles.previewLabel}>Fichier sélectionné :</Text>
            {fileType === 'image' ? (
              <Pressable onPress={() => setShowImagePreview(true)}>
                <Image source={{ uri: fichierUrl }} style={styles.imagePreview} />
                <Text style={styles.previewText}>👁️ Appuyer pour agrandir</Text>
              </Pressable>
            ) : (
              <View style={styles.documentPreview}>
                <Text style={styles.documentIcon}>📄</Text>
                <Text style={styles.documentName}>{description}</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.noFileContainer}>
            <Text style={styles.noFileText}>Aucun fichier sélectionné</Text>
            <Text style={styles.noFileSubtext}>Utilisez les boutons ci-dessus pour ajouter une photo ou un document</Text>
          </View>
        )}

        <TextInput
          style={styles.formInput}
          placeholder="Description du fichier"
          placeholderTextColor="#9ca3af"
          value={description}
          onChangeText={setDescription}
        />

        <View style={styles.formButtons}>
          <Pressable style={[styles.formBtn, styles.cancelBtn]} onPress={onCancel}>
            <Text style={styles.cancelBtnText}>Annuler</Text>
          </Pressable>
          <Pressable 
            style={[styles.formBtn, styles.submitBtn, !fichierUrl && styles.submitBtnDisabled]} 
            onPress={handleSubmit}
            disabled={!fichierUrl}
          >
            <Text style={[styles.submitBtnText, !fichierUrl && styles.submitBtnTextDisabled]}>
              Ajouter
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Modal d'aperçu d'image */}
      <Modal visible={showImagePreview} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Pressable style={styles.closeButton} onPress={() => setShowImagePreview(false)}>
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
            {fichierUrl && (
              <Image source={{ uri: fichierUrl }} style={styles.fullImage} resizeMode="contain" />
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { 
    marginTop: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12
  },
  typeIcon: {
    fontSize: 24,
    textAlign: 'center'
  },
  title: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#1e293b'
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 2
  },
  addBtn: { 
    backgroundColor: '#3b82f6', 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4
  },
  addBtnText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  attachmentCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  attachmentInfo: { 
    flex: 1 
  },
  attachmentName: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: '#1e293b',
    marginBottom: 4
  },
  attachmentDate: { 
    fontSize: 13, 
    color: '#64748b', 
    marginBottom: 2,
    fontWeight: '500'
  },
  attachmentPath: { 
    fontSize: 12, 
    color: '#94a3b8', 
    fontStyle: 'italic',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start'
  },
  deleteBtn: {
    backgroundColor: '#ef4444',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4
  },
  deleteBtnText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  emptyText: { 
    textAlign: 'center', 
    color: '#94a3b8', 
    fontSize: 14, 
    fontStyle: 'italic', 
    paddingVertical: 24,
    fontWeight: '500'
  },
  formContainer: { 
    backgroundColor: '#ffffff', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 12, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  formTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#1e293b', 
    marginBottom: 16 
  },
  formInput: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    color: '#1e293b',
    fontSize: 16,
    fontWeight: '500'
  },
  note: { 
    fontSize: 13, 
    color: '#f59e0b', 
    fontStyle: 'italic', 
    marginBottom: 16,
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fde68a',
    textAlign: 'center'
  },
  formButtons: { 
    flexDirection: 'row', 
    gap: 12 
  },
  formBtn: { 
    flex: 1, 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  cancelBtn: { 
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  cancelBtnText: { 
    color: '#64748b', 
    fontWeight: '600', 
    fontSize: 16 
  },
  submitBtn: { 
    backgroundColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4
  },
  submitBtnText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 16 
  },
  
  // Nouveaux styles pour les pièces jointes améliorées
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  actionBtnIcon: {
    fontSize: 24,
    marginBottom: 8
  },
  actionBtnText: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
    textAlign: 'center'
  },
  previewContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  previewLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 12
  },
  imagePreview: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: '#f1f5f9'
  },
  previewText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic'
  },
  documentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  documentIcon: {
    fontSize: 24,
    marginRight: 12
  },
  documentName: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
    flex: 1
  },
  noFileContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed'
  },
  noFileText: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '600',
    marginBottom: 4
  },
  noFileSubtext: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18
  },
  submitBtnDisabled: {
    backgroundColor: '#e2e8f0',
    shadowOpacity: 0
  },
  submitBtnTextDisabled: {
    color: '#94a3b8'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    maxWidth: '90%',
    maxHeight: '80%',
    position: 'relative'
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ef4444',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  fullImage: {
    width: 300,
    height: 400,
    borderRadius: 8
  },
  
  // Styles pour l'affichage amélioré des pièces jointes
  attachmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  fileTypeIcon: {
    fontSize: 20,
    marginRight: 12
  },
  attachmentDetails: {
    flex: 1
  },
  attachmentImagePreview: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f1f5f9'
  },
  viewFileText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
    textAlign: 'center',
    fontStyle: 'italic'
  }
});
