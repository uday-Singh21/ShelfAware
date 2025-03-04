export const validateProduct = (product) => {
  const errors = {};

  if (!product.category) {
    errors.category = 'Please select a category';
  }

  if (!product.name) {
    errors.name = 'Please enter product name';
  }

  if (!product.expiryDate) {
    errors.expiryDate = 'Please select expiry date';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 