const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(phone);
};

const isValidPassword = (password) => {
  return password && password.length >= 8;
};

const isValidOtp = (otp) => {
  const otpRegex = /^[0-9]{6}$/;
  return otpRegex.test(otp);
};

const isValidUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

const isRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
};

export {
  isValidEmail,
  isValidPhone,
  isValidPassword,
  isValidOtp,
  isValidUrl,
  isRequired,
};