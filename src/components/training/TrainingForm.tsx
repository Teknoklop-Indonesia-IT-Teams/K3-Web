import React from 'react';
import { useForm } from 'react-hook-form';
import { BookOpen, Calendar, Image as ImageIcon } from 'lucide-react';

// ================= Utility fetchJSON =================
export async function fetchFormData<T = any>(url: string, formData: FormData, method: string = 'POST'): Promise<T> {
  const res = await fetch(url, {
    method,
    body: formData,
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json() as Promise<T>;
}

// ================= Types =================
interface TrainingFormData {
  title: string;
  trainer: string;
  start_time: string;
  duration_hours: number;
  documentation?: FileList;
}

interface TrainingFormProps {
  onSubmit: () => void;
}

// ================= Component =================
export const TrainingForm: React.FC<TrainingFormProps> = ({ onSubmit }) => {
  const { register, handleSubmit, reset } = useForm<TrainingFormData>();

  const onFormSubmit = async (data: TrainingFormData) => {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('trainer', data.trainer);
      formData.append('date', data.start_time); // backend expects "date"
      formData.append('duration', String(data.duration_hours));
      if (data.documentation && data.documentation.length > 0) {
        formData.append('documentation', data.documentation[0]); // only first file
      }

      await fetchFormData('http://localhost:4000/api/trainings', formData, 'POST');
      reset();
      onSubmit();
    } catch (err: any) {
      console.error(err);
      alert('Gagal menambahkan training: ' + (err.message || err));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-3xl mx-auto">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <BookOpen className="h-5 w-5 mr-2 text-green-600" />
        Jadwalkan Pelatihan K3
      </h3>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Judul Pelatihan</label>
          <input {...register('title', { required: true })}
            placeholder="Pelatihan Dasar K3"
            className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pelatih/Instruktur</label>
          <input {...register('trainer', { required: true })}
            placeholder="Dr. Maria Sari, Sp.OK"
            className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal & Waktu</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input type="datetime-local" {...register('start_time', { required: true })}
                className="w-full rounded-lg border-gray-300 border pl-10 pr-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Durasi (Jam)</label>
            <input type="number" step="0.5" {...register('duration_hours', { required: true })}
              placeholder="2"
              className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <ImageIcon className="h-5 w-5 mr-2 text-gray-400" /> Dokumentasi (opsional)
          </label>
          <input type="file" accept="image/*" {...register('documentation')}
            className="w-full text-sm text-gray-700"
          />
        </div>

        <button type="submit"
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-all duration-200 font-medium">
          Jadwalkan Pelatihan
        </button>
      </form>
    </div>
  );
};
