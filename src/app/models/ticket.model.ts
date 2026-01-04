export enum TicketStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REOPENED = 'REOPENED'
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum TicketCategory {
  TECHNICAL = 'TECHNICAL',
  BILLING = 'BILLING',
  ACCOUNT = 'ACCOUNT',
  FEATURE_REQUEST = 'FEATURE_REQUEST',
  BUG_REPORT = 'BUG_REPORT',
  OTHER = 'OTHER'
}

export enum EscalationType {
  MANAGER = 'MANAGER',
  SENIOR_AGENT = 'SENIOR_AGENT',
  TECHNICAL_TEAM = 'TECHNICAL_TEAM'
}

export interface Ticket {
  ticketId: string;
  ticketNumber: string;
  title: string;
  description: string;
  status: TicketStatus;
  category: TicketCategory;
  priority: TicketPriority;
  createdByUserId: string;
  createdByUsername: string;
  assignedToUserId?: string;
  assignedToUsername?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  assignedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  commentCount: number;
  attachmentCount: number;
  
  // Escalation fields
  escalatedToUserId?: string;
  escalatedToUsername?: string;
  escalatedBy?: string;
  escalatedByUsername?: string;
  escalationType?: EscalationType;
  escalatedAt?: string;
  escalationReason?: string;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  category: string;
  tags?: string[];
}

export interface UpdateTicketRequest {
  title?: string;
  description?: string;
  category?: string;
  priority?: string;
  tags?: string[];
}

// Paginated response
export interface TicketPage {
  content: Ticket[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
