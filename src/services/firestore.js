import firestore from '@react-native-firebase/firestore';

export const addProduct = async (productData) => {
  try {
    const response = await firestore()
      .collection('products')
      .add({
        ...productData,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    return response.id;
  } catch (error) {
    throw new Error('Failed to save product: ' + error.message);
  }
}; 