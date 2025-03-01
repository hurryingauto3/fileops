import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from 'react-query';
import theme from './theme';
import Layout from './components/Layout';
import Services from './pages/Services';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import MergePdfUpload from './pages/MergePdfUpload';
import Processing from './pages/Processing';
import SignIn from './pages/SignIn';
import { AuthProvider } from './contexts/AuthContext';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Services />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/upload/merge-pdf" element={<MergePdfUpload />} />
                <Route path="/processing/:jobId" element={<Processing />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App; 