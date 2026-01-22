import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { ArrowLeft, Loader2, CalendarIcon, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { employeesApi } from '@/services/api';
import { cn } from '@/lib/utils';

const employeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  mobile: z.string().regex(/^\d{10}$/, 'Mobile must be 10 digits').or(z.literal('')),
  department: z.enum(['IT', 'HR', 'Finance', 'Sales'], {
    required_error: 'Department is required',
  }),
  role: z.enum(['Employee', 'Manager'], {
    required_error: 'Role is required',
  }),
  joinDate: z.string().min(1, 'Join date is required'),
  salary: z.coerce.number().min(0, 'Salary must be positive'),
  address: z.string(),
  status: z.boolean(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

const EmployeeForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      mobile: '',
      department: undefined,
      role: undefined,
      joinDate: '',
      salary: 0,
      address: '',
      status: true,
    },
  });

  // Load employee data for edit
  useEffect(() => {
    if (isEdit) {
      const fetchEmployee = async () => {
        try {
          const employee = await employeesApi.getById(parseInt(id));
          form.reset({
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            mobile: employee.mobile,
            department: employee.department,
            role: employee.role,
            joinDate: employee.joinDate,
            salary: employee.salary,
            address: employee.address,
            status: employee.status === 'Active',
          });
          if (employee.profilePicture) {
            setProfilePicturePreview(employee.profilePicture);
          }
        } catch (error: any) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Failed to load employee',
          });
          navigate('/employees');
        } finally {
          setLoading(false);
        }
      };
      fetchEmployee();
    }
  }, [id, isEdit, form, navigate, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    setProfilePicturePreview(null);
  };

  const onSubmit = async (data: EmployeeFormData) => {
    setSaving(true);

    try {
      const employeeData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        mobile: data.mobile,
        department: data.department,
        role: data.role,
        joinDate: data.joinDate,
        salary: data.salary,
        address: data.address,
        status: data.status ? 'Active' as const : 'Inactive' as const,
        profilePicture: profilePicturePreview || undefined,
      };

      if (isEdit) {
        await employeesApi.update(parseInt(id), employeeData);
        toast({
          title: 'Success',
          description: 'Employee updated successfully',
        });
      } else {
        await employeesApi.create(employeeData);
        toast({
          title: 'Success',
          description: 'Employee created successfully',
        });
      }
      navigate('/employees');
    } catch (error: any) {
      if (error.errors) {
        Object.entries(error.errors).forEach(([field, messages]) => {
          form.setError(field as keyof EmployeeFormData, {
            message: (messages as string[])[0],
          });
        });
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save employee',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6" data-testid="employee-form-loading">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="employee-form-page">
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
          <h1 className="text-3xl font-bold tracking-tight" data-testid="form-title">
            {isEdit ? 'Edit Employee' : 'Add Employee'}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Update employee information' : 'Create a new employee record'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-firstName" />
                    </FormControl>
                    <FormMessage data-testid="error-firstName" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-lastName" />
                    </FormControl>
                    <FormMessage data-testid="error-lastName" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" data-testid="input-email" />
                    </FormControl>
                    <FormMessage data-testid="error-email" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="1234567890" data-testid="input-mobile" />
                    </FormControl>
                    <FormMessage data-testid="error-mobile" />
                  </FormItem>
                )}
              />

              <FormItem className="md:col-span-2">
                <FormLabel>Profile Picture</FormLabel>
                <div className="flex items-start gap-4">
                  {profilePicturePreview && (
                    <div className="relative">
                      <img
                        src={profilePicturePreview}
                        alt="Profile preview"
                        className="h-24 w-24 rounded-lg object-cover border"
                        data-testid="profile-preview"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={removeProfilePicture}
                        data-testid="remove-profile-picture"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  <div className="flex-1">
                    <label
                      htmlFor="profile-picture"
                      className="flex items-center justify-center gap-2 h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      data-testid="upload-profile-picture"
                    >
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Click to upload image
                      </span>
                    </label>
                    <Input
                      id="profile-picture"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              </FormItem>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} data-testid="input-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Employment Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-department">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="IT">IT</SelectItem>
                        <SelectItem value="HR">HR</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage data-testid="error-department" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-role">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Employee">Employee</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage data-testid="error-role" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="joinDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Join Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            data-testid="input-joinDate"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(new Date(field.value), "PPP") : "Pick a date"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage data-testid="error-joinDate" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        min="0"
                        data-testid="input-salary" 
                      />
                    </FormControl>
                    <FormMessage data-testid="error-salary" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        Enable if the employee is currently active
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="toggle-status"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/employees')}
              data-testid="cancel-btn"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving} data-testid="submit-btn">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" data-testid="save-spinner" />
                  Saving...
                </>
              ) : isEdit ? (
                'Update Employee'
              ) : (
                'Create Employee'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EmployeeForm;
