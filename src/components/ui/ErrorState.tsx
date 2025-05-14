import React from 'react';
import { FiAlertCircle } from 'react-icons/fi'; // Example icon
import Button from './Button'; // Assuming you have a Button component

interface ErrorStateProps {
  icon?: React.ReactNode;
  title?: string;
  message: string;
  details?: string; // For more specific error details, if available
  onRetry?: () => void;
  retryText?: string;
  className?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  icon = <FiAlertCircle size={48} className="text-destructive" />,
  title = "Something Went Wrong",
  message,
  details,
  onRetry,
  retryText = "Try Again",
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 md:p-12 bg-destructive/5 border border-destructive/20 rounded-lg ${className}`}>
      {icon && <div className="mb-4">{icon}</div>}
      {title && <h2 className="text-xl font-semibold text-destructive mb-2">{title}</h2>}
      <p className="text-destructive/90 mb-3 max-w-md">{message}</p>
      {details && <p className="text-xs text-destructive/70 mb-4 max-w-md">{details}</p>}
      {onRetry && (
        <Button variant="destructive" onClick={onRetry}>
          {retryText}
        </Button>
      )}
    </div>
  );
};

export default ErrorState;