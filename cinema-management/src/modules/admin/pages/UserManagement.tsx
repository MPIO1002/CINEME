import {
    AlertCircle,
    Ban,
    Calendar,
    CheckCircle,
    Clock,
    Crown,
    DollarSign,
    Edit,
    Eye,
    EyeClosed,
    EyeOffIcon,
    Filter,
    Phone,
    Search,
    Settings,
    Shield,
    ShoppingBag,
    User as UserIcon,
    UserPlus,
    Users,
    XCircle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { userApiService, type User } from '../../../services/userApi';
import { Pagination } from "../components/pagination";
import RolePermissionManager from '../components/RolePermissionManager';
import UserModal from '../components/UserModal';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [loading, setLoading] = useState(false);
  
  // Role Permission Manager
  const [rolePermissionOpen, setRolePermissionOpen] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  
  // Phone visibility state - track which phones are visible (default: all hidden)
  const [visiblePhones, setVisiblePhones] = useState<Set<string>>(new Set());

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersData = await userApiService.getAllUsers();
      console.log('Fetched users data:', usersData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Có lỗi xảy ra khi tải danh sách người dùng. Vui lòng thử lại!');
      setUsers([]);
    }
    setLoading(false);
  };

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRole, selectedStatus, showOnlineOnly]);

  // Apply filters
  useEffect(() => {
    const filtered = users.filter(user => {
      const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (user.phone?.includes(searchTerm) || false);
      const matchesRole = !selectedRole || user.role === selectedRole;
      const matchesStatus = !selectedStatus || user.status === selectedStatus;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
    
    setFilteredUsers(filtered);
  }, [users, searchTerm, selectedRole, selectedStatus]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedRole("");
    setSelectedStatus("");
    setShowOnlineOnly(false);
  };

  const handleAddUser = () => {
    setSelectedUser(undefined);
    setModalMode("add");
    setModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleBanUser = async (userId: string) => {
    try {
      setLoading(true);
      // Update user status locally for now
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, status: user.status === 'BANNED' ? 'ACTIVE' : 'BANNED' as const }
          : user
      ));
      // TODO: Call API to update user status
      // await userApiService.updateUserStatus(userId, newStatus);
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái người dùng!');
    }
    setLoading(false);
  };

  const handleSaveUser = async (user: User) => {
    try {
      setLoading(true);
      if (modalMode === "add") {
        const newUser = await userApiService.createUser(user);
        setUsers(prev => [...prev, newUser]);
        alert('Thêm người dùng thành công!');
      } else if (modalMode === "edit" && user.id) {
        const updatedUser = await userApiService.updateUser(user.id, user);
        setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
        alert('Cập nhật người dùng thành công!');
      }
      setModalOpen(false);
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Có lỗi xảy ra khi lưu thông tin người dùng!');
    }
    setLoading(false);
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'ADMIN': return <Crown className="w-4 h-4 text-red-500" />;
      case 'STAFF': return <Shield className="w-4 h-4 text-blue-500" />;
      case 'CUSTOMER': return <UserIcon className="w-4 h-4 text-green-500" />;
      default: return <UserIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'INACTIVE': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'BANNED': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800 border-red-200';
      case 'STAFF': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CUSTOMER': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'INACTIVE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'BANNED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Chưa xác định';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `${diffDays} ngày trước`;
    if (diffHours > 0) return `${diffHours} giờ trước`;
    if (diffMinutes > 0) return `${diffMinutes} phút trước`;
    return 'Vừa xong';
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStats = () => {
    const totalUsers = users.length;
    const adminUsers = users.filter(u => u.role === 'ADMIN').length;
    const topSpender = users.reduce((max, user) => 
      (user.totalSpent || 0) > (max.totalSpent || 0) ? user : max
    , users[0]);

    return { totalUsers, adminUsers, topSpender };
  };

  const stats = getStats();

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // Toggle phone visibility for a specific user
  const togglePhoneVisibility = (userId: string) => {
    setVisiblePhones(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId); // Hide phone (remove from visible set)
      } else {
        newSet.add(userId); // Show phone (add to visible set)
      }
      return newSet;
    });
  };

  const [visibleEmails, setVisibleEmails] = useState<Set<string>>(new Set());
  const toggleEmailVisibility = (userId: string) => {
    setVisibleEmails(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };
  return (
    <div className="bg-gray-50 max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-xl">
                        <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Quản lý người dùng</h1>
                        <p className="text-slate-600">Quản lý tài khoản và phân quyền người dùng trong hệ thống</p>
                    </div>
                </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setRolePermissionOpen(true)}
                  className="px-4 py-2 bg-purple-50 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Settings className="w-4 h-4" />
                  Quản lý phân quyền
                </button>
                <button
                  onClick={handleAddUser}
                  className="text-blue-600 bg-blue-50 hover:text-blue-900 transition-colors flex items-center justify-center space-x-2 px-4 py-2 border border-blue-600 rounded-lg hover:bg-blue-100 cursor-pointer gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Thêm người dùng
                </button>
              </div>
            </div>

            {/* Statistics */}
            {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Tổng người dùng</div>
                    <div className="text-xl font-bold text-gray-900">{stats.totalUsers}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Crown className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Quản trị viên</div>
                    <div className="text-xl font-bold text-gray-900">{stats.adminUsers}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Top khách hàng</div>
                    <div className="text-sm font-bold text-gray-900">{stats.topSpender?.fullName || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{formatCurrency(stats.topSpender?.totalSpent || 0)}</div>
                  </div>
                </div>
              </div>
            </div> */}
          </div>

          {/* Filters and Controls */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Filters */}
              {/* <div className="flex flex-wrap gap-3"> */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-50 h-11 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Tất cả vai trò</option>
                  <option value="ADMIN">Quản trị viên</option>
                  <option value="STAFF">Nhân viên</option>
                  <option value="CUSTOMER">Khách hàng</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-50 h-11 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Không hoạt động</option>
                  <option value="BANNED">Bị khóa</option>
                </select>
                </div>

                  {/* Clear Filters */}
                <div className=" flex items-end">
                    <button
                    onClick={clearFilters}
                    className="flex w-36 h-11 items-center space-x-2 px-4 py-2 text-gray-600 bg-gray-200 hover:text-gray-900 transition-colors border border-gray-300 rounded-lg cursor-pointer"
                    >
                        <Filter size={16} />
                        <span>Xóa bộ lọc</span>
                    </button>
                </div>
              </div>
            {/* </div> */}
          </div>

          {/* Content */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: itemsPerPage }).map((_, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gray-200 rounded"></div>
                          <div className="h-5 bg-gray-200 rounded w-32"></div>
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-6 h-6 bg-gray-200 rounded"></div>
                          <div className="w-6 h-6 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="h-6 bg-gray-200 rounded w-24"></div>
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-28"></div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                          <div className="h-3 bg-gray-200 rounded w-8"></div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2"></div>
                      </div>
                    </div>
                    <div className="h-12 bg-gray-100 border-t border-gray-100"></div>
                  </div>
                ))}
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
              {paginatedUsers.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Không tìm thấy người dùng nào</p>
                  <p className="text-gray-400 text-sm">Thử thay đổi bộ lọc hoặc thêm người dùng mới</p>
                </div>
              ) : (
                paginatedUsers.map((user) => (
                <div key={user.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                    <div className='h-11/12'>
                        {/* User Header */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                {user.avatar ? (
                                <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                getUserInitials(user.fullName)
                                )}
                            </div>
                            </div>
                            <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{user.fullName}</h3>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-gray-500 truncate">
                                {visibleEmails && visibleEmails.has(user.id) ? user.email : "••••••••••••••••••••••••"}
                              </p>
                              <button
                                onClick={() => toggleEmailVisibility(user.id)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                title={visibleEmails && visibleEmails.has(user.id) ? "Ẩn email" : "Hiện email"}
                                type="button"
                              >
                                {visibleEmails && visibleEmails.has(user.id) ? (
                                  <Eye className="w-4 h-4 text-gray-400" />
                                ) : (
                                  <EyeOffIcon className="w-4 h-4 text-gray-400" />
                                )}
                              </button>
                            </div>
                            </div>
                        </div>

                        {/* Role and Status */}
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-1">
                            {getRoleIcon(user.role)}
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(user.role)}`}>
                                {user.role === 'ADMIN' ? 'Quản trị' : 
                                user.role === 'STAFF' ? 'Nhân viên' : 'Khách hàng'}
                            </span>
                            </div>
                            <div className="flex items-center gap-1">
                            {getStatusIcon(user.status)}
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadgeColor(user.status)}`}>
                                {user.status === 'ACTIVE' ? 'Hoạt động' : 
                                user.status === 'INACTIVE' ? 'Tạm dừng' : 'Bị khóa'}
                            </span>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-2 mb-4">
                            {user.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="w-4 h-4" />
                                <div className='flex items-center gap-3 w-30 relative'>
                                    <span>
                                        {visiblePhones && visiblePhones.has(user.id) ? user.phone : "••••••••••••"}
                                    </span>
                                    <button
                                        onClick={() => togglePhoneVisibility(user.id)}
                                        className="p-1 hover:bg-gray-100 rounded transition-colors absolute right-0 cursor-pointer"
                                        title={visiblePhones.has(user.id) ? "Ẩn số điện thoại" : "Hiện số điện thoại"}
                                    >
                                        {visiblePhones.has(user.id) ? (
                                            <Eye className="w-4 h-4 text-gray-400" />
                                        ) : (
                                            <EyeOffIcon className="w-4 h-4 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>Tham gia: {formatDate(user.joinDate)}</span>
                            </div>
                            {user.lastLogin && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span>Online: {getTimeAgo(user.lastLogin)}</span>
                            </div>
                            )}
                        </div>

                        {/* Stats for Customers */}
                        {user.role === 'CUSTOMER' && (
                            <div className="flex justify-between items-center mb-4 p-3 bg-gray-50 rounded-lg">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-sm font-medium text-gray-900">
                                <ShoppingBag className="w-4 h-4" />
                                {user.totalBookings || 0}
                                </div>
                                <div className="text-xs text-gray-500">Vé đã mua</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-sm font-medium text-gray-900">
                                <DollarSign className="w-4 h-4" />
                                {formatCurrency(user.totalSpent || 0).replace('₫', '')}
                                </div>
                                <div className="text-xs text-gray-500">Tổng chi tiêu</div>
                            </div>
                            </div>
                        )}
                    </div>
                  {/* Actions */}
                  <div className="flex items-center gap-2 h-1/12">
                    <button
                      onClick={() => handleViewUser(user)}
                      className="flex-1 py-2 px-3 text-purple-600 border border-purple-600 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors text-sm font-medium cursor-pointer"
                    >
                      <Eye className="w-4 h-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => handleEditUser(user)}
                      className="flex-1 py-2 px-3 text-blue-600 border border-blue-600 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-sm font-medium cursor-pointer"
                    >
                      <Edit className="w-4 h-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => handleBanUser(user.id)}
                      className={`flex-1 py-2 px-3 border rounded-lg transition-colors text-sm font-medium cursor-pointer ${
                        user.status === 'BANNED' 
                          ? 'text-green-600 border-green-600 bg-green-50 hover:bg-green-100' 
                          : 'text-red-600 border-red-600 bg-red-50 hover:bg-red-100'
                      }`}
                    >
                      <Ban className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </div>
              ))
              )}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredUsers.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>

          {/* User Modal */}
          <UserModal
            open={modalOpen}
            mode={modalMode}
            user={selectedUser}
            onClose={() => setModalOpen(false)}
            onSubmit={handleSaveUser}
          />

          {/* Role Permission Manager */}
          <RolePermissionManager
            open={rolePermissionOpen}
            onClose={() => setRolePermissionOpen(false)}
            onSave={(roles) => {
              // Handle role permission changes here
              console.log('Updated roles:', roles);
              // You would typically save to backend here
            }}
          />
        </div>
  );
};

export default UserManagement;
