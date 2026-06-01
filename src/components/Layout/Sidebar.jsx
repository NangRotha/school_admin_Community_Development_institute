// frontend-admin/src/components/Layout/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiHome, FiUsers, FiUserPlus, FiBookOpen, FiFileText, 
  FiCalendar, FiImage, FiBarChart2, FiSettings, FiUser,
  FiGrid, FiMail, FiMessageSquare, FiInfo
} from 'react-icons/fi';
import { useLanguage } from '../../contexts/LanguageContext';

const Sidebar = () => {
  const { t, language } = useLanguage();
  
  const menuItems = [
    { path: '/', icon: FiHome, label: t('dashboard') || 'Dashboard' },
    { path: '/teachers', icon: FiUsers, label: t('teachers') || 'Teachers' },
    { path: '/students', icon: FiUserPlus, label: t('students') || 'Students' },
    { path: '/courses', icon: FiBookOpen, label: t('courses') || 'Courses' },
    { path: '/classes', icon: FiGrid, label: t('classes') || 'Classes' },
    { path: '/news', icon: FiFileText, label: t('news') || 'News' },
    { path: '/events', icon: FiCalendar, label: t('events') || 'Events' },
    { path: '/gallery', icon: FiImage, label: t('gallery') || 'Gallery' },
    { path: '/results', icon: FiBarChart2, label: t('results') || 'Exam Results' },
    { path: '/contact-messages', icon: FiMessageSquare, label: t('ContactMessages') || 'Contact Messages' },
    { path: '/about-management', icon: FiInfo, label: t('AboutPage') || 'About Page' },
    { path: '/settings', icon: FiSettings, label: t('settings') || 'Settings' },
    { path: '/profile', icon: FiUser, label: t('profile') || 'Profile' },
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-primary-800 to-primary-900 text-white shadow-xl">
      <div className="p-6 border-b border-primary-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <FiHome className="text-primary-600 text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold">School Admin</h1>
            <p className="text-xs text-primary-200">Management System</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-sm transition-colors duration-200 ${
                isActive
                  ? 'bg-primary-700 text-white border-r-4 border-white'
                  : 'text-primary-100 hover:bg-primary-700 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;