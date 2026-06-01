import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiCalendar, FiMapPin } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import { uploadImage } from '../services/upload';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { format } from 'date-fns';

const Events = () => {
  const { t } = useLanguage();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    title_kh: '',
    description: '',
    description_kh: '',
    location: '',
    location_kh: '',
    start_date: '',
    end_date: '',
    image_url: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      console.log('Fetching events...');
      const response = await api.get('/events');
      console.log('Events response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setEvents(response.data);
        console.log(`Loaded ${response.data.length} events`);
      } else {
        setEvents([]);
        console.log('No events data or invalid format');
      }
    } catch (error) {
      console.error('Fetch events error:', error);
      toast.error('Failed to fetch events');
      setEvents([]);
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
      try {
        const uploadRes = await uploadImage(file);
        setFormData({ ...formData, image_url: uploadRes.logo_url || uploadRes.image_url });
        toast.success('Image uploaded successfully');
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload image');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const dataToSend = {
        title: formData.title,
        title_kh: formData.title_kh,
        description: formData.description,
        description_kh: formData.description_kh,
        location: formData.location,
        location_kh: formData.location_kh,
        start_date: formData.start_date,
        end_date: formData.end_date,
        image_url: formData.image_url
      };
      
      console.log('Submitting event data:', dataToSend);
      
      if (editingEvent) {
        const response = await api.put(`/events/${editingEvent.id}`, dataToSend);
        console.log('Update response:', response.data);
        toast.success('Event updated successfully');
      } else {
        const response = await api.post('/events', dataToSend);
        console.log('Create response:', response.data);
        toast.success('Event created successfully');
      }
      
      setShowForm(false);
      resetForm();
      await fetchEvents(); // Refresh the list
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await api.delete(`/events/${id}`);
        toast.success('Event deleted successfully');
        await fetchEvents(); // Refresh the list
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete event');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      title_kh: '',
      description: '',
      description_kh: '',
      location: '',
      location_kh: '',
      start_date: '',
      end_date: '',
      image_url: ''
    });
    setImageFile(null);
    setEditingEvent(null);
  };

  const filteredEvents = events.filter(event =>
    event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.title_kh && event.title_kh.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">{t('events')}</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus />
          <span>{t('add')} {t('events')}</span>
        </button>
      </div>

      <div className="card p-6">
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

        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FiCalendar className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Yet</h3>
            <p className="text-gray-500">Click "Add Event" to create your first event.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                {event.image_url && (
                  <img 
                    src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${event.image_url}`} 
                    alt={event.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{event.title}</h3>
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <FiCalendar className="mr-2 flex-shrink-0" />
                    <span>
                      {event.start_date && format(new Date(event.start_date), 'PPP')}
                      {event.end_date && event.end_date !== event.start_date && 
                        ` - ${format(new Date(event.end_date), 'PPP')}`
                      }
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm mb-3">
                    <FiMapPin className="mr-2 flex-shrink-0" />
                    <span className="truncate">{event.location || 'No location specified'}</span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                    {event.description || 'No description available'}
                  </p>
                  <div className="flex justify-end space-x-2 pt-2 border-t">
                    <button
                      onClick={() => {
                        setEditingEvent(event);
                        setFormData({
                          title: event.title || '',
                          title_kh: event.title_kh || '',
                          description: event.description || '',
                          description_kh: event.description_kh || '',
                          location: event.location || '',
                          location_kh: event.location_kh || '',
                          start_date: event.start_date ? event.start_date.split('T')[0] : '',
                          end_date: event.end_date ? event.end_date.split('T')[0] : '',
                          image_url: event.image_url || ''
                        });
                        setShowForm(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Form - Same as before */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">{editingEvent ? 'Edit' : 'Add'} Event</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title (Khmer)</label>
                  <input
                    type="text"
                    name="title_kh"
                    value={formData.title_kh}
                    onChange={handleChange}
                    className="input-field khmer-text"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location (Khmer)</label>
                  <input
                    type="text"
                    name="location_kh"
                    value={formData.location_kh}
                    onChange={handleChange}
                    className="input-field khmer-text"
                  />
                </div>
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
                  <img 
                    src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${formData.image_url}`} 
                    alt="Preview" 
                    className="mt-2 w-32 h-32 object-cover rounded"
                  />
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Khmer)</label>
                <textarea
                  name="description_kh"
                  value={formData.description_kh}
                  onChange={handleChange}
                  rows="4"
                  className="input-field khmer-text"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t">
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

export default Events;