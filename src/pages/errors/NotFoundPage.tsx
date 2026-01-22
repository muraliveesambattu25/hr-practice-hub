import { Link } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFoundPage = () => {
  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-background p-4"
      data-testid="404-page"
    >
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-muted flex items-center justify-center">
          <FileQuestion className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="text-6xl font-bold text-primary mb-2" data-testid="404-code">
          404
        </h1>
        <h2 className="text-2xl font-semibold mb-2" data-testid="404-title">
          Page Not Found
        </h2>
        <p className="text-muted-foreground mb-8" data-testid="404-message">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline" data-testid="404-go-back">
            <Link to="#" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Link>
          </Button>
          <Button asChild data-testid="404-go-home">
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

export default NotFoundPage;
