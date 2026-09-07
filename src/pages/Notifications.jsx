import { useState, useEffect } from 'react';
import { IoNotificationsOutline, IoCheckmark, IoTrash, IoHeart, IoChatbubble, IoPerson, IoCalendar, IoStorefront } from 'react-icons/io5';
import Layout from '../components/layout/Layout.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Button from '../components/ui/Button.jsx';
import notificationApi from '../api/notificationApi.js';
import timeAgo from '../utils/timeAgo.js';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);

    try {
      const response = await notificationApi.getNotifications(page);

      if (response.data.success) {
        const { notifications: newNotifications, total } = response.data.data;
        setNotifications(newNotifications);
        setHasMore(page * 20 < total);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationApi.getUnreadCount();

      if (response.data.success) {
        setUnreadCount(response.data.data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to load unread count:', error.message);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      fetchUnreadCount();
    } catch (error) {
      console.error('Mark as read failed:', error.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      fetchUnreadCount();
    } catch (error) {
      console.error('Mark all as read failed:', error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      fetchUnreadCount();
    } catch (error) {
      console.error('Delete notification failed:', error.message);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'LIKE':
        return <IoHeart size={20} className="text-red-500" />;
      case 'COMMENT':
        return <IoChatbubble size={20} className="text-blue-500" />;
      case 'FOLLOW':
        return <IoPerson size={20} className="text-green-500" />;
      case 'EVENT_REMINDER':
        return <IoCalendar size={20} className="text-yellow-500" />;
      case 'MARKETPLACE':
        return <IoStorefront size={20} className="text-purple-500" />;
      default:
        return <IoNotificationsOutline size={20} className="text-text-muted" />;
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-text-primary">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-sm text-text-muted">
                {unreadCount} unread
              </p>
            )}
          </div>

          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              <IoCheckmark className="inline mr-1" size={16} />
              Mark all read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={IoNotificationsOutline}
            title="No notifications"
            description="You're all caught up!"
          />
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`
                  flex items-start gap-3 p-4 rounded-xl border transition-all
                  ${
                    notification.read
                      ? 'bg-bg-primary border-border-color'
                      : 'bg-bg-secondary border-border-color'
                  }
                `}
              >
                <div className="p-2 rounded-full bg-bg-tertiary">
                  {getIcon(notification.type)}
                </div>

                <div className="flex-1">
                  <p className="text-text-primary font-medium">
                    {notification.title}
                  </p>
                  <p className="text-text-secondary text-sm mt-0.5">
                    {notification.body}
                  </p>
                  <p className="text-text-muted text-xs mt-1">
                    {timeAgo(notification.createdAt)}
                  </p>
                </div>

                <div className="flex gap-1">
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="p-2 rounded-lg hover:bg-bg-tertiary text-text-muted"
                      title="Mark as read"
                    >
                      <IoCheckmark size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="p-2 rounded-lg hover:bg-bg-tertiary text-text-muted"
                    title="Delete"
                  >
                    <IoTrash size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Notifications;