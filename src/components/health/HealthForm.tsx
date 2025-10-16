import React, { useState, useEffect, useMemo } from "react";
import { SignatureCapture } from "../shared/SignatureCapture";
import { Search, User, ChevronDown, ChevronUp } from "lucide-react";

interface Employee {
  id: number;
  name: string;
  department?: string;
}

export const HealthForm: React.FC<{ onSuccess?: () => void }> = ({
  onSuccess,
}) => {
  const [form, setForm] = useState({
    employee_name: "",
    systolic_pressure: "",
    diastolic_pressure: "",
    heart_rate: "",
    temperature: "",
    weight: "",
    blood_sugar: "",
    cholesterol: "",
    notes: "",
  });

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [signatureData, setSignatureData] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fetch data karyawan
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoadingEmployees(true);
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE}/api/employees`
        );
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data: Employee[] = await res.json();
        setEmployees(data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, []);

  // Filter employees based on search term
  const filteredEmployees = useMemo(() => {
    if (!searchTerm) return employees;
    return employees.filter(
      (employee) =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEmployeeSelect = (employeeName: string) => {
    setForm((prev) => ({ ...prev, employee_name: employeeName }));
    setSearchTerm(employeeName);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi tanda tangan
    if (!signatureData) {
      alert("Tanda tangan diperlukan");
      return;
    }

    // Validasi nama karyawan
    if (!form.employee_name) {
      alert("Nama karyawan wajib dipilih");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/health/checks`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            systolic_pressure: form.systolic_pressure
              ? Number(form.systolic_pressure)
              : null,
            diastolic_pressure: form.diastolic_pressure
              ? Number(form.diastolic_pressure)
              : null,
            heart_rate: form.heart_rate ? Number(form.heart_rate) : null,
            temperature: form.temperature ? Number(form.temperature) : null,
            weight: form.weight ? Number(form.weight) : null,
            blood_sugar: form.blood_sugar ? Number(form.blood_sugar) : null,
            cholesterol: form.cholesterol ? Number(form.cholesterol) : null,
            signature: signatureData,
          }),
        }
      );

      if (!res.ok) throw new Error("Gagal simpan data");

      // Reset form dan tanda tangan
      setForm({
        employee_name: "",
        systolic_pressure: "",
        diastolic_pressure: "",
        heart_rate: "",
        temperature: "",
        weight: "",
        blood_sugar: "",
        cholesterol: "",
        notes: "",
      });
      setSignatureData("");
      setSearchTerm("");
      setIsDropdownOpen(false);
      setRefreshTrigger((prev) => prev + 1);

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan data kesehatan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Form Input Data Kesehatan
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dropdown Nama Karyawan dengan Search */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Karyawan
          </label>

          {loadingEmployees ? (
            <p className="text-gray-500 text-sm">Memuat daftar karyawan...</p>
          ) : (
            <div className="space-y-2">
              {/* Custom Dropdown Trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={toggleDropdown}
                  className="w-full flex items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 text-left transition-colors hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <span
                    className={`truncate ${
                      !form.employee_name ? "text-gray-400" : "text-gray-900"
                    }`}
                  >
                    {form.employee_name || "-- Pilih Karyawan --"}
                  </span>
                  {isDropdownOpen ? (
                    <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>

                {/* Hidden input untuk form */}
                <input
                  type="hidden"
                  name="employee_name"
                  value={form.employee_name}
                  required
                />
              </div>

              {/* Dropdown Content */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                  {/* Search Input */}
                  <div className="p-2 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Cari nama atau departemen..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Employee List */}
                  <div className="overflow-y-auto max-h-48">
                    {filteredEmployees.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        {searchTerm
                          ? "Tidak ada karyawan yang sesuai"
                          : "Tidak ada data karyawan"}
                      </div>
                    ) : (
                      filteredEmployees.map((employee) => (
                        <button
                          key={employee.id}
                          type="button"
                          onClick={() => handleEmployeeSelect(employee.name)}
                          className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                            form.employee_name === employee.name
                              ? "bg-blue-50 border-blue-200"
                              : ""
                          }`}
                        >
                          <div className="flex-shrink-0">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {employee.name}
                            </p>
                            {employee.department && (
                              <p className="text-xs text-gray-500 truncate">
                                {employee.department}
                              </p>
                            )}
                          </div>
                          {form.employee_name === employee.name && (
                            <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Grid untuk input kesehatan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sistolik (mmHg)
            </label>
            <input
              type="number"
              name="systolic_pressure"
              value={form.systolic_pressure}
              onChange={handleChange}
              placeholder="120"
              max={250}
              min={50}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diastolik (mmHg)
            </label>
            <input
              type="number"
              name="diastolic_pressure"
              value={form.diastolic_pressure}
              onChange={handleChange}
              placeholder="80"
              max={150}
              min={30}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detak Jantung (bpm)
            </label>
            <input
              type="number"
              name="heart_rate"
              value={form.heart_rate}
              onChange={handleChange}
              placeholder="72"
              max={220}
              min={30}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Suhu Tubuh (°C)
            </label>
            <input
              type="number"
              step="0.1"
              name="temperature"
              value={form.temperature}
              onChange={handleChange}
              placeholder="36.5"
              max={45}
              min={25}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Berat Badan (kg)
          </label>
          <input
            type="number"
            step="0.1"
            name="weight"
            value={form.weight}
            onChange={handleChange}
            placeholder="65.5"
            min={20}
            max={300}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gula Darah (mg/dL)
            </label>
            <input
              type="number"
              step="0.1"
              name="blood_sugar"
              value={form.blood_sugar}
              onChange={handleChange}
              placeholder="100"
              min={50}
              max={500}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kolesterol (mg/dL)
            </label>
            <input
              type="number"
              step="0.1"
              name="cholesterol"
              value={form.cholesterol}
              onChange={handleChange}
              placeholder="180"
              min={100}
              max={400}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Catatan
          </label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Tambahkan catatan (opsional)"
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
          />
        </div>

        {/* Tanda Tangan Digital */}
        <div>
          <SignatureCapture
            onSignatureChange={setSignatureData}
            label="Tanda Tangan Digital"
            clearTrigger={refreshTrigger}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !form.employee_name || !signatureData}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Menyimpan..." : "Simpan Data Kesehatan"}
        </button>
      </form>

      {/* Overlay untuk menutup dropdown ketika klik di luar */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};
