import React, { useState, useEffect } from "react";
import { SignatureCapture } from '../shared/SignatureCapture';

interface Employee {
  id: number;
  name: string;
}

export const HealthForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
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
  const [signatureData, setSignatureData] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch data karyawan
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoadingEmployees(true);
        const res = await fetch('http://localhost:4000/api/employees');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data: Employee[] = await res.json();
        console.log('Employees data:', data);
        setEmployees(data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setLoadingEmployees(false);
      }
    };
    
    fetchEmployees();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    
    // Validasi tanda tangan
    if (!signatureData) {
      alert("Tanda tangan diperlukan");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/health/checks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          systolic_pressure: form.systolic_pressure ? Number(form.systolic_pressure) : null,
          diastolic_pressure: form.diastolic_pressure ? Number(form.diastolic_pressure) : null,
          heart_rate: form.heart_rate ? Number(form.heart_rate) : null,
          temperature: form.temperature ? Number(form.temperature) : null,
          weight: form.weight ? Number(form.weight) : null,
          blood_sugar: form.blood_sugar ? Number(form.blood_sugar) : null,
          cholesterol: form.cholesterol ? Number(form.cholesterol) : null,
          signature: signatureData, // Tambahkan tanda tangan
        }),
      });

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
      setSignatureData('');
      setRefreshTrigger(prev => prev + 1); // Trigger clear signature

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
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Form Input Data Kesehatan
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Dropdown Nama Karyawan */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Nama Karyawan</label>
          {loadingEmployees ? (
            <p className="text-gray-500 text-sm mt-1">Memuat daftar karyawan...</p>
          ) : (
            <select
              name="employee_name"
              value={form.employee_name}
              onChange={handleChange}
              required
              className="mt-1 w-full border rounded-lg px-3 py-2 shadow-sm"
            >
              <option value="">-- Pilih Karyawan --</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.name}>
                  {employee.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Sistolik (mmHg)</label>
            <input
              type="number"
              name="systolic_pressure"
              value={form.systolic_pressure}
              onChange={handleChange}
              placeholder="250"
              max={250}
              className="mt-1 w-full border rounded-lg px-3 py-2 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Diastolik (mmHg)</label>
            <input
              type="number"
              name="diastolic_pressure"
              value={form.diastolic_pressure}
              onChange={handleChange}
              placeholder="150"
              max={150}
              className="mt-1 w-full border rounded-lg px-3 py-2 shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Detak Jantung (bpm)</label>
            <input
              type="number"
              name="heart_rate"
              value={form.heart_rate}
              onChange={handleChange}
              placeholder="220"
              max={220}
              className="mt-1 w-full border rounded-lg px-3 py-2 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Suhu Tubuh (°C)</label>
            <input
              type="number"
              step="0.1"
              name="temperature"
              value={form.temperature}
              onChange={handleChange}
              placeholder="45"
              max={45}
              className="mt-1 w-full border rounded-lg px-3 py-2 shadow-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Berat Badan (kg)</label>
          <input
            type="number"
            step="0.1"
            name="weight"
            value={form.weight}
            onChange={handleChange}
            placeholder="60"
            className="mt-1 w-full border rounded-lg px-3 py-2 shadow-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Gula Darah (mg/dL)</label>
            <input
              type="number"
              step="0.1"
              name="blood_sugar"
              value={form.blood_sugar}
              onChange={handleChange}
              placeholder="120"
              className="mt-1 w-full border rounded-lg px-3 py-2 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Kolesterol (mg/dL)</label>
            <input
              type="number"
              step="0.1"
              name="cholesterol"
              value={form.cholesterol}
              onChange={handleChange}
              placeholder="200"
              className="mt-1 w-full border rounded-lg px-3 py-2 shadow-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Catatan</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Tambahkan catatan (opsional)"
            rows={3}
            className="mt-1 w-full border rounded-lg px-3 py-2 shadow-sm"
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
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
        >
          {loading ? "Menyimpan..." : "Simpan Data"}
        </button>
      </form>
    </div>
  );
};