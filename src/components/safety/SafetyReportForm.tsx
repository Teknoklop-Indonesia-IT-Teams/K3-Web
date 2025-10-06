import React from 'react';
import { useForm } from 'react-hook-form';
import { AlertTriangle, MapPin, Clock } from 'lucide-react';

interface SafetyReportFormData {
  incident_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'selesai' | 'investigasi' | 'pending';
  location: string;
  incident_date: string;
  incident_time: string;
  description: string;
  reporter_name: string;
  witnesses: string;
  immediate_action: string;
}

interface SafetyReportFormProps {
  onSubmit: () => void;
}

export const SafetyReportForm: React.FC<SafetyReportFormProps> = ({ onSubmit }) => {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<SafetyReportFormData>();
  const selectedSeverity = watch('severity');
  const selectedStatus = watch('status');

  const onFormSubmit = async (data: SafetyReportFormData) => {
    try {
      // 🔥 Mapping field frontend → backend
      const payload = {
        title: data.incident_type,       // frontend incident_type → backend title
        severity: data.severity,
        status: data.status,
        location: data.location,
        incident_date: data.incident_date,
        incident_time: data.incident_time,
        description: data.description,
        reporter: data.reporter_name,    // frontend reporter_name → backend reporter
        witnesses: data.witnesses || null,
        immediate_action: data.immediate_action || null,
      };

      const res = await fetch('http://localhost:4000/api/safety/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const saved = await res.json();
      console.log('✅ Laporan tersimpan:', saved);

      reset();
      onSubmit();
    } catch (err) {
      console.error('❌ Gagal simpan laporan:', err);
      alert('Gagal menyimpan laporan insiden');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
        Laporan Insiden K3
      </h3>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Jenis Insiden */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Insiden</label>
          <select
            {...register('incident_type', { required: 'Pilih jenis insiden' })}
            className="w-full rounded-lg border-gray-300 border px-4 py-3"
          >
            <option value="">Pilih Jenis Insiden</option>
            <option value="near_miss">Near Miss</option>
            <option value="accident">Kecelakaan</option>
            <option value="equipment_failure">Kerusakan Peralatan</option>
            <option value="safety_violation">Pelanggaran K3</option>
            <option value="environmental">Lingkungan</option>
          </select>
          {errors.incident_type && <p className="text-red-500 text-sm mt-1">{errors.incident_type.message}</p>}
        </div>

        {/* Severity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tingkat Keparahan</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: 'low', label: 'Rendah', color: 'border-green-300 text-green-700' },
              { value: 'medium', label: 'Sedang', color: 'border-yellow-300 text-yellow-700' },
              { value: 'high', label: 'Tinggi', color: 'border-orange-300 text-orange-700' },
              { value: 'critical', label: 'Kritis', color: 'border-red-300 text-red-700' },
            ].map((s) => (
              <label
                key={s.value}
                className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer relative
                ${s.color} ${selectedSeverity === s.value ? 'bg-gray-100 border-4' : ''}`}
              >
                <input
                  {...register('severity', { required: 'Pilih tingkat keparahan' })}
                  type="radio"
                  value={s.value}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <span className="text-sm font-medium pointer-events-none">{s.label}</span>
              </label>
            ))}
          </div>
          {errors.severity && <p className="text-red-500 text-sm mt-1">{errors.severity.message}</p>}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status Insiden</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'selesai', label: 'Selesai', color: 'border-green-300 text-green-700' },
              { value: 'investigasi', label: 'Investigasi', color: 'border-blue-300 text-blue-700' },
              { value: 'pending', label: 'Pending', color: 'border-yellow-300 text-yellow-700' },
            ].map((st) => (
              <label
                key={st.value}
                className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer relative
                ${st.color} ${selectedStatus === st.value ? 'bg-gray-100 border-4' : ''}`}
              >
                <input
                  {...register('status', { required: 'Pilih status insiden' })}
                  type="radio"
                  value={st.value}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <span className="text-sm font-medium pointer-events-none">{st.label}</span>
              </label>
            ))}
          </div>
          {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
        </div>

        {/* Lokasi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Lokasi Insiden</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              {...register('location', { required: 'Masukkan lokasi insiden' })}
              placeholder="Contoh: Gedung A - Lantai 2"
              className="w-full rounded-lg border-gray-300 border pl-10 pr-4 py-3"
            />
          </div>
        </div>

        {/* Tanggal & Waktu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="date" {...register('incident_date', { required: 'Pilih tanggal kejadian' })}
            className="w-full rounded-lg border-gray-300 border px-4 py-3" />
          <div className="relative">
            <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input type="time" {...register('incident_time', { required: 'Pilih waktu kejadian' })}
              className="w-full rounded-lg border-gray-300 border pl-10 pr-4 py-3" />
          </div>
        </div>

        {/* Deskripsi */}
        <textarea {...register('description', { required: 'Deskripsikan insiden' })}
          rows={4} placeholder="Jelaskan insiden secara detail..."
          className="w-full rounded-lg border-gray-300 border px-4 py-3 resize-none" />

        {/* Pelapor */}
        <input {...register('reporter_name', { required: 'Masukkan nama pelapor' })}
          placeholder="Nama lengkap pelapor"
          className="w-full rounded-lg border-gray-300 border px-4 py-3" />

        {/* Saksi */}
        <input {...register('witnesses')}
          placeholder="Nama saksi (opsional)"
          className="w-full rounded-lg border-gray-300 border px-4 py-3" />

        {/* Tindakan Segera */}
        <textarea {...register('immediate_action')}
          rows={3} placeholder="Langkah tindakan segera (opsional)"
          className="w-full rounded-lg border-gray-300 border px-4 py-3 resize-none" />

        {/* Submit */}
        <button type="submit"
          className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition">
          Submit Laporan
        </button>
      </form>
    </div>
  );
};
