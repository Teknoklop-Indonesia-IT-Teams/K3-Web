// SafetyReportList.tsx
import React, { useEffect, useState } from "react";
import { fetchJSON } from "../../lib/api";
import { AlertTriangle, MapPin, Clock, User, CheckCircle, X } from "lucide-react";

interface SafetyReportListProps {
  refreshTrigger: number;
  onUpdate?: () => void;
}

export const SafetyReportList: React.FC<SafetyReportListProps> = ({ refreshTrigger, onUpdate }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [saving, setSaving] = useState(false);

  const [reportPage, setReportPage] = useState(1);
  const reportsPerPage = 3;

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await fetchJSON("/safety/reports");
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

      const res = await fetch(
        `http://localhost:4000/api/safety/reports/${selectedReport.id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal update status");
      }

      await res.json();
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

  if (loading) return <div className="text-gray-500 p-6">Loading laporan K3...</div>;
  if (!items.length) return <div className="text-gray-500 p-6">Belum ada laporan insiden.</div>;

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
      <div className="space-y-3">
        {currentReports.map((r: any) => (
          <div
            key={r.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-md font-semibold text-gray-900">{r.incident_type || "Insiden"}</h4>
              <div className="flex gap-1">
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${severityColors[r.severity] || "bg-gray-100 text-gray-800"}`}>
                  {r.severity}
                </span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[r.status] || "bg-gray-100 text-gray-800"}`}>
                  {r.status}
                </span>
              </div>
            </div>

            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>Judul:</strong> {r.title || "-"}</p>
              <p><strong>Deskripsi:</strong> {r.description || "-"}</p>
              <p className="flex items-center gap-1"><MapPin className="h-4 w-4 text-gray-400" /> {r.location || "-"}</p>
              <p className="flex items-center gap-1"><Clock className="h-4 w-4 text-gray-400" /> {r.incident_date || "-"} {r.incident_time || ""}</p>
              <p className="flex items-center gap-1"><User className="h-4 w-4 text-gray-400" /> Pelapor: {r.reporter_name || "-"}</p>
            </div>

            <div className="mt-2">
              <button
                onClick={() => {
                  setSelectedReport(r);
                  setNewStatus(r.status);
                  setCompletionDate(r.completed_at?.split("T")[0] || "");
                }}
                className="text-blue-600 text-sm hover:underline flex items-center gap-1"
              >
                <CheckCircle className="h-4 w-4" /> Ubah Status
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Buttons (hapus previous/next, tampil angka halaman) */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
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
          ))}
        </div>
      )}

      {/* Modal */}
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
                  className="w-full border rounded p-2 text-sm"
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
                    className="w-full border rounded p-2 text-sm"
                  />
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-3 py-1 rounded-lg border text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SafetyReportList;
