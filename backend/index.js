// server.js (FINAL REVISI DENGAN PERBAIKAN)
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ====== DATABASE CONNECTION (Single DB) ======
const makePool = () =>
  new Pool({
    host: process.env.PG_HOST || "localhost",
    port: Number(process.env.PG_PORT || 5432),
    user: process.env.PG_USER || "postgres",
    password:
      process.env.PG_PASSWORD ||
      (process.env.NODE_ENV === "production" ? undefined : "12345678"),
    database: process.env.DB_K3 || "k3",
    max: 10,
  });

const pool = makePool();

const pools = {
  attendance: pool,
  employees: pool,
  training: pool,
  health: pool,
  safety: pool,
  dashboard: pool,
};

// ====== UPLOAD (multer) CONFIG ======
const uploadDir = path.join(__dirname, "uploads", "trainings");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `doc-${uniqueSuffix}${path.extname(file.originalname).toLowerCase()}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
  ];
  if (allowed.includes((file.mimetype || "").toLowerCase())) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Format file tidak didukung. Gunakan JPG, PNG, WEBP, HEIC/HEIF."
      )
    );
  }
};

const upload = multer({ storage, fileFilter });

// Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==========================================================
// ======================== AUTH ============================
// ==========================================================

// POST: Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username dan password wajib diisi" });
    }

    // 🔍 Cek user di database
    const result = await pool.query(
      "SELECT username, password, role, name FROM users WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Username atau password salah" });
    }

    const user = result.rows[0];

    // 🔑 Cek password (untuk sekarang plain text)
    if (user.password !== password) {
      return res.status(401).json({ error: "Username atau password salah" });
    }

    // 🔐 Generate token simple
    const token = Buffer.from(`${username}:${Date.now()}`).toString("base64");

    res.json({
      success: true,
      user: {
        username: user.username,
        role: user.role,
        name: user.name,
      },
      token,
    });
  } catch (err) {
    console.error("POST /api/auth/login error:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST: Logout
app.post("/api/auth/logout", async (req, res) => {
  try {
    res.json({ success: true, message: "Logout berhasil" });
  } catch (err) {
    console.error("POST /api/auth/logout error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET: Check auth status
app.get("/api/auth/check", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ authenticated: false });
    }

    try {
      const decoded = Buffer.from(token, "base64").toString("ascii");
      const [username, timestamp] = decoded.split(":");

      const tokenAge = Date.now() - parseInt(timestamp);
      if (tokenAge > 24 * 60 * 60 * 1000) {
        return res.status(401).json({ authenticated: false });
      }

      const validUsers = ["admin", "safety", "hrd"];
      if (validUsers.includes(username)) {
        return res.json({
          authenticated: true,
          user: {
            username,
            role:
              username === "admin"
                ? "admin"
                : username === "safety"
                ? "safety_officer"
                : "hrd",
            name:
              username === "admin"
                ? "Administrator"
                : username === "safety"
                ? "Safety Officer"
                : "HRD Officer",
          },
        });
      }
    } catch (decodeErr) {
      console.error("Token decode error:", decodeErr);
    }

    res.status(401).json({ authenticated: false });
  } catch (err) {
    console.error("GET /api/auth/check error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================================
// ====================== ATTENDANCE ========================
// ==========================================================

// GET: list pelatihan + jumlah peserta unik
app.get("/api/attendance/list", async (req, res) => {
  try {
    const { rows } = await pools.training.query(`
      SELECT 
        t.id, 
        t.title, 
        COUNT(DISTINCT a.participant_name)::int AS total_participants
      FROM trainings t
      LEFT JOIN training_attendance a ON a.training_id = t.id
      GROUP BY t.id, t.title, t.start_time
      ORDER BY t.start_time DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("GET /attendance/list error:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST: submit attendance
app.post("/api/training-attendance", async (req, res) => {
  try {
    const { training_id, participant_name, notes, signature } = req.body;
    if (!training_id || !participant_name || !signature) {
      return res.status(400).json({
        error: "training_id, participant_name, and signature are required",
      });
    }

    const q = `
      INSERT INTO training_attendance (training_id, participant_name, notes, signature_data)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [training_id, participant_name, notes || null, signature];
    const { rows } = await pools.training.query(q, values);

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("❌ Insert attendance error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET: absensi terbaru (50 terakhir)
app.get("/api/attendance/recent", async (req, res) => {
  try {
    const { rows } = await pools.training.query(`
      SELECT id, training_id, participant_name, timestamp, notes, signature_data
      FROM training_attendance
      ORDER BY timestamp DESC
      LIMIT 50
    `);
    res.json(rows);
  } catch (err) {
    console.error("GET /attendance/recent error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET: semua absensi
app.get("/api/attendance", async (req, res) => {
  try {
    const { rows } = await pools.training.query(`
      SELECT id, training_id, participant_name, timestamp, notes, signature_data
      FROM training_attendance
      ORDER BY timestamp ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error("GET /api/attendance error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET: statistik absensi
app.get("/api/attendance/stats", async (req, res) => {
  try {
    const today = new Date();
    const todayDate = today.toISOString().split("T")[0];

    const hadirQuery = `
      SELECT COUNT(DISTINCT participant_name) AS hadir_hari_ini
      FROM training_attendance
      WHERE DATE(timestamp) = $1
    `;
    const rataJamQuery = `
      SELECT AVG(EXTRACT(HOUR FROM timestamp) + EXTRACT(MINUTE FROM timestamp)/60.0) AS rata_jam_masuk
      FROM training_attendance
      WHERE DATE(timestamp) = $1
    `;

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const mingguQuery = `
      SELECT COUNT(DISTINCT DATE(timestamp)) AS hari_hadir
      FROM training_attendance
      WHERE DATE(timestamp) BETWEEN $1 AND $2
    `;

    const bulanAwal = new Date(today.getFullYear(), today.getMonth(), 1);
    const bulanAkhir = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const bulanQuery = `
      SELECT COUNT(DISTINCT DATE(timestamp)) AS hari_kerja
      FROM training_attendance
      WHERE DATE(timestamp) BETWEEN $1 AND $2
    `;

    const hadir = await pools.training.query(hadirQuery, [todayDate]);
    const rata = await pools.training.query(rataJamQuery, [todayDate]);
    const minggu = await pools.training.query(mingguQuery, [
      weekStart,
      weekEnd,
    ]);
    const bulan = await pools.training.query(bulanQuery, [
      bulanAwal,
      bulanAkhir,
    ]);

    res.json({
      hadir_hari_ini: parseInt(hadir.rows[0].hadir_hari_ini) || 0,
      rata_jam_masuk: parseFloat(rata.rows[0].rata_jam_masuk) || 0,
      kehadiran_minggu_ini:
        ((parseInt(minggu.rows[0].hari_hadir) || 0) / 5) * 100 || 0,
      hari_kerja_bulan_ini: parseInt(bulan.rows[0].hari_kerja) || 0,
    });
  } catch (err) {
    console.error("GET /attendance/stats error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET: peserta per pelatihan
app.get("/api/attendance/:trainingId/participants", async (req, res) => {
  try {
    const { trainingId } = req.params;
    const { rows } = await pools.training.query(
      `
      SELECT participant_name, timestamp, notes
      FROM training_attendance
      WHERE training_id = $1
      ORDER BY timestamp ASC
    `,
      [trainingId]
    );
    res.json(rows);
  } catch (err) {
    console.error("GET /attendance/:trainingId/participants error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================================
// ======================== HEALTH ==========================
// ==========================================================
app.get("/api/health/checks", async (req, res) => {
  try {
    const { rows } = await pools.health.query(`
      SELECT 
        id, 
        employee_name, 
        heart_rate, 
        blood_pressure_systolic, 
        blood_pressure_diastolic, 
        temperature, 
        spo2, 
        weight, 
        blood_sugar, 
        cholesterol, 
        measured_at, 
        notes, 
        signature_data
      FROM health_checks
      ORDER BY measured_at DESC
      LIMIT 100
    `);
    res.json(rows);
  } catch (err) {
    console.error("GET /api/health/checks error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/health/checks", async (req, res) => {
  try {
    const {
      employee_name,
      systolic_pressure,
      diastolic_pressure,
      heart_rate,
      temperature,
      weight,
      blood_sugar,
      cholesterol,
      notes,
      signature,
    } = req.body;

    if (!employee_name) {
      return res.status(400).json({ error: "employee_name wajib diisi" });
    }

    const q = `
      INSERT INTO health_checks 
        (employee_name, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, temperature, weight, blood_sugar, cholesterol, notes, signature_data)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const values = [
      employee_name,
      systolic_pressure || null,
      diastolic_pressure || null,
      heart_rate || null,
      temperature || null,
      weight || null,
      blood_sugar || null,
      cholesterol || null,
      notes || null,
      signature || null,
    ];

    const { rows } = await pools.health.query(q, values);

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("POST /api/health/checks error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/health/stats", async (req, res) => {
  try {
    const q = `
      SELECT 
        ROUND(AVG(blood_pressure_systolic)) AS avg_systolic,
        ROUND(AVG(blood_pressure_diastolic)) AS avg_diastolic,
        ROUND(AVG(heart_rate)) AS avg_heart_rate,
        ROUND(AVG(temperature)::numeric, 1) AS avg_temperature,
        COUNT(*) FILTER (
          WHERE DATE_TRUNC('month', measured_at) = DATE_TRUNC('month', CURRENT_DATE)
        ) AS total_this_month
      FROM health_checks
    `;
    const { rows } = await pools.health.query(q);
    res.json(rows[0]);
  } catch (err) {
    console.error("GET /api/health/stats error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================================
// ======================== EMPLOYEES =======================
// ==========================================================
app.get("/api/employees", async (req, res) => {
  try {
    const { rows } = await pools.employees.query(
      "SELECT * FROM employees ORDER BY created_at ASC LIMIT 500"
    );
    res.json(rows);
  } catch (err) {
    console.error("GET /api/employees error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/employees", async (req, res) => {
  try {
    const { name, department } = req.body;
    const q = `INSERT INTO employees (name, department) VALUES ($1,$2) RETURNING *`;
    const values = [name, department];
    const { rows } = await pools.employees.query(q, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("❌ Insert employee error:", err);
    res.status(500).json({ error: err.message, code: err.code || null });
  }
});

// EDIT KARYAWAN
app.put("/api/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, division } = req.body;

    if (!name || !division) {
      return res.status(400).json({ error: "Name and division are required" });
    }

    const q = `
      UPDATE employees 
      SET name = $1, department = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;
    const values = [name, division, id];
    const { rows } = await pools.employees.query(q, values);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("PUT /api/employees/:id error:", err);
    res.status(500).json({ error: err.message });
  }
});

// HAPUS KARYAWAN
app.delete("/api/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const q = `DELETE FROM employees WHERE id = $1 RETURNING *`;
    const { rows } = await pools.employees.query(q, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json({ message: "Employee deleted successfully", deleted: rows[0] });
  } catch (err) {
    console.error("DELETE /api/employees/:id error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ENDPOINT BARU: RIWAYAT LENGKAP KARYAWAN (HADIR + TIDAK HADIR)
app.get("/api/employees/:employeeName/training-history", async (req, res) => {
  try {
    const { employeeName } = req.params;

    const q = `
      -- Dapatkan semua pelatihan
      SELECT 
        t.title as training_title,
        t.start_time,
        ta.timestamp as attendance_date,
        CASE 
          WHEN ta.participant_name IS NOT NULL THEN 'attended'
          WHEN t.start_time > CURRENT_TIMESTAMP THEN 'upcoming'
          ELSE 'absent'
        END as status
      FROM trainings t
      LEFT JOIN training_attendance ta ON t.id = ta.training_id AND ta.participant_name = $1
      ORDER BY t.start_time DESC
    `;

    const { rows } = await pools.training.query(q, [employeeName]);
    res.json(rows);
  } catch (err) {
    console.error(
      "GET /api/employees/:employeeName/training-history error:",
      err
    );
    res.status(500).json({ error: err.message });
  }
});

// ENDPOINT LAMA: HANYA ABSENSI YANG ADA
app.get("/api/training-attendance", async (req, res) => {
  try {
    const { participant } = req.query;

    let q = `
      SELECT 
        ta.id,
        ta.training_id,
        ta.participant_name,
        ta.timestamp as attendance_date,
        t.title as training_title,
        t.start_time
      FROM training_attendance ta
      LEFT JOIN trainings t ON ta.training_id = t.id
    `;

    const values = [];

    if (participant) {
      q += ` WHERE ta.participant_name = $1`;
      values.push(participant);
    }

    q += ` ORDER BY ta.timestamp DESC`;

    const { rows } = await pools.training.query(q, values);
    res.json(rows);
  } catch (err) {
    console.error("GET /api/training-attendance error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/employees/stats", async (req, res) => {
  try {
    const q = `
      SELECT department, COUNT(*) AS count
      FROM employees
      WHERE status = 'active'
      GROUP BY department
    `;
    const { rows } = await pools.employees.query(q);
    const total = rows.reduce((sum, r) => sum + Number(r.count), 0);
    res.json({ total, stats: rows });
  } catch (err) {
    console.error("GET /api/employees/stats error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================================
// ======================== SAFETY ==========================
// ==========================================================
// GET all reports
app.get("/api/safety/reports", async (req, res) => {
  try {
    const { rows } = await pools.safety.query(`
      SELECT *
      FROM incidents
      ORDER BY reported_at DESC
      LIMIT 100
    `);
    res.json(rows);
  } catch (err) {
    console.error("GET /api/safety/reports error:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST new report
app.post("/api/safety/reports", async (req, res) => {
  try {
    const {
      title,
      incident_type,
      severity,
      status,
      location,
      incident_date,
      incident_time,
      description,
      reporter_name,
      witnesses,
      immediate_action,
    } = req.body;

    const q = `
      INSERT INTO incidents 
        (title, incident_type, severity, status, location, incident_date, incident_time, description, witnesses, immediate_action, reporter_name, reported_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING *
    `;
    const values = [
      title,
      incident_type || null,
      severity,
      status || "pending",
      location || null,
      incident_date || null,
      incident_time || null,
      description || null,
      witnesses || null,
      immediate_action || null,
      reporter_name || null,
    ];

    const { rows } = await pools.safety.query(q, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("POST /api/safety/reports error:", err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update status
app.put("/api/safety/reports/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, completed_at } = req.body;

    const allowedStatuses = ["pending", "investigasi", "selesai"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Status tidak valid" });
    }

    const q = `
      UPDATE incidents
      SET status = $1,
          completed_at = CASE
            WHEN $1 = 'selesai' THEN COALESCE($2, NOW())
            ELSE NULL
          END,
          updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;

    const values = [status, completed_at ? new Date(completed_at) : null, id];

    const { rows } = await pools.safety.query(q, values);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Incident not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("❌ PUT /api/safety/reports/:id/status error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET stats
app.get("/api/safety/reports/stats", async (req, res) => {
  try {
    const q = `
      SELECT 
        COUNT(*) FILTER (WHERE DATE_TRUNC('month', reported_at) = DATE_TRUNC('month', CURRENT_DATE)) AS total_this_month,
        COUNT(*) FILTER (WHERE status = 'selesai') AS selesai,
        COUNT(*) FILTER (WHERE status = 'investigasi') AS investigasi,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending
      FROM incidents;
    `;
    const { rows } = await pools.safety.query(q);
    res.json(rows[0]);
  } catch (err) {
    console.error("GET /api/safety/reports/stats error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================================
// ======================== TRAININGS =======================
// ==========================================================
app.get("/api/trainings/upcoming", async (req, res) => {
  try {
    const { rows } = await pools.training.query(`
      SELECT id, title, trainer, start_time, duration_hours, documentation_url, created_at, updated_at
      FROM trainings
      WHERE start_time >= CURRENT_DATE
      ORDER BY start_time ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error("GET /api/trainings/upcoming error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/trainings", async (req, res) => {
  try {
    const { rows } = await pools.training.query(`
      SELECT id, title, trainer, start_time, duration_hours, documentation_url, created_at, updated_at
      FROM trainings
      ORDER BY start_time DESC
      LIMIT 100
    `);
    res.json(rows);
  } catch (err) {
    console.error("GET /api/trainings error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/trainings", upload.single("documentation"), async (req, res) => {
  try {
    const { title, trainer, date, duration } = req.body;
    if (!title || !trainer || !date || !duration) {
      return res
        .status(400)
        .json({ error: "title, trainer, date, and duration are required" });
    }

    const documentation_url = req.file
      ? `/uploads/trainings/${req.file.filename}`
      : null;

    const q = `
      INSERT INTO trainings (title, trainer, start_time, duration_hours, documentation_url, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `;
    const values = [
      title,
      trainer,
      new Date(date),
      Number(duration),
      documentation_url,
    ];
    const { rows } = await pools.training.query(q, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("POST /api/trainings error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.put(
  "/api/trainings/:id/documentation",
  upload.single("documentation"),
  async (req, res) => {
    try {
      const { id } = req.params;
      if (!req.file) {
        return res
          .status(400)
          .json({ error: "file documentation is required" });
      }

      const documentation_url = `/uploads/trainings/${req.file.filename}`;

      const q = `
      UPDATE trainings
      SET documentation_url = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
      const values = [documentation_url, id];
      const { rows } = await pools.training.query(q, values);
      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: "Training not found" });
      }
      res.json(rows[0]);
    } catch (err) {
      console.error("PUT /api/trainings/:id/documentation error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// ==========================================================
// ======================== ACTIVITY FEED ===================
// ==========================================================
app.get("/api/activity/recent", async (req, res) => {
  try {
    const activities = [];

    const attendance = await pools.attendance.query(`
      SELECT id, employee_name, type, timestamp 
      FROM attendance
      ORDER BY timestamp DESC
      LIMIT 10
    `);
    activities.push(
      ...attendance.rows.map((a) => ({
        id: `attendance-${a.id}`,
        type: "attendance",
        message: `${a.employee_name} ${
          a.type === "clock_in" ? "clock-in" : "clock-out"
        }`,
        time: a.timestamp,
      }))
    );

    const employees = await pools.employees.query(`
      SELECT id, name, created_at
      FROM employees
      ORDER BY created_at ASC
      LIMIT 10
    `);
    activities.push(
      ...employees.rows.map((e) => ({
        id: `employee-${e.id}`,
        type: "employee",
        message: `Karyawan baru ditambahkan - ${e.name}`,
        time: e.created_at,
      }))
    );

    const health = await pools.health.query(`
      SELECT id, employee_name, measured_at
      FROM health_checks
      ORDER BY measured_at DESC
      LIMIT 10
    `);
    activities.push(
      ...health.rows.map((h) => ({
        id: `health-${h.id}`,
        type: "health",
        message: `Pemeriksaan kesehatan - ${h.employee_name}`,
        time: h.measured_at,
      }))
    );

    const safety = await pools.safety.query(`
      SELECT id, title, description, reported_at
      FROM incidents
      ORDER BY reported_at DESC
      LIMIT 10
    `);
    activities.push(
      ...safety.rows.map((s) => ({
        id: `incident-${s.id}`,
        type: "incident",
        message: `Laporan insiden - ${
          s.title || s.description || "Tanpa judul"
        }`,
        time: s.reported_at,
      }))
    );

    const trainings = await pools.training.query(`
      SELECT id, title, start_time
      FROM trainings
      ORDER BY start_time DESC
      LIMIT 10
    `);
    activities.push(
      ...trainings.rows.map((t) => ({
        id: `training-${t.id}`,
        type: "training",
        message: `Pelatihan baru dijadwalkan: ${t.title}`,
        time: t.start_time,
      }))
    );

    activities.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json(activities.slice(0, 20));
  } catch (err) {
    console.error("GET /api/activity/recent error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Pastikan di atas semua route, sebelum app.listen
const publicDir = path.join(__dirname, "public");
fs.mkdirSync(publicDir, { recursive: true });

// Serve semua file di public secara statik
app.use("/template.png", express.static(path.join(publicDir, "template.png")));

// ====== START SERVER ======
const port = Number(process.env.PORT || 4000);
app.listen(port, () =>
  console.log("✅ Backend running on http://localhost:" + port)
);
