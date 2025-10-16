import React, { useEffect, useState } from "react";
import { Heart, Activity, Thermometer, Scale } from "lucide-react";

interface HealthStatsData {
  avg_systolic: number;
  avg_diastolic: number;
  avg_heart_rate: number;
  avg_temperature: number;
  total_this_month: number;
}

interface HealthStatsProps {
  refreshTrigger: number;
}

export const HealthStats: React.FC<HealthStatsProps> = ({ refreshTrigger }) => {
  const [stats, setStats] = useState<HealthStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE}/api/health/stats`
        );
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("❌ Fetch health stats error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [refreshTrigger]);

  if (loading) return <p className="text-gray-500">Loading statistik...</p>;
  if (!stats) return <p className="text-gray-500">Belum ada data statistik</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Tekanan darah */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Rata-rata Tekanan Darah
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.avg_systolic}/{stats.avg_diastolic}
            </p>
          </div>
          <div className="p-3 bg-red-100 rounded-lg">
            <Heart className="h-6 w-6 text-red-600" />
          </div>
        </div>
      </div>

      {/* Detak jantung */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Rata-rata Detak Jantung
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.avg_heart_rate} bpm
            </p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <Activity className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Suhu tubuh */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Rata-rata Suhu Tubuh
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.avg_temperature}°C
            </p>
          </div>
          <div className="p-3 bg-orange-100 rounded-lg">
            <Thermometer className="h-6 w-6 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Total checkup bulan ini */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Checkup Bulan Ini
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.total_this_month}
            </p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg">
            <Scale className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>
    </div>
  );
};
