import {
    AlertCircle,
    CheckCircle,
    Crown,
    Edit3,
    Eye,
    Filter,
    MoreHorizontal,
    Plus,
    Search,
    Shield,
    UserIcon,
    Users,
    XCircle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { employeeApiService, type Employee } from '../../../../services/employeeApi';
import { Pagination } from '../../components/pagination';
import EmployeeModal from './components/EmployeeModal';

const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [loading, setLoading] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedTheater, setSelectedTheater] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Phone visibility state - track which phones are visible (default: all hidden)
  const [visiblePhones, setVisiblePhones] = useState<Set<string>>(new Set());

  // Fetch employees from API
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const employeesData = await employeeApiService.getAllEmployees();
      console.log('Fetched employees data:', employeesData);
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error fetching employees:', error);
      alert('Có lỗi xảy ra khi tải danh sách nhân viên. Vui lòng thử lại!');
      setEmployees([]);
    }
    setLoading(false);
  };

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRole, selectedTheater, selectedStatus]);

  // Apply filters
  useEffect(() => {
    const filtered = employees.filter(employee => {
      const matchesSearch = employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (employee.phone?.includes(searchTerm) || false);
      const matchesRole = !selectedRole || employee.roleName === selectedRole;
      const matchesTheater = !selectedTheater || employee.theaterName === selectedTheater;
      const matchesStatus = !selectedStatus || employee.status === selectedStatus;

      return matchesSearch && matchesRole && matchesTheater && matchesStatus;
    });

    setFilteredEmployees(filtered);
  }, [employees, searchTerm, selectedRole, selectedTheater, selectedStatus]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedRole("");
    setSelectedTheater("");
    setSelectedStatus("");
  };

  const handleAddEmployee = () => {
    setSelectedEmployee(undefined);
    setModalMode("add");
    setModalOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleSaveEmployee = async (employee: Employee) => {
    try {
      setLoading(true);
      if (modalMode === "add") {
        const newEmployee = await employeeApiService.createEmployee({
          email: employee.email,
          password: employee.password || '', // Assuming password is added in modal
          fullName: employee.fullName,
          phone: employee.phone,
          theaterId: employee.theaterId || '',
          roleId: employee.roleId || '',
        });
        setEmployees(prev => [...prev, newEmployee]);
        alert('Thêm nhân viên thành công!');
      } else if (modalMode === "edit") {
        // const updatedEmployee = await employeeApiService.updateEmployee(employee.id, employee);
        // setEmployees(prev => prev.map(e => e.id === employee.id ? updatedEmployee : e));
        // alert('Cập nhật nhân viên thành công!');
        alert('Chức năng cập nhật nhân viên hiện chưa được triển khai.');
      }
      setModalOpen(false);
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('Có lỗi xảy ra khi lưu thông tin nhân viên!');
    }
    setLoading(false);
  };

  const getRoleIcon = (roleName?: string) => {
    switch (roleName) {
      case 'Admin': return <Crown className="w-4 h-4 text-red-500" />;
      case 'Staff': return <Shield className="w-4 h-4 text-blue-500" />;
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

  const getRoleBadgeColor = (roleName?: string) => {
    switch (roleName) {
      case 'Admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'Staff': return 'bg-blue-100 text-blue-800 border-blue-200';
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

  const getEmployeeInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStats = () => {
    const totalEmployees = employees.length;
    const adminEmployees = employees.filter(e => e.roleName === 'Admin').length;
    const staffEmployees = employees.filter(e => e.roleName === 'Staff').length;

    return { totalEmployees, adminEmployees, staffEmployees };
  };

  const stats = getStats();

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage);

  // Toggle phone visibility for a specific employee
  const togglePhoneVisibility = (employeeId: string) => {
    setVisiblePhones(prev => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId); // Hide phone (remove from visible set)
      } else {
        newSet.add(employeeId); // Show phone (add to visible set)
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
              <h1 className="text-2xl font-bold text-gray-900">
                Quản lý nhân viên
              </h1>
              <p className="text-sm text-gray-600">
                Quản lý thông tin và quyền hạn của nhân viên
              </p>
            </div>
          </div>
          <button
            onClick={handleAddEmployee}
            className="text-blue-600 bg-blue-50 hover:text-blue-900 transition-colors flex items-center justify-center space-x-2 px-4 py-2 border border-blue-600 rounded-lg hover:bg-blue-100 cursor-pointer gap-2"
          >
            <Plus className="w-4 h-4" />
            Thêm nhân viên
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Tổng nhân viên</div>
                <div className="text-xl font-bold text-gray-900">{stats.totalEmployees}</div>
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
                <div className="text-xl font-bold text-gray-900">{stats.adminEmployees}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Nhân viên</div>
                <div className="text-xl font-bold text-gray-900">{stats.staffEmployees}</div>
              </div>
            </div>
          </div>
        </div>
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
                className="h-11 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Tất cả vai trò</option>
                <option value="Admin">Admin</option>
                <option value="Staff">Staff</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rạp</label>
              <select
                value={selectedTheater}
                onChange={(e) => setSelectedTheater(e.target.value)}
                className="h-11 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Tất cả rạp</option>
                {/* Add theater options dynamically if available */}
                <option value="Cinestar Hai Ba Trung (TP.HCM)">Cinestar Hai Ba Trung (TP.HCM)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-11 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Không hoạt động</option>
                <option value="BANNED">Bị cấm</option>
              </select>
            </div>

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
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-14"></div>
                </div>
              </div>
              <div className="h-12 bg-gray-100 border-t border-gray-100"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
          {paginatedEmployees.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Không tìm thấy nhân viên nào</p>
              <p className="text-gray-400 text-sm">Thử thay đổi bộ lọc hoặc thêm nhân viên mới</p>
            </div>
          ) : (
            paginatedEmployees.map((employee) => (
              <div key={employee.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {getEmployeeInitials(employee.fullName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{employee.fullName}</h3>
                    <p className="text-sm text-gray-500 truncate">{employee.email}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Số điện thoại:</span>
                    <button
                      onClick={() => togglePhoneVisibility(employee.id || '')}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {visiblePhones.has(employee.id || '') ? employee.phone : '••••••••••'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Vai trò:</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(employee.roleName)}`}>
                      {getRoleIcon(employee.roleName)}
                      {employee.roleName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Rạp:</span>
                    <span className="text-sm text-gray-900 truncate max-w-32">{employee.theaterName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Trạng thái:</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(employee.status)}`}>
                      {getStatusIcon(employee.status)}
                      {employee.status === 'ACTIVE' ? 'Hoạt động' : employee.status === 'INACTIVE' ? 'Không hoạt động' : 'Bị cấm'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewEmployee(employee)}
                    className="flex-1 px-3 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    Xem
                  </button>
                  <button
                    onClick={() => handleEditEmployee(employee)}
                    className="flex-1 px-3 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit3 className="w-4 h-4" />
                    Sửa trang thai
                  </button>
                  <div className="relative">
                    <button
                      className="p-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => {/* Toggle dropdown */}}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {/* Dropdown menu can be added here */}
                  </div>
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
          totalItems={filteredEmployees.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Employee Modal */}
      <EmployeeModal
        open={modalOpen}
        mode={modalMode}
        employee={selectedEmployee}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSaveEmployee}
      />
    </div>
  );
};

export default EmployeeManagement;