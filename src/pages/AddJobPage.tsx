import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsApi, type JobType as ApiJobType, type Job } from '../api/jobs'; 
import { useNavigate } from 'react-router-dom';
import useModificationCodesStore from '../stores/modificationCodesStore';
import useJobStore from '../stores/jobStore';
import useModalStore from '../stores/modalStore';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { motion, type Variants } from 'framer-motion'; // ADDED: Framer Motion import

import FormInput from '../components/forms/FormInput';
import FormSelect from '../components/forms/FormSelect';
import SalaryInput from '../components/forms/SalaryInput';
import TagInput from '../components/forms/TagInput';
import RichTextEditor from '../components/forms/RichTextEditor';
import Button from '../components/ui/Button';

// Define job types (consistent with EditJobPage)
const JOB_TYPES: { value: ApiJobType; label: string }[] = [
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'internship', label: 'Internship' },
];

// Regex patterns (inspired by schemas.py)
const USERNAME_WITH_SPACES_PATTERN = /^[a-zA-Z0-9_ ]*$/; // Allows empty string, or specified chars
const TAG_ALPHANUMERIC_PATTERN = /^[a-zA-Z0-9#+./-]+$/;


// Schema aligned with EditJobPage.tsx structure
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
  
  salary_min: z.string().optional().refine(val => !val || /^\d+$/.test(val), {
    message: "Minimum salary must be a non-negative number.",
  }),
  salary_max: z.string().optional().refine(val => !val || /^\d+$/.test(val), {
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

  poster_username: z.string()
    .max(50, 'Username cannot exceed 50 characters')
    .regex(USERNAME_WITH_SPACES_PATTERN, "Username can only contain alphanumeric characters, underscores, and spaces.")
    .optional()
    .or(z.literal(''))
    .refine(val => {
      if (val === undefined || val === null || val === '') {
        return true; // Allow empty or undefined
      }
      return val.length >= 3; // If provided, must be at least 3 characters
    }, {
      message: "Username must be at least 3 characters if provided.",
    }),
});

type JobFormValues = z.infer<typeof jobFormSchema>;


// ADDED: Variants for animations
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


const AddJobPage = () => {
  const { addCode } = useModificationCodesStore();
  const { openSuccess } = useModalStore();
  const { addJob } = useJobStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const methods = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: '',
      company_name: '',
      location: '',
      description: '', 
      application_info: '',
      job_type: 'full-time', 
      salary_min: '',
      salary_max: '',
      salary_currency: 'USD',
      tags: [],
      poster_username: '',
    }
  });
  
  const createJobMutation = useMutation({
    mutationFn: (newJob: Omit<Job, 'id' | 'created_at' | 'updated_at' | 'modification_code'>) => jobsApi.createJob(newJob),
    onSuccess: (data) => {
      addCode(data.id, data.modification_code);
      addJob(data); 

      queryClient.invalidateQueries({ queryKey: ['jobs'] }); 

      if (data.tags && data.tags.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['tags'] });
      }
      toast.success('Job posted successfully!');
      navigate(`/jobs/${data.id}`);
      openSuccess({
        title: 'Job Posted Successfully!',
        description: 'Your job has been successfully posted and you are now viewing it. Please save your modification code to edit or delete this job in the future.',
        jobId: data.id,
        modificationCode: data.modification_code,
        showViewJobButton: false
      });
      methods.reset();
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response) {
        if (error.response.status === 429) {
          toast.error(error.response.data?.detail || 'You have exceeded the daily limit for posting jobs. Please try again tomorrow.');
        } else if (error.response.status === 503) {
          toast.error(error.response.data?.detail || 'The job posting limit has been reached. New jobs cannot be added at this time.');
        } else if (error.response.data?.detail) {
          // Handle other backend errors that provide a 'detail' message
          const message = typeof error.response.data.detail === 'string' 
            ? error.response.data.detail
            : 'Failed to post job. Please check your input and try again.';
          toast.error(message);
        } else {
          toast.error('Failed to post job. An unexpected error occurred.');
        }
      } else {
        toast.error('Failed to post job. Please check your network connection and try again.');
      }
      console.error('Error posting job:', error);
    }
  });
  
  const onSubmit = (data: JobFormValues) => { 
    const formattedData: Omit<Job, 'id' | 'created_at' | 'updated_at' | 'modification_code'> = {
      ...data,
      salary_min: data.salary_min && data.salary_min !== '' ? parseInt(data.salary_min, 10) : null,
      salary_max: data.salary_max && data.salary_max !== '' ? parseInt(data.salary_max, 10) : null,
      salary_currency: data.salary_currency || null,
      poster_username: data.poster_username?.trim() || null,
      tags: data.tags || [],
    };
    
    createJobMutation.mutate(formattedData);
  };
  
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
        variants={formSectionVariants} // Use item variant for individual animation
      >
        Post a New Job
      </motion.h1> 
      
      <FormProvider {...methods}>
        {/* The form itself doesn't need to be a motion component if its children are */}
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Section */}
          {/* MODIFIED: Added motion.div for section animation */}
          <motion.div 
            className="bg-card rounded-lg border p-6 space-y-4"
            variants={formSectionVariants}
          >
            <h2 className="text-xl font-semibold">Basic Information</h2>
            
            <FormInput 
              name="title"
              label="Job Title"
              placeholder="e.g., Senior Frontend Developer"
              required
            />
            
            <FormInput 
              name="company_name"
              label="Company Name"
              placeholder="e.g., Acme Inc."
              required
            />
            
            <FormInput 
              name="location"
              label="Location"
              placeholder="e.g., Remote, New York, NY, etc."
              required
            />
            
            <RichTextEditor
              name="description"
              label="Job Description"
              placeholder="Describe the job requirements, responsibilities, and other details..."
              required
            />
            
            <FormSelect
              name="job_type"
              label="Job Type"
              options={JOB_TYPES}
              required
            />
            
            <FormInput
              name="application_info"
              label="Application Link or Email"
              placeholder="https://example.com/apply or jobs@example.com"
              type="text"
              required
            />
          </motion.div>
          
          {/* Salary Information (Optional) */}
          {/* MODIFIED: Added motion.div for section animation */}
          <motion.div 
            className="bg-card rounded-lg border p-6 space-y-4"
            variants={formSectionVariants}
          >
            <h2 className="text-xl font-semibold">Salary Information (Optional)</h2>
            
            <SalaryInput
              minName="salary_min"
              maxName="salary_max"
              currencyName="salary_currency"
              label="Salary Range"
              helperText="Leave blank if you don't want to specify a salary range"
            />
          </motion.div>
          
          {/* Tags & Additional Info */}
          {/* MODIFIED: Added motion.div for section animation */}
          <motion.div 
            className="bg-card rounded-lg border p-6 space-y-4"
            variants={formSectionVariants}
          >
            <h2 className="text-xl font-semibold">Tags & Additional Info</h2>
            
            <TagInput
              name="tags"
              label="Skills & Tags"
              helperText="Add relevant skills and technologies to help candidates find your job"
              maxTags={10}
            />
            
            <FormInput 
              name="poster_username"
              label="Poster Username (Optional)"
              placeholder="Leave blank to generate automatically"
              helperText="If not provided, we'll generate a random username for you"
            />
          </motion.div>
          
          {/* Submit button */}
          {/* MODIFIED: Added motion.div for section animation */}
          <motion.div 
            className="flex flex-col sm:flex-row sm:justify-end"
            variants={formSectionVariants}
          >
            <Button
              type="submit"
              isLoading={createJobMutation.isPending}
              className="w-full sm:w-auto"
            >
              Post Job
            </Button>
          </motion.div>
        </form>
      </FormProvider>
    </motion.div>
  );
};

export default AddJobPage;