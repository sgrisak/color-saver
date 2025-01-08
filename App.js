import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const isValidHex = (color) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
const isValidRGB = (color) => 
  /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/.test(color);

const ColorSaver = () => {
  const [colorInput, setColorInput] = useState('');
  const [colorName, setColorName] = useState('');
  const [savedColors, setSavedColors] = useState([]);

  useEffect(() => {
    loadSavedColors();
  }, []);

  const loadSavedColors = async () => {
    try {
      const colors = await AsyncStorage.getItem('savedColors');
      if (colors) {
        setSavedColors(JSON.parse(colors));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load saved colors');
    }
  };

  const saveColor = async () => {
    if (!colorInput || !colorName) {
      Alert.alert('Error', 'Please enter both color value and name');
      return;
    }

    const color = colorInput.toLowerCase();
    if (!isValidHex(color) && !isValidRGB(color)) {
      Alert.alert('Error', 'Please enter a valid hex (#RRGGBB) or RGB color');
      return;
    }

    try {
      const newColor = { id: Date.now().toString(), name: colorName, value: color };
      const updatedColors = [...savedColors, newColor];
      await AsyncStorage.setItem('savedColors', JSON.stringify(updatedColors));
      setSavedColors(updatedColors);
      setColorInput('');
      setColorName('');
    } catch (error) {
      Alert.alert('Error', 'Failed to save color');
    }
  };

  const deleteColor = async (id) => {
    try {
      const updatedColors = savedColors.filter(color => color.id !== id);
      await AsyncStorage.setItem('savedColors', JSON.stringify(updatedColors));
      setSavedColors(updatedColors);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete color');
    }
  };

  const renderColorItem = ({ item }) => (
    <View style={styles.colorItem}>
      <View style={[styles.colorSwatch, { backgroundColor: item.value }]} />
      <View style={styles.colorInfo}>
        <Text style={styles.colorName}>{item.name}</Text>
        <Text style={styles.colorValue}>{item.value}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteColor(item.id)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter #FF0000 or rgb(255,0,0)"
          value={colorInput}
          onChangeText={setColorInput}
        />
        <View 
          style={[
            styles.colorPreview, 
            { backgroundColor: isValidHex(colorInput) || isValidRGB(colorInput) ? colorInput : '#FFF' }
          ]} 
        />
      </View>
      <TextInput
        style={styles.input}
        placeholder="Enter color name"
        value={colorName}
        onChangeText={setColorName}
      />
      <TouchableOpacity style={styles.saveButton} onPress={saveColor}>
        <Text style={styles.saveButtonText}>Save Color</Text>
      </TouchableOpacity>
      <FlatList
        data={savedColors}
        renderItem={renderColorItem}
        keyExtractor={item => item.id}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 70,
    backgroundColor: '#F5F5F5',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 40,
    maxHeight: 40,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  colorPreview: {
    width: 40,
    height: 40,
    marginLeft: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  colorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  colorSwatch: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  colorInfo: {
    flex: 1,
  },
  colorName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  colorValue: {
    fontSize: 14,
    color: '#666666',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
});

export default ColorSaver;
