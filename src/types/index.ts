export interface Employee {
  id: string;
  name: string;
  department: string;
  email: string;
  phone: string;
  blood_type: string;
  status: string;
  user_id?: number | null;
  username?: string | null;
  user_role?: string | null;
}

export interface AvailableUser {
  id: number;
  username: string;
  role: string;
  name: string;
}

export interface EmployeeListProps {
  refreshTrigger: number;
  highlightId: string | null;
  showActions: boolean;
}

export interface EmployeeStatsProps {
  refreshTrigger: number;
}

export interface StatsResponse {
  total: number;
  stats: { department: string; count: number }[];
}

export interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; // tipe icon aman
  trend: "up" | "down";
  color: "blue" | "green" | "red" | "purple";
}

export interface Activity {
  id: string;
  type: "attendance" | "health" | "incident" | "employee" | "training" | string;
  message: string;
  time: string;
}

export interface Training {
  id: string;
  title: string;
  trainer?: string;
  start_time: string;
  end_time?: string;
  location?: string;
  description?: string;
  duration_hours: number;
  documentation_url?: string;
  total_participants: number;
  max_participants?: number;
  current_participants?: number;
}

export interface TrainingFormData {
  title: string;
  trainer: string;
  start_time: string;
  duration_hours: number;
  documentation?: FileList;
}

export interface TrainingListProps {
  refreshTrigger: number;
  showActions: boolean;
}

export interface TrainingStatsProps {
  refreshTrigger: number;
}

export interface TrainingHistory {
  training_title: string;
  start_time: string;
  attendance_date: string | null;
  status: "attended" | "upcoming" | "absent";
}

export interface HealthCheck {
  id: string;
  employee_name: string;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  spo2?: number;
  blood_sugar?: number;
  cholesterol?: number;
  urid_acid?: number;
  temperature?: number;
  weight?: number;
  measured_at: string;
  notes?: string;
  signature_data?: string;
}

export interface HealthHistoryProps {
  refreshTrigger: number;
  showActions?: boolean;
}

export interface HealthStatsData {
  avg_systolic: number;
  avg_diastolic: number;
  avg_heart_rate: number;
  avg_temperature: number;
  total_this_month: number;
}

export interface HealthChartsProps {
  refreshTrigger: number;
}

export interface HealthStatsProps {
  refreshTrigger: number;
}

export interface AttendanceRecord {
  id: number;
  participant_name: string;
  training_id: string;
  timestamp: string;
  notes?: string;
  signature?: string;
}

export interface AttendanceFormProps {
  onSubmitSuccess: () => void;
  refreshTrigger: number;
}

export interface AttendanceChartProps {
  refreshTrigger: number;
}

export interface AttendanceStatsProps {
  refreshTrigger: number;
}

export interface AttendanceStatsData {
  hadir_hari_ini: number;
  rata_jam_masuk: number; // jam dalam decimal, ex: 8.20
  kehadiran_minggu_ini: number;
  hari_kerja_bulan_ini: number;
}

export interface Participant {
  participant_name: string;
  timestamp: string;
  notes?: string;
}

export interface AttendanceListProps {
  refreshTrigger?: number;
  employeesPerPage?: number;
  trainingsPerPage?: number;
}

export interface ChartData {
  date: string;
  hadir: number;
  target: number;
}

export interface SafetyReportFormData {
  title: string;
  incident_type:
    | ""
    | "near_miss"
    | "accident"
    | "equipment_failure"
    | "safety_violation"
    | "environmental";
  severity: "low" | "medium" | "high" | "critical";
  status: "selesai" | "investigasi" | "pending";
  location: string;
  incident_date: string;
  incident_time: string;
  description: string;
  reporter_name: string;
  witnesses: string;
  immediate_action: string;
}

export interface SafetyMetricsCardProps {
  refreshTrigger: number;
}

export interface SafetyReportListProps {
  refreshTrigger: number;
  onUpdate?: () => void;
  showActions: boolean;
}
