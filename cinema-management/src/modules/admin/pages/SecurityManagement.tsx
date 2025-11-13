import { rolePermissionApiService, type Permission, type Role } from "@/services/rolePermissionApi";
import { Autocomplete, Checkbox, TextField } from "@mui/material";
import { Edit, Loader, Lock, Plus, Shield, Trash2, UserCheck, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import Loading from "../components/loading";
import { Pagination } from "../components/pagination";

const SecurityManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState("permissions");
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState<'permission' | 'role'>('permission');
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
    const [formData, setFormData] = useState({ id: '', key: '', name: '', selectedPermissions: [] as string[] });
    const [searchTerm, setSearchTerm] = useState('');



    const fetchData = async () => {
        setLoading(true);
        try {
            const [fetchedPermissions, fetchedRoles] = await Promise.all([
                rolePermissionApiService.getAllPermissions(),
                rolePermissionApiService.getAllRoles()
            ]);
            setPermissions(fetchedPermissions);
            setRoles(fetchedRoles);
            console.log(fetchedRoles);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const openDialog = (type: 'permission' | 'role', mode: 'add' | 'edit' = 'add', item?: any) => {
        setDialogType(type);
        console.log(item);
        setDialogMode(mode);
        // if (mode === 'edit' && roleToEdit) {
        //     setFormData({
        //         key: '',
        //         name: roleToEdit.name,
        //         selectedPermissions: roleToEdit.permissionList?.map(p => p.key) || []
        //     });
        // } else {
        //     setFormData({ key: '', name: '', selectedPermissions: [] });
        // }
        if (mode === 'edit' && item) {
            switch(type) {
                case 'permission':
                    setFormData({ id: '', key: item.key, name: item.name, selectedPermissions: [] });
                    setDialogMode('edit');
                    break;
                case 'role':
                    setFormData({ id: item.id, key: '', name: item.name, selectedPermissions: item.permissionList?.map((p: Permission) => p.key) || [] });
                    setDialogMode('edit');
                    break;
            }
        } else {
            setFormData({ id: '', key: '', name: '', selectedPermissions: [] });
            setDialogMode('add');
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (dialogMode === 'edit') {
                switch (dialogType) {
                    case 'permission':
                        // await rolePermissionApiService.updatePermission(---);
                        alert('Chức năng sửa chưa được hỗ trợ');
                        break;
                    case 'role':
                        await rolePermissionApiService.addPermissionsToRole(formData.id, formData.selectedPermissions);
                        break;
                }
            } else {
                switch (dialogType) {
                    case 'permission':
                        await rolePermissionApiService.createPermission({ key: formData.key, name: formData.name });
                        break;
                    case 'role':
                        await rolePermissionApiService.createRole({ name: formData.name });
                        break;
                }
            }
            setIsDialogOpen(false);
            fetchData();
        } catch (error) {
            console.error("Error creating:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);
    
    useEffect(() => {
        setCurrentPage(1);
        setSearchTerm('');
    }, [activeTab]);



  const tabs = [
    {
      id: "permissions",
      label: "Quyền hạn",
      icon: <Lock className="w-4 h-4" />,
      description: "Quản lý các quyền hạn trong hệ thống"
    },
    {
      id: "roles",
      label: "Vai trò",
      icon: <UserCheck className="w-4 h-4" />,
      description: "Quản lý vai trò và phân quyền người dùng"
    }
  ];
    const itemsPerPage = 5;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    const getCurrentData = () => {
        switch (activeTab) {
            case 'permissions': return permissions;
            case 'roles': return roles;
            default: return [];
        }
    };

    const removeVietnameseAccents = (str: string) => {
        return str
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D');
    };

    const getFilteredData = (data: any[], searchTerm: string) => {
        const fields = ['name'];
        if (activeTab === 'permissions') {
            fields.push('key');
        }
        return data.filter(item =>
            fields.some(field => removeVietnameseAccents(item[field]?.toLowerCase()).includes(removeVietnameseAccents(searchTerm.toLowerCase())))
        );
    };

    const currentData = getCurrentData();
    const filteredData = getFilteredData(currentData, searchTerm);
    const paginatedData = filteredData.slice(startIndex, endIndex);

  const renderTabContent = () => {
    switch (activeTab) {
      case "permissions":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-slate-800">Quản lý Quyền hạn</h3>
                <p className="text-slate-600">Danh sách các quyền hạn trong hệ thống</p>
              </div>
              <button 
                onClick={() => openDialog('permission')}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Thêm quyền
              </button>
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm quyền..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-4"
            />
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Tên quyền</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Mô tả</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData && paginatedData.length > 0 ? (paginatedData.map((permission) => (
                    <tr key={permission.key} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-slate-800">{permission.name}</div>
                          <div className="text-xs text-slate-500 font-mono">{permission.key}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">Quyền {(permission.name).toLowerCase()}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openDialog('permission', 'edit', permission)} className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-red-600 hover:bg-red-100 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))) : (
                    <tr>
                        <td colSpan={3} className="py-4 px-4 text-center text-slate-500">
                        {paginatedData === undefined ? 'Đang tải...' : 'Không có quyền hạn nào để hiển thị'}
                        </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "roles":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-slate-800">Quản lý Vai trò</h3>
                <p className="text-slate-600">Danh sách các vai trò và phân quyền</p>
              </div>
              <button 
                onClick={() => openDialog('role')}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Thêm vai trò
              </button>
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm vai trò..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-4"
            />
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Vai trò</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Quyền hạn</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData && paginatedData.length > 0 ? (paginatedData.map((role) => (
                    <tr key={role.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                          <div className="font-medium text-slate-800">{role.name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {role.permissionList && role.permissionList?.length > 0 ? (
                            <>
                            {role.permissionList.slice(0, 5).map((perm: Permission) => (
                            <span key={perm.key} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                              {perm.key}
                            </span>
                          ))}
                          {role.permissionList.length > 5 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                              +{role.permissionList.length - 5}
                            </span>
                          )}
                          </>
                          ) : (
                            <span className="text-slate-500 italic text-sm">Chưa có quyền hạn</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => openDialog('role', 'edit', role)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-red-600 hover:bg-red-100 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))) : (
                    <tr>
                        <td colSpan={3} className="py-4 px-4 text-center text-slate-500">
                        {paginatedData === undefined ? 'Đang tải...' : 'Không có vai trò nào để hiển thị'}
                        </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-red-100 rounded-xl">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Bảo mật & Phân quyền</h1>
            <p className="text-slate-600">Quản lý quyền hạn và vai trò trong hệ thống</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 ${
                  activeTab === tab.id
                    ? "border-red-500 text-red-600 bg-red-50"
                    : "border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-50 cursor-pointer"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Main Content */}
          {loading ? (
            <Loading />
          ) : (
            renderTabContent()
          )}
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={filteredData.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      {/* Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => {if(!loading) setIsDialogOpen(false)}}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 z-50">
            <div className="bg-gradient-to-r from-red-50 to-red-100 px-6 py-4 border-b border-red-200 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-red-600 text-white">
                    {dialogType === 'permission' ? <Lock className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                  </div>
                  <h3 className="text-xl font-bold text-red-900">
                    {dialogMode === 'add' ? 'Thêm' : 'Sửa'} {dialogType === 'permission' ? 'Quyền' : 'Vai trò'}
                  </h3>
                </div>
                <button 
                  onClick={() => {if(!loading) setIsDialogOpen(false)}} 
                  className={`text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-red-200 transition-colors
                    ${loading ? 'cursor-not-allowed' : ''}`}
                  disabled={loading}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Permission */}
              {dialogType === 'permission' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Key
                    </label>
                    <input
                      type="text"
                      value={formData.key}
                      onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                      className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                        ${loading ? 'cursor-not-allowed' : ''}`}
                        disabled={loading}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                        ${loading ? 'cursor-not-allowed' : ''}`}
                        disabled={loading}
                      required
                    />
                  </div>
                </>
              )}

              {/* Role */}
              {dialogType === 'role' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                        ${loading ? 'cursor-not-allowed' : ''}`}
                        disabled={loading}
                      required
                    />
                  </div>
                  {dialogMode === 'edit' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Permissions
                      </label>
                      <Autocomplete
                        multiple
                        limitTags={5}
                        options={permissions}
                        getOptionLabel={(option) => option?.name || ''}
                        value={permissions.filter(p => formData.selectedPermissions.includes(p.key))}
                        onChange={(_event, newValue) => {
                          setFormData({
                            ...formData,
                            selectedPermissions: newValue.map((v) => v?.key || ''),
                          });
                        }}
                        disableCloseOnSelect
                        renderOption={(props, option, { selected }) => {
                            const { key, ...optionProps } = props;
                            return (
                            <li key={key} {...optionProps}>
                                <Checkbox
                                    checked={selected}
                                />
                                {option.name}
                            </li>
                            );
                        }}
                        isOptionEqualToValue={(option, value) => option?.key === value?.key}
                        renderInput={(params) => (
                          <TextField {...params} placeholder="Chọn quyền" />
                        )}
                        disabled={loading}
                        // className="max-h-42 overflow-auto"
                      />
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className={`flex-1 px-4 py-3 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 font-semibold transition-colors
                    ${loading ? 'cursor-not-allowed' : ''}`}
                  disabled={loading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors shadow-lg
                    ${loading ? 'cursor-not-allowed' : ''}`}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader className="w-4 h-4 animate-spin" />
                      Đang lưu...
                    </span>
                  ) : (
                    dialogMode === 'add' ? 'Thêm' : 'Cập nhật'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityManagement;
