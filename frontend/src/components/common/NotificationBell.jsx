import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { businessService } from '../../services/businessService';
import { formatRelativeTime } from '../../utils/formatters';

export const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({ notifications: [], unreadCount: 0 });

  const load = async () => {
    try {
      setData(await businessService.getNotifications());
    } catch {
      // Notifications should not block the rest of the application.
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const markRead = async (notification) => {
    if (!notification.read) {
      await businessService.markNotificationRead(notification._id);
      load();
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen((value) => !value)} className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800" title="Notifications" aria-label="Notifications">
        <Bell className="w-5 h-5" />
        {data.unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">{data.unreadCount > 99 ? '99+' : data.unreadCount}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-12 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <span className="text-sm font-bold text-slate-100">Notifications</span>
            <button onClick={() => businessService.markAllNotificationsRead().then(load)} className="text-slate-400 hover:text-indigo-300" title="Mark all as read" aria-label="Mark all as read"><CheckCheck className="w-4 h-4" /></button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {data.notifications.slice(0, 8).map((notification) => (
              <Link key={notification._id} to="/notifications" onClick={() => markRead(notification)} className={`block px-4 py-3 border-b border-slate-800/70 hover:bg-slate-800/60 ${notification.read ? '' : 'bg-indigo-500/5'}`}>
                <div className="flex items-start gap-2"><span className={`mt-1.5 w-2 h-2 rounded-full ${notification.read ? 'bg-slate-700' : 'bg-indigo-400'}`} /><div><p className="text-xs font-semibold text-slate-200">{notification.title}</p><p className="text-xs text-slate-400 mt-0.5">{notification.message}</p><p className="text-[10px] text-slate-500 mt-1">{formatRelativeTime(notification.createdAt)}</p></div></div>
              </Link>
            ))}
            {data.notifications.length === 0 && <p className="px-4 py-6 text-xs text-slate-500 text-center">No notifications yet.</p>}
          </div>
        </div>
      )}
    </div>
  );
};