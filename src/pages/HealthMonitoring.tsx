import React, { useState } from "react";
import { HealthForm } from "../components/health/HealthForm";
import { HealthHistory } from "../components/health/HealthHistory";
import { HealthCharts } from "../components/health/HealthCharts";
import { HealthStats } from "../components/health/HealthStats";
import { canManage } from "../lib/auth";

export const HealthMonitoring: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const showManagement = canManage();

  const handleHealthSubmit = () => setRefreshTrigger((p) => p + 1);

  return (
    <div className="min-h-screen bg-gray-50 pt-16 lg:pt-0">
      <div className="p-4 lg:pr-14 lg:pb-4 sm:pt-6 lg:pt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Monitoring Kesehatan</h1>
          <p className="text-gray-600">Pantau kesehatan karyawan dan riwayat medis</p>
        </div>

        <div className="mb-8">
          <HealthStats refreshTrigger={refreshTrigger} />
        </div>

        <div className={`grid grid-cols-1 ${showManagement ? "xl:grid-cols-3" : ""} gap-8`}>
          {showManagement && (
            <div className="xl:col-span-1">
              <HealthForm onSuccess={handleHealthSubmit} />
            </div>
          )}

          <div className={showManagement ? "xl:col-span-2 space-y-8" : "space-y-8"}>
            <HealthCharts refreshTrigger={refreshTrigger} />
            <HealthHistory refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </div>
    </div>
  );
};
