import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. Please try again.');
    }
    
    if (!error.response) {
      throw new Error('Network error. Please check your connection.');
    }
    
    throw error;
  }
);

export const uploadDocument = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const processDocument = async (documentId: string, operation: string) => {
  const response = await api.post('/documents/process', {
    documentId,
    operation,
  });
  return response.data;
};

export const getJobStatus = async (jobId: string) => {
  const response = await api.get(`/jobs/${jobId}`);
  return response.data;
};

export const uploadFiles = async (formData: FormData) => {
  try {
    const response = await api.post('/documents/merge', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: progressEvent => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
      }
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 413) {
      throw new Error('File too large. Please try with smaller files.');
    }
    throw error;
  }
};

export const getDocuments = async () => {
  const response = await api.get('/documents');
  return response.data;
}; 