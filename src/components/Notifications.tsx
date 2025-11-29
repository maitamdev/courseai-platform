import { useState, useEffect } from 'react';
import { Bell, X, UserPlus, MessageCircle, Trophy, Gift, Check, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type Notification = {
  id: string;
  type: 'friend_request' | 'message' | 'achievement' | 'reward' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  data?: any;
};

export const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) loadNotifications();
  }, [user]);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const loadNotifications = () => {
    const saved = localStorage.getItem(`notifications_${user?.id}`);
    if (saved) {
      setNotifications(JSON.parse(saved).map((n: any) => ({
        ...n,
        createdAt: new Date(n.createdAt)
      })));
    } else {
      // Demo notifications
      const demo: Notification[] = [
        { id: '1', type: 'system', title: 'Chào mừng!', message: 'Chào mừng bạn đến với CodeMind AI!', read: false, createdAt: new Date() },
        { id: '2', type: 'reward', title: 'Phần thưởng', message: 'Nhận 50 xu khi đăng ký thành công!', read: false, createdAt: new Date(Date.now() - 3600000) },
      ];
      setNotifications(demo);
      saveNotifications(demo);
    }
  };

  const saveNotifications = (notifs: Notification[]) => {
    localStorage.setItem(`notifications_${user?.id}`, JSON.stringify(notifs));
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    saveNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    saveNotifications(updated);
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    saveNotifications(updated);
  };

  const clearAll = () => {
    setNotifications([]);
    saveNotifications([]);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'friend_request': return <UserPlus className="w-5 h-5 text-blue-400" />;
      case 'message': return <MessageCircle className="w-5 h-5 text-green-400" />;
      case 'achievement': return <Trophy className="w-5 h-5 text-emerald-400" />;
      case 'reward': return <Gift className="w-5 h-5 text-pink-400" />;
      default: return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return `${Math.floor(hours / 24)} ngày trước`;
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 bg-gray-800/80 hover:bg-gray-700 rounded-lg transition-all"
      >
        <Bell className="w-5 h-5 text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="font-bold text-white">Thông báo</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-blue-400 hover:text-blue-300">
                    Đánh dấu đã đọc
                  </button>
                )}
                {notifications.length > 0 && (
                  <button onClick={clearAll} className="p-1 hover:bg-gray-700 rounded">
                    <Trash2 className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Không có thông báo</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 p-4 border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${
                      !notif.read ? 'bg-blue-500/5' : ''
                    }`}
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${notif.read ? 'text-gray-400' : 'text-white'}`}>
                        {notif.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{notif.message}</p>
                      <p className="text-xs text-gray-600 mt-1">{formatTime(notif.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {!notif.read && (
                        <button onClick={() => markAsRead(notif.id)} className="p-1 hover:bg-gray-700 rounded">
                          <Check className="w-4 h-4 text-green-400" />
                        </button>
                      )}
                      <button onClick={() => deleteNotification(notif.id)} className="p-1 hover:bg-gray-700 rounded">
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
