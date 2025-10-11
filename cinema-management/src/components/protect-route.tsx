import { hasAnyAdminPermission, isAuthenticated } from '@/modules/admin/utils/authUtils';
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminPrivateRoute = ({ 
  children 
}: { 
  children?: React.ReactNode;
}) => {
  // Chỉ check authentication - Backend sẽ handle authorization
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  
  if (!hasAnyAdminPermission()) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children ? <>{children}</> : <Outlet />;
};

export default AdminPrivateRoute;