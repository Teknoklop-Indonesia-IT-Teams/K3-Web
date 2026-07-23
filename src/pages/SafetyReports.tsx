import React, { useState } from "react";
import { SafetyReportForm } from "../components/safety/SafetyReportForm";
import { SafetyReportList } from "../components/safety/SafetyReportList";
import { SafetyMetricsCard } from "../components/safety/SafetyMetricsCard";
import { canManage } from "../lib/auth";

export const SafetyReports: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const showManagement = canManage();

  const handleReportSubmit = () => setRefreshTrigger((p) => p + 1);
  const handleStatusUpdate = () => setRefreshTrigger((p) => p + 1);

  return (
    <div className="min-h-screen bg-gray-50 pt-16 lg:pt-0">
      <div className="p-4 lg:pr-14 lg:pb-4 sm:pt-6 lg:pt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Laporan Keselamatan</h1>
          <p className="text-gray-600">Kelola laporan insiden dan analisis keselamatan kerja</p>
        </div>

        <div className="mb-8">
          <SafetyMetricsCard refreshTrigger={refreshTrigger} />
        </div>

        <div className={`grid grid-cols-1 ${showManagement ? "lg:grid-cols-2" : ""} gap-8`}>
          {showManagement && (
            <div>
              <SafetyReportForm onSubmit={handleReportSubmit} />
            </div>
          )}
          <div>
            <SafetyReportList
              refreshTrigger={refreshTrigger}
              onUpdate={handleStatusUpdate}
              showActions={showManagement}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyReports;
