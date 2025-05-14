import { create } from 'zustand'
import { devtools } from 'zustand/middleware' // Import devtools
import type { Job } from '../api/jobs'

interface JobsState {
  // Data storage
  jobs: Job[];               // All jobs that have been fetched
  jobsById: Record<string, Job>; // Jobs indexed by ID for quick lookup
  currentJob: Job | null;    // Currently viewed job
  
  // Loading states
  isLoading: boolean;        // Global loading state for jobs
  
  // Actions
  setJobs: (jobs: Job[]) => void;
  setCurrentJob: (job: Job | null) => void;
  addJob: (job: Job) => void;
  updateJob: (jobId: string, updatedJob: Job) => void;
  deleteJob: (jobId: string) => void;
  
  // Utility functions
  getJobById: (jobId: string) => Job | undefined;
  clearJobs: () => void;
  setLoading: (isLoading: boolean) => void;
}

// Wrap your store definition with devtools
const useJobStore = create<JobsState>()(
  devtools( // Add devtools middleware
    (set, get) => {
      return {
        // Initial state
        jobs: [],
        jobsById: {},
        currentJob: null,
        isLoading: false,
        
        // Set all jobs (typically after fetching jobs list)
        setJobs: (jobs) => {
          const jobsById = jobs.reduce((acc, job) => {
            acc[job.id] = job;
            return acc;
          }, {} as Record<string, Job>);
          set({ jobs, jobsById }, false, 'setJobs'); 
        },
        
        // Set the currently viewed job
        setCurrentJob: (job) => {
          set({ currentJob: job }, false, 'setCurrentJob');
          if (job) {
            set((state) => ({ 
              jobsById: { ...state.jobsById, [job.id]: job }
            }), false, 'setCurrentJob/updateJobsById');
          }
        },
        
        // Add a new job (after creating one)
        addJob: (job) => {
          set((state) => ({
            jobs: [job, ...state.jobs],
            jobsById: { ...state.jobsById, [job.id]: job }
          }), false, 'addJob');
        },
        
        // Update an existing job
        updateJob: (jobId, updatedJob) => {
          set((state) => ({
            jobs: state.jobs.map(j => j.id === jobId ? updatedJob : j),
            jobsById: { ...state.jobsById, [jobId]: updatedJob },
            currentJob: state.currentJob?.id === jobId ? updatedJob : state.currentJob
          }), false, `updateJob/${jobId}`);
        },
        
        // Delete a job
        deleteJob: (jobId) => {
          set((state) => {
            const newJobsById = { ...state.jobsById };
            delete newJobsById[jobId];
            return {
              jobs: state.jobs.filter(j => j.id !== jobId),
              jobsById: newJobsById,
              currentJob: state.currentJob?.id === jobId ? null : state.currentJob
            };
          }, false, `deleteJob/${jobId}`);
        },
        
        // Get a job by ID (does not change state)
        getJobById: (jobId) => {
          return get().jobsById[jobId];
        },
        
        // Clear all jobs
        clearJobs: () => {
          set({ jobs: [], jobsById: {}, currentJob: null, isLoading: false }, false, 'clearJobs');
        },
        
        // Set loading state
        setLoading: (isLoading) => {
          set({ isLoading }, false, 'setLoading');
        }
      };
    },
    { 
      name: "JobStore" // Name for the store instance in Redux DevTools
    } 
  )
);

export default useJobStore;