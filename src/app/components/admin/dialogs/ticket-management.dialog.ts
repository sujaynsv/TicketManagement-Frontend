import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AdminService } from '../../../services/admin.service';
import { MatChipsModule } from '@angular/material/chips';


export interface TicketDialogData {
  ticket: any;
  action: 'priority' | 'category' | 'status' | 'delete';
}

@Component({
  selector: 'app-ticket-management-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatChipsModule
  ],
  templateUrl: './ticket-management.dialog.html',
  styleUrls: ['./dialogs.scss']
})
export class TicketManagementDialog implements OnInit {
  
  form!: FormGroup;
  loading = false;
  
  priorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  categories = ['TECHNICAL_ISSUE', 'FEATURE_REQUEST', 'BUG_REPORT', 'DOCUMENTATION', 'OTHERS'];
  statuses = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
  
  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    public dialogRef: MatDialogRef<TicketManagementDialog>,
    @Inject(MAT_DIALOG_DATA) public data: TicketDialogData
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadForm();
  }

  private initializeForm(): void {
    this.form = this.fb.group({});
  }

  private loadForm(): void {
    switch (this.data.action) {
      case 'priority':
        this.form = this.fb.group({
          priority: [this.data.ticket.priority, Validators.required],
          reason: ['', [Validators.required, Validators.minLength(5)]]
        });
        break;
      case 'category':
        this.form = this.fb.group({
          category: [this.data.ticket.category, Validators.required],
          reason: ['', [Validators.required, Validators.minLength(5)]]
        });
        break;
      case 'status':
        this.form = this.fb.group({
          status: [this.data.ticket.status, Validators.required],
          reason: ['', [Validators.required, Validators.minLength(5)]]
        });
        break;
      case 'delete':
        this.form = this.fb.group({
          hardDelete: [false],
          reason: ['', [Validators.required, Validators.minLength(5)]]
        });
        break;
    }
  }

  getDialogTitle(): string {
    switch (this.data.action) {
      case 'priority': return `Change Priority: ${this.data.ticket.ticketNumber}`;
      case 'category': return `Change Category: ${this.data.ticket.ticketNumber}`;
      case 'status': return `Change Status: ${this.data.ticket.ticketNumber}`;
      case 'delete': return `Delete Ticket: ${this.data.ticket.ticketNumber}`;
      default: return 'Ticket Management';
    }
  }

  getWarningMessage(): string {
    switch (this.data.action) {
      case 'delete': return this.form.get('hardDelete')?.value 
        ? '⚠️ HARD DELETE: This action cannot be undone. The ticket will be permanently deleted from the database.'
        : 'ℹ️ SOFT DELETE: Ticket will be marked as CLOSED and moved to archives.';
      default: return '';
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      alert('Please fill all required fields correctly');
      return;
    }

    this.loading = true;
    let request$: any;

    switch (this.data.action) {
      case 'priority':
        request$ = this.adminService.changeTicketPriority(
          this.data.ticket.ticketId,
          this.form.get('priority')?.value,
          this.form.get('reason')?.value
        );
        break;
      case 'category':
        request$ = this.adminService.changeTicketCategory(
          this.data.ticket.ticketId,
          this.form.get('category')?.value,
          this.form.get('reason')?.value
        );
        break;
      case 'status':
        request$ = this.adminService.changeTicketStatus(
          this.data.ticket.ticketId,
          this.form.get('status')?.value,
          this.form.get('reason')?.value
        );
        break;
      case 'delete':
        request$ = this.adminService.deleteTicket(
          this.data.ticket.ticketId,
          this.form.get('hardDelete')?.value
        );
        break;
    }

    request$.subscribe({
      next: (result: any) => {
        this.loading = false;
        alert(`✅ Ticket ${this.data.action} successful!`);
        this.dialogRef.close(result);
      },
      error: (err: { error: { message: any; }; }) => {
        this.loading = false;
        alert(`❌ Error: ${err.error?.message || 'Failed to update ticket'}`);
        console.error(err);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
    getPriorityColor(priority: string): string {
    switch (priority) {
      case 'CRITICAL': return '#c62828';
      case 'HIGH': return '#ff6f00';
      case 'MEDIUM': return '#fbc02d';
      case 'LOW': return '#2e7d32';
      default: return '#757575';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'OPEN': return '#2196f3';
      case 'ASSIGNED': return '#9c27b0';
      case 'IN_PROGRESS': return '#ff9800';
      case 'RESOLVED': return '#4caf50';
      case 'CLOSED': return '#757575';
      default: return '#757575';
    }
  }

}
