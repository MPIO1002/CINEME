import jwtDecode from 'jwt-decode';

interface JWTPayload {
  sub?: string;
  id?: string;
  email?: string;
  fullName?: string;
  name?: string;
  permissions?: string[];
  roles?: string[];
  exp?: number;
  iat?: number;
}

export interface UserData {
  id: string;
  email: string;
  fullName: string;
  accessToken: string;
  refreshToken: string;
  permissions: string[];
}
// Các functions về permissions không cần thiết nữa - Backend handle authorization
// export const checkPermission = (requiredPermission: string): boolean => {
//   const permissions = getPermissions();
//   return permissions.includes(requiredPermission);
// };

// export const getPermissions = (): string[] => {
//   const token = localStorage.getItem("accessToken");
//   if (!token) return [];
//   try {
//     const decoded: JWTPayload = jwtDecode(token);
//     return decoded.permissions || [];
//   } catch {
//     return [];
//   }
// };

export const getUserData = (): UserData | null => {
  const token = localStorage.getItem("admin_accessToken");
  if (!token) return null;
  
  // Đơn giản hóa - chỉ return basic info, không cần decode permissions
  return {
    id: '',
    email: '',
    fullName: localStorage.getItem("admin_fullName") || '',
    accessToken: token,
    refreshToken: localStorage.getItem("admin_refreshToken") || '',
    permissions: [] // Không cần permissions nữa
  };
};

export const hasPermission = (_permission: string): boolean => {
  // Tạm thời return true - Backend sẽ handle authorization
  // Các components cũ vẫn có thể hoạt động mà không bị lỗi
  return true;
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: JWTPayload = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp ? decoded.exp < currentTime : false;
  } catch {
    return true; // Nếu không decode được thì coi như expired
  }
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("admin_accessToken");
  if (!token) return false;
  
  // Kiểm tra user type phải là admin
  const userType = localStorage.getItem("admin_userType");
  if (userType !== "admin") return false;
  
  // Kiểm tra token có expired không
  return !isTokenExpired(token);
};

export const hasAnyAdminPermission = (): boolean => {
  // Với logic backend mới: chỉ cần có valid token là có thể vào admin
  // Backend sẽ handle authorization khi call API
  const token = localStorage.getItem("admin_accessToken");
  const userType = localStorage.getItem("admin_userType");
  return token !== null && userType === "admin" && !isTokenExpired(token);
};

export const logout = () => {
  localStorage.removeItem("admin_accessToken");
  localStorage.removeItem("admin_refreshToken");
  localStorage.removeItem("admin_fullName");
  localStorage.removeItem("admin_userType");
  window.location.href = "/admin/login";
};