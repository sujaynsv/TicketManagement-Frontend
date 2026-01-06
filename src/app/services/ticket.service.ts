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
  getAttachments(ticketId: string): Observable<any[]> {
      return this.http.get<any[]>(
        `${this.apiUrl}/${ticketId}/attachments`
      );
    }

  // Upload attachment to existing ticket
  uploadAttachment(ticketId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(
      `${this.apiUrl}/${ticketId}/attachments/upload`,
      formData,
      {
        headers: {
          'X-User-Id': localStorage.getItem('userId') || '',
          'X-Username': localStorage.getItem('username') || ''
        }
      }
    );
  }

  // Download attachment (opens in new tab)
  downloadAttachment(
    ticketId: string, 
    attachmentId: string, 
    fileName: string
  ): void {
    const url = `${this.apiUrl}/${ticketId}/attachments/${attachmentId}/download`;
    
    this.http.get(url, { 
      responseType: 'blob',
      headers: {
        'X-User-Id': localStorage.getItem('userId') || ''
      }
    }).subscribe({
      next: (blob) => {
        // Create download link
        const link = document.createElement('a');
        const objectUrl = window.URL.createObjectURL(blob);
        link.href = objectUrl;
        link.download = fileName;
        link.click();
        
        // Cleanup
        window.URL.revokeObjectURL(objectUrl);
      },
      error: (error) => {
        console.error('Download failed:', error);
        alert('Failed to download attachment');
      }
    });
  }

    downloadAllAttachments(ticketId: string): void {
    const url = `${this.apiUrl}/${ticketId}/attachments/download/all`;
    
    this.http.get(url, { 
      responseType: 'blob',
      headers: {
        'X-User-Id': localStorage.getItem('userId') || ''
      }
    }).subscribe({
      next: (blob) => {
        // Create download link
        const link = document.createElement('a');
        const objectUrl = window.URL.createObjectURL(blob);
        link.href = objectUrl;
        link.download = `ticket-${ticketId}-attachments.zip`;
        link.click();
        
        // Cleanup
        window.URL.revokeObjectURL(objectUrl);
      },
      error: (error) => {
        console.error('Download failed:', error);
        alert('Failed to download attachments');
      }
    });
  }

    deleteAttachment(ticketId: string, attachmentId: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${ticketId}/attachments/${attachmentId}`
    );
  }

  // Get file size in readable format
  getFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }


  changeTicketStatus(ticketId: string, newStatus: string): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.apiUrl}/${ticketId}/status`, {
      status: newStatus
    });
  }

  // Add this method to TicketService class
  escalateTicket(ticketId: string, reason: string): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.apiUrl}/${ticketId}/escalate`, {
      reason: reason
    });
  }

  /**
 * Format file size for display (KB, MB, GB)
 */
formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get Material icon based on file type
 */
getFileIcon(fileType: string): string {
  if (!fileType) return 'attach_file';

  if (fileType.includes('pdf')) return 'picture_as_pdf';
  if (fileType.includes('image')) return 'image';
  if (fileType.includes('video')) return 'video_library';
  if (fileType.includes('audio')) return 'audio_file';
  if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) 
    return 'folder_zip';
  if (fileType.includes('word') || fileType.includes('document')) 
    return 'description';
  if (fileType.includes('sheet') || fileType.includes('excel') || fileType.includes('csv')) 
    return 'table_chart';
  if (fileType.includes('presentation') || fileType.includes('powerpoint')) 
    return 'slideshow';
  if (fileType.includes('text')) return 'description';

  return 'attach_file';
}


}
