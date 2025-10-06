import React, { useEffect, useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface SafetyMetricsCardProps {
  refreshTrigger: number;
}

export const SafetyMetricsCard: React.FC<SafetyMetricsCardProps> = ({ refreshTrigger }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch('http://localhost:4000/api/safety/reports/stats')
      .then(res => res.json())
      .then(data => {
        if (mounted) setStats(data);
      })
      .catch(console.error)
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, [refreshTrigger]);

  if (loading) {
    return <div className="text-gray-500">Loading metrics...</div>;
  }

  if (!stats) {
    return <div className="text-red-500">Gagal memuat data</div>;
  }

  const total = Number(stats.total_this_month || 0);
  const selesai = Number(stats.selesai || 0);
  const investigasi = Number(stats.investigasi || 0);
  const pending = Number(stats.pending || 0);

  const completionRate = total > 0 ? ((selesai / total) * 100).toFixed(1) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Laporan */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Laporan Bulan Ini</p>
            <p className="text-2xl font-bold text-gray-900">{total}</p>
          </div>
          <div className="p-3 bg-red-100 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
        </div>
      </div>

      {/* Laporan Diselesaikan */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Laporan Diselesaikan</p>
            <p className="text-2xl font-bold text-gray-900">{selesai}</p>
            <p className="text-sm text-green-600">{completionRate}% completion rate</p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Sedang Investigasi */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Sedang Investigasi</p>
            <p className="text-2xl font-bold text-gray-900">{investigasi}</p>
            <p className="text-sm text-blue-600">Dalam proses</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Laporan Tertunda */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Laporan Tertunda</p>
            <p className="text-2xl font-bold text-gray-900">{pending}</p>
            <p className="text-sm text-purple-600">Belum ditindaklanjuti</p>
          </div>
          <div className="p-3 bg-purple-100 rounded-lg">
            <Shield className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );
};
