export const formatCurrency = (amount, currency = 'KSh') => {
  if (!amount && amount !== 0) return `${currency} 0`;
  return `${currency} ${Number(amount).toLocaleString('en-KE')}`;
};

export const formatPrice = (amount) => {
  if (!amount && amount !== 0) return 'Free';
  const num = Number(amount);
  if (num >= 1000000) return `KSh ${(num / 1000000).toFixed(1)}M`;
  if (num >= 10000) return `KSh ${(num / 1000).toFixed(0)}k`;
  if (num >= 1000) return `KSh ${num.toLocaleString('en-KE')}`;
  return `KSh ${num}`;
};

export const formatCompactNumber = (num) => {
  if (!num && num !== 0) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};