import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Ticket, CreateTicketRequest, UpdateTicketRequest } from '../models/ticket.model';
import { Comment, CreateCommentRequest } from '../models/comment.model';
import { Attachment } from '../models/attachement.model';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = `${environment.apiUrl}/tickets`;

  constructor(private http: HttpClient) {}

  // ========================================
  // TICKET OPERATIONS
  // ========================================

  createTicket(request: CreateTicketRequest, files?: File[]): Observable<Ticket> {
    const formData = new FormData();
    formData.append('title', request.title);
    formData.append('description', request.description);
    formData.append('category', request.category);
    
    if (request.tags && request.tags.length > 0) {
      request.tags.forEach(tag => formData.append('tags', tag));
    }
    
    if (files && files.length > 0) {
      files.forEach(file => formData.append('files', file));
    }
    
    return this.http.post<Ticket>(this.apiUrl, formData);
  }

  getMyTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/my`);
  }

  getTicketById(ticketId: string): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${ticketId}`);
  }

  getTicketByNumber(ticketNumber: string): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/number/${ticketNumber}`);
  }

  updateTicket(ticketId: string, request: UpdateTicketRequest): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${ticketId}`, request);
  }

  changeStatus(ticketId: string, status: string, reason?: string): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.apiUrl}/${ticketId}/status`, { status, reason });
  }

  getAssignedTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/assigned`);
  }

  getAllTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.apiUrl);
  }

  getTicketsByStatus(status: string): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/status/${status}`);
  }

  deleteTicket(ticketId: string): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${ticketId}`);
  }

  // ========================================
  // COMMENT OPERATIONS
  // ========================================

  addComment(ticketId: string, request: CreateCommentRequest): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/${ticketId}/comments`, request);
  }

  getComments(ticketId: string, includeInternal: boolean = false): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/${ticketId}/comments`, {
      params: { includeInternal: includeInternal.toString() }
    });
  }

  // ========================================
  // ATTACHMENT OPERATIONS (NEW)
  // ========================================

  // Get all attachments for a ticket
  getAttachments(ticketId: string): Observable<Attachment[]> {
    return this.http.get<Attachment[]>(`${this.apiUrl}/${ticketId}/attachments`);
  }

  // Upload attachment to existing ticket
  uploadAttachment(ticketId: string, file: File): Observable<Attachment> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<Attachment>(
      `${this.apiUrl}/${ticketId}/attachments`, 
      formData
    );
  }

  // Delete attachment
  deleteAttachment(ticketId: string, attachmentId: string): Observable<string> {
    return this.http.delete<string>(
      `${this.apiUrl}/${ticketId}/attachments/${attachmentId}`,
      { responseType: 'text' as 'json' }
    );
  }

  // Download attachment (opens in new tab)
  downloadAttachment(s3Url: string): void {
    window.open(s3Url, '_blank');
  }

  // Get file size in readable format
  getFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  // Get file icon based on type
  getFileIcon(fileType: string): string {
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.includes('pdf')) return 'picture_as_pdf';
    if (fileType.includes('word') || fileType.includes('document')) return 'description';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'table_chart';
    if (fileType.includes('text')) return 'text_snippet';
    return 'insert_drive_file';
  }
}
