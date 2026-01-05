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
import { AdminService } from '../../../services/admin.service';

export interface UserDialogData {
  user: any;
  action: 'edit' | 'role' | 'activate' | 'deactivate' | 'manager' | 'password';
  managers?: any[];
}

@Component({
  selector: 'app-user-management-dialog',
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
    MatProgressSpinnerModule
  ],
  templateUrl: './user-management.dialog.html',
  styleUrls: ['./dialogs.scss']
})
export class UserManagementDialog implements OnInit {

  form!: FormGroup;
  loading = false;
  roles = ['ADMIN', 'SUPPORT_MANAGER', 'SUPPORT_AGENT', 'END_USER'];

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    public dialogRef: MatDialogRef<UserManagementDialog>,
    @Inject(MAT_DIALOG_DATA) public data: UserDialogData
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadFormData();
  }

  private initializeForm(): void {
    this.form = this.fb.group({});
  }

  private loadFormData(): void {
    switch (this.data.action) {
      case 'edit':
        this.form = this.fb.group({
          firstName: [this.data.user.firstName, [Validators.required, Validators.minLength(2)]],
          lastName: [this.data.user.lastName, [Validators.required, Validators.minLength(2)]],
          email: [this.data.user.email, [Validators.required, Validators.email]]
        });
        break;
      case 'role':
        this.form = this.fb.group({
          role: [this.data.user.role, Validators.required]
        });
        break;
      case 'manager':
        this.form = this.fb.group({
          managerId: ['', Validators.required]
        });
        break;
      case 'password':
        this.form = this.fb.group({
          newPassword: ['', [Validators.required, Validators.minLength(6)]]
        });
        break;
      case 'activate':
      case 'deactivate':
        this.form = this.fb.group({});
        break;
    }
  }

  getDialogTitle(): string {
    switch (this.data.action) {
      case 'edit': return `Edit User: ${this.data.user.username}`;
      case 'role': return `Change Role: ${this.data.user.username}`;
      case 'activate': return `Activate User: ${this.data.user.username}`;
      case 'deactivate': return `Deactivate User: ${this.data.user.username}`;
      case 'manager': return `Assign Manager: ${this.data.user.username}`;
      case 'password': return `Reset Password: ${this.data.user.username}`;
      default: return 'User Management';
    }
  }

  getConfirmMessage(): string {
    switch (this.data.action) {
      case 'activate': return `Are you sure you want to activate ${this.data.user.username}?`;
      case 'deactivate': return `Are you sure you want to deactivate ${this.data.user.username}?`;
      default: return '';
    }
  }

  onSubmit(): void {
    if (this.form.invalid && (this.data.action !== 'activate' && this.data.action !== 'deactivate')) {
      alert('Please fill all required fields correctly');
      return;
    }

    this.loading = true;
    let request$: any;

    switch (this.data.action) {
      case 'edit':
        request$ = this.adminService.updateUser(
          this.data.user.userId,
          {
            firstName: this.form.get('firstName')?.value,
            lastName: this.form.get('lastName')?.value,
            email: this.form.get('email')?.value
          }
        );
        break;
      case 'role':
        request$ = this.adminService.changeUserRole(
          this.data.user.userId,
          this.form.get('role')?.value
        );
        break;
      case 'activate':
        request$ = this.adminService.activateUser(this.data.user.userId);
        break;
      case 'deactivate':
        request$ = this.adminService.deactivateUser(this.data.user.userId);
        break;
      case 'manager':
        request$ = this.adminService.assignManager(
          this.data.user.userId,
          this.form.get('managerId')?.value
        );
        break;
      case 'password':
        request$ = this.adminService.resetPassword(
          this.data.user.userId,
          this.form.get('newPassword')?.value
        );
        break;
    }

    request$.subscribe({
      next: (result: any) => {
        this.loading = false;
        alert(`✅ User ${this.data.action} successful!`);
        this.dialogRef.close(result);
      },
      error: (err: { error: { message: any; }; }) => {
        this.loading = false;
        alert(`❌ Error: ${err.error?.message || 'Failed to update user'}`);
        console.error(err);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
