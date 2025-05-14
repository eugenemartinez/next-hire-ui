import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface JobFilters {
  jobType: string;
  tags: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
}

interface UserPreferencesState {
  // Timestamp for when preferences were last updated
  lastUpdated: number;
  
  // Jobs page preferences
  jobsSearch: string;
  jobsPage: number;
  jobsFilters: JobFilters;
  
  // Actions
  setJobsSearch: (search: string) => void;
  setJobsPage: (page: number) => void;
  setJobsFilters: (filters: JobFilters) => void;
  updateJobsFilter: <K extends keyof JobFilters>(key: K, value: JobFilters[K]) => void;
  resetJobsFilters: () => void;
  resetAllPreferences: () => void;
}

// Default state values
const DEFAULT_JOBS_FILTERS: JobFilters = {
  jobType: '',
  tags: [],
  sortBy: 'updated_at',
  sortOrder: 'desc',
  salaryMin: undefined,
  salaryMax: undefined,
  salaryCurrency: undefined
}

// Expiration time in milliseconds (7 days)
const EXPIRATION_TIME = 7 * 24 * 60 * 60 * 1000;

// Create the store with persistence and expiration
const useUserPreferences = create<UserPreferencesState>()(
  persist(
    (set) => ({
      // Initial state with current timestamp
      lastUpdated: Date.now(),
      jobsSearch: '',
      jobsPage: 1,
      jobsFilters: DEFAULT_JOBS_FILTERS,
      
      // Actions - each one updates the lastUpdated timestamp
      setJobsSearch: (search) => set({ 
        jobsSearch: search,
        lastUpdated: Date.now()
      }),
      
      setJobsPage: (page) => set({ 
        jobsPage: page,
        lastUpdated: Date.now()
      }),
      
      setJobsFilters: (filters) => set({ 
        jobsFilters: filters,
        lastUpdated: Date.now()
      }),
      
      updateJobsFilter: (key, value) => set((state) => ({
        jobsFilters: {
          ...state.jobsFilters,
          [key]: value
        },
        lastUpdated: Date.now()
      })),
      
      resetJobsFilters: () => set({ 
        jobsFilters: DEFAULT_JOBS_FILTERS,
        lastUpdated: Date.now()
      }),
      
      resetAllPreferences: () => set({
        jobsSearch: '',
        jobsPage: 1,
        jobsFilters: DEFAULT_JOBS_FILTERS,
        lastUpdated: Date.now()
      })
    }),
    {
      name: 'user-preferences', // name for localStorage key
      storage: createJSONStorage(() => localStorage),
      // Custom storage handler to check expiration on hydration
      onRehydrateStorage: () => (state) => {
        // Check if state exists and if it's expired
        if (state && Date.now() - state.lastUpdated > EXPIRATION_TIME) {
          // If expired, reset to defaults
          state.resetAllPreferences();
        } 
      },
      version: 1,
    }
  )
)

export default useUserPreferences