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
export const checkPermission = (requiredPermission: string) => {
  try {
    const decoded: JWTPayload = jwtDecode(requiredPermission);
    return decoded.permissions || [];
  } catch {
    return [];
  }
};

export const getPermissions = (): string[] => {
  const token = localStorage.getItem("accessToken");
  if (!token) return [];
  try {
    const decoded: JWTPayload = jwtDecode(token);
    return decoded.permissions || [];
  } catch {
    return [];
  }
};

export const getUserData = (): UserData | null => {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;
  const permissions = getPermissions();
  return {
    id: '',
    email: '',
    fullName: '',
    accessToken: token,
    refreshToken: localStorage.getItem("refreshToken") || '',
    permissions
  };
};

export const hasPermission = (permission: string): boolean => {
  const userData = getUserData();
  return userData?.permissions?.includes(permission) || false;
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
  const token = localStorage.getItem("accessToken");
  if (!token) return false;
  
  // Kiểm tra token có expired không
  return !isTokenExpired(token);
};

export const hasAnyAdminPermission = (): boolean => {
  const userData = getUserData();
  return (userData?.permissions?.length ?? 0) > 0;
};

export const logout = () => {
  localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("fullName");
  window.location.href = "/admin/login";
};