import ConfirmDeleteDialog from "@/modules/admin/components/confirmDeleteDialog";
import Loading from "@/modules/admin/components/loading";
import { Pagination } from "@/modules/admin/components/pagination";
import { mockPromotions, priceApiService, type PricingRule, type Promotion } from "@/services/priceApi";
import roomApiService, { type SeatType } from "@/services/roomApi";
import { DollarSign, Edit, Loader, Plus, Tag, Trash2, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const PriceManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState("prices");
    const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
    const [promotions, setPromotions] = useState<Promotion[]>(mockPromotions);
    const [seatTypes, setSeatTypes] = useState<SeatType[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState<'pricing-rule' | 'promotion'>('pricing-rule');
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
    const [isOpenConfirmDelete, setIsOpenConfirmDelete] = useState(false);
    const [deleteItem, setDeleteItem] = useState<{ type: 'pricing-rule' | 'promotion', id: string, name: string } | null>(null);
    const [formData, setFormData] = useState({
        id: '',
        dayOfWeek: 2,
        seatTypeId: '',
        price: 0,
        code: '',
        discount_percent: 0,
        start_date: '',
        end_date: '',
        description_vn: '',
        description_en: '',
        is_active: true
    });
    const [errors, setErrors] = useState({
        dayOfWeek: '',
        seatTypeId: '',
        price: '',
        code: '',
        discount_percent: '',
        start_date: '',
        end_date: '',
        description_vn: '',
        description_en: '',
    });
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [fetchedPricingRules, fetchedSeatTypes] = await Promise.all([
                priceApiService.getAllPricingRules(),
                roomApiService.getSeatTypes()
            ]);
            console.log(fetchedPricingRules);
            setPricingRules(fetchedPricingRules);
            setSeatTypes(fetchedSeatTypes);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {
            dayOfWeek: '',
            seatTypeId: '',
            price: '',
            code: '',
            discount_percent: '',
            start_date: '',
            end_date: '',
            description_vn: '',
            description_en: '',
        };
        let isValid = true;

        if (dialogType === 'pricing-rule') {
            // Validate dayOfWeek
            if (!formData.dayOfWeek || formData.dayOfWeek < 2 || formData.dayOfWeek > 8) {
                newErrors.dayOfWeek = 'Vui lòng chọn ngày trong tuần hợp lệ';
                isValid = false;
            }

            // Validate seatTypeId
            if (!formData.seatTypeId.trim()) {
                newErrors.seatTypeId = 'Vui lòng chọn loại ghế';
                isValid = false;
            }

            // Validate price
            if (formData.price <= 0) {
                newErrors.price = 'Giá phải lớn hơn 0';
                isValid = false;
            } else if (formData.price > 10000000) {
                newErrors.price = 'Giá không được vượt quá 10,000,000 VNĐ';
                isValid = false;
            }
        } else if (dialogType === 'promotion') {
            // Validate code
            if (!formData.code.trim()) {
                newErrors.code = 'Mã code là bắt buộc';
                isValid = false;
            } else if (formData.code.trim().length < 3) {
                newErrors.code = 'Mã code phải có ít nhất 3 ký tự';
                isValid = false;
            } else if (formData.code.trim().length > 50) {
                newErrors.code = 'Mã code không được quá 50 ký tự';
                isValid = false;
            }

            // Validate discount_percent
            if (formData.discount_percent < 0 || formData.discount_percent > 100) {
                newErrors.discount_percent = 'Phần trăm giảm giá phải từ 0 đến 100';
                isValid = false;
            }

            // Validate start_date
            if (!formData.start_date) {
                newErrors.start_date = 'Ngày bắt đầu là bắt buộc';
                isValid = false;
            }

            // Validate end_date
            if (!formData.end_date) {
                newErrors.end_date = 'Ngày kết thúc là bắt buộc';
                isValid = false;
            } else if (formData.start_date && formData.end_date < formData.start_date) {
                newErrors.end_date = 'Ngày kết thúc phải sau ngày bắt đầu';
                isValid = false;
            }

            // Validate descriptions
            if (!formData.description_vn.trim()) {
                newErrors.description_vn = 'Mô tả tiếng Việt là bắt buộc';
                isValid = false;
            } else if (formData.description_vn.trim().length < 10) {
                newErrors.description_vn = 'Mô tả tiếng Việt phải có ít nhất 10 ký tự';
                isValid = false;
            } else if (formData.description_vn.trim().length > 500) {
                newErrors.description_vn = 'Mô tả tiếng Việt không được quá 500 ký tự';
                isValid = false;
            }

            if (!formData.description_en.trim()) {
                newErrors.description_en = 'Mô tả tiếng Anh là bắt buộc';
                isValid = false;
            } else if (formData.description_en.trim().length < 10) {
                newErrors.description_en = 'Mô tả tiếng Anh phải có ít nhất 10 ký tự';
                isValid = false;
            } else if (formData.description_en.trim().length > 500) {
                newErrors.description_en = 'Mô tả tiếng Anh không được quá 500 ký tự';
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    const openDialog = (type: 'pricing-rule' | 'promotion', mode: 'add' | 'edit' = 'add', item?: PricingRule | Promotion) => {
        setDialogType(type);
        setDialogMode(mode);
        if (mode === 'edit' && item) {
            if (type === 'pricing-rule') {
                const pricingRule = item as PricingRule;
                setFormData({
                    id: pricingRule.id || '',
                    dayOfWeek: pricingRule.dayOfWeek,
                    seatTypeId: pricingRule.seatType.id,
                    price: pricingRule.price,
                    code: '',
                    discount_percent: 0,
                    start_date: '',
                    end_date: '',
                    description_vn: '',
                    description_en: '',
                    is_active: true
                });
            } else {
                const promotion = item as Promotion;
                setFormData({
                    id: promotion.id || '',
                    dayOfWeek: 2,
                    seatTypeId: '',
                    price: 0,
                    code: promotion.code,
                    discount_percent: promotion.discount_percent,
                    start_date: promotion.start_date,
                    end_date: promotion.end_date,
                    description_vn: promotion.description_vn,
                    description_en: promotion.description_en,
                    is_active: promotion.is_active
                });
            }
        } else {
            setFormData({
                id: '',
                dayOfWeek: 2,
                seatTypeId: '',
                price: 0,
                code: '',
                discount_percent: 0,
                start_date: '',
                end_date: '',
                description_vn: '',
                description_en: '',
                is_active: true
            });
        }
        setErrors({
            dayOfWeek: '',
            seatTypeId: '',
            price: '',
            code: '',
            discount_percent: '',
            start_date: '',
            end_date: '',
            description_vn: '',
            description_en: '',
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Vui lòng kiểm tra lại thông tin nhập vào');
            return;
        }
        
        setLoading(true);
        try {
            if (dialogType === 'pricing-rule') {
                if (dialogMode === 'edit') {
                    await priceApiService.updatePricingRule(formData.id, {
                        dayOfWeek: formData.dayOfWeek,
                        seatTypeId: formData.seatTypeId,
                        price: formData.price
                    });
                } else {
                    await priceApiService.createPricingRule({
                        dayOfWeek: formData.dayOfWeek,
                        seatTypeId: formData.seatTypeId,
                        price: formData.price
                    });
                }
            } else {
                // Handle promotion (mock data)
                if (dialogMode === 'edit') {
                    setPromotions(prev => prev.map(p =>
                        p.id === formData.id
                            ? {
                                ...p,
                                code: formData.code,
                                discount_percent: formData.discount_percent,
                                start_date: formData.start_date,
                                end_date: formData.end_date,
                                description_vn: formData.description_vn,
                                description_en: formData.description_en,
                                is_active: formData.is_active
                            }
                            : p
                    ));
                } else {
                    const newPromotion: Promotion = {
                        id: Date.now().toString(),
                        code: formData.code,
                        discount_percent: formData.discount_percent,
                        start_date: formData.start_date,
                        end_date: formData.end_date,
                        description_vn: formData.description_vn,
                        description_en: formData.description_en,
                        is_active: formData.is_active
                    };
                    setPromotions(prev => [...prev, newPromotion]);
                }
            }
            toast.success(`Lưu thành công ${dialogType === 'pricing-rule' ? 'quy tắc giá' : 'khuyến mãi'}!`);
            setIsDialogOpen(false);
            fetchData();
        } catch (error) {
            console.error("Error saving:", error);
            toast.error(`Lưu thất bại ${dialogType === 'pricing-rule' ? 'quy tắc giá' : 'khuyến mãi'}!`);
        } finally {
            setLoading(false);
        }
    };

    // const openConfirmDelete = (type: 'pricing-rule' | 'promotion') => {
    //     setFormData({});
    //     setIsOpenConfirmDelete(true);
    // }
    const handleDelete = (type: 'pricing-rule' | 'promotion', id: string, name: string) => {
        setDeleteItem({ type, id, name });
        setIsOpenConfirmDelete(true);
    };

    const confirmDelete = async () => {
        if (!deleteItem) return;

        try {
            if (deleteItem.type === 'pricing-rule') {
                await priceApiService.deletePricingRule(deleteItem.id);
                setPricingRules(prev => prev.filter(p => p.id !== deleteItem.id));
            } else {
                setPromotions(prev => prev.filter(p => p.id !== deleteItem.id));
            }
            toast.success(`Xóa ${deleteItem.type === 'pricing-rule' ? 'quy tắc giá' : 'khuyến mãi'} thành công`);
        } catch (error) {
            console.error("Error deleting:", error);
            toast.error(`Xóa ${deleteItem.type === 'pricing-rule' ? 'quy tắc giá' : 'khuyến mãi'} thất bại`);
        } finally {
            setIsOpenConfirmDelete(false);
            setDeleteItem(null);
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
            id: "prices",
            label: "Quy tắc giá",
            icon: <DollarSign className="w-4 h-4" />,
            description: "Quản lý quy tắc giá theo ngày và loại ghế"
        },
        {
            id: "promotions",
            label: "Khuyến mãi",
            icon: <Tag className="w-4 h-4" />,
            description: "Quản lý các chương trình khuyến mãi"
        }
    ];

    const itemsPerPage = 5;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const getCurrentData = () => {
        switch (activeTab) {
            case 'prices': return pricingRules;
            case 'promotions': return promotions;
            default: return [];
        }
    };

    // const removeVietnameseAccents = (str: string) => {
    //     return str
    //         .normalize('NFD')
    //         .replace(/[\u0300-\u036f]/g, '')
    //         .replace(/đ/g, 'd')
    //         .replace(/Đ/g, 'D');
    // };

    const getFilteredData = (data: (PricingRule | Promotion)[], searchTerm: string) => {
        const fields = activeTab === 'prices' ? ['seatType.name', 'dayOfWeekName'] : ['code', 'description_vn'];
        return data.filter(item =>
            fields.some(field => {
                const value = field.includes('.') ? field.split('.').reduce((obj, key) => obj?.[key], item) : item[field as keyof typeof item];
                return (value?.toString().toLowerCase() || '').includes(searchTerm.toLowerCase());
            })
        );
    };

    const currentData = getCurrentData();
    const filteredData = getFilteredData(currentData, searchTerm);
    const paginatedData = filteredData.slice(startIndex, endIndex);

    const getDayOfWeekName = (day: number) => {
        const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
        return days[day] || 'Không xác định';
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case "prices":
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-semibold text-slate-800">Quản lý Quy tắc giá</h3>
                                <p className="text-slate-600">Danh sách các quy tắc giá theo ngày và loại ghế</p>
                            </div>
                            <button
                                onClick={() => openDialog('pricing-rule')}
                                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Thêm quy tắc giá
                            </button>
                        </div>

                        <input
                            type="text"
                            placeholder="Tìm kiếm quy tắc giá..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-4"
                        />

                        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="text-left py-3 px-4 font-medium text-slate-700">Ngày trong tuần</th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-700">Loại ghế</th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-700">Giá</th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-700">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedData.map((rule) => {
                                        const pricingRule = rule as PricingRule;
                                        return (
                                            <tr key={pricingRule.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                <td className="py-3 px-4">
                                                    <div className="font-medium text-slate-800">{getDayOfWeekName(pricingRule.dayOfWeek)}</div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="font-medium text-slate-800">{pricingRule.seatType.name}</div>
                                                </td>
                                                <td className="py-3 px-4 text-slate-600">
                                                    {pricingRule.price.toLocaleString('vi-VN')}đ
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => openDialog('pricing-rule', 'edit', pricingRule)}
                                                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete('pricing-rule', pricingRule.id!, `${getDayOfWeekName(pricingRule.dayOfWeek)} - ${pricingRule.seatType.name}`)}
                                                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case "promotions":
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-semibold text-slate-800">Quản lý Khuyến mãi</h3>
                                <p className="text-slate-600">Danh sách các chương trình khuyến mãi</p>
                            </div>
                            <button
                                onClick={() => openDialog('promotion')}
                                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Thêm khuyến mãi
                            </button>
                        </div>

                        <input
                            type="text"
                            placeholder="Tìm kiếm khuyến mãi..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-4"
                        />

                        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="text-left py-3 px-4 font-medium text-slate-700">Mã code</th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-700">Giảm giá</th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-700">Thời gian</th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-700">Trạng thái</th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-700">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedData && paginatedData.length > 0 ? (paginatedData.map((promo) => {
                                        const promotion = promo as Promotion;
                                        return (
                                            <tr key={promotion.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                <td className="py-3 px-4">
                                                    <div className="font-medium text-slate-800">{promotion.code}</div>
                                                </td>
                                                <td className="py-3 px-4 text-slate-600">
                                                    {promotion.discount_percent}%
                                                </td>
                                                <td className="py-3 px-4 text-slate-600">
                                                    {new Date(promotion.start_date).toLocaleDateString('vi-VN')} - {new Date(promotion.end_date).toLocaleDateString('vi-VN')}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        promotion.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {promotion.is_active ? 'Hoạt động' : 'Không hoạt động'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => openDialog('promotion', 'edit', promotion)}
                                                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete('promotion', promotion.id!, promotion.code)}
                                                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })) : (
                                        <tr>
                                            <td colSpan={5} className="py-4 px-4 text-center text-slate-600">
                                                Không tìm thấy khuyến mãi nào.
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
                    <div className="p-3 bg-green-100 rounded-xl">
                        <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Quản lý Giá</h1>
                        <p className="text-slate-600">Quản lý quy tắc giá</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                {/* Tab Navigation */}
                {/* <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                    <nav className="flex">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 ${
                                    activeTab === tab.id
                                        ? "border-green-500 text-green-600 bg-green-50"
                                        : "border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-50 cursor-pointer"
                                }`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div> */}

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

            <ConfirmDeleteDialog
                isOpen={isOpenConfirmDelete}
                title="Xác nhận xóa"
                message="Bạn có chắc chắn muốn xóa"
                itemName={deleteItem?.name || ''}
                onConfirm={confirmDelete}
                onCancel={() => {
                    setIsOpenConfirmDelete(false);
                    setDeleteItem(null);
                }}
            />
            {/* Dialog */}
            {isDialogOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { if(!loading) setIsDialogOpen(false)}}></div>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 z-50">
                        <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b border-green-200 rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-green-600 text-white">
                                        {dialogType === 'pricing-rule' ? <DollarSign className="w-5 h-5" /> : <Tag className="w-5 h-5" />}
                                    </div>
                                    <h3 className="text-xl font-bold text-green-900">
                                        {dialogMode === 'add' ? 'Thêm' : 'Sửa'} {dialogType === 'pricing-rule' ? 'Quy tắc giá' : 'Khuyến mãi'}
                                    </h3>
                                </div>
                                <button 
                                    onClick={() => { if(!loading) setIsDialogOpen(false)}} 
                                    className={`text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-green-200 transition-colors
                                        ${loading ? 'cursor-not-allowed' : ''}`}
                                    disabled={loading}
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {dialogType === 'pricing-rule' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Ngày trong tuần
                                        </label>
                                        <select
                                            value={formData.dayOfWeek}
                                            onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                                            className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                                                ${loading ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                                            required
                                            disabled={loading}
                                        >
                                            <option value={2}>Thứ 2</option>
                                            <option value={3}>Thứ 3</option>
                                            <option value={4}>Thứ 4</option>
                                            <option value={5}>Thứ 5</option>
                                            <option value={6}>Thứ 6</option>
                                            <option value={7}>Thứ 7</option>
                                            <option value={8}>Chủ nhật</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Loại ghế
                                        </label>
                                        <select
                                            value={formData.seatTypeId}
                                            onChange={(e) => setFormData({ ...formData, seatTypeId: e.target.value })}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                                                ${loading ? 'bg-slate-100 cursor-not-allowed' : ''}
                                                ${errors.seatTypeId ? 'border-red-500' : 'border-slate-300'}`}
                                            disabled={loading}
                                        >
                                            <option value="">Chọn loại ghế</option>
                                            {seatTypes.map((seatType) => (
                                                <option key={seatType.id} value={seatType.id}>
                                                    {seatType.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.seatTypeId && (
                                            <p className="text-red-500 text-xs mt-1">{errors.seatTypeId}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Giá (VNĐ)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                                            className={`w-full px-3 py-2 border  rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                                                ${loading ? 'bg-slate-100 cursor-not-allowed' : ''}
                                                ${errors.price ? 'border-red-500' : 'border-slate-300'}`}
                                            // required
                                            disabled={loading}
                                            min="0"
                                        />
                                        {errors.price && (
                                            <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                                        )}
                                    </div>
                                </>
                            )}

                            {dialogType === 'promotion' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Mã code
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                            className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                                                ${loading ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Phần trăm giảm giá
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.discount_percent}
                                            onChange={(e) => setFormData({ ...formData, discount_percent: parseInt(e.target.value) || 0 })}
                                            className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                                                ${loading ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                                            required
                                            disabled={loading}
                                            min="0"
                                            max="100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Ngày bắt đầu
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.start_date}
                                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                            className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                                                ${loading ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Ngày kết thúc
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.end_date}
                                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                            className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                                                ${loading ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Mô tả tiếng Việt
                                        </label>
                                        <textarea
                                            value={formData.description_vn}
                                            onChange={(e) => setFormData({ ...formData, description_vn: e.target.value })}
                                            className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                                                ${loading ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                                            disabled={loading}
                                            rows={3}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Mô tả tiếng Anh
                                        </label>
                                        <textarea
                                            value={formData.description_en}
                                            onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                                            className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                                                ${loading ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                                            disabled={loading}
                                            rows={3}
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_active}
                                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                                className="mr-2"
                                            />
                                            Hoạt động
                                        </label>
                                    </div>
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
                                    className={`flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors shadow-lg
                                        ${loading ? 'cursor-not-allowed' : ''}`}
                                    disabled={loading}
                                >
                                    {loading ? 
                                    (
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

export default PriceManagement;
