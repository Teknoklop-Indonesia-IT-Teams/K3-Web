import React, { useEffect, useState } from "react";
import {
  User,
  Edit,
  Trash2,
  Eye,
  Save,
  X,
  Calendar,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Swal from "sweetalert2";
import { Employee, EmployeeListProps, TrainingHistory } from "../../types";

export const EmployeeList: React.FC<EmployeeListProps> = ({
  refreshTrigger,
  highlightId,
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    department: "",
    blood_type: "",
    email: "",
    phone: "",
    status: "",
  });
  const [detailEmployee, setDetailEmployee] = useState<Employee | null>(null);
  const [trainingHistory, setTrainingHistory] = useState<TrainingHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const employeesPerPage = 5;

  // 🔥 TAMBAHAN: Daftar departemen yang sama dengan EmployeeForm
  const departments = [
    { value: "Direktur", label: "Direktur" },
    { value: "Lab", label: "Laboratorium" },
    { value: "Automasi", label: "Automation" },
    { value: "RND", label: "Research and Development (RND)" },
    { value: "IT", label: "IT" },
    { value: "Admin", label: "Finance" },
    { value: "Cook", label: "Cook" },
  ];

  const status = [
    { value: "active", label: "Aktif" },
    { value: "non-active", label: "Tidak Aktif" },
  ];

  useEffect(() => {
    fetchEmployees();
  }, [refreshTrigger]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchEmployees = () => {
    let mounted = true;
    setLoading(true);

    fetch(`${import.meta.env.VITE_API_BASE}/api/employees`, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => {
        if (mounted) {
          setEmployees([...data]);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  };

  const fetchTrainingHistory = async (employeeName: string) => {
    setLoadingHistory(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/employees/${encodeURIComponent(
          employeeName,
        )}/training-history`,
      );
      if (res.ok) {
        const data = await res.json();
        setTrainingHistory(data);
      } else {
        console.error("Failed to fetch training history");
        setTrainingHistory([]);
      }
    } catch (error) {
      console.error("Error fetching training history:", error);
      setTrainingHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingId(employee.id);
    setEditForm({
      name: employee.name,
      department: employee.department,
      blood_type: employee.blood_type,
      email: employee.email,
      phone: employee.phone,
      status: employee.status,
    });
  };

  const handleSave = async (id: number) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/employees/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editForm.name,
            department: editForm.department || null,
            blood_type: editForm.blood_type || null,
            email: editForm.email || null,
            phone: editForm.phone || null,
            status: editForm.status,
          }),
        },
      );

      if (!res.ok) {
        throw new Error("Gagal update");
      }

      setEmployees(
        employees.map((emp) =>
          emp.id === id
            ? {
                ...emp,
                name: editForm.name,
                department: editForm.department,
                blood_type: editForm.blood_type,
                email: editForm.email,
                phone: editForm.phone,
                status: editForm.status,
              }
            : emp,
        ),
      );

      setEditingId(null);

      if (detailEmployee?.id === id) {
        setDetailEmployee({
          ...detailEmployee,
          name: editForm.name,
          department: editForm.department,
          email: editForm.email,
          phone: editForm.phone,
          blood_type: editForm.blood_type,
          status: editForm.status,
        });
      }

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data karyawan berhasil diperbarui",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error updating employee:", error);

      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: "Terjadi kesalahan saat update data",
      });
    }
  };

  const handleDelete = async (id: number, name: string) => {
    const result = await Swal.fire({
      title: "Yakin hapus?",
      text: `Karyawan ${name} akan dihapus`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/employees/${id}`,
        {
          method: "DELETE",
        },
      );

      if (!res.ok) {
        throw new Error("Gagal delete");
      }

      setEmployees(employees.filter((emp) => emp.id !== id));

      if (detailEmployee?.id === id) {
        setDetailEmployee(null);
      }

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Karyawan berhasil dihapus",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error deleting employee:", error);

      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: "Terjadi kesalahan saat menghapus karyawan",
      });
    }
  };

  const handleViewDetails = (employee: Employee) => {
    setDetailEmployee(employee);
    fetchTrainingHistory(employee.name);
  };

  const closeDetail = () => {
    setDetailEmployee(null);
    setTrainingHistory([]);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      name: "",
      department: "",
      blood_type: "",
      email: "",
      phone: "",
      status: "",
    });
  };

  const getTrainingStatus = (training: TrainingHistory) => {
    const trainingDate = new Date(training.start_time);
    const today = new Date();

    const todayDateOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const trainingDateOnly = new Date(
      trainingDate.getFullYear(),
      trainingDate.getMonth(),
      trainingDate.getDate(),
    );

    switch (training.status) {
      case "attended":
        return {
          status: "Hadir",
          color: "text-green-600 bg-green-50",
          date: trainingDate,
          type: "attended",
        };

      case "upcoming":
        const daysUntil = Math.ceil(
          (trainingDateOnly.getTime() - todayDateOnly.getTime()) /
            (1000 * 60 * 60 * 24),
        );
        return {
          status:
            daysUntil === 0 ? "Hari ini" : `Upcoming - ${daysUntil} hari lagi`,
          color: "text-blue-600 bg-blue-50",
          date: trainingDate,
          type: "upcoming",
        };

      case "absent":
        return {
          status: "Tidak Hadir",
          color: "text-red-600 bg-red-50",
          date: trainingDate,
          type: "absent",
        };

      default:
        return {
          status: "Unknown",
          color: "text-gray-600 bg-gray-50",
          date: trainingDate,
          type: "unknown",
        };
    }
  };

  const calculateStats = () => {
    const attended = trainingHistory.filter(
      (t) => t.status === "attended",
    ).length;
    const absent = trainingHistory.filter((t) => t.status === "absent").length;
    const upcoming = trainingHistory.filter(
      (t) => t.status === "upcoming",
    ).length;

    return { attended, absent, upcoming };
  };

  if (loading)
    return (
      <div className="flex justify-center items-center p-4 min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading employees...</span>
      </div>
    );

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.status.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);
  const startIdx = (currentPage - 1) * employeesPerPage;
  const visibleEmployees = filteredEmployees.slice(
    startIdx,
    startIdx + employeesPerPage,
  );

  const stats = calculateStats();

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-600 flex-shrink-0" />
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              Daftar Karyawan
            </h3>
          </div>

          <div className="flex flex-col xs:flex-row gap-3 items-start xs:items-center justify-between xs:justify-end">
            {/* Search Input */}
            <div className="relative w-full xs:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama atau divisi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="text-sm text-gray-500 whitespace-nowrap bg-gray-50 px-3 py-1 rounded-lg">
              Total:{" "}
              <span className="font-semibold">{filteredEmployees.length}</span>{" "}
              / {employees.length}
            </div>
          </div>
        </div>

        {/* Employee List */}
        <div className="space-y-3">
          {visibleEmployees.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <User className="h-16 w-16 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 text-lg mb-2">
                {searchTerm
                  ? "Tidak ada karyawan yang sesuai"
                  : "Belum ada data karyawan"}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Reset pencarian
                </button>
              )}
            </div>
          ) : (
            visibleEmployees.map((employee: Employee) => (
              <div
                key={employee.id}
                className={`border border-gray-200 rounded-lg p-4 transition-all duration-200 ${
                  highlightId === employee.id
                    ? "bg-green-50 border-green-200 animate-pulse"
                    : "hover:shadow-md hover:border-gray-300"
                }`}
              >
                {editingId === employee.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Masukkan nama karyawan"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Divisi
                      </label>
                      {/* 🔥 PERBAIKAN: Ubah input text menjadi dropdown */}
                      <select
                        value={editForm.department}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            department: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Pilih Departemen</option>
                        {departments.map((dept) => (
                          <option key={dept.value} value={dept.value}>
                            {dept.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) =>
                          setEditForm({ ...editForm, email: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Masukkan email karyawan"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        No Telp
                      </label>
                      <input
                        type="number"
                        value={editForm.phone}
                        onChange={(e) =>
                          setEditForm({ ...editForm, phone: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Masukkan no telp karyawan"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Blood Type
                      </label>
                      <input
                        type="text"
                        value={editForm.blood_type}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            blood_type: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Masukkan golongan darah karyawan"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={editForm.status}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            status: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Pilih Status</option>
                        {status.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col xs:flex-row gap-2">
                      <button
                        onClick={() => handleSave(employee.id)}
                        className="flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors flex-1"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Simpan
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center justify-center bg-gray-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600 transition-colors flex-1"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {employee.name}
                      </div>
                      <div className="text-sm text-gray-600 truncate">
                        {/* 🔥 PERBAIKAN: Tampilkan label yang sesuai dengan value */}
                        {departments.find(
                          (dept) => dept.value === employee.department,
                        )?.label || employee.department}
                      </div>
                      <div className="text-sm text-gray-900 truncate">
                        Goldar :
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            employee.blood_type === "A" ||
                            employee.blood_type === "A+" ||
                            employee.blood_type === "A-"
                              ? "bg-blue-100 text-blue-800"
                              : employee.blood_type === "B" ||
                                  employee.blood_type === "B+" ||
                                  employee.blood_type === "B-"
                                ? "bg-red-100 text-red-800"
                                : employee.blood_type === "AB" ||
                                    employee.blood_type === "AB+" ||
                                    employee.blood_type === "AB-"
                                  ? "bg-purple-100 text-purple-800"
                                  : employee.blood_type === "O" ||
                                      employee.blood_type === "O+" ||
                                      employee.blood_type === "O-"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {employee.blood_type || "-"}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-1 sm:space-x-2 flex-shrink-0">
                      <button
                        onClick={() => handleViewDetails(employee)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Lihat Detail"
                      >
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(employee)}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                        title="Edit Karyawan"
                      >
                        <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id, employee.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Karyawan"
                      >
                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col xs:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Halaman {currentPage} dari {totalPages}
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Sebelumnya"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Selanjutnya"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Employee Detail Modal */}
      {detailEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[95vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 truncate pr-2">
                  Detail Karyawan - {detailEmployee.name}
                </h3>
                <button
                  onClick={closeDetail}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Employee Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <User className="h-5 w-5 mr-2 text-blue-600 flex-shrink-0" />
                    Informasi Karyawan
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600 block mb-1 text-xs">
                        Nama Lengkap:
                      </span>
                      <p className="font-medium text-gray-900 break-words">
                        {detailEmployee.name}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1 text-xs">
                        Divisi/Department:
                      </span>
                      <p className="font-medium text-gray-900 break-words">
                        {/* 🔥 PERBAIKAN: Tampilkan label yang sesuai dengan value */}
                        {departments.find(
                          (dept) => dept.value === detailEmployee.department,
                        )?.label || detailEmployee.department}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1 text-xs">
                        Status:
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {detailEmployee.status === "active"
                          ? "Aktif"
                          : "Tidak Aktif"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1 text-xs">
                        Email:
                      </span>
                      <p className="font-medium text-gray-900 break-words">
                        {detailEmployee.email}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1 text-xs">
                        No Telp:
                      </span>
                      <p className="font-medium text-gray-900 break-words">
                        {detailEmployee.phone}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1 text-xs">
                        Golongan Darah:
                      </span>
                      <p className="font-medium text-gray-900 break-words">
                        {detailEmployee.blood_type}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Training History */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-green-600 flex-shrink-0" />
                    Riwayat Pelatihan & Kehadiran
                  </h4>
                  {loadingHistory ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-500 text-sm mt-2">
                        Memuat riwayat pelatihan...
                      </p>
                    </div>
                  ) : trainingHistory.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">
                        Belum ada riwayat pelatihan
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {trainingHistory.map((training, index) => {
                          const status = getTrainingStatus(training);
                          return (
                            <div
                              key={`${training.training_title}-${index}`}
                              className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                            >
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 break-words">
                                    {training.training_title}
                                  </p>
                                  <div className="flex items-center text-sm text-gray-600 mt-1">
                                    <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                                    <span className="break-words">
                                      {status.date
                                        ? status.date.toLocaleDateString(
                                            "id-ID",
                                            {
                                              weekday: "long",
                                              year: "numeric",
                                              month: "long",
                                              day: "numeric",
                                            },
                                          )
                                        : "Tanggal tidak tersedia"}
                                    </span>
                                  </div>
                                </div>
                                <span
                                  className={`text-xs font-medium px-2 py-1 rounded-full ${status.color} whitespace-nowrap flex-shrink-0 self-start sm:self-center`}
                                >
                                  {status.status}
                                </span>
                              </div>
                              {training.attendance_date && (
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                  <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                                  <span>
                                    Waktu absensi:{" "}
                                    {new Date(
                                      training.attendance_date,
                                    ).toLocaleTimeString("id-ID")}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Statistics */}
                      <div className="bg-blue-50 rounded-lg p-4 mt-4">
                        <h5 className="font-medium text-blue-900 mb-3 text-sm">
                          Statistik Kehadiran
                        </h5>
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div className="text-center bg-white rounded-lg p-2">
                            <div className="text-xl font-bold text-green-600">
                              {stats.attended}
                            </div>
                            <div className="text-blue-800 font-medium">
                              Hadir
                            </div>
                          </div>
                          <div className="text-center bg-white rounded-lg p-2">
                            <div className="text-xl font-bold text-red-600">
                              {stats.absent}
                            </div>
                            <div className="text-blue-800 font-medium">
                              Tidak Hadir
                            </div>
                          </div>
                          <div className="text-center bg-white rounded-lg p-2">
                            <div className="text-xl font-bold text-blue-600">
                              {stats.upcoming}
                            </div>
                            <div className="text-blue-800 font-medium">
                              Upcoming
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
