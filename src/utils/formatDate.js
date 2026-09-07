import dayjs from 'dayjs';

const formatDate = (date, format = 'DD/MM/YYYY') => {
  return dayjs(date).format(format);
};

const formatDateTime = (date) => {
  return dayjs(date).format('DD/MM/YYYY HH:mm');
};

const formatFullDate = (date) => {
  return dayjs(date).format('dddd, DD MMMM YYYY');
};

const formatMessageTime = (date) => {
  const now = dayjs();
  const messageDate = dayjs(date);

  if (messageDate.isSame(now, 'day')) {
    return messageDate.format('HH:mm');
  }

  if (messageDate.isSame(now.subtract(1, 'day'), 'day')) {
    return 'Yesterday';
  }

  return messageDate.format('DD/MM/YYYY');
};

const formatEventDate = (startDate, endDate) => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  if (start.isSame(end, 'day')) {
    return `${start.format('dddd, DD MMMM YYYY')} at ${start.format('HH:mm')} - ${end.format('HH:mm')}`;
  }

  return `${start.format('DD MMM YYYY HH:mm')} - ${end.format('DD MMM YYYY HH:mm')}`;
};

export {
  formatDate,
  formatDateTime,
  formatFullDate,
  formatMessageTime,
  formatEventDate,
};