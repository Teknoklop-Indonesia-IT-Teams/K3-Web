import React, { useState } from "react";
import { AttendanceForm } from "../components/attendance/AttendanceForm";
import AttendanceList from "../components/attendance/AttendanceList";
import { AttendanceStats } from "../components/attendance/AttendanceStats";

export const Attendance: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAttendanceSubmit = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    // 🔥 HAPUS: min-h-screen bg-gray-50 pt-16 lg:pt-0 dan container padding
    // Karena sudah dihandle oleh MainLayout
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Sistem Absensi Pelatihan
        </h1>
        <p className="text-gray-600">
          Kelola kehadiran peserta pelatihan dengan tanda tangan digital
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8">
        <AttendanceStats refreshTrigger={refreshTrigger} />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Attendance Form */}
        <div>
          <AttendanceForm
            onSubmitSuccess={handleAttendanceSubmit}
            refreshTrigger={refreshTrigger}
          />
        </div>

        {/* Attendance List */}
        <div>
          <AttendanceList refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
};
