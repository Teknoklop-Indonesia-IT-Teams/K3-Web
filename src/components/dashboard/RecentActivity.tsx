import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle, Heart, Users, BookOpen } from 'lucide-react';

interface Activity {
  id: string;
  type: 'attendance' | 'health' | 'incident' | 'employee' | 'training' | string;
  message: string;
  time: string;
}

export const RecentActivity: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/activity/recent');
      const data = await res.json();

      // safety: ensure array
      if (Array.isArray(data)) {
        setActivities(data.slice(0, 5));
      } else {
        setActivities([]);
      }
    } catch (err) {
      console.error('❌ Error fetching activities:', err);
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

  if (loading) return <p className="text-gray-500">Loading aktivitas...</p>;
  if (!activities.length) return <p className="text-gray-500">Belum ada aktivitas terbaru</p>;

  const iconMap: Record<string, any> = {
    attendance: Clock,
    health: Heart,
    incident: AlertTriangle,
    employee: Users,
    training: BookOpen, // <-- tambahkan mapping untuk training
  };

  const colorMap: Record<string, string> = {
    attendance: 'text-blue-600',
    health: 'text-green-600',
    incident: 'text-orange-600',
    employee: 'text-purple-600',
    training: 'text-indigo-600', // <-- warna untuk training
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-sm">
      <h3 className="text-base font-semibold text-gray-900 mb-4">
        Aktivitas Terbaru
      </h3>
      <div className="space-y-3">
        {activities.map((activity) => {
          const Icon = iconMap[activity.type] ?? Users; // fallback icon
          const colorClass = colorMap[activity.type] ?? 'text-gray-600'; // fallback color
          return (
            <div
              key={activity.id}
              className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className={`p-2 rounded-lg bg-gray-100 ${colorClass}`}>
                {/* pastikan Icon ada sebelum render */}
                {Icon ? <Icon className="h-4 w-4" /> : <Users className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {activity.message}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(activity.time).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;
