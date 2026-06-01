// frontend-admin/src/pages/Students.jsx
import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import StudentForm from '../components/Students/StudentForm';

const Students = () => {
  const { t } = useLanguage();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(response.data);
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await api.delete(`/students/${id}`);
        toast.success('Student deleted successfully');
        fetchStudents();
      } catch (error) {
        toast.error('Failed to delete student');
      }
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/students/${id}/status?status=${status}`);
      toast.success(`Student ${status} successfully`);
      fetchStudents();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved':
        return { color: 'bg-green-100 text-green-800', icon: FiCheckCircle, label: 'Approved' };
      case 'rejected':
        return { color: 'bg-red-100 text-red-800', icon: FiXCircle, label: 'Rejected' };
      default:
        return { color: 'bg-yellow-100 text-yellow-800', icon: FiClock, label: 'Pending' };
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">{t('students')}</h1>
        <button
          onClick={() => {
            setEditingStudent(null);
            setShowForm(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus />
          <span>{t('add')} {t('students')}</span>
        </button>
      </div>

      <div className="card p-6">
        <div className="mb-4 flex flex-wrap gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-48"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">ID</th>
                <th className="table-header">{t('name')}</th>
                <th className="table-header">{t('email')}</th>
                <th className="table-header">{t('phone')}</th>
                <th className="table-header">Course</th>
                <th className="table-header">Status</th>
                <th className="table-header">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student) => {
                const StatusIcon = getStatusBadge(student.status).icon;
                return (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell">{student.id}</td>
                    <td className="table-cell">
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.name_kh}</p>
                      </div>
                    </td>
                    <td className="table-cell">{student.email}</td>
                    <td className="table-cell">{student.phone}</td>
                    <td className="table-cell">{student.course?.name || 'N/A'}</td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(student.status).color}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {student.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        <select
                          value={student.status}
                          onChange={(e) => handleUpdateStatus(student.id, e.target.value)}
                          className="text-xs border rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approve</option>
                          <option value="rejected">Reject</option>
                        </select>
                        <button
                          onClick={() => {
                            setEditingStudent(student);
                            setShowForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <StudentForm
          student={editingStudent}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            fetchStudents();
          }}
        />
      )}
    </div>
  );
};

export default Students;