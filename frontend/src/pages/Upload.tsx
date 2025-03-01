import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';
import { uploadDocument } from '../services/api';

const Upload: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation(
    (file: File) => uploadDocument(file),
    {
      onSuccess: (data) => {
        navigate(`/processing/${data.jobId}`);
      },
    }
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Upload Document
          </Typography>
          
          <Box
            sx={{
              border: '2px dashed #ccc',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'primary.main',
              },
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadMutation.isLoading ? (
              <CircularProgress />
            ) : (
              <>
                <UploadIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Click or drag files here to upload
                </Typography>
              </>
            )}
          </Box>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            accept=".pdf,.doc,.docx"
          />

          {uploadMutation.isError && (
            <Typography color="error" sx={{ mt: 2 }}>
              Upload failed. Please try again.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Upload; 