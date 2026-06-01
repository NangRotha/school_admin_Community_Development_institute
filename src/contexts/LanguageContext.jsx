import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const translations = {
  en: {
    // Common
    dashboard: 'Dashboard',
    teachers: 'Teachers',
    students: 'Students',
    courses: 'Courses',
    news: 'News',
    events: 'Events',
    gallery: 'Gallery',
    results: 'Exam Results',
    classes: 'Classes',
    settings: 'Settings',
    profile: 'Profile',
    logout: 'Logout',
    login: 'Login',
    welcome: 'Welcome Back',
    total: 'Total',
    pending: 'Pending',
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    search: 'Search',
    filter: 'Filter',
    actions: 'Actions',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    contact: 'Contact Messages',
    // Dashboard
    totalStudents: 'Total Students',
    totalTeachers: 'Total Teachers',
    totalCourses: 'Total Courses',
    pendingRegistrations: 'Pending Registrations',
    recentActivity: 'Recent Activity',
    // Forms
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    position: 'Position',
    description: 'Description',
    image: 'Image',
    upload: 'Upload',
    status: 'Status',
    approved: 'Approved',
    rejected: 'Rejected',
    // School Settings
    schoolInfo: 'School Information',
    schoolName: 'School Name',
    schoolNameKH: 'ឈ្មោះសាលា',
    history: 'History',
    logo: 'Logo',
    banners: 'Banners',
    backup: 'Backup Database',
    changePassword: 'Change Password',
    oldPassword: 'Old Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
  },
  kh: {
    // Common
    dashboard: 'ផ្ទាំងគ្រប់គ្រង',
    teachers: 'គ្រូបង្រៀន',
    students: 'សិស្ស',
    courses: 'មុខវិជ្ជា',
    news: 'ព័ត៌មាន',
    events: 'ព្រឹត្តិការណ៍',
    gallery: 'វិចិត្រសាល',
    results: 'លទ្ធផលប្រឡង',
    classes: 'ថ្នាក់',
    settings: 'ការកំណត់',
    profile: 'ប្រវត្តិរូប',
    logout: 'ចាកចេញ',
    login: 'ចូលប្រព័ន្ធ',
    welcome: 'ស្វាគមន៍មកកាន់',
    total: 'សរុប',
    pending: 'កំពុងរង់ចាំ',
    add: 'បន្ថែម',
    edit: 'កែប្រែ',
    delete: 'លុប',
    save: 'រក្សាទុក',
    cancel: 'បោះបង់',
    search: 'ស្វែងរក',
    filter: 'តម្រង',
    actions: 'សកម្មភាព',
    loading: 'កំពុងផ្ទុក...',
    error: 'កំហុស',
    success: 'ជោគជ័យ',
    confirm: 'បញ្ជាក់',
    // Dashboard
    totalStudents: 'ចំនួនសិស្សសរុប',
    totalTeachers: 'ចំនួនគ្រូសរុប',
    totalCourses: 'ចំនួនមុខវិជ្ជា',
    pendingRegistrations: 'ពាក្យស្នើសុំចុះឈ្មោះ',
    recentActivity: 'សកម្មភាពថ្មីៗ',
    // Forms
    name: 'ឈ្មោះ',
    email: 'អ៊ីមែល',
    phone: 'លេខទូរស័ព្ទ',
    address: 'អាសយដ្ឋាន',
    position: 'មុខតំណែង',
    description: 'ការពិពណ៌នា',
    image: 'រូបភាព',
    upload: 'ផ្ទុកឡើង',
    status: 'ស្ថានភាព',
    approved: 'បានអនុម័ត',
    rejected: 'បដិសេធ',
    // School Settings
    schoolInfo: 'ព័ត៌មានសាលា',
    schoolName: 'ឈ្មោះសាលា',
    schoolNameKH: 'ឈ្មោះសាលា (ខ្មែរ)',
    history: 'ប្រវត្តិសាលា',
    logo: 'និមិត្តសញ្ញា',
    banners: 'បដា',
    backup: 'បម្រុងទុកទិន្នន័យ',
    changePassword: 'ប្តូរពាក្យសម្ងាត់',
    oldPassword: 'ពាក្យសម្ងាត់ចាស់',
    newPassword: 'ពាក្យសម្ងាត់ថ្មី',
    confirmPassword: 'បញ្ជាក់ពាក្យសម្ងាត់',
    contact: 'ទំនាកទំនង',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.dir = language === 'kh' ? 'ltr' : 'ltr';
  }, [language]);

  const t = (key) => {
    return translations[language][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};