import React from 'react';
import { Calendar, FileText, MessageCircle, Users, TrendingUp, Clock } from 'lucide-react';

interface HomePageProps {
  onPageChange: (page: string) => void;
  userName: string;
}

export default function HomePage({ onPageChange, userName }: HomePageProps) {
  const quickStats = [
    {
      title: 'Upcoming Appointments',
      value: '3',
      change: '+2 from last week',
      icon: Calendar,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Patients',
      value: '127',
      change: '+12 this month',
      icon: Users,
      color: 'bg-green-500'
    },
    {
      title: 'Unread Messages',
      value: '8',
      change: '5 urgent',
      icon: MessageCircle,
      color: 'bg-orange-500'
    },
    {
      title: 'Documents',
      value: '45',
      change: '+3 recent',
      icon: FileText,
      color: 'bg-purple-500'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'appointment',
      message: 'Video call with John Smith completed',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'message',
      message: 'New message from Mary Johnson',
      time: '4 hours ago'
    },
    {
      id: 3,
      type: 'document',
      message: 'Lab results uploaded for Robert Brown',
      time: '1 day ago'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {userName}!
        </h1>
        <p className="text-gray-600">Here's what's happening with your practice today.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.change}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => onPageChange('appointments')}
              className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-cyan-600" />
                <span className="font-medium">View My Appointments</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>
            
            <button
              onClick={() => onPageChange('messages')}
              className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <MessageCircle className="h-5 w-5 text-cyan-600" />
                <span className="font-medium">Check Messages</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>
            
            <button
              onClick={() => onPageChange('documents')}
              className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-cyan-600" />
                <span className="font-medium">Review Documents</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="bg-cyan-100 rounded-full p-2">
                  <Clock className="h-4 w-4 text-cyan-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}