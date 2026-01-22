// User and Auth Types
export type UserRole = 'Admin' | 'Manager' | 'Employee';

export interface User {
  id: number;
  username: string;
  role: UserRole;
  email: string;
  fullName: string;
  avatar?: string;
  createdAt: string;
  status: 'Active' | 'Inactive';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Employee Types
export type Department = 'IT' | 'HR' | 'Finance' | 'Sales';
export type EmployeeRole = 'Employee' | 'Manager';
export type EmployeeStatus = 'Active' | 'Inactive';

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  department: Department;
  role: EmployeeRole;
  joinDate: string;
  salary: number;
  address: string;
  status: EmployeeStatus;
  profilePicture?: string;
}

export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  department: Department;
  role: EmployeeRole;
  joinDate: string;
  salary: number;
  address: string;
  status: EmployeeStatus;
  profilePicture?: File | string;
}

export interface EmployeeFilters {
  search?: string;
  department?: Department | '';
  status?: EmployeeStatus | '';
  joinDateFrom?: string;
  joinDateTo?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: 'fullName' | 'joinDate';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API Response Types
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode: number;
}
