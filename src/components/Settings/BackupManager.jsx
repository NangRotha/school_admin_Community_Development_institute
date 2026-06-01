import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiDownload, FiDatabase } from 'react-icons/fi';

const BackupManager = () => {
  const { t } = useLanguage();
  const [backingUp, setBackingUp] = useState(false);

  const handleBackup = async () => {
    setBackingUp(true);
    try {
      const response = await api.post('/admin/backup');
      toast.success(`Backup created: ${response.data.backup_file}`);
    } catch (error) {
      toast.error('Backup failed');
    } finally {
      setBackingUp(false);
    }
  };

  return (
    <div className="card p-6">
      <div className="text-center">
        <FiDatabase className="w-16 h-16 text-primary-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Database Backup</h3>
        <p className="text-gray-600 mb-6">
          Create a backup of your database to prevent data loss
        </p>
        <button
          onClick={handleBackup}
          disabled={backingUp}
          className="btn-primary flex items-center space-x-2 mx-auto"
        >
          <FiDownload />
          <span>{backingUp ? 'Backing up...' : 'Create Backup'}</span>
        </button>
      </div>
    </div>
  );
};

export default BackupManager;