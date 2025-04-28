// Validate Ethereum address
export const isValidEthereumAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Validate Hedera account ID format
export const isValidHederaAccountId = (accountId) => {
  return /^\d+\.\d+\.\d+$/.test(accountId);
};

// Validate positive number
export const isPositiveNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
};

// Validate file size (max 5MB)
export const isValidFileSize = (file, maxSizeMB = 5) => {
  return file && file.size <= maxSizeMB * 1024 * 1024;
};

// Validate image file type
export const isValidImageType = (file) => {
  return file && file.type.startsWith('image/');
};

// Validate form field - returns error message if invalid
export const validateField = (name, value, rules = {}) => {
  if (rules.required && (!value || value.trim() === '')) {
    return `${name} is required`;
  }
  
  if (rules.minLength && value.length < rules.minLength) {
    return `${name} must be at least ${rules.minLength} characters`;
  }
  
  if (rules.maxLength && value.length > rules.maxLength) {
    return `${name} must not exceed ${rules.maxLength} characters`;
  }
  
  if (rules.pattern && !rules.pattern.test(value)) {
    return `${name} format is invalid`;
  }
  
  if (rules.isEthAddress && !isValidEthereumAddress(value)) {
    return `${name} must be a valid Ethereum address`;
  }
  
  if (rules.isHederaId && !isValidHederaAccountId(value)) {
    return `${name} must be a valid Hedera account ID`;
  }
  
  if (rules.isPositive && !isPositiveNumber(value)) {
    return `${name} must be a positive number`;
  }
  
  return null;
};

// Validate entire form
export const validateForm = (formData, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(fieldName => {
    const value = formData[fieldName];
    const rules = validationRules[fieldName];
    
    const error = validateField(fieldName, value, rules);
    if (error) {
      errors[fieldName] = error;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};