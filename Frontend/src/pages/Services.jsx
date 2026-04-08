import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ServiceCard from "../components/ServiceCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import api from "../services/api";
import {
  fetchServices,
  resetServiceFilters,
  setServiceFilter,
  setServicePage,
} from "../store/servicesSlice";

export default function Services() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { items, filters, meta, loading, error } = useSelector((state) => state.services);
  const [providers, setProviders] = useState([]);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem("oc_services_view") || "list");

  useEffect(() => {
    const category = searchParams.get("category");
    if (category) {
      dispatch(setServiceFilter({ category, page: 1 }));
    }
  }, [dispatch, searchParams]);

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch, filters]);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await api.get("/users/providers", {
          params: filters.location ? { location: filters.location } : {},
        });
        setProviders(response.data?.data?.providers || []);
      } catch {
        setProviders([]);
      }
    };

    fetchProviders();
  }, [filters.location]);

  const handleFilterChange = (key, value) => {
    dispatch(setServiceFilter({ [key]: value, page: 1 }));
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem("oc_services_view", mode);
  };

  const totalPages = meta?.totalPages || 1;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
      <div className="mb-7 flex flex-wrap items-end gap-4 rounded-3xl border border-brand-100 bg-white p-5 shadow-soft">
        <div className="min-w-[220px] flex-1">
          <label className="mb-1 block text-sm font-bold text-brand-900">Search</label>
          <input
            value={filters.keyword}
            onChange={(event) => handleFilterChange("keyword", event.target.value)}
            placeholder="Search by keyword"
            className="w-full rounded-xl border border-brand-100 bg-brand-50 px-3 py-2 text-brand-900"
          />
        </div>

        <div className="min-w-[170px]">
          <label className="mb-1 block text-sm font-bold text-brand-900">Category</label>
          <input
            value={filters.category}
            onChange={(event) => handleFilterChange("category", event.target.value)}
            placeholder="plumber / tutoring"
            className="w-full rounded-xl border border-brand-100 bg-brand-50 px-3 py-2 text-brand-900"
          />
        </div>

        <div className="min-w-[170px]">
          <label className="mb-1 block text-sm font-bold text-brand-900">Location</label>
          <input
            value={filters.location}
            onChange={(event) => handleFilterChange("location", event.target.value)}
            placeholder="City"
            className="w-full rounded-xl border border-brand-100 bg-brand-50 px-3 py-2 text-brand-900"
          />
        </div>

        <div className="min-w-[120px]">
          <label className="mb-1 block text-sm font-bold text-brand-900">Min Price</label>
          <input
            type="number"
            value={filters.minPrice}
            onChange={(event) => handleFilterChange("minPrice", event.target.value)}
            className="w-full rounded-xl border border-brand-100 bg-brand-50 px-3 py-2 text-brand-900"
          />
        </div>

        <div className="min-w-[120px]">
          <label className="mb-1 block text-sm font-bold text-brand-900">Max Price</label>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(event) => handleFilterChange("maxPrice", event.target.value)}
            className="w-full rounded-xl border border-brand-100 bg-brand-50 px-3 py-2 text-brand-900"
          />
        </div>

        <div className="min-w-[150px]">
          <label className="mb-1 block text-sm font-bold text-brand-900">Sort By</label>
          <select
            value={filters.sortBy}
            onChange={(event) => handleFilterChange("sortBy", event.target.value)}
            className="w-full rounded-xl border border-brand-100 bg-brand-50 px-3 py-2 text-brand-900"
          >
            <option value="createdAt">Newest</option>
            <option value="price">Price</option>
            <option value="rating">Rating</option>
          </select>
        </div>

        <div className="min-w-[110px]">
          <label className="mb-1 block text-sm font-bold text-brand-900">Order</label>
          <select
            value={filters.order}
            onChange={(event) => handleFilterChange("order", event.target.value)}
            className="w-full rounded-xl border border-brand-100 bg-brand-50 px-3 py-2 text-brand-900"
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => dispatch(resetServiceFilters())}
          className="rounded-full bg-brand-600 px-5 py-2 text-sm font-bold text-white hover:bg-brand-700"
        >
          Reset
        </button>

        <div className="ml-auto inline-flex rounded-full border border-brand-200 bg-brand-50 p-1">
          <button
            type="button"
            onClick={() => handleViewModeChange("grid")}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              viewMode === "grid" ? "bg-brand-600 text-white" : "text-brand-800 hover:bg-brand-100"
            }`}
          >
            Grid
          </button>
          <button
            type="button"
            onClick={() => handleViewModeChange("list")}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              viewMode === "list" ? "bg-brand-600 text-white" : "text-brand-800 hover:bg-brand-100"
            }`}
          >
            List
          </button>
        </div>
      </div>

      {loading ? <LoadingSpinner label="Loading services..." /> : null}

      {!loading && error ? (
        <EmptyState title="Unable to load services" description={error} />
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <EmptyState
          title="No services found"
          description="Try changing filters or search keyword to discover nearby providers."
        />
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <div className={viewMode === "grid" ? "grid gap-5 md:grid-cols-2 xl:grid-cols-3" : "space-y-4"}>
          {items.map((service) => (
            <ServiceCard key={service._id} service={service} viewMode={viewMode} />
          ))}
        </div>
      ) : null}

      <section className="mt-10 rounded-3xl border border-brand-100 bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-black text-brand-950">Available Providers Nearby</h2>
        <p className="mt-1 text-sm text-brand-700">
          {filters.location
            ? `Showing providers near ${filters.location}`
            : "Add a location filter to find providers in your area."}
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {providers.length > 0 ? (
            providers.slice(0, 9).map((provider) => (
              <article key={provider._id} className="rounded-2xl border border-brand-100 bg-brand-50 p-4">
                <p className="text-lg font-bold text-brand-950">{provider.name}</p>
                <p className="text-sm text-brand-700">{provider.location || "Location not specified"}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-brand-600">Provider</p>
              </article>
            ))
          ) : (
            <p className="text-sm text-brand-700">No providers found for this location yet.</p>
          )}
        </div>
      </section>

      <div className="mt-7 flex items-center justify-center gap-3">
        <button
          type="button"
          disabled={filters.page <= 1 || loading}
          onClick={() => dispatch(setServicePage(filters.page - 1))}
          className="rounded-full border border-brand-200 px-4 py-2 text-sm font-bold text-brand-900 disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm font-semibold text-brand-700">
          Page {filters.page} of {totalPages}
        </span>
        <button
          type="button"
          disabled={filters.page >= totalPages || loading}
          onClick={() => dispatch(setServicePage(filters.page + 1))}
          className="rounded-full border border-brand-200 px-4 py-2 text-sm font-bold text-brand-900 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </main>
  );
}
