import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Alert,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { Delete, DragIndicator, Upload, ArrowForward } from '@mui/icons-material';
import { uploadFiles } from '../services/api';

// Set worker path for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 10;

interface FileWithPreview extends File {
  preview?: string;
}

const MergePdfUpload: React.FC = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [numPages, setNumPages] = useState<{ [key: string]: number }>({});

  const theme = useTheme();

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(file => {
        const error = file.errors?.[0];
        if (error?.code === 'file-too-large') {
          return `${file.file.name} is too large. Maximum size is ${MAX_FILE_SIZE/1024/1024}MB`;
        }
        if (error?.code === 'file-invalid-type') {
          return `${file.file.name} is not a PDF file`;
        }
        return `${file.file.name} could not be uploaded`;
      });
      setError(errors.join('\n'));
      return;
    }

    // Check total number of files
    if (files.length + acceptedFiles.length > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} files allowed`);
      return;
    }

    setFiles(prev => [...prev, ...acceptedFiles]);
    setError(null);
  }, [files]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true,
    maxSize: MAX_FILE_SIZE
  });

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    try {
      setIsUploading(true);
      setError(null);
      
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files[]', file);
      });

      const response = await uploadFiles(formData);
      navigate(`/processing/${response.job_id}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Upload failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(files);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFiles(items);
  };

  const onDocumentLoadSuccess = (file: File, { numPages }: { numPages: number }) => {
    setNumPages(prev => ({ ...prev, [file.name]: numPages }));
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: 4,
          borderRadius: 2,
          bgcolor: 'background.default',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h4" gutterBottom fontWeight="500">
          Merge PDF Files
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Combine multiple PDF files into a single document. Drag to reorder pages.
        </Typography>
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-message': { fontSize: '0.95rem' }
            }} 
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}
        
        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed',
            borderColor: error ? 'error.main' : 'primary.main',
            borderRadius: 3,
            p: 5,
            textAlign: 'center',
            mb: 4,
            cursor: 'pointer',
            bgcolor: error ? 'error.lighter' : 'primary.lighter',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: error ? 'error.light' : 'primary.light',
              opacity: 0.9
            }
          }}
        >
          <input {...getInputProps()} />
          <Upload sx={{ fontSize: 64, color: error ? 'error.main' : 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Drag & drop PDF files here
          </Typography>
          <Typography variant="body2" color="text.secondary">
            or click to select files
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Maximum {MAX_FILES} files, {MAX_FILE_SIZE/1024/1024}MB each
          </Typography>
        </Box>

        {files.length > 0 && (
          <>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="pdf-list" direction="horizontal">
                {(provided) => (
                  <Grid
                    container
                    spacing={3}
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {files.map((file, index) => (
                      <Draggable
                        key={file.name}
                        draggableId={file.name}
                        index={index}
                      >
                        {(provided) => (
                          <Grid
                            item
                            xs={12}
                            sm={6}
                            md={4}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                          >
                            <Card 
                              elevation={2}
                              sx={{ 
                                borderRadius: 2,
                                transition: 'transform 0.2s ease',
                                '&:hover': {
                                  transform: 'translateY(-4px)'
                                }
                              }}
                            >
                              <Box
                                {...provided.dragHandleProps}
                                sx={{
                                  p: 1,
                                  display: 'flex',
                                  justifyContent: 'center',
                                  borderBottom: '1px solid',
                                  borderColor: 'divider',
                                  cursor: 'move',
                                  bgcolor: 'background.neutral'
                                }}
                              >
                                <DragIndicator />
                              </Box>
                              <CardContent sx={{ p: 2 }}>
                                <Box 
                                  sx={{ 
                                    height: 280,
                                    overflow: 'hidden',
                                    borderRadius: 1,
                                    bgcolor: 'grey.100',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 2
                                  }}
                                >
                                  <Document
                                    file={file}
                                    onLoadSuccess={(pdf) => onDocumentLoadSuccess(file, pdf)}
                                    loading={
                                      <CircularProgress size={32} thickness={2} />
                                    }
                                  >
                                    <Page
                                      pageNumber={1}
                                      height={280}
                                      renderTextLayer={false}
                                      renderAnnotationLayer={false}
                                    />
                                  </Document>
                                </Box>
                                <Typography variant="subtitle2" noWrap>
                                  {file.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {(file.size/1024/1024).toFixed(2)}MB • {numPages[file.name] || '?'} pages
                                </Typography>
                              </CardContent>
                              <CardActions sx={{ p: 2, pt: 0 }}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleRemoveFile(index)}
                                  disabled={isUploading}
                                  color="error"
                                >
                                  <Delete />
                                </IconButton>
                              </CardActions>
                            </Card>
                          </Grid>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Grid>
                )}
              </Droppable>
            </DragDropContext>

            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={files.length < 2 || isUploading}
              size="large"
              endIcon={<ArrowForward />}
              sx={{ 
                mt: 4,
                py: 1.5,
                width: '100%',
                maxWidth: 400,
                display: 'block',
                mx: 'auto',
                borderRadius: 2,
                boxShadow: theme.shadows[8]
              }}
            >
              {isUploading ? 'Uploading...' : `Merge ${files.length} PDF${files.length !== 1 ? 's' : ''}`}
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default MergePdfUpload; 