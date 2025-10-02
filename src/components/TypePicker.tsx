import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal, FlatList } from 'react-native';

interface TypePickerProps {
  label: string;
  value: number | null;
  items: Array<{ id: number; nom_type: string; description?: string }>;
  onValueChange: (value: number) => void;
  placeholder?: string;
  icon?: string;
}

export default function TypePicker({ 
  label, 
  value, 
  items, 
  onValueChange, 
  placeholder = 'Sélectionner...',
  icon = '📋'
}: TypePickerProps) {
  const [modalVisible, setModalVisible] = React.useState(false);
  
  const selectedItem = items.find(item => item.id === value);
  const displayText = selectedItem ? selectedItem.nom_type : placeholder;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <Pressable 
        style={styles.selector}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.selectorContent}>
          <Text style={styles.icon}>{icon}</Text>
          <View style={styles.textContainer}>
            <Text style={[styles.selectorText, !selectedItem && styles.placeholderText]}>
              {displayText}
            </Text>
            {selectedItem?.description && (
              <Text style={styles.descriptionText} numberOfLines={1}>
                {selectedItem.description}
              </Text>
            )}
          </View>
        </View>
        <Text style={styles.arrow}>▼</Text>
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <Pressable 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            <FlatList
              data={items}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.modalItem,
                    value === item.id && styles.modalItemSelected
                  ]}
                  onPress={() => {
                    onValueChange(item.id);
                    setModalVisible(false);
                  }}
                >
                  <View style={styles.modalItemContent}>
                    <Text style={[
                      styles.modalItemText,
                      value === item.id && styles.modalItemTextSelected
                    ]}>
                      {item.nom_type}
                    </Text>
                    {item.description && (
                      <Text style={[
                        styles.modalItemDescription,
                        value === item.id && styles.modalItemDescriptionSelected
                      ]}>
                        {item.description}
                      </Text>
                    )}
                  </View>
                  {value === item.id && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </Pressable>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    fontWeight: '600',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    minHeight: 56,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  selectorText: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '600',
  },
  placeholderText: {
    color: '#94a3b8',
    fontWeight: '500',
  },
  descriptionText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  arrow: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 8,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingHorizontal: 20,
  },
  modalItemSelected: {
    backgroundColor: '#eff6ff',
  },
  modalItemContent: {
    flex: 1,
  },
  modalItemText: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '600',
  },
  modalItemTextSelected: {
    color: '#6366f1',
    fontWeight: '700',
  },
  modalItemDescription: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  modalItemDescriptionSelected: {
    color: '#818cf8',
  },
  checkmark: {
    fontSize: 20,
    color: '#6366f1',
    fontWeight: 'bold',
    marginLeft: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginHorizontal: 20,
  },
});
