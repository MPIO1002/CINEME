import { API_BASE_URL } from '../components/api-config';

/**
 * Utility function để xử lý logout cho cả client và admin
 * @param userType - 'client' hoặc 'admin'
 * @param showToast - Function để hiển thị toast notification (optional)
 * @param navigate - Function để redirect (optional) 
 */
export const handleLogoutAPI = async (
  userType: 'client' | 'admin' = 'client',
  showToast?: (type: 'success' | 'error', message: string) => void,
  navigate?: (path: string) => void
) => {
  try {
    // Get appropriate token based on user type
    const tokenKey = userType === 'admin' ? 'admin_token' : 'accessToken';
    const storedToken = localStorage.getItem(tokenKey);
    
    let accessToken = '';
    
    if (userType === 'admin' && storedToken) {
      // Admin token is stored as JSON object
      const tokenData = JSON.parse(storedToken);
      accessToken = tokenData.accessToken || tokenData.token;
    } else if (userType === 'client' && storedToken) {
      // Client token is stored directly as string
      accessToken = storedToken;
    }
    
    // Call logout API if user is authenticated
    if (accessToken) {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (!response.ok) {
        console.warn('Logout API returned non-200 status:', response.status);
      }
    }
  } catch (error) {
    console.error('Logout API error:', error);
    // Continue with logout even if API fails - we don't want to prevent user from logging out
  } finally {
    // Always clear appropriate storage based on user type
    if (userType === 'admin') {
      localStorage.removeItem('admin_token');
      
      // Redirect to admin login
      if (navigate) {
        navigate('/admin/login');
      } else {
        window.location.href = '/admin/login';
      }
    } else {
      // Clear client tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      
      // Show success message and redirect
      showToast?.('success', 'Đăng xuất thành công!');
      
      if (navigate) {
        navigate('/');
      } else {
        window.location.href = '/';
      }
    }
  }
};

/**
 * Check if user is authenticated
 * @param userType - 'client' hoặc 'admin'
 * @returns boolean
 */
export const isAuthenticated = (userType: 'client' | 'admin' = 'client'): boolean => {
  const tokenKey = userType === 'admin' ? 'admin_token' : 'accessToken';
  const token = localStorage.getItem(tokenKey);
  return !!token;
};

/**
 * Get current user data from localStorage
 * @param userType - 'client' hoặc 'admin'
 * @returns User data object or null
 */
export const getCurrentUser = (userType: 'client' | 'admin' = 'client') => {
  try {
    if (userType === 'admin') {
      const adminToken = localStorage.getItem('admin_token');
      return adminToken ? JSON.parse(adminToken) : null;
    } else {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    }
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};