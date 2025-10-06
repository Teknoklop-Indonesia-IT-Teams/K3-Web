import React, { useEffect, useState } from "react";
import { Users, Heart, AlertTriangle, UserCheck } from "lucide-react";
import { AttendanceChart } from "../components/dashboard/AttendanceChart";
import { RecentActivity } from "../components/dashboard/RecentActivity";

export const Dashboard: React.FC = () => {
  const [attendance, setAttendance] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [safety, setSafety] = useState<any>(null);
  const [employees, setEmployees] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attRes, healthRes, safetyRes, empRes] = await Promise.all([
          fetch("http://localhost:4000/api/attendance/stats").then(r => r.json()),
          fetch("http://localhost:4000/api/health/stats").then(r => r.json()),
          fetch("http://localhost:4000/api/safety/reports/stats").then(r => r.json()),
          fetch("http://localhost:4000/api/employees/stats").then(r => r.json()),
        ]);

        setAttendance(attRes);
        setHealth(healthRes);
        setSafety(safetyRes);
        setEmployees(empRes);
      } catch (err) {
        console.error("❌ Dashboard fetch error:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Ringkasan kondisi karyawan dan sistem</p>
      </div>

      {/* Ringkasan Utama */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Hadir Hari Ini */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Hadir Hari Ini</p>
              <p className="text-2xl font-bold text-gray-900">{attendance?.hadir_hari_ini || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserCheck className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Checkup Bulan Ini */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Checkup Bulan Ini</p>
              <p className="text-2xl font-bold text-gray-900">{health?.total_this_month || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Heart className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Laporan Safety Bulan Ini */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Laporan Bulan Ini</p>
              <p className="text-2xl font-bold text-gray-900">{safety?.total_this_month || 0}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Total Karyawan */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Karyawan</p>
              <p className="text-2xl font-bold text-gray-900">{employees?.total || 0}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Chart & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart lebih panjang */}
        <div className="lg:col-span-2">
          <AttendanceChart refreshTrigger={0} />
        </div>

        {/* Activity lebih kecil */}
        <div className="transform scale-95 origin-top-right">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};
