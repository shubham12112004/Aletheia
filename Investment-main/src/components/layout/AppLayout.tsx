import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, History, BookMarked, LogOut, Activity, Settings, Home, LayoutGrid, LineChart, Briefcase as BriefcaseIcon, Brain, Menu, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { getWatchlist } from '@/lib/api';

type NotificationItem = {
  id: string; title: string; desc: string; type: 'info' | 'success' | 'warn'; time: string;
};

export function AppLayout() {
  const { user, token, logout } = useAuth();
  const location = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = (title: string, desc: string, type: 'info' | 'success' | 'warn' = 'info') => {
    const item: NotificationItem = { id: Math.random().toString(), title, desc, type, time: new Date().toLocaleTimeString() };
    setNotifications((prev) => [item, ...prev].slice(0, 20));
    setNotificationsOpen(true);
  };

  const syncWatchlist = async (silent = false) => {
    try {
      await getWatchlist(token);
      if (!silent) addNotification('Watchlist Synced', 'Your watchlist has been updated.', 'success');
    } catch (err) {
      if (!silent) addNotification('Sync Failed', 'Could not sync watchlist.', 'warn');
    }
  };

  useEffect(() => {
    document.documentElement.classList.add('dark');
    if (token && user) {
      syncWatchlist(true);
      addNotification('Terminal Online', `Logged in as ${user.email}`, 'info');
    }
  }, [token]); // eslint-disable-line

  const initials = (user?.name || 'AI').split(' ').map((item) => item[0]).slice(0, 2).join('').toUpperCase();

  const navItems = [
    { name: 'Terminal', path: '/app/terminal', icon: <Home className="w-4 h-4 mr-2" /> },
    { name: 'Markets', path: '/app/markets', icon: <LineChart className="w-4 h-4 mr-2" /> },
    { name: 'Screener', path: '/app/screener', icon: <LayoutGrid className="w-4 h-4 mr-2" /> },
    { name: 'Portfolios', path: '/app/portfolios', icon: <BriefcaseIcon className="w-4 h-4 mr-2" /> },
    { name: 'Watchlist', path: '/app/watchlist', icon: <BookMarked className="w-4 h-4 mr-2" /> },
    { name: 'History', path: '/app/history', icon: <History className="w-4 h-4 mr-2" /> },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-foreground flex flex-col font-sans selection:bg-emerald-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full px-4 sm:px-6 lg:px-8 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden h-9 w-9 text-zinc-400 hover:text-white">
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Link to="/app/terminal" className="flex items-center gap-2 cursor-pointer">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-bold shadow-md">
                <Brain className="h-5 w-5" />
              </div>
              <span className="font-bold tracking-tight text-lg hidden sm:block text-zinc-100">Aletheia</span>
            </Link>
            <div className="hidden lg:flex items-center gap-2 ml-6 text-sm font-medium text-zinc-400">
              {navItems.map(item => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "flex items-center px-3 py-1.5 rounded-full transition-colors",
                    location.pathname === item.path 
                      ? "bg-zinc-800 text-zinc-100" 
                      : "hover:bg-zinc-800/50 hover:text-zinc-200"
                  )}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button variant="ghost" size="icon" onClick={() => setNotificationsOpen(!notificationsOpen)} className="h-8 w-8 rounded-full">
                <Bell className="h-4 w-4" />
                {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />}
              </Button>
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-border/50 bg-[#09090b]/95 backdrop-blur-xl p-2 shadow-2xl z-50">
                    <div className="p-2 pb-3 mb-2 border-b border-border/50"><h3 className="text-sm font-bold text-zinc-100">Terminal Events</h3></div>
                    <div className="max-h-[300px] overflow-y-auto space-y-1">
                      {notifications.length === 0 ? <p className="p-4 text-center text-xs text-zinc-500">No events</p> : notifications.map((n) => (
                        <div key={n.id} className="rounded-xl p-3 hover:bg-zinc-800/50 transition">
                          <div className="flex justify-between items-start"><p className="text-sm font-semibold text-zinc-200">{n.title}</p><span className="text-[10px] text-zinc-500">{n.time}</span></div>
                          <p className="text-xs text-zinc-400 mt-1">{n.desc}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="relative ml-1">
              <button onClick={() => setProfileMenuOpen(!profileMenuOpen)} className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 text-xs font-bold text-white shadow-md ring-1 ring-border/50 hover:ring-zinc-500 transition-all">
                {initials}
              </button>
              <AnimatePresence>
                {profileMenuOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-border/50 bg-[#09090b]/95 backdrop-blur-xl p-2 shadow-2xl z-50">
                    <div className="px-3 py-3 border-b border-border/50 mb-2">
                      <p className="text-sm font-bold text-zinc-100 truncate">{user?.name || 'Analyst'}</p>
                      <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                        <Activity className="h-3 w-3" /> Active Workspace
                      </div>
                    </div>
                    <div className="space-y-1 mb-2">
                      <Link to="/app/settings" onClick={() => setProfileMenuOpen(false)} className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white transition">
                        <Settings className="h-4 w-4 text-zinc-400" /> Settings & Preferences
                      </Link>
                    </div>
                    <button onClick={logout} className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 transition">
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="lg:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl overflow-hidden">
              <div className="px-4 py-4 space-y-2">
                {navItems.map(item => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-3 rounded-xl transition-colors font-semibold",
                      location.pathname === item.path 
                        ? "bg-emerald-500/10 text-emerald-500" 
                        : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                    )}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 w-full relative z-10">
        <Outlet />
      </main>
    </div>
  );
}
