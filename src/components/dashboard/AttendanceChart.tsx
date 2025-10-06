import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AttendanceRecord {
  id: number;
  participant_name: string;
  training_id: string;
  timestamp: string;
  notes?: string;
  signature?: string;
}

interface ChartData {
  date: string;
  hadir: number;
  target: number;
}

interface AttendanceChartProps {
  refreshTrigger: number; // 🔥 trigger refresh dari parent
}

export const AttendanceChart: React.FC<AttendanceChartProps> = ({ refreshTrigger }) => {
  const [chartData, setChartData] = useState<ChartData[]>([]);

  const fetchAttendance = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/attendance');
      const data: AttendanceRecord[] = await res.json();

      // Group peserta unik per tanggal
      const grouped: { [date: string]: Set<string> } = {};
      data.forEach((record) => {
        const date = new Date(record.timestamp).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
        });
        if (!grouped[date]) grouped[date] = new Set();
        grouped[date].add(record.participant_name);
      });

      // Convert ke format chart
      const formatted: ChartData[] = Object.keys(grouped).map((date) => ({
        date,
        hadir: grouped[date].size,
        target: 50, // tetap
      }));

      setChartData(formatted);
    } catch (err) {
      console.error('❌ Gagal ambil data chart:', err);
    }
  };

  // Fetch ulang setiap refreshTrigger berubah
  useEffect(() => {
    fetchAttendance();
  }, [refreshTrigger]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Kehadiran Minggu Ini
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Line
            type="monotone"
            dataKey="hadir"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6, fill: '#1d4ed8' }}
          />
          <Line
            type="monotone"
            dataKey="target"
            stroke="#000000"
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttendanceChart;
