import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { clearAuthError, registerUser } from "../store/authSlice";

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token, user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    location: "",
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAuthError());
    }
  }, [dispatch, error]);

  useEffect(() => {
    if (token && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [token, user, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await dispatch(registerUser(formData)).unwrap();
      toast.success("Account created successfully");
    } catch {
      // handled by slice
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-600 font-bold text-white">
              N
            </span>
            <span className="text-3xl font-black text-brand-950">NeighbourConnect</span>
          </div>
          <h1 className="mt-5 text-5xl font-black text-brand-950">Create Account</h1>
          <p className="mt-2 text-lg text-brand-700">Join our community today</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-brand-100 bg-white p-6 shadow-soft md:p-8"
        >
          <label className="mb-2 block text-sm font-bold text-brand-900">Full Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="John Doe"
            className="mb-5 w-full rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-brand-900 outline-none transition focus:border-brand-400"
          />

          <label className="mb-2 block text-sm font-bold text-brand-900">Email</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="your@email.com"
            className="mb-5 w-full rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-brand-900 outline-none transition focus:border-brand-400"
          />

          <label className="mb-2 block text-sm font-bold text-brand-900">Password</label>
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
            className="mb-5 w-full rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-brand-900 outline-none transition focus:border-brand-400"
          />

          <label className="mb-2 block text-sm font-bold text-brand-900">I am a</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="mb-5 w-full rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-brand-900 outline-none transition focus:border-brand-400"
          >
            <option value="user">Customer</option>
            <option value="provider">Provider</option>
          </select>

          <label className="mb-2 block text-sm font-bold text-brand-900">Location</label>
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            placeholder="New York, NY"
            className="mb-6 w-full rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-brand-900 outline-none transition focus:border-brand-400"
          />

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-lg font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            <UserPlus className="h-5 w-5" />
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p className="mt-5 text-center text-sm text-brand-700">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-brand-700 underline">
              Login here
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
