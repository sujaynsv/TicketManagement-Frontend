import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { UserDashboardComponent } from './components/user/dashboard/dashboard.component';
import { authGuard } from './guards/auth-guard';
import { CreateTicketComponent } from './components/user/create-ticket/create-ticket.component';
import { TicketDetailComponent } from './components/user/ticket-detail/ticket-detail.component';
import { ProfileComponent } from './components/user/profile/profile.component';

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
            // Dashboard
            {
                path: 'dashboard',
                component: UserDashboardComponent
            },
            
            // Create ticket (MUST BE BEFORE :ticketId!)
            {
                path: 'tickets/create',
                loadComponent: () => CreateTicketComponent
            },
            
            // View ticket detail
            {
                path: 'tickets/:ticketId',
                loadComponent: () => TicketDetailComponent
            },
            {
                path:'profile', component: ProfileComponent
            }
        ]
    },
    
    // Wildcard route
    {
        path: '**', 
        redirectTo: '/login'
    }
];
