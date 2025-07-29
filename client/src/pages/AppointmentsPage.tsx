import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, User, Video, Phone, MapPin, MoreVertical, Plus } from 'lucide-react';

interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  patientName: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  type: 'video' | 'phone' | 'in-person';
  specialty?: string;
  notes?: string;
}

interface AppointmentsPageProps {
  onJoinCall: (appointmentId: string) => void;
  userType: 'patient' | 'doctor';
}

export default function AppointmentsPage({ onJoinCall, userType }: AppointmentsPageProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [, setLocation] = useLocation();

  // Fetch appointments from API
  const { data: appointments = [], isLoading, error } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments'],
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="h-6 bg-gray-200 rounded w-48 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-64"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="text-red-500 text-lg font-medium">Failed to load appointments</div>
          <p className="text-gray-500 mt-2">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const upcomingAppointments = appointments.filter(apt => apt.status === 'upcoming');
  const pastAppointments = appointments.filter(apt => apt.status === 'completed');

  const handleJoinCall = (appointmentId: number) => {
    onJoinCall(appointmentId.toString());
    setLocation(`/video-call/${appointmentId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'in-person': return <MapPin className="h-4 w-4" />;
      default: return <Video className="h-4 w-4" />;
    }
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className="flex items-center space-x-2">
              {getTypeIcon(appointment.type)}
              <span className="font-semibold text-gray-900">
                {userType === 'patient' ? appointment.doctorName : appointment.patientName}
              </span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </span>
          </div>
          
          {appointment.doctorSpecialty && (
            <p className="text-sm text-gray-600 mb-2">{appointment.doctorSpecialty}</p>
          )}
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{appointment.date}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{appointment.time}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {appointment.status === 'upcoming' && (
            <button
              onClick={() => handleJoinCall(appointment.id)}
              className="bg-cyan-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-cyan-700 transition-colors"
            >
              Join Call
            </button>
          )}
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
        <p className="text-gray-600">Manage your appointments and join video calls.</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upcoming'
                  ? 'border-cyan-500 text-cyan-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Upcoming ({upcomingAppointments.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'past'
                  ? 'border-cyan-500 text-cyan-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Past ({pastAppointments.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {activeTab === 'upcoming' ? (
          upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))
          ) : (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming appointments</h3>
              <p className="mt-1 text-sm text-gray-500 mb-4">
                {userType === 'patient' 
                  ? 'Book your first appointment to get started.' 
                  : 'Patients can book appointments with you from the booking page.'}
              </p>
              {userType === 'patient' && (
                <Link href="/book-appointment">
                  <a className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Book Appointment
                  </a>
                </Link>
              )}
            </div>
          )
        ) : (
          pastAppointments.length > 0 ? (
            pastAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))
          ) : (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No past appointments</h3>
              <p className="mt-1 text-sm text-gray-500 mb-4">
                Your appointment history will appear here.
              </p>
              {userType === 'patient' && (
                <Link href="/book-appointment">
                  <a className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Book Your First Appointment
                  </a>
                </Link>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}