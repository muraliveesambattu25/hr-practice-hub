import { useState, useEffect } from 'react';
import { Plus, Loader2, UserCog, Shield, ShieldCheck, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { usersApi } from '@/services/api';
import { User, UserRole } from '@/types';
import { format } from 'date-fns';

const UsersPage = () => {
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Create user dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    role: '' as UserRole | '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Reset password dialog
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [userToReset, setUserToReset] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to load users',
      });
    } finally {
      setLoading(false);
    }
  };

  const validateCreateForm = () => {
    const errors: Record<string, string> = {};
    if (!newUser.username.trim()) errors.username = 'Username is required';
    if (!newUser.password) errors.password = 'Password is required';
    if (newUser.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (!newUser.fullName.trim()) errors.fullName = 'Full name is required';
    if (!newUser.email.trim()) errors.email = 'Email is required';
    if (!newUser.role) errors.role = 'Role is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateUser = async () => {
    if (!validateCreateForm()) return;

    setSaving(true);
    try {
      await usersApi.create({
        username: newUser.username,
        password: newUser.password,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role as UserRole,
      });
      toast({
        title: 'Success',
        description: 'User created successfully',
      });
      setCreateDialogOpen(false);
      setNewUser({ username: '', password: '', fullName: '', email: '', role: '' });
      fetchUsers();
    } catch (error: any) {
      if (error.errors) {
        setFormErrors(Object.fromEntries(
          Object.entries(error.errors).map(([k, v]) => [k, (v as string[])[0]])
        ));
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create user',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
      await usersApi.updateStatus(user.id, newStatus);
      toast({
        title: 'Success',
        description: `User ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully`,
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update user status',
      });
    }
  };

  const handleResetPassword = async () => {
    if (!userToReset) return;

    if (newPassword.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Password must be at least 6 characters',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Passwords do not match',
      });
      return;
    }

    setSaving(true);
    try {
      await usersApi.resetPassword(userToReset.id, newPassword);
      toast({
        title: 'Success',
        description: 'Password reset successfully',
      });
      setResetDialogOpen(false);
      setUserToReset(null);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to reset password',
      });
    } finally {
      setSaving(false);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return <ShieldCheck className="h-4 w-4" />;
      case 'Manager':
        return <Shield className="h-4 w-4" />;
      default:
        return <UserCog className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6" data-testid="users-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="users-title">
            Users
          </h1>
          <p className="text-muted-foreground">
            Manage system user accounts and permissions
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} data-testid="create-user-btn">
          <Plus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table data-testid="users-table">
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                    <TableCell className="font-medium" data-testid="user-username">
                      {user.username}
                    </TableCell>
                    <TableCell data-testid="user-fullname">{user.fullName}</TableCell>
                    <TableCell data-testid="user-role">
                      <Badge variant="outline" className="gap-1">
                        {getRoleIcon(user.role)}
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell data-testid="user-status">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={user.status === 'Active'}
                          onCheckedChange={() => handleToggleStatus(user)}
                          data-testid={`toggle-user-${user.id}`}
                        />
                        <span className="text-sm">
                          {user.status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell data-testid="user-created">
                      {format(new Date(user.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setUserToReset(user);
                          setResetDialogOpen(true);
                        }}
                        data-testid={`reset-password-${user.id}`}
                      >
                        <Key className="mr-2 h-4 w-4" />
                        Reset Password
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent data-testid="create-user-dialog">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new system user with login credentials
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                data-testid="input-new-username"
              />
              {formErrors.username && (
                <p className="text-sm text-destructive" data-testid="error-username">
                  {formErrors.username}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                data-testid="input-new-password"
              />
              {formErrors.password && (
                <p className="text-sm text-destructive" data-testid="error-password">
                  {formErrors.password}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={newUser.fullName}
                onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                data-testid="input-new-fullname"
              />
              {formErrors.fullName && (
                <p className="text-sm text-destructive" data-testid="error-fullname">
                  {formErrors.fullName}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                data-testid="input-new-email"
              />
              {formErrors.email && (
                <p className="text-sm text-destructive" data-testid="error-email">
                  {formErrors.email}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser({ ...newUser, role: value as UserRole })}
              >
                <SelectTrigger data-testid="select-new-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Employee">Employee</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.role && (
                <p className="text-sm text-destructive" data-testid="error-role">
                  {formErrors.role}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              data-testid="cancel-create-user"
            >
              Cancel
            </Button>
            <Button onClick={handleCreateUser} disabled={saving} data-testid="submit-create-user">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create User'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent data-testid="reset-password-dialog">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for {userToReset?.fullName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                data-testid="input-new-password-reset"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                data-testid="input-confirm-password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setResetDialogOpen(false);
                setNewPassword('');
                setConfirmPassword('');
              }}
              data-testid="cancel-reset-password"
            >
              Cancel
            </Button>
            <Button onClick={handleResetPassword} disabled={saving} data-testid="submit-reset-password">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
