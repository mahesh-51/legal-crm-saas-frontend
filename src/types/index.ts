export type UserRole =
  | "FIRM_ADMIN"
  | "LAWYER"
  | "INDIVIDUAL"
  | "CLIENT"
  | "SUPER_ADMIN"
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
  /** When true, user may manage global (built-in) court catalog rows. */
  isSuperAdmin?: boolean;
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

export type ClientVerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

/** Exactly one ID type used for this client’s KYC verification (mutually exclusive). */
export type ClientVerificationDocumentType = "aadhaar" | "pan" | "driving";

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  verificationStatus?: ClientVerificationStatus;
  /** Which document type is used for verification — Aadhaar, PAN, or driving licence (pick one). */
  verificationDocumentType?: ClientVerificationDocumentType | null;
  aadhaarCard?: string;
  panCard?: string;
  drivingLicense?: string;
  /** Relative path from API origin (may use backslashes from Windows paths). */
  aadhaarDocumentUrl?: string | null;
  panDocumentUrl?: string | null;
  drivingLicenseDocumentUrl?: string | null;
  company?: string;
  portalAccess?: boolean;
  /** Legacy display field if API omits verificationStatus */
  status?: "active" | "inactive" | "lead";
  createdAt: string;
}

export type MatterStatus = "OPEN" | "ACTIVE" | "ON_HOLD" | "CLOSED";
export type MatterCaseType = "Civil" | "Criminal" | "Family" | "Corporate" | string;

export interface Matter {
  id: string;
  matterName?: string;
  complainants?: string[];
  defendants?: string[];
  status: MatterStatus;
  courtTypeId?: string | null;
  /** Display name when API includes it (for selects when id is not yet in local lists) */
  courtTypeName?: string | null;
  courtNameId?: string | null;
  courtName?: string | null;
  caseType?: string | null;
  cnr?: string;
  clientId: string;
  clientName?: string;
  /** Nested client from list/detail API — use `normalizeMatter()` to set `clientName` */
  client?: { id: string; name: string };
  /** Nested court type from API */
  courtType?: { id: string; name: string };
  firmId?: string;
  createdAt?: string;
  updatedAt?: string;
  /** @deprecated Prefer matterName */
  caseTitle?: string;
}

export type HearingStatus =
  | "SCHEDULED"
  | "COMPLETED"
  | "ADJOURNED"
  | "CANCELLED";

export interface Hearing {
  id: string;
  matterId: string;
  clientId: string;
  caseType?: string;
  caseNo?: string;
  complainants?: string[];
  defendants?: string[];
  status: HearingStatus;
  currentDate: string;
  nextDate?: string;
  synopsis?: string;
  orders?: string;
  matterTitle?: string;
  createdAt?: string;
  updatedAt?: string;
  /** @deprecated Prefer currentDate */
  hearingDate?: string;
  title?: string;
}

export type DocumentCategory = "CASE_FILE" | "GENERAL";

export interface Document {
  id: string;
  matterId: string;
  matterTitle?: string;
  originalName: string;
  mimeType?: string;
  size: number;
  uploadedAt: string;
  url?: string;
  category?: DocumentCategory;
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
