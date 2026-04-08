import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { updateUserProfile } from "../store/authSlice";

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleString();
}

export default function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    name: "",
    location: "",
    currentPassword: "",
    password: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || "",
      location: user.location || "",
      currentPassword: "",
      password: "",
    });
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      name: form.name.trim(),
      location: form.location.trim(),
    };

    if (form.password.trim()) {
      if (!form.currentPassword.trim()) {
        toast.error("Enter your current password to set a new password");
        return;
      }
      payload.currentPassword = form.currentPassword.trim();
      payload.password = form.password.trim();
    }

    setSaving(true);
    try {
      await dispatch(updateUserProfile(payload)).unwrap();
      toast.success("Profile updated successfully");
      setForm((prev) => ({ ...prev, currentPassword: "", password: "" }));
    } catch (errorMessage) {
      toast.error(errorMessage || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 md:px-6">
      <h1 className="text-5xl font-black text-brand-950">My Profile</h1>
      <p className="mt-2 text-lg text-brand-700">View and update your account details.</p>

      <section className="mt-8 rounded-3xl border border-brand-100 bg-white p-6 shadow-soft md:p-8">
        <h2 className="text-3xl font-black text-brand-950">Account Details</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <article className="rounded-2xl border border-brand-100 bg-brand-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-600">Email</p>
            <p className="mt-1 text-sm font-semibold text-brand-900">{user?.email || "Not available"}</p>
          </article>
          <article className="rounded-2xl border border-brand-100 bg-brand-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-600">Role</p>
            <p className="mt-1 text-sm font-semibold capitalize text-brand-900">{user?.role || "user"}</p>
          </article>
          <article className="rounded-2xl border border-brand-100 bg-brand-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-600">Verification</p>
            <p className="mt-1 text-sm font-semibold text-brand-900">
              {user?.isVerified ? "Verified" : "Not verified"}
            </p>
          </article>
          <article className="rounded-2xl border border-brand-100 bg-brand-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-600">User ID</p>
            <p className="mt-1 break-all text-sm font-semibold text-brand-900">{user?.id || "Not available"}</p>
          </article>
          <article className="rounded-2xl border border-brand-100 bg-brand-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-600">Joined</p>
            <p className="mt-1 text-sm font-semibold text-brand-900">{formatDate(user?.createdAt)}</p>
          </article>
          <article className="rounded-2xl border border-brand-100 bg-brand-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-600">Last Updated</p>
            <p className="mt-1 text-sm font-semibold text-brand-900">{formatDate(user?.updatedAt)}</p>
          </article>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-brand-100 bg-white p-6 shadow-soft md:p-8">
        <h2 className="text-3xl font-black text-brand-950">Update Profile</h2>
        <form className="grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
          <input
            placeholder="Full Name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            className="rounded-xl border border-brand-100 bg-brand-50 px-3 py-2"
            required
          />
          <input
            placeholder="Location"
            value={form.location}
            onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
            className="rounded-xl border border-brand-100 bg-brand-50 px-3 py-2"
            required
          />
          <input
            type="password"
            placeholder="Current Password"
            value={form.currentPassword}
            onChange={(event) => setForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
            className="md:col-span-2 rounded-xl border border-brand-100 bg-brand-50 px-3 py-2"
          />
          <input
            type="password"
            placeholder="New Password (optional)"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            className="md:col-span-2 rounded-xl border border-brand-100 bg-brand-50 px-3 py-2"
          />
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-brand-600 px-6 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
