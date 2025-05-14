import React from 'react';

interface JobTypePillProps {
  jobTypeSlug: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>, jobTypeSlug: string) => void;
  isActive?: boolean;
  className?: string;
}

const jobTypeStylesConfig: Record<string, { name: string; baseClasses: string; activeClasses: string; inactiveClasses: string }> = {
  'full-time': {
    name: 'Full-time',
    baseClasses: 'border text-xs px-2.5 py-1 rounded-full truncate transition-colors cursor-pointer',
    inactiveClasses: 'border-sky-500/70 text-sky-700 hover:bg-sky-500 hover:text-white',
    activeClasses: 'bg-sky-500 text-white border-sky-500',
  },
  'part-time': {
    name: 'Part-time',
    baseClasses: 'border text-xs px-2.5 py-1 rounded-full truncate transition-colors cursor-pointer',
    inactiveClasses: 'border-amber-500/70 text-amber-700 hover:bg-amber-500 hover:text-white',
    activeClasses: 'bg-amber-500 text-white border-amber-500',
  },
  'contract': {
    name: 'Contract',
    baseClasses: 'border text-xs px-2.5 py-1 rounded-full truncate transition-colors cursor-pointer',
    inactiveClasses: 'border-violet-500/70 text-violet-700 hover:bg-violet-500 hover:text-white',
    activeClasses: 'bg-violet-500 text-white border-violet-500',
  },
  'internship': {
    name: 'Internship',
    baseClasses: 'border text-xs px-2.5 py-1 rounded-full truncate transition-colors cursor-pointer',
    inactiveClasses: 'border-lime-600/70 text-lime-700 hover:bg-lime-600 hover:text-white',
    activeClasses: 'bg-lime-600 text-white border-lime-600',
  },
  'default': {
    name: 'Other',
    baseClasses: 'border text-xs px-2.5 py-1 rounded-full truncate transition-colors cursor-pointer',
    inactiveClasses: 'border-slate-500/70 text-slate-700 hover:bg-slate-500 hover:text-white',
    activeClasses: 'bg-slate-500 text-white border-slate-500',
  }
};

const getJobTypeDetails = (slug: string) => {
  const normalizedSlug = slug.toLowerCase().replace(/_/g, '-');
  const details = jobTypeStylesConfig[normalizedSlug];
  if (details) return details;

  // Fallback for unknown types: generate name and use default styles
  const formattedName = slug
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  return { ...jobTypeStylesConfig.default, name: formattedName };
};


const JobTypePill: React.FC<JobTypePillProps> = ({
  jobTypeSlug,
  onClick,
  isActive = false,
  className = '',
}) => {
  const details = getJobTypeDetails(jobTypeSlug);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(event, jobTypeSlug);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${details.baseClasses} ${isActive ? details.activeClasses : details.inactiveClasses} ${className}`}
      aria-label={`Filter by job type: ${details.name}${isActive ? ' (active)' : ''}`}
    >
      {details.name}
    </button>
  );
};

export default JobTypePill;