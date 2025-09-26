import { hasAnyAdminPermission, hasPermission, isAuthenticated } from '@/modules/admin/utils/authUtils';
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminPrivateRoute = ({ 
  children, 
  requiredPermission 
}: { 
  children?: React.ReactNode; 
  requiredPermission?: string 
}) => {
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  
  if (!hasAnyAdminPermission()) {
    return <Navigate to="/admin/login" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    // Chuyển hướng về dashboard nếu không có quyền
    return <Navigate to="/admin" replace />;
  }
  
  return children ? <>{children}</> : <Outlet />;
};

export default AdminPrivateRoute;