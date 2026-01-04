import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TicketService } from '../../../services/ticket.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'app-create-ticket',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './create-ticket.html',
  styleUrls: ['./create-ticket.scss']
})
export class CreateTicketComponent implements OnInit {
  ticketForm!: FormGroup;
  loading = false;
  selectedFiles: File[] = [];
  tags: string[] = [];
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  categories = [
    { value: 'TECHNICAL', label: 'Technical Issue' },
    { value: 'BILLING', label: 'Billing' },
    { value: 'ACCOUNT', label: 'Account' },
    { value: 'FEATURE_REQUEST', label: 'Feature Request' },
    { value: 'BUG_REPORT', label: 'Bug Report' },
    { value: 'OTHER', label: 'Other' }
  ];

  constructor(
    private fb: FormBuilder,
    private ticketService: TicketService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.ticketForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      category: ['', Validators.required]
    });
  }

  onFileSelect(event: any): void {
    const files = event.target.files;
    if (files) {
      // Validate file size (max 5MB per file)
      const maxSize = 5 * 1024 * 1024; // 5MB
      const validFiles: File[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > maxSize) {
          this.snackBar.open(`File ${file.name} is too large (max 5MB)`, 'Close', {
            duration: 3000
          });
        } else {
          validFiles.push(file);
        }
      }
      
      this.selectedFiles = [...this.selectedFiles, ...validFiles];
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && this.tags.length < 10) {
      this.tags.push(value);
    }
    event.chipInput!.clear();
  }

  removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  onSubmit(): void {
    if (this.ticketForm.valid) {
      this.loading = true;

      const request = {
        title: this.ticketForm.value.title,
        description: this.ticketForm.value.description,
        category: this.ticketForm.value.category,
        tags: this.tags.length > 0 ? this.tags : undefined
      };

      this.ticketService.createTicket(request, this.selectedFiles).subscribe({
        next: (ticket) => {
          this.loading = false;
          this.snackBar.open('Ticket created successfully!', 'Close', {
            duration: 3000
          });
          this.router.navigate(['/user/tickets', ticket.ticketId]);
        },
        error: (error) => {
          this.loading = false;
          console.error('Error creating ticket:', error);
          this.snackBar.open(
            error.error?.message || 'Failed to create ticket. Please try again.',
            'Close',
            { duration: 5000 }
          );
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/user/dashboard']);
  }

  getFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }
}
