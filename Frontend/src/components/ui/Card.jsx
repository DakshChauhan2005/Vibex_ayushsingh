export default function Card({ children, className = "" }) {
  return (
    <article className={`rounded-3xl border border-brand-100 bg-white p-6 shadow-soft ${className}`}>
      {children}
    </article>
  );
}
