import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AgentService, Assignment, SLAWarning, AgentStats } from '../../../services/agent.services';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatBadgeModule,
    MatMenuModule,
    MatSnackBarModule,
    MatDialogModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class AgentDashboardComponent implements OnInit {
  assignments: Assignment[] = [];
  filteredAssignments: Assignment[] = [];
  slaWarnings: SLAWarning[] = [];
  stats: AgentStats | null = null;
  
  loading = false;
  loadingStats = false;
  loadingSLA = false;
  
  username: string = '';
  selectedTab = 0;
  filterStatus: string = 'ALL';

  statusOptions = [
    { value: 'ALL', label: 'All Tickets' },
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'ESCALATED', label: 'Escalated' }
  ];

  constructor(
    private agentService: AgentService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.username = this.authService.getUsername() || 'Agent';
  }

  ngOnInit(): void {
    this.loadAssignments();
    this.loadStats();
    this.loadSLAWarnings();
  }

  loadAssignments(): void {
    this.loading = true;
    this.agentService.getMyAssignments().subscribe({
      next: (assignments) => {
        this.assignments = assignments;
        this.applyFilter();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading assignments:', error);
        this.loading = false;
        this.snackBar.open('Failed to load assignments', 'Close', { duration: 3000 });
      }
    });
  }

  loadStats(): void {
    this.loadingStats = true;
    this.agentService.getAgentStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loadingStats = false;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.loadingStats = false;
      }
    });
  }

  loadSLAWarnings(): void {
    this.loadingSLA = true;
    this.agentService.getSLAWarnings().subscribe({
      next: (warnings) => {
        this.slaWarnings = warnings;
        this.loadingSLA = false;
      },
      error: (error) => {
        console.error('Error loading SLA warnings:', error);
        this.loadingSLA = false;
      }
    });
  }

  applyFilter(): void {
    if (this.filterStatus === 'ALL') {
      this.filteredAssignments = [...this.assignments];
    } else {
      this.filteredAssignments = this.assignments.filter(
        a => a.ticketStatus === this.filterStatus
      );
    }
  }

  onFilterChange(): void {
    this.applyFilter();
  }

  viewTicket(ticketId: string): void {
    this.router.navigate(['/agent/tickets', ticketId]);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'OPEN': return 'primary';
      case 'ASSIGNED': return 'accent';
      case 'IN_PROGRESS': return 'warn';
      case 'RESOLVED': return 'primary';
      case 'CLOSED': return '';
      case 'ESCALATED': return 'warn';
      default: return '';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'CRITICAL': return 'warn';
      case 'HIGH': return 'warn';
      case 'MEDIUM': return 'accent';
      case 'LOW': return 'primary';
      default: return '';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }

  formatTimeRemaining(minutes: number): string {
    return this.agentService.formatTimeRemaining(minutes);
  }

  getSLAColor(minutes: number): string {
    return this.agentService.getSLAColor(minutes);
  }

  logout(): void {
    this.authService.logout();
  }
}
