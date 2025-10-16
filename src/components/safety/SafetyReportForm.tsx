import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  AlertTriangle,
  MapPin,
  Clock,
  User,
  Search,
  Users,
} from "lucide-react";

interface SafetyReportFormData {
  title: string;
  incident_type:
    | ""
    | "near_miss"
    | "accident"
    | "equipment_failure"
    | "safety_violation"
    | "environmental";
  severity: "low" | "medium" | "high" | "critical";
  status: "selesai" | "investigasi" | "pending";
  location: string;
  incident_date: string;
  incident_time: string;
  description: string;
  reporter_name: string;
  witnesses: string;
  immediate_action: string;
}

interface Employee {
  id: number;
  name: string;
  department: string;
}

interface SafetyReportFormProps {
  onSubmit: () => void;
}

export const SafetyReportForm: React.FC<SafetyReportFormProps> = ({
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SafetyReportFormData>({
    defaultValues: {
      incident_type: "",
      status: "pending",
      severity: "medium",
    },
  });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedSeverity = watch("severity");
  const selectedStatus = watch("status");
  const selectedIncidentType = watch("incident_type");
  const selectedReporter = watch("reporter_name");

  // Fetch data karyawan untuk dropdown
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE}/api/employees`
        );
        const data = await res.json();
        setEmployees(data);
        setFilteredEmployees(data);
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };
    fetchEmployees();
  }, []);

  // Filter karyawan berdasarkan pencarian
  useEffect(() => {
    if (employeeSearch) {
      const filtered = employees.filter((emp) =>
        emp.name.toLowerCase().includes(employeeSearch.toLowerCase())
      );
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees(employees);
    }
  }, [employeeSearch, employees]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowEmployeeDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const onFormSubmit = async (data: SafetyReportFormData) => {
    try {
      const payload = {
        title: data.title,
        incident_type: data.incident_type,
        severity: data.severity,
        status: data.status,
        location: data.location,
        incident_date: data.incident_date,
        incident_time: data.incident_time,
        description: data.description,
        reporter_name: data.reporter_name,
        witnesses: data.witnesses || null,
        immediate_action: data.immediate_action || null,
      };

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/safety/reports`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const saved = await res.json();
      console.log("✅ Laporan tersimpan:", saved);

      reset({
        incident_type: "", // Reset ke default value yang baru
        status: "pending",
        severity: "medium",
        title: "",
        location: "",
        incident_date: "",
        incident_time: "",
        description: "",
        reporter_name: "",
        witnesses: "",
        immediate_action: "",
      });
      setEmployeeSearch("");
      setShowEmployeeDropdown(false);
      onSubmit();
    } catch (err) {
      console.error("❌ Gagal simpan laporan:", err);
      alert("Gagal menyimpan laporan insiden");
    }
  };

  // Handler untuk memilih karyawan dari dropdown
  const handleEmployeeSelect = (employee: Employee) => {
    setValue("reporter_name", employee.name);
    setEmployeeSearch(employee.name);
    setShowEmployeeDropdown(false);
  };

  const handleEmployeeInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEmployeeSearch(e.target.value);
    setShowEmployeeDropdown(true);
  };

  const handleEmployeeInputFocus = () => {
    setShowEmployeeDropdown(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
        Laporan Insiden K3
      </h3>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Judul Laporan
          </label>
          <input
            {...register("title", { required: "Masukkan judul laporan" })}
            placeholder="Contoh: Kecelakaan di Area Produksi"
            className="w-full rounded-lg border-gray-300 border px-4 py-3"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Jenis Insiden - DIPERBAIKI */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Jenis Insiden
          </label>
          <select
            {...register("incident_type", { required: "Pilih jenis insiden" })}
            onChange={(e) =>
              setValue(
                "incident_type",
                e.target.value as SafetyReportFormData["incident_type"]
              )
            }
            className="w-full rounded-lg border-gray-300 border px-4 py-3"
          >
            <option value="">Pilih Jenis Insiden</option>
            <option value="near_miss">Near Miss</option>
            <option value="accident">Kecelakaan</option>
            <option value="equipment_failure">Kerusakan Peralatan</option>
            <option value="safety_violation">Pelanggaran K3</option>
            <option value="environmental">Lingkungan</option>
          </select>
          {errors.incident_type && (
            <p className="text-red-500 text-sm mt-1">
              {errors.incident_type.message}
            </p>
          )}
        </div>

        {/* Severity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tingkat Keparahan
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                value: "low",
                label: "Rendah",
                color: "border-green-300 text-green-700",
              },
              {
                value: "medium",
                label: "Sedang",
                color: "border-yellow-300 text-yellow-700",
              },
              {
                value: "high",
                label: "Tinggi",
                color: "border-orange-300 text-orange-700",
              },
              {
                value: "critical",
                label: "Kritis",
                color: "border-red-300 text-red-700",
              },
            ].map((s) => (
              <label
                key={s.value}
                className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer relative
                ${s.color} ${
                  selectedSeverity === s.value ? "bg-gray-100 border-4" : ""
                }`}
              >
                <input
                  {...register("severity", {
                    required: "Pilih tingkat keparahan",
                  })}
                  type="radio"
                  value={s.value}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <span className="text-sm font-medium pointer-events-none">
                  {s.label}
                </span>
              </label>
            ))}
          </div>
          {errors.severity && (
            <p className="text-red-500 text-sm mt-1">
              {errors.severity.message}
            </p>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status Insiden
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                value: "selesai",
                label: "Selesai",
                color: "border-green-300 text-green-700",
              },
              {
                value: "investigasi",
                label: "Investigasi",
                color: "border-blue-300 text-blue-700",
              },
              {
                value: "pending",
                label: "Pending",
                color: "border-yellow-300 text-yellow-700",
              },
            ].map((st) => (
              <label
                key={st.value}
                className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer relative
                ${st.color} ${
                  selectedStatus === st.value ? "bg-gray-100 border-4" : ""
                }`}
              >
                <input
                  {...register("status", { required: "Pilih status insiden" })}
                  type="radio"
                  value={st.value}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <span className="text-sm font-medium pointer-events-none">
                  {st.label}
                </span>
              </label>
            ))}
          </div>
          {errors.status && (
            <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
          )}
        </div>

        {/* Lokasi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lokasi Insiden
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              {...register("location", { required: "Masukkan lokasi insiden" })}
              placeholder="Contoh: Gedung A - Lantai 2"
              className="w-full rounded-lg border-gray-300 border pl-10 pr-4 py-3"
            />
          </div>
        </div>

        {/* Tanggal & Waktu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Insiden
            </label>
            <input
              type="date"
              {...register("incident_date", {
                required: "Pilih tanggal kejadian",
              })}
              className="w-full rounded-lg border-gray-300 border px-4 py-3"
            />
            {errors.incident_date && (
              <p className="text-red-500 text-sm mt-1">
                {errors.incident_date.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Waktu Insiden
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="time"
                {...register("incident_time", {
                  required: "Pilih waktu kejadian",
                })}
                className="w-full rounded-lg border-gray-300 border pl-10 pr-4 py-3"
              />
            </div>
            {errors.incident_time && (
              <p className="text-red-500 text-sm mt-1">
                {errors.incident_time.message}
              </p>
            )}
          </div>
        </div>

        {/* Deskripsi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deskripsi Insiden
          </label>
          <textarea
            {...register("description", { required: "Deskripsikan insiden" })}
            rows={4}
            placeholder="Jelaskan insiden secara detail..."
            className="w-full rounded-lg border-gray-300 border px-4 py-3 resize-none"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Pelapor dengan Dropdown Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Pelapor
          </label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={employeeSearch}
              onChange={handleEmployeeInputChange}
              onFocus={handleEmployeeInputFocus}
              placeholder="Cari nama karyawan..."
              className="w-full rounded-lg border-gray-300 border pl-10 pr-4 py-3"
            />
            <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />

            {/* Dropdown Karyawan */}
            {showEmployeeDropdown && filteredEmployees.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    onClick={() => handleEmployeeSelect(employee)}
                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">
                      {employee.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {employee.department}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <input
            type="hidden"
            {...register("reporter_name", { required: "Pilih nama pelapor" })}
          />
          {errors.reporter_name && (
            <p className="text-red-500 text-sm mt-1">
              {errors.reporter_name.message}
            </p>
          )}
        </div>

        {/* Saksi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Saksi (Opsional)
          </label>
          <input
            {...register("witnesses")}
            placeholder="Nama saksi yang menyaksikan insiden"
            className="w-full rounded-lg border-gray-300 border px-4 py-3"
          />
        </div>

        {/* Tindakan Segera */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Langkah Tindakan Segera (Opsional)
          </label>
          <textarea
            {...register("immediate_action")}
            rows={3}
            placeholder="Langkah tindakan segera yang dilakukan"
            className="w-full rounded-lg border-gray-300 border px-4 py-3 resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition font-medium"
        >
          Submit Laporan
        </button>
      </form>
    </div>
  );
};
