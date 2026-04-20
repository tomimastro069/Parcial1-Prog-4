import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
        <ExclamationCircleIcon className="w-7 h-7 text-red-400" />
      </div>
      <div className="text-center">
        <p className="text-surface-300 text-sm font-medium">
          Ocurrió un error
        </p>
        <p className="text-surface-500 text-xs mt-1">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-xl bg-primary-600/80 text-white text-sm font-medium hover:bg-primary-600 transition-colors cursor-pointer"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
