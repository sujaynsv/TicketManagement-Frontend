import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  // ✅ Microservices Base URLs
  private userServiceUrl = `${environment.apiUrl}/admin/users`;
  private ticketServiceUrl = `${environment.apiUrl}/admin/tickets`;
  private assignmentServiceUrl = `${environment.apiUrl}/admin/assignments`;
  private analyticsServiceUrl = `${environment.apiUrl}/admin/analytics`;

  constructor(private http: HttpClient) { }

  // =============================================
  // ============ USERS - Admin/Users Service ============
  // =============================================

  /**
   * Get all users with pagination and filtering
   * GET /admin/users?page=0&size=10&role=SUPPORT_AGENT&isActive=true&search=john
   */
  getAllUsers(page: number = 0, size: number = 10, role?: string, isActive?: boolean, search?: string): Observable<any> {
    let query = `?page=${page}&size=${size}`;
    if (role) query += `&role=${role}`;
    if (isActive !== undefined) query += `&isActive=${isActive}`;
    if (search) query += `&search=${search}`;
    
    return this.http.get<any>(`${this.userServiceUrl}${query}`).pipe(
      map(response => response.content || [])
    );
  }

  /**
   * Get user by ID
   * GET /admin/users/{userId}
   */
  getUserById(userId: string): Observable<any> {
    return this.http.get(`${this.userServiceUrl}/${userId}`);
  }

  /**
   * Create new user
   * POST /admin/users
   */
  createUser(userData: any): Observable<any> {
    return this.http.post(`${this.userServiceUrl}`, userData);
  }

  /**
   * Update user details
   * PUT /admin/users/{userId}
   */
  updateUser(userId: string, userData: any): Observable<any> {
    return this.http.put(`${this.userServiceUrl}/${userId}`, userData);
  }

  /**
   * Change user role
   * PUT /admin/users/{userId}/role
   */
  changeUserRole(userId: string, role: string): Observable<any> {
    return this.http.put(`${this.userServiceUrl}/${userId}/role`, { role });
  }

  /**
   * Activate user
   * PUT /admin/users/{userId}/activate
   */
  activateUser(userId: string): Observable<any> {
    return this.http.put(`${this.userServiceUrl}/${userId}/activate`, {});
  }

  /**
   * Deactivate user
   * PUT /admin/users/{userId}/deactivate
   */
  deactivateUser(userId: string): Observable<any> {
    return this.http.put(`${this.userServiceUrl}/${userId}/deactivate`, {});
  }

  /**
   * Assign manager to user
   * PUT /admin/users/{userId}/manager
   */
  assignManager(userId: string, managerId: string): Observable<any> {
    return this.http.put(`${this.userServiceUrl}/${userId}/manager`, { managerId });
  }

  /**
   * Reset user password
   * PUT /admin/users/{userId}/reset-password
   */
  resetPassword(userId: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.userServiceUrl}/${userId}/reset-password`, { newPassword });
  }

  /**
   * Get user statistics
   * 
   * 
   * GET /admin/users/stats
   */
  getUserStats(): Observable<any> {
    return this.http.get(`${this.userServiceUrl}/stats`);
  }

  /**
   * Get all agents (for dropdowns)
   * GET /admin/users/agents
   */
  getAllAgents(): Observable<any> {
    return this.http.get<any>(`${this.userServiceUrl}/agents`).pipe(
      map(response => Array.isArray(response) ? response : response.content || [])
    );
  }

  /**
   * Get all managers (for dropdowns)
   * GET /admin/users/managers
   */
  getAllManagers(): Observable<any> {
    return this.http.get<any>(`${this.userServiceUrl}/managers`).pipe(
      map(response => Array.isArray(response) ? response : response.content || [])
    );
  }

  // =============================================
  // ============ TICKETS - Admin/Tickets Service ============
  // =============================================

  /**
   * Get all tickets with pagination and filtering
   * GET /admin/tickets?page=0&size=10&status=OPEN&priority=HIGH&category=TECHNICAL_ISSUE&search=login
   */
  getAllTickets(page: number = 0, size: number = 10, status?: string, priority?: string, 
                category?: string, assignedToUserId?: string, createdByUserId?: string, search?: string): Observable<any> {
    let query = `?page=${page}&size=${size}`;
    if (status) query += `&status=${status}`;
    if (priority) query += `&priority=${priority}`;
    if (category) query += `&category=${category}`;
    if (assignedToUserId) query += `&assignedToUserId=${assignedToUserId}`;
    if (createdByUserId) query += `&createdByUserId=${createdByUserId}`;
    if (search) query += `&search=${search}`;

    return this.http.get<any>(`${this.ticketServiceUrl}${query}`).pipe(
      map(response => response.content || [])
    );
  }

  /**
   * Get ticket by ID
   * GET /admin/tickets/{ticketId}
   */
  getTicketById(ticketId: string): Observable<any> {
    return this.http.get(`${this.ticketServiceUrl}/${ticketId}`);
  }

  /**
   * Change ticket priority
   * PUT /admin/tickets/{ticketId}/priority
   */
  changeTicketPriority(ticketId: string, priority: string, reason: string): Observable<any> {
    return this.http.put(`${this.ticketServiceUrl}/${ticketId}/priority`, { priority, reason });
  }

  /**
   * Change ticket category
   * PUT /admin/tickets/{ticketId}/category
   */
  changeTicketCategory(ticketId: string, category: string, reason: string): Observable<any> {
    return this.http.put(`${this.ticketServiceUrl}/${ticketId}/category`, { category, reason });
  }

  /**
   * Change ticket status
   * PUT /admin/tickets/{ticketId}/status
   */
  changeTicketStatus(ticketId: string, status: string, reason: string): Observable<any> {
    return this.http.put(`${this.ticketServiceUrl}/${ticketId}/status`, { status, reason });
  }

  /**
   * Delete ticket (soft delete or hard delete)
   * DELETE /admin/tickets/{ticketId}?hardDelete=false
   */
  deleteTicket(ticketId: string, hardDelete: boolean = false): Observable<any> {
    return this.http.delete(`${this.ticketServiceUrl}/${ticketId}?hardDelete=${hardDelete}`);
  }

  /**
   * Get ticket statistics
   * GET /admin/tickets/stats
   */
  getTicketStats(): Observable<any> {
    return this.http.get(`${this.ticketServiceUrl}/stats`);
  }

  /**
   * Get user's tickets (created by user)
   * GET /admin/tickets/user/{userId}?page=0&size=10
   */
  getUserTickets(userId: string, page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.ticketServiceUrl}/user/${userId}?page=${page}&size=${size}`).pipe(
      map(response => response.content || [])
    );
  }

  /**
   * Get agent's assigned tickets
   * GET /admin/tickets/agent/{agentId}?page=0&size=10
   */
  getAgentTickets(agentId: string, page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.ticketServiceUrl}/agent/${agentId}?page=${page}&size=${size}`).pipe(
      map(response => response.content || [])
    );
  }

  // =============================================
  // ============ ASSIGNMENTS - Admin/Assignments Service ============
  // =============================================

  /**
   * Get all assignments with pagination and filtering
   * GET /admin/assignments?page=0&size=10&status=ASSIGNED&agentId=xxx&ticketId=xxx
   */
  getAllAssignments(page: number = 0, size: number = 10, status?: string, agentId?: string, 
                    ticketId?: string, assignmentType?: string, search?: string): Observable<any> {
    let query = `?page=${page}&size=${size}`;
    if (status) query += `&status=${status}`;
    if (agentId) query += `&agentId=${agentId}`;
    if (ticketId) query += `&ticketId=${ticketId}`;
    if (assignmentType) query += `&assignmentType=${assignmentType}`;
    if (search) query += `&search=${search}`;

    return this.http.get<any>(`${this.assignmentServiceUrl}${query}`).pipe(
      map(response => response.content || [])
    );
  }

  /**
   * Get assignment by ID
   * GET /admin/assignments/{assignmentId}
   */
  getAssignmentById(assignmentId: string): Observable<any> {
    return this.http.get(`${this.assignmentServiceUrl}/${assignmentId}`);
  }

  /**
   * Force reassign ticket to different agent
   * PUT /admin/assignments/{assignmentId}/reassign
   */
  forceReassign(assignmentId: string, request: any): Observable<any> {
    return this.http.put(`${this.assignmentServiceUrl}/${assignmentId}/reassign`, request);
  }

  /**
   * Unassign ticket (remove agent assignment)
   * PUT /admin/assignments/{assignmentId}/unassign
   */
  unassignTicket(assignmentId: string, reason: string): Observable<any> {
    return this.http.put(`${this.assignmentServiceUrl}/${assignmentId}/unassign`, { reason });
  }

  /**
   * Delete assignment record
   * DELETE /admin/assignments/{assignmentId}
   */
  deleteAssignment(assignmentId: string): Observable<any> {
    return this.http.delete(`${this.assignmentServiceUrl}/${assignmentId}`);
  }

  /**
   * Get assignment statistics
   * GET /admin/assignments/stats
   */
  getAssignmentStats(): Observable<any> {
    return this.http.get(`${this.assignmentServiceUrl}/stats`);
  }

  /**
   * Get agent workload details
   * GET /admin/assignments/agent/{agentId}
   */
  getAgentWorkload(agentId: string): Observable<any> {
    return this.http.get(`${this.assignmentServiceUrl}/agent/${agentId}`);
  }

  /**
   * Get agent's active assignments
   * GET /admin/assignments/agent/{agentId}/active
   */
  getAgentActiveAssignments(agentId: string): Observable<any> {
    return this.http.get<any>(`${this.assignmentServiceUrl}/agent/${agentId}/active`).pipe(
      map(response => Array.isArray(response) ? response : response.content || [])
    );
  }

  /**
   * Get all unassigned tickets
   * GET /admin/assignments/unassigned
   */
  getUnassignedTickets(): Observable<any> {
    return this.http.get<any>(`${this.assignmentServiceUrl}/unassigned`).pipe(
      map(response => Array.isArray(response) ? response : response.content || [])
    );
  }

  /**
   * Get assignment history for a ticket
   * GET /admin/assignments/ticket/{ticketId}/history
   */
  getTicketAssignmentHistory(ticketId: string): Observable<any> {
    return this.http.get<any>(`${this.assignmentServiceUrl}/ticket/${ticketId}/history`).pipe(
      map(response => Array.isArray(response) ? response : response.content || [])
    );
  }

  /**
   * Bulk reassign tickets from one agent to another
   * POST /admin/assignments/bulk-reassign
   */
  bulkReassign(request: any): Observable<any> {
    return this.http.post(`${this.assignmentServiceUrl}/bulk-reassign`, request);
  }

  // =============================================
  // ============ ANALYTICS - Admin/Analytics Service ============
  // =============================================

  /**
   * Get system overview dashboard
   * GET /admin/analytics/overview
   */
  getSystemOverview(): Observable<any> {
    return this.http.get(`${this.analyticsServiceUrl}/overview`);
  }

  /**
   * Get ticket analytics and trends
   * GET /admin/analytics/tickets?days=7
   */
  getTicketAnalytics(days: number = 7): Observable<any> {
    return this.http.get(`${this.analyticsServiceUrl}/tickets?days=${days}`);
  }

  /**
   * Get agent performance metrics
   * GET /admin/analytics/agents
   */
  getAgentPerformance(): Observable<any> {
    return this.http.get(`${this.analyticsServiceUrl}/agents`);
  }

  /**
   * Get SLA compliance report
   * GET /admin/analytics/sla
   */
  getSlaReport(): Observable<any> {
    return this.http.get(`${this.analyticsServiceUrl}/sla`);
  }

  /**
   * Get tickets by category breakdown
   * GET /admin/analytics/categories
   */
  getCategoryBreakdown(): Observable<any> {
    return this.http.get(`${this.analyticsServiceUrl}/categories`);
  }

  /**
   * Get time-based trends
   * GET /admin/analytics/trends?period=daily&days=30
   */
  getTrends(period: string = 'daily', days: number = 30): Observable<any> {
    return this.http.get(`${this.analyticsServiceUrl}/trends?period=${period}&days=${days}`);
  }

  // =============================================
  // ============ TICKETS ACTIVITIES ============
  // =============================================

  /**
   * Get activity log for ticket
   * GET /tickets/{ticketId}/activities
   */
  getTicketActivities(ticketId: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/tickets/${ticketId}/activities`).pipe(
      map(response => Array.isArray(response) ? response : response.content || [])
    );
  }

    getAvailableAgents(): Observable<any> {
    return this.http.get<any>(`${this.userServiceUrl}/agents`).pipe(
      map(response => Array.isArray(response) ? response : response.content || [])
    );
  }

  /**
   * Reassign ticket to a different agent
   * POST /admin/assignments/reassign
   */
reassignTicket(assignmentId: string, newAgentId: string, reason: string): Observable<any> {
  return this.http.put(`${this.assignmentServiceUrl}/${assignmentId}/reassign`, { 
    newAgentId,  // ✅ Correct field name
    reason       // ✅ Include reason
  });
}

  getAssignmentByTicketId(ticketId: string): Observable<any> {
  return this.http.get<any>(`${this.assignmentServiceUrl}?ticketId=${ticketId}`).pipe(
    map(response => {
      if (Array.isArray(response)) {
        return response.length > 0 ? response[0] : null;
      }
      return response.content && response.content.length > 0 ? response.content[0] : null;
    })
  );
}


}
