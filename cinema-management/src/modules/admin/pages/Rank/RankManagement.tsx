import Loading from "@/modules/admin/components/loading";
import { Pagination } from "@/modules/admin/components/pagination";
import { rankApiService, type Rank } from "@/services/rankApi";
import { Award, DollarSign, Edit, Loader, Percent, Plus, Trash2, TrendingUp, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Table, type Column } from "../../components/tableProps";

const RankManagement: React.FC = () => {
    const [ranks, setRanks] = useState<Rank[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
    const [formData, setFormData] = useState<Rank>({
        id: '',
        name: '',
        minAmount: 0,
        discountPercentage: 0
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const fetchData = async () => {
        setLoading(true);
        try {
            const fetchedRanks = await rankApiService.getAllRanks();
            setRanks(fetchedRanks);
        } catch (error) {
            console.error("Error fetching ranks:", error);
        } finally {
            setLoading(false);
        }
    };

    const openDialog = (mode: 'add' | 'edit' = 'add', rank?: Rank) => {
        setDialogMode(mode);
        if (mode === 'edit' && rank) {
            setFormData({
                id: rank.id || '',
                name: rank.name,
                minAmount: rank.minAmount,
                discountPercentage: rank.discountPercentage
            });
        } else {
            setFormData({
                id: '',
                name: '',
                minAmount: 0,
                discountPercentage: 0
            });
        }
        setErrors({});
        setIsDialogOpen(true);
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        
        if (!formData.name.trim()) {
            newErrors.name = "Tên hạng là bắt buộc";
        }
        
        if (formData.minAmount < 0) {
            newErrors.minAmount = "Số tiền tối thiểu phải >= 0";
        }
        
        if (formData.discountPercentage < 0 || formData.discountPercentage > 100) {
            newErrors.discountPercentage = "Phần trăm giảm giá phải từ 0-100";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            if (dialogMode === 'edit' && formData.id) {
                await rankApiService.updateRank(formData.id, formData);
            } else {
                await rankApiService.createRank(formData);
            }
            setIsDialogOpen(false);
            fetchData();
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    // const handleDelete = async (id: string) => {
    //     if (!confirm('Bạn có chắc chắn muốn xóa hạng này?')) return;
    //     try {
    //         await rankApiService.deleteRank(id);
    //         fetchData();
    //     } catch (error) {
    //         console.error("Error deleting rank:", error);
    //     }
    // };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const itemsPerPage = 10;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const getFilteredData = (data: Rank[], searchTerm: string) => {
        return data.filter(rank =>
            rank.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const filteredData = getFilteredData(ranks, searchTerm);
    const paginatedData = filteredData.slice(startIndex, endIndex);

    const getRankBadgeColor = (name: string) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('diamond')) return 'bg-blue-100 text-blue-700 border-blue-200';
        if (lowerName.includes('platinum')) return 'bg-purple-100 text-purple-700 border-purple-200';
        if (lowerName.includes('gold')) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        if (lowerName.includes('silver')) return 'bg-gray-100 text-gray-700 border-gray-200';
        if (lowerName.includes('bronze')) return 'bg-orange-100 text-orange-700 border-orange-200';
        return 'bg-green-100 text-green-700 border-green-200';
    };

    const columns: Column<Rank>[] = [
        {
            key: 'name',
            title: 'Tên hạng',
            render: (_, rank) => (
                <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getRankBadgeColor(rank.name)}`}>
                        {rank.name}
                    </span>
                </div>
            ),
        },
        {
            key: 'minAmount',
            title: 'Số tiền tối thiểu',
            render: (_, rank) => (
                <div className="flex items-center gap-2 text-slate-700">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-medium">
                        {rank.minAmount.toLocaleString('vi-VN')}đ
                    </span>
                </div>
            ),
        },
        {
            key: 'discountPercentage',
            title: 'Phần trăm giảm giá',
            render: (_, rank) => (
                <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-blue-600" />
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg font-semibold">
                        {rank.discountPercentage}%
                    </span>
                </div>
            ),
        },
        {
            key: 'actions',
            title: 'Thao tác',
            render: (_, rank) => (
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => openDialog('edit', rank)} 
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    {/* <button 
                        onClick={() => rank.id && handleDelete(rank.id)} 
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button> */}
                </div>
            ),
        },
    ];

    return (
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-amber-100 rounded-xl">
                        <Award className="w-8 h-8 text-amber-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Quản lý Hạng thành viên</h1>
                        <p className="text-slate-600">Quản lý các hạng thành viên và ưu đãi</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="p-6">
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-semibold text-slate-800">Danh sách hạng thành viên</h3>
                                <p className="text-slate-600">Tổng số: {filteredData.length} hạng</p>
                            </div>
                            <button
                                onClick={() => openDialog('add')}
                                className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors shadow-lg"
                            >
                                <Plus className="w-4 h-4" />
                                Thêm hạng mới
                            </button>
                        </div>

                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên hạng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        />

                        {loading ? (
                            <Loading />
                        ) : (
                            <Table
                                data={paginatedData}
                                columns={columns}
                                loading={loading}
                                emptyText="Không có hạng thành viên nào"
                            />
                        )}
                    </div>
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
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 z-50">
                        <div className="bg-gradient-to-r from-amber-50 to-amber-100 px-6 py-4 border-b border-amber-200 rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-amber-600 text-white">
                                        <Award className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-bold text-amber-900">
                                        {dialogMode === 'add' ? 'Thêm hạng mới' : 'Chỉnh sửa hạng'}
                                    </h3>
                                </div>
                                <button 
                                    onClick={() => {if(!loading) setIsDialogOpen(false)}} 
                                    className={`text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-amber-200 transition-colors
                                        ${loading ? 'cursor-not-allowed' : ''}`}
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                    <Award className="w-4 h-4" />
                                    Tên hạng <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 transition-all
                                        ${ errors.name ? 'border-red-300 focus:border-red-500' : 'border-slate-300' }
                                        ${loading ? 'cursor-not-allowed' : ''}`}
                                    placeholder="Ví dụ: Diamond, Platinum, Gold..."
                                    disabled={loading}
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    Số tiền tối thiểu (VNĐ) <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={formData.minAmount}
                                    onChange={(e) => setFormData({ ...formData, minAmount: parseInt(e.target.value) || 0 })}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 transition-all
                                        ${errors.minAmount ? 'border-red-300 focus:border-red-500' : 'border-slate-300'}
                                        ${loading ? 'cursor-not-allowed' : ''}`}
                                    placeholder="200000"
                                    disabled={loading}
                                />
                                {errors.minAmount && (
                                    <p className="text-red-500 text-xs mt-1">{errors.minAmount}</p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                    <Percent className="w-4 h-4" />
                                    Phần trăm giảm giá (%) <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.discountPercentage}
                                    onChange={(e) => setFormData({ ...formData, discountPercentage: parseInt(e.target.value) || 0 })}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 transition-all
                                        ${errors.discountPercentage ? 'border-red-300 focus:border-red-500' : 'border-slate-300'}
                                        ${loading ? 'cursor-not-allowed' : ''}`}
                                    placeholder="30"
                                    disabled={loading}
                                />
                                {errors.discountPercentage && (
                                    <p className="text-red-500 text-xs mt-1">{errors.discountPercentage}</p>
                                )}
                            </div>

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
                                    className={`flex-1 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-semibold transition-colors shadow-lg
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

export default RankManagement;
