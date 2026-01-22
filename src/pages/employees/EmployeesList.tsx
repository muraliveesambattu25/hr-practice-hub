import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Eye, 
  Pencil, 
  Trash2, 
  ChevronUp, 
  ChevronDown,
  Filter,
  X,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { employeesApi } from '@/services/api';
import { Employee, EmployeeFilters, Department, EmployeeStatus } from '@/types';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 10;

const EmployeesList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  // State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filters and pagination from URL
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const department = (searchParams.get('department') || '') as Department | '';
  const status = (searchParams.get('status') || '') as EmployeeStatus | '';
  const sortBy = (searchParams.get('sortBy') || 'fullName') as 'fullName' | 'joinDate';
  const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';
  const joinDateFrom = searchParams.get('joinDateFrom') || '';
  const joinDateTo = searchParams.get('joinDateTo') || '';

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const filters: EmployeeFilters = {
          search: search || undefined,
          department: department || undefined,
          status: status || undefined,
          joinDateFrom: joinDateFrom || undefined,
          joinDateTo: joinDateTo || undefined,
        };

        const result = await employeesApi.getAll(filters, {
          page,
          limit: ITEMS_PER_PAGE,
          sortBy,
          sortOrder,
        });

        setEmployees(result.data);
        setTotalPages(result.totalPages);
        setTotal(result.total);
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Failed to load employees',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [page, search, department, status, sortBy, sortOrder, joinDateFrom, joinDateTo, toast]);

  // Update URL params
  const updateParams = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    // Reset to page 1 when filters change
    if (!updates.page) {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  // Handle sorting
  const handleSort = (column: 'fullName' | 'joinDate') => {
    if (sortBy === column) {
      updateParams({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' });
    } else {
      updateParams({ sortBy: column, sortOrder: 'asc' });
    }
  };

  // Handle delete
  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;

    setDeleting(true);
    try {
      await employeesApi.delete(employeeToDelete.id);
      toast({
        title: 'Success',
        description: 'Employee deleted successfully',
      });
      // Refresh list
      const filters: EmployeeFilters = {
        search: search || undefined,
        department: department || undefined,
        status: status || undefined,
      };
      const result = await employeesApi.getAll(filters, {
        page,
        limit: ITEMS_PER_PAGE,
        sortBy,
        sortOrder,
      });
      setEmployees(result.data);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete employee',
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchParams({ page: '1' });
  };

  const hasFilters = search || department || status || joinDateFrom || joinDateTo;

  const SortIcon = ({ column }: { column: 'fullName' | 'joinDate' }) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  return (
    <div className="space-y-6" data-testid="employees-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="employees-title">
            Employees
          </h1>
          <p className="text-muted-foreground">
            Manage your organization's employees
          </p>
        </div>
        <Button asChild data-testid="employee-add-btn">
          <Link to="/employees/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 p-4 border rounded-lg bg-card" data-testid="employee-filters">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => updateParams({ search: e.target.value })}
              className="pl-9"
              data-testid="employee-search"
            />
          </div>

          {/* Department filter */}
          <Select
            value={department}
            onValueChange={(value) => updateParams({ department: value === 'all' ? '' : value })}
          >
            <SelectTrigger className="w-full sm:w-40" data-testid="filter-department">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="IT">IT</SelectItem>
              <SelectItem value="HR">HR</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="Sales">Sales</SelectItem>
            </SelectContent>
          </Select>

          {/* Status filter */}
          <Select
            value={status}
            onValueChange={(value) => updateParams({ status: value === 'all' ? '' : value })}
          >
            <SelectTrigger className="w-full sm:w-32" data-testid="filter-status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Date From */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Join Date:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-32"
                  data-testid="filter-date-from"
                >
                  {joinDateFrom ? format(new Date(joinDateFrom), 'MMM d, yyyy') : 'From'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={joinDateFrom ? new Date(joinDateFrom) : undefined}
                  onSelect={(date) => 
                    updateParams({ joinDateFrom: date ? format(date, 'yyyy-MM-dd') : '' })
                  }
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <span className="text-muted-foreground">-</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-32"
                  data-testid="filter-date-to"
                >
                  {joinDateTo ? format(new Date(joinDateTo), 'MMM d, yyyy') : 'To'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={joinDateTo ? new Date(joinDateTo) : undefined}
                  onSelect={(date) => 
                    updateParams({ joinDateTo: date ? format(date, 'yyyy-MM-dd') : '' })
                  }
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex-1" />

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground"
              data-testid="clear-filters"
            >
              <X className="mr-1 h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground" data-testid="employee-count">
        {loading ? 'Loading...' : `Showing ${employees.length} of ${total} employees`}
      </div>

      {/* Table */}
      <div className="border rounded-lg" data-testid="employee-table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>
                <button
                  className="flex items-center gap-1 hover:text-foreground"
                  onClick={() => handleSort('fullName')}
                  data-testid="sort-name"
                >
                  Full Name
                  <SortIcon column="fullName" />
                </button>
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <button
                  className="flex items-center gap-1 hover:text-foreground"
                  onClick={() => handleSort('joinDate')}
                  data-testid="sort-date"
                >
                  Join Date
                  <SortIcon column="joinDate" />
                </button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} data-testid="employee-row-skeleton">
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center" data-testid="no-results">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Filter className="h-8 w-8" />
                    <p>No employees found</p>
                    {hasFilters && (
                      <Button variant="link" onClick={clearFilters} size="sm">
                        Clear filters
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.id} data-testid={`employee-row-${employee.id}`}>
                  <TableCell className="font-mono text-sm" data-testid="employee-id">
                    {employee.id}
                  </TableCell>
                  <TableCell className="font-medium" data-testid="employee-name">
                    {employee.firstName} {employee.lastName}
                  </TableCell>
                  <TableCell data-testid="employee-email">{employee.email}</TableCell>
                  <TableCell data-testid="employee-department">
                    <Badge variant="outline">{employee.department}</Badge>
                  </TableCell>
                  <TableCell data-testid="employee-role">{employee.role}</TableCell>
                  <TableCell data-testid="employee-status">
                    <Badge 
                      variant={employee.status === 'Active' ? 'default' : 'secondary'}
                    >
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell data-testid="employee-join-date">
                    {format(new Date(employee.joinDate), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        data-testid={`view-employee-${employee.id}`}
                      >
                        <Link to={`/employees/${employee.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        data-testid={`edit-employee-${employee.id}`}
                      >
                        <Link to={`/employees/${employee.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(employee)}
                        data-testid={`delete-employee-${employee.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination data-testid="pagination">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => page > 1 && updateParams({ page: String(page - 1) })}
                className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                data-testid="pagination-prev"
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PaginationItem key={p}>
                <PaginationLink
                  onClick={() => updateParams({ page: String(p) })}
                  isActive={page === p}
                  className="cursor-pointer"
                  data-testid={`pagination-page-${p}`}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => page < totalPages && updateParams({ page: String(page + 1) })}
                className={page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                data-testid="pagination-next"
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent data-testid="delete-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle data-testid="delete-dialog-title">
              Delete Employee
            </AlertDialogTitle>
            <AlertDialogDescription data-testid="delete-dialog-description">
              Are you sure you want to delete {employeeToDelete?.firstName} {employeeToDelete?.lastName}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="modal-cancel">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
              data-testid="modal-confirm"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EmployeesList;
