import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { TicketService } from '../../../services/ticket.service';
import { AuthService } from '../../../services/auth.service';
import { Ticket } from '../../../models/ticket.model';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatMenuModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class UserDashboardComponent implements OnInit {
  tickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];
  loading = false;
  username: string = '';
  
  // Filters
  selectedStatus: string = 'ALL';
  searchQuery: string = '';
  startDate: Date | null = null;
  endDate: Date | null = null;
  sortBy: string = 'newest';
  
  statusOptions = [
    { value: 'ALL', label: 'All Tickets' },
    { value: 'OPEN', label: 'Open' },
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
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
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.username = this.authService.getUsername() || 'User';
  }

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.loading = true;
    this.ticketService.getMyTickets().subscribe({
      next: (tickets) => {
        this.tickets = tickets;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tickets:', error);
        this.loading = false;
        this.snackBar.open('Failed to load tickets', 'Close', { duration: 3000 });
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.tickets];

    // Filter by status
    if (this.selectedStatus !== 'ALL') {
      filtered = filtered.filter(ticket => ticket.status === this.selectedStatus);
    }

    // Filter by search query (title or ticket number)
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(ticket => 
        ticket.title.toLowerCase().includes(query) ||
        ticket.ticketNumber.toLowerCase().includes(query) ||
        ticket.description.toLowerCase().includes(query)
      );
    }

    // Filter by date range
    if (this.startDate) {
      filtered = filtered.filter(ticket => 
        new Date(ticket.createdAt) >= this.startDate!
      );
    }

    if (this.endDate) {
      const endOfDay = new Date(this.endDate);
      endOfDay.setHours(23, 59, 59, 999);
      filtered = filtered.filter(ticket => 
        new Date(ticket.createdAt) <= endOfDay
      );
    }

    // Sort tickets
    filtered = this.sortTickets(filtered);

    this.filteredTickets = filtered;
  }

  sortTickets(tickets: Ticket[]): Ticket[] {
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
        const priorityOrder: any = { 'CRITICAL': 1, 'HIGH': 2, 'MEDIUM': 3, 'LOW': 4 };
        return tickets.sort((a, b) => {
          const priorityA = priorityOrder[a.priority || 'LOW'] || 5;
          const priorityB = priorityOrder[b.priority || 'LOW'] || 5;
          return priorityA - priorityB;
        });
      
      default:
        return tickets;
    }
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedStatus = 'ALL';
    this.searchQuery = '';
    this.startDate = null;
    this.endDate = null;
    this.sortBy = 'newest';
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return this.selectedStatus !== 'ALL' || 
           this.searchQuery.trim() !== '' || 
           this.startDate !== null || 
           this.endDate !== null ||
           this.sortBy !== 'newest';
  }

  viewTicket(ticketId: string): void {
    this.router.navigate(['/user/tickets', ticketId]);
  }

  createTicket(): void {
    this.router.navigate(['/user/tickets/create']);
  }

  closeTicket(ticket: Ticket, event: Event): void {
    event.stopPropagation();
    
    if (ticket.status !== 'RESOLVED') {
      this.snackBar.open('Only resolved tickets can be closed', 'Close', { duration: 3000 });
      return;
    }

    if (!confirm(`Close ticket #${ticket.ticketNumber}?`)) {
      return;
    }

    this.ticketService.changeStatus(ticket.ticketId, 'CLOSED', 'Closed by user').subscribe({
      next: (updatedTicket) => {
        // Update local ticket list
        const index = this.tickets.findIndex(t => t.ticketId === ticket.ticketId);
        if (index !== -1) {
          this.tickets[index] = updatedTicket;
        }
        this.applyFilters();
        this.snackBar.open('Ticket closed successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error closing ticket:', error);
        this.snackBar.open('Failed to close ticket', 'Close', { duration: 3000 });
      }
    });
  }

  canCloseTicket(ticket: Ticket): boolean {
    return ticket.status === 'RESOLVED';
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'OPEN': return 'primary';
      case 'ASSIGNED': return 'accent';
      case 'IN_PROGRESS': return 'warn';
      case 'RESOLVED': return 'success';
      case 'CLOSED': return 'default';
      default: return 'default';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'CRITICAL': return 'warn';
      case 'HIGH': return 'warn';
      case 'MEDIUM': return 'accent';
      case 'LOW': return 'primary';
      default: return 'default';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  logout(): void {
    this.authService.logout();
  }
}
