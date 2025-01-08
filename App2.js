// App.js
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@saved_colors';

const App = () => {
  const [colorInput, setColorInput] = useState('');
  const [colorName, setColorName] = useState('');
  const [currentColor, setCurrentColor] = useState('#FFFFFF');
  const [savedColors, setSavedColors] = useState([]);

  useEffect(() => {
    loadSavedColors();
  }, []);

  const loadSavedColors = async () => {
    try {
      const colors = await AsyncStorage.getItem(STORAGE_KEY);
      if (colors) {
        setSavedColors(JSON.parse(colors));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load saved colors');
    }
  };

  const isValidHex = (color) => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  };

  const isValidRGB = (color) => {
    const rgbRegex = /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/;
    if (!rgbRegex.test(color)) return false;
    
    const [_, r, g, b] = color.match(rgbRegex);
    return [r, g, b].every(val => parseInt(val) >= 0 && parseInt(val) <= 255);
  };

  const rgbToHex = (rgb) => {
    const [_, r, g, b] = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    const toHex = (n) => parseInt(n).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const validateAndSetColor = (input) => {
    setColorInput(input);
    
    let formattedInput = input.trim();
    if (formattedInput.startsWith('rgb')) {
      if (isValidRGB(formattedInput)) {
        setCurrentColor(rgbToHex(formattedInput));
      }
    } else {
      if (!formattedInput.startsWith('#')) {
        formattedInput = '#' + formattedInput;
      }
      if (isValidHex(formattedInput)) {
        setCurrentColor(formattedInput);
      }
    }
  };

  const saveColor = async () => {
    if (!colorName.trim()) {
      Alert.alert('Error', 'Please enter a name for your color');
      return;
    }

    const newColor = {
      id: Date.now().toString(),
      name: colorName.trim(),
      value: currentColor,
    };

    try {
      const updatedColors = [...savedColors, newColor];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedColors));
      setSavedColors(updatedColors);
      setColorName('');
      setColorInput('');
      setCurrentColor('#FFFFFF');
      Alert.alert('Success', 'Color saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save color');
    }
  };

  const deleteColor = async (id) => {
    try {
      const updatedColors = savedColors.filter(color => color.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedColors));
      setSavedColors(updatedColors);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete color');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Color Saver</Text>
          
          <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={colorInput}
                onChangeText={validateAndSetColor}
                placeholder="Hex(#FF0000) or RGB(rgb(255,0,0))"
                placeholderTextColor="#999"
              />
            <View
                style={[styles.colorSwatch, { backgroundColor: currentColor }]}
            />
            
            <TextInput
              style={styles.input}
              value={colorName}
              onChangeText={setColorName}
              placeholder="Enter color name"
              placeholderTextColor="#999"
            />
            
            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveColor}
            >
              <Text style={styles.saveButtonText}>Save Color</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.savedColorsContainer}>
            <Text style={styles.subtitle}>Saved Colors</Text>
            {savedColors.map(color => (
              <View key={color.id} style={styles.savedColorItem}>
                <View style={styles.savedColorInfo}>
                  <Text style={styles.colorName}>{color.name}</Text>
                  <Text style={styles.colorValue}>{color.value}</Text>
                </View>
                <View style={styles.savedColorSwatch}>
                  <View
                    style={[styles.savedSwatch, { backgroundColor: color.value }]}
                  />
                  <TouchableOpacity
                    onPress={() => deleteColor(color.id)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  colorInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  colorSwatch: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  savedColorsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  savedColorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  savedColorInfo: {
    flex: 1,
  },
  colorName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  colorValue: {
    fontSize: 14,
    color: '#666',
  },
  savedColorSwatch: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savedSwatch: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 6,
    padding: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default App;