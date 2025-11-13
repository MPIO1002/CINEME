// ConfirmDeleteDialog.tsx
import React from 'react';
import ReactDOM from 'react-dom';

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  isOpen,
  title = 'Xác nhận xóa',
  message = 'Bạn có chắc chắn muốn xóa',
  itemName,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className='fixed inset-0 bg-black/50 bg-opacity-50' onClick={onCancel}></div>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200 z-10">
        <h3 className="text-lg font-semibold text-red-600 mb-3">{title}</h3>
        <p className="text-gray-700 mb-6">
          {message} <span className="font-medium text-gray-900">"{itemName}"</span>?
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmDeleteDialog;