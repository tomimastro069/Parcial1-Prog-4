export default function LoadingSpinner({ text = 'Cargando...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-surface-700" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-500 animate-spin" />
      </div>
      <p className="text-surface-400 text-sm font-medium">{text}</p>
    </div>
  );
}
