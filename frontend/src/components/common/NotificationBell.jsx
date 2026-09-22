import React, { useEffect, useState, useRef } from 'react';
import { Bell, CheckCheck, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { businessService } from '../../services/businessService';
import { formatRelativeTime } from '../../utils/formatters';

export const getNotificationDestination = (notification, userRole = 'client') => {
  if (!notification) return `/${userRole}/notifications`;

  const projectId = typeof notification.project === 'object'
    ? notification.project?._id
    : notification.project;

  if (projectId) {
    if (notification.type?.includes('milestone') || notification.milestone) {
      return `/projects/${projectId}/workspace?tab=milestones`;
    }
    if (notification.type?.includes('task') || notification.task) {
      return `/projects/${projectId}/workspace?tab=tasks`;
    }
    if (notification.type?.includes('payment') || notification.type?.includes('invoice') || notification.payment) {
      return `/${userRole}/invoices`;
    }
    return `/projects/${projectId}/workspace`;
  }

  if (notification.type?.includes('payment') || notification.type?.includes('invoice') || notification.payment) {
    return `/${userRole}/invoices`;
  }

  return `/${userRole}/notifications`;
};

export const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({ notifications: [], unreadCount: 0 });
  const bellRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await businessService.markNotificationRead(notification._id);
        load();
      } catch {
        // Continue navigation even if mark read fails
      }
    }
    setOpen(false);
    const destination = getNotificationDestination(notification, user?.role);
    navigate(destination);
  };

  return (
    <div className="relative" ref={bellRef}>
      <button
        onClick={() => setOpen((value) => !value)}
        className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {data.unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {data.unreadCount > 99 ? '99+' : data.unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90 backdrop-blur-sm">
            <span className="text-sm font-bold text-slate-100">Notifications</span>
            {data.unreadCount > 0 && (
              <button
                onClick={() => businessService.markAllNotificationsRead().then(load)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {data.notifications.slice(0, 8).map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`block px-4 py-3 cursor-pointer transition hover:bg-slate-800/60 ${
                  notification.read ? 'opacity-80' : 'bg-indigo-500/5'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                      notification.read ? 'bg-slate-600' : 'bg-indigo-400 ring-2 ring-indigo-400/20'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-200">
                      {notification.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-slate-500">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                      <span className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 font-medium">
                        View <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {data.notifications.length === 0 && (
              <p className="px-4 py-8 text-xs text-slate-500 text-center">
                No notifications yet.
              </p>
            )}
          </div>

          {data.notifications.length > 0 && (
            <div className="p-2.5 border-t border-slate-800 bg-slate-950/40 text-center">
              <Link
                to={`/${user?.role || 'client'}/notifications`}
                onClick={() => setOpen(false)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition block py-1"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};