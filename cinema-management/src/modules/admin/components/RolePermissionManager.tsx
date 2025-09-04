import {
    AlertTriangle,
    Crown,
    Info,
    RotateCcw,
    Save,
    Settings,
    Shield,
    User,
    Users
} from 'lucide-react';
import React, { useState } from 'react';

interface Permission {
  key: string;
  label: string;
  description: string;
  category: 'USER' | 'CONTENT' | 'SYSTEM' | 'REPORTS';
  critical?: boolean;
}

interface Role {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  permissions: string[];
  userCount: number;
}

const PERMISSIONS: Permission[] = [
  // User Management
  { key: 'USER_VIEW', label: 'Xem danh sách người dùng', description: 'Xem thông tin người dùng', category: 'USER' },
  { key: 'USER_CREATE', label: 'Tạo người dùng mới', description: 'Thêm tài khoản người dùng', category: 'USER' },
  { key: 'USER_EDIT', label: 'Chỉnh sửa người dùng', description: 'Cập nhật thông tin người dùng', category: 'USER' },
  { key: 'USER_DELETE', label: 'Xóa người dùng', description: 'Xóa tài khoản người dùng', category: 'USER', critical: true },
  { key: 'USER_BAN', label: 'Khóa/Mở khóa tài khoản', description: 'Khóa hoặc mở khóa tài khoản', category: 'USER', critical: true },
  { key: 'ROLE_MANAGE', label: 'Quản lý phân quyền', description: 'Thay đổi vai trò và quyền hạn', category: 'USER', critical: true },
  
  // Content Management
  { key: 'MOVIE_VIEW', label: 'Xem danh sách phim', description: 'Xem thông tin phim', category: 'CONTENT' },
  { key: 'MOVIE_CREATE', label: 'Thêm phim mới', description: 'Tạo phim và upload nội dung', category: 'CONTENT' },
  { key: 'MOVIE_EDIT', label: 'Chỉnh sửa phim', description: 'Cập nhật thông tin phim', category: 'CONTENT' },
  { key: 'MOVIE_DELETE', label: 'Xóa phim', description: 'Xóa phim khỏi hệ thống', category: 'CONTENT', critical: true },
  
  { key: 'ROOM_VIEW', label: 'Xem danh sách phòng', description: 'Xem thông tin phòng chiếu', category: 'CONTENT' },
  { key: 'ROOM_CREATE', label: 'Tạo phòng chiếu', description: 'Thêm phòng chiếu mới', category: 'CONTENT' },
  { key: 'ROOM_EDIT', label: 'Chỉnh sửa phòng', description: 'Cập nhật cấu hình phòng', category: 'CONTENT' },
  { key: 'ROOM_DELETE', label: 'Xóa phòng chiếu', description: 'Xóa phòng khỏi hệ thống', category: 'CONTENT', critical: true },
  
  { key: 'SHOWTIME_VIEW', label: 'Xem lịch chiếu', description: 'Xem danh sách suất chiếu', category: 'CONTENT' },
  { key: 'SHOWTIME_CREATE', label: 'Tạo suất chiếu', description: 'Thêm suất chiếu mới', category: 'CONTENT' },
  { key: 'SHOWTIME_EDIT', label: 'Chỉnh sửa suất chiếu', description: 'Cập nhật thông tin suất chiếu', category: 'CONTENT' },
  { key: 'SHOWTIME_DELETE', label: 'Xóa suất chiếu', description: 'Hủy suất chiếu', category: 'CONTENT', critical: true },
  
  { key: 'BOOKING_VIEW', label: 'Xem đặt vé', description: 'Xem danh sách đặt vé', category: 'CONTENT' },
  { key: 'BOOKING_MANAGE', label: 'Quản lý đặt vé', description: 'Xử lý đặt vé và hoàn tiền', category: 'CONTENT' },
  
  // System Management
  { key: 'SYSTEM_CONFIG', label: 'Cấu hình hệ thống', description: 'Thay đổi cài đặt hệ thống', category: 'SYSTEM', critical: true },
  { key: 'BACKUP_RESTORE', label: 'Sao lưu & Phục hồi', description: 'Quản lý backup dữ liệu', category: 'SYSTEM', critical: true },
  { key: 'AUDIT_LOG', label: 'Nhật ký hệ thống', description: 'Xem log hoạt động hệ thống', category: 'SYSTEM' },
  
  // Reports
  { key: 'REPORTS_VIEW', label: 'Xem báo cáo', description: 'Xem các báo cáo thống kê', category: 'REPORTS' },
  { key: 'REPORTS_EXPORT', label: 'Xuất báo cáo', description: 'Xuất báo cáo ra file', category: 'REPORTS' },
  { key: 'ANALYTICS_VIEW', label: 'Xem phân tích', description: 'Xem dashboard analytics', category: 'REPORTS' },
];

const DEFAULT_ROLES: Role[] = [
  {
    key: 'ADMIN',
    label: 'Quản trị viên',
    description: 'Quyền cao nhất, có thể truy cập tất cả tính năng',
    icon: <Crown className="w-5 h-5" />,
    color: 'red',
    permissions: PERMISSIONS.map(p => p.key), // All permissions
    userCount: 3
  },
  {
    key: 'STAFF',
    label: 'Nhân viên',
    description: 'Quản lý nội dung và đặt vé, không có quyền quản trị',
    icon: <Shield className="w-5 h-5" />,
    color: 'blue',
    permissions: [
      'USER_VIEW', 'MOVIE_VIEW', 'MOVIE_CREATE', 'MOVIE_EDIT',
      'ROOM_VIEW', 'ROOM_CREATE', 'ROOM_EDIT',
      'SHOWTIME_VIEW', 'SHOWTIME_CREATE', 'SHOWTIME_EDIT',
      'BOOKING_VIEW', 'BOOKING_MANAGE',
      'REPORTS_VIEW'
    ],
    userCount: 8
  },
  {
    key: 'CUSTOMER',
    label: 'Khách hàng',
    description: 'Chỉ có thể xem và đặt vé',
    icon: <User className="w-5 h-5" />,
    color: 'green',
    permissions: [], // No admin permissions
    userCount: 1247
  }
];

interface RolePermissionManagerProps {
  open: boolean;
  onClose: () => void;
  onSave: (roles: Role[]) => void;
}

const RolePermissionManager: React.FC<RolePermissionManagerProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES);
  const [selectedRole, setSelectedRole] = useState<string>('ADMIN');
  const [hasChanges, setHasChanges] = useState(false);

  if (!open) return null;

  const currentRole = roles.find(r => r.key === selectedRole);

  const getPermissionsByCategory = (category: string) => {
    return PERMISSIONS.filter(p => p.category === category);
  };

  const isPermissionChecked = (permissionKey: string) => {
    return currentRole?.permissions.includes(permissionKey) || false;
  };

  const handlePermissionChange = (permissionKey: string, checked: boolean) => {
    if (!currentRole) return;

    setRoles(prev => prev.map(role => {
      if (role.key === selectedRole) {
        const newPermissions = checked
          ? [...role.permissions, permissionKey]
          : role.permissions.filter(p => p !== permissionKey);
        
        return { ...role, permissions: newPermissions };
      }
      return role;
    }));
    
    setHasChanges(true);
  };

  const handleSelectAllCategory = (category: string, checked: boolean) => {
    const categoryPermissions = getPermissionsByCategory(category).map(p => p.key);
    
    if (!currentRole) return;

    setRoles(prev => prev.map(role => {
      if (role.key === selectedRole) {
        let newPermissions;
        if (checked) {
          // Add all category permissions
          newPermissions = [...new Set([...role.permissions, ...categoryPermissions])];
        } else {
          // Remove all category permissions
          newPermissions = role.permissions.filter(p => !categoryPermissions.includes(p));
        }
        
        return { ...role, permissions: newPermissions };
      }
      return role;
    }));
    
    setHasChanges(true);
  };

  const isCategoryFullyChecked = (category: string) => {
    const categoryPermissions = getPermissionsByCategory(category);
    return categoryPermissions.every(p => isPermissionChecked(p.key));
  };

  const isCategoryPartiallyChecked = (category: string) => {
    const categoryPermissions = getPermissionsByCategory(category);
    const checkedCount = categoryPermissions.filter(p => isPermissionChecked(p.key)).length;
    return checkedCount > 0 && checkedCount < categoryPermissions.length;
  };

  const handleSave = () => {
    onSave(roles);
    setHasChanges(false);
    onClose();
  };

  const handleReset = () => {
    setRoles(DEFAULT_ROLES);
    setHasChanges(false);
  };

  const getRoleColor = (color: string) => {
    const colors = {
      red: 'bg-red-50 border-red-200 text-red-700',
      blue: 'bg-blue-50 border-blue-200 text-blue-700',
      green: 'bg-green-50 border-green-200 text-green-700',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'USER': return <Users className="w-4 h-4" />;
      case 'CONTENT': return <Settings className="w-4 h-4" />;
      case 'SYSTEM': return <Shield className="w-4 h-4" />;
      case 'REPORTS': return <Info className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'USER': return 'Quản lý người dùng';
      case 'CONTENT': return 'Quản lý nội dung';
      case 'SYSTEM': return 'Quản trị hệ thống';
      case 'REPORTS': return 'Báo cáo & Thống kê';
      default: return category;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden z-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-600 text-white">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-purple-600">
                  Quản lý phân quyền
                </h2>
                <p className="text-sm text-purple-500">
                  Cấu hình quyền hạn cho từng vai trò trong hệ thống
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {hasChanges && (
                <div className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Có thay đổi chưa lưu
                </div>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-purple-200 rounded-full transition-colors duration-200"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[calc(95vh-140px)]">
          {/* Role List */}
          <div className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold text-gray-700 mb-4">Danh sách vai trò</h3>
              <div className="space-y-2">
                {roles.map((role) => (
                  <button
                    key={role.key}
                    onClick={() => setSelectedRole(role.key)}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      selectedRole === role.key
                        ? `border-${role.color}-300 ${getRoleColor(role.color)}`
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`text-${role.color}-600`}>
                        {role.icon}
                      </div>
                      <span className="font-medium text-gray-900">{role.label}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{role.description}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">{role.userCount} người dùng</span>
                      <span className="text-gray-500">{role.permissions.length} quyền</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Permissions Configuration */}
          <div className="flex-1 p-6 overflow-y-auto">
            {currentRole && (
              <div>
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`text-${currentRole.color}-600`}>
                      {currentRole.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{currentRole.label}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{currentRole.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{currentRole.userCount} người dùng</span>
                    <span>{currentRole.permissions.length} quyền được cấp</span>
                  </div>
                </div>

                {/* Permission Categories */}
                <div className="space-y-6">
                  {['USER', 'CONTENT', 'SYSTEM', 'REPORTS'].map((category) => {
                    const categoryPermissions = getPermissionsByCategory(category);
                    const isFullyChecked = isCategoryFullyChecked(category);
                    const isPartiallyChecked = isCategoryPartiallyChecked(category);

                    return (
                      <div key={category} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        {/* Category Header */}
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getCategoryIcon(category)}
                              <h4 className="font-semibold text-gray-900">
                                {getCategoryName(category)}
                              </h4>
                              <span className="text-sm text-gray-500">
                                ({categoryPermissions.filter(p => isPermissionChecked(p.key)).length}/{categoryPermissions.length})
                              </span>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isFullyChecked}
                                ref={(input) => {
                                  if (input) input.indeterminate = isPartiallyChecked;
                                }}
                                onChange={(e) => handleSelectAllCategory(category, e.target.checked)}
                                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                              />
                              <span className="text-sm text-gray-700">Chọn tất cả</span>
                            </label>
                          </div>
                        </div>

                        {/* Permissions List */}
                        <div className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {categoryPermissions.map((permission) => (
                              <label
                                key={permission.key}
                                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                  isPermissionChecked(permission.key)
                                    ? 'bg-purple-50 border-purple-200'
                                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                                } ${permission.critical ? 'ring-1 ring-red-200' : ''}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isPermissionChecked(permission.key)}
                                  onChange={(e) => handlePermissionChange(permission.key, e.target.checked)}
                                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 mt-1"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <div className="font-medium text-gray-900">
                                      {permission.label}
                                    </div>
                                    {permission.critical && (
                                      <div className="flex items-center gap-1 text-red-600">
                                        <AlertTriangle className="w-3 h-3" />
                                        <span className="text-xs">Quan trọng</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {permission.description}
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              ⚠️ Thay đổi quyền hạn sẽ ảnh hưởng đến tất cả người dùng có vai trò này
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Đặt lại
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                  hasChanges
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Save className="w-4 h-4" />
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolePermissionManager;
