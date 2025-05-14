import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface JobModificationCode {
  jobId: string
  code: string
  timestamp: number // When it was stored
}

interface ModificationCodesState {
  codes: JobModificationCode[]
  addCode: (jobId: string, code: string) => void
  getCode: (jobId: string) => string | null
  removeCode: (jobId: string) => void
  hasCode: (jobId: string) => boolean
  clearOldCodes: (maxAgeMs?: number) => void // Cleanup old codes
}

const useModificationCodesStore = create<ModificationCodesState>()(
  persist(
    (set, get) => ({
      codes: [],
      
      addCode: (jobId, code) => {
        // Remove existing code if present
        const filteredCodes = get().codes.filter(c => c.jobId !== jobId)
        
        set({
          codes: [
            ...filteredCodes,
            { jobId, code, timestamp: Date.now() }
          ]
        })
      },
      
      getCode: (jobId) => {
        const codeObj = get().codes.find(c => c.jobId === jobId)
        return codeObj ? codeObj.code : null
      },
      
      removeCode: (jobId) => {
        set((state) => ({
          codes: state.codes.filter(c => c.jobId !== jobId)
        }))
      },
      
      hasCode: (jobId) => {
        return get().codes.some(c => c.jobId === jobId)
      },
      
      clearOldCodes: (maxAgeMs = 30 * 24 * 60 * 60 * 1000) => { // Default 30 days
        const now = Date.now()
        set((state) => ({
          codes: state.codes.filter(c => (now - c.timestamp) < maxAgeMs)
        }))
      }
    }),
    {
      name: 'modification-codes-storage',
    }
  )
)

export default useModificationCodesStore