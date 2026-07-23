import React, { useEffect, useState } from "react";
import {
  User, Edit, Trash2, Eye, Save, X,
  Calendar, Clock, Search, ChevronLeft, ChevronRight,
} from "lucide-react";
import Swal from "sweetalert2";
import { Employee, EmployeeListProps, TrainingHistory, AvailableUser } from "../../types";
import { assignUserToEmployee, getAvailableUsers } from "../../lib/api";
import { authHeaders } from "../../lib/auth";

const DEPTS = [
  { value: "Direktur", label: "Direktur" },
  { value: "Lab", label: "Laboratorium" },
  { value: "Automasi", label: "Automation" },
  { value: "RND", label: "Research and Development (RND)" },
  { value: "IT", label: "IT" },
  { value: "Admin", label: "Finance" },
  { value: "Cook", label: "Cook" },
];
const STATUS_OPTS = [
  { value: "active", label: "Aktif" },
  { value: "non-active", label: "Tidak Aktif" },
];
const PER_PAGE = 5;

export const EmployeeList: React.FC<EmployeeListProps> = ({ refreshTrigger, highlightId, showActions }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", department: "", blood_type: "", email: "", phone: "", status: "" });
  const [detail, setDetail] = useState<Employee | null>(null);
  const [history, setHistory] = useState<TrainingHistory[]>([]);
  const [loadingHist, setLoadingHist] = useState(false);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<AvailableUser[]>([]);

  useEffect(() => {
    fetchEmps();
    if (showActions) getAvailableUsers().then(setUsers).catch(console.error);
  }, [refreshTrigger, showActions]);

  useEffect(() => { setPage(1); }, [search]);

  function fetchEmps() {
    let live = true;
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_BASE}/api/employees`, { cache: "no-store" })
      .then((r) => r.json()).then((d) => { if (live) setEmployees([...d]); })
      .catch(console.error).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }

  async function fetchHistory(name: string) {
    setLoadingHist(true);
    try {
      const r = await fetch(`${import.meta.env.VITE_API_BASE}/api/employees/${encodeURIComponent(name)}/training-history`);
      setHistory(r.ok ? await r.json() : []);
    } catch { setHistory([]); } finally { setLoadingHist(false); }
  }

  function openEdit(e: Employee) {
    setEditingId(e.id);
    setEditForm({ name: e.name, department: e.department, blood_type: e.blood_type, email: e.email, phone: e.phone, status: e.status });
  }

  function cancelEdit() { setEditingId(null); setEditForm({ name: "", department: "", blood_type: "", email: "", phone: "", status: "" }); }

  function openDetail(e: Employee) { setDetail(e); fetchHistory(e.name); }
  function closeDetail() { setDetail(null); setHistory([]); }

  async function saveEdit(id: string) {
    try {
      const r = await fetch(`${import.meta.env.VITE_API_BASE}/api/employees/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(editForm),
      });
      if (!r.ok) throw new Error();
      setEmployees((p) => p.map((e) => e.id === id ? { ...e, ...editForm } : e));
      if (detail?.id === id) setDetail((d) => d ? { ...d, ...editForm } : d);
      setEditingId(null);
      Swal.fire({ icon: "success", title: "Berhasil!", text: "Data karyawan berhasil diperbarui", timer: 2000, showConfirmButton: false });
    } catch { Swal.fire({ icon: "error", title: "Gagal!", text: "Terjadi kesalahan saat update data" }); }
  }

  async function deleteEmp(id: string, name: string) {
    const ok = await Swal.fire({
      title: "Yakin hapus?", text: `Karyawan ${name} akan dihapus`, icon: "warning",
      showCancelButton: true, confirmButtonColor: "#dc2626", cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, hapus", cancelButtonText: "Batal",
    });
    if (!ok.isConfirmed) return;
    try {
      const r = await fetch(`${import.meta.env.VITE_API_BASE}/api/employees/${id}`, { method: "DELETE", headers: authHeaders() });
      if (!r.ok) throw new Error();
      setEmployees((p) => p.filter((e) => e.id !== id));
      if (detail?.id === id) setDetail(null);
      Swal.fire({ icon: "success", title: "Berhasil!", text: "Karyawan berhasil dihapus", timer: 2000, showConfirmButton: false });
    } catch { Swal.fire({ icon: "error", title: "Gagal!", text: "Terjadi kesalahan saat menghapus karyawan" }); }
  }

  async function assignUser(empId: string, val: string) {
    try {
      const uid = val === "" ? null : Number(val);
      await assignUserToEmployee(empId, uid);
      setEmployees((p) => p.map((e) => {
        if (e.id !== empId) return e;
        const u = users.find((x) => x.id === uid);
        return { ...e, user_id: uid, username: u?.username ?? null, user_role: u?.role ?? null };
      }));
      Swal.fire({ icon: "success", title: "Akun berhasil ditetapkan", timer: 1500, showConfirmButton: false });
    } catch { Swal.fire({ icon: "error", title: "Gagal menetapkan akun" }); }
  }

  function bloodColor(bt: string) {
    if (["A","A+","A-"].includes(bt)) return "bg-blue-100 text-blue-800";
    if (["B","B+","B-"].includes(bt)) return "bg-red-100 text-red-800";
    if (["AB","AB+","AB-"].includes(bt)) return "bg-purple-100 text-purple-800";
    if (["O","O+","O-"].includes(bt)) return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-800";
  }

  function trainingStatusLabel(t: TrainingHistory) {
    if (t.status === "attended") return { text: "Hadir", cls: "text-green-600 bg-green-50" };
    if (t.status === "absent") return { text: "Tidak Hadir", cls: "text-red-600 bg-red-50" };
    const days = Math.ceil((new Date(t.start_time).getTime() - Date.now()) / 86400000);
    return { text: days === 0 ? "Hari ini" : `Upcoming – ${days} hari lagi`, cls: "text-blue-600 bg-blue-50" };
  }

  const histStats = {
    attended: history.filter((h) => h.status === "attended").length,
    absent: history.filter((h) => h.status === "absent").length,
    upcoming: history.filter((h) => h.status === "upcoming").length,
  };

  if (loading) return (
    <div className="flex justify-center items-center p-4 min-h-[200px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      <span className="ml-2 text-gray-600">Loading employees...</span>
    </div>
  );

  const filtered = employees.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase()) ||
    e.status.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <>
      {/* ── Main list card ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-600 flex-shrink-0" />
            <h3 className="text-lg font-semibold text-gray-900">Daftar Karyawan</h3>
          </div>
          <div className="flex flex-col xs:flex-row gap-3 items-start xs:items-center">
            <div className="relative w-full xs:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Cari nama atau divisi..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            
            <div className="text-sm text-gray-500 whitespace-nowrap bg-gray-50 px-3 py-1 rounded-lg">
              Total: <span className="font-semibold">{filtered.length}</span> / {employees.length}
            </div>
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {visible.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <User className="h-16 w-16 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 text-lg mb-2">
                {search ? "Tidak ada karyawan yang sesuai" : "Belum ada data karyawan"}
              </p>
              {search && (
                <button onClick={() => setSearch("")} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Reset pencarian
                </button>
              )}
            </div>
          ) : visible.map((emp) => (
            <div key={emp.id}
              className={`border border-gray-200 rounded-lg p-4 transition-all duration-200 ${highlightId === emp.id ? "bg-green-50 border-green-200 animate-pulse" : "hover:shadow-md hover:border-gray-300"}`}>
              {/* ── Edit mode (managers only) ── */}
              {showActions && editingId === emp.id ? (
                <div className="space-y-3">
                  {[
                    { label: "Nama", key: "name", type: "text", placeholder: "Nama karyawan" },
                    { label: "Email", key: "email", type: "email", placeholder: "email@example.com" },
                    { label: "No Telp", key: "phone", type: "text", placeholder: "08xxxxxxxxxx" },
                    { label: "Golongan Darah", key: "blood_type", type: "text", placeholder: "A / B / AB / O" },
                  ].map(({ label, key, type, placeholder }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                      <input type={type} value={(editForm as any)[key]} placeholder={placeholder}
                        onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Divisi</label>
                    <select value={editForm.department} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Pilih Departemen</option>
                      {DEPTS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Pilih Status</option>
                      {STATUS_OPTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => saveEdit(emp.id)}
                      className="flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 flex-1">
                      <Save className="h-4 w-4 mr-2" /> Simpan
                    </button>
                    <button onClick={cancelEdit}
                      className="flex items-center justify-center bg-gray-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600 flex-1">
                      <X className="h-4 w-4 mr-2" /> Batal
                    </button>
                  </div>
                </div>
              ) : (

                /* ── View mode ── */
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{emp.name}</div>
                    <div className="text-sm text-gray-600 truncate">
                      {DEPTS.find((d) => d.value === emp.department)?.label || emp.department}
                    </div>
                    <div className="text-sm text-gray-900 mt-1">
                      Goldar:{" "}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${bloodColor(emp.blood_type)}`}>
                        {emp.blood_type || "—"}
                      </span>
                    </div>
                    {/* Assign-user dropdown – managers only */}
                    {showActions && (
                      <div className="mt-2">
                        <label className="block text-xs text-gray-500 mb-1">Akun Login</label>
                        <div className="flex items-center gap-2 flex-wrap">
                          <select value={emp.user_id ?? ""}
                            onChange={(e) => assignUser(emp.id, e.target.value)}
                            className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">— Belum ada akun —</option>
                            {users.map((u) => (
                              <option key={u.id} value={u.id}>{u.username} ({u.role})</option>
                            ))}
                          </select>
                          {emp.username && (
                            <span className="text-xs text-green-600 font-medium">✓ {emp.username}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Action buttons */}
                  <div className="flex justify-end space-x-1 sm:space-x-2 flex-shrink-0">
                    {/* Eye – always visible */}
                    <button onClick={() => openDetail(emp)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Lihat Detail">
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    {/* Edit & Delete – managers only */}
                    {showActions && (
                      <>
                        <button onClick={() => openEdit(emp)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors" title="Edit">
                          <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                        <button onClick={() => deleteEmp(emp.id, emp.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-200">
            <span className="text-sm text-gray-500">Halaman {page} dari {totalPages}</span>
            <div className="flex items-center space-x-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let n: number;
                if (totalPages <= 5) n = i + 1;
                else if (page <= 3) n = i + 1;
                else if (page >= totalPages - 2) n = totalPages - 4 + i;
                else n = page - 2 + i;
                return (
                  <button key={n} onClick={() => setPage(n)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${page === n ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"}`}>
                    {n}
                  </button>
                );
              })}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {detail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[95vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 truncate pr-2">
                  Detail Karyawan – {detail.name}
                </h3>
                <button onClick={closeDetail} className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {/* Employee info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" /> Informasi Karyawan
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {[
                    ["Nama Lengkap", detail.name],
                    ["Divisi", DEPTS.find((d) => d.value === detail.department)?.label || detail.department],
                    ["Status", detail.status === "active" ? "Aktif" : "Tidak Aktif"],
                    ["Email", detail.email || "—"],
                    ["No Telp", detail.phone || "—"],
                    ["Golongan Darah", detail.blood_type || "—"],
                    ["Akun Login", detail.username ? `${detail.username} (${detail.user_role})` : "—"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <span className="text-gray-600 block mb-1 text-xs">{label}:</span>
                      <p className="font-medium text-gray-900 break-words">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Training history */}
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-green-600" /> Riwayat Pelatihan
              </h4>
              {loadingHist ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                  <p className="text-gray-500 text-sm mt-2">Memuat riwayat pelatihan...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Belum ada riwayat pelatihan</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {history.map((t, idx) => {
                      const s = trainingStatusLabel(t);
                      return (
                        <div key={idx} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-1">
                            <p className="font-medium text-gray-900">{t.training_title}</p>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${s.cls} whitespace-nowrap`}>{s.text}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                            {new Date(t.start_time).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                          </div>
                          {t.attendance_date && (
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              Waktu absensi: {new Date(t.attendance_date).toLocaleTimeString("id-ID")}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 mt-4 grid grid-cols-3 gap-3 text-xs">
                    {[["Hadir", histStats.attended, "text-green-600"], ["Tidak Hadir", histStats.absent, "text-red-600"], ["Upcoming", histStats.upcoming, "text-blue-600"]].map(([label, val, cls]) => (
                      <div key={label as string} className="text-center bg-white rounded-lg p-2">
                        <div className={`text-xl font-bold ${cls}`}>{val}</div>
                        <div className="text-blue-800 font-medium">{label}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
