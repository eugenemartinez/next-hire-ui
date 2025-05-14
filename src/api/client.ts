import axios from 'axios'

// Configure environment-based API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

// Create an Axios instance with default config
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add paramsSerializer config to handle arrays properly
  paramsSerializer: {
    indexes: null // This ensures arrays are sent as repeated params (tags=react&tags=python)
  }
})

// Request interceptor for adding auth headers, etc.
apiClient.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for handling errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // More detailed error logging
    if (error.response) {
      // The server responded with a status code outside the 2xx range
      console.error('API Error Response:', {
        status: error.response.status,
        url: error.config?.url,
        data: error.response.data,
        headers: error.response.headers
      })
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API No Response Error:', {
        request: error.request,
        url: error.config?.url
      })
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Request Setup Error:', error.message)
    }
    
    return Promise.reject(error)
  }
)

export default apiClient