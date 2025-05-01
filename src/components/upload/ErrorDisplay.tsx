
import React from 'react';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorDisplayProps {
  message: string;
  onBack: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onBack }) => {
  return (
    <div className="py-8 text-center">
      <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
      <p className="text-destructive">{message}</p>
      <Button onClick={onBack} className="mt-4">
        Try Different Link
      </Button>
    </div>
  );
};

export default ErrorDisplay;
