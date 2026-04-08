import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

export default function Footer({ theme = "light" }) {
  const isDark = theme === "dark";

  return (
    <footer className={`mt-14 border-t ${isDark ? "border-brand-200 bg-[#111a17]" : "border-brand-100 bg-white"}`}>
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 md:grid-cols-4 md:px-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-600 text-base font-bold text-white">
              O
            </span>
            <span className={`type-brand text-3xl font-bold ${isDark ? "text-brand-900" : "text-brand-950"}`}>
              OpenCare
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-6 text-brand-700">
            Connect with trusted local providers, book services quickly, and manage everything in one place.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
            <ShieldCheck className="h-3.5 w-3.5" />
            Trusted by neighbourhood communities
          </div>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-wide text-brand-800">Explore</h3>
          <ul className="mt-3 space-y-2 text-sm text-brand-700">
            <li>
              <Link to="/services" className="hover:text-brand-900">
                Services
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-brand-900">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/profile" className="hover:text-brand-900">
                Profile
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-wide text-brand-800">Support</h3>
          <ul className="mt-3 space-y-2 text-sm text-brand-700">
            <li>help@opencare.local</li>
            <li>Mon - Sat, 9:00 AM - 8:00 PM</li>
            <li>Built for local communities</li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-wide text-brand-800">Follow</h3>
          <div className="mt-3 flex items-center gap-3">
            <a href="#" className="rounded-full border border-brand-200 bg-brand-50 p-2 text-brand-800 hover:bg-brand-100" aria-label="Facebook">
              <span className="grid h-4 w-4 place-items-center text-[10px] font-bold">f</span>
            </a>
            <a href="#" className="rounded-full border border-brand-200 bg-brand-50 p-2 text-brand-800 hover:bg-brand-100" aria-label="Instagram">
              <span className="grid h-4 w-4 place-items-center text-[10px] font-bold">ig</span>
            </a>
            <a href="#" className="rounded-full border border-brand-200 bg-brand-50 p-2 text-brand-800 hover:bg-brand-100" aria-label="LinkedIn">
              <span className="grid h-4 w-4 place-items-center text-[10px] font-bold">in</span>
            </a>
          </div>
          <p className="mt-4 text-xs text-brand-700">We verify providers and prioritize service quality at every step.</p>
        </div>
      </div>

      <div className={`border-t py-3 ${isDark ? "border-brand-200 bg-[#16221e]" : "border-brand-100 bg-brand-50"}`}>
        <p className="mx-auto w-full max-w-6xl px-4 text-xs text-brand-700 md:px-6">
          © {new Date().getFullYear()} OpenCare. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
