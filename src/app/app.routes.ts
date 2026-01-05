import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { UserDashboardComponent } from './components/user/dashboard/dashboard.component';
import { authGuard } from './guards/auth-guard';
import { CreateTicketComponent } from './components/user/create-ticket/create-ticket.component';
import { TicketDetailComponent } from './components/user/ticket-detail/ticket-detail.component';
import { ProfileComponent } from './components/user/profile/profile.component';
import { AgentDashboardComponent } from './components/agent/dashboard/dashboard.component';
import { ManagerDashboardComponent } from './components/manager/dashboard/dashboard.component';
import { ManagerTicketDetailComponent } from './components/manager/ticket-detail/ticket-detail.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'register',
        component: RegisterComponent
    },

    // ============================================
    // USER ROUTES (END_USER role)
    // ============================================
    {
        path: 'user',
        canActivate: [authGuard],
        data: { roles: ['END_USER'] },
        children: [
            {
                path: 'dashboard',
                component: UserDashboardComponent
            },
            {
                path: 'tickets/create',
                loadComponent: () => CreateTicketComponent
            },
            {
                path: 'tickets/:ticketId',
                loadComponent: () => TicketDetailComponent
            },
            {
                path: 'profile',
                component: ProfileComponent
            }
        ]
    },

    // ============================================
    // AGENT ROUTES (SUPPORT_AGENT role)
    // ============================================
    {
        path: 'agent',
        canActivate: [authGuard],
        data: { roles: ['SUPPORT_AGENT'] },
        children: [
            {
                path: 'dashboard',
                component: AgentDashboardComponent
            },
            {
                path: 'tickets/:ticketId',
                loadComponent: () => TicketDetailComponent
            },
            {
                path: 'profile',
                component: ProfileComponent
            }
        ]
    },

    // ============================================
    // MANAGER ROUTES (SUPPORT_MANAGER role)
    // ============================================
    {
        path: 'manager',
        canActivate: [authGuard],
        data: { roles: ['SUPPORT_MANAGER'] },
        children: [
            {
                path: 'dashboard',
                loadComponent: () => ManagerDashboardComponent
            },
            {
                path: 'tickets/:ticketId',
                loadComponent: () => ManagerTicketDetailComponent
            }
        ]
    },

    // ============================================
    // WILDCARD ROUTE
    // ============================================
    {
        path: '**',
        redirectTo: '/login'
    }
];
