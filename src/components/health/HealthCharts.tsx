import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { HealthChartsProps, HealthCheck } from "../../types";

export const HealthCharts: React.FC<HealthChartsProps> = ({
  refreshTrigger,
}) => {
  const [rawData, setRawData] = useState<HealthCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [metric, setMetric] = useState("all");
  const [mode, setMode] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchChecks = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE}/api/health/checks`,
        );
        const json = await res.json();
        setRawData(json);
      } catch (err) {
        console.error("❌ Fetch health checks error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChecks();
  }, [refreshTrigger]);

  const filtered = rawData.filter((row) => {
    const matchName = row.employee_name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const rowDate = new Date(row.measured_at);

    const matchStart = startDate ? rowDate >= new Date(startDate) : true;

    const matchEnd = endDate
      ? rowDate <= new Date(endDate + "T23:59:59")
      : true;

    return matchName && matchStart && matchEnd;
  });

  const normalized = filtered.map((row) => ({
    date: new Date(row.measured_at).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
    systolic: row.blood_pressure_systolic ?? null,
    diastolic: row.blood_pressure_diastolic ?? null,
    temperature: row.temperature ?? null,
    heart_rate: row.heart_rate ?? null,
    sugar: row.blood_sugar ?? null,
    cholesterol: row.cholesterol ?? null,
    urid_acid: row.urid_acid ?? null,
    weight: row.weight ?? null,
    name: row.employee_name,
    raw: row,
  }));

  const getSummary = () => {
    const grouped: Record<string, typeof normalized> = {};
    normalized.forEach((row) => {
      const day = new Date(row.raw.measured_at).toLocaleDateString("id-ID");
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(row);
    });

    const summary: any[] = [];
    Object.keys(grouped).forEach((day) => {
      const rows = grouped[day];

      const metrics = [
        {
          key: "systolic",
          label: "Sistolik",
          allow: metric === "all" || metric === "bp",
        },
        {
          key: "diastolic",
          label: "Diastolik",
          allow: metric === "all" || metric === "bp",
        },
        {
          key: "temperature",
          label: "Suhu",
          allow: metric === "all" || metric === "temperature",
        },
        {
          key: "heart_rate",
          label: "Detak Jantung",
          allow: metric === "all" || metric === "heart_rate",
        },
        {
          key: "sugar",
          label: "Gula",
          allow: metric === "all" || metric === "sugar",
        },
        {
          key: "cholesterol",
          label: "Kolesterol",
          allow: metric === "all" || metric === "cholesterol",
        },
        {
          key: "urid_acid",
          label: "Asam Urat",
          allow: metric === "all" || metric === "urid_acid",
        },
        {
          key: "weight",
          label: "Berat Badan",
          allow: metric === "all" || metric === "weight",
        },
      ];

      metrics.forEach(({ key, label, allow }) => {
        if (!allow) return;

        const values = rows
          .map((r) => {
            const raw = r[key as keyof (typeof rows)[0]];
            return raw !== null && raw !== undefined ? Number(raw) : null;
          })
          .filter((v) => v !== null) as number[];

        if (values.length === 0) return;

        let targetValue: number;
        if (mode === "highest") {
          targetValue = Math.max(...values);
        } else if (mode === "lowest") {
          targetValue = Math.min(...values);
        } else {
          return;
        }

        rows
          .filter((r) => {
            const raw = r[key as keyof typeof r];
            return raw !== null && Number(raw) === targetValue;
          })
          .forEach((r) => {
            summary.push({
              date: r.date,
              name: r.name,
              jenis: label,
              nilai: targetValue,
            });
          });
      });
    });

    return summary;
  };

  const summaryData = getSummary();

  const totalPages = Math.ceil(summaryData.length / pageSize);
  const paginatedData = summaryData.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  if (loading) return <p className="text-gray-500">Loading grafik...</p>;
  if (rawData.length === 0)
    return <p className="text-gray-500">Belum ada data grafik</p>;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow">
          <p className="text-sm text-gray-500">{label}</p>
          {payload.map((p: any, i: number) => (
            <p
              key={i}
              className="text-gray-800 font-semibold"
              style={{ color: p.color }}
            >
              {p.name}: {p.value} ({p.payload.name})
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
        <h3 className="text-lg font-semibold text-gray-900">
          Grafik Kesehatan
        </h3>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Cari nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1 border rounded-lg text-sm"
          />

          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1 border rounded-lg text-sm"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1 border rounded-lg text-sm"
          />

          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            className="px-3 py-1 border rounded-lg text-sm"
          >
            <option value="all">Semua</option>
            <option value="bp">Sistolik/Diastolik</option>
            <option value="temperature">Suhu</option>
            <option value="heart_rate">Detak Jantung</option>
            <option value="sugar">Gula</option>
            <option value="cholesterol">Kolesterol</option>
            <option value="urid_acid">Asam Urat</option>
            <option value="weight">Berat Badan</option>
          </select>

          <select
            value={mode}
            onChange={(e) => {
              setMode(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1 border rounded-lg text-sm"
          >
            <option value="all">Semua</option>
            <option value="highest">Tertinggi</option>
            <option value="lowest">Terendah</option>
          </select>

          <button
            onClick={() => {
              setSearch("");
              setStartDate("");
              setEndDate("");
              setMetric("all");
              setMode("all");
              setPage(1);
            }}
            className="px-3 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 text-sm font-medium"
          >
            Clear Filter
          </button>
        </div>
      </div>

      {mode === "all" ? (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={normalized}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
            <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
            <Tooltip content={<CustomTooltip />} />

            {(metric === "all" || metric === "bp") && (
              <>
                <Line
                  type="monotone"
                  dataKey="systolic"
                  stroke="#dc2626"
                  strokeWidth={3}
                  dot={{ fill: "#dc2626", r: 5 }}
                  name="Sistolik"
                ></Line>
                <Line
                  type="monotone"
                  dataKey="diastolic"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ fill: "#2563eb", r: 5 }}
                  name="Diastolik"
                ></Line>
              </>
            )}

            {(metric === "all" || metric === "sugar") && (
              <Line
                type="monotone"
                dataKey="sugar"
                stroke="#16a34a"
                strokeWidth={3}
                dot={{ fill: "#16a34a", r: 5 }}
                name="Gula"
              ></Line>
            )}

            {(metric === "all" || metric === "cholesterol") && (
              <Line
                type="monotone"
                dataKey="cholesterol"
                stroke="#9333ea"
                strokeWidth={3}
                dot={{ fill: "#9333ea", r: 5 }}
                name="Kolesterol"
              ></Line>
            )}

            {(metric === "all" || metric === "urid_acid") && (
              <Line
                type="monotone"
                dataKey="urid_acid"
                stroke="#f97316"
                strokeWidth={3}
                dot={{ fill: "#f97316", r: 5 }}
                name="Asam Urat"
              ></Line>
            )}
            {(metric === "all" || metric === "temperature") && (
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#facc15"
                strokeWidth={3}
                dot={{ fill: "#facc15", r: 5 }}
                name="Suhu"
              ></Line>
            )}
            {(metric === "all" || metric === "heart_rate") && (
              <Line
                type="monotone"
                dataKey="heart_rate"
                stroke="#f43f5e"
                strokeWidth={3}
                dot={{ fill: "#f43f5e", r: 5 }}
                name="Detak Jantung"
              ></Line>
            )}
            {(metric === "all" || metric === "weight") && (
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#0ea5e9"
                strokeWidth={3}
                dot={{ fill: "#0ea5e9", r: 5 }}
                name="Berat Badan"
              ></Line>
            )}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Tanggal</th>
                <th className="px-4 py-2 border">Nama</th>
                <th className="px-4 py-2 border">Jenis</th>
                <th className="px-4 py-2 border">Nilai</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{row.date}</td>
                  <td className="px-4 py-2 border">{row.name}</td>
                  <td className="px-4 py-2 border">{row.jenis}</td>
                  <td className="px-4 py-2 border font-semibold">
                    {row.nilai}
                  </td>
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-gray-500 py-4">
                    Tidak ada data
                  </td>
                </tr>
              )}
            </tbody>
          </table>

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
                ),
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HealthCharts;
