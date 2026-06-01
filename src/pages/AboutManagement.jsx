// frontend-admin/src/pages/AboutManagement.jsx
import React, { useState, useEffect } from 'react';
import { FiSave, FiRefreshCw, FiUpload, FiImage, FiEye } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const AboutManagement = () => {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    title_kh: '',
    content: '',
    content_kh: '',
    mission: '',
    mission_kh: '',
    vision: '',
    vision_kh: '',
    image_url: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    try {
      setLoading(true);
      const response = await api.get('/about');
      const data = response.data;
      setFormData({
        title: data.title || '',
        title_kh: data.title_kh || '',
        content: data.content || '',
        content_kh: data.content_kh || '',
        mission: data.mission || '',
        mission_kh: data.mission_kh || '',
        vision: data.vision || '',
        vision_kh: data.vision_kh || '',
        image_url: data.image_url || ''
      });
      if (data.image_url) {
        setPreviewImage(`${import.meta.env.VITE_API_URL.replace('/api', '')}${data.image_url}`);
      }
    } catch (error) {
      console.error('Failed to fetch about:', error);
      toast.error('Failed to load about information');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formDataImage = new FormData();
      formDataImage.append('file', file);
      
      const response = await api.post('/about/upload-image', formDataImage, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const imageUrl = response.data.image_url;
      setFormData({ ...formData, image_url: imageUrl });
      setPreviewImage(`${import.meta.env.VITE_API_URL.replace('/api', '')}${imageUrl}`);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await api.put('/about', formData);
      toast.success('About information updated successfully');
      fetchAbout();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save about information');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">About Page Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage the content of the About Us page</p>
        </div>
        <button
          type="button"
          onClick={fetchAbout}
          className="btn-secondary flex items-center space-x-2"
        >
          <FiRefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">About Image</h2>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-full md:w-64 h-48 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300">
              {previewImage ? (
                <img src={previewImage} alt="About page preview" className="w-full h-full object-cover" />
              ) : (
                <FiImage className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <label htmlFor="about-image" className="cursor-pointer bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2">
                <FiUpload className="w-4 h-4" />
                <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                <input
                  id="about-image"
                  name="about-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                  aria-label="Upload about page image"
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Recommended size: 1200x600 pixels. Max file size: 5MB
              </p>
            </div>
          </div>
        </div>

        {/* Title Section */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Page Title</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title (English)
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter page title"
              />
            </div>
            <div>
              <label htmlFor="title_kh" className="block text-sm font-medium text-gray-700 mb-2">
                Title (Khmer)
              </label>
              <input
                id="title_kh"
                name="title_kh"
                type="text"
                value={formData.title_kh}
                onChange={handleChange}
                className="input-field khmer-text"
                placeholder="បញ្ចូលចំណងជើង"
              />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Main Content</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content (English)
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows="8"
                className="input-field"
                placeholder="Enter main content about the school..."
              />
            </div>
            <div>
              <label htmlFor="content_kh" className="block text-sm font-medium text-gray-700 mb-2">
                Content (Khmer)
              </label>
              <textarea
                id="content_kh"
                name="content_kh"
                value={formData.content_kh}
                onChange={handleChange}
                rows="8"
                className="input-field khmer-text"
                placeholder="បញ្ចូលមាតិកាអំពីសាលា..."
              />
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Mission</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="mission" className="block text-sm font-medium text-gray-700 mb-2">
                  Mission (English)
                </label>
                <textarea
                  id="mission"
                  name="mission"
                  value={formData.mission}
                  onChange={handleChange}
                  rows="5"
                  className="input-field"
                  placeholder="Enter school mission..."
                />
              </div>
              <div>
                <label htmlFor="mission_kh" className="block text-sm font-medium text-gray-700 mb-2">
                  Mission (Khmer)
                </label>
                <textarea
                  id="mission_kh"
                  name="mission_kh"
                  value={formData.mission_kh}
                  onChange={handleChange}
                  rows="5"
                  className="input-field khmer-text"
                  placeholder="បញ្ចូលបេសកកម្មរបស់សាលា..."
                />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Vision</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="vision" className="block text-sm font-medium text-gray-700 mb-2">
                  Vision (English)
                </label>
                <textarea
                  id="vision"
                  name="vision"
                  value={formData.vision}
                  onChange={handleChange}
                  rows="5"
                  className="input-field"
                  placeholder="Enter school vision..."
                />
              </div>
              <div>
                <label htmlFor="vision_kh" className="block text-sm font-medium text-gray-700 mb-2">
                  Vision (Khmer)
                </label>
                <textarea
                  id="vision_kh"
                  name="vision_kh"
                  value={formData.vision_kh}
                  onChange={handleChange}
                  rows="5"
                  className="input-field khmer-text"
                  placeholder="បញ្ចូលចក្ខុវិស័យរបស់សាលា..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => window.open('http://localhost:3002/about', '_blank')}
            className="btn-secondary flex items-center space-x-2"
          >
            <FiEye className="w-4 h-4" />
            <span>Preview on Website</span>
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center space-x-2"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <FiSave className="w-4 h-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AboutManagement;