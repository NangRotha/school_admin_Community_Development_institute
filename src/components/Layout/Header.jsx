import React, { useState } from 'react';
import { FiBell, FiUser, FiLogOut, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageSwitcher from '../Common/LanguageSwitcher';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex justify-between items-center px-6 py-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            {t('welcome')}, {user?.full_name || 'Admin'}!
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          
          <button className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors">
            <FiBell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <FiUser className="text-primary-600" />
              </div>
              <span className="text-gray-700">{user?.username}</span>
              <FiChevronDown className="text-gray-500" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <button
                  onClick={() => {
                    navigate('/profile');
                    setShowDropdown(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                >
                  <FiUser className="w-4 h-4 mr-2" />
                  {t('profile')}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
                >
                  <FiLogOut className="w-4 h-4 mr-2" />
                  {t('logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;