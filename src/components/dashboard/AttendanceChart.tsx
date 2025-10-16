import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

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
  refreshTrigger: number;
}

export const AttendanceChart: React.FC<AttendanceChartProps> = ({
  refreshTrigger,
}) => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/attendance`
      );
      const data: AttendanceRecord[] = await res.json();

      // Group peserta unik per tanggal (7 hari terakhir)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
        });
      }).reverse();

      const grouped: { [date: string]: Set<string> } = {};

      // Initialize dengan 0 untuk semua tanggal
      last7Days.forEach((date) => {
        grouped[date] = new Set();
      });

      // Isi data yang ada
      data.forEach((record) => {
        const date = new Date(record.timestamp).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
        });
        if (grouped[date]) {
          grouped[date].add(record.participant_name);
        }
      });

      // Convert ke format chart
      const formatted: ChartData[] = last7Days.map((date) => ({
        date,
        hadir: grouped[date]?.size || 0,
        target: 50, // target tetap
      }));

      setChartData(formatted);
    } catch (err) {
      console.error("❌ Gagal ambil data chart:", err);
      // Fallback data
      const fallbackData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
          }),
          hadir: 0,
          target: 50,
        };
      });
      setChartData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Memuat data grafik...</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#6b7280" }}
          axisLine={{ stroke: "#e5e7eb" }}
          tickLine={{ stroke: "#e5e7eb" }}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#6b7280" }}
          axisLine={{ stroke: "#e5e7eb" }}
          tickLine={{ stroke: "#e5e7eb" }}
          width={40}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            fontSize: "12px",
          }}
          formatter={(value: number, name: string) => [
            value,
            name === "hadir" ? "Hadir" : "Target",
          ]}
          labelFormatter={(label) => `Tanggal: ${label}`}
        />
        <Legend
          verticalAlign="top"
          height={36}
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ fontSize: "12px", color: "#374151" }}>
              {value === "hadir" ? "Hadir" : "Target"}
            </span>
          )}
        />
        <Line
          name="hadir"
          type="monotone"
          dataKey="hadir"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ fill: "#3b82f6", r: 4, strokeWidth: 2 }}
          activeDot={{ r: 6, fill: "#1d4ed8", stroke: "#fff", strokeWidth: 2 }}
        />
        <Line
          name="target"
          type="monotone"
          dataKey="target"
          stroke="#9ca3af"
          strokeWidth={1}
          strokeDasharray="5 5"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default AttendanceChart;
