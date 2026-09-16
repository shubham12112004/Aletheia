import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, History, BookMarked, LogOut, Activity, Settings, Home, LayoutGrid, LineChart, Briefcase as BriefcaseIcon, Menu, X, ChevronRight, Sparkles
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
    const item: NotificationItem = { id: Math.random().toString(), title, desc, type, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setNotifications((prev) => [item, ...prev].slice(0, 15));
  };

  const syncWatchlist = async (silent = false) => {
    try {
      await getWatchlist(token);
      if (!silent) addNotification('Watchlist Synced', 'Your assets have been synchronized.', 'success');
    } catch (err) {
      if (!silent) addNotification('Sync Failed', 'Unable to sync watchlist.', 'warn');
    }
  };

  useEffect(() => {
    document.documentElement.classList.add('dark');
    if (token && user) {
      syncWatchlist(true);
      addNotification('Terminal Connected', `Authenticated as ${user.email}`, 'info');
    }
  }, [token]); // eslint-disable-line

  const initials = (user?.name || 'AI').split(' ').map((item) => item[0]).slice(0, 2).join('').toUpperCase();

  const navItems = [
    { name: 'Terminal', path: '/app/terminal', icon: <Home className="w-3.5 h-3.5 mr-1.5" /> },
    { name: 'Markets', path: '/app/markets', icon: <LineChart className="w-3.5 h-3.5 mr-1.5" /> },
    { name: 'Screener', path: '/app/screener', icon: <LayoutGrid className="w-3.5 h-3.5 mr-1.5" /> },
    { name: 'Portfolios', path: '/app/portfolios', icon: <BriefcaseIcon className="w-3.5 h-3.5 mr-1.5" /> },
    { name: 'Watchlist', path: '/app/watchlist', icon: <BookMarked className="w-3.5 h-3.5 mr-1.5" /> },
    { name: 'History', path: '/app/history', icon: <History className="w-3.5 h-3.5 mr-1.5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#05080f] text-foreground flex flex-col font-sans selection:bg-emerald-500/30">

      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[20%] w-[700px] h-[700px] rounded-full bg-emerald-500/5 blur-[160px] mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[10%] w-[600px] h-[600px] rounded-full bg-teal-600/5 blur-[160px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/10 via-[#05080f] to-[#05080f]" />
      </div>

      {/* Glassmorphic Navbar Header */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#05080f]/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-14 w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile Hamburger Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden h-9 w-9 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Brand Logo */}
            <Link to="/app/terminal" className="flex items-center gap-2.5 cursor-pointer group">
              <img src="/favicon.svg" alt="Aletheia Logo" className="h-8 w-8 rounded-xl shadow-md group-hover:scale-105 transition-transform" />
              <div className="flex items-center gap-1.5">
                <span className="font-black tracking-tight text-lg text-zinc-100 font-mono">Aletheia</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 hidden sm:inline-block">AI SaaS</span>
              </div>
            </Link>

            {/* Desktop Navigation Tabs */}
            <div className="hidden lg:flex items-center gap-1 ml-8 text-xs font-semibold">
              {navItems.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={cn(
                      "relative flex items-center px-3.5 py-1.5 rounded-full transition-all duration-200",
                      isActive
                        ? "text-white font-bold bg-white/10 shadow-sm border border-white/10"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                    )}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Status indicator pill */}
            <div className="hidden md:flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.03] px-3 py-1 text-xs font-medium text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span>Telemetry Live</span>
            </div>

            {/* Notifications Popover Toggle */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileMenuOpen(false);
                }}
                className="h-9 w-9 rounded-xl border border-white/5 bg-white/[0.03] hover:bg-white/10 text-zinc-300 relative"
              >
                <Bell className="h-4 w-4" />
                {notifications.length > 0 && (
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                )}
              </Button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-white/10 bg-[#090d16]/95 backdrop-blur-2xl p-3 shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="flex justify-between items-center px-2 py-1 mb-2 border-b border-white/5">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-400" /> Notifications
                      </h3>
                      <span className="text-[10px] text-zinc-500 font-medium">{notifications.length} events</span>
                    </div>

                    <div className="max-h-[280px] overflow-y-auto space-y-1.5 pr-1">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-center text-xs text-zinc-500 font-medium">No recent events</p>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className="rounded-xl p-2.5 bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors">
                            <div className="flex justify-between items-start">
                              <p className="text-xs font-bold text-zinc-200">{n.title}</p>
                              <span className="text-[10px] font-mono text-zinc-500">{n.time}</span>
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{n.desc}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileMenuOpen(!profileMenuOpen);
                  setNotificationsOpen(false);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-900 text-xs font-black text-white shadow-md border border-white/10 hover:border-emerald-500/40 transition-all active:scale-95"
              >
                {initials}
              </button>

              <AnimatePresence>
                {profileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-white/10 bg-[#090d16]/95 backdrop-blur-2xl p-2 shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="px-3 py-3 border-b border-white/5 mb-1.5">
                      <p className="text-sm font-bold text-white truncate">{user?.name || 'Workspace Analyst'}</p>
                      <p className="text-xs text-zinc-400 truncate mt-0.5 font-mono">{user?.email}</p>
                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                        <Activity className="h-3 w-3" /> Active Session
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Link
                        to="/app/settings"
                        onClick={() => setProfileMenuOpen(false)}
                        className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Settings className="h-4 w-4 text-zinc-400" /> Platform Settings
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
                      </Link>

                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-white/5 bg-[#05080f]/95 backdrop-blur-2xl overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1">
                {navItems.map(item => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-3 rounded-xl transition-all text-xs font-bold",
                      location.pathname === item.path
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "text-zinc-400 hover:bg-white/5 hover:text-white"
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

      {/* Main Content View Container */}
      <main className="flex-1 w-full relative z-10">
        <Outlet />
      </main>
    </div>
  );
}
