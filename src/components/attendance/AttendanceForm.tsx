import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { SignatureCapture } from '../shared/SignatureCapture';

interface AttendanceFormData {
  training_id: string;
  participant_name: string;
  notes: string;
}

interface AttendanceFormProps {
  onSubmitSuccess: () => void;
  refreshTrigger: number;
}

interface Training {
  id: string;
  title: string;
}

interface Employee {
  id: number;
  name: string;
}

export const AttendanceForm: React.FC<AttendanceFormProps> = ({ onSubmitSuccess, refreshTrigger }) => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [signatureData, setSignatureData] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AttendanceFormData>();

  useEffect(() => {
    reset();
    setSignatureData('');
  }, [refreshTrigger, reset]);

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        setIsLoading(true);
        // Gunakan endpoint baru untuk mengambil pelatihan yang belum lewat
        const res = await fetch('http://localhost:4000/api/trainings/upcoming');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data: Training[] = await res.json();
        console.log('Upcoming trainings data:', data);
        setTrainings(data);
      } catch (error) {
        console.error('Error fetching upcoming trainings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTrainings();
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoadingEmployees(true);
        const res = await fetch('http://localhost:4000/api/employees');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data: Employee[] = await res.json();
        console.log('Employees data:', data);
        setEmployees(data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setIsLoadingEmployees(false);
      }
    };
    
    fetchEmployees();
  }, []);

  const onFormSubmit = async (data: AttendanceFormData) => {
    if (!signatureData) {
      alert('Tanda tangan diperlukan');
      return;
    }

    try {
      await fetch('http://localhost:4000/api/training-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, signature: signatureData }),
      });
      reset();
      setSignatureData('');
      onSubmitSuccess();
    } catch (err) {
      console.error(err);
      alert('Submit absensi gagal');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Form Absensi Pelatihan</h3>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">

        {/* Dropdown Pelatihan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Pelatihan</label>
          {isLoading ? (
            <p className="text-gray-500 text-sm">Memuat daftar pelatihan...</p>
          ) : trainings.length === 0 ? (
            <p className="text-gray-500 text-sm">Tidak ada pelatihan yang akan datang</p>
          ) : (
            <>
              <select
                {...register('training_id', { required: 'Pilih pelatihan' })}
                className="w-full rounded-lg border-gray-300 border px-4 py-3"
              >
                <option value="">-- Pilih Pelatihan --</option>
                {trainings.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
              {errors.training_id && <p className="text-red-500 text-sm mt-1">{errors.training_id.message}</p>}
            </>
          )}
        </div>

        {/* Dropdown Nama Karyawan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nama Karyawan</label>
          {isLoadingEmployees ? (
            <p className="text-gray-500 text-sm">Memuat daftar karyawan...</p>
          ) : (
            <>
              <select
                {...register('participant_name', { required: 'Nama karyawan wajib dipilih' })}
                className="w-full rounded-lg border-gray-300 border px-4 py-3"
              >
                <option value="">-- Pilih Karyawan --</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.name}>
                    {employee.name}
                  </option>
                ))}
              </select>
              {errors.participant_name && (
                <p className="text-red-500 text-sm mt-1">{errors.participant_name.message}</p>
              )}
            </>
          )}
        </div>

        {/* Catatan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Catatan (Opsional)</label>
          <textarea
            {...register('notes')}
            rows={3}
            placeholder="Tambahkan catatan..."
            className="w-full rounded-lg border-gray-300 border px-4 py-3"
          />
        </div>

        {/* Signature */}
        <div>
          <SignatureCapture
            onSignatureChange={setSignatureData}
            label="Tanda Tangan Digital"
            clearTrigger={refreshTrigger}
          />
        </div>

        {/* Submit */}
        <button type="submit" className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg">
          Submit Absensi
        </button>
      </form>
    </div>
  );
};