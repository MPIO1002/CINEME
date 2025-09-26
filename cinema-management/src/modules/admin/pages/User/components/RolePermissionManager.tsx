import {
    AlertTriangle,
    CheckCircle,
    Clock,
    Crown,
    Film,
    RotateCcw,
    Save,
    Settings,
    Shield,
    Ticket,
    User,
    Users,
    Video
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import rolePermissionApiService, { type Role, type Permission, type ApiPermission, type ApiRole } from '@/services/rolePermissionApi';


const inferCategory = (key: string): 'USER' | 'MOVIE' | 'SHOWTIME' | 'ROOM' | 'THEATER' | 'SYSTEM' | 'BOOKING' | 'ACTOR' => {
    if (key.startsWith('user.')) return 'USER';
    if (key.startsWith('movie.')) return 'MOVIE';
    if (key.startsWith('showtime.')) return 'SHOWTIME';
    if (key.startsWith('room.')) return 'ROOM';
    if (key.startsWith('theater.')) return 'THEATER';
    if (key.startsWith('system.')) return 'SYSTEM';
    if (key.startsWith('actor.')) return 'ACTOR';
    return 'BOOKING';
};

const mapApiPermissionToPermission = (apiPerm: ApiPermission): Permission => ({
  key: apiPerm.key,
  label: apiPerm.name,
  description: `Cho phép ${apiPerm.name.toLowerCase()}`,
  category: inferCategory(apiPerm.key),
  critical: apiPerm.key.includes('.delete') || apiPerm.key === 'user.editPermission'
});

const mapApiRoleToRole = (apiRole: ApiRole, index: number): Role => {
  const roleConfigs = [
    {
      key: 'ADMIN',
      label: 'Quản trị viên',
      description: 'Quyền cao nhất, có thể truy cập tất cả tính năng',
      icon: <Crown className="w-5 h-5" />,
      color: 'red',
      userCount: 3
    },
    {
      key: 'STAFF',
      label: 'Nhân viên',
      description: 'Quản lý nội dung và đặt vé, không có quyền quản trị',
      icon: <Shield className="w-5 h-5" />,
      color: 'blue',
      userCount: 8
    },
    {
      key: 'CUSTOMER',
      label: 'Khách hàng',
      description: 'Chỉ có thể xem và đặt vé',
      icon: <User className="w-5 h-5" />,
      color: 'green',
      userCount: 1247
    },
    {
      key: 'MANAGER',
      label: 'Quản lý',
      description: 'Quản lý nội dung và một số quyền hệ thống',
      icon: <Settings className="w-5 h-5" />,
      color: 'purple',
      userCount: 5
    }
  ];
  
  const config = roleConfigs.find(c => c.label.toLowerCase() === apiRole.name.toLowerCase()) || roleConfigs[index % roleConfigs.length];
  
  return {
    ...config,
    key: apiRole.name.toUpperCase(),
    permissions: apiRole.permissions || (apiRole.name.toLowerCase() === 'admin' ? [] : []),
  };
};

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
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [permResponse, roleResponse] = await Promise.all([
            rolePermissionApiService.getAllPermissions(),
            rolePermissionApiService.getAllRoles()
        ]);
        const mappedPermissions = permResponse.map(mapApiPermissionToPermission);
        setPermissions(mappedPermissions);
        const mappedRoles = roleResponse.map((role: ApiRole, index: number) => mapApiRoleToRole(role, index));
        setRoles(mappedRoles);
        setSelectedRole(mappedRoles[0]?.key || '');
      } catch (err) {
        setError('Không thể tải dữ liệu: ' + (err instanceof Error ? err.message : 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchData();
    }
  }, [open]);

  if (!open) return null;

  const currentRole = roles.find(r => r.key === selectedRole);

  const getPermissionsByCategory = (category: string) => {
    return permissions.filter(p => p.category === category);
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
          newPermissions = [...new Set([...role.permissions, ...categoryPermissions])];
        } else {
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

  const handleSave = async () => {
    try {
      // Assuming a POST endpoint to save roles; adjust URL/method as needed
      const response = await fetch('http://localhost:8080/api/v1/roles/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roles.map(role => ({
          name: role.label,
          permissions: role.permissions
        })))
      });
      const result = await response.json();
      if (result.statusCode === 200) {
        onSave(roles);
        setHasChanges(false);
        onClose();
      } else {
        throw new Error(result.message || 'Failed to save roles');
      }
    } catch (err) {
      setError('Không thể lưu thay đổi: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleReset = async () => {
    try {
      const roleResponse = await fetch('http://localhost:8080/api/v1/roles');
      const roleData = await roleResponse.json();
      if (roleData.statusCode === 200) {
        const mappedRoles = roleData.data.map((role: ApiRole, index: number) => mapApiRoleToRole(role, index));
        setRoles(mappedRoles);
        setHasChanges(false);
      } else {
        throw new Error(roleData.message || 'Failed to reset roles');
      }
    } catch (err) {
      setError('Không thể đặt lại: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const getRoleColor = (color: string) => {
    const colors = {
      red: 'bg-red-50 border-red-200 text-red-700',
      blue: 'bg-blue-50 border-blue-200 text-blue-700',
      green: 'bg-green-50 border-green-200 text-green-700',
      purple: 'bg-purple-50 border-purple-200 text-purple-700'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

    const getCategoryIcon = (category: string) => {
        switch (category) {
        case 'USER': return <Users className="w-4 h-4" />;
        case 'MOVIE': return <Video className="w-4 h-4" />;
        case 'SHOWTIME': return <Clock className="w-4 h-4" />;
        case 'ROOM': return <CheckCircle className="w-4 h-4" />;
        case 'THEATER': return <Film className="w-4 h-4" />;
        case 'SYSTEM': return <Shield className="w-4 h-4" />;
        case 'BOOKING': return <Ticket className="w-4 h-4" />;
        case 'ACTOR': return <User className="w-4 h-4" />;
        default: return <Settings className="w-4 h-4" />;
        }
    };

    const getCategoryName = (category: string) => {
        switch (category) {
        case 'USER': return 'Quản lý người dùng';
        case 'MOVIE': return 'Quản lý phim';
        case 'SHOWTIME': return 'Quản lý lịch chiếu';
        case 'ROOM': return 'Quản lý phòng chiếu';
        case 'THEATER': return 'Quản lý rạp chiếu';
        case 'SYSTEM': return 'Quản trị hệ thống';
        case 'BOOKING': return 'Quản lý bán vé';
        case 'ACTOR': return 'Quản lý diễn viên';
        default: return category;
        }
    };

    const handleAddRole = () => {
      const newRole: Role = {
        key: `role_${Date.now()}`,
        label: 'New Role',
        description: 'Description for new role',
        icon: <Shield className="w-4 h-4" />,
        color: 'blue',
        permissions: [],
        userCount: 0
      };
      setRoles((prevRoles) => [...prevRoles, newRole]);
      setSelectedRole(newRole.key);
    //   setHasChanges(true);
    };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] p-6">
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] p-6">
          <p className="text-red-600">{error}</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

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
        <div className="flex h-[calc(93vh-140px)]">
          {/* Role List */}
          <div className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
                <button
                  onClick={handleAddRole}
                  className='bg-purple-500 rounded-lg text-white px-4 py-2 mb-4 border-white border-2 hover:text-purple-700 hover:border-purple-600 hover:bg-white transition-colors duration-200 w-full flex items-center justify-center gap-2'
                >Thêm</button>
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
                  {[ 'MOVIE', 'SHOWTIME', 'ACTOR', 'ROOM', 'THEATER', 'USER', 'SYSTEM', 'BOOKING'].map((category) => {
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