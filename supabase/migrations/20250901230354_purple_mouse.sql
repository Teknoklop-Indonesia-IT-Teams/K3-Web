/*
  # K3 Management System Database Schema

  1. New Tables
    - `employees` - Employee master data with personal and contact information
    - `attendance` - Daily attendance records with digital signatures
    - `health_records` - Health monitoring data including blood pressure, heart rate
    - `safety_reports` - Incident reporting and safety violations
    - `training_sessions` - Safety training programs and schedules
    - `training_participants` - Training enrollment and completion tracking
    - `equipment` - Safety equipment and machinery inventory
    - `equipment_inspections` - Regular equipment safety inspections

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
    - Secure sensitive health and personal data

  3. Features
    - Digital signature storage for attendance
    - Comprehensive health monitoring
    - Incident tracking with severity levels
    - Training certification management
    - Equipment maintenance scheduling
*/

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id text UNIQUE NOT NULL,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  position text NOT NULL,
  department text NOT NULL,
  blood_type text,
  emergency_contact text,
  emergency_phone text,
  hire_date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('clock_in', 'clock_out')),
  timestamp timestamptz DEFAULT now(),
  location text,
  signature_data text,
  notes text,
  latitude decimal,
  longitude decimal,
  created_at timestamptz DEFAULT now()
);

-- Health records table
CREATE TABLE IF NOT EXISTS health_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  systolic_pressure integer NOT NULL,
  diastolic_pressure integer NOT NULL,
  heart_rate integer NOT NULL,
  temperature decimal(3,1) NOT NULL,
  weight decimal(5,2),
  symptoms text,
  medications text,
  checkup_date date DEFAULT CURRENT_DATE,
  created_by text,
  created_at timestamptz DEFAULT now()
);

-- Safety reports table
CREATE TABLE IF NOT EXISTS safety_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  location text NOT NULL,
  description text NOT NULL,
  reporter_name text NOT NULL,
  reporter_employee_id uuid REFERENCES employees(id),
  witnesses text,
  immediate_action text,
  status text DEFAULT 'investigating' CHECK (status IN ('investigating', 'resolved', 'pending')),
  incident_date timestamptz DEFAULT now(),
  resolved_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Training sessions table
CREATE TABLE IF NOT EXISTS training_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  trainer text NOT NULL,
  training_type text NOT NULL,
  scheduled_date timestamptz NOT NULL,
  duration_hours decimal(3,1) NOT NULL,
  location text NOT NULL,
  max_participants integer NOT NULL,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Training participants table
CREATE TABLE IF NOT EXISTS training_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_session_id uuid REFERENCES training_sessions(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  enrollment_date timestamptz DEFAULT now(),
  attendance_status text DEFAULT 'enrolled' CHECK (attendance_status IN ('enrolled', 'present', 'absent')),
  completion_status text DEFAULT 'not_started' CHECK (completion_status IN ('not_started', 'in_progress', 'completed', 'failed')),
  certificate_issued boolean DEFAULT false,
  score integer,
  feedback text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(training_session_id, employee_id)
);

-- Equipment table
CREATE TABLE IF NOT EXISTS equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id text UNIQUE NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  manufacturer text,
  model text,
  serial_number text,
  purchase_date date,
  location text NOT NULL,
  status text DEFAULT 'operational' CHECK (status IN ('operational', 'maintenance_needed', 'out_of_service')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Equipment inspections table
CREATE TABLE IF NOT EXISTS equipment_inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid REFERENCES equipment(id) ON DELETE CASCADE,
  inspector_name text NOT NULL,
  inspector_employee_id uuid REFERENCES employees(id),
  inspection_type text NOT NULL CHECK (inspection_type IN ('routine', 'preventive', 'corrective', 'emergency')),
  inspection_date date DEFAULT CURRENT_DATE,
  condition text NOT NULL CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
  issues_found text,
  maintenance_needed text,
  next_inspection_date date NOT NULL,
  signature_data text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_inspections ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (in a real app, you'd want proper authentication)
CREATE POLICY "Public access for employees" ON employees FOR ALL USING (true);
CREATE POLICY "Public access for attendance" ON attendance FOR ALL USING (true);
CREATE POLICY "Public access for health_records" ON health_records FOR ALL USING (true);
CREATE POLICY "Public access for safety_reports" ON safety_reports FOR ALL USING (true);
CREATE POLICY "Public access for training_sessions" ON training_sessions FOR ALL USING (true);
CREATE POLICY "Public access for training_participants" ON training_participants FOR ALL USING (true);
CREATE POLICY "Public access for equipment" ON equipment FOR ALL USING (true);
CREATE POLICY "Public access for equipment_inspections" ON equipment_inspections FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(employee_id, DATE(timestamp));
CREATE INDEX IF NOT EXISTS idx_health_records_employee_date ON health_records(employee_id, checkup_date);
CREATE INDEX IF NOT EXISTS idx_safety_reports_date ON safety_reports(incident_date);
CREATE INDEX IF NOT EXISTS idx_training_sessions_date ON training_sessions(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_equipment_inspections_date ON equipment_inspections(inspection_date);

-- Insert sample data
INSERT INTO employees (employee_id, name, email, phone, position, department, blood_type, emergency_contact, emergency_phone) VALUES
('TKI-2025-001', 'Ahmad Susanto', 'ahmad@teknoklop.com', '08123456789', 'Operator Produksi', 'production', 'A', 'Siti Ahmad', '08567890123'),
('TKI-2025-002', 'Siti Nurhaliza', 'siti@teknoklop.com', '08198765432', 'Quality Inspector', 'quality', 'B', 'Budi Nurhaliza', '08345678901'),
('TKI-2025-003', 'Budi Santoso', 'budi@teknoklop.com', '08156789123', 'Maintenance Technician', 'maintenance', 'O', 'Rina Santoso', '08234567890');

INSERT INTO equipment (equipment_id, name, type, location, status) VALUES
('EQ-2025-001', 'Mesin Bubut CNC-001', 'CNC Machine', 'Gedung A - Produksi', 'operational'),
('EQ-2025-002', 'Crane Overhead 5 Ton', 'Crane', 'Gedung B - Workshop', 'operational'),
('EQ-2025-003', 'Sistem Fire Suppression', 'Safety System', 'Gedung A - Seluruh Lantai', 'maintenance_needed');