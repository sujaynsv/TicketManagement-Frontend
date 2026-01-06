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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
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
    MatProgressSpinnerModule,
    MatSnackBarModule
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
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<UserManagementDialog>,
    @Inject(MAT_DIALOG_DATA) public data: UserDialogData
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadFormData();
  }

  /**
   * Initialize empty form
   */
  private initializeForm(): void {
    this.form = this.fb.group({});
  }

  /**
   * Load form fields based on action type
   */
  private loadFormData(): void {
    switch (this.data.action) {
      case 'edit':
        this.form = this.fb.group({
          firstName: [
            this.data.user.firstName,
            [Validators.required, Validators.minLength(2)]
          ],
          lastName: [
            this.data.user.lastName,
            [Validators.required, Validators.minLength(2)]
          ],
          email: [
            this.data.user.email,
            [Validators.required, Validators.email]
          ]
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
          newPassword: [
            '',
            [Validators.required, Validators.minLength(6)]
          ]
        });
        break;

      case 'activate':
      case 'deactivate':
        this.form = this.fb.group({});
        break;
    }
  }

  /**
   * Get dialog title based on action
   */
  getDialogTitle(): string {
    const titleMap: { [key: string]: string } = {
      'edit': `Edit User: ${this.data.user.username}`,
      'role': `Change Role: ${this.data.user.username}`,
      'activate': `Activate User: ${this.data.user.username}`,
      'deactivate': `Deactivate User: ${this.data.user.username}`,
      'manager': `Assign Manager: ${this.data.user.username}`,
      'password': `Reset Password: ${this.data.user.username}`
    };
    return titleMap[this.data.action] || 'User Management';
  }

  /**
   * Get confirmation message for activate/deactivate
   */
  getConfirmMessage(): string {
    const confirmMap: { [key: string]: string } = {
      'activate': `Activating ${this.data.user.username} will restore their account access. This action can be reversed.`,
      'deactivate': `Deactivating ${this.data.user.username} will restrict their account access. They won't be able to log in.`
    };
    return confirmMap[this.data.action] || '';
  }

  /**
   * Get form field error message
   */
  getErrorMessage(fieldName: string): string | null {
    const control = this.form.get(fieldName);
    if (!control || !control.errors || !control.touched) {
      return null;
    }

    const errors = control.errors;
    if (errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
    if (errors['email']) return 'Please enter a valid email';
    if (errors['minlength']) {
      const minLength = errors['minlength'].requiredLength;
      return `${this.getFieldLabel(fieldName)} must be at least ${minLength} characters`;
    }

    return null;
  }

  /**
   * Get human-readable field label
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'firstName': 'First Name',
      'lastName': 'Last Name',
      'email': 'Email',
      'role': 'Role',
      'managerId': 'Manager',
      'newPassword': 'Password'
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Mark all form fields as touched to show validation errors
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    // Validate form if not a confirmation action
    if (
      this.data.action !== 'activate' &&
      this.data.action !== 'deactivate'
    ) {
      if (this.form.invalid) {
        this.markFormGroupTouched(this.form);
        this.showError('Please fix all errors before submitting');
        return;
      }
    }

    this.loading = true;
    let request$: any;

    // Build the appropriate API request based on action
    switch (this.data.action) {
      case 'edit':
        request$ = this.adminService.updateUser(this.data.user.userId, {
          firstName: this.form.get('firstName')?.value,
          lastName: this.form.get('lastName')?.value,
          email: this.form.get('email')?.value
        });
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

    // Execute API request
    request$.subscribe({
      next: (result: any) => {
        this.loading = false;
        this.handleSuccess();
      },
      error: (err: any) => {
        this.loading = false;
        this.handleError(err);
      }
    });
  }

  /**
   * Handle successful operation
   */
  private handleSuccess(): void {
    const actionMessages: { [key: string]: string } = {
      'edit': 'User updated successfully',
      'role': 'User role changed successfully',
      'activate': 'User activated successfully',
      'deactivate': 'User deactivated successfully',
      'manager': 'Manager assigned successfully',
      'password': 'Password reset successfully'
    };

    const message = actionMessages[this.data.action] || 'Operation completed';
    this.showSuccess(message);

    // Close dialog with success flag
    this.dialogRef.close({ success: true, action: this.data.action });
  }

  /**
   * Handle failed operation
   */
  private handleError(err: any): void {
    const errorMessage = err?.error?.message || 'An error occurred. Please try again.';
    this.showError(errorMessage);
    console.error('User management error:', err);
  }

  /**
   * Show success notification
   */
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-success']
    });
  }

  /**
   * Show error notification
   */
  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-error']
    });
  }

  /**
   * Cancel dialog
   */
  onCancel(): void {
    this.dialogRef.close();
  }

  /**
   * Check if action is confirmation type
   */
  isConfirmAction(): boolean {
    return this.data.action === 'activate' || this.data.action === 'deactivate';
  }

  /**
   * Get icon color for confirmation actions
   */
  getConfirmIconColor(): string {
    return this.data.action === 'activate' ? '#4caf50' : '#f44336';
  }

  /**
   * Get confirmation icon
   */
  getConfirmIcon(): string {
    return this.data.action === 'activate' ? 'check_circle' : 'block';
  }

  /**
 * Get title icon based on action
 */
getTitleIcon(): string {
  const iconMap: { [key: string]: string } = {
    'edit': 'edit',
    'role': 'security',
    'activate': 'check_circle',
    'deactivate': 'block',
    'manager': 'supervised_user_circle',
    'password': 'vpn_key'
  };
  return iconMap[this.data.action] || 'info';
}

/**
 * Get submit button text
 */
getSubmitButtonText(): string {
  const buttonTextMap: { [key: string]: string } = {
    'edit': 'Update User',
    'role': 'Change Role',
    'activate': 'Activate User',
    'deactivate': 'Deactivate User',
    'manager': 'Assign Manager',
    'password': 'Reset Password'
  };
  return buttonTextMap[this.data.action] || 'Submit';
}

/**
 * Get role display name (user-friendly)
 */
getRoleDisplayName(role: string): string {
  const roleNames: { [key: string]: string } = {
    'ADMIN': 'Administrator',
    'SUPPORT_MANAGER': 'Support Manager',
    'SUPPORT_AGENT': 'Support Agent',
    'END_USER': 'End User'
  };
  return roleNames[role] || role;
}

/**
 * Get role description
 */
getRoleDescription(role: string): string {
  const descriptions: { [key: string]: string } = {
    'ADMIN': 'Full system access. Can manage users, agents, and view all reports.',
    'SUPPORT_MANAGER': 'Can manage support agents and view team performance metrics.',
    'SUPPORT_AGENT': 'Can view and respond to customer tickets.',
    'END_USER': 'Can create tickets and view their own ticket history.'
  };
  return descriptions[role] || '';
}

}