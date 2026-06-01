import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiImage, FiUpload, FiX } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import { uploadImage } from '../services/upload';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Gallery = () => {
  const { t } = useLanguage();
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    category: 'general'
  });

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      console.log('Fetching gallery...');
      const response = await api.get('/gallery');
      console.log('Gallery response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setGallery(response.data);
        console.log(`Loaded ${response.data.length} gallery items`);
      } else {
        setGallery([]);
      }
    } catch (error) {
      console.error('Fetch gallery error:', error);
      toast.error('Failed to fetch gallery');
      setGallery([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setUploading(true);
      try {
        const uploadRes = await uploadImage(file);
        setFormData({ ...formData, image_url: uploadRes.logo_url || uploadRes.image_url });
        toast.success('Image uploaded successfully');
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload image');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.image_url) {
      toast.error('Please upload an image');
      return;
    }
    
    if (!formData.title) {
      toast.error('Please enter a title');
      return;
    }
    
    try {
      const dataToSend = {
        title: formData.title,
        description: formData.description,
        image_url: formData.image_url,
        category: formData.category
      };
      
      console.log('Submitting gallery item:', dataToSend);
      await api.post('/gallery', dataToSend);
      toast.success('Gallery item added successfully');
      
      setShowForm(false);
      resetForm();
      await fetchGallery();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await api.delete(`/gallery/${id}`);
        toast.success('Image deleted successfully');
        await fetchGallery();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete image');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      category: 'general'
    });
    setImageFile(null);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">{t('gallery')}</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus />
          <span>Add Image</span>
        </button>
      </div>

      {gallery.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-gray-400 mb-4">
            <FiImage className="w-20 h-20 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Images Yet</h3>
          <p className="text-gray-500">Click "Add Image" to upload your first image to the gallery.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {gallery.map((item) => (
            <div key={item.id} className="card overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="relative h-64 bg-gray-100">
                <img 
                  src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${item.image_url}`} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full transition-all"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                {item.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                )}
                <div className="flex justify-between items-center">
                  <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                    {item.category}
                  </span>
                  <span className="text-xs text-gray-400">
                    {item.created_at && new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">Add to Gallery</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input-field"
                  required
                  placeholder="Enter image title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="input-field"
                  placeholder="Enter image description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="general">General</option>
                  <option value="students">Students</option>
                  <option value="teachers">Teachers</option>
                  <option value="events">Events</option>
                  <option value="campus">Campus</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="flex flex-col items-center justify-center">
                    <label className="cursor-pointer bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                      <FiUpload />
                      <span>{uploading ? 'Uploading...' : 'Select Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                    
                    {formData.image_url && (
                      <div className="mt-4">
                        <img 
                          src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${formData.image_url}`} 
                          alt="Preview" 
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={!formData.image_url || uploading}
                >
                  {uploading ? 'Uploading...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;