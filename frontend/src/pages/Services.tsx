import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Chip,
  Tabs,
  Tab,
  Paper,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  MergeType,
  PictureAsPdf,
  Image,
  TextFields,
  Compress,
  Lock,
  VideoFile,
  AudioFile,
  Transform,
  Translate,
  ContentCut,
  Compare,
  FilterList,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Define service type
interface Service {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  route: string;
  tags: string[];
  available: boolean;
  popular?: boolean;
}

// Define category type
interface Category {
  icon: React.ElementType;
  color: string;
  services: Service[];
}

// Define service categories with proper typing
const serviceCategories: Record<string, Category> = {
  PDF: {
    icon: PictureAsPdf,
    color: '#FF5722',
    services: [
      {
        id: 'merge-pdf',
        title: 'Merge PDFs',
        description: 'Combine multiple PDF files into a single document',
        icon: MergeType,
        route: '/upload/merge-pdf',
        tags: ['PDF'],
        available: true,
        popular: true,
      },
      {
        id: 'split-pdf',
        title: 'Split PDF',
        description: 'Split a PDF into multiple documents by pages or bookmarks',
        icon: ContentCut,
        route: '/upload/split-pdf',
        tags: ['PDF'],
        available: false,
      },
      {
        id: 'compress-pdf',
        title: 'Compress PDF',
        description: 'Reduce PDF file size while maintaining quality',
        icon: Compress,
        route: '/upload/compress-pdf',
        tags: ['PDF'],
        available: false,
        popular: true,
      },
      {
        id: 'pdf-ocr',
        title: 'PDF OCR',
        description: 'Make scanned PDFs searchable with OCR technology',
        icon: TextFields,
        route: '/upload/pdf-ocr',
        tags: ['PDF', 'OCR'],
        available: false,
      },
      {
        id: 'encrypt-pdf',
        title: 'Encrypt PDF',
        description: 'Secure your PDF with password protection',
        icon: Lock,
        route: '/upload/encrypt-pdf',
        tags: ['PDF', 'Security'],
        available: false,
      },
    ],
  },
  Image: {
    icon: Image,
    color: '#4CAF50',
    services: [
      {
        id: 'image-to-pdf',
        title: 'Images to PDF',
        description: 'Convert multiple images into a single PDF file',
        icon: PictureAsPdf,
        route: '/upload/image-to-pdf',
        tags: ['Image', 'PDF'],
        available: false,
        popular: true,
      },
      {
        id: 'image-compress',
        title: 'Compress Images',
        description: 'Reduce image file sizes while preserving quality',
        icon: Compress,
        route: '/upload/compress-images',
        tags: ['Image'],
        available: false,
      },
      {
        id: 'image-convert',
        title: 'Convert Images',
        description: 'Convert between image formats (JPG, PNG, WebP, etc.)',
        icon: Transform,
        route: '/upload/convert-images',
        tags: ['Image'],
        available: false,
      },
    ],
  },
  Video: {
    icon: VideoFile,
    color: '#2196F3',
    services: [
      {
        id: 'video-compress',
        title: 'Compress Video',
        description: 'Reduce video file size with minimal quality loss',
        icon: VideoFile,
        route: '/upload/compress-video',
        tags: ['Video'],
        available: false,
        popular: true,
      },
      {
        id: 'video-convert',
        title: 'Convert Video',
        description: 'Convert videos between formats (MP4, WebM, etc.)',
        icon: Transform,
        route: '/upload/convert-video',
        tags: ['Video'],
        available: false,
      },
    ],
  },
  Audio: {
    icon: AudioFile,
    color: '#9C27B0',
    services: [
      {
        id: 'audio-convert',
        title: 'Convert Audio',
        description: 'Convert audio files between formats (MP3, WAV, etc.)',
        icon: AudioFile,
        route: '/upload/convert-audio',
        tags: ['Audio'],
        available: false,
      },
    ],
  },
};

const Services: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState<string>('all');
  const [showPopularOnly, setShowPopularOnly] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  };

  const renderServiceCard = (service: Service, categoryColor: string) => (
    <Grid item xs={12} sm={6} md={4} key={service.id}>
      <Card 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          opacity: service.available ? 1 : 0.7,
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: service.available ? 'translateY(-4px)' : 'none',
            boxShadow: service.available ? 6 : 1,
          },
          position: 'relative',
          overflow: 'visible',
        }}
      >
        {service.popular && (
          <Chip
            label="Popular"
            color="secondary"
            size="small"
            sx={{
              position: 'absolute',
              top: -10,
              right: -10,
              zIndex: 1,
            }}
          />
        )}
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton 
              sx={{ 
                mr: 1,
                color: categoryColor,
                backgroundColor: alpha(categoryColor, 0.1),
              }}
            >
              <service.icon />
            </IconButton>
            <Typography variant="h6">{service.title}</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {service.description}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {service.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                sx={{
                  backgroundColor: alpha(categoryColor, 0.1),
                  color: categoryColor,
                  borderColor: categoryColor,
                }}
                variant="outlined"
              />
            ))}
          </Box>
        </CardContent>
        <CardActions>
          <Button
            size="small"
            sx={{
              color: service.available ? categoryColor : 'text.disabled',
            }}
            onClick={() => navigate(service.route)}
            disabled={!service.available}
          >
            {service.available ? 'Use Service' : 'Coming Soon'}
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 4 
      }}>
        <Box>
          <Typography variant="h6" color="text.secondary">
            Professional file operations made simple
          </Typography>
        </Box>
        <Button
          startIcon={<FilterList />}
          onClick={() => setShowPopularOnly(!showPopularOnly)}
          variant={showPopularOnly ? "contained" : "outlined"}
        >
          Popular
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="All Services" value="all" />
          {Object.entries(serviceCategories).map(([category, { icon: CategoryIcon, color }]) => (
            <Tab
              key={category}
              label={category}
              value={category}
              icon={<CategoryIcon />}
              iconPosition="start"
              sx={{ color }}
            />
          ))}
        </Tabs>
      </Paper>

      <Grid container spacing={3}>
        {Object.entries(serviceCategories).map(([category, { services, color, icon: CategoryIcon }]) => {
          if (currentTab !== 'all' && currentTab !== category) return null;
          
          const filteredServices = showPopularOnly 
            ? services.filter(s => s.popular)
            : services;

          if (!filteredServices.length) return null;

          return (
            <React.Fragment key={category}>
              {currentTab === 'all' && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, mb: 2 }}>
                    <CategoryIcon sx={{ color, mr: 1 }} />
                    <Typography variant="h5" color={color}>
                      {category} Operations
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                </Grid>
              )}
              {filteredServices.map(service => renderServiceCard(service, color))}
            </React.Fragment>
          );
        })}
      </Grid>
    </Box>
  );
};

export default Services; 