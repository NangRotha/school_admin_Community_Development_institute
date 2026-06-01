import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiSearch } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Classes = () => {
  const { t } = useLanguage();
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    name_kh: '',
    grade: '',
    teacher_id: '',
    total_students: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching classes...');
      
      const [classesRes, teachersRes] = await Promise.all([
        api.get('/classes'),
        api.get('/teachers')
      ]);
      
      console.log('Classes response:', classesRes.data);
      console.log('Teachers response:', teachersRes.data);
      
      setClasses(classesRes.data || []);
      setTeachers(teachersRes.data || []);
    } catch (error) {
      console.error('Fetch data error:', error);
      toast.error('Failed to fetch data');
      setClasses([]);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.grade || !formData.teacher_id) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      const dataToSend = {
        name: formData.name,
        name_kh: formData.name_kh,
        grade: formData.grade,
        teacher_id: parseInt(formData.teacher_id),
        total_students: parseInt(formData.total_students) || 0
      };
      
      console.log('Submitting class:', dataToSend);
      
      if (editingClass) {
        await api.put(`/classes/${editingClass.id}`, dataToSend);
        toast.success('Class updated successfully');
      } else {
        await api.post('/classes', dataToSend);
        toast.success('Class created successfully');
      }
      
      setShowForm(false);
      resetForm();
      await fetchData();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async (id, className) => {
    if (window.confirm(`Are you sure you want to delete "${className}"?`)) {
      try {
        await api.delete(`/classes/${id}`);
        toast.success('Class deleted successfully');
        await fetchData();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error(error.response?.data?.detail || 'Failed to delete class');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      name_kh: '',
      grade: '',
      teacher_id: '',
      total_students: 0
    });
    setEditingClass(null);
  };

  const filteredClasses = classes.filter(classItem =>
    classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (classItem.name_kh && classItem.name_kh.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (classItem.grade && classItem.grade.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">{t('classes')}</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus />
          <span>{t('add')} {t('classes')}</span>
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

        {filteredClasses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FiUsers className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Yet</h3>
            <p className="text-gray-500">Click "Add Class" to create your first class.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((classItem) => (
              <div key={classItem.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{classItem.name}</h3>
                      {classItem.name_kh && (
                        <p className="text-sm text-gray-500">{classItem.name_kh}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingClass(classItem);
                          setFormData({
                            name: classItem.name,
                            name_kh: classItem.name_kh || '',
                            grade: classItem.grade,
                            teacher_id: classItem.teacher_id?.toString() || '',
                            total_students: classItem.total_students || 0
                          });
                          setShowForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(classItem.id, classItem.name)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Grade:</span>
                      <span className="font-medium">{classItem.grade}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Teacher:</span>
                      <span className="font-medium">{classItem.teacher?.name || 'Not assigned'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Students:</span>
                      <span className="font-medium">{classItem.total_students || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">{editingClass ? t('edit') : t('add')} {t('classes')}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  required
                  placeholder="e.g., Grade 10A"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Name (Khmer)
                </label>
                <input
                  type="text"
                  name="name_kh"
                  value={formData.name_kh}
                  onChange={handleChange}
                  className="input-field khmer-text"
                  placeholder="បញ្ចូលឈ្មោះថ្នាក់"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  className="input-field"
                  required
                  placeholder="e.g., Grade 10"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teacher <span className="text-red-500">*</span>
                </label>
                <select
                  name="teacher_id"
                  value={formData.teacher_id}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">Select Teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} - {teacher.position}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Students
                </label>
                <input
                  type="number"
                  name="total_students"
                  value={formData.total_students}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Number of students"
                  min="0"
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

export default Classes;