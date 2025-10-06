import React, { useEffect, useState } from "react";
import { Microscope, Cpu, Monitor, FileText, Users } from "lucide-react";

interface EmployeeStatsProps {
  refreshTrigger: number;
}

interface StatsResponse {
  total: number;
  stats: { department: string; count: number }[];
}

const deptConfig: Record<string, { icon: React.ElementType; bg: string; text: string }> = {
  lab: { icon: Microscope, bg: "bg-purple-100", text: "text-purple-600" },
  otomasi: { icon: Cpu, bg: "bg-blue-100", text: "text-blue-600" },
  it: { icon: Monitor, bg: "bg-green-100", text: "text-green-600" },
  admin: { icon: FileText, bg: "bg-yellow-100", text: "text-yellow-600" },
};

export const EmployeeStats: React.FC<EmployeeStatsProps> = ({ refreshTrigger }) => {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:4000/api/employees/stats", { cache: "no-store" });
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [refreshTrigger]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {loading && <p className="text-gray-500">Loading...</p>}
      {!loading && data?.stats.map((d) => {
        const config = deptConfig[d.department.toLowerCase()] || { icon: Users, bg: "bg-gray-100", text: "text-gray-600" };
        const Icon = config.icon;
        return (
          <div key={d.department} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Karyawan Aktif ({d.department})
                </p>
                <p className="text-2xl font-bold text-gray-900">{d.count}</p>
                <p className="text-sm text-green-600">
                  {data.total > 0 ? `${((d.count / data.total) * 100).toFixed(0)}% dari total` : "-"}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${config.bg}`}>
                <Icon className={`h-6 w-6 ${config.text}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
