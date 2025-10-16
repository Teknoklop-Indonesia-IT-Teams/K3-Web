import React, { useState, useRef } from "react";
import { EmployeeForm } from "../components/employees/EmployeeForm"; // jika diganti named export
import { EmployeeList } from "../components/employees/EmployeeList"; // jika diganti named export
import { EmployeeStats } from "../components/employees/EmployeeStats";

export const EmployeeManagement: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const handleEmployeeSubmit = (newEmployeeId: number) => {
    setHighlightId(newEmployeeId);
    setRefreshTrigger((prev) => prev + 1);

    setTimeout(() => {
      listRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16 lg:pt-0">
      <div className="p-4 lg:pr-14 lg:pb-4 sm:pt-6 lg:pt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Manajemen Karyawan
          </h1>
          <p className="text-gray-600">
            Kelola data karyawan dan informasi personal
          </p>
        </div>

        <div className="mb-8">
          <EmployeeStats refreshTrigger={refreshTrigger} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <EmployeeForm onSubmit={handleEmployeeSubmit} />
          </div>
          <div ref={listRef}>
            <EmployeeList
              refreshTrigger={refreshTrigger}
              highlightId={highlightId}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
