import { Star } from "lucide-react";
import { Link } from "react-router-dom";

export default function ServiceCard({ service }) {
  return (
    <article className="rounded-3xl border border-brand-100 bg-white p-5 shadow-soft">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-xl font-bold text-brand-950">{service.title}</h3>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          {service.category}
        </span>
      </div>

      <p className="text-sm text-brand-700">{service.description}</p>

      <div className="mt-4 flex items-center gap-2 text-sm text-brand-700">
        <Star className="h-4 w-4 fill-orange-500 text-orange-500" />
        <span>{service.rating?.toFixed?.(1) || service.rating || 0}</span>
      </div>

      <div className="mt-2 text-sm text-brand-700">
        Provider: {service.provider?.name || "Unknown"}
      </div>

      <div className="mt-1 text-sm text-brand-700">Location: {service.location}</div>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-2xl font-black text-brand-900">INR {service.price}</span>
        <Link
          to={`/services/${service._id}`}
          className="rounded-full bg-brand-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}
