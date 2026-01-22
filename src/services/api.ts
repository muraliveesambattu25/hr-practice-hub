import { 
  LoginCredentials, 
  LoginResponse, 
  User, 
  Employee, 
  EmployeeFormData,
  EmployeeFilters,
  PaginationParams,
  PaginatedResponse 
} from '@/types';
import { mockUsers, mockEmployees } from '@/data/mockData';

// Simulate random API delay (300-1200ms) for Selenium wait practice
const simulateDelay = () => new Promise(resolve => 
  setTimeout(resolve, Math.random() * 900 + 300)
);

// Longer delay for login (1-2 seconds)
const simulateLoginDelay = () => new Promise(resolve => 
  setTimeout(resolve, Math.random() * 1000 + 1000)
);

// In-memory storage for mock data mutations
let employees = [...mockEmployees];
let users = [...mockUsers];

// Auth API
export const authApi = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    await simulateLoginDelay();
    
    const user = mockUsers.find(
      u => u.username === credentials.username && u.password === credentials.password
    );
    
    if (!user) {
      throw { message: 'Invalid username or password', statusCode: 401 };
    }
    
    if (user.status === 'Inactive') {
      throw { message: 'Account is inactive. Please contact administrator.', statusCode: 403 };
    }
    
    const { password, ...userWithoutPassword } = user;
    const token = btoa(JSON.stringify({ userId: user.id, role: user.role, exp: Date.now() + 86400000 }));
    
    return {
      token,
      user: userWithoutPassword,
    };
  },

  async getMe(token: string): Promise<User> {
    await simulateDelay();
    
    try {
      const decoded = JSON.parse(atob(token));
      if (decoded.exp < Date.now()) {
        throw { message: 'Token expired', statusCode: 401 };
      }
      
      const user = mockUsers.find(u => u.id === decoded.userId);
      if (!user) {
        throw { message: 'User not found', statusCode: 404 };
      }
      
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch {
      throw { message: 'Invalid token', statusCode: 401 };
    }
  },
};

// Employees API
export const employeesApi = {
  async getAll(
    filters: EmployeeFilters = {},
    pagination: PaginationParams = { page: 1, limit: 10 }
  ): Promise<PaginatedResponse<Employee>> {
    await simulateDelay();
    
    let filtered = [...employees];
    
    // Apply search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(emp => 
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(search) ||
        emp.email.toLowerCase().includes(search)
      );
    }
    
    // Apply department filter
    if (filters.department) {
      filtered = filtered.filter(emp => emp.department === filters.department);
    }
    
    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(emp => emp.status === filters.status);
    }
    
    // Apply date range filter
    if (filters.joinDateFrom) {
      filtered = filtered.filter(emp => emp.joinDate >= filters.joinDateFrom!);
    }
    if (filters.joinDateTo) {
      filtered = filtered.filter(emp => emp.joinDate <= filters.joinDateTo!);
    }
    
    // Apply sorting
    if (pagination.sortBy) {
      filtered.sort((a, b) => {
        let aVal: string, bVal: string;
        
        if (pagination.sortBy === 'fullName') {
          aVal = `${a.firstName} ${a.lastName}`;
          bVal = `${b.firstName} ${b.lastName}`;
        } else {
          aVal = a.joinDate;
          bVal = b.joinDate;
        }
        
        const comparison = aVal.localeCompare(bVal);
        return pagination.sortOrder === 'desc' ? -comparison : comparison;
      });
    }
    
    const total = filtered.length;
    const totalPages = Math.ceil(total / pagination.limit);
    const start = (pagination.page - 1) * pagination.limit;
    const data = filtered.slice(start, start + pagination.limit);
    
    return {
      data,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages,
    };
  },

  async getById(id: number): Promise<Employee> {
    await simulateDelay();
    
    const employee = employees.find(emp => emp.id === id);
    if (!employee) {
      throw { message: 'Employee not found', statusCode: 404 };
    }
    
    return employee;
  },

  async create(data: EmployeeFormData): Promise<Employee> {
    await simulateDelay();
    
    // Check for duplicate email
    if (employees.some(emp => emp.email.toLowerCase() === data.email.toLowerCase())) {
      throw { 
        message: 'Validation failed', 
        errors: { email: ['Email already exists'] },
        statusCode: 400 
      };
    }
    
    const newEmployee: Employee = {
      id: Math.max(...employees.map(e => e.id)) + 1,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      mobile: data.mobile,
      department: data.department,
      role: data.role,
      joinDate: data.joinDate,
      salary: data.salary,
      address: data.address,
      status: data.status,
      profilePicture: typeof data.profilePicture === 'string' ? data.profilePicture : undefined,
    };
    
    employees.unshift(newEmployee);
    return newEmployee;
  },

  async update(id: number, data: Partial<EmployeeFormData>): Promise<Employee> {
    await simulateDelay();
    
    const index = employees.findIndex(emp => emp.id === id);
    if (index === -1) {
      throw { message: 'Employee not found', statusCode: 404 };
    }
    
    // Check for duplicate email (excluding current employee)
    if (data.email && employees.some(emp => 
      emp.id !== id && emp.email.toLowerCase() === data.email!.toLowerCase()
    )) {
      throw { 
        message: 'Validation failed', 
        errors: { email: ['Email already exists'] },
        statusCode: 400 
      };
    }
    
    employees[index] = {
      ...employees[index],
      ...data,
      profilePicture: typeof data.profilePicture === 'string' ? data.profilePicture : employees[index].profilePicture,
    };
    
    return employees[index];
  },

  async delete(id: number): Promise<void> {
    await simulateDelay();
    
    const index = employees.findIndex(emp => emp.id === id);
    if (index === -1) {
      throw { message: 'Employee not found', statusCode: 404 };
    }
    
    employees.splice(index, 1);
  },
};

// Users API (Admin only)
export const usersApi = {
  async getAll(): Promise<User[]> {
    await simulateDelay();
    return users.map(({ password, ...user }) => user);
  },

  async create(data: { username: string; password: string; role: User['role']; fullName: string; email: string }): Promise<User> {
    await simulateDelay();
    
    if (users.some(u => u.username.toLowerCase() === data.username.toLowerCase())) {
      throw { 
        message: 'Validation failed', 
        errors: { username: ['Username already exists'] },
        statusCode: 400 
      };
    }
    
    const newUser = {
      id: Math.max(...users.map(u => u.id)) + 1,
      username: data.username,
      password: data.password,
      role: data.role,
      fullName: data.fullName,
      email: data.email,
      status: 'Active' as const,
      createdAt: new Date().toISOString().split('T')[0],
    };
    
    users.push(newUser);
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  async updateStatus(id: number, status: 'Active' | 'Inactive'): Promise<User> {
    await simulateDelay();
    
    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
      throw { message: 'User not found', statusCode: 404 };
    }
    
    users[index].status = status;
    const { password, ...userWithoutPassword } = users[index];
    return userWithoutPassword;
  },

  async resetPassword(id: number, newPassword: string): Promise<void> {
    await simulateDelay();
    
    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
      throw { message: 'User not found', statusCode: 404 };
    }
    
    users[index].password = newPassword;
  },
};
