export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  emailNotifications: boolean;
}

export interface Document {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  url?: string;
  type: 'pdf' | 'image' | 'document';
  size: number;
  metadata?: Record<string, any>;
}

export interface ProcessingJob {
  jobId: string;
  status: string;
  progress: number;
  error?: string;
  result?: {
    documentId: string;
    url: string;
  };
} 