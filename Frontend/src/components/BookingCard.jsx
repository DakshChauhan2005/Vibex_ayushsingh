const statusClass = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  completed: "bg-brand-100 text-brand-800",
};

export default function BookingCard({ booking, isProvider = false, onAction, actionLoadingId = null }) {
  const canAcceptOrReject = booking.status === "pending";
  const canComplete = booking.status === "accepted";
  const isActionLoading = actionLoadingId === booking._id;

  return (
    <article className="rounded-3xl border border-brand-100 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-lg font-bold text-brand-950">
            {booking.service?.title || "Service"}
          </h4>
          <p className="text-sm text-brand-700">
            {new Date(booking.date).toLocaleString()}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusClass[booking.status]}`}>
          {booking.status}
        </span>
      </div>

      <p className="mt-2 text-sm text-brand-700">
        {isProvider ? `Customer: ${booking.user?.name || "N/A"}` : `Provider: ${booking.provider?.name || "N/A"}`}
      </p>

      {isProvider ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {canAcceptOrReject ? (
            <>
              <button
                type="button"
                onClick={() => onAction(booking._id, "accepted")}
                disabled={isActionLoading}
                className="rounded-full bg-brand-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={() => onAction(booking._id, "rejected")}
                disabled={isActionLoading}
                className="rounded-full bg-red-500 px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
              >
                Reject
              </button>
            </>
          ) : null}
          {canComplete ? (
            <button
              type="button"
              onClick={() => onAction(booking._id, "completed")}
              disabled={isActionLoading}
              className="rounded-full bg-orange-500 px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
            >
              Mark Completed
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
