const formatCount = (count) => {
  if (count === null || count === undefined) return '0';

  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }

  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }

  return count.toString();
};

const formatPrice = (price) => {
  return `KSh ${price.toLocaleString('en-KE')}`;
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';

  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

export {
  formatCount,
  formatPrice,
  formatFileSize,
};