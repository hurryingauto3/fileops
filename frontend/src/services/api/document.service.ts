import { ApiService } from './base';
import { Document, ProcessingJob } from '@/types';

export class DocumentService extends ApiService {
  async uploadFiles(files: File[]): Promise<ProcessingJob> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files[]', file);
    });

    const { data } = await this.api.post<ProcessingJob>('/documents/merge', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return data;
  }

  async getJobStatus(jobId: string): Promise<ProcessingJob> {
    const { data } = await this.api.get<ProcessingJob>(`/jobs/${jobId}`);
    return data;
  }

  async getDocuments(): Promise<Document[]> {
    const { data } = await this.api.get<Document[]>('/documents');
    return data;
  }
}

export const documentService = new DocumentService(); 