import apiClient from './client'

/**
 * Interface for Tags API operations
 */
export const tagsApi = {
  /**
   * Fetch available tags from the API
   * @returns Promise that resolves to an array of tag strings
   */
  async getTags(): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>('/tags')
      return response.data
    } catch (error) {
      console.error('Error fetching tags:', error)
      return []
    }
  },
}

/**
 * Type for tags returned by the API
 */
export type Tag = string