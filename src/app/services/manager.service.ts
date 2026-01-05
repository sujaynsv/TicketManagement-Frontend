import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UnassignedTicket {
  ticketId: string;
  ticketNumber: string;
  title: string;
  priority: string;
  category: string;
}

export interface Agent {
  agentId: string;
  username: string;
  status: string;
}
export interface AgentUser {
  agentId: string;              // userId
  agentUsername: string;
  activeTickets: number;
  totalAssignedTickets: number;
  completedTickets: number;
  status: 'AVAILABLE' | 'BUSY';
  isRecommended: boolean;
}



export interface ManualAssignmentRequest {
  ticketId: string;
  agentId: string;
  reason?: string;
}

export interface SLAItem {
  ticketId: string;
  ticketNumber: string;
  priority: string;
  assignedTo: string;
  timeRemaining: number;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class ManagerService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ===============================
  // ASSIGNMENTS
  // ===============================

  getUnassignedTickets(): Observable<UnassignedTicket[]> {
    return this.http.get<UnassignedTicket[]>(
      `${this.api}/assignments/tickets/unassigned`
    );
  }

    getAgentsWithWorkload(): Observable<AgentUser[]> {
    return this.http.get<AgentUser[]>(
        `${this.api}/assignments/agents/available`
    );
    }


  getAvailableAgents(): Observable<Agent[]> {
    return this.http.get<Agent[]>(
      `${this.api}/assignments/agents/available`
    );
  }

    manualAssign(payload: {
    ticketId: string;
    agentId: string;
    priority: string;
    assignmentNotes: string;
    }) {
    return this.http.post(
        `${this.api}/assignments/manual`,
        payload
    );
    }


  // ===============================
  // SLA
  // ===============================

  getSLAWarnings(): Observable<SLAItem[]> {
    return this.http.get<SLAItem[]>(`${this.api}/sla/warnings`);
  }

  getSLABreaches(): Observable<SLAItem[]> {
    return this.http.get<SLAItem[]>(`${this.api}/sla/breached`);
  }

  reassignTicket(payload: {
    ticketId: string;
    newAgentId: string;
    }): Observable<any> {
    return this.http.put(
        `${this.api}/assignments/reassign`,
        payload
    );
    }


  
}
