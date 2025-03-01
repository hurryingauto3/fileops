import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Switch,
  TextField,
  Button,
  Grid,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Settings: React.FC = () => {
  const { user } = useAuth();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Settings</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Profile Settings</Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box component="form" sx={{ '& > :not(style)': { mb: 2 } }}>
              <TextField
                fullWidth
                label="Name"
                defaultValue={user?.name}
              />
              <TextField
                fullWidth
                label="Email"
                defaultValue={user?.email}
                type="email"
              />
              <Button variant="contained">Save Changes</Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Preferences</Typography>
            <Divider sx={{ mb: 3 }} />
            
            <List>
              <ListItem>
                <ListItemText 
                  primary="Email Notifications"
                  secondary="Receive email updates about your processed files"
                />
                <Switch />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Dark Mode"
                  secondary="Toggle dark/light theme"
                />
                <Switch />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings; 