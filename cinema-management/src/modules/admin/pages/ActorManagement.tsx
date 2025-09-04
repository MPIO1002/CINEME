import { Calendar, Edit, Eye, Search, Star, Trash2, UserPlus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { actorApiService, type Actor } from '../../../services/actorApi';
import ActorModal from '../components/ActorModal';
import { Pagination } from "../components/pagination";
import { Table, type Column } from "../components/tableProps";

const ActorManagement: React.FC = () => {
  const [actors, setActors] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [selectedActor, setSelectedActor] = useState<string | undefined>();

  const itemsPerPage = 5;

  // Load actors with pagination and filters
  const fetchActors = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await actorApiService.getAllActors();
      setActors(result);
    } catch (err) {
      console.error('Error loading actors:', err);
      setError("Không thể tải danh sách diễn viên. Vui lòng thử lại!");
    }
    setLoading(false);
  }

  // Initial load
  useEffect(() => {
    fetchActors();
  }, []);

  // Handle modal operations
  const handleAddActor = () => {
    setSelectedActor(undefined);
    setModalMode("add");
    setModalOpen(true);
  };

  const handleEditActor = (actorId: string) => {
    setSelectedActor(actorId);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleViewActor = (actorId: string) => {
    setSelectedActor(actorId);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleDeleteActor = async (actorId: string) => {
    const actor = actors.find(a => a.id === actorId);
    if (!actor) return;

    if (!window.confirm(`Bạn có chắc chắn muốn xóa diễn viên "${actor.name}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await actorApiService.deleteActor(actorId);
      alert(`Đã xóa diễn viên "${actor.name}" thành công!`);
      await fetchActors();
    } catch (error) {
      console.error('Error deleting actor:', error);
      alert("Có lỗi xảy ra khi xóa diễn viên!");
    } finally {
      setLoading(false);
    }
  };

  const handleModalSubmit = async (actor: Actor) => {
    try {
      let response;
      setLoading(true);
      
      console.log('Submitting actor:', actor);
      console.log('Img type:', typeof actor.img, actor.img instanceof File ? 'File' : 'String');

      if (modalMode === "add") {
        response = await actorApiService.createActor(actor);
        alert("Thêm diễn viên thành công!");
      } else if (modalMode === "edit" && selectedActor) {
        response = await actorApiService.updateActor(selectedActor, actor);
        alert("Cập nhật diễn viên thành công!");
      }
      console.log('Actor saved:', response);
      setModalOpen(false);
      await fetchActors();
    } catch (error) {
      console.error('Error saving actor:', error);
      alert("Có lỗi xảy ra khi lưu diễn viên!");
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedActor(undefined);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Chưa cập nhật";
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return "Không hợp lệ";
    }
  };

  const truncateText = (text?: string, maxLength = 50) => {
    if (!text) return "Chưa cập nhật";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  // Filter actors based on search term
  const filteredActors = actors.filter(actor => {
    const matchesSearch = actor.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedActors = filteredActors.slice(startIndex, endIndex);

  // Table columns configuration
  const columns: Column<Actor>[] = [
    {
      key: 'actor',
      title: 'Diễn viên',
      render: (_, actor) => (
        <div className="flex items-center">
          <div className="w-16 h-24 bg-gray-200 rounded-lg mr-4 flex-shrink-0 overflow-hidden">
            <img 
              src={actor.img instanceof File ? URL.createObjectURL(actor.img) : `http://127.0.0.1:9000/${actor.img}`}
              alt={actor.name}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjMyIiBjeT0iMjQiIHI9IjgiIGZpbGw9IiM5Q0EzQUYiLz4KUHBhdGggZD0iTTMyIDM2Qzk3IDM2IDE2IDQ2IDE2IDU2VjY0SDQ4VjU2QzQ4IDQ2IDQxIDM2IDMyIDM2WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4=';
              }}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{actor.name}</p>
          </div>
        </div>
      )
    },
    {
      key: 'dateOfBirth',
      title: 'Ngày sinh',
      render: (_, actor) => (
        <div className="flex items-center gap-2 text-slate-600">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">{formatDate(actor.dateOfBirth)}</span>
        </div>
      )
    },
    {
      key: 'nationality',
      title: 'Quốc tịch',
      render: (nationality) => (
        <span className="text-sm text-gray-600">{nationality || "Chưa cập nhật"}</span>
      )
    },
    {
      key: 'biography',
      title: 'Tiểu sử',
      render: (biography) => (
        <span className="text-sm text-gray-600">{truncateText(biography)}</span>
      )
    },
    {
      key: 'actions',
      title: 'Hành động',
      render: (_, actor) => (
        <div className="flex items-center space-x-1">
          <button 
            className="text-blue-600 hover:text-blue-900 transition-colors p-2 rounded-lg cursor-pointer hover:bg-blue-100" 
            title="Xem chi tiết"
            onClick={() => handleViewActor(actor.id || '')}
          >
            <Eye size={16} />
          </button>
          <button 
            className="text-green-600 hover:text-green-900 transition-colors p-2 rounded-lg cursor-pointer hover:bg-green-100" 
            title="Chỉnh sửa"
            onClick={() => handleEditActor(actor.id || '')}
          >
            <Edit size={16} />
          </button>
          <button 
            className="text-red-600 hover:text-red-900 transition-colors p-2 rounded-lg cursor-pointer hover:bg-red-100" 
            title="Xóa"
            onClick={() => handleDeleteActor(actor.id || '')}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="h-full bg-gray-50 max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                    <Star className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Quản lý diễn viên</h1>
                    <p className="text-slate-600">Quản lý diễn viên trong hệ thống rạp chiếu phim</p>
                </div>
            </div>
          <button
            onClick={handleAddActor}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center gap-2 shadow-lg"
          >
            <UserPlus className="w-5 h-5" />
            Thêm diễn viên
          </button>
        </div>


        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm diễn viên theo tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Actors Table */}
      <Table 
        columns={columns}
        data={paginatedActors}
        loading={loading}
        emptyText="Không tìm thấy diễn viên nào"
      />

      {/* Pagination */}
      {!loading && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalItems={filteredActors.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
      {/* Actor Modal */}
      <ActorModal
        open={modalOpen}
        mode={modalMode}
        actor={selectedActor}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
};

export default ActorManagement;
