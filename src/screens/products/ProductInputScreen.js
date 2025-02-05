import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { 
  TextInput, 
  Button, 
  Surface, 
  Text,
  Menu,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import TextRecognition from 'react-native-text-recognition';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../../constants/colors';
import moment from 'moment';

const CATEGORIES = [
  'Dairy',
  'Meat',
  'Vegetables',
  'Fruits',
  'Beverages',
  'Snacks',
  'Canned Goods',
  'Other'
];

const ProductInputScreen = ({ route, navigation }) => {
  const { photoPath } = route.params;
  const [loading, setLoading] = useState(true);
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    scanImage();
  }, [photoPath]);

  const scanImage = async () => {
    try {
      const result = await TextRecognition.recognize(photoPath);
      const text = result.join(' ');
      const extractedDate = extractExpiryDate(text);
      if (extractedDate) {
        setExpiryDate(extractedDate);
      }
    } catch (error) {
      console.error('Failed to scan image:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractExpiryDate = (text) => {
    // Common date formats and phrases
    const datePatterns = [
      // DD/MM/YYYY or DD-MM-YYYY
      /(?:exp(?:iry)?|best before|use by|valid until|bb|exp\.?|use before)(?:\s*date)?[\s:\.]+(\d{1,2}[\/-]\d{1,2}[\/-]\d{4})/gi,
      
      // MM/YYYY or MM-YYYY
      /(?:exp(?:iry)?|best before|use by|valid until|bb|exp\.?|use before)(?:\s*date)?[\s:\.]+(\d{1,2}[\/-]\d{4})/gi,
      
      // YYYY/MM/DD or YYYY-MM-DD
      /(?:exp(?:iry)?|best before|use by|valid until|bb|exp\.?|use before)(?:\s*date)?[\s:\.]+(\d{4}[\/-]\d{1,2}[\/-]\d{1,2})/gi,
      
      // Dates without keywords
      /(\d{1,2}[\/-]\d{1,2}[\/-]\d{4})/g,
      /(\d{4}[\/-]\d{1,2}[\/-]\d{1,2})/g,
      /(\d{1,2}[\/-]\d{4})/g,
      
      // Text month formats
      /(?:exp(?:iry)?|best before|use by|valid until|bb|exp\.?|use before)(?:\s*date)?[\s:\.]+(\d{1,2}\s*(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{4})/gi,
      
      // End of month formats
      /(?:exp(?:iry)?|best before|use by|valid until|bb|exp\.?|use before)(?:\s*date)?[\s:\.]+(?:end of)\s*(\d{1,2}[\/-]\d{4})/gi,
    ];

    const foundDates = [];

    for (const pattern of datePatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match && match[1]) {
          const dateStr = match[1].toLowerCase();
          let date = null;
          
          // Handle MM/YYYY format
          if (dateStr.match(/^\d{1,2}[\/-]\d{4}$/)) {
            const [month, year] = dateStr.split(/[\/-]/);
            date = new Date(year, month - 1, 1); // First day of the month
          }
          // Handle text month format
          else if (dateStr.match(/\d{1,2}\s*(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{4}/i)) {
            const parts = dateStr.match(/(\d{1,2})\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(\d{4})/i);
            const months = {
              jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
              jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
            };
            date = new Date(parts[3], months[parts[2].toLowerCase()], parts[1]);
          }
          // Handle other formats
          else {
            date = new Date(dateStr.replace(/[\/-]/g, '/'));
          }

          // Only add valid dates that are not in the past
          if (date && !isNaN(date.getTime()) && date > new Date()) {
            foundDates.push(date);
          }
        }
      }
    }

    if (foundDates.length === 0) {
      return null;
    }

    // If multiple dates found, return the latest one
    if (foundDates.length > 1) {
      return new Date(Math.max(...foundDates));
    }

    // If only one date found, return that
    return foundDates[0];
  };

  const handleSave = () => {
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Scanning expiry date...</Text>
        </View>
      ) : (
        <ScrollView>
          <Surface style={styles.form}>
            <Text variant="titleMedium" style={styles.title}>
              Add Product Details
            </Text>

            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setMenuVisible(true)}
                  style={styles.input}
                >
                  {category || 'Select Category'}
                </Button>
              }
            >
              {CATEGORIES.map((cat) => (
                <Menu.Item
                  key={cat}
                  onPress={() => {
                    setCategory(cat);
                    setMenuVisible(false);
                  }}
                  title={cat}
                />
              ))}
            </Menu>

            {category === 'Other' && (
              <TextInput
                label="Custom Category"
                value={customCategory}
                onChangeText={setCustomCategory}
                style={styles.input}
              />
            )}

            <TextInput
              label="Product Name"
              value={productName}
              onChangeText={setProductName}
              style={styles.input}
            />

            <Button
              mode="outlined"
              onPress={() => setShowDatePicker(true)}
              style={styles.input}
            >
              Expiry Date: {expiryDate.toLocaleDateString()}
            </Button>

            {showDatePicker && (
              <DateTimePicker
                value={expiryDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setExpiryDate(selectedDate);
                  }
                }}
              />
            )}

            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.saveButton}
            >
              Save Product
            </Button>
          </Surface>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  form: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 8,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: colors.disabled,
  }
});

export default ProductInputScreen; 