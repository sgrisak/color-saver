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
import ColorPicker from 'react-native-wheel-color-picker';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

const STORAGE_KEY = '@saved_colors';
import colorData from './colors.json';

const App = () => {
  const [currentColor, setCurrentColor] = useState('#FFFFFF');
  const [colorName, setColorName] = useState('');
  const [savedColors, setSavedColors] = useState([]);
  const [colorDatabase, setColorDatabase] = useState([]);

  useEffect(() => {
    loadSavedColors();
    loadColorDatabase();
  }, []);

  useEffect(() => {
    checkColorMatch();
  }, [currentColor]);

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

  const loadColorDatabase = () => {
    setColorDatabase(colorData.colors);
  };

  const rgbToHex = (r, g, b) => {
    const toHex = (n) => {
      const hex = Math.round(n).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const checkColorMatch = () => {
    const matchedColor = colorDatabase.find(color => 
      color.hex.toLowerCase() === currentColor.toLowerCase()
    );
    
    if (matchedColor) {
      setColorName(matchedColor.name);
    }
  };

  const getCurrentColor = () => {
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  };

  const saveColor = async () => {
    if (!colorName.trim()) {
      Alert.alert('Error', 'Please enter a name for your color');
      return;
    }

    const newColor = {
      id: Date.now().toString(),
      name: colorName.trim(),
      value: currentColor
    };

    try {
      const updatedColors = [...savedColors, newColor];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedColors));
      setSavedColors(updatedColors);
      setColorName('');
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

  const ColorSlider = ({ value, onValueChange, color }) => (
    <View style={styles.sliderContainer}>
      <MaterialCommunityIcons 
        name="circle" 
        size={24} 
        color={`rgb(${color === 'r' ? 255 : 0},${color === 'g' ? 255 : 0},${color === 'b' ? 255 : 0})`}
      />
      <Slider
        value={value}
        onValueChange={onValueChange}
        minimumValue={0}
        maximumValue={255}
        step={1}
        containerStyle={styles.slider}
        thumbTintColor={`rgb(${color === 'r' ? 255 : 0},${color === 'g' ? 255 : 0},${color === 'b' ? 255 : 0})`}
        minimumTrackTintColor={`rgb(${color === 'r' ? 255 : 0},${color === 'g' ? 255 : 0},${color === 'b' ? 255 : 0})`}
      />
      <Text style={styles.sliderValue}>{Math.round(value)}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>
            <MaterialIcons name="color-lens" size={32} color="#333" /> Color Saver
          </Text>
          
          <View style={styles.inputContainer}>
            <View style={styles.pickerContainer}>
              <ColorPicker
                color={currentColor}
                onColorChange={color => setCurrentColor(color)}
                thumbSize={30}
                sliderSize={30}
                noSnap={true}
                row={false}
                swatchesOnly={false}
                discrete={false}
                sliderHidden={false}
              />
            </View>
            
            <View style={styles.colorInfo}>
              <View style={[styles.previewBox, { backgroundColor: currentColor }]} />
              <Text style={styles.colorValue}>{currentColor}</Text>
            </View>
            
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
              <MaterialIcons name="save" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Save Color</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.savedColorsContainer}>
            <Text style={styles.subtitle}>
              <MaterialIcons name="palette" size={24} color="#333" /> Saved Colors
            </Text>
            {savedColors.map(color => (
              <View key={color.id} style={styles.savedColorItem}>
                <View style={styles.savedColorInfo}>
                  <Text style={styles.colorName}>{color.name}</Text>
                  <Text style={styles.colorValue}>{color.value}</Text>
                </View>
                <View style={styles.savedColorPreview}>
                  <View
                    style={[styles.colorSwatch, { backgroundColor: color.value }]}
                  />
                  <TouchableOpacity
                    onPress={() => deleteColor(color.id)}
                    style={styles.deleteButton}
                  >
                    <MaterialIcons name="delete" size={16} color="#fff" />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  colorPreview: {
    alignItems: 'center',
    marginBottom: 20,
  },
  previewBox: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  hexValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  slidersContainer: {
    marginBottom: 20,
  },
  pickerContainer: {
    height: 300,  // Increased height
    marginBottom: 20,
    paddingTop: 20,  // Added top padding
  },
  colorInfo: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  input: {
    width: '100%',
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
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 18,
    fontWeight: 600,
    color: '#666',
  },
  savedColorPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 6,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default App;