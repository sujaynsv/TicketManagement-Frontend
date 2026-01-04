import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Assignment {
  assignmentId: string;
  ticketId: string;
  ticketNumber: string;
  
  // Ticket details - MATCH YOUR DTO FIELD NAMES
  title: string;              // NOT ticketTitle
  description: string;        // NOT ticketDescription
  ticketStatus: string;
  ticketPriority: string;
  ticketCategory: string;
  
  // Assignment details
  agentId: string;
  agentUsername: string;
  assignedBy: string;
  assignedByUsername: string;
  assignmentType: string;
  assignedAt: string;
  status: string;
  
  // Additional
  createdByUsername: string;
  commentCount?: number;
  attachementCount?: number;  // Note: Your DTO has typo "attachementCount"
}

export interface SLAWarning {
  ticketId: string;
  ticketNumber: string;
  ticketTitle: string;
  priority: string;
  assignedTo: string;
  createdAt: string;
  slaDeadline: string;
  timeRemaining: number;
  status: string;
}

export interface AgentStats {
  totalAssigned: number;
  pending: number;
  inProgress: number;
  resolved: number;
  avgResolutionTime: number;
}

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // Get agent's assignments
  getMyAssignments(): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(`${this.apiUrl}/assignments/my`);
  }

  // Accept assignment
  acceptAssignment(assignmentId: string): Observable<Assignment> {
    return this.http.post<Assignment>(`${this.apiUrl}/assignments/${assignmentId}/accept`, {});
  }

  // Reject assignment
  rejectAssignment(assignmentId: string, reason: string): Observable<Assignment> {
    return this.http.post<Assignment>(`${this.apiUrl}/assignments/${assignmentId}/reject`, { reason });
  }

  // Get SLA warnings
  getSLAWarnings(): Observable<SLAWarning[]> {
    return this.http.get<SLAWarning[]>(`${this.apiUrl}/sla/warnings`);
  }

  // Get agent statistics
  getAgentStats(): Observable<AgentStats> {
    return this.http.get<AgentStats>(`${this.apiUrl}/agents/stats`);
  }

  // Transfer ticket to another agent
  transferTicket(ticketId: string, toAgentId: string, reason: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/tickets/${ticketId}/transfer`, {
      toAgentId,
      reason
    });
  }

  // Helper: Format time remaining
  formatTimeRemaining(minutes: number): string {
    if (minutes < 0) return 'Overdue';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }

  // Helper: Get SLA color
  getSLAColor(minutes: number): string {
    if (minutes < 0) return 'warn';
    if (minutes < 60) return 'warn';
    if (minutes < 240) return 'accent';
    return 'primary';
  }
}
