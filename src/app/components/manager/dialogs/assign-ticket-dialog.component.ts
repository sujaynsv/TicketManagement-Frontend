import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ManagerService, AgentUser } from '../../../services/manager.service';

@Component({
  selector: 'app-assign-ticket-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './assign-ticket-dialog.html',
  styleUrls: ['./assign-ticket-dialog.scss']
})
export class AssignTicketDialogComponent implements OnInit {

  agents: AgentUser[] = [];
  priorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  form!: FormGroup;
  loading = false;

  constructor(
    private dialogRef: MatDialogRef<AssignTicketDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public ticket: any,
    private managerService: ManagerService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      agentId: ['', Validators.required],
      priority: [this.ticket.priority || 'MEDIUM', Validators.required],
      assignmentNotes: ['Assigned by manager', Validators.required]
    });

    this.managerService.getAgentsWithWorkload()
      .subscribe(agents => this.agents = agents);
  }

  canAssign(agent: AgentUser): boolean {
    return agent.status === 'AVAILABLE';
  }

  assign(): void {
    if (this.form.invalid) return;

    this.loading = true;

    this.managerService.manualAssign({
      ticketId: this.ticket.ticketId,
      agentId: this.form.value.agentId,
      priority: this.form.value.priority,
      assignmentNotes: this.form.value.assignmentNotes
    }).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => this.loading = false
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
