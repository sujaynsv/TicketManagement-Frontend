import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  userId: string;
  username: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  // Get current user profile
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  // Update current user profile
  updateProfile(request: UpdateProfileRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/me`, request);
  }

  // Get user by ID
  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${userId}`);
  }
}
