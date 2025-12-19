import { faMinus, faPlus, faTimes, faUtensils } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';

interface ComboItem {
  itemId: string;
  itemName: string;
  quantity: number;
}

interface Combo {
  id: string;
  name: string;
  price: number;
  img: string;
  listItems: ComboItem[];
}

interface SelectedCombo extends Combo {
  selectedQuantity: number;
}

interface ComboModalProps {
  showComboModal: boolean;
  setShowComboModal: (show: boolean) => void;
  loadingCombos: boolean;
  combos: Combo[];
  selectedCombos: SelectedCombo[];
  onConfirm: (selectedCombos: SelectedCombo[]) => void;
}

const ComboModal: React.FC<ComboModalProps> = ({
  showComboModal,
  setShowComboModal,
  loadingCombos,
  combos,
  selectedCombos,
  onConfirm,
}) => {
  const [localSelectedCombos, setLocalSelectedCombos] = useState<SelectedCombo[]>([]);

  useEffect(() => {
    if (showComboModal) {
      setLocalSelectedCombos([...selectedCombos]);
    }
  }, [showComboModal, selectedCombos]);

  const handleLocalComboSelect = (combo: Combo, quantity: number) => {
    if (quantity === 0) {
      setLocalSelectedCombos(prev => prev.filter(c => c.id !== combo.id));
    } else {
      setLocalSelectedCombos(prev => {
        const existing = prev.find(c => c.id === combo.id);
        if (existing) {
          return prev.map(c =>
            c.id === combo.id ? { ...c, selectedQuantity: quantity } : c
          );
        } else {
          return [...prev, { ...combo, selectedQuantity: quantity }];
        }
      });
    }
  };

  const handleConfirm = () => {
    onConfirm(localSelectedCombos);
    setShowComboModal(false);
  };

  if (!showComboModal) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-40 p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10" onClick={() => setShowComboModal(false)} />

      <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col z-50">
        <div className="flex-shrink-0 p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FontAwesomeIcon icon={faUtensils} />
              Chọn Combo Bắp Nước
            </h2>
            <button
              onClick={() => setShowComboModal(false)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loadingCombos ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 items-stretch">
              {combos.map((combo) => {
                const selectedCombo = localSelectedCombos.find(c => c.id === combo.id);
                const currentQuantity = selectedCombo?.selectedQuantity || 0;

                return (
                  <div key={combo.id} className="border rounded-xl shadow-lg overflow-hidden p-4 hover:shadow-xl transition-shadow flex flex-col justify-between bg-amber-50 h-full">
                    <div>
                      <div className="object-cover overflow-hidden relative border border-dashed rounded-lg mb-4 h-44 flex items-center justify-center">
                        <img
                          src={combo.img}
                          alt={combo.name}
                          className="w-full h-full object-cover bg-white"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `http://127.0.0.1:9000/${combo.img}`;
                          }}
                        />
                      </div>
                      <h3 className="font-bold text-lg mb-2">{combo.name}</h3>
                      <ul className="text-sm mb-3 text-gray-600 pl-4">
                        {combo.listItems.map((item) => (
                          <li key={item.itemId} className='list-disc'>
                            {item.quantity}x {item.itemName}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-green-600">
                        {combo.price.toLocaleString('vi-VN')}đ
                      </span>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleLocalComboSelect(combo, Math.max(0, currentQuantity - 1))}
                          className={`w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors
                            ${currentQuantity === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          disabled={currentQuantity === 0}
                        >
                          <FontAwesomeIcon icon={faMinus} size="sm" />
                        </button>

                        <span className="w-8 text-center font-bold">{currentQuantity}</span>

                        <button
                          onClick={() => handleLocalComboSelect(combo, currentQuantity + 1)}
                          className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors cursor-pointer"
                        >
                          <FontAwesomeIcon icon={faPlus} size="sm" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-lg text-gray-700">Tổng combo: </span>
              <span className="text-xl font-bold text-green-600">
                {localSelectedCombos.reduce((sum, combo) => sum + (combo.price * combo.selectedQuantity), 0).toLocaleString('vi-VN')}đ
              </span>
            </div>
            <button
              onClick={handleConfirm}
              className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer`}
            >
              Xác Nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComboModal;
