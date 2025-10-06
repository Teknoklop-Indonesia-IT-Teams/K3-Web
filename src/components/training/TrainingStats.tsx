import React, { useEffect, useState } from 'react';
import { BookOpen, Layers, Clock, Users } from 'lucide-react';

interface Training {
  id: string;
  title: string;
  trainer: string;
  start_time: string;
  duration_hours: number;
}

interface TrainingStatsProps {
  refreshTrigger: number;
}

export const TrainingStats: React.FC<TrainingStatsProps> = ({ refreshTrigger }) => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTrainings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:4000/api/trainings');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data: Training[] = await res.json();
      setTrainings(data);
    } catch (err: any) {
      setError(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrainings();
  }, [refreshTrigger]);

  // ==== Hitung statistik bulan ini ====
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const trainingsThisMonth = trainings.filter((t) => {
    const d = new Date(t.start_time);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const countTrainings = trainingsThisMonth.length;
  const uniqueTitles = new Set(trainingsThisMonth.map((t) => t.title)).size;
  const totalHours = trainingsThisMonth.reduce((sum, t) => sum + Number(t.duration_hours), 0);
  const totalParticipants = 22; // sementara dummy

  if (loading) return <div>⏳ Memuat statistik...</div>;
  if (error) return <div className="text-red-500">⚠ {error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Pelatihan Bulan Ini */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Pelatihan Bulan Ini</p>
            <p className="text-2xl font-bold text-gray-900">{countTrainings}</p>
            <p className="text-sm text-blue-600">Jumlah jadwal</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <BookOpen className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Materi Disampaikan */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Materi Disampaikan</p>
            <p className="text-2xl font-bold text-gray-900">{uniqueTitles}</p>
            <p className="text-sm text-green-600">Topik bulan ini</p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg">
            <Layers className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Total Jam */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Jam Pelatihan</p>
            <p className="text-2xl font-bold text-gray-900">{totalHours}</p>
            <p className="text-sm text-purple-600">Jam bulan ini</p>
          </div>
          <div className="p-3 bg-purple-100 rounded-lg">
            <Clock className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Jumlah Peserta (dummy) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Jumlah Peserta</p>
            <p className="text-2xl font-bold text-gray-900">{totalParticipants}</p>
            <p className="text-sm text-orange-600">Seluruh karyawan</p>
          </div>
          <div className="p-3 bg-orange-100 rounded-lg">
            <Users className="h-6 w-6 text-orange-600" />
          </div>
        </div>
      </div>
    </div>
  );
};
