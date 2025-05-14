import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FiChevronDown, FiCheck } from 'react-icons/fi'
import { tagsApi } from '../../api/tags'
import Button from '../ui/Button'
import SalaryRangeFilter from './SalaryRangeFilter'
import ErrorState from '../ui/ErrorState'; // Import ErrorState
import EmptyState from '../ui/EmptyState'; // Import EmptyState

// Job type options
const JOB_TYPES = [
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'internship', label: 'Internship' },
]

interface JobsFilterProps {
  selectedTags: string[];
  selectedJobType: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  salaryMin?: number; // Add these props
  salaryMax?: number;
  salaryCurrency?: string;
  onTagsChange: (tags: string[]) => void;
  onJobTypeChange: (jobType: string) => void;
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onSalaryChange: (min?: number, max?: number, currency?: string) => void; // Add this
  onClearFilters: () => void;
}

const JobsFilter = ({
  selectedTags,
  selectedJobType,
  sortBy,
  sortOrder,
  salaryMin, // Add these props
  salaryMax,
  salaryCurrency,
  onTagsChange,
  onJobTypeChange,
  onSortChange,
  onSalaryChange, // Add this
}: JobsFilterProps) => {
  // Fetch available tags from API
  const { 
    data: availableTags = [], 
    isLoading: isLoadingTags,
    error: tagsError, // Add error state for tags
    refetch: refetchTags // Add refetch for tags
  } = useQuery<string[], Error>({ // Specify Error type
    queryKey: ['tags'],
    queryFn: () => tagsApi.getTags(),
    retry: 1, // Or your preferred retry count
  })

  // Add state for expanded sections
  const [expandedSections, setExpandedSections] = useState({
    jobType: true,
    tags: true,
    sort: true,
    salary: true // Add this
  })

  // Add state for tag search
  const [tagSearchQuery, setTagSearchQuery] = useState('')

  // Filter tags based on search query
  const filteredTags = availableTags.filter(tag => 
    tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
  )

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Update the handleTagToggle function to properly implement multi-select
  const handleTagToggle = (tag: string) => {
    
    if (selectedTags.includes(tag)) {
      // If tag is already selected, remove it from the selection
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      // If tag is not selected, add it to the existing selection
      onTagsChange([...selectedTags, tag]);
    }
  }

  // Handle individual salary filter changes
  const handleSalaryMinChange = (min?: number) => {
    onSalaryChange(min, salaryMax, salaryCurrency);
  };
  
  const handleSalaryMaxChange = (max?: number) => {
    onSalaryChange(salaryMin, max, salaryCurrency);
  };
  
  const handleSalaryCurrencyChange = (currency?: string) => {
    onSalaryChange(salaryMin, salaryMax, currency);
  };

  return (
    <div className="w-full md:w-64 bg-card rounded-lg border border-border p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Sort | Filters</h2>
      </div>

      {/* Sort Options */}
      <div className="mb-4">
        <button
          className="flex w-full items-center justify-between font-medium mb-2 p-2 -mx-2 rounded-md hover:bg-accent/70 transition-colors duration-150" // Enhanced hover
          onClick={() => toggleSection('sort')}
        >
          <span>Sort By</span>
          <FiChevronDown
            className={`transition-transform duration-200 ${ // Added duration
              expandedSections.sort ? 'rotate-180' : ''
            }`}
          />
        </button>
        
        {expandedSections.sort && (
          <div className="space-y-1 ml-1"> {/* Reduced space-y-2 to space-y-1 for tighter packing */}
            {[
              { value: 'updated_at:desc', label: 'Latest Update' },
              { value: 'updated_at:asc', label: 'Oldest Update' },
              { value: 'created_at:desc', label: 'Newest' },
              { value: 'created_at:asc', label: 'Oldest' },
              { value: 'title:asc', label: 'Title (A-Z)' },
              { value: 'title:desc', label: 'Title (Z-A)' },
            ].map(option => (
              <div
                key={option.value}
                className={`flex items-center cursor-pointer py-1.5 px-2 rounded hover:bg-muted hover:text-foreground transition-all duration-150 ease-in-out ${ // Enhanced hover, adjusted padding
                  sortBy === option.value.split(':')[0] && sortOrder === option.value.split(':')[1] 
                    ? 'bg-primary/10 text-primary font-medium' // Added font-medium for active
                    : 'text-muted-foreground'
                }`}
                onClick={() => {
                  const [newSortBy, newSortOrder] = option.value.split(':');
                  onSortChange(newSortBy, newSortOrder as 'asc' | 'desc');
                }}
              >
                <span className="w-5">
                  {sortBy === option.value.split(':')[0] && sortOrder === option.value.split(':')[1] && (
                    <FiCheck size={16} className="text-primary" />
                  )}
                </span>
                <span className="text-sm">{option.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Job Type Filter */}
      <div className="mb-4">
        <button
          className="flex w-full items-center justify-between font-medium mb-2 p-2 -mx-2 rounded-md hover:bg-accent/70 transition-colors duration-150" // Enhanced hover
          onClick={() => toggleSection('jobType')}
        >
          <span>Job Type</span>
          <FiChevronDown
            className={`transition-transform duration-200 ${ // Added duration
              expandedSections.jobType ? 'rotate-180' : ''
            }`}
          />
        </button>
        
        {expandedSections.jobType && (
          <div className="space-y-1 ml-1"> {/* Reduced space-y-2 to space-y-1 */}
            <div 
              className={`flex items-center cursor-pointer py-1.5 px-2 rounded hover:bg-muted hover:text-foreground transition-all duration-150 ease-in-out ${ // Enhanced hover, adjusted padding
                selectedJobType === '' ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground' // Added font-medium for active
              }`}
              onClick={() => onJobTypeChange('')}
            >
              <span className="w-5">
                {selectedJobType === '' && <FiCheck size={16} className="text-primary" />}
              </span>
              <span className="text-sm">All Types</span> {/* Ensured text-sm */}
            </div>
            
            {JOB_TYPES.map(type => (
              <div
                key={type.value}
                className={`flex items-center cursor-pointer py-1.5 px-2 rounded hover:bg-muted hover:text-foreground transition-all duration-150 ease-in-out ${ // Enhanced hover, adjusted padding
                  selectedJobType === type.value ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground' // Added font-medium for active
                }`}
                onClick={() => onJobTypeChange(type.value)}
              >
                <span className="w-5">
                  {selectedJobType === type.value && (
                    <FiCheck size={16} className="text-primary" />
                  )}
                </span>
                <span className="text-sm">{type.label}</span> {/* Ensured text-sm */}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Salary Range Filter section */}
      <div className="mb-4">
        <button
          className="flex w-full items-center justify-between font-medium mb-2 p-2 -mx-2 rounded-md hover:bg-accent/70 transition-colors duration-150" // Enhanced hover
          onClick={() => toggleSection('salary')}
        >
          <span>Salary Range</span>
          <FiChevronDown
            className={`transition-transform duration-200 ${ // Added duration
              expandedSections.salary ? 'rotate-180' : ''
            }`}
          />
        </button>
        
        {expandedSections.salary && (
          <div className="space-y-2 ml-1">
            <SalaryRangeFilter
              minSalary={salaryMin}
              maxSalary={salaryMax}
              currency={salaryCurrency}
              onMinChange={handleSalaryMinChange}
              onMaxChange={handleSalaryMaxChange}
              onCurrencyChange={handleSalaryCurrencyChange}
              onSalaryChange={(min, max, currency) => onSalaryChange(min, max, currency)}
            />
          </div>
        )}
      </div>
      
      {/* Tags Filter */}
      <div>
        <button
          className="flex w-full items-center justify-between font-medium mb-2 p-2 -mx-2 rounded-md hover:bg-accent/70 transition-colors duration-150" // Enhanced hover
          onClick={() => toggleSection('tags')}
        >
          <span>Tags {selectedTags.length > 0 && `(${selectedTags.length})`}</span>
          <FiChevronDown
            className={`transition-transform duration-200 ${ // Added duration
              expandedSections.tags ? 'rotate-180' : ''
            }`}
          />
        </button>
        
        {expandedSections.tags && (
          <div>
            {/* Search box for tags */}
            <div className="mb-2">
              <input
                type="text"
                value={tagSearchQuery}
                onChange={(e) => setTagSearchQuery(e.target.value)}
                placeholder="Search tags..."
                className="w-full px-3 py-1 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                disabled={isLoadingTags || !!tagsError} // Disable search if loading or error
              />
            </div>
            
            {selectedTags.length > 0 && !isLoadingTags && !tagsError && ( // Hide if loading or error
              <div className="mb-2 py-1 px-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onTagsChange([])}
                  className="w-full text-xs justify-start text-muted-foreground hover:text-foreground"
                >
                  Clear selected tags
                </Button>
              </div>
            )}
            
            {/* Scrollable tags container */}
            <div className="space-y-1 ml-1 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
              {isLoadingTags ? (
                <div className="space-y-2 animate-pulse">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center py-1 px-2">
                      <div className="w-4 h-4 bg-muted rounded-sm mr-2"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : tagsError ? (
                <ErrorState
                  title="Error Loading Tags"
                  message="Could not fetch tags for filtering."
                  details={tagsError.message}
                  onRetry={refetchTags}
                  className="p-3 text-xs" // Smaller styling for inline use
                />
              ) : availableTags.length === 0 ? (
                <EmptyState
                  title="No Tags Available"
                  message="There are currently no tags to filter by."
                  className="p-3 text-xs" // Smaller styling for inline use
                />
              ) : filteredTags.length === 0 && tagSearchQuery ? (
                <EmptyState
                  title="No Matching Tags"
                  message={`No tags found for "${tagSearchQuery}".`}
                  className="p-3 text-xs" // Smaller styling for inline use
                />
              ) : (
                <>
                  {filteredTags.map(tag => (
                    <div
                      key={tag}
                      className={`flex items-center cursor-pointer py-1.5 px-2 rounded hover:bg-muted hover:text-foreground transition-all duration-150 ease-in-out ${ // Enhanced hover, adjusted padding
                        selectedTags.includes(tag) ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground' // Added font-medium for active
                      }`}
                      onClick={() => handleTagToggle(tag)}
                    >
                      <span className="w-5">
                        {selectedTags.includes(tag) && (
                          <FiCheck size={16} className="text-primary" />
                        )}
                      </span>
                      <span className="text-sm">{tag}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default JobsFilter