import { useEffect, useMemo, useState } from "react";
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
import { updateUserProfile as saveProfile } from "../store/authSlice";

const defaultForm = {
  title: "",
  description: "",
  category: "",
  price: "",
  location: "",
};

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
  const [bookingActionId, setBookingActionId] = useState(null);
  const [profileForm, setProfileForm] = useState({
    name: "",
    location: "",
    currentPassword: "",
    password: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);

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

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      name: user.name || "",
      location: user.location || "",
      currentPassword: "",
      password: "",
    });
  }, [user]);

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
    setServiceForm({
      title: service.title,
      description: service.description,
      category: service.category,
      price: service.price,
      location: service.location,
    });
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

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      name: profileForm.name.trim(),
      location: profileForm.location.trim(),
    };
    if (profileForm.password.trim()) {
      if (!profileForm.currentPassword.trim()) {
        toast.error("Enter your current password to set a new password");
        return;
      }
      payload.currentPassword = profileForm.currentPassword.trim();
      payload.password = profileForm.password.trim();
    }

    setProfileSaving(true);
    try {
      await dispatch(saveProfile(payload)).unwrap();
      toast.success("Profile updated successfully");
      setProfileForm((prev) => ({ ...prev, currentPassword: "", password: "" }));
    } catch (errorMessage) {
      toast.error(errorMessage || "Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const metrics = useMemo(() => bookingsState.providerDashboard, [bookingsState.providerDashboard]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
      <h1 className="text-5xl font-black text-brand-950">Dashboard</h1>
      <p className="mt-2 text-lg text-brand-700">
        {isProvider
          ? "Manage your services and incoming bookings."
          : "Track your booking requests and status updates."}
      </p>

      <section className="mt-8 rounded-3xl border border-brand-100 bg-white p-6 shadow-soft">
        <h2 className="text-3xl font-black text-brand-950">My Profile</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={handleProfileSubmit}>
          <input
            placeholder="Full Name"
            value={profileForm.name}
            onChange={(event) => setProfileForm((prev) => ({ ...prev, name: event.target.value }))}
            className="rounded-xl border border-brand-100 bg-brand-50 px-3 py-2"
            required
          />
          <input
            placeholder="Location"
            value={profileForm.location}
            onChange={(event) => setProfileForm((prev) => ({ ...prev, location: event.target.value }))}
            className="rounded-xl border border-brand-100 bg-brand-50 px-3 py-2"
            required
          />
          <input
            type="password"
            placeholder="Current Password"
            value={profileForm.currentPassword}
            onChange={(event) =>
              setProfileForm((prev) => ({ ...prev, currentPassword: event.target.value }))
            }
            className="md:col-span-2 rounded-xl border border-brand-100 bg-brand-50 px-3 py-2"
          />
          <input
            type="password"
            placeholder="New Password (optional)"
            value={profileForm.password}
            onChange={(event) => setProfileForm((prev) => ({ ...prev, password: event.target.value }))}
            className="md:col-span-2 rounded-xl border border-brand-100 bg-brand-50 px-3 py-2"
          />
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={profileSaving}
              className="rounded-full bg-brand-600 px-6 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              {profileSaving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </section>

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
            <h2 className="text-3xl font-black text-brand-950">Incoming Bookings</h2>
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
          </div>

          <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-soft">
            <h2 className="text-3xl font-black text-brand-950">
              {editingServiceId ? "Edit Service" : "Create Service"}
            </h2>
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
          </div>

          <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-soft">
            <h2 className="text-3xl font-black text-brand-950">My Services</h2>
            {serviceLoading ? <LoadingSpinner label="Loading your services..." /> : null}
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {!serviceLoading && providerServices.length === 0 ? (
                <EmptyState
                  title="No services yet"
                  description="Create your first service to start receiving bookings."
                />
              ) : (
                providerServices.map((service) => (
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
          </div>
        </section>
      ) : (
        <section className="mt-8 rounded-3xl border border-brand-100 bg-white p-6 shadow-soft">
          <h2 className="text-3xl font-black text-brand-950">My Bookings</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {myBookings.length > 0 ? (
              myBookings.slice(0, 20).map((booking) => <BookingCard key={booking._id} booking={booking} />)
            ) : (
              <EmptyState
                title="No bookings yet"
                description="Explore services and book your first local provider."
              />
            )}
          </div>
        </section>
      )}
    </main>
  );
}
