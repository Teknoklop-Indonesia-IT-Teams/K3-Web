import React, { useEffect, useState } from "react";
import { Calendar, Clock, ImageIcon, Pencil, X, Search } from "lucide-react";

interface Training {
  id: string;
  title: string;
  trainer: string;
  start_time: string;
  duration_hours: number;
  documentation_url?: string;
}

interface TrainingListProps {
  refreshTrigger: number;
}

const TrainingList: React.FC<TrainingListProps> = ({ refreshTrigger }) => {
  const [items, setItems] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  // search
  const [searchTerm, setSearchTerm] = useState("");

  // state modal upload
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(
    null
  );
  const [uploading, setUploading] = useState(false);

  const loadTrainings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:4000/api/trainings");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data: Training[] = await res.json();
      // urutkan terbaru berdasarkan start_time
      const sorted = data.sort(
        (a, b) =>
          new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
      );
      setItems(sorted);
    } catch (err: any) {
      console.error("Fetch trainings error:", err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrainings();
  }, [refreshTrigger]);

  const handleUpload = async (file: File) => {
    if (!selectedTraining) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("documentation", file);

      await fetch(
        `http://localhost:4000/api/trainings/${selectedTraining.id}/documentation`,
        {
          method: "PUT",
          body: formData,
        }
      );

      setSelectedTraining(null); // tutup modal
      loadTrainings(); // refresh list
    } catch (err) {
      alert("❌ Gagal upload dokumentasi");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // filter data berdasarkan search
  const filteredItems = items.filter(
    (t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.trainer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // pagination slice
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  if (loading) return <div>⏳ Loading trainings...</div>;
  if (error) return <div className="text-red-500">⚠ Error: {error}</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Calendar className="h-5 w-5 mr-2 text-green-600" />
        Jadwal Pelatihan
      </h3>

      {/* Search box */}
      <div className="flex items-center mb-4 border rounded-lg px-2 py-1">
        <Search className="h-4 w-4 text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Cari pelatihan..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // reset ke page pertama
          }}
          className="flex-1 outline-none text-sm"
        />
      </div>

      {currentItems.length === 0 ? (
        <div className="text-gray-500">Tidak ada data trainings</div>
      ) : (
        <div className="space-y-4">
          {currentItems.map((t) => (
            <div
              key={t.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div className="font-medium text-gray-900 mb-2">{t.title}</div>
              <div className="text-sm text-gray-600 mb-2">{t.trainer}</div>
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Calendar className="h-4 w-4 mr-1" />
                <span>
                  {t.start_time
                    ? new Date(t.start_time).toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </span>
                <Clock className="h-4 w-4 ml-4 mr-1" />
                <span>{t.duration_hours} jam</span>
              </div>

              {/* Dokumentasi */}
              <div className="mt-3">
                {t.documentation_url ? (
                  <img
                    src={`http://localhost:4000${t.documentation_url}`}
                    alt="Dokumentasi Pelatihan"
                    className="rounded-lg border max-h-48 object-cover"
                  />
                ) : (
                  <div className="flex items-center space-x-2 text-gray-500">
                    <ImageIcon className="h-5 w-5" />
                    <span>Belum ada dokumentasi</span>
                  </div>
                )}
              </div>

              {/* Tombol edit dokumentasi */}
              <div className="mt-2">
                <button
                  onClick={() => setSelectedTraining(t)}
                  className="flex items-center text-green-600 hover:underline text-sm"
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  {t.documentation_url
                    ? "Ganti Dokumentasi"
                    : "Tambah Dokumentasi"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded-lg border text-sm ${
                currentPage === page
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* Modal Upload */}
      {selectedTraining && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96 relative">
            <button
              onClick={() => setSelectedTraining(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
            <h4 className="text-lg font-semibold mb-4">
              Upload Dokumentasi - {selectedTraining.title}
            </h4>

            <input
              type="file"
              accept="image/*,.heic,.heif"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleUpload(e.target.files[0]);
                }
              }}
              className="w-full border rounded p-2"
            />

            {uploading && (
              <div className="text-sm text-gray-500 mt-2">
                ⏳ Uploading...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingList;
