import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserCog, 
  Calendar, 
  UserCircle, 
  Settings, 
  HelpCircle,
  FlaskConical,
  ChevronLeft,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserRole } from '@/types';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

interface MenuItem {
  title: string;
  icon: React.ElementType;
  path: string;
  roles: UserRole[];
  testId: string;
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    roles: ['Admin', 'Manager', 'Employee'],
    testId: 'nav-dashboard',
  },
  {
    title: 'Employees',
    icon: Users,
    path: '/employees',
    roles: ['Admin', 'Manager', 'Employee'],
    testId: 'nav-employees',
  },
  {
    title: 'Users',
    icon: UserCog,
    path: '/users',
    roles: ['Admin'],
    testId: 'nav-users',
  },
  {
    title: 'Attendance',
    icon: Calendar,
    path: '/attendance',
    roles: ['Admin', 'Manager'],
    testId: 'nav-attendance',
  },
  {
    title: 'Profile',
    icon: UserCircle,
    path: '/profile',
    roles: ['Employee'],
    testId: 'nav-profile',
  },
  {
    title: 'Settings',
    icon: Settings,
    path: '/settings',
    roles: ['Admin', 'Manager', 'Employee'],
    testId: 'nav-settings',
  },
  {
    title: 'Help',
    icon: HelpCircle,
    path: '/help',
    roles: ['Admin', 'Manager', 'Employee'],
    testId: 'nav-help',
  },
  {
    title: 'Automation Lab',
    icon: FlaskConical,
    path: '/automation-lab',
    roles: ['Admin', 'Manager', 'Employee'],
    testId: 'nav-automation-lab',
  },
];

export const Sidebar = ({ isOpen, isCollapsed, onClose, onToggleCollapse }: SidebarProps) => {
  const { user } = useAuth();
  const location = useLocation();

  const filteredMenuItems = menuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          data-testid="sidebar-overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] bg-sidebar border-r border-sidebar-border transition-all duration-300",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "lg:w-16" : "lg:w-64",
          "w-64"
        )}
        data-testid="sidebar"
      >
        <div className="flex flex-col h-full">
          {/* Mobile close button */}
          <div className="flex items-center justify-end p-2 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              data-testid="sidebar-close"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Menu items */}
          <ScrollArea className="flex-1 px-3 py-2">
            <nav className="space-y-1" data-testid="sidebar-nav">
              {filteredMenuItems.map((item) => {
                const isActive = location.pathname === item.path || 
                  (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive 
                        ? "bg-sidebar-accent text-sidebar-primary" 
                        : "text-sidebar-foreground"
                    )}
                    data-testid={item.testId}
                    data-active={isActive}
                  >
                    <item.icon className={cn("h-5 w-5 shrink-0", isCollapsed && "lg:mx-auto")} />
                    <span className={cn(isCollapsed && "lg:hidden")}>
                      {item.title}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Collapse toggle (desktop only) */}
          <div className="hidden lg:flex items-center justify-end p-3 border-t border-sidebar-border">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="h-8 w-8"
              data-testid="sidebar-collapse-toggle"
            >
              <ChevronLeft 
                className={cn(
                  "h-4 w-4 transition-transform",
                  isCollapsed && "rotate-180"
                )} 
              />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};
