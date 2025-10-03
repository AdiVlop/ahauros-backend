import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logoFull from '@/assets/logos/logo-full.png';
import { User, Settings, LogOut } from 'lucide-react';
import { dashboardRoutes } from '../config/routesConfig';

export default function DashboardLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth?mode=login');
  };


  const isActive = (path) => {
    if (path === '/dashboard/overview') {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/overview';
    }
    return location.pathname === path;
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-blue-900 text-white"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #000000, #1f2937, #1e3a8a)',
        color: '#ffffff'
      }}
    >
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-4 sm:px-6">
          <img src={logoFull} alt="Ahauros Logo" className="app-logo" />
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 text-gray-300 hover:text-white transition">
              <User className="w-5 h-5" />
              <span>{t("profile")}</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-300 hover:text-white transition">
              <Settings className="w-5 h-5" />
              <span>{t("settings")}</span>
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition"
            >
              <LogOut className="w-5 h-5" />
              <span>{t("logout")}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900/80 backdrop-blur-sm border-r border-gray-800 min-h-screen">
          <nav className="p-4">
            <ul className="space-y-2">
              {dashboardRoutes.map(({ name, path, icon }) => {
                const Icon = icon;
                return (
                <li key={path}>
                  <button
                    onClick={() => navigate(path)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(path)
                        ? 'bg-[#e0bd40] text-black font-semibold'
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
