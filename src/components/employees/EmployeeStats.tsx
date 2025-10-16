import React, { useEffect, useState } from "react";
import {
  Microscope,
  Cpu,
  Monitor,
  FileText,
  Users,
  Search,
  PersonStanding,
  ChefHat,
  Loader2,
} from "lucide-react";

interface EmployeeStatsProps {
  refreshTrigger: number;
}

interface StatsResponse {
  total: number;
  stats: { department: string; count: number }[];
}

const deptConfig: Record<
  string,
  {
    id: number;
    icon: React.ElementType;
    bg: string;
    text: string;
    border: string;
    name: string;
  }
> = {
  direktur: {
    id: 1,
    icon: PersonStanding,
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    name: "Direktur",
  },
  lab: {
    id: 2,
    icon: Microscope,
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    name: "Laboratorium",
  },
  automasi: {
    id: 3,
    icon: Cpu,
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    name: "Automasi",
  },
  it: {
    id: 4,
    icon: Monitor,
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    name: "IT",
  },
  admin: {
    id: 5,
    icon: FileText,
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
    name: "Administrasi",
  },
  rnd: {
    id: 6,
    icon: Search,
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    name: "Research & Development",
  },
  cook: {
    id: 7,
    icon: ChefHat,
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
    name: "Dapur",
  },
};

export const EmployeeStats: React.FC<EmployeeStatsProps> = ({
  refreshTrigger,
}) => {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE}/api/employees/stats`,
          {
            cache: "no-store",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch stats: ${res.status}`);
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error fetching employee stats:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load statistics"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [refreshTrigger]);

  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="p-3 rounded-lg bg-gray-200 ml-4">
                <div className="h-6 w-6"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
        <div className="text-red-600 mb-2">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Gagal Memuat Data
        </h3>
        <p className="text-gray-600 text-sm mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  // Empty state
  if (!data?.stats || data.stats.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400 mb-4">
          <Users className="h-16 w-16 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Tidak Ada Data Karyawan
        </h3>
        <p className="text-gray-600 text-sm">
          Belum ada data karyawan yang tersedia.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
      {data.stats.map((stat, index) => {
        const normalizedDept = stat.department.toLowerCase();
        const config = deptConfig[normalizedDept] || {
          id: 0,
          icon: Users,
          bg: "bg-gray-50",
          text: "text-gray-700",
          border: "border-gray-200",
          name: stat.department,
        };
        const Icon = config.icon;
        const percentage = data.total > 0 ? (stat.count / data.total) * 100 : 0;

        return (
          <div
            key={stat.department}
            className={`bg-white rounded-xl shadow-sm border ${config.border} p-4 lg:p-6 hover:shadow-md transition-all duration-200 group`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs lg:text-sm font-medium text-gray-500 truncate">
                  {config.name}
                </p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900 mt-1">
                  {stat.count}
                </p>
                <div className="flex items-center mt-2">
                  <div className="w-16 lg:w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className={`h-2 rounded-full ${config.bg
                        .replace("bg-", "bg-")
                        .replace("-50", "-500")}`}
                      style={{ width: `${Math.max(percentage, 6)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600 whitespace-nowrap">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {stat.count} dari {data.total} total
                </p>
              </div>
              <div
                className={`p-2 lg:p-3 rounded-lg ${config.bg} ml-3 flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}
              >
                <Icon className={`h-5 w-5 lg:h-6 lg:w-6 ${config.text}`} />
              </div>
            </div>
          </div>
        );
      })}

      {/* Total Employees Card */}
      {data.total > 0 && (
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm border border-blue-400 p-4 lg:p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs lg:text-sm font-medium text-blue-100">
                Total Karyawan
              </p>
              <p className="text-xl lg:text-2xl font-bold mt-1">{data.total}</p>
              <p className="text-xs text-blue-100 mt-2">Semua Departemen</p>
            </div>
            <div className="p-2 lg:p-3 rounded-lg bg-blue-400 bg-opacity-30 ml-3">
              <Users className="h-5 w-5 lg:h-6 lg:w-6" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
