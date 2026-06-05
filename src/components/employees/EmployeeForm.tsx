import React from "react";
import { useForm } from "react-hook-form";
import { User } from "lucide-react";
import Swal from "sweetalert2";

interface EmployeeFormData {
  name: string;
  department: string;
  email: string | null;
  phone: string | null;
  blood_type: string | null;
}

interface EmployeeFormProps {
  onSubmit: (newEmployeeId: number) => void;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({ onSubmit }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormData>();

  const onFormSubmit = async (data: EmployeeFormData) => {
    try {
      const payload = {
        ...data,
        email: data.email || null,
        phone: data.phone || null,
        blood_type: data.blood_type || null,
      };

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/employees`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        throw new Error("Gagal menambahkan karyawan");
      }

      const newEmployee = await res.json();

      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Karyawan berhasil ditambahkan",
        confirmButtonText: "OK",
        timer: 2000,
        timerProgressBar: true,
      });

      reset();
      onSubmit(newEmployee.id);
    } catch (err) {
      console.error("Error:", err);

      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: "Terjadi kesalahan saat menambahkan karyawan.",
        confirmButtonText: "Tutup",
      });
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Lengkap
          </label>
          <input
            {...register("name", { required: "Isi Nama lengkap" })}
            placeholder="Ahmad Susanto"
            className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Departemen
          </label>
          <select
            {...register("department", { required: "Pilih departemen" })}
            className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Pilih Departemen</option>
            <option value="Direktur">Direktur</option>
            <option value="Lab">Laboratorium</option>
            <option value="Automasi">Automation</option>
            <option value="RND">Research and Development (RND)</option>
            <option value="IT">IT</option>
            <option value="Admin">Finance</option>
            <option value="Cook">Cook</option>
          </select>
          {errors.department && (
            <p className="text-red-500 text-sm mt-1">
              {errors.department.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            {...register("email")}
            placeholder="ahmad.susanto@example.com"
            type="email"
            className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            No Telp
          </label>
          <input
            {...register("phone")}
            placeholder="081234567890"
            type="number"
            className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Golongan Darah
          </label>
          <input
            {...register("blood_type")}
            placeholder="A, B, AB, O"
            className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.blood_type && (
            <p className="text-red-500 text-sm mt-1">
              {errors.blood_type.message}
            </p>
          )}
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
