import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
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
  Appbar,
} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import TextRecognition from 'react-native-text-recognition';
import DatePicker from 'react-native-date-picker';
import {colors} from '../../constants/colors';
import moment from 'moment';
import {addProduct} from '../../services/firestore';
import {validateProduct} from '../../utils/validation';
import ErrorMessage from '../../components/common/ErrorMessage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';

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
  Dairy: ['L', 'ml', 'kg', 'g', 'pack'],
  Meat: ['kg', 'g', 'pack', 'pieces'],
  Vegetables: ['kg', 'g', 'pack', 'pieces'],
  Fruits: ['kg', 'g', 'pack', 'pieces'],
  Beverages: ['L', 'ml', 'pack', 'can', 'bottle'],
  Snacks: ['g', 'pack', 'pieces'],
  'Canned Goods': ['g', 'can', 'pack'],
  Medicine: ['tablets', 'pieces', 'bottle', 'pack'],
  Cosmetics: ['ml', 'g', 'pieces', 'pack'],
  Other: ['pieces', 'pack', 'kg', 'g', 'L', 'ml'],
};

const REMINDER_OPTIONS = [
  {label: '1 day', value: 1},
  {label: '3 days', value: 3},
  {label: '7 days (1 week)', value: 7},
  {label: '14 days (2 weeks)', value: 14},
  {label: '30 days (1 month)', value: 30},
  {label: '90 days (3 months)', value: 90},
  {label: 'Custom', value: 'custom'},
];

const ProductInputScreen = ({route, navigation}) => {
  const {photoPath, userId, product, isEditing} = route.params;
  const tabBarHeight = useBottomTabBarHeight();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(isEditing ? product.name : '');
  const [barcode, setBarcode] = useState(isEditing ? product.barcode : '');
  const [category, setCategory] = useState(
    isEditing ? (product.isCustomCategory ? 'Other' : product.category) : '',
  );
  const [customCategory, setCustomCategory] = useState(
    isEditing && product.isCustomCategory ? product.customCategory : '',
  );
  const [expiryDate, setExpiryDate] = useState(() => {
    if (isEditing && product.expiryDate) {
      // Handle both Firestore Timestamp and regular Date objects
      return product.expiryDate.toDate
        ? new Date(product.expiryDate.toDate())
        : new Date(product.expiryDate);
    }
    return new Date();
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showNoExpiryDialog, setShowNoExpiryDialog] = useState(false);
  const [quantity, setQuantity] = useState(
    isEditing ? product.quantity.toString() : '1',
  );
  const [unit, setUnit] = useState(isEditing ? product.unit : '');
  const [unitMenuVisible, setUnitMenuVisible] = useState(false);
  const [notes, setNotes] = useState(isEditing ? product.notes : '');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Initialize reminder states based on editing mode
  const initialReminderDays = isEditing ? product.reminderDays : 7;
  const [reminderDays, setReminderDays] = useState(initialReminderDays);
  const [customReminderDays, setCustomReminderDays] = useState(
    initialReminderDays.toString(),
  );
  const [showReminderMenu, setShowReminderMenu] = useState(false);
  const [isCustomReminder, setIsCustomReminder] = useState(
    isEditing
      ? !REMINDER_OPTIONS.some(option => option.value === product.reminderDays)
      : false,
  );

  const scanImage = useCallback(async () => {
    try {
      setIsScanning(true);
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
      setIsScanning(false);
      setLoading(false);
    }
  }, [photoPath, setExpiryDate, setShowNoExpiryDialog]);

  useEffect(() => {
    if (photoPath && !isEditing) {
      scanImage();
    }
  }, [photoPath, isEditing, scanImage]);

  // Update unit when category changes
  useEffect(() => {
    if (category) {
      // Only set the default unit if there isn't already a valid unit for this category
      const currentUnitIsValid =
        unit && CATEGORY_UNITS[category]?.includes(unit);
      if (!currentUnitIsValid) {
        // Set default unit for the category
        if (CATEGORY_UNITS[category]) {
          setUnit(CATEGORY_UNITS[category][0]);
        } else {
          setUnit('');
        }
      }
    } else {
      // Clear unit if no category is selected
      setUnit('');
    }
  }, [category, unit]);

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
              console.warn('Expiry date is in the past');
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
        category: 'Please select a category first',
      }));
      return false;
    }
    if (!CATEGORY_UNITS[category]) {
      setErrors(prev => ({
        ...prev,
        category: 'Selected category has no valid units',
      }));
      return false;
    }
    return true;
  };

  const handleReminderSelect = value => {
    if (value === 'custom') {
      setIsCustomReminder(true);
      setCustomReminderDays(reminderDays.toString());
    } else {
      setIsCustomReminder(false);
      setReminderDays(value);
    }
    setShowReminderMenu(false);
  };

  const handleCustomReminderChange = text => {
    const numValue = parseInt(text);
    if (text === '' || (numValue > 0 && numValue <= 365)) {
      setCustomReminderDays(text);
      if (text !== '') {
        setReminderDays(numValue);
      }
    }
  };

  const getReminderDisplayText = () => {
    if (isCustomReminder) {
      return `Custom (${reminderDays} ${reminderDays === 1 ? 'day' : 'days'})`;
    }
    return (
      REMINDER_OPTIONS.find(option => option.value === reminderDays)?.label ||
      'Select reminder'
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a product name');
      return;
    }

    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    if (!unit) {
      Alert.alert('Error', 'Please select a unit');
      return;
    }

    if (category === 'Other' && !customCategory.trim()) {
      Alert.alert('Error', 'Please enter a custom category');
      return;
    }

    try {
      setLoading(true);
      const productData = {
        name: name.trim(),
        barcode: barcode || '',
        category: category === 'Other' ? 'Other' : category,
        customCategory: category === 'Other' ? customCategory.trim() : '',
        quantity: parseInt(quantity) || 1,
        unit: unit,
        expiryDate: firestore.Timestamp.fromDate(expiryDate || new Date()),
        notes: notes || '',
        reminderDays: reminderDays,
        updatedAt: firestore.Timestamp.now(),
        isCustomCategory: category === 'Other',
      };

      if (isEditing) {
        await firestore()
          .collection('products')
          .doc(product.id)
          .update(productData);
      } else {
        const currentUser = auth().currentUser;
        if (!currentUser) {
          throw new Error('User not authenticated');
        }

        await firestore()
          .collection('products')
          .add({
            ...productData,
            userId: currentUser.uid,
            createdAt: firestore.Timestamp.now(),
          });
      }

      navigation.navigate('HomeScreen');
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert('Error', 'Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = value => {
    // Allow empty value while typing
    if (value === '') {
      setQuantity('');
      return;
    }

    const numValue = parseInt(value);
    // Only update if it's a valid number
    if (!isNaN(numValue)) {
      setQuantity(value);
    }
  };

  const handleQuantityBlur = () => {
    // When focus is lost, ensure quantity is valid
    const numValue = parseInt(quantity);
    if (quantity === '' || isNaN(numValue) || numValue <= 0) {
      setQuantity('1');
    }
  };

  const incrementQuantity = () => {
    const newQuantity = parseInt(quantity) || 0;
    setQuantity((newQuantity + 1).toString());
  };

  const decrementQuantity = () => {
    const newQuantity = parseInt(quantity) || 0;
    if (newQuantity > 1) {
      setQuantity((newQuantity - 1).toString());
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={{backgroundColor: colors.background}}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content
          title={isEditing ? 'Edit Product' : 'Add Product'}
          color={colors.text}
        />
      </Appbar.Header>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            {isScanning ? 'Scanning expiry date...' : 'Saving product...'}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{paddingBottom: tabBarHeight + 20}}>
          <Surface style={styles.form}>
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Basic Information
              </Text>

              <TextInput
                label="Product Name"
                value={name}
                onChangeText={text => {
                  setName(text);
                  setErrors(prev => ({...prev, name: undefined}));
                }}
                style={[styles.input, errors.name && styles.inputError]}
              />
              <ErrorMessage message={errors.name} />

              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setMenuVisible(true)}
                    style={[
                      styles.input,
                      errors.category && styles.inputError,
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
                      setErrors(prev => ({...prev, category: undefined}));
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
                label="Barcode (Optional)"
                value={barcode}
                onChangeText={setBarcode}
                style={styles.input}
              />
            </View>

            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Quantity & Unit
              </Text>

              <View style={styles.quantityRow}>
                <View style={styles.quantityContainer}>
                  <Text style={styles.label}>Quantity</Text>
                  <View style={styles.quantityInput}>
                    <IconButton
                      icon="minus"
                      size={20}
                      onPress={decrementQuantity}
                      disabled={!quantity || parseInt(quantity) <= 1}
                    />
                    <TextInput
                      value={quantity}
                      onChangeText={handleQuantityChange}
                      onBlur={handleQuantityBlur}
                      keyboardType="numeric"
                      style={styles.quantityTextInput}
                      selectTextOnFocus={true}
                    />
                    <IconButton
                      icon="plus"
                      size={20}
                      onPress={incrementQuantity}
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
                    {category &&
                      CATEGORY_UNITS[category]?.map(unitOption => (
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
            </View>

            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Expiry Details
              </Text>

              <Button
                mode="outlined"
                onPress={() => setShowDatePicker(true)}
                style={styles.input}
                icon="calendar">
                Expiry Date: {formatDateForDisplay(expiryDate)}
              </Button>

              <View style={styles.reminderContainer}>
                <Text style={styles.label}>Remind me before expiry in:</Text>
                <Menu
                  visible={showReminderMenu}
                  onDismiss={() => setShowReminderMenu(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setShowReminderMenu(true)}
                      style={styles.input}
                      icon="bell-outline">
                      {getReminderDisplayText()}
                    </Button>
                  }>
                  {REMINDER_OPTIONS.map(option => (
                    <Menu.Item
                      key={option.value}
                      onPress={() => handleReminderSelect(option.value)}
                      title={option.label}
                    />
                  ))}
                </Menu>

                {isCustomReminder && (
                  <View style={styles.customReminderContainer}>
                    <TextInput
                      label="Days"
                      value={customReminderDays}
                      onChangeText={handleCustomReminderChange}
                      keyboardType="numeric"
                      style={styles.customReminderInput}
                      maxLength={3}
                    />
                    <Text style={styles.customReminderLabel}>
                      {customReminderDays === '1' ? 'Day' : 'Days'}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Additional Information
              </Text>

              <TextInput
                label="Notes (Optional)"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                style={[styles.input, styles.notesInput]}
              />
            </View>

            <Button
              mode="contained"
              onPress={handleSave}
              loading={loading}
              style={styles.saveButton}
              disabled={loading}>
              {isEditing ? 'Update Product' : 'Save Product'}
            </Button>

            {errors.submit && <ErrorMessage message={errors.submit} />}
          </Surface>
        </ScrollView>
      )}

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
  scrollView: {
    flex: 1,
  },
  form: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: 8,
    paddingVertical: 6,
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
    marginBottom: 12,
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
    marginBottom: 8,
  },
  quantityInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.disabled,
    borderRadius: 8,
    paddingVertical: 4,
  },
  quantityTextInput: {
    flex: 1,
    textAlign: 'center',
    height: 40,
    padding: 0,
    backgroundColor: 'transparent',
  },
  unitButton: {
    height: 48,
    justifyContent: 'center',
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 1,
  },
  reminderContainer: {
    marginTop: 8,
  },
  customReminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  customReminderInput: {
    flex: 1,
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  customReminderLabel: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
  },
});

export default ProductInputScreen;
