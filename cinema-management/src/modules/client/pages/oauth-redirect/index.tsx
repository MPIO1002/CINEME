import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from '../../../../hooks/useToast';

const OAuthRedirect = () => {
  const location = useLocation();
  const { showToast } = useToast();
  const processedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple executions
    if (processedRef.current) return;
    
    const handleOAuthCallback = () => {
      const urlParams = new URLSearchParams(location.search);
      const token = urlParams.get('token');

      if (!token) {
        showToast('error', 'Token không hợp lệ');
        window.location.href = '/';
        return;
      }

      try {
        // Mark as processed to prevent re-execution
        processedRef.current = true;
        
        // Save access token to localStorage
        localStorage.setItem('accessToken', token);
        localStorage.setItem('refreshToken', token);
        
        showToast('success', 'Đăng nhập Google thành công!');
        
        // Dispatch custom event to notify navbar to update
        window.dispatchEvent(new Event('userDataUpdated'));
        
        // Force page reload to refresh navbar
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      } catch (error) {
        console.error('OAuth callback error:', error);
        showToast('error', 'Lỗi kết nối. Vui lòng thử lại.');
        window.location.href = '/';
      }
    };

    handleOAuthCallback();
  }, [location.search, showToast]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--color-background)]">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4 text-[var(--color-text)]">Đang xử lý đăng nhập...</h1>
        <p className="text-[var(--color-text)]">Vui lòng chờ trong giây lát</p>
      </div>
    </div>
  );
};

export default OAuthRedirect;
