import React, { useEffect, useState } from "react";
import { Calendar, Clock, ImageIcon, FileText, Pencil, X, Search, ExternalLink } from "lucide-react";
import { Training, TrainingListProps } from "../../types";
import { authHeaders } from "../../lib/auth";

const TrainingList: React.FC<TrainingListProps> = ({ refreshTrigger, showActions }) => {
  const [items, setItems] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [uploading, setUploading] = useState(false);

  const loadTrainings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/trainings`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data: Training[] = await res.json();
      setItems(data.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()));
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTrainings(); }, [refreshTrigger]);

  const handleUpload = async (file: File) => {
    if (!selectedTraining) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("documentation", file);
      await fetch(
        `${import.meta.env.VITE_API_BASE}/api/trainings/${selectedTraining.id}/documentation`,
        { method: "PUT", body: formData, headers: authHeaders() },
      );
      setSelectedTraining(null);
      loadTrainings();
    } catch (err) {
      alert("Gagal upload dokumentasi");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  function isImage(url: string) {
    return /\.(jpg|jpeg|png|webp|gif|heic|heif)$/i.test(url);
  }

  const filtered = items.filter(
    (t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.trainer ?? "").toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const current = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <div className="p-4 text-gray-500">⏳ Loading pelatihan...</div>;
  if (error) return <div className="p-4 text-red-500">⚠ Error: {error}</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Calendar className="h-5 w-5 mr-2 text-green-600" />
        Jadwal Pelatihan
      </h3>

      {/* Search */}
      <div className="flex items-center mb-4 border rounded-lg px-2 py-1">
        <Search className="h-4 w-4 text-gray-500 mr-2" />
        <input
          type="text" placeholder="Cari pelatihan..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="flex-1 outline-none text-sm"
        />
      </div>

      {current.length === 0 ? (
        <div className="text-gray-500 text-sm">Tidak ada data pelatihan</div>
      ) : (
        <div className="space-y-4">
          {current.map((t) => {
            const docUrl = t.documentation_url
              ? `${import.meta.env.VITE_API_BASE}${t.documentation_url}`
              : null;

            return (
              <div key={t.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                <div className="font-medium text-gray-900 mb-1">{t.title}</div>
                <div className="text-sm text-gray-600 mb-2">{t.trainer}</div>
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>
                    {t.start_time
                      ? new Date(t.start_time).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
                      : "-"}
                  </span>
                  <Clock className="h-4 w-4 ml-4 mr-1" />
                  <span>{t.duration_hours} jam</span>
                </div>

                {/* ── Dokumentasi section ── */}
                <div className="mt-2 space-y-2">
                  {!docUrl ? (
                    <div className="flex items-center space-x-2 text-gray-400 text-sm">
                      <ImageIcon className="h-4 w-4" />
                      <span>Belum ada dokumentasi</span>
                    </div>
                  ) : isImage(docUrl) ? (
                    <div>
                      <img src={docUrl} alt="Dokumentasi" className="rounded-lg border max-h-48 object-cover w-full" />
                      <a href={docUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-1 text-blue-600 hover:underline text-xs">
                        <ExternalLink className="h-3 w-3" /> Buka di tab baru
                      </a>
                    </div>
                  ) : (
                    
                    <a href={docUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors text-sm font-medium">
                      <FileText className="h-4 w-4" />
                      📄 Lihat Dokumen
                    </a>
                  )}

                  {showActions && (
                    <button onClick={() => setSelectedTraining(t)}
                      className="flex items-center text-green-600 hover:underline text-sm mt-1">
                      <Pencil className="h-4 w-4 mr-1" />
                      {docUrl ? "Ganti Dokumentasi" : "Tambah Dokumentasi"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setCurrentPage(p)}
              className={`px-3 py-1 rounded-lg border text-sm ${currentPage === p ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}`}>
              {p}
            </button>
          ))}
        </div>
      )}

      {selectedTraining && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96 relative">
            <button onClick={() => setSelectedTraining(null)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
            <h4 className="text-lg font-semibold mb-4">Upload Dokumentasi – {selectedTraining.title}</h4>
            <input
              type="file"
              accept="image/*,.heic,.heif,application/pdf,.doc,.docx"
              onChange={(e) => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); }}
              className="w-full border rounded p-2 text-sm"
            />
            {uploading && <div className="text-sm text-gray-500 mt-2">⏳ Uploading...</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingList;
