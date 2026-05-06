import { useUIStore } from '../store/uiStore';
import { Button } from './Button';

export function ConfirmModal() {
  const modal = useUIStore((s) => s.confirmModal);
  const close = useUIStore((s) => s.closeConfirmModal);

  if (!modal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40" onClick={close} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{modal.title}</h3>
        <p className="text-sm text-gray-600 mb-6">{modal.message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={close}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              modal.onConfirm();
              close();
            }}
          >
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  );
}
