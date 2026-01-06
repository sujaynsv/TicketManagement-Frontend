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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AdminService } from '../../../services/admin.service';
import { finalize } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TicketManagementDialogComponent } from '../dialogs/ticket-management.dialog';
import { UserManagementDialog } from '../dialogs/user-management.dialog';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
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
    MatTooltipModule,
    MatSnackBarModule,
    MatMenuModule,
    MatDividerModule,
    MatDialogModule
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
  usersDisplayColumns: string[] = ['userId', 'username', 'email', 'role', 'status', 'createdAt', 'actions'];
  @ViewChild('usersSort') usersSort!: MatSort;
  @ViewChild('usersPaginator') usersPaginator!: MatPaginator;
  loadingUsers = false;
  allUsers: any[] = [];

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

  // =============== AVAILABLE AGENTS & MANAGERS ===============
  availableAgents: any[] = [];
  availableManagers: any[] = [];

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadDashboard();
  }

  // ============================================================
  // LOAD DASHBOARD DATA
  // ============================================================

  loadDashboard(): void {
    this.loadingStats = true;
    this.error = '';

    // Load Users
    this.adminService.getAllUsers(0, 10)
      .pipe(finalize(() => this.loadingStats = false))
      .subscribe({
        next: (users: any[]) => {
          this.usersCount = users?.length || 0;
          this.allUsers = users || [];
          this.setupUsersTable(users);
        },
        error: (err: any) => {
          console.error('Failed to load users:', err);
          this.error = 'Failed to load users';
          this.showError('Failed to load users');
        }
      });

    // Load Agents
    this.adminService.getAllAgents()
      .subscribe({
        next: (agents: any[]) => {
          this.agentsCount = agents?.length || 0;
          this.availableAgents = agents || [];
          this.setupAgentsTable(agents);
        },
        error: (err: any) => {
          console.warn('Failed to load agents:', err);
          this.agentsCount = 0;
        }
      });

    // Load Managers
    this.adminService.getAllManagers()
      .subscribe({
        next: (managers: any[]) => {
          this.managersCount = managers?.length || 0;
          this.availableManagers = managers || [];
        },
        error: (err: any) => {
          console.warn('Failed to load managers:', err);
          this.managersCount = 0;
        }
      });

    // Load Tickets
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

    // Load Unassigned Tickets
      // Load Active SLAs
this.adminService.getActiveSLAs().subscribe({
  next: (activeSLAs: any[]) => {
    this.activeSLAs = activeSLAs || [];
    console.log('   Active SLAs loaded:', activeSLAs.length);
  },
  error: (err: any) => {
    console.warn('Failed to load active SLAs:', err);
    this.activeSLAs = [];
  }
});

// Load Breached SLAs (this is where the count comes from)
this.adminService.getBreachedSLAs().subscribe({
  next: (breachedSLAs: any[]) => {
    this.breachedSLAs = breachedSLAs || [];
    this.breachedSLAsCount = breachedSLAs?.length || 0;  //    CORRECT
  },
  error: (err: any) => {
    console.warn('Failed to load breached SLAs:', err);
    this.breachedSLAs = [];
    this.breachedSLAsCount = 0;
  }
});

  }

  // ============================================================
  // TABLE SETUP
  // ============================================================

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

  // ============================================================
  // USER MANAGEMENT - DIALOG OPERATIONS
  // ============================================================

  editUser(user: any): void {
    this.dialog.open(UserManagementDialog, {
      data: { user, action: 'edit' },
      width: '500px',
      maxWidth: '90vw',
      disableClose: false
    }).afterClosed().subscribe((result: any) => {
      if (result?.success) {
        this.showSuccess('User updated successfully');
        this.loadDashboard();
      }
    });
  }

  changeUserRole(user: any): void {
    this.dialog.open(UserManagementDialog, {
      data: { user, action: 'role' },
      width: '500px',
      maxWidth: '90vw',
      disableClose: false
    }).afterClosed().subscribe((result: any) => {
      if (result?.success) {
        this.showSuccess('User role changed successfully');
        this.loadDashboard();
      }
    });
  }

  /**
 * Deactivate a user - opens confirmation dialog
 */
deactivateUser(user: any): void {
  if (!user || !user.userId) {
    this.showError('Invalid user data');
    return;
  }

  this.dialog.open(UserManagementDialog, {
    data: { user, action: 'deactivate' },
    width: '500px',
    maxWidth: '90vw',
    disableClose: false
  }).afterClosed().subscribe((result: any) => {
    if (result?.success) {
      this.showSuccess('✓ User deactivated successfully');
      this.loadDashboard();
    }
  });
}


/**
 * Activate a user - opens confirmation dialog
 */
activateUser(user: any): void {
  if (!user || !user.userId) {
    this.showError('Invalid user data');
    return;
  }

  this.dialog.open(UserManagementDialog, {
    data: { user, action: 'activate' },
    width: '500px',
    maxWidth: '90vw',
    disableClose: false
  }).afterClosed().subscribe((result: any) => {
    if (result?.success) {
      this.showSuccess('✓ User activated successfully');
      this.loadDashboard();
    }
  });
}

  /**
 * Deactivate a user - opens confirmation dialog
 */
// deactivateUser(user: any): void {
//   if (!user || !user.userId) {
//     this.showError('Invalid user data');
//     return;
//   }

//   // Open confirmation dialog
//   this.dialog.open(UserManagementDialog, {
//     data: { user, action: 'deactivate' },
//     width: '500px',
//     maxWidth: '90vw',
//     disableClose: false
//   }).afterClosed().subscribe((result: any) => {
//     if (result?.success) {
//       this.showSuccess('✓ User deactivated successfully');
//       this.loadDashboard();
//     }
//   });
// }

// /**
//  * Activate a user - opens confirmation dialog
//  */
// activateUser(user: any): void {
//   if (!user || !user.userId) {
//     this.showError('Invalid user data');
//     return;
//   }

//   // Open confirmation dialog
//   this.dialog.open(UserManagementDialog, {
//     data: { user, action: 'activate' },
//     width: '500px',
//     maxWidth: '90vw',
//     disableClose: false
//   }).afterClosed().subscribe((result: any) => {
//     if (result?.success) {
//       this.showSuccess('✓ User activated successfully');
//       this.loadDashboard();
//     }
//   });
// }

  deleteUser(user: any): void {
    this.dialog.open(UserManagementDialog, {
      data: { user, action: 'deactivate' },
      width: '500px',
      maxWidth: '90vw',
      disableClose: false
    }).afterClosed().subscribe((result: any) => {
      if (result?.success) {
        this.showSuccess('User deactivated successfully');
        this.loadDashboard();
      }
    });
  }

  assignManagerDialog(user: any): void {
    this.dialog.open(UserManagementDialog, {
      data: { user, action: 'manager', managers: this.availableManagers },
      width: '500px',
      maxWidth: '90vw',
      disableClose: false
    }).afterClosed().subscribe((result: any) => {
      if (result?.success) {
        this.showSuccess('Manager assigned successfully');
        this.loadDashboard();
      }
    });
  }

  resetUserPassword(user: any): void {
    this.dialog.open(UserManagementDialog, {
      data: { user, action: 'password' },
      width: '500px',
      maxWidth: '90vw',
      disableClose: false
    }).afterClosed().subscribe((result: any) => {
      if (result?.success) {
        this.showSuccess('Password reset successfully');
      }
    });
  }

  // ============================================================
  // USER FILTERING
  // ============================================================

  filterUsers(event: any): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.usersDataSource.filter = filterValue.trim().toLowerCase();

    if (this.usersDataSource.paginator) {
      this.usersDataSource.paginator.firstPage();
    }
  }

  // ============================================================
  // TICKET MANAGEMENT
  // ============================================================

  filterTicketsByStatus(status: string): void {
    this.ticketStatusFilter = status;
    this.loadingTickets = true;

    const pageIndex = this.ticketsPaginator?.pageIndex || 0;
    const pageSize = this.ticketsPaginator?.pageSize || 10;

    const request = status
      ? this.adminService.getAllTickets(pageIndex, pageSize, status)
      : this.adminService.getAllTickets(pageIndex, pageSize);

    request.subscribe({
      next: (tickets: any[]) => {
        this.loadingTickets = false;
        this.setupTicketsTable(tickets);
      },
      error: (err: any) => {
        this.loadingTickets = false;
        console.warn('Failed to filter tickets:', err);
        this.showError('Failed to filter tickets');
      }
    });
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
      if (result?.refreshData) {
        this.loadDashboard();
      }
    });
  }

// UNCOMMENT THIS and replace the commented code:

assignTicket(ticketId: string, agentId: string): void {
  console.log('assignTicket called with:', { ticketId, agentId });

  if (!agentId || agentId === '') {
    this.showError('  Please select an agent');
    return;
  }

  // Show loading state
  this.loadingAssignments = true;

  // Prepare the manual assignment request with all required fields
  const request = {
    ticketId: ticketId,
    agentId: agentId,
    priority: 'MEDIUM',  // Default priority
    assignmentNotes: 'Assigned by Admin'  // Default notes
  };

  console.log('📤 Sending assignment request:', request);

  // Call the manager's manual assignment endpoint
  this.adminService.manualAssign(request).subscribe({
    next: (response: any) => {
      console.log(' Assignment successful response:', response);
      this.loadingAssignments = false;
      
      // Show success with better message
      this.showSuccess(` Ticket ${ticketId.substring(ticketId.length - 5)} assigned to ${agentId}`);
      
      // Small delay before reload for better UX
      setTimeout(() => {
        console.log('🔄 Reloading unassigned tickets...');
        this.loadUnassignedTicketsOnly();
      }, 500);
    },
    error: (err: any) => {
      console.error('  Assignment failed:', err);
      this.loadingAssignments = false;
      
      const errorMsg = err?.error?.message || err?.message || 'Failed to assign ticket';
      this.showError(`  Error: ${errorMsg}`);
      
      console.log('Full error object:', {
        status: err?.status,
        statusText: err?.statusText,
        error: err?.error,
        message: err?.message
      });
    }
  });
}
  // ============================================================
  // AGENT MANAGEMENT
  // ============================================================

  syncAgents(): void {
    this.syncingAgents = true;

    this.adminService.getAllAgents().subscribe({
      next: (agents: any[]) => {
        this.syncingAgents = false;
        this.availableAgents = agents || [];
        this.setupAgentsTable(agents);
        this.showSuccess('Agents synced successfully');
      },
      error: (err: any) => {
        this.syncingAgents = false;
        this.showError('Failed to sync agents');
        console.error('Sync agents error:', err);
      }
    });
  }

  // ============================================================
  // COLOR HELPERS
  // ============================================================

  getRoleBadgeColor(role: string): string {
    const colors: { [key: string]: string } = {
      'ADMIN': '#e53935',
      'SUPPORT_MANAGER': '#fb8c00',
      'SUPPORT_AGENT': '#43a047',
      'END_USER': '#1e88e5'
    };
    return colors[role] || '#757575';
  }

  getStatusColor(isActive: boolean): string {
    const colors: { [key: string]: string } = {
      'AVAILABLE': '#43a047',
      'BUSY': '#fb8c00',
      'AWAY': '#757575',
      'OFFLINE': '#e53935',
      'ACTIVE': '#43a047',
      'INACTIVE': '#757575'
    };
    return isActive ? '#43a047' : '#e53935';
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

  // ============================================================
  // NOTIFICATIONS
  // ============================================================

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-success']
    });
  }
  

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-error']
    });
  }
  loadUnassignedTicketsOnly(): void {
  this.adminService.getUnassignedTickets().subscribe({
    next: (unassigned: any[]) => {
      console.log(' Unassigned tickets updated:', unassigned.length);
      this.breachedSLAsCount = unassigned?.length || 0;
      this.unassignedTickets = unassigned || [];
      this.setupUnassignedTable(unassigned);
      console.log(' Table refreshed successfully');
    },
    error: (err: any) => {
      console.error('Failed to reload unassigned tickets:', err);
      this.showError('  Ticket assigned but failed to refresh list');
    }
  });
}

}