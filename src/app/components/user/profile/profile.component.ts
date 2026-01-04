import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { UserService, User } from '../../../services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatChipsModule
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  profileForm!: FormGroup;
  loading = false;
  updating = false;
  editMode = false;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      department: ['']
    });

    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
        this.profileForm.patchValue({
          name: user.name,
          email: user.email,
        });
        this.profileForm.disable();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.loading = false;
        this.snackBar.open('Failed to load profile', 'Close', { duration: 3000 });
      }
    });
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    
    if (this.editMode) {
      this.profileForm.enable();
    } else {
      this.profileForm.disable();
      // Reset to original values
      if (this.user) {
        this.profileForm.patchValue({
          name: this.user.name,
          email: this.user.email,
        });
      }
    }
  }

  updateProfile(): void {
    if (this.profileForm.valid) {
      this.updating = true;

      const request = {
        name: this.profileForm.value.name,
        email: this.profileForm.value.email,
        phone: this.profileForm.value.phone || undefined,
        department: this.profileForm.value.department || undefined
      };

      this.userService.updateProfile(request).subscribe({
        next: (user) => {
          this.user = user;
          this.updating = false;
          this.editMode = false;
          this.profileForm.disable();
          this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.updating = false;
          this.snackBar.open(
            error.error?.message || 'Failed to update profile',
            'Close',
            { duration: 3000 }
          );
        }
      });
    }
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  }

  goBack(): void {
    this.router.navigate(['/user/dashboard']);
  }
}
