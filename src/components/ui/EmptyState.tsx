import React from 'react';
import { FiInbox } from 'react-icons/fi'; // Example icon

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  message: string;
  action?: React.ReactNode; // e.g., a button to create a new item
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <FiInbox size={48} className="text-muted-foreground" />,
  title = "No Results Found",
  message,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 md:p-12 ${className}`}>
      {icon && <div className="mb-4">{icon}</div>}
      {title && <h2 className="text-xl font-semibold text-foreground mb-2">{title}</h2>}
      <p className="text-muted-foreground mb-4 max-w-md">{message}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};

export default EmptyState;