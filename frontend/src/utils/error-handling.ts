import axios, { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

export class AppError extends Error {
  constructor(
    public message: string,
    public code: string = 'UNKNOWN_ERROR',
    public status: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    return {
      message: axiosError.response?.data?.error || 'An unexpected error occurred',
      code: axiosError.response?.data?.code || 'API_ERROR',
      status: axiosError.response?.status || 500
    };
  }
  
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      status: error.status
    };
  }

  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    status: 500
  };
}; 