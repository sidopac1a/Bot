import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Settings, 
  Database, 
  FileText, 
  Download, 
  Upload,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ open, setOpen }) => {
  const { logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'نظرة عامة', href: '/', icon: Home },
    { name: 'الإعدادات', href: '/settings', icon: Settings },
    { name: 'قاعدة المعرفة', href: '/knowledge', icon: Database },
    { name: 'السجلات', href: '/logs', icon: FileText },
    { name: 'الاستيراد والتصدير', href: '/import-export', icon: Download },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <div className={`fixed inset-y-0 right-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform ${
        open ? 'translate-x-0' : 'translate-x-full'
      } transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}>
        
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">WB</span>
            </div>
            <span className="font-semibold text-gray-800 dark:text-white">واتساب بوت</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="md:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon className="w-5 h-5 ml-3" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-5 h-5 ml-3" />
            تسجيل الخروج
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;