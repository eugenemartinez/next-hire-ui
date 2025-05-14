import apiClient from './client'

// Define TypeScript interfaces for API data

// Matches schemas.JobType
export type JobType = 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';

// Matches schemas.PopularCurrency (subset for frontend, or could be string if more flexible)
export type PopularCurrency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD'; // Or simply string

export interface Job {
  id: string
  title: string
  company_name: string
  location: string | null // Matches Optional[str] in schemas.JobBase
  description: string
  application_info: string // Union[EmailStr, HttpUrl] becomes string on frontend
  job_type: JobType | null // Matches Optional[JobType]
  salary_min: number | null
  salary_max: number | null
  salary_currency: PopularCurrency | string | null // Matches Optional[PopularCurrency]
  tags: string[]
  poster_username: string | null
  created_at: string
  updated_at: string
}

// Matches schemas.JobWithModificationCode
export interface JobWithModificationCode extends Job {
  modification_code: string;
}

// Matches schemas.JobListResponse
export interface JobsResponse {
  jobs: Job[]
  limit: number
  skip: number
  total: number
}

// Matches schemas.JobVerificationResponse
export interface JobVerificationResponse {
  verified: boolean;
  error?: string;
}

// Matches schemas.JobDeleteResponse
export interface JobDeleteResponse {
  message: string;
  job_id: string; // UUID4 becomes string
}

// API functions for Jobs endpoints
export const jobsApi = {
  // Get paginated jobs list with search and filters
  getJobs: async (params: {
    page?: number // Frontend uses page/size
    size?: number   // Frontend uses page/size
    search?: string
    tags?: string[] // Frontend sends as array, converted to string
    job_type?: JobType // Use the JobType type
    location?: string // Added filter
    company_name?: string // Added filter
    sort_by?: string
    sort_order?: 'asc' | 'desc'
    salary_min?: number
    salary_max?: number
    salary_currency?: PopularCurrency | string // Use PopularCurrency or string
  }) => {
    const apiParams: { [key: string]: string | number | boolean | string[] | undefined } = {};

    // Convert page/size to skip/limit for backend
    if (params.page !== undefined && params.size !== undefined) {
      apiParams.skip = (params.page > 0 ? params.page - 1 : 0) * params.size;
      apiParams.limit = params.size;
    } else {
      // Default skip/limit if page/size not provided, or handle as error
      apiParams.skip = params.page !== undefined ? params.page : 0; // Or your default skip
      apiParams.limit = params.size !== undefined ? params.size : 20; // Or your default limit
    }
    
    if (params.search) apiParams.search = params.search;
    if (params.tags && params.tags.length > 0) {
      apiParams.tags = params.tags.join(','); // Backend expects comma-separated string
    }
    if (params.job_type) apiParams.job_type = params.job_type;
    if (params.location) apiParams.location = params.location;
    if (params.company_name) apiParams.company_name = params.company_name;
    if (params.sort_by) apiParams.sort_by = params.sort_by;
    if (params.sort_order) apiParams.sort_order = params.sort_order;
    if (params.salary_min !== undefined) apiParams.salary_min = params.salary_min;
    if (params.salary_max !== undefined) apiParams.salary_max = params.salary_max;
    if (params.salary_currency) apiParams.salary_currency = params.salary_currency;
    
    const response = await apiClient.get<JobsResponse>('/jobs/', { params: apiParams });
    return response.data;
  },

  // Get a single job by ID
  getJob: async (id: string): Promise<Job> => {
    const response = await apiClient.get<Job>(`/jobs/${id}`);
    return response.data;
  },

  // Get related jobs for a given job ID
  getRelatedJobs: async (jobId: string, limit: number = 3): Promise<Job[]> => {
    const response = await apiClient.get<Job[]>(`/jobs/${jobId}/related`, {
      params: { limit }
    });
    return response.data;
  },

  // Corresponds to schemas.JobCreate for request, returns schemas.JobWithModificationCode
  createJob: async (jobData: Omit<Job, 'id' | 'created_at' | 'updated_at' | 'modification_code'>): Promise<JobWithModificationCode> => {
    const response = await apiClient.post<JobWithModificationCode>('/jobs/', jobData);
    return response.data;
  },

  // Corresponds to schemas.JobUpdate for request, returns schemas.JobWithModificationCode
  updateJob: async (id: string, jobData: Partial<Omit<Job, 'id' | 'created_at' | 'updated_at' | 'modification_code'>>, modificationCode: string): Promise<JobWithModificationCode> => {
    const response = await apiClient.patch<JobWithModificationCode>(`/jobs/${id}`, jobData, {
      headers: {
        'X-Modification-Code': modificationCode
      }
    });
    return response.data;
  },

  // Returns schemas.JobDeleteResponse
  deleteJob: async (id: string, modificationCode: string): Promise<JobDeleteResponse> => {
    const response = await apiClient.delete<JobDeleteResponse>(`/jobs/${id}`, {
      headers: {
        'X-Modification-Code': modificationCode
      }
    });
    return response.data;
  },

  // Corresponds to schemas.JobModificationCodePayload for request, returns schemas.JobVerificationResponse
  verifyCode: async (id: string, code: string): Promise<JobVerificationResponse> => {
    const response = await apiClient.post<JobVerificationResponse>(`/jobs/${id}/verify`, {
      modification_code: code
    });
    return response.data;
  },

  // Corresponds to POST /jobs/saved, expects schemas.JobIdsList, returns List[schemas.Job]
  getJobsByIds: async (jobIds: string[]): Promise<Job[]> => {
    if (jobIds.length === 0) {
      return [];
    }
    // Backend endpoint is /jobs/saved and expects { job_ids: string[] }
    // Backend directly returns List[Job]
    const response = await apiClient.post<Job[]>('/jobs/saved', { job_ids: jobIds });
    return response.data; 
  }
}