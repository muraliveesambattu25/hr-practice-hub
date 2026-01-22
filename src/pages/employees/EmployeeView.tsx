import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Pencil, Mail, Phone, MapPin, Building2, Calendar, DollarSign, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { employeesApi } from '@/services/api';
import { Employee } from '@/types';

const EmployeeView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const data = await employeesApi.getById(parseInt(id!));
        setEmployee(data);
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Employee not found',
        });
        navigate('/employees');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEmployee();
    }
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <div className="space-y-6" data-testid="employee-view-loading">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!employee) {
    return null;
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <div className="space-y-6" data-testid="employee-view-page">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/employees')}
            data-testid="back-btn"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="employee-name">
              {employee.firstName} {employee.lastName}
            </h1>
            <p className="text-muted-foreground">Employee Details</p>
          </div>
        </div>
        <Button asChild data-testid="edit-btn">
          <Link to={`/employees/${employee.id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1" data-testid="profile-card">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={employee.profilePicture} alt={`${employee.firstName} ${employee.lastName}`} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {getInitials(employee.firstName, employee.lastName)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold" data-testid="profile-name">
                {employee.firstName} {employee.lastName}
              </h2>
              <p className="text-muted-foreground" data-testid="profile-role">
                {employee.role}
              </p>
              <div className="flex gap-2 mt-3">
                <Badge 
                  variant={employee.status === 'Active' ? 'default' : 'secondary'}
                  data-testid="profile-status"
                >
                  {employee.status}
                </Badge>
                <Badge variant="outline" data-testid="profile-department">
                  {employee.department}
                </Badge>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <div className="flex items-center gap-3" data-testid="profile-email">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{employee.email}</span>
              </div>
              <div className="flex items-center gap-3" data-testid="profile-mobile">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{employee.mobile || 'Not provided'}</span>
              </div>
              <div className="flex items-start gap-3" data-testid="profile-address">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-sm">{employee.address || 'Not provided'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card className="md:col-span-2" data-testid="details-card">
          <CardHeader>
            <CardTitle>Employment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1" data-testid="detail-id">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  Employee ID
                </div>
                <p className="font-mono font-medium">EMP-{String(employee.id).padStart(4, '0')}</p>
              </div>

              <div className="space-y-1" data-testid="detail-department">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  Department
                </div>
                <p className="font-medium">{employee.department}</p>
              </div>

              <div className="space-y-1" data-testid="detail-join-date">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Join Date
                </div>
                <p className="font-medium">{format(new Date(employee.joinDate), 'MMMM d, yyyy')}</p>
              </div>

              <div className="space-y-1" data-testid="detail-salary">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  Salary
                </div>
                <p className="font-medium">${employee.salary.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeView;
