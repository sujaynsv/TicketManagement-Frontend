export enum AssignmentStatus {
  NOT_ASSIGNED = 'NOT_ASSIGNED',
  ASSIGNED = 'ASSIGNED',
  REASSIGNED = 'REASSIGNED'
}

export enum AssignmentType {
  AUTO = 'AUTO',
  MANUAL = 'MANUAL'
}

export enum AgentStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  OFFLINE = 'OFFLINE'
}

export interface Assignment {
  assignmentId: string;
  ticketId: string;
  ticketNumber: string;
  agentId: string;
  agentUsername: string;
  assignedBy: string;
  assignedByUsername: string;
  assignmentType: AssignmentType;
  assignmentStrategy?: string;
  previousAgentId?: string;
  previousAgentUsername?: string;
  reassignmentReason?: string;
  assignmentNotes?: string;
  assignedAt: string;
  completedAt?: string;
  status: AssignmentStatus;
  ticketStatus: string;
}

export interface AgentWorkload {
  agentId: string;
  agentUsername: string;
  activeTickets: number;
  totalAssignedTickets: number;
  completedTickets: number;
  status: AgentStatus;
  lastAssignedAt?: string;
  updatedAt: string;
}

export interface AssignmentDTO {
  assignmentId: string;
  ticketId: string;
  ticketNumber: string;
  agentId: string;
  agentUsername: string;
  assignedBy: string;
  assignedByUsername: string;
  assignmentType: string;
  status: string;
  assignedAt: string;
  completedAt?: string;
}

// Paginated response
export interface AssignmentPage {
  content: Assignment[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
