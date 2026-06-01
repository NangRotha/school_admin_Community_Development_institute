import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import api from '../../services/api';
import { uploadImage } from '../../services/upload';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiEdit2, FiMove } from 'react-icons/fi';
import LoadingSpinner from '../Common/LoadingSpinner';

const BannerManager = () => {
  const { t } = useLanguage();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    video_url: '',
    is_video: false,
    order: 0
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await api.get('/school/banners');
      setBanners(response.data);
    } catch (error) {
      toast.error('Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const uploadRes = await uploadImage(file, 'banner');
      setFormData({ ...formData, image_url: uploadRes.image_url });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBanner) {
        await api.put(`/school/banners/${editingBanner.id}`, formData);
        toast.success('Banner updated successfully');
      } else {
        await api.post('/school/banners', formData);
        toast.success('Banner created successfully');
      }
      fetchBanners();
      setShowForm(false);
      resetForm();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.delete(`/school/banners/${id}`);
        toast.success('Banner deleted');
        fetchBanners();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      image_url: '',
      video_url: '',
      is_video: false,
      order: 0
    });
    setImageFile(null);
    setEditingBanner(null);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus />
          <span>Add Banner</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div key={banner.id} className="card overflow-hidden">
            {banner.is_video ? (
              <video src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${banner.video_url}`} className="w-full h-48 object-cover" controls />
            ) : (
              <img src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${banner.image_url}`} alt={banner.title} className="w-full h-48 object-cover" />
            )}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900">{banner.title}</h3>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => {
                    setEditingBanner(banner);
                    setFormData(banner);
                    setShowForm(true);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <FiEdit2 />
                </button>
                <button
                  onClick={() => handleDelete(banner.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">{editingBanner ? 'Edit' : 'Add'} Banner</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="input-field"
                />
                {formData.image_url && (
                  <img src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${formData.image_url}`} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />
                )}
              </div>
              
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_video}
                    onChange={(e) => setFormData({ ...formData, is_video: e.target.checked })}
                    className="rounded"
                  />
                  <span>Is Video?</span>
                </label>
              </div>
              
              {formData.is_video && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
                  <input
                    type="text"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    className="input-field"
                    placeholder="/uploads/videos/video.mp4"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="input-field"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerManager;