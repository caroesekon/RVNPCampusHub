export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isAcKeEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.ac\.ke$/.test(email);
};

export const isValidPhone = (phone) => {
  return /^\+254\d{9}$/.test(phone) || /^07\d{8}$/.test(phone);
};

export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateMinLength = (value, min, fieldName) => {
  if (value && value.length < min) {
    return `${fieldName} must be at least ${min} characters`;
  }
  return null;
};

export const validateMaxLength = (value, max, fieldName) => {
  if (value && value.length > max) {
    return `${fieldName} must be at most ${max} characters`;
  }
  return null;
};

export const validateMin = (value, min, fieldName) => {
  if (value !== null && value !== undefined && Number(value) < min) {
    return `${fieldName} must be at least ${min}`;
  }
  return null;
};

export const validateMax = (value, max, fieldName) => {
  if (value !== null && value !== undefined && Number(value) > max) {
    return `${fieldName} must be at most ${max}`;
  }
  return null;
};