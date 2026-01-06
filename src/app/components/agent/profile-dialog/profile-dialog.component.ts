import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { last } from 'rxjs';

export interface ProfileDialogData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

@Component({
  selector: 'app-profile-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './profile-dialog.component.html',
  styleUrls: ['./profile-dialog.component.scss']
})
export class ProfileDialogComponent {
  username: string;
  email: string;
  firstName: string;
  lastName: string;


  constructor(
    @Inject(MAT_DIALOG_DATA) data: ProfileDialogData,
    private dialogRef: MatDialogRef<ProfileDialogComponent>
  ) {
    this.username = data.username;
    this.email = data.email;
    this.firstName=data.firstName;
    this.lastName=data.lastName;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close({
      username: this.username,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName
    });
  }
}
