// import { useAuthStore } from "@/stores/useAuthStore";
import { API_BASE_URL } from "@/components/api-config";
import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: `${API_BASE_URL}`,
  withCredentials: true,
});

// gắn access token vào req header
api.interceptors.request.use((config) => {
  // Các API không cần gắn accessToken (vì chưa có hoặc đang làm mới token)
  const noAuthRequired = [
    '/auth/login',
    '/auth/login-admin', 
    '/auth/register',
    '/auth/refresh-token'
  ];

  // Kiểm tra xem URL có trong danh sách không cần auth không
  const skipAuth = noAuthRequired.some(path => config.url?.includes(path));
  
  if (skipAuth) {
    return config; // Không gắn token cho các API này
  }

  // Kiểm tra xem đang ở admin hay client
  // Nếu URL chứa '/admin' hoặc có admin token thì dùng admin token
  const isAdminRequest = config.url?.includes('/admin') || 
                         window.location.pathname.startsWith('/admin');
  
  let accessToken;
  if (isAdminRequest) {
    // Lấy admin token
    accessToken = localStorage.getItem('admin_accessToken');
  } else {
    // Lấy client token
    accessToken = localStorage.getItem('accessToken');
  }

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// Queue để xử lý refresh token (tránh race condition)
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// tự động gọi refresh api khi access token hết hạn
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // những api không cần check
    if (
      originalRequest.url.includes("/login-admin") ||
      originalRequest.url.includes("/register") ||
      originalRequest.url.includes("/auth/refresh-token")
    ) {
      return Promise.reject(error);
    }
    
    originalRequest._retryCount = originalRequest._retryCount || 0;

    if ((error.response?.status === 401 || error.response?.status === 403) && originalRequest._retryCount < 4) {
      originalRequest._retryCount += 1;

      // Nếu đang refresh token, đưa request vào queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      isRefreshing = true;

      try {
        // Gọi API refresh token (refreshToken được gửi tự động qua cookies)
        const res = await api.post("/auth/refresh-token");
        const newAccessToken = res.data.accessToken;

        // Kiểm tra xem request gốc là admin hay client
        const isAdminRequest = originalRequest.url?.includes('/admin') || 
                               window.location.pathname.startsWith('/admin');

        if (isAdminRequest) {
          localStorage.setItem('admin_accessToken', newAccessToken);
        } else {
          localStorage.setItem('accessToken', newAccessToken);
        }
        
        // Lưu refreshToken mới vào cookie (nếu backend trả về)
        if (res.data.refreshToken) {
          Cookies.set('refreshToken', res.data.refreshToken, {
            expires: 30,  // 30 days
            secure: window.location.protocol === 'https:',
            sameSite: window.location.protocol === 'https:' ? 'None' : 'Lax'
          });
        }
        
        // Update token trong request header và retry
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        // Xử lý tất cả requests đang chờ trong queue
        processQueue(null, newAccessToken);
        isRefreshing = false;
        
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token thất bại - xóa tokens và redirect về login
        processQueue(refreshError, null);
        isRefreshing = false;
        
        const isAdminRequest = originalRequest.url?.includes('/admin') || 
                               window.location.pathname.startsWith('/admin');
        
        if (isAdminRequest) {
          localStorage.removeItem('admin_accessToken');
          window.location.href = '/admin/login';
        } else {
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
        }
        Cookies.remove('refreshToken');
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;