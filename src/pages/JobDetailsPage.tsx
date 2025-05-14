import { useState, useEffect, useCallback, useRef } from 'react' 
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, type Variants } from 'framer-motion'; // Ensure motion and Variants are imported
import { 
  FiEdit, 
  FiTrash2, 
  FiExternalLink, 
  FiBookmark, 
  FiLock, 
  FiCalendar, 
  FiUser, 
  FiMapPin, 
  FiShare2, 
  FiLink, 
  FiCheck, 
  FiBriefcase, 
  FiMoreVertical 
} from 'react-icons/fi'
import { BiBuildingHouse } from 'react-icons/bi'
import { jobsApi, type Job, type JobVerificationResponse } from '../api/jobs' 
import Button from '../components/ui/Button' // Assuming these are correct paths
import Card from '../components/ui/Card'     // Assuming these are correct paths
import useSavedJobsStore from '../stores/savedJobsStore'; 
import useModificationCodesStore from '../stores/modificationCodesStore'
import useJobStore from '../stores/jobStore'
import useModalStore from '../stores/modalStore' 
import { isAxiosError } from 'axios'; 
import { toast } from 'sonner'
import TagButton from '../components/ui/TagButton'; 
import useUserPreferences from '../stores/userPreferencesStore'; 
import RelatedJobs from '../components/features/RelatedJobs';
import JobDetailsSkeleton from '../components/ui/skeletons/JobDetailsSkeleton'; 
import ErrorState from '../components/ui/ErrorState'; 

interface HttpError extends Error {
  response?: {
    status?: number;
    data?: { message?: string }; 
  };
}

// RENAMED and UPDATED: Framer Motion Variant for content blocks
const contentBlockFadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 }, // Start slightly lower and transparent
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }, // End at normal position and opaque
};

const JobDetailsPage = () => {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { setCurrentJob, deleteJob: storeDeleteJob } = useJobStore()
  const { removeJob: unsaveJobFromStore } = useSavedJobsStore(); 
  const { addJob: saveJob, removeJob: unsaveJob, isJobSaved } = useSavedJobsStore()
  const { addCode, getCode, hasCode } = useModificationCodesStore()
  const { openVerification, openConfirmation, closeModal } = useModalStore()
  
  const { jobsPage, jobsSearch, jobsFilters } = useUserPreferences.getState();

  const [isVerified, setIsVerified] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [isDeleting, setIsDeleting] = useState(false); 

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  const checkStoredVerification = useCallback((id: string) => { 
    if (hasCode(id)) {
      setIsVerified(true)
      return true
    }
    return false
  }, [hasCode])

  const { data: job, isLoading, error, refetch } = useQuery<Job, HttpError>({ 
    queryKey: ['job', jobId],
    queryFn: () => {
      if (!jobId) return Promise.reject(new Error("Job ID is missing")); 
      return jobsApi.getJob(jobId)
    },
    enabled: !!jobId && !isDeleting, 
    retry: (failureCount, err) => { 
      if (err.response?.status === 404) {
        return false; 
      }
      return failureCount < 2; 
    }
  });
  
  useEffect(() => {
    if (jobId && job) { 
      checkStoredVerification(jobId)
      setCurrentJob(job); 
    }
  }, [jobId, job, checkStoredVerification, setCurrentJob])
  
  const verifyMutation = useMutation<
    JobVerificationResponse,
    Error,
    { jobId: string, code: string }
  >({
    mutationFn: ({ jobId: id, code }) => 
      jobsApi.verifyCode(id, code),
    onSuccess: (data, variables) => {
      if (data.verified) {
        setIsVerified(true);
        addCode(variables.jobId, variables.code); 
        toast.success('Verification successful! You can now manage this job.');
        closeModal(); 
      } else {
        toast.error(data.error || 'Invalid modification code. Please try again.');
      }
    },
    onError: (err: Error) => { 
      toast.error('Verification API error. Please try again later.');
      console.error('Verification API error:', err.message);
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: ({ jobId: id, code }: { jobId: string, code: string }) =>
      jobsApi.deleteJob(id, code),
    onMutate: () => {
      setIsDeleting(true);
    },
    onSuccess: (apiResponse, variables) => {
      toast.success(apiResponse.message || 'Job deleted successfully');
      storeDeleteJob(variables.jobId);
      unsaveJobFromStore(variables.jobId); 
      const jobsListQueryKey = ['jobs', jobsPage, jobsSearch, jobsFilters];
      queryClient.setQueryData(
        jobsListQueryKey,
        (oldData: { jobs: Job[], total: number, limit: number, page: number, pages: number } | undefined) => {
          if (!oldData || !oldData.jobs) {
            return oldData;
          }
          const updatedJobs = oldData.jobs.filter(j => j.id !== variables.jobId);
          return {
            ...oldData,
            jobs: updatedJobs,
            total: oldData.total > 0 ? oldData.total - 1 : 0,
            pages: Math.ceil((oldData.total - 1) / (oldData.limit || 10)),
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: jobsListQueryKey });
      queryClient.removeQueries({ queryKey: ['job', variables.jobId] }); 
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['savedJobs'] });
      queryClient.invalidateQueries({ queryKey: ['relatedJobs'] });
      navigate('/jobs');
    },
    onError: (error) => { 
      if (isAxiosError(error) && error.response?.status === 429) {
        toast.error('You have exceeded the daily limit for deleting jobs. Please try again tomorrow.');
      } else if (error instanceof Error) { 
        toast.error(error.message || 'Failed to delete job. Please try again.');
      } else { 
        toast.error('Failed to delete job. An unexpected error occurred.');
      }
      console.error('Error deleting job:', error); 
      setIsDeleting(false); 
    },
  })

  const handleToggleSave = () => {
    if (!job) return
    if (isJobSaved(job.id)) {
      unsaveJob(job.id)
      toast.success('Job removed from saved list')
    } else {
      saveJob(job.id)
      toast.success('Job saved to your list')
    }
  }
  
  const handleVerifyClick = () => {
    if (!jobId) return
    let errorMessage: string | undefined = undefined;
    if (verifyMutation.error) { 
      errorMessage = verifyMutation.error.message; 
    }
    openVerification({
      title: 'Verify Modification Code',
      onVerify: (code) => {
        if (jobId) {
          verifyMutation.mutate({ jobId, code })
        }
      },
      isVerifying: verifyMutation.isPending,
      error: errorMessage 
    })
  }
  
  const handleDeleteClick = () => {
    if (!job || !jobId) return
    const storedCode = getCode(jobId)
    if (storedCode) {
      openConfirmation({
        title: 'Delete Job Listing',
        message: 'Are you sure you want to delete this job listing? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        variant: 'danger',
        confirmButtonVariant: 'destructive',
        onConfirm: () => {
          deleteMutation.mutate({ jobId, code: storedCode })
        }
      })
    } else {
      toast.error("Modification code not found. Please verify first.");
      handleVerifyClick(); 
    }
  }
  
  const handleShare = async () => {
    if (!job) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${job.title} at ${job.company_name} - NextHire`,
          text: `Check out this job: ${job.title} at ${job.company_name}`,
          url: window.location.href
        });
        toast.success('Successfully shared job')
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          toast.error('Failed to share job')
        }
        console.error('Error sharing:', error);
      }
    }
  };
  
  const handleCopyLink = () => {
    if (!job) return;
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    toast.success('Link copied to clipboard')
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };
  
  useEffect(() => {
    if (job) {
      setCurrentJob(job);
    }
  }, [job, setCurrentJob]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const renderActionButtons = (isMobileContext: boolean) => {
    if (!job) return null;
    if (isMobileContext) {
      return null; 
    }
    const currentIsSaved = isJobSaved(job.id); 
    return (
      <>
        <Button
          variant={currentIsSaved ? 'primary' : 'outline'}
          onClick={handleToggleSave}
          className="flex items-center gap-2"
        >
          <FiBookmark className={currentIsSaved ? 'fill-primary-foreground' : ''} />
          {currentIsSaved ? 'Saved' : 'Save Job'}
        </Button>
         <Button 
            variant="outline"
            onClick={handleCopyLink}
            className="flex items-center gap-2"
            title="Copy link to clipboard"
          >
            {isCopied ? (<><FiCheck /> Copied!</>) : (<><FiLink /> Copy Link</>)}
          </Button>
        {'share' in navigator && (
          <Button variant="outline" onClick={handleShare} className="flex items-center gap-2">
            <FiShare2 /> Share
          </Button>
        )}
        {!isVerified && (
          <Button variant="outline" onClick={handleVerifyClick} className="flex items-center gap-2">
            <FiLock /> Manage Job
          </Button>
        )}
        {isVerified && (
          <>
            <Link to={`/jobs/${job.id}/edit`}>
              <Button variant="outline" className="flex items-center gap-2"><FiEdit /> Edit</Button>
            </Link>
            <Button variant="destructive" onClick={handleDeleteClick} isLoading={deleteMutation.isPending} className="flex items-center gap-2">
              <FiTrash2 /> Delete
            </Button>
          </>
        )}
      </>
    );
  };

  if (isDeleting) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <p className="ml-4 text-muted-foreground">Deleting and redirecting...</p>
      </div>
    );
  }

  if (isLoading) { 
    return <JobDetailsSkeleton />;
  }
  
  const isNotFoundError = error?.response?.status === 404;

  if (error || (!isLoading && !job && jobId)) { 
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <ErrorState
          title={isNotFoundError ? "Job Not Found" : "Failed to Load Job"}
          message={
            isNotFoundError 
              ? "The job listing you're looking for doesn't exist or has been removed." 
              : "We encountered an issue while trying to fetch the job details. Please check your connection."
          }
          details={!isNotFoundError && error?.message ? error.message : undefined}
          onRetry={!isNotFoundError ? () => refetch() : undefined}
          retryText="Try Again"
        />
        <div className="mt-6">
          <Link to="/jobs">
            <Button variant={isNotFoundError ? "primary" : "outline"}>
              Back to Jobs
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  if (!job) {
    return (
        <div className="max-w-2xl mx-auto py-12 text-center">
            <ErrorState
                title="Job Not Available"
                message="The requested job details could not be loaded at this time."
            />
            <div className="mt-6">
                <Link to="/jobs">
                    <Button variant="outline">Back to Jobs</Button>
                </Link>
            </div>
        </div>
    );
  }
  
  const formatApplicationLink = (link: string) => {
    if (!link) return { href: '#', label: 'No application link provided' };
    if (link.includes('@') && !link.startsWith('http')) {
      return { href: `mailto:${link}`, label: link }
    }
    return { href: link, label: link }
  }
  const applicationLink = formatApplicationLink(job.application_info)
  
  const isSaved = isJobSaved(job.id) 
  
  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Top actions bar - Not animating this for now */}
      <div className="flex justify-between items-center mb-6">
        {/* ... existing top actions bar content ... */}
        <Link to="/jobs" className="text-muted-foreground hover:text-foreground">
          &larr; Back to jobs
        </Link>
        
        <div className="hidden md:flex gap-2 items-center">
          {job && renderActionButtons(false)} 
        </div>

        <div className="md:hidden relative" ref={mobileMenuRef}>
          <Button 
            variant="ghost" 
            className="p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="More actions"
            aria-haspopup="true"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-actions-menu"
            id="mobile-menu-trigger" 
          >
            <FiMoreVertical size={20} />
          </Button>
          {isMobileMenuOpen && job && (
            <div 
              id="mobile-actions-menu" 
              className="absolute right-0 mt-2 w-56 origin-top-right bg-card border border-border rounded-md shadow-lg z-20 py-1"
              role="menu" 
              aria-orientation="vertical" 
              aria-labelledby="mobile-menu-trigger" 
            >
              {(() => {
                const commonClasses = "w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted flex items-center gap-2";
                const closeMobileMenu = () => setIsMobileMenuOpen(false);
                const items = [];
                items.push(
                  <button
                    key="save-mobile"
                    onClick={() => { handleToggleSave(); closeMobileMenu(); }}
                    className={commonClasses}
                    role="menuitem"
                  >
                    <FiBookmark className={isSaved ? 'fill-primary' : ''} /> {isSaved ? 'Unsave Job' : 'Save Job'}
                  </button>
                );
                items.push(
                  <button
                    key="copy-mobile"
                    onClick={() => { handleCopyLink(); closeMobileMenu(); }}
                    className={commonClasses}
                    role="menuitem"
                  >
                    {isCopied ? <FiCheck /> : <FiLink />} {isCopied ? 'Copied!' : 'Copy Link'}
                  </button>
                );
                if ('share' in navigator) {
                  items.push(
                    <button
                      key="share-mobile"
                      onClick={() => { handleShare(); closeMobileMenu(); }}
                      className={commonClasses}
                      role="menuitem"
                    >
                      <FiShare2 /> Share
                    </button>
                  );
                }
                if (!isVerified) {
                  items.push(
                    <button
                      key="manage-mobile"
                      onClick={() => { handleVerifyClick(); closeMobileMenu(); }}
                      className={commonClasses}
                      role="menuitem"
                    >
                      <FiLock /> Manage Job
                    </button>
                  );
                } else { 
                  items.push(
                    <button
                      key="edit-mobile"
                      onClick={() => { navigate(`/jobs/${job.id}/edit`); closeMobileMenu(); }}
                      className={commonClasses}
                      role="menuitem"
                    >
                      <FiEdit /> Edit
                    </button>
                  );
                  items.push(
                    <Button
                      key="delete-mobile"
                      variant="ghost" 
                      onClick={() => { 
                        handleDeleteClick(); 
                        closeMobileMenu(); 
                      }}
                      isLoading={deleteMutation.isPending}
                      className={`${commonClasses} justify-start text-destructive hover:text-destructive hover:bg-destructive/10`} 
                    >
                      <FiTrash2 /> Delete
                    </Button>
                  );
                }
                return items;
              })()}
            </div>
          )}
        </div>
      </div>
      
      {/* First Card: Job Title, Meta, Overview, Salary, Tags */}
      <motion.div
        initial="hidden"
        whileInView="visible" 
        viewport={{ once: true, amount: 0.1 }} 
        variants={contentBlockFadeInUp}
        className="mb-6" 
      >
        <Card className="p-6 overflow-hidden">
          {/* Job Title */}
          <h1 className="text-3xl font-bold mb-2 break-words">{job.title}</h1>

          {/* Meta Information: Poster, Created Date, Updated Date */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-4">
            {job.poster_username && ( <span className="flex items-center gap-1.5 break-words"> <FiUser /> Posted by {job.poster_username} </span> )}
            {job.created_at && ( <span className="flex items-center gap-1.5"> <FiCalendar /> Created: {formatDate(job.created_at)} </span> )}
            <span className="flex items-center gap-1.5"> <FiCalendar /> Updated: {formatDate(job.updated_at)} </span>
          </div>
          
          {/* Job Overview: Company, Location & Job Type - WITH LABELS */}
          <div className="mt-4 pt-4 border-t border-border">
            <h3 className="text-md font-semibold text-foreground mb-3">Job Overview</h3>
            <div className="space-y-3">
              {/* Company Name */}
              <div className="flex items-start gap-2 text-lg">
                <span className="flex items-center gap-1.5 font-medium text-foreground/80 w-32 shrink-0">
                  <BiBuildingHouse /> Company:
                </span>
                <span className="text-foreground/90 break-words">{job.company_name}</span>
              </div>

              {/* Location */}
              {job.location && (
                <div className="flex items-start gap-2 text-lg">
                  <span className="flex items-center gap-1.5 font-medium text-foreground/80 w-32 shrink-0">
                    <FiMapPin /> Location:
                  </span>
                  <span className="text-foreground/90 break-words">{job.location}</span>
                </div>
              )}

              {/* Job Type */}
              {job.job_type && (
                <div className="flex items-start gap-2 text-lg">
                  <span className="flex items-center gap-1.5 font-medium text-foreground/80 w-32 shrink-0 capitalize">
                    <FiBriefcase /> Job Type:
                  </span>
                  <span className="text-foreground/90 capitalize break-words">{job.job_type.replace('-', ' ')}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Salary Information */}
          {(job.salary_min || job.salary_max) && (
            <div className="mt-4 pt-4 border-t border-border">
              <h3 className="text-md font-semibold text-foreground mb-1">Salary</h3>
              <p className="text-foreground/90 break-words">
                {job.salary_min && job.salary_max 
                  ? `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}`
                  : job.salary_min
                    ? `From ${job.salary_min.toLocaleString()}`
                    : `Up to ${job.salary_max!.toLocaleString()}`
                }
                {job.salary_currency && ` ${job.salary_currency}`}
              </p>
            </div>
          )}
          
          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <div 
              className={`mt-4 pt-4 border-t border-border`} 
            >
              <h3 className="text-md font-semibold text-foreground mb-2">Skills & Tags</h3>
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag: string) => ( <TagButton key={tag} tag={tag} onClick={() => navigate(`/jobs?tags=${encodeURIComponent(tag)}`)} ariaLabel={`Filter jobs by ${tag}`} /> ))}
              </div>
            </div>
          )}
        </Card>
      </motion.div>
      
      {/* Second Card: Job description */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={contentBlockFadeInUp}
        className="mb-6" 
      >
        <Card className="p-6 overflow-hidden">
          <h2 className="text-xl font-semibold mb-4">Job Description</h2>
          <div 
            className="prose prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground max-w-none"
            dangerouslySetInnerHTML={{ __html: job.description || '' }}
          />
        </Card>
      </motion.div>
      
      {/* Third Card: Application info */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={contentBlockFadeInUp}
        className="mb-6" // Added mb-6 for consistent spacing before RelatedJobs
      >
        <Card className="p-6 overflow-hidden">
          <h2 className="text-xl font-semibold mb-4">How to Apply</h2>
          <div className="flex items-center gap-2">
            <a 
              href={applicationLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline break-words"
            >
              {applicationLink.label}
              <FiExternalLink size={16} />
            </a>
          </div>
          <p className="mt-2 text-muted-foreground text-sm break-words">
            When applying, mention that you found this job on NextHire.
          </p>
        </Card>
      </motion.div>

      {/* Related Jobs Section */}
      {job && job.id && (
        <motion.div
          className="mt-6" 
          initial="hidden"
          whileInView="visible" 
          viewport={{ once: true, amount: 0.1 }} 
          variants={contentBlockFadeInUp} 
          key={`related-jobs-motion-${job.id}`} 
        >
          <RelatedJobs currentJobId={job.id} limit={3} />
        </motion.div>
      )}
    </div>
  )
}

export default JobDetailsPage