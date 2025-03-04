import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import {
  TextInput,
  Button,
  Surface,
  Text,
  Menu,
  Portal,
  Dialog,
  IconButton,
} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import TextRecognition from 'react-native-text-recognition';
import DatePicker from 'react-native-date-picker';
import {colors} from '../../constants/colors';
import moment from 'moment';
import { addProduct } from '../../services/firestore';
import { validateProduct } from '../../utils/validation';
import ErrorMessage from '../../components/common/ErrorMessage';
import firestore from '@react-native-firebase/firestore';

const CATEGORIES = [
  'Dairy',
  'Meat',
  'Vegetables',
  'Fruits',
  'Beverages',
  'Snacks',
  'Canned Goods',
  'Medicine',
  'Cosmetics',
  'Other',
];

// Add units based on categories
const CATEGORY_UNITS = {
  'Dairy': ['L', 'ml', 'kg', 'g', 'pack'],
  'Meat': ['kg', 'g', 'pack', 'pieces'],
  'Vegetables': ['kg', 'g', 'pack', 'pieces'],
  'Fruits': ['kg', 'g', 'pack', 'pieces'],
  'Beverages': ['L', 'ml', 'pack', 'can', 'bottle'],
  'Snacks': ['g', 'pack', 'pieces'],
  'Canned Goods': ['g', 'can', 'pack'],
  'Medicine': ['tablets', 'pieces', 'bottle', 'pack'],
  'Cosmetics': ['ml', 'g', 'pieces', 'pack'],
  'Other': ['pieces', 'pack', 'kg', 'g', 'L', 'ml'],
};

const ProductInputScreen = ({route, navigation}) => {
  const {photoPath, userId} = route.params;
  const [loading, setLoading] = useState(true);
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  // const [showExpiredDialog, setShowExpiredDialog] = useState(false);
  const [showNoExpiryDialog, setShowNoExpiryDialog] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('');
  const [unitMenuVisible, setUnitMenuVisible] = useState(false);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    scanImage();
  }, [photoPath]);

  // Update unit when category changes
  useEffect(() => {
    if (category && CATEGORY_UNITS[category]) {
      setUnit(CATEGORY_UNITS[category][0]);
    }
  }, [category]);

  const scanImage = async () => {
    try {
      const result = await TextRecognition.recognize(photoPath);
      const text = result.join(' ');
      const extractedDate = extractExpiryDate(text);
      if (extractedDate) {
        setExpiryDate(extractedDate);
      } else {
        setShowNoExpiryDialog(true);
      }
    } catch (error) {
      console.error('Failed to scan image:', error);
      setShowNoExpiryDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const extractExpiryDate = text => {
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

          // Handle MM/YYYY format - now using last day of month
          if (dateStr.match(/^\d{1,2}[\/-]\d{4}$/)) {
            const [month, year] = dateStr.split(/[\/-]/);
            // Get last day of the month
            date = new Date(year, month, 0); // Setting day to 0 gets last day of previous month
          }
          // Handle text month format
          else if (
            dateStr.match(
              /\d{1,2}\s*(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{4}/i,
            )
          ) {
            const parts = dateStr.match(
              /(\d{1,2})\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(\d{4})/i,
            );
            const months = {
              jan: 0,
              feb: 1,
              mar: 2,
              apr: 3,
              may: 4,
              jun: 5,
              jul: 6,
              aug: 7,
              sep: 8,
              oct: 9,
              nov: 10,
              dec: 11,
            };
            date = new Date(parts[3], months[parts[2].toLowerCase()], parts[1]);
          }
          // Handle other formats
          else {
            date = new Date(dateStr.replace(/[\/-]/g, '/'));
          }

          // Check if date is valid but in the past
          if (date && !isNaN(date.getTime())) {
            if (date < new Date()) {
              setShowExpiredDialog(true);
            }
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

  const formatDateForDisplay = date => {
    // If it's the last day of a month, show only month and year
    if (
      date.getDate() ===
      new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    ) {
      return moment(date).format('MM/YYYY');
    }
    return moment(date).format('DD/MM/YYYY');
  };

  const validateAndShowUnitError = () => {
    if (!category) {
      setErrors(prev => ({
        ...prev,
        category: 'Please select a category first'
      }));
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!userId) {
      setErrors({ submit: 'User not authenticated' });
      return;
    }

    const productData = {
      userId,
      name: productName,
      category: category === 'Other' ? customCategory : category,
      quantity,
      unit,
      // Convert date to Firestore timestamp
      expiryDate: firestore.Timestamp.fromDate(expiryDate),
      notes,
      isExpired: false,
    };

    const { isValid, errors: validationErrors } = validateProduct(productData);

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    try {
      setSaving(true);
      await addProduct(productData);
      navigation.navigate('Home');
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleQuantityChange = (value) => {
    const newQuantity = parseInt(value);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      setQuantity(newQuantity);
    }
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
                  style={[
                    styles.input,
                    errors.category && styles.inputError
                  ]}>
                  {category || 'Select Category'}
                </Button>
              }>
              {CATEGORIES.map(cat => (
                <Menu.Item
                  key={cat}
                  onPress={() => {
                    if (cat === 'Other') {
                      setCustomCategory('');
                    }
                    setCategory(cat);
                    setMenuVisible(false);
                    // Clear the category error when a category is selected
                    setErrors(prev => ({ ...prev, category: undefined }));
                  }}
                  title={cat}
                />
              ))}
            </Menu>
            <ErrorMessage message={errors.category} />

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
              onChangeText={(text) => {
                setProductName(text);
                setErrors(prev => ({ ...prev, name: undefined }));
              }}
              style={[
                styles.input,
                errors.name && styles.inputError
              ]}
            />
            <ErrorMessage message={errors.name} />

            <View style={styles.quantityRow}>
              <View style={styles.quantityContainer}>
                <Text style={styles.label}>Quantity</Text>
                <View style={styles.quantityInput}>
                  <IconButton
                    icon="minus"
                    size={20}
                    onPress={() => quantity > 1 && setQuantity(quantity - 1)}
                  />
                  <TextInput
                    value={quantity.toString()}
                    onChangeText={handleQuantityChange}
                    keyboardType="numeric"
                    style={styles.quantityTextInput}
                  />
                  <IconButton
                    icon="plus"
                    size={20}
                    onPress={() => setQuantity(quantity + 1)}
                  />
                </View>
              </View>

              <View style={styles.unitContainer}>
                <Text style={styles.label}>Unit</Text>
                <Menu
                  visible={unitMenuVisible}
                  onDismiss={() => setUnitMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => {
                        if (validateAndShowUnitError()) {
                          setUnitMenuVisible(true);
                        }
                      }}
                      style={styles.unitButton}>
                      {unit || 'Select Unit'}
                    </Button>
                  }>
                  {category && CATEGORY_UNITS[category]?.map(unitOption => (
                    <Menu.Item
                      key={unitOption}
                      onPress={() => {
                        setUnit(unitOption);
                        setUnitMenuVisible(false);
                      }}
                      title={unitOption}
                    />
                  ))}
                </Menu>
              </View>
            </View>

            <Button
              mode="outlined"
              onPress={() => setShowDatePicker(true)}
              style={styles.input}>
              Expiry Date: {formatDateForDisplay(expiryDate)}
            </Button>

            <TextInput
              label="Additional Notes"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              style={[styles.input, {height:80}]}
            />

            <DatePicker
              modal
              open={showDatePicker}
              date={expiryDate}
              mode="date"
              minimumDate={new Date()}
              onConfirm={date => {
                setShowDatePicker(false);
                setExpiryDate(date);
              }}
              onCancel={() => {
                setShowDatePicker(false);
              }}
            />

            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.saveButton}
              loading={saving}
              disabled={saving}>
              Save Product
            </Button>

            {errors.submit && <ErrorMessage message={errors.submit} />}
          </Surface>
        </ScrollView>
      )}

      <Portal>
        <Dialog
          visible={showNoExpiryDialog}
          onDismiss={() => setShowNoExpiryDialog(false)}
          style={styles.dialog}>
          <Dialog.Title>No Expiry Date Found</Dialog.Title>
          <Dialog.Content>
            <Text>
              We couldn't find an expiry date in the scanned image. Would you
              like to try scanning again or enter the date manually?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setShowNoExpiryDialog(false);
                navigation.goBack();
              }}>
              Scan Again
            </Button>
            <Button
              onPress={() => {
                setShowNoExpiryDialog(false);
                setShowDatePicker(true);
              }}>
              Enter Manually
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  },
  dialog: {
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quantityContainer: {
    flex: 1,
    marginRight: 8,
  },
  unitContainer: {
    flex: 1,
    marginLeft: 8,
  },
  label: {
    fontSize: 12,
    color: colors.text,
    marginBottom: 4,
  },
  quantityInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.disabled,
    borderRadius: 4,
    paddingBottom: 4,
  },
  quantityTextInput: {
    flex: 1,
    textAlign: 'center',
    height: 40,
    padding: 0,
    backgroundColor: 'transparent',
    marginBottom: -4,
  },
  unitButton: {
    height: 40,
    justifyContent: 'center',
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 1,
  },
});

export default ProductInputScreen;
