import React, { useMemo, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TextInput, FlatList } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../services/translator';

const LanguagePickerModal = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const { currentLanguage, changeLanguage } = useLanguage();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return SUPPORTED_LANGUAGES;
    const q = query.toLowerCase();
    return SUPPORTED_LANGUAGES.filter(l => l.name.toLowerCase().includes(q) || l.code.toLowerCase().includes(q));
  }, [query]);

  const selectLanguage = async (code) => {
    await changeLanguage(code);
    onClose && onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}> 
          <Text style={[styles.title, { color: colors.text }]}>Select Language</Text>
          <View style={[styles.search, { backgroundColor: colors.background }]}> 
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search language"
              placeholderTextColor={colors.textSecondary}
              style={[styles.searchInput, { color: colors.text }]}
            />
          </View>
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.row} onPress={() => selectLanguage(item.code)}> 
                <Text style={[styles.langName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.langCode, { color: colors.textSecondary }]}>{item.code.toUpperCase()}</Text>
              </TouchableOpacity>
            )}
            style={{ maxHeight: 360 }}
          />
          <TouchableOpacity style={[styles.closeBtn, { backgroundColor: colors.primary }]} onPress={onClose}> 
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  sheet: {
    borderRadius: 16,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  search: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    fontSize: 14,
  },
  row: {
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)'
  },
  langName: { fontSize: 14, fontWeight: '600' },
  langCode: { fontSize: 12 },
  closeBtn: { marginTop: 12, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  closeText: { color: 'white', fontWeight: '700' },
});

export default LanguagePickerModal;


