import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon'; //  ADD THIS

export interface EscalateDialogData {
  ticketNumber: string;
  title: string;
}

@Component({
  selector: 'app-escalate-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule //  ADD THIS
  ],
  templateUrl: './escalate-dialog.html',
  styleUrls: ['./escalate-dialog.scss']
})
export class EscalateDialogComponent {
  escalateForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EscalateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EscalateDialogData
  ) {
    this.escalateForm = this.fb.group({
      reason: ['', [Validators.required, Validators.minLength(20)]]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onEscalate(): void {
    if (this.escalateForm.valid) {
      this.dialogRef.close(this.escalateForm.value.reason);
    }
  }
}
