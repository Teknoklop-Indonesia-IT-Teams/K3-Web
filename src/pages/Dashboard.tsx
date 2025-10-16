import React, { useEffect, useState } from "react";
import { Users, Heart, AlertTriangle, UserCheck } from "lucide-react";
import { AttendanceChart } from "../components/dashboard/AttendanceChart";
import { RecentActivity } from "../components/dashboard/RecentActivity";

export const Dashboard: React.FC = () => {
  const [attendance, setAttendance] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [safety, setSafety] = useState<any>(null);
  const [employees, setEmployees] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [attRes, healthRes, safetyRes, empRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE}/api/attendance/stats`).then(
            (r) => r.json()
          ),
          fetch(`${import.meta.env.VITE_API_BASE}/api/health/stats`).then((r) =>
            r.json()
          ),
          fetch(
            `${import.meta.env.VITE_API_BASE}/api/safety/reports/stats`
          ).then((r) => r.json()),
          fetch(`${import.meta.env.VITE_API_BASE}/api/employees/stats`).then(
            (r) => r.json()
          ),
        ]);

        setAttendance(attRes);
        setHealth(healthRes);
        setSafety(safetyRes);
        setEmployees(empRes);
      } catch (err) {
        console.error("❌ Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 lg:pt-0 lg:pl-0">
        <div className="p-4 sm:p-6">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-lg ml-2"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Chart & Activity Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-80 animate-pulse"></div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-80 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 lg:pt-0">
      <div className="p-4 lg:pr-14 lg:pb-4 sm:pt-6 lg:pt-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Ringkasan kondisi karyawan dan sistem
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {/* Hadir Hari Ini */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">
                  Hadir Hari Ini
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {attendance?.hadir_hari_ini || 0}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg ml-2 flex-shrink-0">
                <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Checkup Bulan Ini */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">
                  Checkup Bulan Ini
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {health?.total_this_month || 0}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg ml-2 flex-shrink-0">
                <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Laporan Bulan Ini */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">
                  Laporan Bulan Ini
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {safety?.total_this_month || 0}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-red-100 rounded-lg ml-2 flex-shrink-0">
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
            </div>
          </div>

          {/* Total Karyawan */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">
                  Total Karyawan
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {employees?.total || 0}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-100 rounded-lg ml-2 flex-shrink-0">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Chart & Activity Section */}
        <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Kehadiran Minggu Ini
              </h2>
              <div className="h-64 sm:h-80 lg:h-72">
                <AttendanceChart refreshTrigger={0} />
              </div>
            </div>
          </div>

          {/* Activity Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 h-full">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Aktivitas Terbaru
              </h2>
              <div className="h-64 sm:h-80 lg:h-72 overflow-y-auto">
                <RecentActivity />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
