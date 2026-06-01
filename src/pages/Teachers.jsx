import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import TeacherForm from '../components/Teachers/TeacherForm';

const Teachers = () => {
  const { t } = useLanguage();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await api.get('/teachers');
      setTeachers(response.data);
    } catch (error) {
      toast.error('Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await api.delete(`/teachers/${id}`);
        toast.success('Teacher deleted successfully');
        fetchTeachers();
      } catch (error) {
        toast.error('Failed to delete teacher');
      }
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">{t('teachers')}</h1>
        <button
          onClick={() => {
            setEditingTeacher(null);
            setShowForm(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus />
          <span>{t('add')} {t('teachers')}</span>
        </button>
      </div>

      <div className="card p-6">
        <div className="mb-4 flex justify-between items-center">
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

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">ID</th>
                <th className="table-header">{t('name')}</th>
                <th className="table-header">{t('position')}</th>
                <th className="table-header">{t('email')}</th>
                <th className="table-header">{t('phone')}</th>
                <th className="table-header">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                  <td className="table-cell">{teacher.id}</td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-3">
                     {teacher.image && (
                       <img src={`${(import.meta.env.VITE_API_URL || 'https://school-backend-community-development.onrender.com/api').replace('/api', '')}${teacher.image}`} alt={teacher.name} className="w-8 h-8 rounded-full object-cover" />
                     )}
                      <span className="font-medium">{teacher.name}</span>
                    </div>
                  </td>
                  <td className="table-cell">{teacher.position}</td>
                  <td className="table-cell">{teacher.email}</td>
                  <td className="table-cell">{teacher.phone}</td>
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingTeacher(teacher);
                          setShowForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(teacher.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <TeacherForm
          teacher={editingTeacher}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            fetchTeachers();
          }}
        />
      )}
    </div>
  );
};

export default Teachers;