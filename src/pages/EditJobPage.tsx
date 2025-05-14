import { useEffect } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { jobsApi, type JobType as ApiJobType, type Job } from '../api/jobs'; 
import { useNavigate, useParams } from 'react-router-dom'
import useModificationCodesStore from '../stores/modificationCodesStore'
import useJobStore from '../stores/jobStore'
import { toast } from 'sonner' 
import { isAxiosError } from 'axios';
import { motion, type Variants } from 'framer-motion'; // ADDED: Framer Motion import

import FormInput from '../components/forms/FormInput'
import FormSelect from '../components/forms/FormSelect'
import SalaryInput from '../components/forms/SalaryInput'
import TagInput from '../components/forms/TagInput'
import RichTextEditor from '../components/forms/RichTextEditor'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { FiAlertCircle, FiEdit, FiLoader } from 'react-icons/fi'

// Consistent job types with AddJobPage
const JOB_TYPES: { value: ApiJobType; label: string }[] = [
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'internship', label: 'Internship' },
]

// Regex patterns (consistent with AddJobPage)
// USERNAME_WITH_SPACES_PATTERN is not strictly needed here as poster_username is not user-editable
// but TAG_ALPHANUMERIC_PATTERN is.
const TAG_ALPHANUMERIC_PATTERN = /^[a-zA-Z0-9#+./-]+$/;

// Schema aligned with AddJobPage.tsx structure for common fields
const jobFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title cannot exceed 100 characters'),
  company_name: z.string().min(1, 'Company name is required').max(100, 'Company name cannot exceed 100 characters'),
  location: z.string().min(1, 'Location is required').max(100, 'Location cannot exceed 100 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000, 'Description cannot exceed 5000 characters'),
  application_info: z.string().min(1, "Application info is required")
    .max(255, "Application info cannot exceed 255 characters")
    .refine(value => {
        const isUrl = z.string().url().safeParse(value).success;
        const isEmail = z.string().email().safeParse(value).success;
        return isUrl || isEmail;
      }, 'Must be a valid URL or email address'),
  job_type: z.enum(['full-time', 'part-time', 'contract', 'freelance', 'internship']),
  
  salary_min: z.string().optional().refine(val => !val || val.trim() === '' || /^\d+$/.test(val.trim()), {
    message: "Minimum salary must be a non-negative number.",
  }),
  salary_max: z.string().optional().refine(val => !val || val.trim() === '' || /^\d+$/.test(val.trim()), {
    message: "Maximum salary must be a non-negative number.",
  }),
  salary_currency: z.string().optional(),
  
  tags: z.array(
      z.string()
        .min(1, "Tag cannot be empty")
        .max(25, "Tag cannot exceed 25 characters")
        .regex(TAG_ALPHANUMERIC_PATTERN, "Tag contains invalid characters. Allowed: alphanumeric, #, +, ., /, -")
    )
    .max(10, 'Maximum 10 tags allowed')
    .optional(),

  // poster_username is not editable, so simpler validation is fine.
  // It's mainly for display and to be part of the form's type.
  poster_username: z.string().max(50, 'Username cannot exceed 50 characters').optional(),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

// Define the expected payload structure for the update API
type UpdateJobPayload = {
  title: string;
  company_name: string;
  location: string;
  description: string;
  application_info: string;
  job_type: ApiJobType;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  tags: string[];
  // Note: poster_username is not included as it's not updatable
};

// ADDED: Variants for animations (same as AddJobPage)
const pageContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Stagger animation of direct children
    },
  },
};

const formSectionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const EditJobPage = () => {
  const navigate = useNavigate()
  const { jobId } = useParams<{ jobId: string }>()
  const { getCode } = useModificationCodesStore()
  const queryClient = useQueryClient()
  const { updateJob: storeUpdateJob } = useJobStore()
  const modificationCode = jobId ? getCode(jobId) : null
  
  const methods = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
  })
  
  const { data: job, isLoading, error: queryError } = useQuery<Job, Error>({
    queryKey: ['job', jobId],
    queryFn: () => {
      if (!jobId) throw new Error('Job ID is required');
      return jobsApi.getJob(jobId);
    },
    enabled: !!jobId,
    staleTime: 1000 * 60, 
  })
  
  useEffect(() => {
    if (job) {
      methods.reset({
        title: job.title || '',
        company_name: job.company_name || '',
        location: job.location ?? '', 
        description: job.description || '',
        application_info: job.application_info || '',
        job_type: job.job_type || JOB_TYPES[0].value as ApiJobType, 
        salary_min: job.salary_min?.toString() ?? '',
        salary_max: job.salary_max?.toString() ?? '',
        salary_currency: job.salary_currency ?? 'USD', 
        tags: job.tags || [],
        poster_username: job.poster_username ?? '', 
      })
    }
  }, [job, methods])
  
  const updateJobMutation = useMutation({
    mutationFn: (data: JobFormValues) => {
      if (!jobId || !modificationCode) {
        throw new Error('Missing job ID or modification code')
      }
      
      const formattedData: UpdateJobPayload = {
        title: data.title,
        company_name: data.company_name,
        location: data.location,
        description: data.description,
        application_info: data.application_info,
        job_type: data.job_type,
        salary_min: data.salary_min && data.salary_min.trim() !== '' ? parseInt(data.salary_min.trim(), 10) : null,
        salary_max: data.salary_max && data.salary_max.trim() !== '' ? parseInt(data.salary_max.trim(), 10) : null,
        salary_currency: data.salary_currency || null, 
        tags: data.tags?.filter(tag => tag.trim() !== "") || [], 
      };
      
      return jobsApi.updateJob(jobId, formattedData, modificationCode); 
    },
    onSuccess: (updatedJob) => {
      if (jobId) {
        storeUpdateJob(jobId, updatedJob);
      }
      queryClient.invalidateQueries({ queryKey: ['job', jobId] }); 
      queryClient.invalidateQueries({ queryKey: ['jobs'] }); 
      queryClient.invalidateQueries({ queryKey: ['tags'] }); 
      queryClient.invalidateQueries({ queryKey: ['savedJobs'] });
      queryClient.invalidateQueries({ queryKey: ['relatedJobs'] });
      queryClient.setQueryData(['job', jobId], updatedJob); 
      toast.success('Job updated successfully!');
      navigate(`/jobs/${jobId}`);
    },
    onError: (error) => { 
      if (isAxiosError(error) && error.response?.status === 429) {
        toast.error('You have exceeded the daily limit for updating jobs. Please try again tomorrow.');
      } else if (error instanceof Error) { 
        toast.error(error.message || 'Failed to update job. Please try again.');
      } else { 
        toast.error('Failed to update job. An unexpected error occurred.');
      }
      console.error('Error updating job:', error);
    }
  })
  
  const onSubmit = (data: JobFormValues) => {
    updateJobMutation.mutate(data)
  }
  
  // Conditional rendering for modification code, loading, and error states
  // These states will not have the form animations applied.
  if (!modificationCode) {
    return (
      <div className="container max-w-3xl mx-auto py-8 px-4 sm:px-0">
        <h1 className="text-3xl font-bold mb-6 text-center sm:text-left">Edit Job</h1>
        <Card className="p-6 bg-destructive/10 border-destructive/30">
          <div className="flex gap-3 items-center text-destructive"> <FiAlertCircle size={24} />
            <div>
              <h2 className="text-lg font-medium">Modification Code Required</h2>
              <p className="mb-4">You need a modification code to edit this job. Please go back to the job details page and verify your code first.</p>
              <Button 
                onClick={() => navigate(`/jobs/${jobId}`)}
                className="w-full sm:w-auto"
              > 
                Back to Job Details 
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }
  
  if (isLoading) {
    return (
      <div className="container max-w-3xl mx-auto py-8 px-4 sm:px-0">
        <h1 className="text-3xl font-bold mb-6 text-center sm:text-left">Edit Job</h1>
        <div className="flex justify-center items-center py-20"> <FiLoader className="animate-spin text-primary h-8 w-8" /> </div>
      </div>
    )
  }
  
  if (queryError || !job) {
    return (
      <div className="container max-w-3xl mx-auto py-8 px-4 sm:px-0">
        <h1 className="text-3xl font-bold mb-6 text-center sm:text-left">Edit Job</h1>
        <Card className="p-6 bg-destructive/10 border-destructive/30">
          <div className="flex gap-3 items-center text-destructive"> <FiAlertCircle size={24} />
            <div>
              <h2 className="text-lg font-medium">Error Loading Job</h2>
              <p className="mb-4">{queryError?.message || 'There was a problem loading the job details. Please try again later.'}</p>
              <Button 
                onClick={() => navigate(`/jobs/${jobId}`)}
                className="w-full sm:w-auto"
              > 
                Back to Job Details 
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }
  
  // Main form content with animations
  return (
    // MODIFIED: Added motion.div for page container animation
    <motion.div 
      className="container max-w-3xl mx-auto py-8 sm:px-0"
      variants={pageContainerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* MODIFIED: Added motion.h1 for title animation */}
      <motion.h1 
        className="text-3xl font-bold mb-6 text-center sm:text-left"
        variants={formSectionVariants}
      >
        Edit Job
      </motion.h1>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Section */}
          {/* MODIFIED: Added motion.div for section animation */}
          <motion.div 
            className="bg-card rounded-lg border p-6 space-y-4"
            variants={formSectionVariants}
          >
            <h2 className="text-xl font-semibold">Basic Information</h2>
            <FormInput name="title" label="Job Title" placeholder="e.g., Senior Frontend Developer" required />
            <FormInput name="company_name" label="Company Name" placeholder="e.g., Acme Inc." required />
            <FormInput name="location" label="Location" placeholder="e.g., Remote, New York, NY, etc." required />
            <RichTextEditor name="description" label="Job Description" placeholder="Describe the job requirements, responsibilities, and other details..." required />
            <FormSelect name="job_type" label="Job Type" options={JOB_TYPES} required />
            <FormInput name="application_info" label="Application Link or Email" placeholder="https://example.com/apply or jobs@example.com" type="text" required />
          </motion.div>
          
          {/* Salary Information (Optional) */}
          {/* MODIFIED: Added motion.div for section animation */}
          <motion.div 
            className="bg-card rounded-lg border p-6 space-y-4"
            variants={formSectionVariants}
          >
            <h2 className="text-xl font-semibold">Salary Information (Optional)</h2>
            <SalaryInput minName="salary_min" maxName="salary_max" currencyName="salary_currency" label="Salary Range" helperText="Leave blank if you don't want to specify a salary range" />
          </motion.div>
          
          {/* Tags & Additional Info */}
          {/* MODIFIED: Added motion.div for section animation */}
          <motion.div 
            className="bg-card rounded-lg border p-6 space-y-4"
            variants={formSectionVariants}
          >
            <h2 className="text-xl font-semibold">Tags & Additional Info</h2>
            <TagInput name="tags" label="Skills & Tags" helperText="Add relevant skills and technologies to help candidates find your job" maxTags={10} />
            <FormInput name="poster_username" label="Poster Username" disabled={true} helperText="Username cannot be changed after job creation." />
          </motion.div>
          
          {/* Action Buttons */}
          {/* MODIFIED: Added motion.div for section animation */}
          <motion.div 
            className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between sm:gap-0"
            variants={formSectionVariants}
          >
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(`/jobs/${jobId}`)} 
              disabled={updateJobMutation.isPending}
              className="w-full sm:w-auto"
            > 
              Cancel 
            </Button>
            <Button 
              type="submit" 
              icon={<FiEdit />} 
              isLoading={updateJobMutation.isPending} 
              disabled={updateJobMutation.isPending}
              className="w-full sm:w-auto"
            >
              {updateJobMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </motion.div>
        </form>
      </FormProvider>
    </motion.div>
  )
}

export default EditJobPage