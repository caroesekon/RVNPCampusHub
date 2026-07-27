import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

export const timeAgo = (date) => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatDate = (date, formatStr = 'dd MMM yyyy') => {
  if (!date) return '';
  return format(new Date(date), formatStr);
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return format(new Date(date), 'dd MMM yyyy, HH:mm');
};

export const formatTime = (date) => {
  if (!date) return '';
  return format(new Date(date), 'HH:mm');
};

export const formatChatTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isToday(d)) return format(d, 'HH:mm');
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'dd/MM/yyyy');
};

export const formatStoryTime = (date) => {
  if (!date) return '';
  const hours = Math.abs(new Date() - new Date(date)) / 36e5;
  if (hours < 1) return `${Math.floor(hours * 60)}m ago`;
  if (hours < 24) return `${Math.floor(hours)}h ago`;
  return formatDate(date, 'dd MMM');
};

export const formatRemainingTime = (date) => {
  if (!date) return '';
  const diff = new Date(date) - new Date();
  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / 36e5);
  const minutes = Math.floor((diff % 36e5) / 60000);
  if (hours > 24) return `${Math.floor(hours / 24)}d remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
};