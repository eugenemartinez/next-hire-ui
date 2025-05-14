import { useQuery, } from '@tanstack/react-query'
// Updated icon imports
import { FiBookmark, FiSearch, FiArrowUp, FiArrowDown, FiTrash2, FiSliders } from 'react-icons/fi' 
import { Link } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'; // Import motion, AnimatePresence, and Variants
import { jobsApi } from '../api/jobs'
import type { Job } from '../api/jobs'
import JobCard from '../components/features/JobCard'
import JobCardSkeleton from '../components/ui/skeletons/JobCardSkeleton'
import Button from '../components/ui/Button'
import useSavedJobsStore from '../stores/savedJobsStore'
import useModalStore from '../stores/modalStore' 
import { toast } from 'sonner'
import EmptyState from '../components/ui/EmptyState' 
import ErrorState from '../components/ui/ErrorState' 
import { useState, useMemo } from 'react'

// Define variants for the list container
const listContainerVariants: Variants = {
  hidden: { 
    opacity: 1 // Container itself is visible, children will be animated
  },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1 // Each child will appear 0.1s after the previous
    }
  }
};

const SavedJobsPage = () => {
  const { savedJobs, clearSavedJobs, removeJob } = useSavedJobsStore()
  const { openConfirmation } = useModalStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('updated_at') 
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [isSearchSortVisible, setIsSearchSortVisible] = useState(false); // State for search/sort visibility - Default to false

  const { data, isLoading, error, refetch } = useQuery<Job[]>({
    queryKey: ['savedJobs', savedJobs],
    queryFn: () => {
      if (savedJobs.length === 0) {
        return Promise.resolve([]) 
      }
      return jobsApi.getJobsByIds(savedJobs)
    },
    enabled: savedJobs.length > 0, 
  })
  
  const handleClearAll = () => {
    openConfirmation({
      title: 'Clear All Saved Jobs',
      message: 'Are you sure you want to remove all jobs from your saved list? This action cannot be undone.',
      confirmText: 'Clear All',
      cancelText: 'Cancel',
      variant: 'warning',
      confirmButtonVariant: 'destructive',
      onConfirm: () => {
        clearSavedJobs()
        setSearchTerm('') 
        toast.success('All saved jobs have been cleared')
      }
    })
  }
  
  const handleRemoveJob = (jobId: string) => {
    openConfirmation({
      title: 'Remove Saved Job',
      message: 'Are you sure you want to remove this job from your saved list?',
      confirmText: 'Remove',
      cancelText: 'Cancel',
      variant: 'info',
      confirmButtonVariant: 'primary',
      onConfirm: () => {
        removeJob(jobId)
        toast.success('Job removed from saved list')
      }
    })
  }

  const processedJobs = useMemo(() => {
    if (!data) return [];
    let jobsToProcess = [...data];
    if (searchTerm.trim() !== '') {
      const lowerSearchTerm = searchTerm.toLowerCase();
      jobsToProcess = jobsToProcess.filter(job => 
        job.title.toLowerCase().includes(lowerSearchTerm) ||
        job.company_name.toLowerCase().includes(lowerSearchTerm) ||
        (job.tags && job.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm))) ||
        (job.location && job.location.toLowerCase().includes(lowerSearchTerm))
      );
    }
    jobsToProcess.sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';
      switch (sortBy) {
        case 'title':
          valA = a.title.toLowerCase();
          valB = b.title.toLowerCase();
          break;
        case 'company_name':
          valA = a.company_name.toLowerCase();
          valB = b.company_name.toLowerCase();
          break;
        case 'updated_at':
          valA = new Date(a.updated_at).getTime();
          valB = new Date(b.updated_at).getTime();
          break;
        default: return 0;
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return jobsToProcess;
  }, [data, searchTerm, sortBy, sortOrder]);

  if (savedJobs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-center md:text-left">Saved Jobs</h1>
        <EmptyState
          icon={<FiBookmark size={48} className="text-muted-foreground" />}
          title="No Saved Jobs Yet"
          message="Jobs you save will appear here so you can easily find them later."
          action={
            <Link to="/jobs">
              <Button>Browse Jobs</Button>
            </Link>
          }
        />
      </div>
    )
  }
  
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Saved Jobs</h1>
        <div className="space-y-4">
          {Array.from({ length: savedJobs.length || 3 }).map((_, index) => (
            <JobCardSkeleton key={index} />
          ))}
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6 text-center md:text-left">Saved Jobs</h1>
        <ErrorState
          title="Error Loading Saved Jobs"
          message="There was a problem loading your saved jobs. Please try again."
          details={error?.message || 'An unknown error occurred.'}
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Saved Jobs</h1>
        {data && data.length > 0 && ( 
          <div className="flex items-center gap-2 sm:gap-3"> {/* Wrapper for buttons */}
            <Button
              variant="ghost"
              size="sm" // Keep button size consistent
              onClick={() => setIsSearchSortVisible(!isSearchSortVisible)}
              className="text-muted-foreground hover:text-foreground p-2 sm:p-2" // Adjusted padding for icon button feel
              aria-label={isSearchSortVisible ? "Hide search and sort controls" : "Show search and sort controls"}
              aria-expanded={isSearchSortVisible}
            >
              <FiSliders size={18} className="sm:mr-2" /> {/* Margin only on sm+ for text */}
              <span className="hidden sm:inline">
                {isSearchSortVisible ? 'Hide Controls' : 'Show Controls'}
              </span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" // Keep button size consistent
              onClick={handleClearAll}
              className="text-muted-foreground hover:text-destructive p-2 sm:p-2" // Adjusted padding
            >
              <FiTrash2 size={18} className="sm:mr-2" /> {/* Margin only on sm+ for text */}
              <span className="hidden sm:inline">Clear All ({data.length})</span>
              <span className="sm:hidden">({data.length})</span> {/* Show count on mobile */}
            </Button>
          </div>
        )}
      </div>

      {/* Search and Sort Controls - Conditionally rendered */}
      {data && data.length > 0 && isSearchSortVisible && (
        <div className="mb-6 p-4 border border-border rounded-lg bg-card">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search Input */}
            <div className="relative w-full md:flex-grow">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search saved jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Search saved jobs"
              />
            </div>
            {/* Sort by Label */}
            <label 
              htmlFor="saved-jobs-sort-select" 
              className="text-sm text-muted-foreground flex-shrink-0 hidden md:inline-block"
            >
              Sort by:
            </label>
            {/* Select Dropdown for Sort Key */}
            <select 
              id="saved-jobs-sort-select"
              value={sortBy} 
              onChange={(e) => { setSortBy(e.target.value); setSortOrder('asc');}}
              className="w-full md:w-auto px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring flex-shrink-0"
              aria-label="Sort jobs by"
            >
              <option value="updated_at">Date Updated</option>
              <option value="title">Title</option>
              <option value="company_name">Company</option>
            </select>
            {/* Sort Order Button */}
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
              className="w-full md:w-auto flex-shrink-0 py-2"
            >
              {sortOrder === 'asc' ? <FiArrowUp className="inline mr-1" size={16} /> : <FiArrowDown className="inline mr-1" size={16} />}
              <span className="md:hidden">{sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}</span>
              <span className="hidden md:inline">{sortOrder === 'asc' ? 'Oldest' : 'Newest'}</span>
            </Button>
          </div>
        </div>
      )}
      
      {/* Display Area */}
      {processedJobs.length > 0 ? (
        <motion.div 
          className="space-y-4"
          key={processedJobs.map(j => j.id).join('-') || 'saved-job-list'} // Add a key that changes with the data
          variants={listContainerVariants}
          initial="hidden"
          animate="show"
        >
          {processedJobs.map((job: Job) => (
            <JobCard 
              key={job.id} 
              job={job} 
              showActions={false} // Assuming you don't want bookmark action here
              onRemove={() => handleRemoveJob(job.id)} // Pass the specific handler
            />
          ))}
        </motion.div>
      ) : (
        <EmptyState
          title={searchTerm ? "No Jobs Match Your Search" : "Jobs Not Found"}
          message={
            searchTerm 
              ? "Try adjusting your search term or filters." 
              : "Some of your saved jobs could not be found. They may have been removed or are no longer available."
          }
          action={
            !searchTerm && (!data || data.length === 0) && savedJobs.length > 0 ? (
              <Button onClick={() => clearSavedJobs()}>
                Clear Stale Saved Jobs
              </Button>
            ) : searchTerm ? (
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Clear Search
              </Button>
            ) : undefined
          }
        />
      )}
    </div>
  )
}

export default SavedJobsPage