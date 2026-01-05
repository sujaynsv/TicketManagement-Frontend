import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TicketService } from '../../../services/ticket.service';
import { AuthService } from '../../../services/auth.service';
import { Ticket } from '../../../models/ticket.model';
import { Comment } from '../../../models/comment.model';
import { Attachment } from '../../../models/attachement.model';
import { EscalateDialogComponent } from '../../shared/escalate-dialog/escalate-dialog.component';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatTabsModule,
    MatListModule,
    MatMenuModule,
    MatDialogModule
  ],
  templateUrl: './ticket-detail.html',
  styleUrls: ['./ticket-detail.scss']
})
export class TicketDetailComponent implements OnInit {
  ticket: Ticket | null = null;
  comments: Comment[] = [];
  attachments: Attachment[] = [];
  
  loading = false;
  loadingComments = false;
  loadingAttachments = false;
  submittingComment = false;
  uploadingFile = false;
  
  currentUserId: string = '';
  commentForm!: FormGroup;

  // ========================================
  // AGENT-SPECIFIC PROPERTIES
  // ========================================
  userRole: string = '';
  isAgent: boolean = false;
  isManager: boolean = false;
  
  // Status change options for agents
  statusTransitions: { [key: string]: string[] } = {
    'OPEN': ['ASSIGNED'],
    'ASSIGNED': ['IN_PROGRESS'],
    'IN_PROGRESS': ['RESOLVED', 'ESCALATED'],
    'RESOLVED': ['CLOSED', 'REOPENED'],
    'CLOSED': ['REOPENED'],
    'REOPENED': ['IN_PROGRESS'],
    'ESCALATED': ['IN_PROGRESS', 'RESOLVED']
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.currentUserId = this.authService.getUserId() || '';
    this.userRole = this.authService.getUserRole() || 'END_USER';
    this.isAgent = this.userRole === 'SUPPORT_AGENT';
    this.isManager = this.userRole === 'SUPPORT_MANAGER';
  }

  ngOnInit(): void {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(10)]]
    });

    const ticketId = this.route.snapshot.paramMap.get('ticketId');
    if (ticketId) {
      this.loadTicket(ticketId);
      this.loadComments(ticketId);
      this.loadAttachments(ticketId);
    }
  }

  loadTicket(ticketId: string): void {
    this.loading = true;
    this.ticketService.getTicketById(ticketId).subscribe({
      next: (ticket) => {
        this.ticket = ticket;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading ticket:', error);
        this.loading = false;
        this.snackBar.open('Failed to load ticket', 'Close', { duration: 3000 });
        this.goBack();
      }
    });
  }

  loadComments(ticketId: string): void {
    this.loadingComments = true;
    this.ticketService.getComments(ticketId, false).subscribe({
      next: (comments) => {
        this.comments = comments;
        this.loadingComments = false;
      },
      error: (error) => {
        console.error('Error loading comments:', error);
        this.loadingComments = false;
      }
    });
  }

  loadAttachments(ticketId: string): void {
    this.loadingAttachments = true;
    this.ticketService.getAttachments(ticketId).subscribe({
      next: (attachments) => {
        this.attachments = attachments;
        this.loadingAttachments = false;
      },
      error: (error) => {
        console.error('Error loading attachments:', error);
        this.loadingAttachments = false;
      }
    });
  }

  addComment(): void {
    if (this.commentForm.valid && this.ticket) {
      this.submittingComment = true;
      
      const request = {
        commentText: this.commentForm.value.content,
        isInternal: false
      };

      this.ticketService.addComment(this.ticket.ticketId, request).subscribe({
        next: (comment) => {
          this.comments.push(comment);
          this.commentForm.reset();
          this.submittingComment = false;
          this.snackBar.open('Comment added successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error adding comment:', error);
          this.submittingComment = false;
          this.snackBar.open('Failed to add comment', 'Close', { duration: 3000 });
        }
      });
    }
  }

  // ========================================
  // AGENT STATUS CHANGE METHODS
  // ========================================

  changeTicketStatus(newStatus: string): void {
    if (!this.ticket) return;

    const confirmed = confirm(`Are you sure you want to change status to ${newStatus}?`);
    if (!confirmed) return;

    this.ticketService.changeTicketStatus(this.ticket.ticketId, newStatus).subscribe({
      next: (updatedTicket) => {
        this.ticket = updatedTicket;
        this.snackBar.open(`Status changed to ${newStatus}`, 'Close', { duration: 3000 });
        
        // Reload ticket to get latest data
        if (this.ticket) {
          this.loadTicket(this.ticket.ticketId);
        }

        setTimeout(() => {
          this.goBack();
        }, 1500);
      },
      error: (error) => {
        console.error('Error changing status:', error);
        this.snackBar.open('Failed to change status', 'Close', { duration: 3000 });
      }
    });
  }

  // Get available status transitions for current ticket status
  getAvailableStatusTransitions(): string[] {
    if (!this.ticket) return [];
    return this.statusTransitions[this.ticket.status] || [];
  }

  // Check if agent can change status
  canChangeStatus(): boolean {
    return (this.isAgent || this.isManager) && 
           this.ticket !== null && 
           this.getAvailableStatusTransitions().length > 0;
  }

  // Get icon for status
  getStatusIcon(status: string): string {
    switch (status) {
      case 'IN_PROGRESS': return 'play_arrow';
      case 'RESOLVED': return 'check_circle';
      case 'CLOSED': return 'lock';
      case 'REOPENED': return 'refresh';
      case 'ESCALATED': return 'trending_up';
      case 'ASSIGNED': return 'person_add';
      default: return 'arrow_forward';
    }
  }

  // ========================================
  // ESCALATION METHODS
  // ========================================

  escalateTicket(): void {
    if (!this.ticket) return;

    const dialogRef = this.dialog.open(EscalateDialogComponent, {
      width: '500px',
      data: {
        ticketNumber: this.ticket.ticketNumber,
        title: this.ticket.title
      }
    });

    dialogRef.afterClosed().subscribe(reason => {
      if (reason && this.ticket) {
        this.ticketService.escalateTicket(this.ticket.ticketId, reason).subscribe({
          next: (updatedTicket) => {
            this.ticket = updatedTicket;
            this.snackBar.open('Ticket escalated to manager successfully!', 'Close', { duration: 3000 });
            
            // Navigate back to dashboard after escalation
            setTimeout(() => {
              this.goBack();
            }, 1500);
          },
          error: (error) => {
            console.error('Error escalating ticket:', error);
            this.snackBar.open('Failed to escalate ticket', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  // Check if ticket can be escalated
  canEscalate(): boolean {
    if (!this.ticket) return false;
    
    // Can escalate if:
    // 1. Agent/Manager role
    // 2. Status is ASSIGNED or IN_PROGRESS
    // 3. Not already escalated
    const allowedStatuses = ['ASSIGNED', 'IN_PROGRESS'];
    return (this.isAgent || this.isManager) && 
           allowedStatuses.includes(this.ticket.status);
  }

  // ========================================
  // ATTACHMENT OPERATIONS
  // ========================================

  onFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file && this.ticket) {
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.snackBar.open('File is too large (max 5MB)', 'Close', { duration: 3000 });
        return;
      }

      this.uploadAttachment(file);
    }
  }

  uploadAttachment(file: File): void {
    if (!this.ticket) return;

    this.uploadingFile = true;
    this.ticketService.uploadAttachment(this.ticket.ticketId, file).subscribe({
      next: (attachment) => {
        this.attachments.push(attachment);
        this.uploadingFile = false;
        this.snackBar.open('File uploaded successfully', 'Close', { duration: 3000 });
        
        // Update ticket attachment count
        if (this.ticket) {
          this.ticket = {
            ...this.ticket,
            attachmentCount: (this.ticket.attachmentCount || 0) + 1
          };
        }
      },
      error: (error) => {
        console.error('Error uploading file:', error);
        this.uploadingFile = false;
        this.snackBar.open('Failed to upload file', 'Close', { duration: 3000 });
      }
    });
  }

  downloadAttachment(attachment: Attachment): void {
    this.ticketService.downloadAttachment(attachment.s3Url);
  }

  deleteAttachment(attachment: Attachment): void {
    if (!this.ticket) return;

    if (!confirm(`Delete ${attachment.fileName}?`)) return;

    this.ticketService.deleteAttachment(this.ticket.ticketId, attachment.attachmentId).subscribe({
      next: () => {
        this.attachments = this.attachments.filter(a => a.attachmentId !== attachment.attachmentId);
        this.snackBar.open('Attachment deleted', 'Close', { duration: 3000 });
        
        // Update ticket attachment count
        if (this.ticket) {
          this.ticket = {
            ...this.ticket,
            attachmentCount: Math.max((this.ticket.attachmentCount || 0) - 1, 0)
          };
        }
      },
      error: (error) => {
        console.error('Error deleting attachment:', error);
        this.snackBar.open('Failed to delete attachment', 'Close', { duration: 3000 });
      }
    });
  }

  canDeleteAttachment(attachment: Attachment): boolean {
    // Agents and managers can delete any attachment
    if (this.isAgent || this.isManager) return true;
    // Users can only delete their own attachments
    return attachment.uploadedByUserId === this.currentUserId;
  }

  getFileSize(bytes: number): string {
    return this.ticketService.getFileSize(bytes);
  }

  getFileIcon(fileType: string): string {
    return this.ticketService.getFileIcon(fileType);
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  getStatusColor(status: string): string {
    switch (status) {
      case 'OPEN': return 'primary';
      case 'ASSIGNED': return 'accent';
      case 'IN_PROGRESS': return 'warn';
      case 'RESOLVED': return 'primary';
      case 'CLOSED': return '';
      case 'REOPENED': return 'warn';
      case 'ESCALATED': return 'warn';
      default: return '';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'CRITICAL': return 'warn';
      case 'HIGH': return 'warn';
      case 'MEDIUM': return 'accent';
      case 'LOW': return 'primary';
      default: return '';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }

  goBack(): void {
    // Navigate based on role
    if (this.isAgent) {
      this.router.navigate(['/agent/dashboard']);
    } else if (this.isManager) {
      this.router.navigate(['/manager/dashboard']);
    } else {
      this.router.navigate(['/user/dashboard']);
    }
  }
}
