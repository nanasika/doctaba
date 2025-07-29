import { Link } from 'wouter';
import { Calendar, FileText, MessageCircle, Users, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';

export default function HomePage() {
  const { user } = useAuth();
  const userName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email || 'User';
  
  // Fetch appointments data
  const { data: appointments = [] } = useQuery<any[]>({
    queryKey: ['/api/appointments'],
    enabled: !!user
  });

  // Fetch messages data
  const { data: messages = [] } = useQuery<any[]>({
    queryKey: ['/api/messages'],
    enabled: !!user
  });

  // Calculate stats from real data
  const upcomingAppointments = appointments.filter((apt: any) => 
    apt.status === 'upcoming' && new Date(apt.date) >= new Date()
  );
  
  const unreadMessages = messages.filter((msg: any) => !msg.read);
  const urgentMessages = messages.filter((msg: any) => !msg.read && msg.priority === 'urgent');
  
  // Get unique patients/doctors count based on user type
  const uniqueConnections = new Set(
    appointments.map((apt: any) => 
      user?.userType === 'doctor' ? apt.patientId : apt.doctorId
    )
  ).size;

  const quickStats = [
    {
      title: 'Upcoming Appointments',
      value: upcomingAppointments.length.toString(),
      change: upcomingAppointments.length > 0 ? `${upcomingAppointments.length} scheduled` : 'No appointments',
      icon: Calendar,
      color: 'bg-blue-500',
      link: '/appointments'
    },
    {
      title: user?.userType === 'doctor' ? 'Total Patients' : 'Connected Doctors',
      value: uniqueConnections.toString(),
      change: uniqueConnections > 0 ? `${uniqueConnections} connections` : 'No connections yet',
      icon: Users,
      color: 'bg-green-500'
    },
    {
      title: 'Unread Messages',
      value: unreadMessages.length.toString(),
      change: urgentMessages.length > 0 ? `${urgentMessages.length} urgent` : 'All caught up',
      icon: MessageCircle,
      color: 'bg-orange-500',
      link: '/messages'
    },
    {
      title: 'Documents',
      value: '0',
      change: 'Coming soon',
      icon: FileText,
      color: 'bg-purple-500',
      link: '/documents'
    }
  ];

  // Generate recent activity from real data
  const recentActivity = [
    ...appointments.slice(0, 2).map((apt: any, index: number) => ({
      id: `apt-${index}`,
      type: 'appointment',
      message: `${apt.type === 'video' ? 'Video call' : apt.type === 'phone' ? 'Phone call' : 'In-person appointment'} with ${
        user?.userType === 'doctor' ? apt.patientName : apt.doctorName
      } - ${apt.status}`,
      time: new Date(apt.date).toLocaleDateString()
    })),
    ...messages.slice(0, 2).map((msg: any, index: number) => ({
      id: `msg-${index}`,
      type: 'message',
      message: `Message from ${msg.senderName || 'Unknown'}: ${msg.content?.substring(0, 50)}...`,
      time: new Date(msg.createdAt || Date.now()).toLocaleDateString()
    }))
  ].slice(0, 3);

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
            <Link href="/appointments">
              <a className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-cyan-600" />
                  <span className="font-medium">View My Appointments</span>
                </div>
                <span className="text-gray-400">→</span>
              </a>
            </Link>
            
            <Link href="/messages">
              <a className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <MessageCircle className="h-5 w-5 text-cyan-600" />
                  <span className="font-medium">Check Messages</span>
                </div>
                <span className="text-gray-400">→</span>
              </a>
            </Link>
            
            <Link href="/documents">
              <a className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-cyan-600" />
                  <span className="font-medium">Review Documents</span>
                </div>
                <span className="text-gray-400">→</span>
              </a>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-cyan-600 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {user?.userType === 'patient' 
                    ? 'Book your first appointment to see activity here.' 
                    : 'Activity will appear here when patients interact with you.'}
                </p>
                {user?.userType === 'patient' && (
                  <div className="mt-4">
                    <Link href="/book-appointment">
                      <a className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700">
                        Book Appointment
                      </a>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}