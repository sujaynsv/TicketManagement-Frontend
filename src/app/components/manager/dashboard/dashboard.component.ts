import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { TicketService } from '../../../services/ticket.service';
import { ManagerService, SLAItem } from '../../../services/manager.service';
import { AuthService } from '../../../services/auth.service';
import { Ticket } from '../../../models/ticket.model';
import { AssignTicketDialogComponent } from '../dialogs/assign-ticket-dialog.component';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatTabsModule,
    MatDialogModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class ManagerDashboardComponent implements OnInit {

  // ==========================
  // DATA
  // ==========================
  allTickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];


  unassignedTickets: any[] = [];
  escalatedTickets: Ticket[] = [];

  slaWarnings: SLAItem[] = [];
  slaBreaches: SLAItem[] = [];

  loading = false;
  username = '';

  // ==========================
  // FILTERS
  // ==========================
  selectedStatus = 'ALL';
  searchQuery = '';
  sortBy = 'newest';

  statusOptions = [
    { value: 'ALL', label: 'All' },
    { value: 'OPEN', label: 'Open' },
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'ESCALATED', label: 'Escalated' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'CLOSED', label: 'Closed' }
  ];

  sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'priority', label: 'Priority' }
  ];

  constructor(
    private ticketService: TicketService,
    private managerService: ManagerService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.username = this.authService.getUsername() || 'Manager';
  }

  ngOnInit(): void {
    this.refreshAll();
  }

  // ==========================
  // LOADERS
  // ==========================
  refreshAll(): void {
    this.loading = true;

    this.ticketService.getAllTickets().subscribe({
      next: tickets => {
        this.allTickets = tickets;
        this.escalatedTickets = tickets.filter(t => t.status === 'ESCALATED');
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load tickets', 'Close', { duration: 3000 });
      }
    });

    this.managerService.getUnassignedTickets()
      .subscribe(t => this.unassignedTickets = t);

    this.managerService.getSLAWarnings()
      .subscribe(w => this.slaWarnings = w);

    this.managerService.getSLABreaches()
      .subscribe(b => this.slaBreaches = b);
  }

  // ==========================
  // FILTER / SORT
  // ==========================
  applyFilters(): void {
    let filtered = [...this.allTickets];

    if (this.selectedStatus !== 'ALL') {
      filtered = filtered.filter(t => t.status === this.selectedStatus);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.ticketNumber.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    }

    this.filteredTickets = this.sortTickets(filtered);
  }

  sortTickets(tickets: Ticket[]): Ticket[] {
    const priorityOrder: any = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };

    switch (this.sortBy) {
      case 'newest':
        return tickets.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'oldest':
        return tickets.sort((a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case 'priority':
        return tickets.sort((a, b) =>
          (priorityOrder[a.priority || 'LOW'] || 5) -
          (priorityOrder[b.priority || 'LOW'] || 5)
        );
      default:
        return tickets;
    }
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  // ==========================
  // ACTIONS
  // ==========================
  viewTicket(ticketId: string): void {
    this.router.navigate(['/manager/tickets', ticketId]);
  }

  assign(ticket: any): void {
    const ref = this.dialog.open(AssignTicketDialogComponent, {
      width: '500px',
      data: ticket
    });

    ref.afterClosed().subscribe(done => {
      if (done) {
        this.snackBar.open('Ticket assigned successfully', 'Close', { duration: 3000 });
        this.refreshAll();
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  // ==========================
  // UI HELPERS
  // ==========================
  getStatusColor(status: string): string {
    switch (status) {
      case 'OPEN': return 'primary';
      case 'ASSIGNED': return 'accent';
      case 'IN_PROGRESS': return 'warn';
      case 'ESCALATED': return 'warn';
      case 'RESOLVED': return 'primary';
      default: return '';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'CRITICAL':
      case 'HIGH': return 'warn';
      case 'MEDIUM': return 'accent';
      case 'LOW': return 'primary';
      default: return '';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }

  formatMinutes(minutes: number): string {
    if (minutes < 0) return 'Overdue';
    if (minutes < 60) return `${minutes} mins`;
    return `${Math.floor(minutes / 60)} hrs`;
  }
}
