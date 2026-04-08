export default function CategoryCard({ title, image, count, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-3xl border border-brand-100 bg-white p-4 text-left shadow-soft transition hover:-translate-y-1 hover:shadow-md"
    >
      <img
        src={image}
        alt={title}
        className="h-48 w-full rounded-2xl object-cover"
      />
      <h3 className="mt-4 text-3xl font-bold text-brand-950">{title}</h3>
      <p className="mt-1 text-sm text-brand-700">{count}+ providers</p>
    </button>
  );
}
