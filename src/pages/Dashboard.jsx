import React, { useState, useEffect } from 'react';
import { FiUsers, FiUserPlus, FiBookOpen, FiClock } from 'react-icons/fi';
import StatCard from '../components/Dashboard/StatCard';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentStudents, setRecentStudents] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, studentsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/students?limit=5')
      ]);
      setStats(statsRes.data);
      setRecentStudents(studentsRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const chartData = [
    { month: 'Jan', students: 65, teachers: 12 },
    { month: 'Feb', students: 75, teachers: 14 },
    { month: 'Mar', students: 85, teachers: 15 },
    { month: 'Apr', students: 95, teachers: 16 },
    { month: 'May', students: 110, teachers: 18 },
    { month: 'Jun', students: 125, teachers: 20 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('totalStudents')}
          value={stats?.total_students || 0}
          icon={FiUsers}
          color="blue"
          trend="up"
          trendValue="+12%"
        />
        <StatCard
          title={t('totalTeachers')}
          value={stats?.total_teachers || 0}
          icon={FiUserPlus}
          color="green"
          trend="up"
          trendValue="+5%"
        />
        <StatCard
          title={t('totalCourses')}
          value={stats?.total_courses || 0}
          icon={FiBookOpen}
          color="purple"
        />
        <StatCard
          title={t('pendingRegistrations')}
          value={stats?.pending_registrations || 0}
          icon={FiClock}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Student Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="students" stroke="#3b82f6" />
              <Line type="monotone" dataKey="teachers" stroke="#10b981" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Registrations</h3>
          <div className="space-y-3">
            {recentStudents.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{student.name}</p>
                  <p className="text-sm text-gray-600">{student.email}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  student.status === 'approved' ? 'bg-green-100 text-green-800' :
                  student.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {student.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;