import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Box, Typography, LinearProgress, Paper } from '@mui/material';
import { getJobStatus } from '../services/api';

const Processing: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();

  const { data, isLoading, error } = useQuery(
    ['job', jobId],
    () => getJobStatus(jobId!),
    {
      refetchInterval: 2000, // Poll every 2 seconds
      enabled: !!jobId,
    }
  );

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading job status...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error loading job status</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Processing Document
        </Typography>
        <Box sx={{ my: 2 }}>
          <LinearProgress
            variant="determinate"
            value={data?.progress || 0}
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Box>
        <Typography>
          Status: {data?.status || 'Unknown'}
        </Typography>
        {data?.progress && (
          <Typography>
            Progress: {Math.round(data.progress)}%
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default Processing; 