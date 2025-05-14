import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FiSearch, FiX, FiSliders, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { jobsApi, type Job, type JobType } from '../api/jobs'
import JobCard from '../components/features/JobCard'
import JobCardSkeleton from '../components/ui/skeletons/JobCardSkeleton';
import JobsFilter from '../components/features/JobsFilter';
import Button from '../components/ui/Button';
import useJobStore from '../stores/jobStore';
import useUserPreferences from '../stores/userPreferencesStore';
import useModalStore from '../stores/modalStore';
import { toast } from 'sonner';
import EmptyState from '../components/ui/EmptyState'; 
import ErrorState from '../components/ui/ErrorState'; 

// Reusable variants for individual elements fading/sliding in
const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

// Reusable variants for staggering children
const staggerContainerVariants: Variants = {
  hidden: { opacity: 1 }, // Container itself can be visible
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Adjust stagger delay as needed
      delayChildren: 0.1 // Optional: delay before children start animating
    }
  }
};

// Define variants for the list container
const listContainerVariants: Variants = {
  hidden: { 
    opacity: 1 
  },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1 
    }
  }
};

const JobsPage = () => {
  // Get React Router hooks for URL manipulation
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  
  // Add the modal store hook
  const { openConfirmation } = useModalStore()
  
  // Get user preferences from store
  const { 
    jobsSearch, 
    jobsPage, 
    jobsFilters, // This contains jobsFilters.tags
    setJobsSearch,
    setJobsPage,
    updateJobsFilter, // Or setJobsFilters if replacing
    setJobsFilters,   // Or this, depending on desired tag interaction
    resetJobsFilters,
    resetAllPreferences
  } = useUserPreferences()
  
  // Local state for search input (to avoid updating the store on every keystroke)
  const [searchInput, setSearchInput] = useState(jobsSearch)
  
  // Get jobs state from our centralized store
  const { setJobs, setLoading } = useJobStore()
  
  // Drawer state for mobile filter
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Effect to initialize preferences from URL params on mount
  useEffect(() => {
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || []
    const jobType = searchParams.get('job_type') || ''
    const sortBy = searchParams.get('sort_by') || 'updated_at'
    const sortOrder = (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc'
    const salaryMin = searchParams.get('salary_min') ? 
      parseInt(searchParams.get('salary_min') || '0', 10) : undefined
    const salaryMax = searchParams.get('salary_max') ? 
      parseInt(searchParams.get('salary_max') || '0', 10) : undefined
    const salaryCurrency = searchParams.get('salary_currency') || undefined
    
    // Update store with URL params, but only if they exist in URL
    // This prevents overriding existing preferences unnecessarily
    let hasParams = false
    
    if (search || page > 1 || tags.length > 0 || jobType || 
        sortBy !== 'updated_at' || sortOrder !== 'desc' ||
        salaryMin !== undefined || salaryMax !== undefined || salaryCurrency) {
      hasParams = true
      
      // Update search and page directly
      if (search) setJobsSearch(search)
      if (page > 1) setJobsPage(page)
      
      // Update filters as a batch if any filters exist
      setJobsFilters({
        tags,
        jobType,
        sortBy,
        sortOrder,
        salaryMin,
        salaryMax,
        salaryCurrency
      })
    }
    
    // If URL has no params but we have stored preferences, sync URL with preferences
    if (!hasParams && (
        jobsSearch || 
        jobsPage > 1 || 
        jobsFilters.tags.length > 0 || 
        jobsFilters.jobType || 
        jobsFilters.sortBy !== 'updated_at' || 
        jobsFilters.sortOrder !== 'desc' ||
        jobsFilters.salaryMin !== undefined ||
        jobsFilters.salaryMax !== undefined ||
        jobsFilters.salaryCurrency !== undefined
    )) {
      updateUrlFromPreferences()
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on component mount
  
  // Function to update URL from preferences
  const updateUrlFromPreferences = () => {
    const params = new URLSearchParams()
    
    // Only add params that have non-default values
    if (jobsSearch) params.set('search', jobsSearch)
    if (jobsPage > 1) params.set('page', jobsPage.toString())
    if (jobsFilters.tags.length > 0) params.set('tags', jobsFilters.tags.join(','))
    if (jobsFilters.jobType) params.set('job_type', jobsFilters.jobType)
    if (jobsFilters.sortBy !== 'updated_at') params.set('sort_by', jobsFilters.sortBy)
    if (jobsFilters.sortOrder !== 'desc') params.set('sort_order', jobsFilters.sortOrder)
    if (jobsFilters.salaryMin !== undefined) params.set('salary_min', jobsFilters.salaryMin.toString())
    if (jobsFilters.salaryMax !== undefined) params.set('salary_max', jobsFilters.salaryMax.toString())
    if (jobsFilters.salaryCurrency) params.set('salary_currency', jobsFilters.salaryCurrency)
    
    // Update URL without reloading the page
    setSearchParams(params)
  }
  
  // Effect to update URL when preferences change
  useEffect(() => {
    updateUrlFromPreferences()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobsSearch, jobsPage, jobsFilters])
  
  // Query using preferences from the store
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['jobs', jobsPage, jobsSearch, jobsFilters],
    queryFn: () => {
      return jobsApi.getJobs({
        page: jobsPage,
        size: 10,
        search: jobsSearch || undefined,
        tags: jobsFilters.tags.length > 0 ? jobsFilters.tags : undefined,
        // Cast jobType to JobType if you are sure it conforms, or handle conversion
        job_type: (jobsFilters.jobType as JobType) || undefined,
        sort_by: jobsFilters.sortBy,
        sort_order: jobsFilters.sortOrder,
        salary_min: jobsFilters.salaryMin,
        salary_max: jobsFilters.salaryMax,
        salary_currency: jobsFilters.salaryCurrency
      });
    }
  })
  
  // Update our centralized store whenever the data changes
  useEffect(() => {
    if (data?.jobs) {
      setJobs(data.jobs);
    }
    setLoading(isLoading);
  }, [data, isLoading, setJobs, setLoading]);
  
  // Effect to sync search input with stored search when the component mounts or jobsSearch changes
  useEffect(() => {
    setSearchInput(jobsSearch);
  }, [jobsSearch]);
  
  // Submit handler now updates the search in the preferences store
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setJobsSearch(searchInput)
    setJobsPage(1) // Reset to first page on new search
  }
  
  // Filter handlers now update the preferences store
  const handleTagsChange = (tags: string[]) => {
    updateJobsFilter('tags', tags)
    setJobsPage(1) // Reset to first page on filter change
  }
  
  const handleJobTypeChange = (jobType: string) => {
    updateJobsFilter('jobType', jobType)
    setJobsPage(1) // Reset to first page on filter change
  }
  
  // Sort handler
  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    updateJobsFilter('sortBy', sortBy)
    updateJobsFilter('sortOrder', sortOrder)
  }
  
  // Salary filter handler
  const handleSalaryChange = (min?: number, max?: number, currency?: string) => {
    updateJobsFilter('salaryMin', min)
    updateJobsFilter('salaryMax', max)
    updateJobsFilter('salaryCurrency', currency)
    setJobsPage(1) // Reset to first page on filter change
  }
  
  // Clear all filters, search, and reset to page 1
  // Update to use confirmation modal
  const handleClearAll = () => {
    if (jobsSearch || jobsPage > 1 || 
        jobsFilters.tags.length > 0 || 
        jobsFilters.jobType !== '' || 
        jobsFilters.sortBy !== 'updated_at' || 
        jobsFilters.sortOrder !== 'desc' ||
        jobsFilters.salaryMin !== undefined ||
        jobsFilters.salaryMax !== undefined ||
        jobsFilters.salaryCurrency !== undefined) {
      
      openConfirmation({
        title: 'Clear All Filters & Search',
        message: 'Are you sure you want to reset all search criteria and filters?',
        confirmText: 'Clear All',
        cancelText: 'Cancel',
        variant: 'info',
        confirmButtonVariant: 'primary',
        onConfirm: () => {
          resetAllPreferences()
          setSearchInput('') // Also clear the local search input
          // Clear URL params too
          navigate('/jobs', { replace: true })
          toast.success('All filters and search have been cleared')
          setIsFilterDrawerOpen(false); // Close the filter drawer if open
        }
      })
    }
  }
  
  // Check if any filters, search, or non-default pagination is active
  const hasActiveFiltersOrSearch = 
    jobsFilters.tags.length > 0 || 
    jobsFilters.jobType !== '' || 
    jobsFilters.sortBy !== 'updated_at' || 
    jobsFilters.sortOrder !== 'desc' ||
    jobsFilters.salaryMin !== undefined ||
    jobsFilters.salaryMax !== undefined ||
    jobsFilters.salaryCurrency !== undefined ||
    jobsSearch !== '' ||
    jobsPage > 1;
  
  // NEW: Handler for when a tag is clicked on a JobCard
  const handleApplyTagFilter = (tag: string) => {
    const currentTags = jobsFilters.tags || [];
    let newTags: string[];

    if (currentTags.includes(tag)) {
      // If tag is already active, remove it (toggle off)
      newTags = currentTags.filter(t => t !== tag);
    } else {
      // If tag is not active, add it (toggle on)
      newTags = [...currentTags, tag];
    }

    updateJobsFilter('tags', newTags);
    setJobsPage(1); // Reset to first page when filters change
  };

  const handleApplyJobTypeFilter = (jobTypeSlug: string) => {
    // Assuming job_type is a single select filter
    // If it's multi-select, the logic would be similar to handleApplyTagFilter
    updateJobsFilter('jobType', jobTypeSlug); // <-- CORRECTED: 'job_type' to 'jobType'
    setJobsPage(1); // Reset to first page
  };
  
  return (
    <motion.div // Optional: Animate the whole page container on initial load
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } }
      }}
    >
      {/* Header */}
      <motion.div 
        className="mb-8 text-center sm:text-left"
        variants={staggerContainerVariants} // Stagger h1 and p
        initial="hidden"
        animate="visible"
      >
        <motion.h1 
          className="text-3xl font-bold text-foreground mb-2"
          variants={fadeInUpVariants}
        >
          Find Your Next Opportunity
        </motion.h1>
        <motion.p 
          className="text-muted-foreground"
          variants={fadeInUpVariants}
        >
          Browse our collection of job opportunities across tech and beyond
        </motion.p>
      </motion.div>
      
      {/* Search bar and Mobile/Tablet Filter Toggle */}
      <motion.div 
        className="mb-6 flex flex-col sm:flex-row gap-4 items-center"
        variants={fadeInUpVariants} // Animate this block as one
        initial="hidden"
        animate="visible"
      >
        <form onSubmit={handleSearch} className="w-full sm:flex-grow">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-20 sm:pr-24 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button 
              type="submit"
              size="sm"
              variant="primary"
              className="absolute right-1 top-1/2 -translate-y-1/2"
            >
              Search
            </Button>
          </div>
        </form>
        <Button
          variant="outline"
          className="w-full sm:w-auto lg:hidden flex items-center justify-center gap-2" 
          onClick={() => setIsFilterDrawerOpen(true)}
          aria-label="Open filters"
          aria-expanded={isFilterDrawerOpen}
        >
          <FiSliders size={16} />
          Filters
        </Button>
      </motion.div>

      {/* Backdrop for filter drawer - hidden on lg screens and up */}
      {/* We can also animate the backdrop if desired, but let's start with the drawer */}
      <AnimatePresence>
        {isFilterDrawerOpen && (
          <motion.div 
            key="backdrop" // Add a key for AnimatePresence
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setIsFilterDrawerOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
      
      {/* Main content with sidebar layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters - Responsive */}
        {/* Mobile Drawer - Animated */}
        <AnimatePresence>
          {isFilterDrawerOpen && (
            <motion.aside 
              key="mobile-filter-drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-40 w-72 bg-background p-4 shadow-xl overflow-y-auto lg:hidden"
              aria-label="Job filters mobile"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Filters</h2>
                <Button 
                  variant="ghost" 
                  iconOnly 
                  icon={<FiX size={20} />}
                  size="sm"
                  onClick={() => setIsFilterDrawerOpen(false)} 
                  aria-label="Close filters"
                />
              </div>
              {hasActiveFiltersOrSearch && (
                <div className="mb-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-sm text-muted-foreground flex items-center justify-center gap-2"
                    onClick={handleClearAll}
                  >
                    <FiX size={16} />
                    Clear All Filters & Search
                  </Button>
                </div>
              )}
              <JobsFilter 
                selectedTags={jobsFilters.tags}
                selectedJobType={jobsFilters.jobType}
                sortBy={jobsFilters.sortBy}
                sortOrder={jobsFilters.sortOrder}
                salaryMin={jobsFilters.salaryMin}
                salaryMax={jobsFilters.salaryMax}
                salaryCurrency={jobsFilters.salaryCurrency}
                onTagsChange={handleTagsChange}
                onJobTypeChange={handleJobTypeChange}
                onSortChange={handleSortChange}
                onSalaryChange={handleSalaryChange}
                onClearFilters={() => {
                  resetJobsFilters();
                }}
              />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar - Static */}
        <aside 
          className="hidden lg:block lg:w-64 lg:flex-shrink-0 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] overflow-y-auto" // Adjusted for sticky behavior
          aria-label="Job filters desktop"
        >
          {hasActiveFiltersOrSearch && (
            <div className="mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-sm text-muted-foreground flex items-center justify-center gap-2"
                onClick={handleClearAll}
              >
                <FiX size={16} />
                Clear All Filters & Search
              </Button>
            </div>
          )}
          <JobsFilter 
            selectedTags={jobsFilters.tags}
            selectedJobType={jobsFilters.jobType}
            sortBy={jobsFilters.sortBy}
            sortOrder={jobsFilters.sortOrder}
            salaryMin={jobsFilters.salaryMin}
            salaryMax={jobsFilters.salaryMax}
            salaryCurrency={jobsFilters.salaryCurrency}
            onTagsChange={handleTagsChange}
            onJobTypeChange={handleJobTypeChange}
            onSortChange={handleSortChange}
            onSalaryChange={handleSalaryChange}
            onClearFilters={() => {
              resetJobsFilters();
            }}
          />
        </aside>
        
        {/* Main content (right side) */}
        <div className="flex-1">
          {/* Loading state */}
          {isLoading && (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <JobCardSkeleton key={index} />
              ))}
            </div>
          )}
          
          {/* Error state */}
          {!isLoading && error && (
            <ErrorState
              title="Failed to Load Jobs"
              message="We encountered an issue while trying to fetch job listings. Please check your connection and try again."
              details={error?.message || 'An unknown error occurred.'} 
              onRetry={() => refetch()} // Use refetch from useQuery
            />
          )}
          
          {/* Jobs list and Empty State */}
          {!isLoading && !error && (
            <>
              {/* Active filters summary */}
              {(jobsFilters.tags.length > 0 || jobsFilters.jobType || 
                jobsFilters.salaryMin !== undefined || 
                jobsFilters.salaryMax !== undefined || 
                jobsFilters.salaryCurrency !== undefined ||
                jobsSearch // Also animate if search term is active
              ) && (
                <motion.div 
                  className="mb-4" // Container for all active filter/search pills
                  variants={staggerContainerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {/* Conditionally render the "Active filters:" text if any filter (not search) is active */}
                  {(jobsFilters.tags.length > 0 || jobsFilters.jobType || 
                    jobsFilters.salaryMin !== undefined || 
                    jobsFilters.salaryMax !== undefined || 
                    jobsFilters.salaryCurrency !== undefined) && (
                    <motion.span 
                      className="text-sm text-muted-foreground mr-2 mb-2 inline-block"
                      variants={fadeInUpVariants}
                    >
                      Active filters:
                    </motion.span>
                  )}

                  {/* Show active search term if present */}
                  {jobsSearch && (
                    <motion.div className="mb-2 inline-block mr-2" variants={fadeInUpVariants}>
                      <span className="text-sm text-muted-foreground">Search: </span>
                      <span className="inline-flex items-center border border-primary text-primary bg-transparent px-2 py-1 rounded-full text-xs">
                        "{jobsSearch}"
                        <button 
                          className="ml-1 hover:text-destructive" 
                          onClick={() => {
                            setJobsSearch('')
                            setSearchInput('')
                          }}
                          aria-label="Clear search"
                        >
                          ×
                        </button>
                      </span>
                    </motion.div>
                  )}
                  
                  {jobsFilters.jobType && (
                    <motion.span 
                      className="inline-flex items-center border border-primary text-primary bg-transparent px-2 py-1 rounded-full text-xs mr-2 mb-2"
                      variants={fadeInUpVariants}
                    >
                      {jobsFilters.jobType}
                      <button 
                        className="ml-1 hover:text-destructive cursor-pointer" 
                        onClick={() => handleJobTypeChange('')}
                        aria-label="Remove job type filter"
                      >
                        ×
                      </button>
                    </motion.span>
                  )}
                  
                  {jobsFilters.tags.map(tag => (
                    <motion.span 
                      key={tag}
                      className="inline-flex items-center border border-primary text-primary bg-transparent px-2 py-1 rounded-full text-xs mr-2 mb-2"
                      variants={fadeInUpVariants}
                    >
                      {tag}
                      <button 
                        className="ml-1 hover:text-destructive cursor-pointer" 
                        onClick={() => handleTagsChange(jobsFilters.tags.filter(t => t !== tag))}
                        aria-label={`Remove tag filter: ${tag}`}
                      >
                        ×
                      </button>
                    </motion.span>
                  ))}
                  
                  {(jobsFilters.salaryMin !== undefined || jobsFilters.salaryMax !== undefined || jobsFilters.salaryCurrency) && (
                    <motion.span 
                      className="inline-flex items-center border border-primary text-primary bg-transparent px-2 py-1 rounded-full text-xs mr-2 mb-2"
                      variants={fadeInUpVariants}
                    >
                      Salary: 
                      {jobsFilters.salaryCurrency && ` ${jobsFilters.salaryCurrency}`}
                      {jobsFilters.salaryMin !== undefined && ` ${jobsFilters.salaryMin}`}
                      {jobsFilters.salaryMin !== undefined && jobsFilters.salaryMax !== undefined && ' -'}
                      {jobsFilters.salaryMax !== undefined && ` ${jobsFilters.salaryMax}`}
                      <button 
                        className="ml-1 hover:text-destructive cursor-pointer" 
                        onClick={() => handleSalaryChange(undefined, undefined, undefined)}
                        aria-label="Remove salary filter"
                      >
                        ×
                      </button>
                    </motion.span>
                  )}
                  

                </motion.div>
              )}
            
              {/* Job results display - This part already has motion.div for cards */}
              {data?.jobs && data.jobs.length > 0 ? (
                <>
                  <motion.div 
                    className="space-y-4"
                    key={data.jobs.map(j => j.id).join('-') || 'job-list'}
                    variants={listContainerVariants}
                    initial="hidden"
                    animate="show"
                  >
                    {data.jobs.map((job: Job) => (
                      <JobCard 
                        key={job.id} 
                        job={job} 
                        onTagClick={handleApplyTagFilter}
                        activeTags={jobsFilters.tags || []}
                        onJobTypeClick={handleApplyJobTypeFilter}
                        activeJobType={jobsFilters.jobType}
                      />
                    ))}
                  </motion.div>
                  
                  {/* End of list indicator - show only when we're on the last page */}
                  {jobsPage >= Math.ceil((data?.total || 0) / (data?.limit || 10)) && (
                    <div className="mt-6 text-center border-t border-border pt-4">
                      <p className="text-sm text-muted-foreground">
                        {data.total > 0 
                          ? `You've reached the end of the list • ${data.total} job${data.total !== 1 ? 's' : ''} found`
                          : 'No more jobs to display'}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                // Use EmptyState component here
                <EmptyState
                  title="No Jobs Found"
                  message="We couldn't find any jobs matching your current search criteria or filters. Try adjusting them or check back later!"
                  // Optionally, add an action, e.g., a button to clear filters
                  action={
                    hasActiveFiltersOrSearch ? (
                      <Button variant="outline" onClick={handleClearAll}>
                        Clear All Filters & Search
                      </Button>
                    ) : undefined
                  }
                />
              )}
            </>
          )}
          
          {/* Pagination - now using preferences store */}
          {data?.total !== undefined && data.total > 0 && data.total > (data?.limit || 10) && (
            <motion.div 
              className="mt-8 flex justify-center"
              variants={fadeInUpVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="flex items-center gap-1 sm:gap-2"> {/* Adjusted gap for more items */}
                <Button
                  variant="outline"
                  size="sm" // Consistent button sizing
                  onClick={() => setJobsPage(Math.max(1, jobsPage - 1))}
                  disabled={jobsPage === 1}
                  aria-label="Previous page"
                >
                  <FiChevronLeft size={18} className="mr-1 hidden sm:inline" /> {/* Icon sizing and conditional text */}
                  Prev
                </Button>
                
                {(() => {
                  const totalPages = Math.ceil((data?.total || 0) / (data?.limit || 10));
                  
                  // This is where you'd implement or call a helper function
                  // to get the array of page numbers/ellipsis to display.
                  // For example: getPageNumbersToDisplay(jobsPage, totalPages, 1); 
                  // (1 neighbour on each side of current page)
                  //
                  // For simplicity in this example, let's imagine a basic array generation.
                  // A real implementation would be more robust.
                  const pageNumbersToDisplay: (number | string)[] = [];
                  const pageNeighbours = 1; // Number of pages to show on each side of current

                  // Add first page
                  pageNumbersToDisplay.push(1);

                  // Add left ellipsis if needed
                  if (jobsPage > pageNeighbours + 2 && totalPages > (pageNeighbours * 2) + 3) {
                    pageNumbersToDisplay.push('...');
                  }

                  // Add pages around current
                  const startPage = Math.max(2, jobsPage - pageNeighbours);
                  const endPage = Math.min(totalPages - 1, jobsPage + pageNeighbours);
                  for (let i = startPage; i <= endPage; i++) {
                    if (!pageNumbersToDisplay.includes(i)) {
                      pageNumbersToDisplay.push(i);
                    }
                  }
                  
                  // Add right ellipsis if needed
                  if (jobsPage < totalPages - pageNeighbours - 1 && totalPages > (pageNeighbours * 2) + 3) {
                     // Ensure no duplicate '...' if endPage was already totalPages - 1
                    if (pageNumbersToDisplay[pageNumbersToDisplay.length -1] !== totalPages -1) {
                        pageNumbersToDisplay.push('...');
                    }
                  }
                  
                  // Add last page if not already included
                  if (totalPages > 1 && !pageNumbersToDisplay.includes(totalPages)) {
                    pageNumbersToDisplay.push(totalPages);
                  }
                  
                  // Filter out consecutive '...' which might happen with simple logic
                  const finalPages = pageNumbersToDisplay.filter((item, index, arr) => {
                      return item !== '...' || (item === '...' && arr[index-1] !== '...');
                  });


                  return finalPages.map((page, index) => (
                    typeof page === 'number' ? (
                      <Button
                        key={`page-${page}`}
                        variant={jobsPage === page ? 'primary' : 'outline'}
                        size="sm" // Consistent button sizing
                        className="w-9 h-9 p-0 sm:w-10 sm:h-10" // Fixed size for page numbers
                        onClick={() => setJobsPage(page)}
                        aria-label={`Go to page ${page}`}
                        aria-current={jobsPage === page ? 'page' : undefined}
                      >
                        {page}
                      </Button>
                    ) : (
                      <span 
                        key={`ellipsis-${index}`} 
                        className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 text-muted-foreground"
                        aria-hidden="true"
                      >
                        {page}
                      </span>
                    )
                  ));
                })()}
                
                <Button
                  variant="outline" 
                  size="sm" // Consistent button sizing
                  onClick={() => setJobsPage(Math.min(Math.ceil((data?.total || 0) / (data?.limit || 10)), jobsPage + 1))}
                  disabled={jobsPage >= Math.ceil((data?.total || 0) / (data?.limit || 10))}
                  aria-label="Next page"
                >
                  Next
                  <FiChevronRight size={18} className="ml-1 hidden sm:inline" /> {/* Icon sizing and conditional text */}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default JobsPage