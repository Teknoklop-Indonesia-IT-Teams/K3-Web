import React, { useState } from 'react';
import { SafetyReportForm } from '../components/safety/SafetyReportForm';
import { SafetyReportList } from '../components/safety/SafetyReportList';
import { SafetyMetricsCard } from '../components/safety/SafetyMetricsCard';

export const SafetyReports: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 🔥 Callback untuk refresh list & metrics saat form submit
  const handleReportSubmit = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // 🔥 Callback untuk refresh metrics saat status diubah
  const handleStatusUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Laporan Keselamatan</h1>
        <p className="text-gray-600">Kelola laporan insiden dan analisis keselamatan kerja</p>
      </div>

      {/* Safety Metrics */}
      <div className="mb-8">
        <SafetyMetricsCard refreshTrigger={refreshTrigger} />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Report Form */}
        <div>
          <SafetyReportForm onSubmit={handleReportSubmit} />
        </div>

        {/* Reports List */}
        <div>
          <SafetyReportList refreshTrigger={refreshTrigger} onUpdate={handleStatusUpdate} />
        </div>
      </div>
    </div>
  );
};

export default SafetyReports;
