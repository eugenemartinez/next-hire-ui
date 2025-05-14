// Add this if you don't have a centralized queryClient file yet

import { QueryClient } from '@tanstack/react-query'

// Create a client with settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

// Helper function to invalidate tags when jobs change
export const invalidateTagsCache = () => {
  queryClient.invalidateQueries({ queryKey: ['tags'] })
}