import { User, Employee, Department, EmployeeRole, EmployeeStatus } from '@/types';

// Seed Users
export const mockUsers: (User & { password: string })[] = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    role: 'Admin',
    email: 'admin@minihrms.com',
    fullName: 'System Administrator',
    status: 'Active',
    createdAt: '2024-01-01',
  },
  {
    id: 2,
    username: 'manager',
    password: 'manager123',
    role: 'Manager',
    email: 'manager@minihrms.com',
    fullName: 'John Manager',
    status: 'Active',
    createdAt: '2024-01-15',
  },
  {
    id: 3,
    username: 'employee',
    password: 'employee123',
    role: 'Employee',
    email: 'employee@minihrms.com',
    fullName: 'Jane Employee',
    status: 'Active',
    createdAt: '2024-02-01',
  },
];

// Generate 35+ employees for testing
const departments: Department[] = ['IT', 'HR', 'Finance', 'Sales'];
const roles: EmployeeRole[] = ['Employee', 'Manager'];
const statuses: EmployeeStatus[] = ['Active', 'Inactive'];

const firstNames = [
  'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda',
  'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Lisa', 'Daniel', 'Nancy',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
  'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen'
];

function randomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomSalary(): number {
  return Math.floor(Math.random() * (150000 - 35000) + 35000);
}

function generateMobile(): string {
  return `${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 9000000 + 1000000)}`;
}

export const mockEmployees: Employee[] = Array.from({ length: 38 }, (_, i) => {
  const firstName = randomItem(firstNames);
  const lastName = randomItem(lastNames);
  const department = randomItem(departments);
  // Make some managers and some employees
  const role: EmployeeRole = i < 5 ? 'Manager' : randomItem(roles);
  // Make ~15% inactive for testing filters
  const status: EmployeeStatus = Math.random() > 0.15 ? 'Active' : 'Inactive';
  
  return {
    id: i + 1,
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i > 0 ? i : ''}@company.com`,
    mobile: generateMobile(),
    department,
    role,
    joinDate: randomDate(new Date('2020-01-01'), new Date('2025-12-31')),
    salary: randomSalary(),
    address: `${Math.floor(Math.random() * 9999) + 1} ${randomItem(['Main', 'Oak', 'Pine', 'Maple', 'Cedar'])} ${randomItem(['St', 'Ave', 'Blvd', 'Rd', 'Dr'])}, ${randomItem(['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'])}`,
    status,
  };
});

// Add some duplicate-ish names for search testing
mockEmployees.push({
  id: 39,
  firstName: 'James',
  lastName: 'Smith',
  email: 'james.smith.senior@company.com',
  mobile: '5559876543',
  department: 'IT',
  role: 'Manager',
  joinDate: '2019-06-15',
  salary: 125000,
  address: '100 Tech Park, San Francisco',
  status: 'Active',
});

mockEmployees.push({
  id: 40,
  firstName: 'James',
  lastName: 'Smithson',
  email: 'james.smithson@company.com',
  mobile: '5551234567',
  department: 'Sales',
  role: 'Employee',
  joinDate: '2023-03-20',
  salary: 55000,
  address: '200 Commerce St, Boston',
  status: 'Active',
});
