import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { businessService } from '../services/businessService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Badge } from '../components/common/Badge';
import { formatDate } from '../utils/formatters';
import { BarChart3, ReceiptText, Bell, ArrowRight } from 'lucide-react';
import { getNotificationDestination } from '../components/common/NotificationBell';

export const BusinessPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [analytics, setAnalytics] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const section = location.pathname.includes('invoices') ? 'invoices' : location.pathname.includes('notifications') ? 'notifications' : 'analytics';

  useEffect(() => {
    const load = async () => {
      try {
        if (section === 'analytics') setAnalytics(await businessService.getAnalytics(user.role));
        if (section === 'invoices') setInvoices((await businessService.getInvoices()).invoices || []);
        if (section === 'notifications') setNotifications((await businessService.getNotifications()).notifications || []);
      } finally { setLoading(false); }
    };
    load();
  }, [section, user.role]);

  if (loading) return <LoadingSpinner text="Loading business data..." />;
  if (section === 'analytics') {
    const metrics = [['Projects', analytics.totalProjects], ['Active', analytics.activeProjects], ['Completed', analytics.completedProjects], [user.role === 'freelancer' ? 'Paid earnings' : 'Total spending', `INR ${analytics.paidPayments || analytics.totalSpending || 0}`], ['Pending payments', `INR ${analytics.pendingPayments || 0}`], ['Tasks completed', analytics.completedTasks]];
    return <div className="space-y-6"><div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-slate-900 border border-slate-800"><div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold"><BarChart3 className="w-4 h-4" /> Business analytics</div><h1 className="text-2xl font-bold text-slate-100 mt-2">{user.role === 'admin' ? 'Platform analytics' : 'Your business overview'}</h1><p className="text-sm text-slate-400 mt-1">Live metrics from your WorkFlow AI activity.</p></div><div className="grid grid-cols-2 md:grid-cols-3 gap-4">{metrics.map(([label, value]) => <div key={label} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800"><p className="text-xs text-slate-400">{label}</p><p className="text-2xl font-bold text-slate-100 mt-2">{value ?? 0}</p></div>)}</div></div>;
  }
  if (section === 'invoices') return <div className="space-y-6"><h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2"><ReceiptText className="w-6 h-6 text-emerald-400" /> Invoices</h1><div className="space-y-3">{invoices.map((invoice) => <div key={invoice._id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><p className="font-semibold text-slate-100">{invoice.invoiceNumber}</p><p className="text-xs text-slate-400 mt-1">{invoice.project?.title} · {invoice.milestone?.title}</p></div><div className="text-left sm:text-right"><p className="font-bold text-emerald-400">{invoice.currency} {invoice.amount}</p><p className="text-xs text-slate-500">Issued {formatDate(invoice.issuedAt)}</p></div><Badge variant="success">{invoice.status}</Badge></div>)}{invoices.length === 0 && <p className="text-sm text-slate-500">No invoices available yet.</p>}</div></div>;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
        <Bell className="w-6 h-6 text-indigo-400" /> Notifications
      </h1>
      <div className="space-y-3">
        {notifications.map((notification) => {
          const destination = getNotificationDestination(notification, user.role);
          return (
            <div key={notification._id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-100">{notification.title}</p>
                  <p className="text-sm text-slate-400 mt-1">{notification.message}</p>
                </div>
                <Badge variant={notification.read ? 'default' : 'brand'}>
                  {notification.read ? 'Read' : 'New'}
                </Badge>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/60">
                <p className="text-xs text-slate-500">{formatDate(notification.createdAt)}</p>
                {destination && (
                  <Link
                    to={destination}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition"
                  >
                    View details <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
        {notifications.length === 0 && (
          <p className="text-sm text-slate-500">No notifications available yet.</p>
        )}
      </div>
    </div>
  );
};