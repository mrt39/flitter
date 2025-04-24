//date formatting utilities
import dayjs from 'dayjs';

//format date for display in posts and comments
function formatDate(date) {
  return dayjs(new Date(date)).format('MMM D, H:mm');
}

export { formatDate };