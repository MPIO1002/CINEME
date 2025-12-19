import { countryApiService, type Country } from "@/services/countryApi";
import { formatApiService, type Format } from "@/services/formatApi";
import { genreApiService, type Genre } from "@/services/genreApi";
import { languageApiService, type Language } from "@/services/languageApi";
import { limitageApiService, type Limitage } from "@/services/limitageApi";
import { Edit, Flag, Languages, Loader, Plus, Settings, Tags, Trash2, Users, Video, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import ConfirmDeleteDialog from "../../components/confirmDeleteDialog";
import Loading from "../../components/loading";
import { Pagination } from "../../components/pagination";

const MovieConfigManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState("formats");
    const [languages, setLanguages] = useState<Language[]>([]);
    const [formats, setFormats] = useState<Format[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [limitages, setLimitages] = useState<Limitage[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        nameVn: '',
        nameEn: '',
        descVn: '',
        descEn: '',
    });
    const [errors, setErrors] = useState({
        nameVn: '',
        nameEn: '',
        descVn: '',
        descEn: '',
    });
    const [isOpenConfirmDelete, setIsOpenConfirmDelete] = useState(false);
    const [deleteItem, setDeleteItem] = useState<{ id: string; name: string; tab: string } | null>(null);


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

    const fetchData = async () => {
        setLoading(true);
        try {
            const [fetchedLanguages, fetchedFormats, fetchedGenres, fetchedCountries, fetchedLimitages] = await Promise.all([
                languageApiService.getAllLanguages(),
                formatApiService.getAllFormats(),
                genreApiService.getAllGenres(),
                countryApiService.getAllCountries(),
                limitageApiService.getAllLimitages()
            ]);
            setLanguages(fetchedLanguages);
            setFormats(fetchedFormats);
            setGenres(fetchedGenres);
            setCountries(fetchedCountries);
            setLimitages(fetchedLimitages);
        } catch (error) {
            console.error("Error fetching system data:", error);
            toast.error('Có lỗi xảy ra khi tải dữ liệu hệ thống');
            setLanguages([]);
            setFormats([]);
            setGenres([]);
            setCountries([]);
            setLimitages([]);
        } finally {
            setLoading(false);
        }
    }

    const validateForm = () => {
        const newErrors = {
            nameVn: '',
            nameEn: '',
            descVn: '',
            descEn: '',
        };
        let isValid = true;

        // Validate nameVn
        if (!formData.nameVn.trim()) {
            newErrors.nameVn = 'Tên tiếng Việt là bắt buộc';
            isValid = false;
        } else if (formData.nameVn.trim().length < 2) {
            newErrors.nameVn = 'Tên tiếng Việt phải có ít nhất 2 ký tự';
            isValid = false;
        } else if (formData.nameVn.trim().length > 100) {
            newErrors.nameVn = 'Tên tiếng Việt không được quá 100 ký tự';
            isValid = false;
        }

        // Validate nameEn
        if (!formData.nameEn.trim()) {
            newErrors.nameEn = 'Tên tiếng Anh là bắt buộc';
            isValid = false;
        } else if (formData.nameEn.trim().length < 2) {
            newErrors.nameEn = 'Tên tiếng Anh phải có ít nhất 2 ký tự';
            isValid = false;
        } else if (formData.nameEn.trim().length > 100) {
            newErrors.nameEn = 'Tên tiếng Anh không được quá 100 ký tự';
            isValid = false;
        }

        // Validate descriptions for limitages tab
        if (activeTab === 'limitages') {
            if (!formData.descVn.trim()) {
                newErrors.descVn = 'Mô tả tiếng Việt là bắt buộc';
                isValid = false;
            } else if (formData.descVn.trim().length < 10) {
                newErrors.descVn = 'Mô tả tiếng Việt phải có ít nhất 10 ký tự';
                isValid = false;
            } else if (formData.descVn.trim().length > 500) {
                newErrors.descVn = 'Mô tả tiếng Việt không được quá 500 ký tự';
                isValid = false;
            }

            if (!formData.descEn.trim()) {
                newErrors.descEn = 'Mô tả tiếng Anh là bắt buộc';
                isValid = false;
            } else if (formData.descEn.trim().length < 10) {
                newErrors.descEn = 'Mô tả tiếng Anh phải có ít nhất 10 ký tự';
                isValid = false;
            } else if (formData.descEn.trim().length > 500) {
                newErrors.descEn = 'Mô tả tiếng Anh không được quá 500 ký tự';
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    const openModal = (mode: 'add' | 'edit', item?: any) => {
        setModalMode(mode);
        setSelectedItem(item);
        if (mode === 'edit' && item) {
            setFormData({
                nameVn: item.nameVn || '',
                nameEn: item.nameEn || '',
                descVn: item.descVn || '',
                descEn: item.descEn || '',
            });
        } else {
            setFormData({
                nameVn: '',
                nameEn: '',
                descVn: '',
                descEn: '',
            });
        }
        setErrors({
            nameVn: '',
            nameEn: '',
            descVn: '',
            descEn: '',
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
        setFormData({
        nameVn: '',
        nameEn: '',
        descVn: '',
        descEn: '',
        });
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Vui lòng kiểm tra lại thông tin nhập vào');
            return;
        }
        
        setLoading(true);
        try {
            if (modalMode === 'add') {
                switch (activeTab) {
                case 'countries':
                    // await countryApiService.createCountry(formData);
                    alert('Tính năng tạm thời bị vô hiệu hóa');
                    break;
                case 'formats':
                    await formatApiService.createFormat(formData);
                    break;
                case 'genres':
                    await genreApiService.createGenre(formData);
                    break;
                case 'languages':
                    await languageApiService.createLanguage(formData);
                    break;
                case 'limitages':
                    await limitageApiService.createLimitage(formData);
                    break;
                }
            } else {
                switch (activeTab) {
                case 'countries':
                    // await countryApiService.updateCountry(selectedItem.id, formData);
                    alert('Tính năng tạm thời bị vô hiệu hóa');
                    break;
                case 'formats':
                    await formatApiService.updateFormat(selectedItem.id, formData);
                    break;
                case 'genres':
                    await genreApiService.updateGenre(selectedItem.id, formData);
                    break;
                case 'languages':
                    await languageApiService.updateLanguage(selectedItem.id, formData);
                    break;
                case 'limitages':
                    await limitageApiService.updateLimitage(selectedItem.id, formData);
                    break;
                }
            }
            toast.success(`${modalMode === 'add' ? 'Thêm' : 'Cập nhật'} ${getTabLabel(activeTab).toLowerCase()} thành công`);
            await fetchData();
            closeModal();
        } catch (error) {
            console.error('Error saving data:', error);
            toast.error(`${modalMode === 'add' ? 'Thêm' : 'Cập nhật'} ${getTabLabel(activeTab).toLowerCase()} thất bại`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (itemId: string, name: string) => {
        setDeleteItem({ id: itemId, name, tab: activeTab });
        setIsOpenConfirmDelete(true);
    };

    const confirmDelete = async () => {
        if (!deleteItem) return;
        try {
            switch (deleteItem.tab) {
                case 'countries':
                    // await countryApiService.deleteCountry(deleteItem.id);
                    alert('Tính năng tạm thời bị vô hiệu hóa');
                    break;
                case 'formats':
                    await formatApiService.deleteFormat(deleteItem.id);
                    break;
                case 'genres':
                    await genreApiService.deleteGenre(deleteItem.id);
                    break;
                case 'languages':
                    await languageApiService.deleteLanguage(deleteItem.id);
                    break;
                case 'limitages':
                    await limitageApiService.deleteLimitage(deleteItem.id);
                    break;
            }
            toast.success(`Xóa ${getTabLabel(deleteItem.tab).toLowerCase()} thành công`);
            await fetchData();
        } catch (error) {
            console.error('Error deleting data:', error);
            toast.error(`Xóa ${getTabLabel(deleteItem.tab).toLowerCase()} thất bại`);
        } finally {
            setIsOpenConfirmDelete(false);
            setDeleteItem(null);
        }
    };

    const tabs = [
        {
            id: "formats",
            label: "Định dạng",
            icon: <Video className="w-4 h-4" />,
            description: "Quản lý định dạng chiếu (2D, 3D, IMAX...)"
        },
        {
            id: "genres",
            label: "Thể loại",
            icon: <Tags className="w-4 h-4" />,
            description: "Quản lý thể loại phim (Hành động, Tình cảm...)"
        },
        {
            id: "languages",
            label: "Ngôn ngữ",
            icon: <Languages className="w-4 h-4" />,
            description: "Quản lý ngôn ngữ phim"
        },
        {
            id: "limitages",
            label: "Giới hạn tuổi",
            icon: <Users className="w-4 h-4" />,
            description: "Quản lý phân loại độ tuổi (T13, T16, T18...)"
        },
        {
            id: "countries",
            label: "Quốc gia",
            icon: <Flag className="w-4 h-4" />,
            description: "Quản lý danh sách quốc gia sản xuất phim"
        },
    ];

    const itemsPerPage = 7;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const getCurrentData = () => {
        switch (activeTab) {
            case 'countries': return countries;
            case 'formats': return formats;
            case 'genres': return genres;
            case 'languages': return languages;
            case 'limitages': return limitages;
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
        const fields = ['nameVn', 'nameEn'];
        if (activeTab === 'limitages') {
            fields.push('descVn', 'descEn');
        }
        return data.filter(item =>
            fields.some(field => removeVietnameseAccents(item[field]?.toLowerCase()).includes(removeVietnameseAccents(searchTerm.toLowerCase())))
        );
    };

    const currentData = getCurrentData();
    const filteredData = getFilteredData(currentData, searchTerm);
    const paginatedData = filteredData.slice(startIndex, endIndex);

  // Helper function to get tab label
  const getTabLabel = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    return tab ? tab.label : '';
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "countries":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-slate-800">Quản lý Quốc gia</h3>
                <p className="text-slate-600">Danh sách các quốc gia sản xuất phim</p>
              </div>
              <button 
                onClick={() => openModal('add')}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Thêm quốc gia
              </button>
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm quốc gia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-4"
            />
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Tên tiếng Việt</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Tên tiếng Anh</th>
                    <th className="text-center py-3 px-4 font-medium text-slate-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData && paginatedData.length > 0 ? paginatedData.map((country) => (
                    <tr key={country.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-left font-medium text-slate-800">{country.nameVn}</td>
                      <td className="py-3 px-4 text-left font-medium text-slate-800">{country.nameEn}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => openModal('edit', country)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-red-600 hover:bg-red-100 rounded" onClick={() => handleDelete(country.id, country.nameVn)}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-500">
                        {filteredData === undefined ? "Đang tải..." : "Không có dữ liệu"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case "formats":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-slate-800">Quản lý Định dạng</h3>
                <p className="text-slate-600">Danh sách các định dạng chiếu phim</p>
              </div>
              <button 
                onClick={() => openModal('add')}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Thêm định dạng
              </button>
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm định dạng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-4"
            />
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Tên tiếng Việt</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Tên tiếng Anh</th>
                    <th className="text-center py-3 px-4 font-medium text-slate-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData && paginatedData.length > 0 ? paginatedData.map((format) => (
                    <tr key={format.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-left font-medium text-slate-800">{format.nameVn}</td>
                      <td className="py-3 px-4 text-left font-medium text-slate-800">{format.nameEn}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openModal('edit', format)} className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-red-600 hover:bg-red-100 rounded" onClick={() => handleDelete(format.id, format.nameVn)}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-500">
                        {paginatedData === undefined ? "Đang tải..." : "Không có dữ liệu"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case "genres":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-slate-800">Quản lý Thể loại</h3>
                <p className="text-slate-600">Danh sách các thể loại phim</p>
              </div>
              <button onClick={() => openModal('add')} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                Thêm thể loại
              </button>
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm thể loại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-4"
            />
            
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Tên tiếng Việt</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Tên tiếng Anh</th>
                    <th className="text-center py-3 px-4 font-medium text-slate-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData && paginatedData.length > 0 ? paginatedData.map((genre) => (
                    <tr key={genre.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-left font-medium text-slate-800">{genre.nameVn}</td>
                      <td className="py-3 px-4 text-left font-medium text-slate-800">{genre.nameEn}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openModal('edit', genre)} className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-red-600 hover:bg-red-100 rounded" onClick={() => handleDelete(genre.id, genre.nameVn)}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-500">
                        {paginatedData === undefined ? "Đang tải..." : "Không có dữ liệu"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case "languages":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-slate-800">Quản lý Ngôn ngữ</h3>
                <p className="text-slate-600">Danh sách các ngôn ngữ phim</p>
              </div>
              <button onClick={() => openModal('add')} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                Thêm ngôn ngữ
              </button>
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm ngôn ngữ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-4"
            />
            
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Tên tiếng Việt</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Tên tiếng Anh</th>
                    <th className="text-center py-3 px-4 font-medium text-slate-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData && paginatedData.length > 0 ? paginatedData.map((language) => (
                    <tr key={language.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="text-left py-3 px-4 font-medium text-slate-800">{language.nameVn}</td>
                      <td className="text-left py-3 px-4 font-medium text-slate-800">{language.nameEn}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openModal('edit', language)} className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-red-600 hover:bg-red-100 rounded" onClick={() => handleDelete(language.id, language.nameVn)}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-500">
                        {paginatedData === undefined ? "Đang tải..." : "Không có dữ liệu"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case "limitages":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-slate-800">Quản lý Giới hạn tuổi</h3>
                <p className="text-slate-600">Danh sách các phân loại độ tuổi</p>
              </div>
              <button onClick={() => openModal('add')} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                Thêm phân loại
              </button>
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm giới hạn tuổi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-4"
            />
            
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Tên tiếng Việt</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Tên tiếng Anh</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Mô tả tiếng Việt</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Mô tả tiếng Anh</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData && paginatedData.length > 0 ? paginatedData.map((limitage) => (
                    <tr key={limitage.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-800">{limitage.nameVn}</td>
                      <td className="py-3 px-4 text-slate-600">{limitage.nameEn}</td>
                      <td className="py-3 px-4 text-slate-600 w-1/3">{limitage.descVn}</td>
                      <td className="py-3 px-4 text-slate-600 w-1/3">{limitage.descEn}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openModal('edit', limitage)} className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-red-600 hover:bg-red-100 rounded" onClick={() => handleDelete(limitage.id.toString(), limitage.nameVn)}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        {paginatedData === undefined ? "Đang tải..." : "Không có dữ liệu"}
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
    <div className="h-full bg-gray-50">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Settings className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Cấu hình phim</h1>
            <p className="text-slate-600">Quản lý cấu hình phim</p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => {if(!loading) closeModal()}}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 z-50">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-600 text-white">
                    <Settings className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-900">
                    {modalMode === 'add' ? 'Thêm' : 'Sửa'} {getTabLabel(activeTab)}
                  </h3>
                </div>
                <button 
                  onClick={() => {if(!loading) closeModal()}} 
                  className={`text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-blue-200 transition-colors
                    ${loading ? 'cursor-not-allowed' : ''}`}
                  disabled={loading}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {/* Countries */}
              {activeTab === 'countries' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tên tiếng Việt <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nameVn}
                      onChange={(e) => {
                        setFormData({ ...formData, nameVn: e.target.value });
                        if (errors.nameVn) setErrors({ ...errors, nameVn: '' });
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.nameVn ? 'border-red-500' : 'border-slate-300'
                      }`}
                      disabled={loading}
                      placeholder="Nhập tên tiếng Việt (2-100 ký tự)"
                    />
                    {errors.nameVn && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                         {errors.nameVn}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tên tiếng Anh <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nameEn}
                      onChange={(e) => {
                        setFormData({ ...formData, nameEn: e.target.value });
                        if (errors.nameEn) setErrors({ ...errors, nameEn: '' });
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.nameEn ? 'border-red-500' : 'border-slate-300'
                      }`}
                      disabled={loading}
                      placeholder="Nhập tên tiếng Anh (2-100 ký tự)"
                    />
                    {errors.nameEn && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                         {errors.nameEn}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Formats */}
              {activeTab === 'formats' && (
                <>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Tên tiếng Việt <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.nameVn}
                            onChange={(e) => {
                              setFormData({ ...formData, nameVn: e.target.value });
                              if (errors.nameVn) setErrors({ ...errors, nameVn: '' });
                            }}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.nameVn ? 'border-red-500' : 'border-slate-300'
                            }`}
                            disabled={loading}
                            placeholder="Nhập tên tiếng Việt (2-100 ký tự)"
                        />
                        {errors.nameVn && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                             {errors.nameVn}
                          </p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Tên tiếng Anh <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.nameEn}
                            onChange={(e) => {
                              setFormData({ ...formData, nameEn: e.target.value });
                              if (errors.nameEn) setErrors({ ...errors, nameEn: '' });
                            }}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.nameEn ? 'border-red-500' : 'border-slate-300'
                            }`}
                            disabled={loading}
                            placeholder="Nhập tên tiếng Anh (2-100 ký tự)"
                        />
                        {errors.nameEn && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                             {errors.nameEn}
                          </p>
                        )}
                    </div>
                </>
              )}

              {/* Genres */}
              {activeTab === 'genres' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tên tiếng Việt <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nameVn}
                      onChange={(e) => {
                        setFormData({ ...formData, nameVn: e.target.value });
                        if (errors.nameVn) setErrors({ ...errors, nameVn: '' });
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.nameVn ? 'border-red-500' : 'border-slate-300'
                      }`}
                      disabled={loading}
                      placeholder="Nhập tên tiếng Việt (2-100 ký tự)"
                    />
                    {errors.nameVn && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                         {errors.nameVn}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tên tiếng Anh <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nameEn}
                      onChange={(e) => {
                        setFormData({ ...formData, nameEn: e.target.value });
                        if (errors.nameEn) setErrors({ ...errors, nameEn: '' });
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.nameEn ? 'border-red-500' : 'border-slate-300'
                      }`}
                      disabled={loading}
                      placeholder="Nhập tên tiếng Anh (2-100 ký tự)"
                    />
                    {errors.nameEn && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                         {errors.nameEn}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Languages */}
              {activeTab === 'languages' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tên tiếng Việt <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nameVn}
                      onChange={(e) => {
                        setFormData({ ...formData, nameVn: e.target.value });
                        if (errors.nameVn) setErrors({ ...errors, nameVn: '' });
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.nameVn ? 'border-red-500' : 'border-slate-300'
                      }`}
                      disabled={loading}
                      placeholder="Nhập tên tiếng Việt (2-100 ký tự)"
                    />
                    {errors.nameVn && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                         {errors.nameVn}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tên tiếng Anh <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nameEn}
                      onChange={(e) => {
                        setFormData({ ...formData, nameEn: e.target.value });
                        if (errors.nameEn) setErrors({ ...errors, nameEn: '' });
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.nameEn ? 'border-red-500' : 'border-slate-300'
                      }`}
                      disabled={loading}
                      placeholder="Nhập tên tiếng Anh (2-100 ký tự)"
                    />
                    {errors.nameEn && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                         {errors.nameEn}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Limitages */}
              {activeTab === 'limitages' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tên tiếng Việt <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nameVn}
                      onChange={(e) => {
                        setFormData({ ...formData, nameVn: e.target.value });
                        if (errors.nameVn) setErrors({ ...errors, nameVn: '' });
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.nameVn ? 'border-red-500' : 'border-slate-300'
                      }`}
                      disabled={loading}
                      placeholder="Nhập tên tiếng Việt (2-100 ký tự)"
                    />
                    {errors.nameVn && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                         {errors.nameVn}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tên tiếng Anh <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nameEn}
                      onChange={(e) => {
                        setFormData({ ...formData, nameEn: e.target.value });
                        if (errors.nameEn) setErrors({ ...errors, nameEn: '' });
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.nameEn ? 'border-red-500' : 'border-slate-300'
                      }`}
                      disabled={loading}
                      placeholder="Nhập tên tiếng Anh (2-100 ký tự)"
                    />
                    {errors.nameEn && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                         {errors.nameEn}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Mô tả tiếng Việt <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.descVn}
                      onChange={(e) => {
                        setFormData({ ...formData, descVn: e.target.value });
                        if (errors.descVn) setErrors({ ...errors, descVn: '' });
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.descVn ? 'border-red-500' : 'border-slate-300'
                      }`}
                      rows={3}
                      disabled={loading}
                      placeholder="Nhập mô tả tiếng Việt (10-500 ký tự)"
                    />
                    {errors.descVn && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                         {errors.descVn}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Mô tả tiếng Anh <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.descEn}
                      onChange={(e) => {
                        setFormData({ ...formData, descEn: e.target.value });
                        if (errors.descEn) setErrors({ ...errors, descEn: '' });
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.descEn ? 'border-red-500' : 'border-slate-300'
                      }`}
                      rows={3}
                      disabled={loading}
                      placeholder="Nhập mô tả tiếng Anh (10-500 ký tự)"
                    />
                    {errors.descEn && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                         {errors.descEn}
                      </p>
                    )}
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className={`flex-1 px-4 py-3 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 font-semibold transition-colors
                    ${loading ? 'cursor-not-allowed' : ''}`}
                  disabled={loading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors shadow-lg
                    ${loading ? 'cursor-not-allowed' : ''}`}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader className="w-4 h-4 animate-spin" />
                      Đang lưu...
                    </span>
                  ) : (
                    modalMode === 'add' ? 'Thêm' : 'Cập nhật'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
          <nav className="flex overflow-x-auto *:w-full *:justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 p-4 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 bg-blue-50"
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
    </div>

    <ConfirmDeleteDialog
      isOpen={isOpenConfirmDelete}
      title="Xác nhận xóa"
      message={`Bạn có chắc chắn muốn xóa ${getTabLabel(deleteItem?.tab || '').toLowerCase()}`}
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

export default MovieConfigManagement;
