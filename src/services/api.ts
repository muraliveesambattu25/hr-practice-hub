import { 
  LoginCredentials, 
  LoginResponse, 
  User, 
  Employee, 
  EmployeeFormData,
  EmployeeFilters,
  PaginationParams,
  PaginatedResponse,
  ApiError
} from '@/types';

// API base URL - uses environment variable or defaults to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Get stored auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('glacier_token');
};

// Generic fetch wrapper with error handling
const apiFetch = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle no content response
  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json();

  if (!response.ok) {
    const error: ApiError = {
      message: data.message || 'An error occurred',
      errors: data.errors,
      statusCode: response.status,
    };
    throw error;
  }

  return data;
};

// Form data fetch for file uploads
const apiFormFetch = async <T>(
  endpoint: string,
  formData: FormData,
  method: 'POST' | 'PUT' = 'POST'
): Promise<T> => {
  const token = getAuthToken();
  
  const headers: HeadersInit = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    const error: ApiError = {
      message: data.message || 'An error occurred',
      errors: data.errors,
      statusCode: response.status,
    };
    throw error;
  }

  return data;
};

// Auth API
export const authApi = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async getMe(token?: string): Promise<User> {
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return apiFetch<User>('/auth/me', { headers });
  },
};

// Employees API
export const employeesApi = {
  async getAll(
    filters: EmployeeFilters = {},
    pagination: PaginationParams = { page: 1, limit: 10 }
  ): Promise<PaginatedResponse<Employee>> {
    const params = new URLSearchParams();
    
    params.append('page', String(pagination.page));
    params.append('limit', String(pagination.limit));
    
    if (pagination.sortBy) {
      params.append('sortBy', pagination.sortBy);
    }
    if (pagination.sortOrder) {
      params.append('sortOrder', pagination.sortOrder);
    }
    if (filters.search) {
      params.append('search', filters.search);
    }
    if (filters.department) {
      params.append('department', filters.department);
    }
    if (filters.status) {
      params.append('status', filters.status);
    }
    if (filters.joinDateFrom) {
      params.append('joinDateFrom', filters.joinDateFrom);
    }
    if (filters.joinDateTo) {
      params.append('joinDateTo', filters.joinDateTo);
    }

    return apiFetch<PaginatedResponse<Employee>>(`/employees?${params.toString()}`);
  },

  async getById(id: number): Promise<Employee> {
    return apiFetch<Employee>(`/employees/${id}`);
  },

  async create(data: EmployeeFormData): Promise<Employee> {
    // If there's a file, use FormData
    if (data.profilePicture instanceof File) {
      const formData = new FormData();
      formData.append('firstName', data.firstName);
      formData.append('lastName', data.lastName);
      formData.append('email', data.email);
      formData.append('mobile', data.mobile);
      formData.append('department', data.department);
      formData.append('role', data.role);
      formData.append('joinDate', data.joinDate);
      formData.append('salary', String(data.salary));
      formData.append('address', data.address);
      formData.append('status', data.status);
      formData.append('profilePicture', data.profilePicture);
      
      return apiFormFetch<Employee>('/employees', formData, 'POST');
    }

    // Otherwise, use JSON
    return apiFetch<Employee>('/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: Partial<EmployeeFormData>): Promise<Employee> {
    // If there's a file, use FormData
    if (data.profilePicture instanceof File) {
      const formData = new FormData();
      if (data.firstName) formData.append('firstName', data.firstName);
      if (data.lastName) formData.append('lastName', data.lastName);
      if (data.email) formData.append('email', data.email);
      if (data.mobile !== undefined) formData.append('mobile', data.mobile);
      if (data.department) formData.append('department', data.department);
      if (data.role) formData.append('role', data.role);
      if (data.joinDate) formData.append('joinDate', data.joinDate);
      if (data.salary !== undefined) formData.append('salary', String(data.salary));
      if (data.address !== undefined) formData.append('address', data.address);
      if (data.status) formData.append('status', data.status);
      formData.append('profilePicture', data.profilePicture);
      
      return apiFormFetch<Employee>(`/employees/${id}`, formData, 'PUT');
    }

    // Otherwise, use JSON
    return apiFetch<Employee>(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<void> {
    return apiFetch<void>(`/employees/${id}`, {
      method: 'DELETE',
    });
  },
};

// Users API (Admin only)
export const usersApi = {
  async getAll(): Promise<User[]> {
    return apiFetch<User[]>('/users');
  },

  async create(data: { 
    username: string; 
    password: string; 
    role: User['role']; 
    fullName: string; 
    email: string 
  }): Promise<User> {
    return apiFetch<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateStatus(id: number, status: 'Active' | 'Inactive'): Promise<User> {
    return apiFetch<User>(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async resetPassword(id: number, newPassword: string): Promise<void> {
    return apiFetch<void>(`/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
  },
};
