import React, { useEffect, useState } from "react";
import { Clock, AlertTriangle, Heart, Users, BookOpen } from "lucide-react";

interface Activity {
  id: string;
  type: "attendance" | "health" | "incident" | "employee" | "training" | string;
  message: string;
  time: string;
}

export const RecentActivity: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/activity/recent`
      );
      const data = await res.json();

      // safety: ensure array
      if (Array.isArray(data)) {
        setActivities(data.slice(0, 5));
      } else {
        setActivities([]);
      }
    } catch (err) {
      console.error("❌ Error fetching activities:", err);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities(); // fetch pertama kali

    // auto-refresh tiap 10 detik
    const interval = setInterval(fetchActivities, 10000);

    return () => clearInterval(interval); // bersihkan interval saat unmount
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-start space-x-3 p-2 rounded-lg animate-pulse"
          >
            <div className="w-8 h-8 bg-gray-200 rounded-lg flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (!activities.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Users className="h-12 w-12 mx-auto mb-3 opacity-40" />
        <p className="text-sm">Belum ada aktivitas terbaru</p>
      </div>
    );
  }

  const iconMap: Record<string, any> = {
    attendance: Clock,
    health: Heart,
    incident: AlertTriangle,
    employee: Users,
    training: BookOpen,
  };

  const colorMap: Record<string, string> = {
    attendance: "text-blue-600 bg-blue-50",
    health: "text-green-600 bg-green-50",
    incident: "text-orange-600 bg-orange-50",
    employee: "text-purple-600 bg-purple-50",
    training: "text-indigo-600 bg-indigo-50",
  };

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const Icon = iconMap[activity.type] ?? Users;
        const colorClass =
          colorMap[activity.type] ?? "text-gray-600 bg-gray-50";

        return (
          <div
            key={activity.id}
            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
          >
            <div className={`p-2 rounded-lg ${colorClass} flex-shrink-0`}>
              {Icon ? (
                <Icon className="h-4 w-4" />
              ) : (
                <Users className="h-4 w-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 mb-1 leading-tight">
                {activity.message}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(activity.time).toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RecentActivity;
