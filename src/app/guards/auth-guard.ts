import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Check role-based access
  const requiredRoles = route.data['roles'] as string[];
  
  if (requiredRoles && requiredRoles.length > 0) {
    const userRole = authService.getUserRole();
    
    if (!requiredRoles.includes(userRole)) {
      // User doesn't have required role - redirect to appropriate dashboard
      switch(userRole) {
        case 'ADMIN':
          router.navigate(['/admin/dashboard']);
          break;
        case 'SUPPORT_MANAGER':
          router.navigate(['/manager/dashboard']);
          break;
        case 'SUPPORT_AGENT':
          router.navigate(['/agent/dashboard']);
          break;
        case 'END_USER':
          router.navigate(['/user/dashboard']);
          break;
        default:
          router.navigate(['/login']);
      }
      return false;
    }
  }

  return true;
};
