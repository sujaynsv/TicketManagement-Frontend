import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe, SlicePipe } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminService } from '../../../services/admin.service';
import { finalize } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TicketManagementDialogComponent } from '../dialogs/ticket-management.dialog';


@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    SlicePipe,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatTabsModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule
  ]
})
export class AdminDashboardComponent implements OnInit {

  // =============== STATS ===============
  usersCount = 0;
  agentsCount = 0;
  managersCount = 0;
  ticketsCount = 0;
  openTicketsCount = 0;
  breachedSLAsCount = 0;
  loadingStats = false;
  error: string = '';

  // =============== USERS TABLE ===============
  usersDataSource = new MatTableDataSource<any>([]);
  usersDisplayColumns: string[] = ['userId', 'username', 'email', 'role', 'status', 'createdAt'];
  @ViewChild('usersSort') usersSort!: MatSort;
  @ViewChild('usersPaginator') usersPaginator!: MatPaginator;
  loadingUsers = false;

  // =============== AGENTS TABLE ===============
  agentsDataSource = new MatTableDataSource<any>([]);
  agentsDisplayColumns: string[] = ['agentId', 'username', 'status', 'ticketsAssigned', 'ticketsResolved', 'actions'];
  @ViewChild('agentsSort') agentsSort!: MatSort;
  @ViewChild('agentsPaginator') agentsPaginator!: MatPaginator;
  loadingAgents = false;
  syncingAgents = false;

  // =============== TICKETS TABLE ===============
  ticketsDataSource = new MatTableDataSource<any>([]);
  ticketsDisplayColumns: string[] = ['ticketNumber', 'title', 'status', 'priority', 'assignedTo', 'createdAt', 'actions'];
  @ViewChild('ticketsSort') ticketsSort!: MatSort;
  @ViewChild('ticketsPaginator') ticketsPaginator!: MatPaginator;
  loadingTickets = false;
  ticketStatusFilter = '';

  // =============== SLA ===============
  activeSLAs: any[] = [];
  breachedSLAs: any[] = [];
  slaDisplayColumns: string[] = ['ticketNumber', 'priority', 'slaStatus', 'responseDueAt', 'resolutionDueAt', 'actions'];
  loadingSLAs = false;

  // =============== UNASSIGNED TICKETS ===============
  unassignedTickets: any[] = [];
  unassignedDataSource = new MatTableDataSource<any>([]);
  unassignedDisplayColumns: string[] = ['ticketNumber', 'title', 'priority', 'createdBy', 'createdAt', 'actions'];
  @ViewChild('unassignedPaginator') unassignedPaginator!: MatPaginator;
  loadingAssignments = false;

  // =============== AVAILABLE AGENTS ===============
  availableAgents: any[] = [];

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog
) { }

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loadingStats = true;

    this.adminService.getAllUsers(0, 10)
      .pipe(finalize(() => this.loadingStats = false))
      .subscribe({
        next: (users: any[]) => {
          this.usersCount = users?.length || 0;
          this.setupUsersTable(users);
        },
        error: (err: any) => {
          console.error('Failed to load users:', err);
          this.error = 'Failed to load users';
        }
      });

    this.adminService.getAllAgents()
      .subscribe({
        next: (agents: any[]) => {
          this.agentsCount = agents?.length || 0;
          this.setupAgentsTable(agents);
        },
        error: (err: any) => {
          console.warn('Failed to load agents:', err);
          this.agentsCount = 0;
        }
      });

    this.adminService.getAllManagers()
      .subscribe({
        next: (managers: any[]) => {
          this.managersCount = managers?.length || 0;
        },
        error: (err: any) => {
          console.warn('Failed to load managers:', err);
          this.managersCount = 0;
        }
      });

    this.adminService.getAllTickets(0, 10)
      .subscribe({
        next: (tickets: any[]) => {
          this.ticketsCount = tickets?.length || 0;
          const openCount = tickets?.filter(t => t.status === 'OPEN' || t.status === 'ASSIGNED').length || 0;
          this.openTicketsCount = openCount;
          this.setupTicketsTable(tickets);
        },
        error: (err: any) => {
          console.warn('Failed to load tickets:', err);
          this.ticketsCount = 0;
          this.openTicketsCount = 0;
        }
      });

    this.adminService.getUnassignedTickets()
      .subscribe({
        next: (unassigned: any[]) => {
          this.breachedSLAsCount = unassigned?.length || 0;
          this.unassignedTickets = unassigned || [];
          this.setupUnassignedTable(unassigned);
        },
        error: (err: any) => {
          console.warn('Failed to load unassigned tickets:', err);
          this.breachedSLAsCount = 0;
        }
      });

    this.adminService.getAllAgents()
      .subscribe({
        next: (agents: any[]) => {
          this.availableAgents = agents || [];
        },
        error: (err: any) => {
          console.warn('Failed to load available agents:', err);
          this.availableAgents = [];
        }
      });
  }

  setupUsersTable(users: any[]): void {
    this.usersDataSource = new MatTableDataSource(users);
    setTimeout(() => {
      this.usersDataSource.sort = this.usersSort;
      this.usersDataSource.paginator = this.usersPaginator;
    });
  }

  setupAgentsTable(agents: any[]): void {
    this.agentsDataSource = new MatTableDataSource(agents);
    setTimeout(() => {
      this.agentsDataSource.sort = this.agentsSort;
      this.agentsDataSource.paginator = this.agentsPaginator;
    });
  }

  setupTicketsTable(tickets: any[]): void {
    this.ticketsDataSource = new MatTableDataSource(tickets);
    setTimeout(() => {
      this.ticketsDataSource.sort = this.ticketsSort;
      this.ticketsDataSource.paginator = this.ticketsPaginator;
    });
  }

  setupUnassignedTable(tickets: any[]): void {
    this.unassignedDataSource = new MatTableDataSource(tickets);
    setTimeout(() => {
      this.unassignedDataSource.paginator = this.unassignedPaginator;
    });
  }

  filterUsers(event: any): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.usersDataSource.filter = filterValue.trim().toLowerCase();
  }

  filterTicketsByStatus(status: string): void {
    if (!status) {
      this.adminService.getAllTickets().subscribe({
        next: (tickets: any[]) => this.setupTicketsTable(tickets)
      });
    } else {
      this.adminService.getAllTickets(0, 10, status).subscribe({
        next: (tickets: any[]) => this.setupTicketsTable(tickets)
      });
    }
  }

  syncAgents(): void {
    this.syncingAgents = true;
    setTimeout(() => this.syncingAgents = false, 2000);
  }

viewTicketDetail(ticketId: string): void {
  this.dialog.open(TicketManagementDialogComponent, {
    data: { ticketId },
    width: '900px',
    maxWidth: '90vw',
    maxHeight: '90vh',
    disableClose: false,
    panelClass: 'ticket-management-dialog'
  }).afterClosed().subscribe((result: any) => {
    if (result) {
      // Reload tickets if something changed
      this.loadDashboard();
    }
  });
}


  assignTicket(ticketId: string, agentId: string): void {
    console.log('Assign ticket', ticketId, 'to agent', agentId);
  }

  getRoleBadgeColor(role: string): string {
    const colors: { [key: string]: string } = {
      'ADMIN': '#e53935',
      'SUPPORT_MANAGER': '#fb8c00',
      'SUPPORT_AGENT': '#43a047',
      'END_USER': '#1e88e5'
    };
    return colors[role] || '#757575';
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'AVAILABLE': '#43a047',
      'BUSY': '#fb8c00',
      'AWAY': '#757575',
      'OFFLINE': '#e53935'
    };
    return colors[status] || '#757575';
  }

  getTicketStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'OPEN': '#e53935',
      'ASSIGNED': '#fb8c00',
      'ESCALATED': '#ff6f00',
      'RESOLVED': '#43a047',
      'CLOSED': '#757575'
    };
    return colors[status] || '#757575';
  }

  getPriorityColor(priority: string): string {
    const colors: { [key: string]: string } = {
      'CRITICAL': '#e53935',
      'HIGH': '#fb8c00',
      'MEDIUM': '#fdd835',
      'LOW': '#43a047'
    };
    return colors[priority] || '#757575';
  }
}
