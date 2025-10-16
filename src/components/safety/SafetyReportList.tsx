import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  MapPin,
  Clock,
  User,
  Users,
  CheckCircle,
  X,
  FileText,
  Trash2,
} from "lucide-react";
import { fetchJSON } from "../../lib/api";

interface SafetyReportListProps {
  refreshTrigger: number;
  onUpdate?: () => void;
}

export const SafetyReportList: React.FC<SafetyReportListProps> = ({
  refreshTrigger,
  onUpdate,
}) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [saving, setSaving] = useState(false);

  const [reportToDelete, setReportToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [reportPage, setReportPage] = useState(1);
  const reportsPerPage = 3;

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await fetchJSON("/api/safety/reports");
      setItems(data);
      setReportPage(1);
    } catch (err) {
      console.error("❌ Error fetch safety reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [refreshTrigger]);

  const handleSave = async () => {
    if (!selectedReport) return;
    setSaving(true);

    try {
      const body: any = { status: newStatus };
      if (newStatus === "selesai") {
        if (!completionDate) {
          alert("Tanggal selesai wajib diisi!");
          setSaving(false);
          return;
        }
        body.completed_at = completionDate;
      }

      // 🔥 PERBAIKAN: Gunakan fetchJSON untuk konsistensi
      await fetchJSON(`/api/safety/reports/${selectedReport.id}/status`, {
        method: "PUT",
        body: JSON.stringify(body),
      });

      setSelectedReport(null);
      setNewStatus("");
      setCompletionDate("");
      loadReports();
      if (onUpdate) onUpdate();
    } catch (err: any) {
      console.error("❌ Gagal update status:", err);
      alert(`Update status gagal: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!reportToDelete) return;
    setDeleting(true);

    try {
      // 🔥 PERBAIKAN: Gunakan fetchJSON untuk konsistensi
      await fetchJSON(`/api/safety/reports/${reportToDelete.id}`, {
        method: "DELETE",
      });

      // Hapus dari state lokal
      setItems(items.filter((item) => item.id !== reportToDelete.id));
      setReportToDelete(null);

      // Reset pagination jika perlu
      if (currentReports.length === 1 && reportPage > 1) {
        setReportPage(reportPage - 1);
      }

      if (onUpdate) onUpdate();

      console.log("✅ Laporan berhasil dihapus");
    } catch (err: any) {
      console.error("❌ Gagal menghapus laporan:", err);
      alert(`Gagal menghapus laporan: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = (report: any) => {
    setReportToDelete(report);
  };

  if (loading)
    return <div className="text-gray-500 p-6">Loading laporan K3...</div>;
  if (!items.length)
    return <div className="text-gray-500 p-6">Belum ada laporan insiden.</div>;

  const severityColors: Record<string, string> = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800",
  };

  const statusColors: Record<string, string> = {
    selesai: "bg-green-100 text-green-800",
    investigasi: "bg-blue-100 text-blue-800",
    pending: "bg-yellow-100 text-yellow-800",
  };

  const severityLabels: Record<string, string> = {
    low: "Rendah",
    medium: "Sedang",
    high: "Tinggi",
    critical: "Kritis",
  };

  const statusLabels: Record<string, string> = {
    selesai: "Selesai",
    investigasi: "Investigasi",
    pending: "Pending",
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const totalPages = Math.ceil(items.length / reportsPerPage);
  const startIdx = (reportPage - 1) * reportsPerPage;
  const currentReports = items.slice(startIdx, startIdx + reportsPerPage);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Card Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
        Laporan K3
      </h3>

      {/* List of Reports */}
      <div className="space-y-4">
        {currentReports.map((r: any) => (
          <div
            key={r.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h4 className="text-md font-semibold text-gray-900 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-blue-600" />
                  {r.title || "Laporan Insiden"}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      severityColors[r.severity] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {severityLabels[r.severity] || r.severity}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      statusColors[r.status] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {statusLabels[r.status] || r.status}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                    {r.incident_type}
                  </span>
                </div>
              </div>
              <button
                onClick={() => confirmDelete(r)}
                className="text-red-600 hover:text-red-800 p-1 rounded-lg hover:bg-red-50 transition-colors"
                title="Hapus laporan"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="text-sm text-gray-700 space-y-2">
              <p>
                <strong>Deskripsi:</strong> {r.description || "-"}
              </p>

              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span>
                  <strong>Lokasi:</strong> {r.location || "-"}
                </span>
              </p>

              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span>
                  <strong>Tanggal:</strong> {formatDate(r.incident_date)}{" "}
                  {r.incident_time || ""}
                </span>
              </p>

              <p className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span>
                  <strong>Pelapor:</strong> {r.reporter_name || "-"}
                </span>
              </p>

              {r.witnesses && (
                <p className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span>
                    <strong>Saksi:</strong> {r.witnesses}
                  </span>
                </p>
              )}

              {r.immediate_action && (
                <div>
                  <p className="font-medium text-gray-700">Tindakan Segera:</p>
                  <p className="text-gray-600 bg-gray-50 p-2 rounded-lg mt-1">
                    {r.immediate_action}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setSelectedReport(r);
                  setNewStatus(r.status);
                  setCompletionDate(r.completed_at?.split("T")[0] || "");
                }}
                className="text-blue-600 text-sm hover:underline flex items-center gap-1 font-medium"
              >
                <CheckCircle className="h-4 w-4" /> Ubah Status
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <button
                key={pageNum}
                onClick={() => setReportPage(pageNum)}
                className={`px-3 py-1 rounded-lg border text-sm ${
                  reportPage === pageNum
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                {pageNum}
              </button>
            )
          )}
        </div>
      )}

      {/* Modal Ubah Status */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-96 p-6 relative">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
            <h4 className="text-lg font-semibold mb-4">
              Ubah Status - {selectedReport.title}
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="investigasi">Investigasi</option>
                  <option value="selesai">Selesai</option>
                </select>
              </div>

              {newStatus === "selesai" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    value={completionDate}
                    onChange={(e) => setCompletionDate(e.target.value)}
                    className="w-full border rounded-lg p-2 text-sm"
                  />
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {reportToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-96 p-6 relative">
            <button
              onClick={() => setReportToDelete(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>

              <h4 className="text-lg font-semibold mb-2">Hapus Laporan?</h4>

              <p className="text-gray-600 mb-4">
                Apakah Anda yakin ingin menghapus laporan{" "}
                <strong>"{reportToDelete.title}"</strong>? Tindakan ini tidak
                dapat dibatalkan.
              </p>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Data yang dihapus tidak dapat dikembalikan
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setReportToDelete(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteReport}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Hapus
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SafetyReportList;
