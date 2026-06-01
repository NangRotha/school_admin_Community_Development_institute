import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiEye, FiX, FiImage, FiUpload } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const News = () => {
  const { t } = useLanguage();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    title_kh: '',
    content: '',
    content_kh: '',
    images: [],
    author: 'Admin'
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await api.get('/news');
      setNews(response.data);
    } catch (error) {
      console.error('Fetch news error:', error);
      toast.error('Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);
    const formDataImages = new FormData();
    
    files.forEach(file => {
      formDataImages.append('files', file);
    });

    try {
      const response = await api.post('/news/upload-images', formDataImages, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const newImageUrls = response.data.image_urls;
      setFormData({
        ...formData,
        images: [...formData.images, ...newImageUrls]
      });
      
      toast.success(`${newImageUrls.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
      // Clear the file input
      e.target.value = '';
    }
  };

  const removeImage = (indexToRemove) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, index) => index !== indexToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('title_kh', formData.title_kh);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('content_kh', formData.content_kh);
      formDataToSend.append('author', formData.author);
      formDataToSend.append('images', JSON.stringify(formData.images));
      
      if (editingNews) {
        await api.put(`/news/${editingNews.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('News updated successfully');
      } else {
        await api.post('/news', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('News created successfully');
      }
      setShowForm(false);
      resetForm();
      fetchNews();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this news? This will also delete all associated images.')) {
      try {
        await api.delete(`/news/${id}`);
        toast.success('News deleted successfully');
        fetchNews();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete news');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      title_kh: '',
      content: '',
      content_kh: '',
      images: [],
      author: 'Admin'
    });
    setEditingNews(null);
  };

  const filteredNews = news.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">{t('news')}</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus />
          <span>{t('add')} {t('news')}</span>
        </button>
      </div>

      <div className="card">
        <div className="mb-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-80"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No news found. Click "Add News" to create your first news article.
            </div>
          ) : (
            filteredNews.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                {/* Image Gallery */}
                <div className="relative h-48 bg-gray-100">
                  {item.images && item.images.length > 0 ? (
                    <img 
                      src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${item.images[0].image_url}`} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <FiImage className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  {item.images && item.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      +{item.images.length - 1} more
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-3">{item.content}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <FiEye className="mr-1" />
                      {item.view_count} views
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingNews(item);
                          setFormData({
                            title: item.title,
                            title_kh: item.title_kh || '',
                            content: item.content,
                            content_kh: item.content_kh || '',
                            images: item.images?.map(img => img.image_url) || [],
                            author: item.author || 'Admin'
                          });
                          setShowForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* News Form Modal with Multiple Images */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold">{editingNews ? t('edit') : t('add')} {t('news')}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Title Fields */}
              <div className="grid grid-cols-2 gap-4">
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
                    placeholder="Enter news title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title (ភាសាខ្មែរ)
                  </label>
                  <input
                    type="text"
                    name="title_kh"
                    value={formData.title_kh}
                    onChange={handleChange}
                    className="input-field khmer-text"
                    placeholder="បញ្ចូលចំណងជើងព័ត៌មាន"
                  />
                </div>
              </div>
              
              {/* Multiple Images Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="flex items-center justify-center">
                    <label className="cursor-pointer bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                      <FiUpload />
                      <span>Select Images</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImages}
                      />
                    </label>
                    {uploadingImages && (
                      <div className="ml-4 text-primary-600 flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                        Uploading...
                      </div>
                    )}
                  </div>
                  
                  {/* Image Preview Grid */}
                  {formData.images.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">{formData.images.length} image(s) selected</p>
                      <div className="grid grid-cols-4 gap-3">
                        {formData.images.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img 
                              src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${img}`} 
                              alt={`Preview ${idx + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/100x100?text=Error';
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <FiX className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Content Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows="6"
                  className="input-field"
                  required
                  placeholder="Enter news content..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content (ភាសាខ្មែរ)
                </label>
                <textarea
                  name="content_kh"
                  value={formData.content_kh}
                  onChange={handleChange}
                  rows="6"
                  className="input-field khmer-text"
                  placeholder="បញ្ចូលមាតិកាព័ត៌មាន..."
                />
              </div>
              
              {/* Author Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Author
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter author name"
                />
              </div>
              
              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                  {t('cancel')}
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={formData.images.length === 0}
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default News;