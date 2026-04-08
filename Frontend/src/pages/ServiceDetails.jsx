import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  clearSelectedService,
  fetchServiceById,
} from "../store/servicesSlice";
import {
  createReview,
  deleteReview,
  fetchReviewsByService,
} from "../store/reviewsSlice";
import { createBooking } from "../store/bookingsSlice";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

export default function ServiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedService, loading, error } = useSelector((state) => state.services);
  const { reviewsByService, loading: reviewsLoading } = useSelector((state) => state.reviews);
  const { token, user } = useSelector((state) => state.auth);

  const [bookingDate, setBookingDate] = useState("");
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  const minBookingDateTime = useMemo(() => {
    const now = new Date(Date.now() + 60 * 1000);
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  }, []);

  useEffect(() => {
    dispatch(fetchServiceById(id));
    dispatch(fetchReviewsByService(id));

    return () => {
      dispatch(clearSelectedService());
    };
  }, [dispatch, id]);

  const canReview = useMemo(() => {
    if (!user) return false;
    return !reviewsByService.some((review) => {
      const reviewUserId = typeof review.user === "string" ? review.user : review.user?._id;
      return reviewUserId === user.id;
    });
  }, [reviewsByService, user]);

  const handleBooking = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (!bookingDate) {
      toast.error("Please choose date and time");
      return;
    }

    if (new Date(bookingDate) <= new Date()) {
      toast.error("Please choose a future date and time");
      return;
    }

    setBookingSubmitting(true);
    try {
      await dispatch(createBooking({ serviceId: id, date: new Date(bookingDate).toISOString() })).unwrap();
      toast.success("Booking request sent");
      setBookingDate("");
    } catch (errorMessage) {
      toast.error(errorMessage || "Failed to create booking");
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    setReviewSubmitting(true);
    try {
      await dispatch(
        createReview({
          serviceId: id,
          rating: Number(reviewForm.rating),
          comment: reviewForm.comment,
        })
      ).unwrap();
      toast.success("Review added");
      setReviewForm({ rating: 5, comment: "" });
      dispatch(fetchReviewsByService(id));
      dispatch(fetchServiceById(id));
    } catch (errorMessage) {
      toast.error(errorMessage || "Failed to add review");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Delete this review? This action cannot be undone.")) {
      return;
    }

    setDeletingReviewId(reviewId);
    try {
      await dispatch(deleteReview(reviewId)).unwrap();
      toast.success("Review deleted");
      dispatch(fetchReviewsByService(id));
      dispatch(fetchServiceById(id));
    } catch (errorMessage) {
      toast.error(errorMessage || "Failed to delete review");
    } finally {
      setDeletingReviewId(null);
    }
  };

  if (loading) return <LoadingSpinner label="Loading service details..." />;
  if (error || !selectedService) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <EmptyState title="Service not available" description={error || "Could not find service"} />
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
      <section className="rounded-3xl border border-brand-100 bg-white p-6 shadow-soft md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-4xl font-black text-brand-950 md:text-5xl">{selectedService.title}</h1>
          <span className="rounded-full bg-brand-50 px-4 py-2 text-sm font-bold text-brand-700">
            {selectedService.category}
          </span>
        </div>
        <p className="mt-4 text-lg leading-8 text-brand-700">{selectedService.description}</p>

        <div className="mt-6 grid gap-4 rounded-2xl bg-brand-50 p-5 text-brand-800 md:grid-cols-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-brand-600">Price</p>
            <p className="mt-1 text-2xl font-black">INR {selectedService.price}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-brand-600">Provider</p>
            <p className="mt-1 text-base font-semibold">{selectedService.provider?.name || "Unknown"}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-brand-600">Rating</p>
            <p className="mt-1 text-base font-semibold">
              {selectedService.rating || 0} ({selectedService.numReviews || 0} reviews)
            </p>
          </div>
        </div>

        <div className="mt-7 rounded-2xl border border-brand-100 bg-[#f6f2ed] p-5">
          <h2 className="text-2xl font-black text-brand-950">Book Now</h2>
          <div className="mt-3 flex flex-col gap-3 md:flex-row">
            <input
              type="datetime-local"
              value={bookingDate}
              min={minBookingDateTime}
              onChange={(event) => setBookingDate(event.target.value)}
              className="flex-1 rounded-xl border border-brand-100 bg-white px-4 py-3 text-brand-900"
            />
            <button
              type="button"
              disabled={bookingSubmitting}
              onClick={handleBooking}
              className="rounded-full bg-orange-600 px-7 py-3 text-base font-bold text-white transition hover:bg-orange-700 disabled:opacity-60"
            >
              {bookingSubmitting ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-soft">
          <h2 className="text-3xl font-black text-brand-950">Reviews</h2>
          {reviewsLoading ? <LoadingSpinner label="Loading reviews..." /> : null}

          {!reviewsLoading && reviewsByService.length === 0 ? (
            <p className="mt-4 text-sm text-brand-700">No reviews yet.</p>
          ) : null}

          <div className="mt-4 space-y-3">
            {reviewsByService.slice(0, 20).map((review) => {
              const reviewUserId = typeof review.user === "string" ? review.user : review.user?._id;
              const isOwner = user && reviewUserId === user.id;
              return (
                <article key={review._id} className="rounded-2xl border border-brand-100 bg-brand-50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-brand-900">{review.user?.name || "User"}</p>
                    <p className="text-sm font-bold text-orange-600">{review.rating}/5</p>
                  </div>
                  <p className="mt-1 text-sm text-brand-700">{review.comment || "No comment"}</p>
                  {isOwner ? (
                    <button
                      type="button"
                      disabled={deletingReviewId === review._id}
                      onClick={() => handleDeleteReview(review._id)}
                      className="mt-3 rounded-full bg-red-500 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-60"
                    >
                      {deletingReviewId === review._id ? "Deleting..." : "Delete"}
                    </button>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>

        <aside className="rounded-3xl border border-brand-100 bg-white p-6 shadow-soft">
          <h3 className="text-2xl font-black text-brand-950">Write a Review</h3>
          {!token ? (
            <p className="mt-3 text-sm text-brand-700">Login to submit a review after a completed booking.</p>
          ) : canReview ? (
            <form className="mt-4 space-y-3" onSubmit={handleReviewSubmit}>
              <select
                value={reviewForm.rating}
                onChange={(event) =>
                  setReviewForm((prev) => ({ ...prev, rating: event.target.value }))
                }
                className="w-full rounded-xl border border-brand-100 bg-brand-50 px-3 py-2"
              >
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating} Stars
                  </option>
                ))}
              </select>
              <textarea
                rows={4}
                value={reviewForm.comment}
                onChange={(event) =>
                  setReviewForm((prev) => ({ ...prev, comment: event.target.value }))
                }
                className="w-full rounded-xl border border-brand-100 bg-brand-50 px-3 py-2"
                placeholder="Share your experience"
              />
              <button
                type="submit"
                disabled={reviewSubmitting}
                className="w-full rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
              >
                {reviewSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          ) : (
            <p className="mt-3 text-sm text-brand-700">You already submitted a review for this service.</p>
          )}
        </aside>
      </section>
    </main>
  );
}
