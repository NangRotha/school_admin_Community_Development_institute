import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import { uploadImage } from '../services/upload';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import SchoolSettings from '../components/Settings/SchoolSettings';
import BannerManager from '../components/Settings/BannerManager';
import BackupManager from '../components/Settings/BackupManager';

const Settings = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('school');
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'school', name: t('schoolInfo') },
    { id: 'banners', name: t('banners') },
    { id: 'backup', name: t('backup') },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800">{t('settings')}</h1>
      
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
      
      <div className="mt-6">
        {activeTab === 'school' && <SchoolSettings />}
        {activeTab === 'banners' && <BannerManager />}
        {activeTab === 'backup' && <BackupManager />}
      </div>
    </div>
  );
};

export default Settings;