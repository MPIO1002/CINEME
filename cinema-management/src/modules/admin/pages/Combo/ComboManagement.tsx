import Loading from "@/modules/admin/components/loading";
import { Pagination } from "@/modules/admin/components/pagination";
import { comboApiService, type Combo, type Product } from "@/services/comboApi";
import { Edit, Loader, Package, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import ConfirmDeleteDialog from "../../components/confirmDeleteDialog";
import { Table, type Column } from "../../components/tableProps";

interface ComboItem {
    itemId: string;
    itemName: string;
    quantity: number;
}

const ComboManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState("products");
    const [products, setProducts] = useState<Product[]>([]);
    const [combos, setCombos] = useState<Combo[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState<'product' | 'combo'>('product');
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        price: 0,
        img: null as File | null,
        selectedItems: [] as { itemId: string; quantity: number }[]
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [errors, setErrors] = useState({
        name: '',
        price: '',
        img: '',
        selectedItems: ''
    });
    const [isOpenConfirmDelete, setIsOpenConfirmDelete] = useState(false);
    const [deleteItem, setDeleteItem] = useState<{ id: string; name: string; type: 'product' | 'combo' } | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [fetchedProducts, fetchedCombos] = await Promise.all([
                comboApiService.getAllProducts(),
                comboApiService.getAllCombos()
            ]);
            setProducts(fetchedProducts);
            setCombos(fetchedCombos);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const openDialog = (type: 'product' | 'combo', mode: 'add' | 'edit' = 'add', item?: Product | Combo) => {
        setDialogType(type);
        setDialogMode(mode);
        setErrors({ name: '', price: '', img: '', selectedItems: '' }); // Reset errors
        if (mode === 'edit' && item) {
            switch(type) {
                case 'product': {
                    const product = item as Product;
                    setFormData({
                        id: product.id,
                        name: product.name,
                        price: 0,
                        img: null,
                        selectedItems: []
                    });
                    break;
                }
                case 'combo': {
                    const combo = item as Combo;
                    setFormData({
                        id: combo.id,
                        name: combo.name,
                        price: combo.price,
                        img: null,
                        selectedItems: combo.listItems?.map((li: ComboItem) => ({
                            itemId: li.itemId,
                            quantity: li.quantity
                        })) || []
                    });
                    break;
                }
            }
        } else {
            setFormData({
                id: '',
                name: '',
                price: 0,
                img: null,
                selectedItems: []
            });
        }
        setIsDialogOpen(true);
    };

    const validateForm = (): boolean => {
        const newErrors = { name: '', price: '', img: '', selectedItems: '' };
        let isValid = true;

        // Validate name
        if (!formData.name.trim()) {
            newErrors.name = 'Tên không được để trống';
            isValid = false;
        } else if (formData.name.trim().length < 3) {
            newErrors.name = 'Tên phải có ít nhất 3 ký tự';
            isValid = false;
        } else if (formData.name.trim().length > 100) {
            newErrors.name = 'Tên không được vượt quá 100 ký tự';
            isValid = false;
        }

        // Validate combo specific fields
        if (dialogType === 'combo') {
            // Validate price
            if (formData.price <= 0) {
                newErrors.price = 'Giá phải lớn hơn 0';
                isValid = false;
            } else if (formData.price > 10000000) {
                newErrors.price = 'Giá không được vượt quá 10,000,000đ';
                isValid = false;
            }

            // Validate image for add mode
            if (dialogMode === 'add' && !formData.img) {
                newErrors.img = 'Vui lòng chọn hình ảnh';
                isValid = false;
            }

            // Validate image file type and size
            if (formData.img) {
                const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                if (!validTypes.includes(formData.img.type)) {
                    newErrors.img = 'Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP)';
                    isValid = false;
                }
                const maxSize = 5 * 1024 * 1024; // 5MB
                if (formData.img.size > maxSize) {
                    newErrors.img = 'Kích thước file không được vượt quá 5MB';
                    isValid = false;
                }
            }

            // Validate selected items
            if (formData.selectedItems.length === 0) {
                newErrors.selectedItems = 'Vui lòng thêm ít nhất 1 sản phẩm vào combo';
                isValid = false;
            } else {
                // Check for duplicate products
                const itemIds = formData.selectedItems.map(item => item.itemId);
                const hasDuplicates = itemIds.some((id, index) => itemIds.indexOf(id) !== index);
                if (hasDuplicates) {
                    newErrors.selectedItems = 'Không được thêm sản phẩm trùng lặp';
                    isValid = false;
                }

                // Check if all items have valid product selected
                const hasEmptyItem = formData.selectedItems.some(item => !item.itemId);
                if (hasEmptyItem) {
                    newErrors.selectedItems = 'Vui lòng chọn sản phẩm cho tất cả các mục';
                    isValid = false;
                }

                // Check if all quantities are valid
                const hasInvalidQuantity = formData.selectedItems.some(item => item.quantity <= 0 || item.quantity > 99);
                if (hasInvalidQuantity) {
                    newErrors.selectedItems = 'Số lượng phải từ 1 đến 99';
                    isValid = false;
                }
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            toast.error('Vui lòng kiểm tra lại thông tin đã nhập');
            return;
        }

        setLoading(true);
        try {
            if (dialogMode === 'edit') {
                switch (dialogType) {
                    case 'product': {
                        await comboApiService.updateProduct(formData.id, { name: formData.name });
                        break;
                    }
                    case 'combo': {
                        const formDataCombo = new FormData();
                        formDataCombo.append('name', formData.name);
                        formDataCombo.append('price', formData.price.toString());
                        formDataCombo.append('listItems', JSON.stringify(formData.selectedItems));
                        if (formData.img) {
                            formDataCombo.append('img', formData.img);
                        }
                        const response = await comboApiService.updateCombo(formData.id, formDataCombo);
                        console.log("Update response:", response);
                        break;
                    }
                }
            } else {
                switch (dialogType) {
                    case 'product': {
                        await comboApiService.createProduct({ name: formData.name });
                        break;
                    }
                    case 'combo': {
                        const formDataCombo = new FormData();
                        formDataCombo.append('name', formData.name);
                        formDataCombo.append('price', formData.price.toString());
                        formDataCombo.append('listItems', JSON.stringify(formData.selectedItems));
                        if (formData.img) {
                            formDataCombo.append('img', formData.img);
                        }
                        await comboApiService.createCombo(formDataCombo);
                        break;
                    }
                }
            }
            toast.success(`${dialogType === 'product' ? 'Sản phẩm' : 'Combo'} đã được ${dialogMode === 'add' ? 'tạo' : 'cập nhật'} thành công`);
            setIsDialogOpen(false);
            fetchData();
        } catch (error) {
            console.error("Error:", error);
            toast.error(`Đã xảy ra lỗi khi ${dialogMode === 'add' ? 'tạo' : 'cập nhật'} ${dialogType === 'product' ? 'sản phẩm' : 'combo'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (type: 'product' | 'combo', id: string, name: string) => {
        setDeleteItem({ id, name, type });
        setIsOpenConfirmDelete(true);
    };

    const confirmDelete = async () => {
        if (!deleteItem) return;
        try {
            if (deleteItem.type === 'product') {
                await comboApiService.deleteProduct(deleteItem.id);
            } else {
                await comboApiService.deleteCombo(deleteItem.id);
            }
            toast.success(`${deleteItem.type === 'product' ? 'Sản phẩm' : 'Combo'} đã được xóa thành công`);
            fetchData();
        } catch (error) {
            console.error("Error deleting:", error);
            toast.error(`Đã xảy ra lỗi khi xóa ${deleteItem.type === 'product' ? 'sản phẩm' : 'combo'}`);
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
            id: "products",
            label: "Sản phẩm",
            icon: <Package className="w-4 h-4" />,
            description: "Quản lý các sản phẩm"
        },
        {
            id: "combos",
            label: "Combo",
            icon: <ShoppingBag className="w-4 h-4" />,
            description: "Quản lý combo sản phẩm"
        }
    ];

    const itemsPerPage = 5;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const getCurrentData = () => {
        switch (activeTab) {
            case 'products': return products;
            case 'combos': return combos;
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

    const getFilteredData = (data: (Product | Combo)[], searchTerm: string) => {
        return data.filter(item =>
            item.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const currentData = getCurrentData();
    const filteredData = getFilteredData(currentData, searchTerm);
    const paginatedData = filteredData.slice(startIndex, endIndex);

    const productColumns: Column<Product>[] = [
        {
            key: 'name',
            title: 'Tên sản phẩm',
            render: (_, product) => <div className="font-medium text-slate-800">{product.name}</div>,
        },
        {
            key: 'actions',
            title: 'Thao tác',
            render: (_, product) => (
                <div className="flex items-center gap-2">
                    <button onClick={() => openDialog('product', 'edit', product)} className="p-1 text-green-600 hover:bg-green-100 rounded">
                        <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete('product', product.id, product.name)} className="p-1 text-red-600 hover:bg-red-100 rounded">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    const comboColumns: Column<Combo>[] = [
        {
            key: 'name',
            title: 'Tên combo',
            render: (_, comboItem) => <div className="font-medium text-slate-800">{comboItem.name}</div>,
        },
        {
            key: 'price',
            title: 'Giá tiền',
            render: (_, comboItem) => (
                <div className="py-3 px-4 text-slate-600">
                    {comboItem.price.toLocaleString('vi-VN')}đ
                </div>
            ),
        },
        {
            key: 'product',
            title: 'Sản phẩm',
            render: (_, comboItem) => (
                <div className="flex flex-wrap gap-1">
                    {comboItem.listItems && comboItem.listItems.length > 0 ? (
                        <>
                            {comboItem.listItems.slice(0, 3).map((item: ComboItem) => (
                                <span key={item.itemId} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                                    {item.quantity}x {item.itemName}
                                </span>
                            ))}
                            {comboItem.listItems.length > 3 && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                                    +{comboItem.listItems.length - 3}
                                </span>
                            )}
                        </>
                    ) : (
                        <span className="text-slate-500 italic text-sm">Chưa có sản phẩm</span>
                    )}
                </div>
            ),
        },
        {
            key: 'actions',
            title: 'Thao tác',
            render: (_, comboItem) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => openDialog('combo', 'edit', comboItem)}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete('combo', comboItem.id, comboItem.name)} className="p-1 text-red-600 hover:bg-red-100 rounded">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case "products":
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-semibold text-slate-800">Quản lý Sản phẩm</h3>
                                <p className="text-slate-600">Danh sách các sản phẩm</p>
                            </div>
                            <button
                                onClick={() => openDialog('product')}
                                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Thêm sản phẩm
                            </button>
                        </div>
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-4"
                        />
                        <Table
                            data={paginatedData as Product[]}
                            columns={productColumns}
                            loading={loading}
                            emptyText="Không có sản phẩm nào để hiển thị"
                        />
                    </div>
                );
            case "combos":
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-semibold text-slate-800">Quản lý Combo</h3>
                                <p className="text-slate-600">Danh sách các combo sản phẩm</p>
                            </div>
                            <button
                                onClick={() => openDialog('combo')}
                                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Thêm combo
                            </button>
                        </div>
                        <input
                            type="text"
                            placeholder="Tìm kiếm combo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-4"
                        />
                        <Table
                            data={paginatedData as Combo[]}
                            columns={comboColumns}
                            loading={loading}
                            emptyText="Không có combo nào để hiển thị"
                        />
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
                    <div className="p-3 bg-orange-100 rounded-xl">
                        <ShoppingBag className="w-8 h-8 text-orange-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Quản lý Combo & Sản phẩm</h1>
                        <p className="text-slate-600">Quản lý combo và sản phẩm trong hệ thống</p>
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
                                        ? "border-orange-500 text-orange-600 bg-orange-50"
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
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 z-50">
                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b border-purple-200 rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-purple-600 text-white">
                                        {dialogType === 'product' ? <Package className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
                                    </div>
                                    <h3 className="text-xl font-bold text-purple-900">
                                        {dialogMode === 'add' ? 'Thêm' : 'Sửa'} {dialogType === 'product' ? 'Sản phẩm' : 'Combo'}
                                    </h3>
                                </div>
                                <button 
                                    onClick={() => {if(!loading) setIsDialogOpen(false)}} 
                                    className={`text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-purple-200 transition-colors
                                        ${loading ? 'cursor-not-allowed' : ''}`}
                                    disabled={loading}
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Product */}
                            {dialogType === 'product' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Tên sản phẩm <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => {
                                            setFormData({ ...formData, name: e.target.value });
                                            if (errors.name) setErrors({ ...errors, name: '' });
                                        }}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                                            errors.name 
                                                ? 'border-red-500 focus:ring-red-500' 
                                                : 'border-slate-300 focus:ring-blue-500'
                                        } ${loading ? 'cursor-not-allowed bg-gray-50' : ''}`}
                                        disabled={loading}
                                        placeholder="Nhập tên sản phẩm (VD: Coca Cola, Bắp rang bơ...)"
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                            
                                            {errors.name}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Combo */}
                            {dialogType === 'combo' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Tên combo <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => {
                                                setFormData({ ...formData, name: e.target.value });
                                                if (errors.name) setErrors({ ...errors, name: '' });
                                            }}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                                                errors.name 
                                                    ? 'border-red-500 focus:ring-red-500' 
                                                    : 'border-slate-300 focus:ring-blue-500'
                                            } ${loading ? 'cursor-not-allowed bg-gray-50' : ''}`}
                                            disabled={loading}
                                            placeholder="Nhập tên combo (VD: Combo Couple, Combo Family...)"
                                        />
                                        {errors.name && (
                                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Giá <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => {
                                                setFormData({ ...formData, price: parseInt(e.target.value) || 0 });
                                                if (errors.price) setErrors({ ...errors, price: '' });
                                            }}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                                                errors.price 
                                                    ? 'border-red-500 focus:ring-red-500' 
                                                    : 'border-slate-300 focus:ring-blue-500'
                                            } ${loading ? 'cursor-not-allowed bg-gray-50' : ''}`}
                                            disabled={loading}
                                            placeholder="Nhập giá combo (VD: 50000)"
                                            min="1"
                                            max="10000000"
                                        />
                                        {errors.price && (
                                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                
                                                {errors.price}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Hình ảnh {dialogMode === 'add' && <span className="text-red-500">*</span>}
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                            onChange={(e) => {
                                                setFormData({ ...formData, img: e.target.files?.[0] || null });
                                                if (errors.img) setErrors({ ...errors, img: '' });
                                            }}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                                                errors.img 
                                                    ? 'border-red-500 focus:ring-red-500' 
                                                    : 'border-slate-300 focus:ring-blue-500'
                                            } ${loading ? 'cursor-not-allowed bg-gray-50' : ''}`}
                                            disabled={loading}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Chấp nhận: JPG, PNG, GIF, WEBP. Tối đa 5MB
                                        </p>
                                        {errors.img && (
                                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                
                                                {errors.img}
                                            </p>
                                        )}
                                        {formData.img && (
                                            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                                                <p className="text-sm text-green-700">
                                                    ✓ Đã chọn: {formData.img.name} ({(formData.img.size / 1024).toFixed(2)} KB)
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Sản phẩm trong combo <span className="text-red-500">*</span>
                                        </label>
                                        <div className="space-y-2 max-h-64 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50">
                                            {formData.selectedItems.length === 0 ? (
                                                <div className="text-center py-4 text-slate-500 text-sm">
                                                    Chưa có sản phẩm nào. Nhấn "Thêm sản phẩm" để bắt đầu.
                                                </div>
                                            ) : (
                                                formData.selectedItems.map((item, index) => (
                                                    <div key={index} className={`flex gap-2 p-2 bg-white rounded-md border border-slate-200 ${loading ? '*:cursor-not-allowed' : ''}`}>
                                                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                                                            {index + 1}
                                                        </div>
                                                        <select
                                                            value={item.itemId}
                                                            onChange={(e) => {
                                                                const newItems = [...formData.selectedItems];
                                                                newItems[index].itemId = e.target.value;
                                                                setFormData({ ...formData, selectedItems: newItems });
                                                                if (errors.selectedItems) setErrors({ ...errors, selectedItems: '' });
                                                            }}
                                                            disabled={loading}
                                                            className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                        >
                                                            <option value="">Chọn sản phẩm</option>
                                                            {products.map((product) => (
                                                                <option key={product.id} value={product.id}>
                                                                    {product.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max="99"
                                                            value={item.quantity}
                                                            onChange={(e) => {
                                                                const newItems = [...formData.selectedItems];
                                                                newItems[index].quantity = parseInt(e.target.value) || 1;
                                                                setFormData({ ...formData, selectedItems: newItems });
                                                                if (errors.selectedItems) setErrors({ ...errors, selectedItems: '' });
                                                            }}
                                                            disabled={loading}
                                                            placeholder="SL"
                                                            className="w-20 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newItems = formData.selectedItems.filter((_, i) => i !== index);
                                                                setFormData({ ...formData, selectedItems: newItems });
                                                            }}
                                                            disabled={loading}
                                                            className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex-shrink-0"
                                                            title="Xóa sản phẩm"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData({
                                                    ...formData,
                                                    selectedItems: [...formData.selectedItems, { itemId: '', quantity: 1 }]
                                                });
                                                if (errors.selectedItems) setErrors({ ...errors, selectedItems: '' });
                                            }}
                                            disabled={loading}
                                            className={`mt-2 w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center justify-center gap-2 ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
                                        >
                                            <Plus className="w-4 h-4" />
                                            Thêm sản phẩm
                                        </button>
                                        {errors.selectedItems && (
                                            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                                
                                                {errors.selectedItems}
                                            </p>
                                        )}
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
                                    className={`flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition-colors shadow-lg
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
            <ConfirmDeleteDialog
                isOpen={isOpenConfirmDelete}
                title="Xác nhận xóa"
                message={`Bạn có chắc chắn muốn xóa ${deleteItem?.type === 'product' ? 'sản phẩm' : 'combo'}`}
                itemName={deleteItem?.name || ''}
                onConfirm={confirmDelete}
                onCancel={() => {
                    setIsOpenConfirmDelete(false);
                    setDeleteItem(null);
                }}
            />
        </div>
    );
};

export default ComboManagement;