import React, { useEffect, useState, useMemo } from "react";
import {
  Heart,
  Activity,
  Droplet,
  Beaker,
  HeartPulse,
  Search,
  Calendar,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface HealthCheck {
  id: string;
  employee_name: string;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  spo2?: number;
  blood_sugar?: number;
  cholesterol?: number;
  measured_at: string;
  notes?: string;
  signature_data?: string;
}

interface HealthHistoryProps {
  refreshTrigger: number;
}

const ITEMS_PER_PAGE = 3;
const ROWS_PER_PAGE = 9;

export const HealthHistory: React.FC<HealthHistoryProps> = ({
  refreshTrigger,
}) => {
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const fetchChecks = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/health/checks`
      );
      const data = await res.json();
      setChecks(data);
    } catch (err) {
      console.error("❌ Fetch health checks error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecks();
  }, [refreshTrigger]);

  // Generate pilihan tanggal, bulan, tahun
  const dateOptions = useMemo(() => {
    const dates = new Set<string>();
    checks.forEach((check) => {
      const date = new Date(check.measured_at);
      const dateStr = date.toISOString().split("T")[0];
      dates.add(dateStr);
    });

    return Array.from(dates).sort().reverse(); // Urutkan dari terbaru
  }, [checks]);

  const filteredChecks = useMemo(() => {
    return checks.filter((h) => {
      const nama = h.employee_name.toLowerCase();
      const tanggal = new Date(h.measured_at).toLocaleDateString("id-ID");
      const keyword = search.toLowerCase();
      return nama.includes(keyword) || tanggal.includes(keyword);
    });
  }, [checks, search]);

  const totalPages = Math.ceil(filteredChecks.length / ITEMS_PER_PAGE);
  const paginatedChecks = filteredChecks.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages]);

  const loadImageAsDataURL = (src: string): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = src;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("No canvas context");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = (e) => reject(e);
    });

  const handlePrint = async () => {
    if (!selectedDate) {
      alert("Pilih tanggal terlebih dahulu!");
      return;
    }

    const selectedDateObj = new Date(selectedDate);
    const selectedDateLocale = selectedDateObj.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    // Filter data berdasarkan tanggal yang dipilih
    const selectedDateData = checks.filter((row) =>
      row.measured_at.startsWith(selectedDate)
    );

    if (selectedDateData.length === 0) {
      alert(`Tidak ada data untuk tanggal ${selectedDateLocale}!`);
      return;
    }

    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const bottomMargin = 20;

      let imgData: string | null = null;
      try {
        imgData = await loadImageAsDataURL(
          `${import.meta.env.VITE_API_BASE}/template.png`
        );
      } catch {
        console.warn(
          "Template image gagal di-load, PDF tetap dibuat tanpa background."
        );
      }

      for (let i = 0; i < selectedDateData.length; i += ROWS_PER_PAGE) {
        if (i > 0) doc.addPage();
        if (imgData) doc.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);

        if (i === 0) {
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.text("DAFTAR HADIR", pageWidth / 2, 60, { align: "center" });
          doc.text("SOSIALISASI K3", pageWidth / 2, 68, { align: "center" });

          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text(`Malang, ${selectedDateLocale}`, pageWidth - 20, 80, {
            align: "right",
          });
        }

        const chunk = selectedDateData.slice(i, i + ROWS_PER_PAGE);

        autoTable(doc, {
          startY: i === 0 ? 82 : 50,
          head: [
            [
              "No",
              "Nama",
              "Tensi",
              "Detak Jantung",
              "Gula Darah",
              "Kolesterol",
              "TTD",
            ],
          ],
          body: chunk.map((row, idx) => {
            const nomor = i + idx + 1;

            return [
              nomor,
              row.employee_name,
              row.blood_pressure_systolic && row.blood_pressure_diastolic
                ? `${row.blood_pressure_systolic}/${row.blood_pressure_diastolic}`
                : "—",
              row.heart_rate ?? "—",
              row.blood_sugar ?? "—",
              row.cholesterol ?? "—",
              "", // Kolom TTD tetap kosong, akan diisi di didDrawCell
            ];
          }),
          theme: "grid",
          styles: {
            fontSize: 9,
            minCellHeight: 16,
            textColor: [0, 0, 0],
            lineColor: [0, 0, 0],
            lineWidth: 0.2,
            valign: "middle",
          },
          columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 45 },
            2: { cellWidth: 25 },
            3: { cellWidth: 25 },
            4: { cellWidth: 25 },
            5: { cellWidth: 25 },
            6: { cellWidth: 35 },
          },
          headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] },
          margin: { left: 10, right: 10 },
          didDrawCell: function (data) {
            if (data.section === "body" && data.column.index === 6) {
              const rowIndex = data.row.index;
              const rowData = chunk[rowIndex];

              if (rowData?.signature_data) {
                try {
                  const imgWidth = 25;
                  const imgHeight = 10;
                  const x = data.cell.x + (data.cell.width - imgWidth) / 2;
                  const y = data.cell.y + (data.cell.height - imgHeight) / 2;

                  doc.addImage(
                    rowData.signature_data,
                    "PNG",
                    x,
                    y,
                    imgWidth,
                    imgHeight
                  );
                } catch (err) {
                  console.warn("Gagal menambahkan tanda tangan:", err);
                  doc.setFontSize(8);
                  doc.text(
                    "✓",
                    data.cell.x + data.cell.width / 2,
                    data.cell.y + data.cell.height / 2,
                    { align: "center", baseline: "middle" }
                  );
                }
              }
            }
          },
        });

        const isLastPage = i + ROWS_PER_PAGE >= selectedDateData.length;
        if (isLastPage) {
          let finalY = (doc as any).lastAutoTable.finalY || 80;

          if (finalY + 70 > pageHeight - bottomMargin) {
            doc.addPage();
            if (imgData)
              doc.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
            finalY = 40;
          }

          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text(
            `Malang, ${selectedDateLocale}`,
            pageWidth - 20,
            finalY + 20,
            {
              align: "right",
            }
          );

          doc.setFont("helvetica", "bold");
          doc.text("ACHMAD ROFIUDDIN H.F.", pageWidth - 20, finalY + 50, {
            align: "right",
          });
          doc.setFont("helvetica", "normal");
          doc.text("SAFETY MAN", pageWidth - 30, finalY + 56, {
            align: "right",
          });
          doc.text("PT TEKNO KLOP INDONESIA", pageWidth - 20, finalY + 62, {
            align: "right",
          });
        }
      }

      const pdfBlob = doc.output("blob");
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, "_blank");
    } catch (err) {
      console.error("❌ Gagal generate PDF", err);
      alert("Gagal generate PDF. Cek console untuk detail.");
    }
  };

  if (loading)
    return <p className="text-gray-500">Loading data kesehatan...</p>;
  if (checks.length === 0)
    return <p className="text-gray-500">Belum ada data kesehatan</p>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Heart className="h-5 w-5 mr-2 text-red-600" /> Riwayat Pemeriksaan
        </h3>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Date Picker */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih Tanggal</option>
              {dateOptions.map((date) => {
                const dateObj = new Date(date);
                const dateLabel = dateObj.toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });
                return (
                  <option key={date} value={date}>
                    {dateLabel}
                  </option>
                );
              })}
            </select>
          </div>

          <button
            onClick={handlePrint}
            disabled={!selectedDate}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg shadow hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Print PDF
          </button>
        </div>
      </div>

      <div className="flex items-center mb-4 border rounded-lg px-3 py-2">
        <Search className="h-4 w-4 text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Cari nama atau tanggal (dd/mm/yyyy)"
          className="w-full outline-none text-sm"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {paginatedChecks.map((h) => (
          <div
            key={h.id}
            className="p-4 border rounded-lg hover:bg-gray-50 transition"
          >
            <div className="flex items-center justify-between">
              <div className="font-medium text-gray-900">{h.employee_name}</div>
              <div className="text-sm text-gray-500">
                {new Date(h.measured_at).toLocaleString("id-ID")}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3 text-sm">
              <div className="flex items-center text-gray-700">
                <Activity className="h-4 w-4 mr-1 text-gray-400" />
                <span>{h.heart_rate ? `${h.heart_rate} bpm` : "—"}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <HeartPulse className="h-4 w-4 mr-1 text-gray-400" />
                <span>
                  {h.blood_pressure_systolic && h.blood_pressure_diastolic
                    ? `${h.blood_pressure_systolic}/${h.blood_pressure_diastolic} mmHg`
                    : "—"}
                </span>
              </div>
              <div className="flex items-center text-gray-700">
                <Droplet className="h-4 w-4 mr-1 text-gray-400" />
                <span>{h.blood_sugar ? `${h.blood_sugar} mg/dL` : "—"}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Beaker className="h-4 w-4 mr-1 text-gray-400" />
                <span>{h.cholesterol ? `${h.cholesterol} mg/dL` : "—"}</span>
              </div>
            </div>
            {h.notes && (
              <p className="text-gray-500 text-sm mt-2 italic">
                Catatan: {h.notes}
              </p>
            )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 space-x-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => setPage(pageNumber)}
                className={`px-3 py-1 rounded-lg border text-sm ${
                  page === pageNumber
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-blue-100"
                }`}
              >
                {pageNumber}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default HealthHistory;
