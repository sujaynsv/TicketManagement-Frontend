import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatGridListModule,
    MatTableModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {
  
  // Loading states
  loadingOverview = true;
  loadingTickets = true;
  loadingAgents = true;
  loadingSLA = true;

  // Data
  overview: any = {};
  ticketAnalytics: any = {};
  agentPerformance: any = {};
  slaReport: any = {};

  // Agent metrics
  agentMetrics: any[] = [];
  agentDisplayColumns: string[] = ['username', 'assigned', 'resolved', 'avgResolutionTime', 'slaCompliance'];

  selectedDays = 7;
  dayOptions = [7, 14, 30];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadAllAnalytics();
  }

  loadAllAnalytics(): void {
    this.loadSystemOverview();
    this.loadTicketAnalytics();
    this.loadAgentPerformance();
    this.loadSLAReport();
  }

  loadSystemOverview(): void {
    this.loadingOverview = true;
    this.adminService.getSystemOverview().subscribe({
      next: (data) => {
        this.overview = data;
        this.loadingOverview = false;
      },
      error: (err) => {
        console.error('Failed to load overview', err);
        this.loadingOverview = false;
        this.overview = {
          totalTickets: 0,
          openTickets: 0,
          resolvedTickets: 0,
          closedTickets: 0,
          totalAgents: 0,
          totalUsers: 0,
          slaBreach: 0,
          avgResponseTime: 0
        };
      }
    });
  }

  loadTicketAnalytics(): void {
    this.loadingTickets = true;
    this.adminService.getTicketAnalytics(this.selectedDays).subscribe({
      next: (data) => {
        this.ticketAnalytics = data;
        this.loadingTickets = false;
      },
      error: (err) => {
        console.error('Failed to load ticket analytics', err);
        this.loadingTickets = false;
        this.ticketAnalytics = {};
      }
    });
  }

  loadAgentPerformance(): void {
    this.loadingAgents = true;
    this.adminService.getAgentPerformance().subscribe({
      next: (data) => {
        this.agentPerformance = data;
        // Extract metrics for table
        this.agentMetrics = data.agents || [];
        this.loadingAgents = false;
      },
      error: (err) => {
        console.error('Failed to load agent performance', err);
        this.loadingAgents = false;
        this.agentPerformance = {};
        this.agentMetrics = [];
      }
    });
  }

  loadSLAReport(): void {
    this.loadingSLA = true;
    this.adminService.getSlaReport().subscribe({
      next: (data) => {
        this.slaReport = data;
        this.loadingSLA = false;
      },
      error: (err) => {
        console.error('Failed to load SLA report', err);
        this.loadingSLA = false;
        this.slaReport = {};
      }
    });
  }

  onDaysChange(days: number): void {
    this.selectedDays = days;
    this.loadTicketAnalytics();
  }

  getTicketTrendIcon(trend: number): string {
    if (trend > 0) return 'trending_up';
    if (trend < 0) return 'trending_down';
    return 'trending_flat';
  }

  getTicketTrendColor(trend: number): string {
    if (trend > 0) return '#ff9800';
    if (trend < 0) return '#4caf50';
    return '#757575';
  }

  getSLAComplianceColor(compliance: number): string {
    if (compliance >= 90) return '#4caf50';
    if (compliance >= 75) return '#ff9800';
    return '#f44336';
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'OPEN': return '#2196f3';
      case 'ASSIGNED': return '#9c27b0';
      case 'RESOLVED': return '#4caf50';
      case 'CLOSED': return '#757575';
      default: return '#757575';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'CRITICAL': return '#c62828';
      case 'HIGH': return '#ff6f00';
      case 'MEDIUM': return '#fbc02d';
      case 'LOW': return '#2e7d32';
      default: return '#757575';
    }
  }
}
