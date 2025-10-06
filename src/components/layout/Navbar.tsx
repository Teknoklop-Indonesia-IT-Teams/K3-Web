import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Shield, Users, Clock, Heart, AlertTriangle, BookOpen, 
  BarChart3, ChevronLeft, ChevronRight, LogIn, LogOut 
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // REAL-TIME SYNC dengan localStorage
  useEffect(() => {
    const checkAuth = () => {
      try {
        const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const user = localStorage.getItem('user');
        
        console.log('Navbar auth check:', { loggedIn, user });
        
        setIsLoggedIn(loggedIn);
        if (user && user !== 'undefined') {
          setUserData(JSON.parse(user));
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsLoggedIn(false);
        setUserData(null);
      }
    };

    // Check pertama kali
    checkAuth();

    // Listen untuk storage changes
    const handleStorageChange = () => {
      console.log('Storage changed, re-checking auth...');
      checkAuth();
    };

    // Check setiap kali location berubah
    const handleLocationChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('popstate', handleLocationChange);
    
    // Check lebih sering untuk memastikan sync
    const interval = setInterval(checkAuth, 100);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('popstate', handleLocationChange);
      clearInterval(interval);
    };
  }, [location]);

  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      
      // Hapus SEMUA data sekaligus
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      // Update state immediately
      setIsLoggedIn(false);
      setUserData(null);
      
      console.log('LocalStorage cleared, navigating...');
      
      // Tunggu sebentar untuk memastikan state ter-update
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Navigate ke attendance tanpa reload dulu
      navigate('/attendance', { replace: true });
      
      // Refresh setelah navigasi selesai
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: force reload
      window.location.href = '/attendance';
    }
  };

  // Navigation items
  const fullNavigationItems = [
    { path: '/', label: 'Dashboard', icon: BarChart3 },
    { path: '/attendance', label: 'Absensi', icon: Clock },
    { path: '/health', label: 'Kesehatan', icon: Heart },
    { path: '/safety-reports', label: 'Laporan K3', icon: AlertTriangle },
    { path: '/employees', label: 'Karyawan', icon: Users },
    { path: '/training', label: 'Pelatihan', icon: BookOpen },
  ];

  const guestNavigationItems = [
    { path: '/attendance', label: 'Absensi', icon: Clock },
    { path: '/login', label: 'Login', icon: LogIn },
  ];

  const navigationItems = isLoggedIn ? fullNavigationItems : guestNavigationItems;

  console.log('Navbar render - isLoggedIn:', isLoggedIn, 'userData:', userData);

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className={`h-screen bg-white shadow-lg border-r border-gray-200 transition-all duration-300 fixed top-0 left-0 z-50 ${
        isOpen ? 'w-56' : 'w-16'
      }`}>
        
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            {isOpen && (
              <div>
                <h1 className="text-lg font-bold text-gray-900">Teknoklop</h1>
                <p className="text-xs text-gray-500">Manajemen K3</p>
              </div>
            )}
          </div>
          <button
            className="p-1 rounded-md hover:bg-gray-100"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <ChevronLeft className="h-5 w-5 text-gray-600" /> : <ChevronRight className="h-5 w-5 text-gray-600" />}
          </button>
        </div>

        {/* User Info */}
        {isLoggedIn && isOpen && userData?.name && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg mx-2">
            <p className="text-sm font-medium text-gray-900">{userData.name}</p>
            <p className="text-xs text-gray-500">{userData.role}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="mt-4 flex flex-col space-y-1 flex-1 pb-20">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-2 rounded-lg mx-2 transition-all duration-200 ${
                  isActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <Icon className="h-5 w-5 mr-2 flex-shrink-0" />
                {isOpen && <span className="text-sm font-medium truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        {isLoggedIn && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              <LogOut className="h-5 w-5 mr-2 flex-shrink-0" />
              {isOpen && <span className="text-sm font-medium">Logout</span>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};