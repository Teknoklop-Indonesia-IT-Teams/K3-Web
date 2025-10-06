import React, { useEffect, useState } from 'react';
import { Users, Clock, TrendingUp, Calendar } from 'lucide-react';
import { fetchJSON } from '../../lib/api';

interface AttendanceStatsProps {
  refreshTrigger: number;
}

interface AttendanceStatsData {
  hadir_hari_ini: number;
  rata_jam_masuk: number; // jam dalam decimal, ex: 8.20
  kehadiran_minggu_ini: number;
  hari_kerja_bulan_ini: number;
}

export const AttendanceStats: React.FC<AttendanceStatsProps> = ({ refreshTrigger }) => {
  const [stats, setStats] = useState<AttendanceStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await fetchJSON('/attendance/stats');
      setStats(data);
    } catch (err) {
      console.error('❌ Error fetching attendance stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  if (loading) {
    return <div className="text-gray-500">Loading statistik...</div>;
  }

  if (!stats) {
    return <div className="text-red-500">Gagal memuat statistik</div>;
  }

  // Convert rata jam masuk decimal (contoh 8.20) jadi HH:MM
  const formatJam = (decimalHour: number) => {
    if (!decimalHour) return '-';
    const jam = Math.floor(decimalHour);
    const menit = Math.round((decimalHour - jam) * 60);
    return `${jam.toString().padStart(2, '0')}:${menit.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Hadir Hari Ini</p>
            <p className="text-2xl font-bold text-gray-900">{stats.hadir_hari_ini}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Rata-rata Jam Masuk</p>
            <p className="text-2xl font-bold text-gray-900">{formatJam(stats.rata_jam_masuk)}</p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg">
            <Clock className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Kehadiran Minggu Ini</p>
            <p className="text-2xl font-bold text-gray-900">{stats.kehadiran_minggu_ini}%</p>
          </div>
          <div className="p-3 bg-purple-100 rounded-lg">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Pelatihan Bulan Ini</p>
            <p className="text-2xl font-bold text-gray-900">{stats.hari_kerja_bulan_ini}</p>
          </div>
          <div className="p-3 bg-orange-100 rounded-lg">
            <Calendar className="h-6 w-6 text-orange-600" />
          </div>
        </div>
      </div>
    </div>
  );
};
