import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Calendar, Clock, User, Video, Phone, MapPin, Plus } from 'lucide-react';
import { apiRequest } from '../lib/queryClient';

interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  specialty: string;
  email: string;
}

interface BookAppointmentPageProps {
  currentUser: any;
}

export default function BookAppointmentPage({ currentUser }: BookAppointmentPageProps) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointmentType, setAppointmentType] = useState<'video' | 'phone' | 'in-person'>('video');
  const [notes, setNotes] = useState('');

  // Fetch all doctors
  const { data: doctors = [], isLoading: loadingDoctors } = useQuery<Doctor[]>({
    queryKey: ['/api/users'],
    select: (users: any[]) => users.filter(user => user.userType === 'doctor')
  });

  // Book appointment mutation
  const bookAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to book appointment');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      alert('Appointment booked successfully!');
      setLocation('/appointments');
    },
    onError: (error) => {
      console.error('Booking error:', error);
      alert('Failed to book appointment. Please try again.');
    }
  });

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDoctor || !appointmentDate || !appointmentTime) {
      alert('Please fill in all required fields');
      return;
    }

    bookAppointmentMutation.mutate({
      doctorId: selectedDoctor.id,
      patientId: currentUser.id,
      date: appointmentDate,
      time: appointmentTime,
      type: appointmentType,
      status: 'upcoming',
      specialty: selectedDoctor.specialty,
      notes: notes || null
    });
  };

  if (loadingDoctors) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="h-6 bg-gray-200 rounded w-48 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Book an Appointment</h1>
        <p className="text-gray-600">Choose a doctor and schedule your appointment.</p>
      </div>

      {!selectedDoctor ? (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Doctors</h2>
          
          {doctors.length === 0 ? (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No doctors available</h3>
              <p className="mt-1 text-sm text-gray-500">
                There are currently no doctors registered in the system.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-cyan-100 rounded-full p-2">
                      <User className="h-6 w-6 text-cyan-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Dr. {doctor.firstName} {doctor.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{doctor.specialty}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedDoctor(doctor)}
                    className="w-full bg-cyan-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-cyan-700 transition-colors"
                  >
                    Book Appointment
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-cyan-100 rounded-full p-2">
                  <User className="h-6 w-6 text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{selectedDoctor.specialty}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDoctor(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                Change Doctor
              </button>
            </div>
          </div>

          <form onSubmit={handleBookAppointment} className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Appointment Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time *
                </label>
                <select
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                >
                  <option value="">Select time</option>
                  <option value="9:00 AM">9:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="1:00 PM">1:00 PM</option>
                  <option value="2:00 PM">2:00 PM</option>
                  <option value="3:00 PM">3:00 PM</option>
                  <option value="4:00 PM">4:00 PM</option>
                  <option value="5:00 PM">5:00 PM</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Type
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'video', icon: Video, label: 'Video Call' },
                  { value: 'phone', icon: Phone, label: 'Phone Call' },
                  { value: 'in-person', icon: MapPin, label: 'In-Person' }
                ].map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setAppointmentType(value as any)}
                    className={`flex flex-col items-center p-4 border rounded-lg transition-colors ${
                      appointmentType === value
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Icon className="h-6 w-6 mb-2" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Any specific concerns or information for the doctor..."
              />
            </div>

            {bookAppointmentMutation.isError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                Failed to book appointment. Please check your details and try again.
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={bookAppointmentMutation.isPending}
                className="flex-1 bg-cyan-600 text-white px-4 py-2 rounded-md font-medium hover:bg-cyan-700 transition-colors disabled:opacity-50"
              >
                {bookAppointmentMutation.isPending ? 'Booking...' : 'Book Appointment'}
              </button>
              <button
                type="button"
                onClick={() => setLocation('/appointments')}
                className="px-4 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}