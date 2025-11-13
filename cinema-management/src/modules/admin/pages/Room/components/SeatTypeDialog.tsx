import { Edit, Save, Trash2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { type SeatType } from '../../../../../services/roomApi';
import { toast } from 'sonner';

interface SeatTypeDialogProps {
  open: boolean;
  seatType: SeatType | null;
  mode: "view" | "edit" | "add";
  onClose: () => void;
  onEdit: (seatType: SeatType) => void;
  onDelete: (seatType: SeatType) => void;
  onAdd: (seatType: Omit<SeatType, 'id'>) => void;
  loading: boolean;
}

const SeatTypeDialog: React.FC<SeatTypeDialogProps> = ({
  open,
  seatType,
  mode,
  onClose,
  onEdit,
  onDelete,
  onAdd,
  loading
}) => {
  const [isEditing, setIsEditing] = useState(mode === "add" || mode === "edit");
  const [editForm, setEditForm] = useState<SeatType | null>(null);

  useEffect(() => {
    if (seatType) {
      setEditForm({ ...seatType });
      setIsEditing(false);
    } else if (mode === "add") {
      // Initialize empty form for add mode
      setIsEditing(true);
      setEditForm({
        id: '',
        name: '',
        desc: '',
        img: '',
        color: '#722ed1',
        capacity: 1
      });
    }
  }, [seatType, mode, open]);

  if (!open  || !editForm) return null;

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const validateForm = (): boolean => {
    if (!editForm) return false;
    if (editForm.name.trim() === '') return false;
    if (editForm.capacity < 1 || editForm.capacity > 10) return false;
    return true;
  }
  const handleSave = () => {
    if (editForm && validateForm()) {
      if (mode === "add") {
        const { id, ...newSeatType } = editForm;
        onAdd(newSeatType);
      } else {
        onEdit(editForm);
      }
    //   setIsEditing(false);
    } else {
        toast.error('Vui lòng điền đầy đủ thông tin hợp lệ cho loại ghế.');
    }
  };

  const handleCancel = () => {
    setEditForm({ ...seatType! });
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof SeatType, value: string | number) => {
    setEditForm(prev => prev ? { ...prev, [field]: value } : null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden z-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-600 text-white">
                <Edit className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-blue-600">
                  {mode === "add" ? 'Thêm loại ghế mới' : isEditing ? 'Chỉnh sửa loại ghế' : 'Chi tiết loại ghế'}
                </h2>
                <p className="text-sm text-blue-500">
                  {mode === "add" ? 'Điền thông tin để tạo loại ghế mới' : isEditing ? 'Cập nhật thông tin loại ghế' : 'Thông tin chi tiết về loại ghế'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue-200 rounded-full transition-colors duration-200"
            >
              <X className="w-5 h-5 text-blue-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Image */}
          {editForm.img && (
            <div className="flex justify-center">
              <img
                src={editForm.img}
                alt={editForm.name}
                className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
              />
            </div>
          )}

          {/* Seat Type Info */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-3">
                {isEditing ? 'Chỉnh sửa thông tin' : 'Thông tin cơ bản'}
              </h3>
              <div className="space-y-3">
                <div className='flex gap-2 justify-between'>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-600">Tên loại ghế:</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <div className="text-sm text-gray-900 mt-1">{editForm.name}</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-600">Sức chứa:</label>
                    {isEditing ? (
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={editForm.capacity}
                        onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 1)}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <div className="text-sm text-gray-900 mt-1">{editForm.capacity} ghế</div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Mô tả:</label>
                  {isEditing ? (
                    <textarea
                      value={editForm.desc}
                      onChange={(e) => handleInputChange('desc', e.target.value)}
                      rows={3}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="text-sm text-gray-900 mt-1">{editForm.desc}</div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Màu sắc:</label>
                  {isEditing ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={editForm.color}
                        onChange={(e) => handleInputChange('color', e.target.value)}
                        className="w-12 h-8 border border-gray-300 rounded"
                      />
                      <input
                        type="text"
                        value={editForm.color}
                        onChange={(e) => handleInputChange('color', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="#000000"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="w-6 h-6 rounded border-2 border-gray-300"
                        style={{ backgroundColor: editForm.color }}
                      ></div>
                      <span className="text-sm text-gray-900">{editForm.color}</span>
                    </div>
                  )}
                </div>
                {isEditing && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Hình ảnh:</label>
                    <input
                        type="text"
                        value={editForm.img}
                        onChange={(e) => handleInputChange('img', e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              {mode === "view" ? "Đóng" : "Hủy"}
            </button>
            {isEditing ? (
              <button
                onClick={handleSave}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />) : (<Save className="w-4 h-4" />)}
                {mode === "add" ? "Thêm" : "Lưu"}
              </button>
            ) : (
              <>
                <button
                  onClick={handleEditClick}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Sửa
                </button>
                <button
                  onClick={() => onDelete(seatType!)}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Xóa
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatTypeDialog;