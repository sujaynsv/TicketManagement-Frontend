import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ManagerService, AgentUser } from '../../../services/manager.service';

@Component({
  selector: 'app-reassign-ticket-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './reassign-ticket-dialog.html',
  styleUrls: ['./reassign-ticket-dialog.scss']
})
export class ReassignTicketDialogComponent implements OnInit {

  agents: AgentUser[] = [];
  form!: FormGroup;
  loading = false;

  constructor(
    private dialogRef: MatDialogRef<ReassignTicketDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      ticketId: string;
      ticketNumber: string;
      currentAgentId: string;
      currentAgentUsername: string;
    },
    private managerService: ManagerService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      newAgentId: ['', Validators.required]
    });

    this.managerService.getAgentsWithWorkload()
      .subscribe(agents => this.agents = agents.filter(
        a=>a.agentId!==this.data.currentAgentId
      ));
  }


reassign(): void {
  if (this.form.invalid) return;

  this.loading = true;

  const selectedAgent = this.agents.find(
    a => a.agentId === this.form.value.newAgentId
  );

  this.managerService.reassignTicket({
    ticketId: this.data.ticketId,
    newAgentId: this.form.value.newAgentId
  }).subscribe({
    next: () => {
      this.dialogRef.close({
        agentId: selectedAgent?.agentId,
        agentUsername: selectedAgent?.agentUsername
      });
    },
    error: () => this.loading = false
  });
}


  cancel(): void {
    this.dialogRef.close(false);
  }
}
