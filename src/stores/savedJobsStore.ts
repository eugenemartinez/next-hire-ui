import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SavedJobsState {
  savedJobs: string[] // Array of job IDs
  addJob: (jobId: string) => void
  removeJob: (jobId: string) => void
  isJobSaved: (jobId: string) => boolean
  clearSavedJobs: () => void
}

const useSavedJobsStore = create<SavedJobsState>()(
  persist(
    (set, get) => ({
      savedJobs: [],
      
      addJob: (jobId) => {
        // Only add if not already saved
        if (!get().isJobSaved(jobId)) {
          set((state) => ({ 
            savedJobs: [...state.savedJobs, jobId] 
          }))
        }
      },
      
      removeJob: (jobId) => {
        set((state) => ({
          savedJobs: state.savedJobs.filter(id => id !== jobId)
        }))
      },
      
      isJobSaved: (jobId) => {
        return get().savedJobs.includes(jobId)
      },
      
      clearSavedJobs: () => {
        set({ savedJobs: [] })
      }
    }),
    {
      name: 'saved-jobs-storage',
    }
  )
)

export default useSavedJobsStore