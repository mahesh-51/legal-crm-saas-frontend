export type UserRole =
  | "FIRM_ADMIN"
  | "LAWYER"
  | "INDIVIDUAL"
  | "CLIENT"
  | "firm"
  | "lawyer"
  | "client";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  firmId?: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Firm {
  id: string;
  name: string;
  subdomain: string;
  logoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  portalAccess?: boolean;
  status?: "active" | "inactive" | "lead";
  createdAt: string;
}

export type MatterStatus = "OPEN" | "ACTIVE" | "ON_HOLD" | "CLOSED";
export type MatterCaseType = "Civil" | "Criminal" | "Family" | "Corporate" | string;

export interface Matter {
  id: string;
  caseTitle: string;
  court?: string;
  caseType: MatterCaseType;
  status: MatterStatus;
  cnr?: string;
  clientId: string;
  clientName?: string;
  firmId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Hearing {
  id: string;
  matterId: string;
  matterTitle?: string;
  hearingDate: string;
  synopsis?: string;
  orders?: string;
  createdAt?: string;
  updatedAt?: string;
  /** For display - derived from synopsis or hearingDate */
  title?: string;
}

export interface Document {
  id: string;
  matterId: string;
  matterTitle?: string;
  originalName: string;
  mimeType?: string;
  size: number;
  uploadedAt: string;
  url?: string;
}

export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";

export interface Invoice {
  id: string;
  matterId: string;
  amount: number;
  status: InvoiceStatus;
  paymentReference?: string;
  createdAt?: string;
  updatedAt?: string;
  clientName?: string;
  dueDate?: string;
  issuedDate?: string;
}

export interface Notification {
  id: string;
  title: string;
  body?: string;
  read: boolean;
  createdAt: string;
}

export interface InviteInfo {
  token: string;
  email: string;
  role: string;
  firmId?: string;
  clientId?: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}
