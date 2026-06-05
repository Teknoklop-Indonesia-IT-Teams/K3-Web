import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Shield,
  Users,
  Clock,
  Heart,
  AlertTriangle,
  BookOpen,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react";
import Swal from "sweetalert2";

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      if (!mobile && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, [isMobileOpen]);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const loggedIn = localStorage.getItem("isLoggedIn") === "true";
        const user = localStorage.getItem("user");

        setIsLoggedIn(loggedIn);
        if (user && user !== "undefined") {
          setUserData(JSON.parse(user));
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        setIsLoggedIn(false);
        setUserData(null);
      }
    };

    checkAuth();

    const handleStorageChange = () => {
      checkAuth();
    };

    const handleLocationChange = () => {
      checkAuth();
      if (isMobile) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("popstate", handleLocationChange);

    const interval = setInterval(checkAuth, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("popstate", handleLocationChange);
      clearInterval(interval);
    };
  }, [location, isMobile]);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "Apakah Anda yakin ingin keluar dari akun?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Logout",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      setIsLoggedIn(false);
      setUserData(null);

      await Swal.fire({
        title: "Berhasil Logout",
        text: "Anda telah keluar dari sistem",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/", { replace: true });

      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error("Logout error:", error);

      Swal.fire({
        title: "Logout Gagal",
        text: "Terjadi kesalahan saat logout",
        icon: "error",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  const fullNavigationItems = [
    { path: "/", label: "Dashboard", icon: BarChart3 },
    { path: "/attendance", label: "Absensi", icon: Clock },
    { path: "/health", label: "Kesehatan", icon: Heart },
    { path: "/safety-reports", label: "Laporan K3", icon: AlertTriangle },
    { path: "/employees", label: "Karyawan", icon: Users },
    { path: "/training", label: "Pelatihan", icon: BookOpen },
  ];

  const guestNavigationItems = [
    { path: "/attendance", label: "Absensi", icon: Clock },
    { path: "/login", label: "Login", icon: LogIn },
  ];

  const navigationItems = isLoggedIn
    ? fullNavigationItems
    : guestNavigationItems;

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const toggleDesktopSidebar = () => {
    setIsDesktopOpen(!isDesktopOpen);
  };

  const isSidebarOpen = isMobile ? isMobileOpen : isDesktopOpen;
  const sidebarWidth = isMobile ? "w-64" : isDesktopOpen ? "w-56" : "w-16";

  return (
    <>
      {isMobile && (
        <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white shadow-md border-b border-gray-200 z-50 flex items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">
                Teknoklop
              </h1>
              <p className="text-xs text-gray-500 truncate">Manajemen K3</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isLoggedIn && userData?.name && (
              <div className="hidden sm:flex items-center space-x-2 bg-gray-100 px-2 py-1 rounded-lg">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-xs text-gray-700 truncate max-w-20">
                  {userData.name.split(" ")[0]}
                </span>
              </div>
            )}

            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              {isMobileOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      )}

      <div
        className={`
          h-screen bg-white shadow-lg border-r border-gray-200 transition-all duration-300 z-40 pt-16 lg:pt-0
          ${
            isMobile
              ? `fixed top-0 left-0 transform ${
                  isMobileOpen ? "translate-x-0" : "-translate-x-full"
                } lg:translate-x-0`
              : "fixed lg:relative"
          }
          ${sidebarWidth}
        `}
      >
        {!isMobile && (
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              {isDesktopOpen && (
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-bold text-gray-900">Teknoklop</h1>
                  <p className="text-xs text-gray-500">Manajemen K3</p>
                </div>
              )}
            </div>
            {isDesktopOpen && (
              <button
                className="p-1 rounded-md hover:bg-gray-100 transition-colors flex-shrink-0"
                onClick={toggleDesktopSidebar}
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
            )}
          </div>
        )}

        {!isMobile && !isDesktopOpen && (
          <div className="flex flex-col items-center py-4 border-b border-gray-200">
            <button
              className="p-2 rounded-md hover:bg-gray-100 transition-colors mb-2"
              onClick={toggleDesktopSidebar}
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
            <div className="bg-blue-600 p-2 rounded-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
          </div>
        )}

        {isLoggedIn && isSidebarOpen && userData?.name && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg mx-2 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userData.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {userData.role || "User"}
                </p>
              </div>
            </div>
          </div>
        )}

        {!isMobile && !isDesktopOpen && isLoggedIn && userData?.name && (
          <div className="mt-4 p-2 flex justify-center">
            <div
              className="bg-blue-100 p-2 rounded-full cursor-help"
              title={`${userData.name} - ${userData.role || "User"}`}
            >
              <User className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        )}

        <nav className="mt-4 flex flex-col space-y-1 flex-1 pb-20">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => isMobile && setIsMobileOpen(false)}
                className={`flex items-center px-4 py-3 rounded-lg mx-2 transition-all duration-200 group ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                }`}
                title={!isSidebarOpen ? item.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {isSidebarOpen && (
                  <span className="ml-3 text-sm font-medium truncate">
                    {item.label}
                  </span>
                )}
                {!isMobile && !isDesktopOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {isLoggedIn && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
              title={!isSidebarOpen ? "Logout" : undefined}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {isSidebarOpen && (
                <span className="ml-3 text-sm font-medium">Logout</span>
              )}
              {!isMobile && !isDesktopOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                  Logout
                </div>
              )}
            </button>
          </div>
        )}
      </div>

      {isMobile && isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};
