import React, { useState } from "react";
import { AttendanceForm } from "../components/attendance/AttendanceForm";
import AttendanceList from "../components/attendance/AttendanceList";
import { AttendanceStats } from "../components/attendance/AttendanceStats";
import { canManage } from "../lib/auth";

export const Attendance: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const showManagement = canManage();

  const handleAttendanceSubmit = () => setRefreshTrigger((p) => p + 1);

  return (
    <div className="min-h-screen bg-gray-50 pt-16 lg:pt-0">
      <div className="p-4 lg:pr-14 lg:pb-4 sm:pt-6 lg:pt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistem Absensi Pelatihan</h1>
          <p className="text-gray-600">Kelola kehadiran peserta pelatihan dengan tanda tangan digital</p>
        </div>

        <div className="mb-8">
          <AttendanceStats refreshTrigger={refreshTrigger} />
        </div>

        <div className={`grid grid-cols-1 ${showManagement ? "lg:grid-cols-2" : ""} gap-8`}>
          {showManagement && (
            <div>
              <AttendanceForm
                onSubmitSuccess={handleAttendanceSubmit}
                refreshTrigger={refreshTrigger}
              />
            </div>
          )}
          <div>
            <AttendanceList refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </div>
    </div>
  );
};
