import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TicketStatus } from '../../../models/ticket.model';

import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';

import { TicketService } from '../../../services/ticket.service';
import { Ticket } from '../../../models/ticket.model';
import { Comment } from '../../../models/comment.model';
import { Attachment } from '../../../models/attachement.model';

import { ReassignTicketDialogComponent } from '../dialogs/reassign-ticket-dialog.component';

@Component({
  selector: 'app-manager-ticket-detail',
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
    MatDialogModule
  ],
  templateUrl: './ticket-detail.html',
  styleUrls: ['./ticket-detail.scss']
})
export class ManagerTicketDetailComponent implements OnInit {

  ticket: Ticket | null = null;
  comments: Comment[] = [];
  attachments: Attachment[] = [];

  loading = false;
  loadingComments = false;
  loadingAttachments = false;
  submittingComment = false;

  commentForm!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(10)]]
    });

    const ticketId = this.route.snapshot.paramMap.get('ticketId');
    if (ticketId) {
      this.reloadTicket(ticketId);
      this.loadComments(ticketId);
      this.loadAttachments(ticketId);
    }
  }

  // ===============================
  // LOADERS
  // ===============================

  reloadTicket(ticketId: string): void {
    this.loading = true;
    this.ticketService.getTicketById(ticketId).subscribe({
      next: ticket => {
        this.ticket = ticket;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load ticket', 'Close', { duration: 3000 });
        this.goBack();
      }
    });
  }

  loadComments(ticketId: string): void {
    this.loadingComments = true;
    this.ticketService.getComments(ticketId, true).subscribe({
      next: comments => {
        this.comments = comments;
        this.loadingComments = false;
      },
      error: () => this.loadingComments = false
    });
  }

  loadAttachments(ticketId: string): void {
    this.loadingAttachments = true;
    this.ticketService.getAttachments(ticketId).subscribe({
      next: attachments => {
        this.attachments = attachments;
        this.loadingAttachments = false;
      },
      error: () => this.loadingAttachments = false
    });
  }

  // ===============================
  // ACTIONS
  // ===============================

  openReassignDialog(): void {
    if (!this.ticket) return;

    const ref = this.dialog.open(ReassignTicketDialogComponent, {
      width: '520px',
      data: {
        ticketId: this.ticket.ticketId,
        ticketNumber: this.ticket.ticketNumber,
        currentAgentId: this.ticket.assignedAgentId,
        currentAgentUsername: this.ticket.assignedToUsername
      }
    });

    ref.afterClosed().subscribe(result => {
      if (!result || !this.ticket) return;

      // ✅ IMMEDIATE UI UPDATE
      this.ticket = {
        ...this.ticket,
        assignedAgentId: result.agentId,
        assignedToUsername: result.agentUsername,
        status: TicketStatus.ASSIGNED
      };

      this.snackBar.open(
        `Ticket reassigned to ${result.agentUsername}`,
        'Close',
        { duration: 2000 }
      );

      // 🔄 BACKGROUND REFRESH (after cache sync)
      setTimeout(() => {
        this.reloadTicket(this.ticket!.ticketId);
      }, 1200);
    });
  }

  addComment(): void {
    if (!this.ticket || this.commentForm.invalid) return;

    this.submittingComment = true;

    this.ticketService.addComment(this.ticket.ticketId, {
      commentText: this.commentForm.value.content,
      isInternal: true
    }).subscribe({
      next: comment => {
        this.comments.push(comment);
        this.commentForm.reset();
        this.submittingComment = false;
        this.snackBar.open('Comment added', 'Close', { duration: 3000 });
      },
      error: () => {
        this.submittingComment = false;
        this.snackBar.open('Failed to add comment', 'Close', { duration: 3000 });
      }
    });
  }

  changeStatus(status: string): void {
    if (!this.ticket) return;
    if (!confirm(`Change status to ${status}?`)) return;

    this.ticketService.changeTicketStatus(this.ticket.ticketId, status).subscribe({
      next: updated => {
        this.ticket = updated;
        this.snackBar.open(`Status changed to ${status}`, 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Failed to update status', 'Close', { duration: 3000 });
      }
    });
  }

  deleteTicket(): void {
    if (!this.ticket) return;
    if (!confirm(`Delete ticket #${this.ticket.ticketNumber}?`)) return;

    this.ticketService.deleteTicket(this.ticket.ticketId).subscribe({
      next: () => {
        this.snackBar.open('Ticket deleted', 'Close', { duration: 3000 });
        this.goBack();
      },
      error: () => {
        this.snackBar.open('Failed to delete ticket', 'Close', { duration: 3000 });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/manager/dashboard']);
  }

  // ===============================
  // UI HELPERS
  // ===============================

  getStatusColor(status: string): string {
    switch (status) {
      case 'OPEN': return 'primary';
      case 'ASSIGNED': return 'accent';
      case 'IN_PROGRESS': return 'warn';
      case 'ESCALATED': return 'warn';
      case 'RESOLVED': return 'primary';
      default: return '';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'CRITICAL':
      case 'HIGH': return 'warn';
      case 'MEDIUM': return 'accent';
      case 'LOW': return 'primary';
      default: return '';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }
}
