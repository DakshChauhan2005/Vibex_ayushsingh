import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const navClass = ({ isActive }) =>
    `text-base font-semibold transition ${isActive ? "text-brand-900" : "text-brand-700 hover:text-brand-900"}`;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-brand-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-600 text-lg font-bold text-white">
            N
          </span>
          <span className="text-3xl font-black tracking-tight text-brand-950">NeighbourConnect</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/services" className={navClass}>
            Services
          </NavLink>
          {user ? (
            <NavLink to="/dashboard" className={navClass}>
              Dashboard
            </NavLink>
          ) : (
            <NavLink to="/login" className={navClass}>
              Login
            </NavLink>
          )}
          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full bg-brand-600 px-7 py-3 text-base font-bold text-white transition hover:bg-brand-700"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/register"
              className="rounded-full bg-brand-600 px-7 py-3 text-base font-bold text-white transition hover:bg-brand-700"
            >
              Get Started
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
