import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-ticket-management-dialog',
  templateUrl: './ticket-management.dialog.html',
  styleUrls: ['./dialogs.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatDialogModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule,
    MatSnackBarModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class TicketManagementDialogComponent implements OnInit {

  ticket: any = null;
  activities: any[] = [];
  availableAgents: any[] = [];
  loadingTicket = true;
  loadingActivities = false;

  // Forms
  priorityForm: FormGroup;
  categoryForm: FormGroup;
  statusForm: FormGroup;
  reassignForm: FormGroup;

  // Submission states
  submittingPriority = false;
  submittingCategory = false;
  submittingStatus = false;
  submittingReassign = false;
  submittingDelete = false;

  // UI states
  showPriorityForm = false;
  showCategoryForm = false;
  showStatusForm = false;
  showReassignForm = false;

  // Activity table columns
  activityDisplayColumns: string[] = ['activityType', 'description', 'performedBy', 'createdAt'];

  priorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  categories = ['TECHNICAL_ISSUE', 'BILLING', 'FEATURE_REQUEST', 'ACCOUNT_ISSUE', 'OTHER'];
  statuses = ['OPEN', 'ASSIGNED', 'ESCALATED', 'RESOLVED', 'CLOSED'];

  constructor(
    private dialogRef: MatDialogRef<TicketManagementDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private adminService: AdminService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.priorityForm = this.fb.group({
      priority: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(5)]]
    });

    this.categoryForm = this.fb.group({
      category: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(5)]]
    });

    this.statusForm = this.fb.group({
      status: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(5)]]
    });

    this.reassignForm = this.fb.group({
      agentId: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  ngOnInit(): void {
    this.loadTicketDetails();
    this.loadAvailableAgents();
  }

  /**
   * Load ticket details
   */
  loadTicketDetails(): void {
    this.loadingTicket = true;
    this.adminService.getTicketById(this.data.ticketId)
      .subscribe({
        next: (ticket: any) => {
          this.ticket = ticket;
          this.loadingTicket = false;
          this.loadActivities();
        },
        error: (err: any) => {
          console.error('Failed to load ticket:', err);
          this.snackBar.open('Failed to load ticket details', 'Close', { duration: 3000 });
          this.loadingTicket = false;
        }
      });
  }

  /**
   * Load ticket activities
   */
  loadActivities(): void {
    this.loadingActivities = true;
    this.adminService.getTicketActivities(this.data.ticketId)
      .subscribe({
        next: (activities: any[]) => {
          this.activities = activities || [];
          this.loadingActivities = false;
        },
        error: (err: any) => {
          console.error('Failed to load activities:', err);
          this.activities = [];
          this.loadingActivities = false;
        }
      });
  }

  /**
   * Load available agents for reassignment
   */
  loadAvailableAgents(): void {
    this.adminService.getAvailableAgents()
      .subscribe({
        next: (agents: any[]) => {
          this.availableAgents = agents || [];
        },
        error: (err: any) => {
          console.error('Failed to load agents:', err);
          this.availableAgents = [];
        }
      });
  }

  // ==================== PRIORITY OPERATIONS ====================

  togglePriorityForm(): void {
    this.showPriorityForm = !this.showPriorityForm;
    if (this.showPriorityForm && this.ticket?.priority) {
      this.priorityForm.patchValue({ priority: this.ticket.priority });
    }
  }

  changePriority(): void {
    if (!this.priorityForm.valid) return;

    this.submittingPriority = true;
    const { priority, reason } = this.priorityForm.value;

    this.adminService.changeTicketPriority(this.ticket.ticketId, priority, reason)
      .subscribe({
        next: (updatedTicket: any) => {
          this.ticket = updatedTicket;
          this.showPriorityForm = false;
          this.priorityForm.reset();
          this.submittingPriority = false;
          this.snackBar.open('Priority updated successfully', 'Close', { duration: 3000 });
          this.loadActivities();
        },
        error: (err: any) => {
          console.error('Failed to change priority:', err);
          this.snackBar.open('Failed to change priority', 'Close', { duration: 3000 });
          this.submittingPriority = false;
        }
      });
  }

  // ==================== CATEGORY OPERATIONS ====================

  toggleCategoryForm(): void {
    this.showCategoryForm = !this.showCategoryForm;
    if (this.showCategoryForm && this.ticket?.category) {
      this.categoryForm.patchValue({ category: this.ticket.category });
    }
  }

  changeCategory(): void {
    if (!this.categoryForm.valid) return;

    this.submittingCategory = true;
    const { category, reason } = this.categoryForm.value;

    this.adminService.changeTicketCategory(this.ticket.ticketId, category, reason)
      .subscribe({
        next: (updatedTicket: any) => {
          this.ticket = updatedTicket;
          this.showCategoryForm = false;
          this.categoryForm.reset();
          this.submittingCategory = false;
          this.snackBar.open('Category updated successfully', 'Close', { duration: 3000 });
          this.loadActivities();
        },
        error: (err: any) => {
          console.error('Failed to change category:', err);
          this.snackBar.open('Failed to change category', 'Close', { duration: 3000 });
          this.submittingCategory = false;
        }
      });
  }

  // ==================== STATUS OPERATIONS ====================

  toggleStatusForm(): void {
    this.showStatusForm = !this.showStatusForm;
    if (this.showStatusForm && this.ticket?.status) {
      this.statusForm.patchValue({ status: this.ticket.status });
    }
  }

  changeStatus(): void {
    if (!this.statusForm.valid) return;

    this.submittingStatus = true;
    const { status, reason } = this.statusForm.value;

    this.adminService.changeTicketStatus(this.ticket.ticketId, status, reason)
      .subscribe({
        next: (updatedTicket: any) => {
          this.ticket = updatedTicket;
          this.showStatusForm = false;
          this.statusForm.reset();
          this.submittingStatus = false;
          this.snackBar.open('Status updated successfully', 'Close', { duration: 3000 });
          this.loadActivities();
        },
        error: (err: any) => {
          console.error('Failed to change status:', err);
          this.snackBar.open('Failed to change status', 'Close', { duration: 3000 });
          this.submittingStatus = false;
        }
      });
  }

  // ==================== REASSIGNMENT OPERATIONS ====================

  toggleReassignForm(): void {
    this.showReassignForm = !this.showReassignForm;
  }

  reassignTicket(): void {
  if (!this.reassignForm.valid) return;

  this.submittingReassign = true;
  const { agentId,reason } = this.reassignForm.value;

  // Step 1: Get the assignment ID from the ticket
  this.adminService.getAssignmentByTicketId(this.ticket.ticketId)
    .subscribe({
      next: (assignment: any) => {
        if (!assignment || !assignment.assignmentId) {
          this.snackBar.open('No assignment found for this ticket', 'Close', { duration: 3000 });
          this.submittingReassign = false;
          return;
        }

        // Step 2: Now reassign using the assignment ID
        this.adminService.reassignTicket(assignment.assignmentId, agentId, reason)
          .subscribe({
            next: (updatedAssignment: any) => {
              this.ticket.assignedTo = updatedAssignment.agentName || updatedAssignment.agentId;
              this.showReassignForm = false;
              this.reassignForm.reset();
              this.submittingReassign = false;
              this.snackBar.open('Ticket reassigned successfully', 'Close', { duration: 3000 });
              this.loadActivities();
              this.loadTicketDetails();
            },
            error: (err: any) => {
              console.error('Failed to reassign ticket:', err);
              this.snackBar.open('Failed to reassign ticket', 'Close', { duration: 3000 });
              this.submittingReassign = false;
            }
          });
      },
      error: (err: any) => {
        console.error('Failed to get assignment:', err);
        this.snackBar.open('Failed to get assignment details', 'Close', { duration: 3000 });
        this.submittingReassign = false;
      }
    });
}


  // ==================== DELETE OPERATIONS ====================

  deleteTicket(hardDelete: boolean = false): void {
    if (!confirm(`Are you sure you want to ${hardDelete ? 'permanently delete' : 'close'} this ticket?`)) {
      return;
    }

    this.submittingDelete = true;
    this.adminService.deleteTicket(this.ticket.ticketId, hardDelete)
      .subscribe({
        next: () => {
          this.submittingDelete = false;
          this.snackBar.open('Ticket deleted successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err: any) => {
          console.error('Failed to delete ticket:', err);
          this.snackBar.open('Failed to delete ticket', 'Close', { duration: 3000 });
          this.submittingDelete = false;
        }
      });
  }

  // ==================== HELPER METHODS ====================

  getPriorityColor(priority: string): string {
    const colors: { [key: string]: string } = {
      'CRITICAL': '#e53935',
      'HIGH': '#fb8c00',
      'MEDIUM': '#fdd835',
      'LOW': '#43a047'
    };
    return colors[priority] || '#757575';
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'OPEN': '#e53935',
      'ASSIGNED': '#fb8c00',
      'ESCALATED': '#ff6f00',
      'RESOLVED': '#43a047',
      'CLOSED': '#757575'
    };
    return colors[status] || '#757575';
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}