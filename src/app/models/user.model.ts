export enum UserRole {
  ADMIN = 'ADMIN',
  SUPPORT_MANAGER = 'SUPPORT_MANAGER',
  SUPPORT_AGENT = 'SUPPORT_AGENT',
  END_USER = 'END_USER'
}

export interface User {
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  tokenVersion: number;
  managerId?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  email: string;
  role: string;
  userId: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleName?: string;
}

export interface RegisterResponse {
  userId: string;
  username: string;
  email: string;
  role: string;
  message: string;
}

export interface LogoutResponse {
  message: string;
  username: string;
  loggedOutAt: string;
}
