import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiDownload } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Results = () => {
  const { t } = useLanguage();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingResult, setEditingResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    student_name: '',
    exam_name: '',
    exam_name_kh: '',
    subject: '',
    score: '',
    total_score: '',
    grade: ''
  });

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      console.log('Fetching exam results...');
      const response = await api.get('/results');
      console.log('Results response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setResults(response.data);
        console.log(`Loaded ${response.data.length} exam results`);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Fetch results error:', error);
      toast.error('Failed to fetch exam results');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateGrade = () => {
    const score = parseFloat(formData.score);
    const total = parseFloat(formData.total_score);
    if (isNaN(score) || isNaN(total) || total === 0) return '';
    
    const percentage = (score / total) * 100;
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const grade = calculateGrade();
    const dataToSend = {
      student_name: formData.student_name,
      exam_name: formData.exam_name,
      exam_name_kh: formData.exam_name_kh,
      subject: formData.subject,
      score: parseFloat(formData.score),
      total_score: parseFloat(formData.total_score),
      grade: grade
    };
    
    try {
      console.log('Submitting result:', dataToSend);
      
      if (editingResult) {
        await api.put(`/results/${editingResult.id}`, dataToSend);
        toast.success('Result updated successfully');
      } else {
        await api.post('/results', dataToSend);
        toast.success('Result added successfully');
      }
      
      setShowForm(false);
      resetForm();
      await fetchResults();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this result?')) {
      try {
        await api.delete(`/results/${id}`);
        toast.success('Result deleted successfully');
        await fetchResults();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete result');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      student_name: '',
      exam_name: '',
      exam_name_kh: '',
      subject: '',
      score: '',
      total_score: '',
      grade: ''
    });
    setEditingResult(null);
  };

  const filteredResults = results.filter(result =>
    result.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (result.exam_name && result.exam_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getGradeColor = (grade) => {
    switch(grade) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D': return 'bg-orange-100 text-orange-800';
      case 'F': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">{t('results')}</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus />
          <span>Add Result</span>
        </button>
      </div>

      <div className="card p-6">
        <div className="mb-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name or exam..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-80"
            />
          </div>
        </div>

        {filteredResults.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FiDownload className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Exam Results</h3>
            <p className="text-gray-500">Click "Add Result" to add your first exam result.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Student Name</th>
                  <th className="table-header">Exam Name</th>
                  <th className="table-header">Subject</th>
                  <th className="table-header">Score</th>
                  <th className="table-header">Grade</th>
                  <th className="table-header">Date</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredResults.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell">
                      <div>
                        <p className="font-medium">{result.student_name}</p>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div>
                        <p>{result.exam_name}</p>
                        {result.exam_name_kh && (
                          <p className="text-xs text-gray-500">{result.exam_name_kh}</p>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">{result.subject}</td>
                    <td className="table-cell">
                      {result.score} / {result.total_score}
                      <span className="text-xs text-gray-500 ml-1">
                        ({((result.score / result.total_score) * 100).toFixed(1)}%)
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${getGradeColor(result.grade)}`}>
                        {result.grade}
                      </span>
                    </td>
                    <td className="table-cell">
                      {result.publish_date && new Date(result.publish_date).toLocaleDateString()}
                    </td>
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingResult(result);
                            setFormData({
                              student_name: result.student_name,
                              exam_name: result.exam_name,
                              exam_name_kh: result.exam_name_kh || '',
                              subject: result.subject,
                              score: result.score.toString(),
                              total_score: result.total_score.toString(),
                              grade: result.grade
                            });
                            setShowForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleDelete(result.id)}
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
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">{editingResult ? 'Edit' : 'Add'} Exam Result</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="student_name"
                  value={formData.student_name}
                  onChange={handleChange}
                  className="input-field"
                  required
                  placeholder="Enter student name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="exam_name"
                  value={formData.exam_name}
                  onChange={handleChange}
                  className="input-field"
                  required
                  placeholder="Enter exam name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Name (Khmer)
                </label>
                <input
                  type="text"
                  name="exam_name_kh"
                  value={formData.exam_name_kh}
                  onChange={handleChange}
                  className="input-field khmer-text"
                  placeholder="បញ្ចូលឈ្មោះប្រឡង"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="input-field"
                  required
                  placeholder="Enter subject"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="score"
                    value={formData.score}
                    onChange={handleChange}
                    className="input-field"
                    required
                    placeholder="Score"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Score <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="total_score"
                    value={formData.total_score}
                    onChange={handleChange}
                    className="input-field"
                    required
                    placeholder="Total"
                    step="0.01"
                  />
                </div>
              </div>
              
              {formData.score && formData.total_score && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Grade: <span className="font-bold text-lg">{calculateGrade()}</span>
                    {' '}
                    ({((parseFloat(formData.score) / parseFloat(formData.total_score)) * 100).toFixed(1)}%)
                  </p>
                </div>
              )}
              
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

export default Results;