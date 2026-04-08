import { useEffect, useState } from "react";
import { LogIn } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { clearAuthError, loginUser } from "../store/authSlice";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, token, user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAuthError());
    }
  }, [dispatch, error]);

  useEffect(() => {
    if (token && user) {
      const redirectPath = location.state?.from?.pathname || "/dashboard";
      navigate(redirectPath, { replace: true });
    }
  }, [token, user, navigate, location.state]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await dispatch(loginUser(formData)).unwrap();
      toast.success("Logged in successfully");
    } catch {
      // handled by slice error state
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
          <h1 className="mt-5 text-5xl font-black text-brand-950">Welcome Back</h1>
          <p className="mt-2 text-lg text-brand-700">Login to your account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-brand-100 bg-white p-6 shadow-soft md:p-8"
        >
          <label className="mb-2 block text-sm font-bold text-brand-900">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, email: event.target.value }))
            }
            placeholder="your@email.com"
            required
            className="mb-6 w-full rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-brand-900 outline-none transition focus:border-brand-400"
          />

          <label className="mb-2 block text-sm font-bold text-brand-900">Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, password: event.target.value }))
            }
            placeholder="••••••••"
            required
            className="mb-7 w-full rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-brand-900 outline-none transition focus:border-brand-400"
          />

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-lg font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            <LogIn className="h-5 w-5" />
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="mt-5 text-center text-sm text-brand-700">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-bold text-brand-700 underline">
              Register here
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
