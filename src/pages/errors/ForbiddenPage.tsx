import { Link } from 'react-router-dom';
import { ShieldX, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ForbiddenPage = () => {
  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-background p-4"
      data-testid="403-page"
    >
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center">
          <ShieldX className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-6xl font-bold text-destructive mb-2" data-testid="403-code">
          403
        </h1>
        <h2 className="text-2xl font-semibold mb-2" data-testid="403-title">
          Access Denied
        </h2>
        <p className="text-muted-foreground mb-8" data-testid="403-message">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline" data-testid="403-go-back">
            <Link to="#" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Link>
          </Button>
          <Button asChild data-testid="403-go-home">
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

export default ForbiddenPage;
