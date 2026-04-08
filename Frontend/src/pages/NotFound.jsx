import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-black text-brand-950">404</h1>
      <p className="mt-3 text-lg text-brand-700">The page you are looking for does not exist.</p>
      <Link
        to="/"
        className="mt-6 rounded-full bg-brand-600 px-6 py-3 text-base font-bold text-white"
      >
        Go Home
      </Link>
    </div>
  );
}
