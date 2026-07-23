import React, { useState } from "react";
import { TrainingForm } from "../components/training/TrainingForm";
import TrainingList  from "../components/training/TrainingList";
import { TrainingStats } from "../components/training/TrainingStats";
import { canManage } from "../lib/auth";

export const Training: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const showManagement = canManage();

  const handleTrainingSubmit = () => setRefreshTrigger((p) => p + 1);

  return (
    <div className="min-h-screen bg-gray-50 pt-16 lg:pt-0">
      <div className="p-4 lg:pr-14 lg:pb-4 sm:pt-6 lg:pt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pelatihan K3</h1>
          <p className="text-gray-600">Kelola program pelatihan dan sertifikasi keselamatan</p>
        </div>

        <div className="mb-8">
          <TrainingStats refreshTrigger={refreshTrigger} />
        </div>

        <div className={`grid grid-cols-1 ${showManagement ? "lg:grid-cols-2" : ""} gap-8`}>
          {showManagement && (
            <div>
              <TrainingForm onSubmit={handleTrainingSubmit} />
            </div>
          )}
          <div>
            <TrainingList
              refreshTrigger={refreshTrigger}
              showActions={showManagement}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
