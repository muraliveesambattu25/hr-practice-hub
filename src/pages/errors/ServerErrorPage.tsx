import { Link } from 'react-router-dom';
import { ServerCrash, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ServerErrorPage = () => {
  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-background p-4"
      data-testid="500-page"
    >
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center">
          <ServerCrash className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-6xl font-bold text-destructive mb-2" data-testid="500-code">
          500
        </h1>
        <h2 className="text-2xl font-semibold mb-2" data-testid="500-title">
          Server Error
        </h2>
        <p className="text-muted-foreground mb-8" data-testid="500-message">
          Something went wrong on our end. Please try again later or contact support if the problem persists.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            data-testid="500-refresh"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Page
          </Button>
          <Button asChild data-testid="500-go-home">
            <Link to="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServerErrorPage;
