import React, { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { SignatureCapture } from "../shared/SignatureCapture";

import {
  Search,
  User,
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  Users,
  BookOpen,
} from "lucide-react";

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
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  trainer?: string;
  max_participants?: number;
  current_participants?: number;
}

interface Employee {
  id: number;
  name: string;
  department: string;
}

export const AttendanceForm: React.FC<AttendanceFormProps> = ({
  onSubmitSuccess,
  refreshTrigger,
}) => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [signatureData, setSignatureData] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTrain, setSearchTrain] = useState("");
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const [isTrainingDropdownOpen, setIsTrainingDropdownOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(
    null
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AttendanceFormData>();

  const selectedParticipant = watch("participant_name");
  const selectedTrainingId = watch("training_id");

  // Filter employees berdasarkan search term
  const filteredEmployees = useMemo(() => {
    if (!searchTerm) return employees;
    return employees.filter(
      (employee) =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  const filteredTrainings = useMemo(() => {
    if (!searchTrain) return trainings;
    return trainings.filter(
      (training) =>
        training.title.toLowerCase().includes(searchTrain.toLowerCase()) ||
        training.trainer?.toLowerCase().includes(searchTrain.toLowerCase()) ||
        training.location?.toLowerCase().includes(searchTrain.toLowerCase())
    );
  }, [trainings, searchTrain]);

  // Update selected training ketika training_id berubah
  useEffect(() => {
    if (selectedTrainingId) {
      const training = trainings.find((t) => t.id === selectedTrainingId);
      setSelectedTraining(training || null);
    } else {
      setSelectedTraining(null);
    }
  }, [selectedTrainingId, trainings]);

  useEffect(() => {
    reset();
    setSignatureData("");
    setSearchTerm("");
    setSearchTrain("");
    setIsEmployeeDropdownOpen(false);
    setIsTrainingDropdownOpen(false);
    setSelectedTraining(null);
  }, [refreshTrigger, reset]);

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE}/api/trainings`
        );
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data: Training[] = await res.json();
        setTrainings(data);
      } catch (error) {
        console.error("Error fetching upcoming trainings:", error);
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
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE}/api/employees`
        );
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data: Employee[] = await res.json();
        setEmployees(data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setIsLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, []);

  const onFormSubmit = async (data: AttendanceFormData) => {
    if (!signatureData) {
      alert("Tanda tangan diperlukan");
      return;
    }

    try {
      await fetch(`${import.meta.env.VITE_API_BASE}/api/training-attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, signature: signatureData }),
      });
      reset();
      setSignatureData("");
      setSearchTerm("");
      setSearchTrain("");
      setIsEmployeeDropdownOpen(false);
      setIsTrainingDropdownOpen(false);
      setSelectedTraining(null);
      onSubmitSuccess();
    } catch (err) {
      console.error(err);
      alert("Submit absensi gagal");
    }
  };

  const handleEmployeeSelect = (employeeName: string) => {
    setValue("participant_name", employeeName);
    setSearchTerm(employeeName);
    setIsEmployeeDropdownOpen(false);
  };

  const handleTrainingSelect = (trainingId: string, trainingTitle: string) => {
    setValue("training_id", trainingId);
    setSearchTrain(trainingTitle);
    setIsTrainingDropdownOpen(false);
  };

  const toggleEmployeeDropdown = () => {
    setIsEmployeeDropdownOpen(!isEmployeeDropdownOpen);
    if (!isEmployeeDropdownOpen) {
      setIsTrainingDropdownOpen(false);
    }
  };

  const toggleTrainingDropdown = () => {
    setIsTrainingDropdownOpen(!isTrainingDropdownOpen);
    if (!isTrainingDropdownOpen) {
      setIsEmployeeDropdownOpen(false);
    }
  };

  // Format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Form Absensi Pelatihan
      </h3>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Dropdown Pelatihan dengan Search */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pilih Pelatihan
          </label>

          {isLoading ? (
            <p className="text-gray-500 text-sm">Memuat daftar pelatihan...</p>
          ) : trainings.length === 0 ? (
            <p className="text-gray-500 text-sm">
              Tidak ada pelatihan yang tersedia
            </p>
          ) : (
            <div className="space-y-2">
              {/* Custom Dropdown Trigger untuk Training */}
              <div className="relative">
                <button
                  type="button"
                  onClick={toggleTrainingDropdown}
                  className={`w-full flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors ${
                    errors.training_id
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  } focus:outline-none focus:ring-2 bg-white`}
                >
                  <span
                    className={`truncate ${
                      !selectedTraining ? "text-gray-400" : "text-gray-900"
                    }`}
                  >
                    {selectedTraining?.title || "-- Pilih Pelatihan --"}
                  </span>
                  {isTrainingDropdownOpen ? (
                    <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>

                {/* Hidden input untuk react-hook-form */}
                <input
                  type="hidden"
                  {...register("training_id", {
                    required: "Pelatihan wajib dipilih",
                  })}
                />
              </div>

              {/* Dropdown Content untuk Training */}
              {isTrainingDropdownOpen && (
                <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
                  {/* Search Input untuk Training */}
                  <div className="p-2 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Cari judul, trainer, atau lokasi..."
                        value={searchTrain}
                        onChange={(e) => setSearchTrain(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Training List */}
                  <div className="overflow-y-auto max-h-64">
                    {filteredTrainings.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        {searchTrain
                          ? "Tidak ada pelatihan yang sesuai"
                          : "Tidak ada data pelatihan"}
                      </div>
                    ) : (
                      filteredTrainings.map((training) => (
                        <button
                          key={training.id}
                          type="button"
                          onClick={() =>
                            handleTrainingSelect(training.id, training.title)
                          }
                          className={`w-full flex items-start space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                            selectedTrainingId === training.id
                              ? "bg-blue-50 border-blue-200"
                              : ""
                          }`}
                        >
                          <div className="flex-shrink-0 mt-1">
                            <BookOpen className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              {training.title}
                            </p>
                            <div className="space-y-1 text-xs text-gray-600">
                              {/* Trainer */}
                              {training.trainer && (
                                <div className="flex items-center space-x-1">
                                  <User className="h-3 w-3" />
                                  <span>Trainer: {training.trainer}</span>
                                </div>
                              )}
                              {/* Tanggal & Waktu */}
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {formatDateTime(training.start_time).date} •{" "}
                                  {formatDateTime(training.start_time).time}
                                </span>
                              </div>
                              {/* Lokasi */}
                              {training.location && (
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate">
                                    {training.location}
                                  </span>
                                </div>
                              )}
                              {/* Kuota Peserta */}
                              {(training.max_participants ||
                                training.current_participants) && (
                                <div className="flex items-center space-x-1">
                                  <Users className="h-3 w-3" />
                                  <span>
                                    {training.current_participants || 0}
                                    {training.max_participants &&
                                      ` / ${training.max_participants}`}{" "}
                                    peserta
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          {selectedTrainingId === training.id && (
                            <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {errors.training_id && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.training_id.message}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Informasi Detail Pelatihan yang Dipilih */}
        {selectedTraining && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-blue-900 text-sm">
              Informasi Pelatihan yang Dipilih:
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {/* Judul Pelatihan */}
              <div className="col-span-2">
                <p className="font-medium text-gray-900">
                  {selectedTraining.title}
                </p>
                {selectedTraining.description && (
                  <p className="text-gray-600 mt-1 text-xs">
                    {selectedTraining.description}
                  </p>
                )}
              </div>

              {/* Waktu Pelatihan */}
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-gray-900 font-medium">
                    {formatDateTime(selectedTraining.start_time).date}
                  </p>
                  <p className="text-gray-600 text-xs">
                    {formatDateTime(selectedTraining.start_time).time} -{" "}
                    {formatDateTime(selectedTraining.end_time).time}
                  </p>
                </div>
              </div>

              {/* Lokasi */}
              {selectedTraining.location && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <p className="text-gray-700 truncate">
                    {selectedTraining.location}
                  </p>
                </div>
              )}

              {/* Trainer */}
              {selectedTraining.trainer && (
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <p className="text-gray-700">
                    Trainer: {selectedTraining.trainer}
                  </p>
                </div>
              )}

              {/* Kuota Peserta */}
              {(selectedTraining.max_participants ||
                selectedTraining.current_participants) && (
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <p className="text-gray-700">
                    Peserta: {selectedTraining.current_participants || 0}
                    {selectedTraining.max_participants &&
                      ` / ${selectedTraining.max_participants}`}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dropdown Nama Karyawan dengan Search */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Karyawan
          </label>

          {isLoadingEmployees ? (
            <p className="text-gray-500 text-sm">Memuat daftar karyawan...</p>
          ) : (
            <div className="space-y-2">
              {/* Custom Dropdown Trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={toggleEmployeeDropdown}
                  className={`w-full flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors ${
                    errors.participant_name
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  } focus:outline-none focus:ring-2 bg-white`}
                >
                  <span
                    className={`truncate ${
                      !selectedParticipant ? "text-gray-400" : "text-gray-900"
                    }`}
                  >
                    {selectedParticipant || "-- Pilih Karyawan --"}
                  </span>
                  {isEmployeeDropdownOpen ? (
                    <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>

                {/* Hidden input untuk react-hook-form */}
                <input
                  type="hidden"
                  {...register("participant_name", {
                    required: "Nama karyawan wajib dipilih",
                  })}
                />
              </div>

              {/* Dropdown Content */}
              {isEmployeeDropdownOpen && (
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
                          className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                            selectedParticipant === employee.name
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
                            <p className="text-xs text-gray-500 truncate">
                              {employee.department}
                            </p>
                          </div>
                          {selectedParticipant === employee.name && (
                            <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {errors.participant_name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.participant_name.message}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Catatan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Catatan (Opsional)
          </label>
          <textarea
            {...register("notes")}
            rows={3}
            placeholder="Tambahkan catatan..."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none bg-white"
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
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={!selectedTraining || !selectedParticipant}
        >
          {selectedTraining && selectedParticipant
            ? `Absen untuk ${selectedTraining.title}`
            : "Lengkapi Data Terlebih Dahulu"}
        </button>
      </form>

      {/* Overlay untuk menutup dropdown ketika klik di luar */}
      {(isEmployeeDropdownOpen || isTrainingDropdownOpen) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setIsEmployeeDropdownOpen(false);
            setIsTrainingDropdownOpen(false);
          }}
        />
      )}
    </div>
  );
};
