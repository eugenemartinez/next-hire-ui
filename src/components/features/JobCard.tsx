import { Link, useNavigate } from 'react-router-dom'
import { FiBookmark, FiClock, FiUser, FiMapPin, FiX } from 'react-icons/fi'
import { motion, type Variants } from 'framer-motion' // Import Variants type
import { type Job } from '../../api/jobs'
import useSavedJobsStore from '../../stores/savedJobsStore'
import useJobStore from '../../stores/jobStore' // Direct import for selecting state
import Card from '../ui/Card'
import Button from '../ui/Button'
import TagButton from '../ui/TagButton';
import JobTypePill from '../ui/JobTypePill'; // <-- Import JobTypePill
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query' // Added for invalidation

// Enhanced date formatting with relative time support
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  // Show relative time for recent dates
  if (diffInDays === 0) {
    return 'Today'
  } else if (diffInDays === 1) {
    return 'Yesterday'
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`
  } else {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }
}

// Update the formatSalary function to handle all supported currencies

// Format salary range
const formatSalary = (min: number | null, max: number | null, currency: string | null) => {
  if (!min && !max) return null
  
  // Map currency codes to their symbols, matching the backend's PopularCurrency enum
  const currencySymbol = currency === 'USD' ? '$' : 
                         currency === 'EUR' ? '€' : 
                         currency === 'GBP' ? '£' : 
                         currency === 'CAD' ? 'CA$' : 
                         currency === 'AUD' ? 'A$' : 
                         currency || ''
  
  if (min && max) {
    // For clarity in ranges, only show the currency symbol once at the beginning
    return `${currencySymbol}${min.toLocaleString()}-${max.toLocaleString()}`
  } else if (min) {
    return `${currencySymbol}${min.toLocaleString()}+`
  } else if (max) {
    return `Up to ${currencySymbol}${max.toLocaleString()}`
  }
  
  return null
}

// Updated truncateText function
const truncateText = (text: string, maxLength: number) => {
  // More robust HTML tag and entity stripping
  const strippedText = text
    .replace(/<\/?[^>]+(>|$)/g, "") // Remove HTML tags
    .replace(/&nbsp;/g, ' ')         // Replace non-breaking spaces
    .replace(/&amp;/g, '&')          // Replace &amp; with &
    .replace(/&lt;/g, '<')           // Replace &lt; with <
    .replace(/&gt;/g, '>')           // Replace &gt; with >
    .replace(/&quot;/g, '"')         // Replace &quot; with "
    .replace(/&#39;/g, "'")          // Replace &#39; with '
    .replace(/\s+/g, ' ')            // Normalize whitespace
    .trim();
  
  if (strippedText.length <= maxLength) return strippedText;
  return `${strippedText.substring(0, maxLength).trim()}...`;
}

// Check if dates are meaningfully different (more than 1 day apart)
const isDatesSignificantlyDifferent = (created: string, updated: string) => {
  const createdDate = new Date(created)
  const updatedDate = new Date(updated)
  const diffInDays = Math.floor((updatedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
  return diffInDays > 1
}

interface JobCardProps {
  job?: Job
  jobId?: string
  showActions?: boolean
  onRemove?: (jobId: string) => void
  onTagClick?: (tag: string) => void;
  activeTags?: string[];
  onJobTypeClick?: (jobTypeSlug: string) => void; // <-- New prop
  activeJobType?: string; // <-- New prop
}

// Define variants for the JobCard animation
const jobCardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const JobCard = ({ 
  job: propJob, 
  jobId, 
  showActions = true,
  onRemove,
  onTagClick,
  activeTags = [],
  onJobTypeClick,
  activeJobType
}: JobCardProps) => {
  const navigate = useNavigate();
  const jobFromStore = useJobStore(state => (jobId ? state.jobsById[jobId] : undefined));
  // Prioritize jobFromStore if jobId is provided and the job exists in the store.
  const job = (jobId && jobFromStore) ? jobFromStore : propJob;
  const { addJob: saveJobToStore, removeJob: unsaveJobFromStore, isJobSaved } = useSavedJobsStore();
  const queryClient = useQueryClient();

  if (!job) {
    return null; 
  }

  const isSaved = isJobSaved(job.id);
  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);
  const showUpdated = isDatesSignificantlyDifferent(job.created_at, job.updated_at);
  const dateDisplay = showUpdated ? 
    `Updated ${formatDate(job.updated_at)}` : 
    `Posted ${formatDate(job.created_at)}`;
  
  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSaved) {
      unsaveJobFromStore(job.id);
      toast.success('Job removed from saved list');
    } else {
      saveJobToStore(job.id);
      toast.success('Job saved to your list');
    }
    queryClient.invalidateQueries({ queryKey: ['savedJobs'] });
  };
  
  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemove) {
      onRemove(job.id);
    }
  };

  const handleTagClickInternal = (e: React.MouseEvent, tag: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (onTagClick) {
      onTagClick(tag);
    } else {
      navigate(`/jobs?tags=${encodeURIComponent(tag)}`);
    }
  };

  const handleJobTypeClickInternal = (e: React.MouseEvent, jobTypeSlug: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (onJobTypeClick) {
      onJobTypeClick(jobTypeSlug);
    } else {
      navigate(`/jobs?job_type=${encodeURIComponent(jobTypeSlug)}`);
    }
  };
  
  return (
    <motion.div 
      variants={jobCardVariants}
      // `initial` and `animate` props will be controlled by the parent's variant propagation
    >
      <Card 
        variant="bordered" 
        className="hover:border-primary/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-in-out relative h-full flex flex-col"
      >
        {onRemove && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:text-destructive hover:scale-110 transition-all duration-200 ease-in-out z-10"
            onClick={handleRemove}
            aria-label="Remove job"
          >
            <FiX size={16} />
          </Button>
        )}
        
        <Link to={`/jobs/${job.id}`} className="p-5 flex-grow flex flex-col justify-between">
          <div> {/* Wrapper for top content */}
            {/* Section 1: Title, Company, Location, Salary, Bookmark */}
            <div className="flex justify-between items-start gap-3">
              {/* Left part: Title, Company, Location, Salary */}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-foreground truncate">
                  {job.title}
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground mt-1">
                  <span className="flex items-center gap-1 min-w-0">
                    <FiUser size={14} className="flex-shrink-0" />
                    <span className="truncate">{job.company_name}</span>
                  </span>
                  
                  {job.location && (
                    <span className="flex items-center gap-1 min-w-0">
                      <FiMapPin size={14} className="flex-shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </span>
                  )}
                  
                  {salary && (
                    <span className="flex items-center gap-1 min-w-0">
                      <span className="truncate">{salary}</span>
                    </span>
                  )}
                </div>
              </div>
              
              {/* Right part: Bookmark button */}
              {showActions && !onRemove && (
                <div className="flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`p-2 ${isSaved ? 'text-primary' : 'text-muted-foreground'} hover:scale-110 transition-all duration-200 ease-in-out`}
                    onClick={handleToggleSave}
                    aria-label={isSaved ? 'Unsave job' : 'Save job'}
                  >
                    <FiBookmark size={18} className={isSaved ? 'fill-primary' : ''} />
                  </Button>
                </div>
              )}
            </div>
            
            {/* Section 2: Description */}
            <p className="mt-3 text-sm text-foreground/90 line-clamp-3 break-words">
              {truncateText(job.description, 150)}
            </p>
          </div>
          
          {/* Section 3: Job Type, Tags, Date - Pushed to bottom */}
          <div className="flex flex-wrap justify-between items-center mt-4 text-sm text-muted-foreground gap-x-4 gap-y-1"> {/* Increased mt for spacing */}
            {/* Left part: Job Type, Tags */}
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              {job.job_type && (
                <JobTypePill
                  jobTypeSlug={job.job_type}
                  onClick={(e) => handleJobTypeClickInternal(e, job.job_type!)}
                  isActive={activeJobType === job.job_type}
                  className="transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm"
                />
              )}
              
              {job.tags && job.tags.slice(0, 3).map(tag => {
                const isActiveTag = activeTags.includes(tag);
                return (
                  <TagButton
                    key={tag}
                    tag={tag}
                    onClick={(e) => handleTagClickInternal(e, tag)}
                    isActive={isActiveTag}
                    className="transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm"
                  />
                );
              })}
              
              {job.tags && job.tags.length > 3 && (
                <span className="text-xs text-muted-foreground py-1 flex-shrink-0">
                  +{job.tags.length - 3} more
                </span>
              )}
            </div>
            
            {/* Right part: Date */}
            <span className="flex items-center gap-1 whitespace-nowrap flex-shrink-0">
              <FiClock size={14} />
              {dateDisplay}
            </span>
          </div>
        </Link>
      </Card>
    </motion.div>
  );
};

export default JobCard;