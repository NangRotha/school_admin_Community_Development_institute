import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiDollarSign, FiClock } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Courses = () => {
  const { t } = useLanguage();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    name_kh: '',
    description: '',
    description_kh: '',
    duration: '',
    fee: ''
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      console.log('Fetching courses...');
      const response = await api.get('/courses');
      console.log('Courses response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setCourses(response.data);
        console.log(`Loaded ${response.data.length} courses`);
      } else {
        setCourses([]);
      }
    } catch (error) {
      console.error('Fetch courses error:', error);
      toast.error('Failed to fetch courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.duration || !formData.fee) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      const dataToSend = {
        name: formData.name,
        name_kh: formData.name_kh,
        description: formData.description,
        description_kh: formData.description_kh,
        duration: formData.duration,
        fee: parseFloat(formData.fee)
      };
      
      console.log('Submitting course:', dataToSend);
      
      if (editingCourse) {
        await api.put(`/courses/${editingCourse.id}`, dataToSend);
        toast.success('Course updated successfully');
      } else {
        await api.post('/courses', dataToSend);
        toast.success('Course created successfully');
      }
      
      setShowForm(false);
      resetForm();
      await fetchCourses();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async (id, courseName) => {
    if (window.confirm(`Are you sure you want to delete "${courseName}"? This will also affect students enrolled in this course.`)) {
      try {
        await api.delete(`/courses/${id}`);
        toast.success('Course deleted successfully');
        await fetchCourses();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error(error.response?.data?.detail || 'Failed to delete course');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      name_kh: '',
      description: '',
      description_kh: '',
      duration: '',
      fee: ''
    });
    setEditingCourse(null);
  };

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.name_kh && course.name_kh.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">{t('courses')}</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus />
          <span>{t('add')} {t('courses')}</span>
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

        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FiBook className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Yet</h3>
            <p className="text-gray-500">Click "Add Course" to create your first course.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{course.name}</h3>
                      {course.name_kh && (
                        <p className="text-sm text-gray-500">{course.name_kh}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingCourse(course);
                          setFormData({
                            name: course.name,
                            name_kh: course.name_kh || '',
                            description: course.description || '',
                            description_kh: course.description_kh || '',
                            duration: course.duration,
                            fee: course.fee.toString()
                          });
                          setShowForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(course.id, course.name)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-gray-600">
                      <FiClock className="mr-2" />
                      <span className="text-sm">Duration: {course.duration}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FiDollarSign className="mr-2" />
                      <span className="text-sm">Fee: ${course.fee.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {course.description && (
                    <div className="border-t pt-3 mt-2">
                      <p className="text-sm text-gray-600 line-clamp-3">{course.description}</p>
                      {course.description_kh && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{course.description_kh}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">{editingCourse ? t('edit') : t('add')} {t('courses')}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                    required
                    placeholder="Enter course name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Name (Khmer)
                  </label>
                  <input
                    type="text"
                    name="name_kh"
                    value={formData.name_kh}
                    onChange={handleChange}
                    className="input-field khmer-text"
                    placeholder="បញ្ចូលឈ្មោះវគ្គសិក្សា"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="input-field"
                    required
                    placeholder="e.g., 4 months, 1 year"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fee (USD) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="fee"
                    value={formData.fee}
                    onChange={handleChange}
                    className="input-field"
                    required
                    placeholder="Enter fee amount"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="input-field"
                  placeholder="Enter course description..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Khmer)
                </label>
                <textarea
                  name="description_kh"
                  value={formData.description_kh}
                  onChange={handleChange}
                  rows="4"
                  className="input-field khmer-text"
                  placeholder="បញ្ចូលការពិពណ៌នាវគ្គសិក្សា..."
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

// Add FiBook icon if not imported
import { FiBook } from 'react-icons/fi';

export default Courses;