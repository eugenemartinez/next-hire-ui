import { useQuery } from '@tanstack/react-query';
import { motion, type Variants } from 'framer-motion'; // Ensure motion and Variants are imported
import { jobsApi, type Job } from '../../api/jobs';
import JobCard from './JobCard'; 
import JobCardSkeleton from '../ui/skeletons/JobCardSkeleton';
import ErrorState from '../ui/ErrorState'; 
import EmptyState from '../ui/EmptyState'; 

// Variants for the grid container within RelatedJobs
const relatedJobsGridVariants: Variants = {
  hidden: { 
    // The container itself can be initially transparent or rely on children's hidden state.
    // Let's keep it simple as the outer wrapper in JobDetailsPage handles the block's visibility.
  },
  show: { // Target "show" to match JobCard's variant
    transition: {
      staggerChildren: 0.1, // Stagger the animation of each JobCard
      delayChildren: 0.2,   // Optional: delay before the first card starts
    },
  },
};

interface RelatedJobsProps {
  currentJobId: string;
  limit?: number;
}

const RelatedJobs: React.FC<RelatedJobsProps> = ({ currentJobId, limit = 3 }) => {
  const { 
    data: relatedJobs, 
    isLoading, 
    isError, 
    error,   
    refetch  
  } = useQuery<Job[], Error>({ 
    queryKey: ['relatedJobs', currentJobId, limit],
    queryFn: () => jobsApi.getRelatedJobs(currentJobId, limit),
    enabled: !!currentJobId,
    retry: 1, 
  });

  const sectionTitle = "Similar Opportunities";

  if (isLoading) {
    return (
      <div className="mt-12">
        <h3 className="text-xl font-semibold mb-6 text-foreground">{sectionTitle}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: limit }).map((_, index) => (
            <JobCardSkeleton key={index} /> 
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-12">
        <h3 className="text-xl font-semibold mb-6 text-foreground">{sectionTitle}</h3>
        <ErrorState
          title="Could Not Load Similar Jobs"
          message="We encountered an issue while trying to fetch similar job opportunities."
          details={error?.message || 'Please try again later.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (!relatedJobs || relatedJobs.length === 0) {
    return (
      <div className="mt-12">
        <h3 className="text-xl font-semibold mb-6 text-foreground">{sectionTitle}</h3>
        <EmptyState
          title="No Similar Jobs Found"
          message="We couldn't find any similar job opportunities at the moment."
        />
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h3 className="text-xl font-semibold mb-6 text-foreground">{sectionTitle}</h3>
      {/* This motion.div will orchestrate the JobCard animations */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={relatedJobsGridVariants}
        initial="hidden"
        animate="show" // Animate to "show" to match JobCard's variant
      >
        {relatedJobs.map((job) => (
          // JobCard will pick up the "hidden" and "show" states from this parent
          <JobCard key={job.id} job={job} />
        ))}
      </motion.div>
    </div>
  );
};

export default RelatedJobs;