import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logoFull from '@/assets/logos/logo-full.png';
import { User, Settings, LogOut, Crown, Shield, BarChart3, Users, Database } from 'lucide-react';

export default function AdminDashboardLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth?mode=login');
  };

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/ai';
    }
    return location.pathname === path;
  };

  const adminRoutes = [
    { name: "AI Orchestration", path: "/admin/ai", icon: Crown },
    { name: "System Health", path: "/admin/health", icon: Shield },
    { name: "Analytics", path: "/admin/analytics", icon: BarChart3 },
    { name: "User Management", path: "/admin/users", icon: Users },
    { name: "Database", path: "/admin/database", icon: Database },
  ];

  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-red-900 via-gray-900 to-black text-white"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #7f1d1d, #1f2937, #000000)',
        color: '#ffffff'
      }}
    >
      {/* Header */}
      <header className="bg-red-900/80 backdrop-blur-sm border-b border-red-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-4 sm:px-6">
          <div className="flex items-center space-x-4">
            <img src={logoFull} alt="Ahauros Logo" className="app-logo h-8" />
            <div className="flex items-center space-x-2">
              <Crown className="w-6 h-6 text-yellow-400" />
              <span className="text-xl font-bold text-yellow-400">Admin Dashboard</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 text-gray-300 hover:text-white transition">
              <User className="w-5 h-5" />
              <span>Admin Profile</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-300 hover:text-white transition">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition"
            >
              <span>← User Dashboard</span>
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Admin Sidebar */}
        <aside className="w-64 bg-gray-900/80 backdrop-blur-sm border-r border-gray-800 min-h-screen">
          <nav className="p-4">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-yellow-400 mb-2">Admin Panel</h2>
              <p className="text-sm text-gray-400">System Management & AI Orchestration</p>
            </div>
            
            <ul className="space-y-2">
              {adminRoutes.map(({ name, path, icon }) => {
                const Icon = icon;
                return (
                <li key={path}>
                  <button
                    onClick={() => navigate(path)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(path)
                        ? 'bg-red-600 text-white font-semibold'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{name}</span>
                  </button>
                </li>
                );
              })}
            </ul>

            {/* Admin Info */}
            <div className="mt-8 p-4 bg-red-900/20 rounded-lg border border-red-800">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">Admin Access</span>
              </div>
              <p className="text-xs text-gray-400">
                Full system access with AI orchestration capabilities
              </p>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
