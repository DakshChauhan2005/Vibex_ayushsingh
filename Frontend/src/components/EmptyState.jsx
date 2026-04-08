export default function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-3xl border border-brand-100 bg-white p-8 text-center shadow-soft">
      <h3 className="text-xl font-bold text-brand-950">{title}</h3>
      <p className="mt-2 text-sm text-brand-700">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
