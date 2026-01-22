import { Users, UserCheck, Building2, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { mockEmployees } from '@/data/mockData';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = {
    totalEmployees: mockEmployees.length,
    activeEmployees: mockEmployees.filter(e => e.status === 'Active').length,
    departments: [...new Set(mockEmployees.map(e => e.department))].length,
    managers: mockEmployees.filter(e => e.role === 'Manager').length,
  };

  const departmentCounts = mockEmployees.reduce((acc, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="dashboard-title">
          Dashboard
        </h1>
        <p className="text-muted-foreground" data-testid="dashboard-welcome">
          Welcome back, {user?.fullName}! Here's an overview of your organization.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="stat-total-employees">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Across all departments
            </p>
          </CardContent>
        </Card>

        <Card data-testid="stat-active-employees">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEmployees}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.activeEmployees / stats.totalEmployees) * 100).toFixed(0)}% of total
            </p>
          </CardContent>
        </Card>

        <Card data-testid="stat-departments">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.departments}</div>
            <p className="text-xs text-muted-foreground">
              Active departments
            </p>
          </CardContent>
        </Card>

        <Card data-testid="stat-managers">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Managers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.managers}</div>
            <p className="text-xs text-muted-foreground">
              Team leads
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Department Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card data-testid="department-breakdown">
          <CardHeader>
            <CardTitle>Department Breakdown</CardTitle>
            <CardDescription>Employee distribution by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(departmentCounts).map(([dept, count]) => (
                <div key={dept} className="flex items-center" data-testid={`dept-${dept.toLowerCase()}`}>
                  <div className="w-24 font-medium">{dept}</div>
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(count / stats.totalEmployees) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-12 text-right text-sm text-muted-foreground">
                    {count}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="quick-actions">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {user?.role === 'Admin' && (
                <>
                  <a 
                    href="/employees/new" 
                    className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors"
                    data-testid="quick-add-employee"
                  >
                    <Users className="h-4 w-4" />
                    <span>Add New Employee</span>
                  </a>
                  <a 
                    href="/users" 
                    className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors"
                    data-testid="quick-manage-users"
                  >
                    <UserCheck className="h-4 w-4" />
                    <span>Manage Users</span>
                  </a>
                </>
              )}
              {(user?.role === 'Admin' || user?.role === 'Manager') && (
                <a 
                  href="/attendance" 
                  className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors"
                  data-testid="quick-attendance"
                >
                  <Building2 className="h-4 w-4" />
                  <span>View Attendance</span>
                </a>
              )}
              <a 
                href="/automation-lab" 
                className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors"
                data-testid="quick-automation-lab"
              >
                <TrendingUp className="h-4 w-4" />
                <span>Automation Lab</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
