// frontend-admin/src/pages/ContactMessages.jsx
import React, { useState, useEffect } from 'react';
import { 
  FiMail, FiMessageSquare, FiUser, FiTrash2, FiEye, 
  FiCheckCircle, FiXCircle, FiClock, FiSearch,
  FiRefreshCw, FiSend, FiStar, FiInbox
} from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const ContactMessages = () => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
    replied: 0
  });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get('/contacts');
      const data = response.data || [];
      setMessages(data);
      
      // Calculate stats
      setStats({
        total: data.length,
        unread: data.filter(m => m.status === 'unread').length,
        read: data.filter(m => m.status === 'read').length,
        replied: data.filter(m => m.status === 'replied').length
      });
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/contacts/${id}/status`, { status });
      toast.success(`Message marked as ${status}`);
      fetchMessages();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await api.delete(`/contacts/${id}`);
        toast.success('Message deleted successfully');
        fetchMessages();
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
      } catch (error) {
        toast.error('Failed to delete message');
      }
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      unread: { color: 'bg-red-100 text-red-800', icon: FiMail, label: 'Unread' },
      read: { color: 'bg-blue-100 text-blue-800', icon: FiEye, label: 'Read' },
      replied: { color: 'bg-green-100 text-green-800', icon: FiCheckCircle, label: 'Replied' }
    };
    const badge = badges[status] || badges.unread;
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        <badge.icon className="w-3 h-3" />
        <span>{badge.label}</span>
      </span>
    );
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          message.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          message.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Contact Messages</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and respond to contact form submissions</p>
        </div>
        <button
          onClick={fetchMessages}
          className="btn-secondary flex items-center space-x-2"
        >
          <FiRefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-primary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Messages</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <FiInbox className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Unread</p>
              <p className="text-2xl font-bold text-red-600">{stats.unread}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <FiMail className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Read</p>
              <p className="text-2xl font-bold text-blue-600">{stats.read}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FiEye className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Replied</p>
              <p className="text-2xl font-bold text-green-600">{stats.replied}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email or subject..."
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
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
          </select>
        </div>
      </div>

      {/* Messages Table */}
      <div className="card overflow-hidden">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-12">
            <FiMessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Messages</h3>
            <p className="text-gray-500">No contact messages found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Status</th>
                  <th className="table-header">Name</th>
                  <th className="table-header">Email</th>
                  <th className="table-header">Subject</th>
                  <th className="table-header">Date</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMessages.map((message) => (
                  <tr key={message.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell">
                      {getStatusBadge(message.status || 'unread')}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <FiUser className="w-4 h-4 text-primary-600" />
                        </div>
                        <span className="font-medium">{message.name}</span>
                      </div>
                    </td>
                    <td className="table-cell text-sm text-gray-600">{message.email}</td>
                    <td className="table-cell">
                      <p className="font-medium text-gray-900 max-w-xs truncate">{message.subject}</p>
                      <p className="text-xs text-gray-500 truncate">{message.message?.substring(0, 50)}...</p>
                    </td>
                    <td className="table-cell text-sm text-gray-500">
                      {new Date(message.created_at).toLocaleDateString()}
                    </td>
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedMessage(message)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <FiEye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(message.id, 'replied')}
                          className="text-green-600 hover:text-green-800"
                          title="Mark as Replied"
                        >
                          <FiSend className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(message.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <FiTrash2 className="w-5 h-5" />
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

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <FiMail className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-bold">Message Details</h2>
              </div>
              <button onClick={() => setSelectedMessage(null)} className="text-gray-400 hover:text-gray-600">
                <FiXCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Sender Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">Name</label>
                    <p className="font-medium text-gray-900">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Email</label>
                    <p className="font-medium text-gray-900">{selectedMessage.email}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Subject</label>
                    <p className="font-medium text-gray-900">{selectedMessage.subject}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Date</label>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedMessage.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Message</label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => handleUpdateStatus(selectedMessage.id, 'read')}
                  className="btn-secondary"
                >
                  Mark as Read
                </button>
                <button
                  onClick={() => {
                    window.location.href = `mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`;
                    handleUpdateStatus(selectedMessage.id, 'replied');
                  }}
                  className="btn-primary"
                >
                  Reply via Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactMessages;