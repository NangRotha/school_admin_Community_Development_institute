import React from 'react';
import { FiGlobe } from 'react-icons/fi';
import { useLanguage } from '../../contexts/LanguageContext';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      <FiGlobe className="text-gray-600" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      >
        <option value="en">English</option>
        <option value="kh">ភាសាខ្មែរ</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;