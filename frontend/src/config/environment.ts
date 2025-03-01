export const environment = {
  production: process.env.NODE_ENV === 'production',
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 10,
  supportedFileTypes: {
    pdf: ['.pdf'],
    image: ['.jpg', '.jpeg', '.png'],
    document: ['.doc', '.docx']
  },
  auth: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token'
  }
}; 