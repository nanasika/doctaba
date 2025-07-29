import { Link, useLocation } from 'wouter';
import { Bell, User, ChevronDown, Calendar, FileText, MessageCircle, Home, Stethoscope, LogOut, Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  userName: string;
}

export default function Header({ userName }: HeaderProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  
  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'appointments', label: 'My Appointments', icon: Calendar, path: '/appointments' },
    { id: 'documents', label: 'My Documents', icon: FileText, path: '/documents' },
    { id: 'messages', label: 'Messages', icon: MessageCircle, path: '/messages', hasNotification: true },
  ];

  const isActivePage = (path: string) => {
    if (path === '/') {
      return location === '/' || location === '/home';
    }
    return location === path;
  };

  return (
    <header className="bg-cyan-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center space-x-2">
              <div className="bg-white rounded-full p-2">
                <Stethoscope className="h-6 w-6 text-cyan-600" />
              </div>
              <span className="text-xl font-bold">Doctaba</span>
            </a>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link key={item.id} href={item.path}>
                <a className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActivePage(item.path)
                    ? 'bg-cyan-700 text-white'
                    : 'text-cyan-100 hover:bg-cyan-700 hover:text-white'
                }`}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {item.hasNotification && (
                    <div className="bg-red-500 rounded-full w-2 h-2 ml-1"></div>
                  )}
                </a>
              </Link>
            ))}
          </nav>

          {/* Actions and User Profile */}
          <div className="flex items-center space-x-4">
            {/* Book Appointment Button - Only for patients */}
            {user?.userType === 'patient' && (
              <Link href="/book-appointment">
                <a className="bg-cyan-700 hover:bg-cyan-800 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 transition-colors">
                  <Plus className="h-4 w-4" />
                  <span>Book Appointment</span>
                </a>
              </Link>
            )}
            
            <div className="relative">
              <Bell className="h-5 w-5 text-cyan-100 hover:text-white cursor-pointer" />
              <div className="absolute -top-1 -right-1 bg-red-500 rounded-full w-3 h-3 flex items-center justify-center">
                <span className="text-xs font-bold text-white">3</span>
              </div>
            </div>
            <div className="relative">
              <User className="h-5 w-5 text-cyan-100 hover:text-white cursor-pointer" />
              <div className="absolute -top-1 -right-1 bg-red-500 rounded-full w-3 h-3 flex items-center justify-center">
                <span className="text-xs font-bold text-white">1</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 cursor-pointer hover:bg-cyan-700 rounded-md px-2 py-1">
              <span className="text-sm font-medium">{userName}</span>
              <ChevronDown className="h-4 w-4" />
            </div>
            <button 
              onClick={() => {
                fetch('/api/logout', { method: 'POST', credentials: 'same-origin' })
                  .then(() => {
                    window.location.reload();
                  });
              }}
              className="flex items-center space-x-1 p-2 text-cyan-100 hover:text-white hover:bg-cyan-700 rounded-md transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}