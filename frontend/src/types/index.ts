export enum UserRole {
  CITIZEN = 'CITIZEN',
  ADMIN = 'ADMIN',
  OFFICER = 'OFFICER',
}

export enum IssueType {
  POTHOLE = 'Pothole',
  ROAD_DAMAGE = 'Damaged Road',
  GARBAGE = 'Garbage Accumulation',
  OVERFLOWING_DUSTBIN = 'Overflowing Dustbin',
  WATER_LEAKAGE = 'Water Leakage',
  DRAINAGE_BLOCKAGE = 'Drainage Blockage',
  WATERLOGGING = 'Waterlogging',
  STREETLIGHT = 'Damaged Streetlight',
  ELECTRICAL_WIRE = 'Exposed Electrical Wire',
  MANHOLE = 'Open Manhole',
  INFRASTRUCTURE_DAMAGE = 'Broken Public Infrastructure',
  OTHER = 'Other Civic Problem',
}

export enum IssueStatus {
  SUBMITTED = 'SUBMITTED',
  REPORTED = 'REPORTED',
  AI_ANALYZED = 'AI_ANALYZED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  ASSIGNED = 'ASSIGNED',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  AWAITING_INSPECTION = 'AWAITING_INSPECTION',
  RESOLUTION_SUBMITTED = 'RESOLUTION_SUBMITTED',
  CITIZEN_VERIFICATION = 'CITIZEN_VERIFICATION',
  RESOLVED = 'RESOLVED',
  REOPENED = 'REOPENED',
  REJECTED = 'REJECTED',
  CLOSED = 'CLOSED',
}

export enum SeverityLevel {
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  department_id?: number | null;
  created_at: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  contact_email?: string;
  created_at: string;
}

export interface BoundingBox {
  class: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
  box_normalized?: number[];
}

export interface AIAnalysisResult {
  issue_type: string;
  confidence: number;
  severity: SeverityLevel;
  priority_score: number;
  priority_explanation?: string;
  recommended_department: string;
  recommended_department_code: string;
  sla_hours?: number;
  bounding_boxes: BoundingBox[];
  defect_area_ratio: number;
  annotated_image_url?: string;
  original_image_url: string;
}

export interface NLPAnalysisResult {
  problem_category: string;
  nlp_confidence: number;
  detected_language: string;
  is_urgent: boolean;
  urgency_keywords: string[];
  matched_keywords: string[];
  extracted_location_references: string[];
  suggested_title: string;
  structured_problem: string;
  recommended_department: string;
  recommended_department_code: string;
}

export interface DuplicateCandidate {
  id: number;
  title: string;
  issue_type: string;
  status: string;
  distance_meters: number;
  created_at?: string;
  address?: string;
  support_count: number;
  match_confidence: number;
  image_url?: string;
  priority_score: number;
}

export interface IssueImage {
  id: number;
  original_image_path: string;
  image_url?: string;
  annotated_image_path?: string;
  bounding_box_json?: string;
  created_at: string;
}

export interface StatusHistory {
  id: number;
  previous_status?: IssueStatus;
  new_status: IssueStatus;
  changed_by?: User;
  notes?: string;
  progress_percentage?: number;
  created_at: string;
}

export interface DuplicateRelation {
  id: number;
  duplicate_issue_id: number;
  distance_meters: number;
  similarity_score: number;
  created_at: string;
}

export interface AIResolutionComparison {
  comparison_verified: boolean;
  repair_confidence: number;
  defect_cleared: boolean;
  similarity_score: number;
  verdict: string;
  ai_assessment_notes: string;
  recommendation: string;
}

export interface Issue {
  id: number;
  title: string;
  description?: string;
  issue_type: IssueType;
  latitude: number;
  longitude: number;
  address?: string;
  ai_confidence: number;
  severity: SeverityLevel;
  priority_score: number;
  priority_explanation?: string;
  priority_override_reason?: string | null;
  status: IssueStatus;
  reporter_id: number;
  reporter?: User;
  department_id?: number;
  department?: Department;
  images: IssueImage[];
  status_history: StatusHistory[];
  assigned_officer_id?: number | null;
  assigned_officer?: User | null;
  assigned_at?: string | null;
  progress_percentage: number;
  latest_update?: string | null;
  
  // SLA
  sla_hours?: number;
  sla_deadline?: string | null;
  is_escalated?: boolean;

  // Resolution & Citizen Verification
  resolution_image_path?: string | null;
  resolution_notes?: string | null;
  resolution_ai_comparison?: string | null;
  resolution_submitted_at?: string | null;
  citizen_feedback?: string | null;
  citizen_verified_at?: string | null;
  estimated_completion_date?: string | null;
  resolved_at?: string | null;
  closed_at?: string | null;

  // Voice & Community
  support_count: number;
  original_language?: string;
  voice_audio_path?: string | null;
  voice_transcript?: string | null;

  created_at: string;
  updated_at: string;
}

export interface MapPoint {
  id: number;
  title: string;
  description?: string;
  issue_type: string;
  latitude: number;
  longitude: number;
  address?: string;
  status: string;
  severity: string;
  priority_score: number;
  priority_explanation?: string;
  image_url?: string;
  annotated_image_url?: string;
  resolution_image_url?: string;
  department?: string | null;
  support_count?: number;
  is_overdue?: boolean;
  created_at: string;
}

export interface DepartmentStat {
  department_id: number;
  department_name: string;
  department_code?: string;
  total_assigned: number;
  active_count?: number;
  pending: number;
  in_progress: number;
  resolved: number;
  resolution_rate: number;
  overdue_count?: number;
}

export interface PredictiveHotspot {
  cluster_id: string;
  latitude: number;
  longitude: number;
  address: string;
  total_complaints: number;
  unresolved_complaints: number;
  critical_complaints: number;
  reopened_complaints: number;
  dominant_category: string;
  risk_score: number;
  risk_level: string;
  risk_color: string;
  recurrence_probability: string;
  confidence: number;
  forecast_period: string;
  preventive_action: string;
  methodology_note: string;
}

export interface AnalyticsDashboardData {
  total_issues: number;
  open_issues: number;
  in_progress_issues: number;
  resolved_issues: number;
  critical_issues_count: number;
  reopened_count?: number;
  escalated_count?: number;
  average_resolution_hours?: number;
  issues_by_category: Record<string, number>;
  issues_by_severity: Record<string, number>;
  issues_by_status: Record<string, number>;
  department_performance: DepartmentStat[];
  predictive_hotspots?: PredictiveHotspot[];
}

export interface PublicAccountabilitySummary {
  total_complaints: number;
  resolved_complaints: number;
  in_progress_complaints: number;
  pending_complaints: number;
  reopened_complaints: number;
  citizen_verified_count: number;
  resolution_rate: number;
  avg_resolution_hours: number;
  department_metrics: DepartmentStat[];
  monthly_trends: { month: string; submitted: number; resolved: number }[];
  data_as_of: string;
}
