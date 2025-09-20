export interface User {
  id: string;
  name: string;
  email: string;
  role: 'volunteer' | 'ngo';
  ngoId?: string;
  serviceDays?: number;
  isApproved?: boolean;
  certificates?: Certificate[];
  certificateThreshold?: number;
  volunteers?: Volunteer[];
  serviceHistory?: ServiceRecord[];
  logo?: string;
  description?: string;
  contactInfo?: ContactInfo;
}

export interface Volunteer {
  id: string;
  name: string;
  email: string;
  serviceDays: number;
  isApproved: boolean;
  lastServiceDate?: string;
  createdAt: string;
}

export interface NGO {
  id: string;
  name: string;
  email: string;
  description?: string;
  logo?: string;
  certificateThreshold: number;
  volunteers: string[];
  certificates: string[];
  contactInfo?: ContactInfo;
}

export interface ContactInfo {
  phone?: string;
  address?: string;
  website?: string;
}

export interface Certificate {
  id: string;
  certificateId: string;
  volunteerId?: string;
  ngoId?: string;
  serviceDays: number;
  serviceStartDate: string;
  serviceEndDate: string;
  issueDate: string;
  downloadUrl?: string;
  verificationCode: string;
  isValid: boolean;
  volunteer?: {
    name: string;
    email: string;
  };
  ngo?: {
    name: string;
    logo?: string;
  };
}

export interface ServiceRecord {
  date: string;
  approved: boolean;
}

export interface DashboardStats {
  totalVolunteers?: number;
  approvedVolunteers?: number;
  pendingApprovals?: number;
  totalServiceDays?: number;
  certificatesIssued?: number;
  eligibleForCertificate?: number;
  totalServices?: number;
  thisMonth?: number;
  daysUntilCertificate?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  token?: string;
  user?: User;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalVolunteers?: number;
  totalCertificates?: number;
  hasNext: boolean;
  hasPrev: boolean;
}