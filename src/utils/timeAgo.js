import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const timeAgo = (date) => {
  const now = dayjs();
  const then = dayjs(date);

  const diffInSeconds = now.diff(then, 'second');
  const diffInMinutes = now.diff(then, 'minute');
  const diffInHours = now.diff(then, 'hour');
  const diffInDays = now.diff(then, 'day');
  const diffInWeeks = now.diff(then, 'week');
  const diffInMonths = now.diff(then, 'month');

  if (diffInSeconds < 60) {
    return 'just now';
  }

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  }

  if (diffInMonths < 12) {
    return `${diffInMonths}mo ago`;
  }

  return then.format('DD/MM/YYYY');
};

export default timeAgo;