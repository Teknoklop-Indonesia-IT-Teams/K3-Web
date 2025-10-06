import React, { useState } from 'react';
import { HealthForm } from '../components/health/HealthForm';
import { HealthHistory } from '../components/health/HealthHistory';
import { HealthCharts } from '../components/health/HealthCharts';
import { HealthStats } from '../components/health/HealthStats';

export const HealthMonitoring: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleHealthSubmit = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Monitoring Kesehatan</h1>
        <p className="text-gray-600">Pantau kesehatan karyawan dan riwayat medis</p>
      </div>

      {/* Health Stats */}
      <div className="mb-8">
        <HealthStats refreshTrigger={refreshTrigger} />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Health Form */}
        <div className="xl:col-span-1">
          <HealthForm onSuccess={handleHealthSubmit} />
        </div>

        {/* Charts and History */}
        <div className="xl:col-span-2 space-y-8">
          <HealthCharts refreshTrigger={refreshTrigger} />
          <HealthHistory refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
};
