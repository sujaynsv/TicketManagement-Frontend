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
import { TicketService } from '../../../services/ticket.service';
import { AuthService } from '../../../services/auth.service';
import { Ticket } from '../../../models/ticket.model';
import { Comment } from '../../../models/comment.model';
import { Attachment } from '../../../models/attachement.model';


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
    MatMenuModule
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.currentUserId = this.authService.getUserId() || '';
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
        this.router.navigate(['/user/dashboard']);
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
      case 'RESOLVED': return 'success';
      case 'CLOSED': return 'default';
      default: return 'default';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'CRITICAL': return 'warn';
      case 'HIGH': return 'warn';
      case 'MEDIUM': return 'accent';
      case 'LOW': return 'primary';
      default: return 'default';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }

  goBack(): void {
    this.router.navigate(['/user/dashboard']);
  }
}
