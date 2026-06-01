import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import api from '../../services/api';
import { uploadImage } from '../../services/upload';
import toast from 'react-hot-toast';
import { FiX, FiUpload } from 'react-icons/fi';

const TeacherForm = ({ teacher, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: teacher?.name || '',
    name_kh: teacher?.name_kh || '',
    position: teacher?.position || '',
    position_kh: teacher?.position_kh || '',
    email: teacher?.email || '',
    phone: teacher?.phone || '',
    bio: teacher?.bio || '',
    image: teacher?.image || ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(teacher?.image ? `${import.meta.env.VITE_API_URL.replace('/api', '')}${teacher.image}` : '');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let imageUrl = formData.image;
      if (imageFile) {
        const uploadRes = await uploadImage(imageFile);
        imageUrl = uploadRes.logo_url || uploadRes.image_url;
      }
      
      const data = { ...formData, image: imageUrl };
      
      if (teacher) {
        await api.put(`/teachers/${teacher.id}`, data);
        toast.success('Teacher updated successfully');
      } else {
        await api.post('/teachers', data);
        toast.success('Teacher added successfully');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">{teacher ? t('edit') : t('add')} {t('teachers')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('name')}</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('name')} (ខ្មែរ)</label>
            <input
              type="text"
              name="name_kh"
              value={formData.name_kh}
              onChange={handleChange}
              className="input-field khmer-text"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('position')}</label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('position')} (ខ្មែរ)</label>
            <input
              type="text"
              name="position_kh"
              value={formData.position_kh}
              onChange={handleChange}
              className="input-field khmer-text"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('email')}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('phone')}</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('image')}</label>
            <div className="flex items-center space-x-4">
              {preview && (
                <img src={preview} alt="Preview" className="w-20 h-20 rounded-full object-cover" />
              )}
              <label className="cursor-pointer btn-secondary flex items-center space-x-2">
                <FiUpload />
                <span>{t('upload')}</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              {t('cancel')}
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? t('loading') : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherForm;