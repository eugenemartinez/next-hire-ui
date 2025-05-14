import React from 'react';

interface TagButtonProps {
  tag: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  isActive?: boolean;
  className?: string;
  ariaLabel?: string;
}

const TagButton: React.FC<TagButtonProps> = ({
  tag,
  onClick,
  isActive = false,
  className = '',
  ariaLabel,
}) => {
  const baseClasses = "px-2.5 py-1 rounded-full text-xs truncate transition-colors cursor-pointer";
  
  const activeClasses = "bg-primary text-primary-foreground";
  const inactiveClasses = "border border-primary/50 text-primary/80 hover:bg-primary hover:text-primary-foreground";
  // For JobDetailsPage, if we want a slightly different inactive style (like it was before)
  // const detailsPageInactiveClasses = "border border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground";

  // Determine classes based on context (for now, we'll use one style for inactive, 
  // but this shows how you could differentiate if needed)
  const currentInactiveClasses = inactiveClasses; // Defaulting to JobCard's inactive style

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : currentInactiveClasses} ${className}`}
      aria-label={ariaLabel || `Filter by tag: ${tag}${isActive ? ' (active)' : ''}`}
    >
      {tag}
    </button>
  );
};

export default TagButton;