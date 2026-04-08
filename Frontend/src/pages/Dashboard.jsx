import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import BookingCard from "../components/BookingCard";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import api from "../services/api";
import {
  fetchMyBookings,
  fetchProviderBookings,
  fetchProviderDashboard,
  updateBookingStatus,
} from "../store/bookingsSlice";
import { createService, deleteService, updateService } from "../store/servicesSlice";

const defaultForm = {
  title: "",
  description: "",
  category: "",
  price: "",
  location: "",
};

const defaultBookingFilters = {
  status: "all",
  time: "all",
  keyword: "",
};

const SERVICE_PAGE_SIZE = 10;

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const bookingsState = useSelector((state) => state.bookings);
  const userId = user?.id;

  const isProvider = user?.role === "provider" || user?.role === "admin";
  const [providerServices, setProviderServices] = useState([]);
  const [serviceForm, setServiceForm] = useState(defaultForm);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [serviceSubmitting, setServiceSubmitting] = useState(false);
  const [visibleServiceCount, setVisibleServiceCount] = useState(SERVICE_PAGE_SIZE);
  const [bookingActionId, setBookingActionId] = useState(null);
  const loadMoreRef = useRef(null);
  const loadMoreTimeoutRef = useRef(null);
  const isLoadMoreScheduledRef = useRef(false);
  const [bookingFilters, setBookingFilters] = useState(defaultBookingFilters);
  const [openSections, setOpenSections] = useState({
    incomingBookings: true,
    createService: false,
    myServices: false,
  });

  const incomingBookings = bookingsState.providerBookings;
  const myBookings = bookingsState.myBookings;

  const loadProviderServices = async () => {
    if (!isProvider || !userId) return;
    setServiceLoading(true);
    try {
      const response = await api.get("/services", {
        params: { page: 1, limit: 100, sortBy: "createdAt", order: "desc" },
      });
      const services = response.data?.data?.services || [];
      const myServiceList = services.filter((service) => {
        const providerId = service.provider?._id || service.provider;
        return providerId === userId;
      });
      setProviderServices(myServiceList);
      setVisibleServiceCount(SERVICE_PAGE_SIZE);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load services");
    } finally {
      setServiceLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    if (isProvider) {
      dispatch(fetchProviderBookings());
      dispatch(fetchProviderDashboard());
      loadProviderServices();
    } else {
      dispatch(fetchMyBookings());
    }
  }, [dispatch, isProvider, userId]);

  const handleBookingAction = async (bookingId, status) => {
    setBookingActionId(bookingId);
    try {
      await dispatch(updateBookingStatus({ id: bookingId, status })).unwrap();
      toast.success("Booking status updated");
      dispatch(fetchProviderBookings());
      dispatch(fetchProviderDashboard());
    } catch (errorMessage) {
      toast.error(errorMessage || "Failed to update status");
    } finally {
      setBookingActionId(null);
    }
  };

  const handleServiceSubmit = async (event) => {
    event.preventDefault();

    const numericPrice = Number(serviceForm.price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    const payload = {
      ...serviceForm,
      price: numericPrice,
    };

    setServiceSubmitting(true);
    try {
      if (editingServiceId) {
        await dispatch(updateService({ id: editingServiceId, payload })).unwrap();
        toast.success("Service updated");
      } else {
        await dispatch(createService(payload)).unwrap();
        toast.success("Service created");
      }
      setServiceForm(defaultForm);
      setEditingServiceId(null);
      loadProviderServices();
    } catch (errorMessage) {
      toast.error(errorMessage || "Failed to save service");
    } finally {
      setServiceSubmitting(false);
    }
  };

  const editService = (service) => {
    setEditingServiceId(service._id);
    setOpenSections((prev) => ({ ...prev, createService: true }));
    setServiceForm({
      title: service.title,
      description: service.description,
      category: service.category,
      price: service.price,
      location: service.location,
    });
  };

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const removeService = async (id) => {
    if (!window.confirm("Delete this service? This action cannot be undone.")) {
      return;
    }

    setServiceSubmitting(true);
    try {
      await dispatch(deleteService(id)).unwrap();
      toast.success("Service deleted");
      loadProviderServices();
    } catch (errorMessage) {
      toast.error(errorMessage || "Failed to delete service");
    } finally {
      setServiceSubmitting(false);
    }
  };

  const metrics = useMemo(() => bookingsState.providerDashboard, [bookingsState.providerDashboard]);
  const visibleProviderServices = useMemo(
    () => providerServices.slice(0, visibleServiceCount),
    [providerServices, visibleServiceCount]
  );
  const hasMoreServices = providerServices.length > visibleServiceCount;

  useEffect(() => {
    if (!isProvider || !openSections.myServices || !hasMoreServices) return;

    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting || isLoadMoreScheduledRef.current) return;

        isLoadMoreScheduledRef.current = true;
        loadMoreTimeoutRef.current = setTimeout(() => {
          setVisibleServiceCount((prev) => {
            const next = prev + SERVICE_PAGE_SIZE;
            return next > providerServices.length ? providerServices.length : next;
          });
          isLoadMoreScheduledRef.current = false;
          loadMoreTimeoutRef.current = null;
        }, 500);
      },
      {
        root: null,
        rootMargin: "180px",
        threshold: 0,
      }
    );

    observer.observe(target);
    return () => {
      observer.disconnect();
      if (loadMoreTimeoutRef.current) {
        clearTimeout(loadMoreTimeoutRef.current);
        loadMoreTimeoutRef.current = null;
      }
      isLoadMoreScheduledRef.current = false;
    };
  }, [hasMoreServices, isProvider, openSections.myServices, providerServices.length]);

  const filteredMyBookings = useMemo(() => {
    if (!Array.isArray(myBookings)) return [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    const startOfWeek = new Date(startOfToday);
    const day = startOfWeek.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    startOfWeek.setDate(startOfWeek.getDate() + mondayOffset);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    return myBookings.filter((booking) => {
      const bookingDate = new Date(booking.date);
      const statusMatch =
        bookingFilters.status === "all" || booking.status === bookingFilters.status;

      let timeMatch = true;
      switch (bookingFilters.time) {
        case "upcoming":
          timeMatch = bookingDate >= now;
          break;
        case "past":
          timeMatch = bookingDate < now;
          break;
        case "today":
          timeMatch = bookingDate >= startOfToday && bookingDate < endOfToday;
          break;
        case "this-week":
          timeMatch = bookingDate >= startOfWeek && bookingDate < endOfWeek;
          break;
        case "this-month":
          timeMatch = bookingDate >= startOfMonth && bookingDate < endOfMonth;
          break;
        default:
          timeMatch = true;
      }

      const serviceTitle = booking.service?.title || "";
      const providerName = booking.provider?.name || "";
      const keyword = bookingFilters.keyword.trim().toLowerCase();
      const keywordMatch =
        keyword.length === 0 ||
        serviceTitle.toLowerCase().includes(keyword) ||
        providerName.toLowerCase().includes(keyword);

      return statusMatch && timeMatch && keywordMatch;
    });
  }, [bookingFilters, myBookings]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
      <h1 className="text-5xl font-black text-brand-950">Dashboard</h1>
      <p className="mt-2 text-lg text-brand-700">
        {isProvider
          ? "Manage your services and incoming bookings."
          : "Track your booking requests and status updates."}
      </p>

      {bookingsState.loading ? <LoadingSpinner label="Loading dashboard..." /> : null}

      {isProvider ? (
        <section className="mt-8 space-y-8">
          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-3xl border border-brand-100 bg-white p-6 shadow-soft">
              <p className="text-sm font-bold uppercase tracking-wide text-brand-600">Total Bookings</p>
              <p className="mt-2 text-4xl font-black text-brand-950">{metrics.totalBookings || 0}</p>
            </article>
            <article className="rounded-3xl border border-brand-100 bg-white p-6 shadow-soft">
              <p className="text-sm font-bold uppercase tracking-wide text-brand-600">Total Earnings</p>
              <p className="mt-2 text-4xl font-black text-brand-950">INR {metrics.totalEarnings || 0}</p>
            </article>
          </div>

          <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-soft">
            <button
              type="button"
              onClick={() => toggleSection("incomingBookings")}
              className="flex w-full items-center justify-between text-left"
            >
              <h2 className="text-3xl font-black text-brand-950">Incoming Bookings</h2>
              <span className="rounded-full border border-brand-200 px-3 py-1 text-xs font-bold text-brand-800">
                {openSections.incomingBookings ? "Hide" : "Show"}
              </span>
            </button>
            {openSections.incomingBookings ? (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {incomingBookings.length > 0 ? (
                  incomingBookings.slice(0, 20).map((booking) => (
                    <BookingCard
                      key={booking._id}
                      booking={booking}
                      isProvider
                      onAction={handleBookingAction}
                      actionLoadingId={bookingActionId}
                    />
                  ))
                ) : (
                  <EmptyState
                    title="No incoming bookings"
                    description="When customers request your services, bookings will appear here."
                  />
                )}
              </div>
            ) : null}
          </div>

          <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-soft">
            <button
              type="button"
              onClick={() => toggleSection("createService")}
              className="flex w-full items-center justify-between text-left"
            >
              <h2 className="text-3xl font-black text-brand-950">
                {editingServiceId ? "Edit Service" : "Create Service"}
              </h2>
              <span className="rounded-full border border-brand-200 px-3 py-1 text-xs font-bold text-brand-800">
                {openSections.createService ? "Hide" : "Show"}
              </span>
            </button>
            {openSections.createService ? (
              <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={handleServiceSubmit}>
                <input
                  placeholder="Title"
                  value={serviceForm.title}
                  onChange={(event) => setServiceForm((prev) => ({ ...prev, title: event.target.value }))}
                  className="rounded-xl border border-brand-100 bg-brand-50 px-3 py-2"
                  required
                />
                <input
                  placeholder="Category"
                  value={serviceForm.category}
                  onChange={(event) => setServiceForm((prev) => ({ ...prev, category: event.target.value }))}
                  className="rounded-xl border border-brand-100 bg-brand-50 px-3 py-2"
                  required
                />
                <input
                  placeholder="Price"
                  type="number"
                  min="1"
                  value={serviceForm.price}
                  onChange={(event) => setServiceForm((prev) => ({ ...prev, price: event.target.value }))}
                  className="rounded-xl border border-brand-100 bg-brand-50 px-3 py-2"
                  required
                />
                <input
                  placeholder="Location"
                  value={serviceForm.location}
                  onChange={(event) => setServiceForm((prev) => ({ ...prev, location: event.target.value }))}
                  className="rounded-xl border border-brand-100 bg-brand-50 px-3 py-2"
                  required
                />
                <textarea
                  placeholder="Description"
                  rows={4}
                  value={serviceForm.description}
                  onChange={(event) =>
                    setServiceForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  className="md:col-span-2 rounded-xl border border-brand-100 bg-brand-50 px-3 py-2"
                  required
                />
                <div className="md:col-span-2 flex flex-wrap gap-2">
                  <button
                    type="submit"
                    disabled={serviceSubmitting}
                    className="rounded-full bg-brand-600 px-6 py-2 text-sm font-bold text-white disabled:opacity-60"
                  >
                    {serviceSubmitting ? "Saving..." : editingServiceId ? "Update Service" : "Create Service"}
                  </button>
                  {editingServiceId ? (
                    <button
                      type="button"
                      disabled={serviceSubmitting}
                      onClick={() => {
                        setEditingServiceId(null);
                        setServiceForm(defaultForm);
                      }}
                      className="rounded-full border border-brand-300 px-6 py-2 text-sm font-bold text-brand-900 disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
              </form>
            ) : null}
          </div>

          <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-soft">
            <button
              type="button"
              onClick={() => toggleSection("myServices")}
              className="flex w-full items-center justify-between text-left"
            >
              <h2 className="text-3xl font-black text-brand-950">My Services</h2>
              <span className="rounded-full border border-brand-200 px-3 py-1 text-xs font-bold text-brand-800">
                {openSections.myServices ? "Hide" : "Show"}
              </span>
            </button>
            {openSections.myServices ? (
              <>
                {serviceLoading ? <LoadingSpinner label="Loading your services..." /> : null}
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {!serviceLoading && providerServices.length === 0 ? (
                    <EmptyState
                      title="No services yet"
                      description="Create your first service to start receiving bookings."
                    />
                  ) : (
                    visibleProviderServices.map((service) => (
                      <article key={service._id} className="rounded-2xl border border-brand-100 bg-brand-50 p-4">
                        <h3 className="text-xl font-bold text-brand-950">{service.title}</h3>
                        <p className="mt-1 text-sm text-brand-700">{service.description}</p>
                        <p className="mt-2 text-sm font-semibold text-brand-800">INR {service.price}</p>
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            disabled={serviceSubmitting}
                            onClick={() => editService(service)}
                            className="rounded-full bg-brand-600 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-60"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={serviceSubmitting}
                            onClick={() => removeService(service._id)}
                            className="rounded-full bg-red-500 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
                {!serviceLoading && providerServices.length > 0 ? (
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-sm text-brand-700">
                      Showing {Math.min(visibleServiceCount, providerServices.length)} of {providerServices.length}
                    </p>
                    <span className="text-xs font-semibold text-brand-600">
                      {hasMoreServices ? "Scroll to load more" : "All services loaded"}
                    </span>
                  </div>
                ) : null}
                {hasMoreServices ? <div ref={loadMoreRef} className="h-2 w-full" /> : null}
              </>
            ) : null}
          </div>
        </section>
      ) : (
        <section className="mt-8 rounded-3xl border border-brand-100 bg-white p-6 shadow-soft">
          <h2 className="text-3xl font-black text-brand-950">My Bookings</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <input
              value={bookingFilters.keyword}
              onChange={(event) =>
                setBookingFilters((prev) => ({ ...prev, keyword: event.target.value }))
              }
              placeholder="Search service/provider"
              className="rounded-xl border border-brand-100 bg-brand-50 px-3 py-2 text-sm"
            />
            <select
              value={bookingFilters.status}
              onChange={(event) =>
                setBookingFilters((prev) => ({ ...prev, status: event.target.value }))
              }
              className="rounded-xl border border-brand-100 bg-brand-50 px-3 py-2 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={bookingFilters.time}
              onChange={(event) =>
                setBookingFilters((prev) => ({ ...prev, time: event.target.value }))
              }
              className="rounded-xl border border-brand-100 bg-brand-50 px-3 py-2 text-sm"
            >
              <option value="all">All Time</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
              <option value="today">Today</option>
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
            </select>
            <button
              type="button"
              onClick={() => setBookingFilters(defaultBookingFilters)}
              className="rounded-full border border-brand-200 px-4 py-2 text-sm font-bold text-brand-900"
            >
              Reset Filters
            </button>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {filteredMyBookings.length > 0 ? (
              filteredMyBookings.slice(0, 40).map((booking) => <BookingCard key={booking._id} booking={booking} />)
            ) : (
              <EmptyState
                title="No bookings found"
                description="Try changing your filters or book a new service."
              />
            )}
          </div>
        </section>
      )}
    </main>
  );
}
