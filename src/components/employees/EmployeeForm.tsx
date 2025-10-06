import React from 'react';
import { useForm } from 'react-hook-form';
import { User } from 'lucide-react';

interface EmployeeFormData {
  name: string;
  department: string;
}

interface EmployeeFormProps {
  onSubmit: (newEmployeeId: number) => void;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({ onSubmit }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EmployeeFormData>();

  const onFormSubmit = async (data: EmployeeFormData) => {
    try {
      const res = await fetch("http://localhost:4000/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Gagal menambahkan karyawan");

      const newEmployee = await res.json();
      reset();
      onSubmit(newEmployee.id);
    } catch (err) {
      console.error("Error:", err);
      alert("Terjadi kesalahan saat menambahkan karyawan.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <User className="h-5 w-5 mr-2 text-blue-600" />
        Tambah Karyawan Baru
      </h3>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
          <input
            {...register('name', { required: 'Nama lengkap diperlukan' })}
            placeholder="Ahmad Susanto"
            className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Departemen</label>
          <select
            {...register('department', { required: 'Pilih departemen' })}
            className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Pilih Departemen</option>
            <option value="lab">LAB</option>
            <option value="otomasi">Otomasi</option>
            <option value="it">IT</option>
            <option value="admin">Administration</option>
          </select>
          {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department.message}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 font-medium"
        >
          Tambah Karyawan
        </button>
      </form>
    </div>
  );
};
