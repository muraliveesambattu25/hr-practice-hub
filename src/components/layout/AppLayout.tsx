import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background" data-testid="app-layout">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar 
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main 
        className={cn(
          "transition-all duration-300 pt-4 px-4 pb-8",
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
        )}
        data-testid="main-content"
      >
        <Outlet />
      </main>
    </div>
  );
};
