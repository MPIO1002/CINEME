import React from 'react';

interface ProgressBarProps {
    currentStep: 'home' | 'film-detail' | 'booking' | 'payment';
    className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep }) => {
    const steps = [
        { id: 'home', label: 'Trang chủ', step: 1 },
        { id: 'film-detail', label: 'Chọn phim', step: 2 },
        { id: 'booking', label: 'Đặt vé', step: 3 },
        { id: 'payment', label: 'Thanh toán', step: 4 }
    ];

    const getCurrentStepIndex = () => {
        return steps.findIndex(step => step.id === currentStep);
    };

    const currentStepIndex = getCurrentStepIndex();

    return (
        <div className="w-full py-4 px-6" style={{ backgroundColor: 'none' }}>
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between relative">
                    {/* Progress Line */}
                    <div className="absolute top-4 left-0 right-0 h-1 bg-gray-600 z-0" style={{ left: '2rem', right: '2rem' }}>
                        <div
                            className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-700 ease-in-out"
                            style={{
                                width: currentStepIndex >= 0 ? `${((currentStepIndex) / (steps.length - 1)) * 100}%` : '0%'
                            }}
                        />
                    </div>

                    {/* Steps */}
                    {steps.map((step, index) => {
                        const isCompleted = index < currentStepIndex;
                        const isActive = index === currentStepIndex;
                        const isUpcoming = index > currentStepIndex;

                        return (
                            <div key={step.id} className="flex flex-col items-center relative z-10">
                                {/* Circle */}
                                <div
                                    className={`
                    w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-300
                    ${isCompleted
                                            ? 'bg-gradient-to-r from-orange-500 to-red-500 border-orange-500 text-white'
                                            : isActive
                                                ? 'bg-white border-orange-500 text-orange-500'
                                                : 'bg-gray-600 border-gray-600 text-gray-400'
                                        }
                  `}
                                >
                                    {isCompleted ? (
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        step.step
                                    )}
                                </div>

                                {/* Label */}
                                <span
                                    className={`
                    mt-2 text-xs font-medium transition-all duration-300
                    ${isActive
                                            ? 'text-white'
                                            : isCompleted
                                                ? 'text-orange-400'
                                                : 'text-gray-400'
                                        }
                  `}
                                >
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ProgressBar;
