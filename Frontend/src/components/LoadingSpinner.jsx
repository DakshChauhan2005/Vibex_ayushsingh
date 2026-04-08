export default function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 text-brand-900">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      <p className="text-sm text-brand-700">{label}</p>
    </div>
  );
}
