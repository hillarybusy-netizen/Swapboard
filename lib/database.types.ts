export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Industry = "restaurant" | "healthcare" | "retail" | "hospitality";
export type Plan = "trial" | "starter" | "pro" | "enterprise";
export type UserRole = "worker" | "manager" | "admin";
export type ShiftStatus = "scheduled" | "open" | "swap_pending" | "swapped" | "cancelled";
export type SwapStatus = "pending" | "worker_accepted" | "manager_approved" | "rejected" | "cancelled";
export type FeedbackType = "swap" | "nps" | "general";

export interface Organization {
  id: string;
  name: string;
  industry: Industry;
  subdomain: string | null;
  plan: Plan;
  trial_started_at: string;
  trial_ends_at: string;
  settings: Json;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  organization_id: string;
  name: string;
  color: string;
  requires_certification: boolean;
  sort_order: number;
  created_at: string;
}

export interface Role {
  id: string;
  organization_id: string;
  department_id: string;
  name: string;
  min_hours_notice: number;
  created_at: string;
}

export interface Profile {
  id: string;
  organization_id: string | null;
  department_id: string | null;
  role_id: string | null;
  full_name: string | null;
  phone: string | null;
  hourly_rate: number;
  user_role: UserRole;
  is_active: boolean;
  certifications: string[];
  avatar_url: string | null;
  invite_token: string | null;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface Shift {
  id: string;
  organization_id: string;
  department_id: string | null;
  role_id: string | null;
  assigned_to: string | null;
  title: string;
  start_time: string;
  end_time: string;
  status: ShiftStatus;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  department?: Department;
  role?: Role;
  profile?: Profile;
}

export interface SwapRequest {
  id: string;
  organization_id: string;
  requester_id: string;
  shift_id: string;
  covering_worker_id: string | null;
  status: SwapStatus;
  reason: string | null;
  manager_notes: string | null;
  approved_by: string | null;
  requested_at: string;
  worker_responded_at: string | null;
  manager_responded_at: string | null;
  created_at: string;
  // Joined
  shift?: Shift;
  requester?: Profile;
  covering_worker?: Profile;
}

export interface AnalyticsEvent {
  id: string;
  organization_id: string;
  event_type: string;
  shift_id: string | null;
  swap_request_id: string | null;
  user_id: string | null;
  metadata: Json;
  created_at: string;
}

export interface Feedback {
  id: string;
  organization_id: string;
  user_id: string;
  swap_request_id: string | null;
  rating: number | null;
  comment: string | null;
  feedback_type: FeedbackType;
  created_at: string;
}

export interface Invitation {
  id: string;
  organization_id: string;
  email: string;
  user_role: UserRole;
  department_id: string | null;
  token: string;
  invited_by: string | null;
  accepted_at: string | null;
  expires_at: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      organizations: { Row: Organization; Insert: Partial<Organization>; Update: Partial<Organization> };
      departments: { Row: Department; Insert: Partial<Department>; Update: Partial<Department> };
      roles: { Row: Role; Insert: Partial<Role>; Update: Partial<Role> };
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      shifts: { Row: Shift; Insert: Partial<Shift>; Update: Partial<Shift> };
      swap_requests: { Row: SwapRequest; Insert: Partial<SwapRequest>; Update: Partial<SwapRequest> };
      analytics_events: { Row: AnalyticsEvent; Insert: Partial<AnalyticsEvent>; Update: Partial<AnalyticsEvent> };
      feedback: { Row: Feedback; Insert: Partial<Feedback>; Update: Partial<Feedback> };
      invitations: { Row: Invitation; Insert: Partial<Invitation>; Update: Partial<Invitation> };
    };
  };
}
