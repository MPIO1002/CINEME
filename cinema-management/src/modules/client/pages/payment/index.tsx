import React from 'react';
import ProgressBar from '../../components/progress-bar';

const Payment: React.FC = () => {
  return (
    <div className="min-h-screen relative" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}>
      <ProgressBar currentStep="payment" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center" style={{ color: 'var(--color-text)' }}>
            Thanh toán
          </h1>
          
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Thông tin thanh toán</h2>
            <p className="text-gray-300">
              Trang thanh toán đang được phát triển...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
