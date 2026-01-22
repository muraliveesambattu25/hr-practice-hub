import { Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AttendancePage = () => {
  return (
    <div className="space-y-6" data-testid="attendance-page">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="attendance-title">
          Attendance
        </h1>
        <p className="text-muted-foreground">
          Track and manage employee attendance records
        </p>
      </div>

      <Card data-testid="attendance-placeholder">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Attendance Management
          </CardTitle>
          <CardDescription>
            This feature is coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The attendance tracking module will allow managers and admins to:
          </p>
          <ul className="mt-4 space-y-2 text-muted-foreground">
            <li>• View daily attendance records</li>
            <li>• Mark employee attendance (Present/Absent/Leave)</li>
            <li>• Generate attendance reports</li>
            <li>• Track late arrivals and early departures</li>
            <li>• Manage leave requests</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendancePage;
