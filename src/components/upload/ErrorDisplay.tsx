
import React from 'react';
import { XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorDisplayProps {
  message: string;
  onBack: () => void;
  onRetry?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  message, 
  onBack, 
  onRetry 
}) => {
  return (
    <div className="py-8 text-center">
      <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
      <p className="text-destructive mb-6">{message}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {onRetry && (
          <Button 
            variant="outline" 
            onClick={onRetry} 
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        )}
        <Button onClick={onBack} className={onRetry ? "" : "mt-4"}>
          Try Different Link
        </Button>
      </div>
    </div>
  );
};

export default ErrorDisplay;
