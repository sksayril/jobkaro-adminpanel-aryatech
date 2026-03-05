import { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface SuccessToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function SuccessToast({ message, onClose, duration = 3000 }: SuccessToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="bg-white rounded-lg shadow-2xl border border-green-200 p-4 min-w-[320px] max-w-md">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex-1 pt-0.5">
            <p className="text-sm font-semibold text-gray-900 mb-1">Success!</p>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
