import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import api from '../../services/api';
import { uploadImage } from '../../services/upload';
import toast from 'react-hot-toast';
import LoadingSpinner from '../Common/LoadingSpinner';
import { FiUpload } from 'react-icons/fi';

const SchoolSettings = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schoolInfo, setSchoolInfo] = useState({
    name: '',
    name_kh: '',
    history: '',
    history_kh: '',
    logo: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');

  useEffect(() => {
    fetchSchoolInfo();
  }, []);

  const fetchSchoolInfo = async () => {
    try {
      const response = await api.get('/school/info');
      setSchoolInfo(response.data);
      if (response.data.logo) {
        setLogoPreview(`${import.meta.env.VITE_API_URL.replace('/api', '')}${response.data.logo}`);
      }
    } catch (error) {
      toast.error('Failed to fetch school info');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setSchoolInfo({ ...schoolInfo, [e.target.name]: e.target.value });
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      let logoUrl = schoolInfo.logo;
      if (logoFile) {
        const uploadRes = await uploadImage(logoFile);
        logoUrl = uploadRes.logo_url;
      }
      
      const data = { ...schoolInfo, logo: logoUrl };
      await api.put('/school/info', data);
      toast.success('School information updated successfully');
    } catch (error) {
      toast.error('Failed to update school info');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('logo')}</label>
        <div className="flex items-center space-x-4">
          {logoPreview && (
            <img src={logoPreview} alt="School Logo" className="w-24 h-24 object-contain border rounded-lg" />
          )}
          <label className="cursor-pointer btn-secondary flex items-center space-x-2">
            <FiUpload />
            <span>{t('upload')}</span>
            <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
          </label>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('schoolName')}</label>
        <input
          type="text"
          name="name"
          value={schoolInfo.name}
          onChange={handleChange}
          className="input-field"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('schoolNameKH')}</label>
        <input
          type="text"
          name="name_kh"
          value={schoolInfo.name_kh}
          onChange={handleChange}
          className="input-field khmer-text"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('history')}</label>
        <textarea
          name="history"
          value={schoolInfo.history}
          onChange={handleChange}
          rows="6"
          className="input-field"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('history')} (ខ្មែរ)</label>
        <textarea
          name="history_kh"
          value={schoolInfo.history_kh}
          onChange={handleChange}
          rows="6"
          className="input-field khmer-text"
        />
      </div>
      
      <div className="flex justify-end">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? t('loading') : t('save')}
        </button>
      </div>
    </form>
  );
};

export default SchoolSettings;