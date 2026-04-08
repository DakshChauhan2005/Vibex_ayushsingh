import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Clock3, Search, ShieldCheck, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import CategoryCard from "../components/CategoryCard";
import api from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

const categoryImages = {
  Plumbing:
    "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=900&q=80",
  Electrical:
    "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=900&q=80",
  Tutoring:
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80",
};

const categories = [
  { title: "Plumbing", key: "plumber" },
  { title: "Electrical", key: "electrical" },
  { title: "Tutoring", key: "tutoring" },
];

export default function Home() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    Plumbing: 0,
    Electrical: 0,
    Tutoring: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategoryCounts = async () => {
      try {
        const responses = await Promise.all(
          categories.map((category) =>
            api.get("/services", {
              params: {
                category: category.key,
                page: 1,
                limit: 100,
              },
            })
          )
        );

        const mapped = {};
        responses.forEach((response, index) => {
          const category = categories[index];
          const services = response.data?.data?.services || [];
          const providerSet = new Set(services.map((service) => service.provider?._id).filter(Boolean));
          mapped[category.title] = providerSet.size;
        });

        setCounts((prev) => ({ ...prev, ...mapped }));
      } finally {
        setLoading(false);
      }
    };

    loadCategoryCounts();
  }, []);

  const whyChooseUs = useMemo(
    () => [
      {
        title: "Easy Discovery",
        icon: Search,
        text: "Find local service providers with advanced filters and search.",
      },
      {
        title: "Verified Reviews",
        icon: Star,
        text: "Read authentic reviews from real customers in your neighborhood.",
      },
      {
        title: "Quick Booking",
        icon: Clock3,
        text: "Book services instantly with real-time availability.",
      },
      {
        title: "Secure Platform",
        icon: ShieldCheck,
        text: "Your data and transactions are protected and encrypted.",
      },
    ],
    []
  );

  return (
    <div>
      <section className="relative overflow-hidden border-b border-brand-100 bg-[#efe9e3]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.55)_0%,transparent_45%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.55)_0%,transparent_40%),radial-gradient(circle_at_100%_80%,rgba(255,255,255,0.45)_0%,transparent_40%)]" />
        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 md:grid-cols-2 md:py-20 md:px-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-orange-600">
              Your neighbourhood, your services
            </p>
            <h1 className="mt-5 text-5xl font-black leading-tight text-brand-950 md:text-7xl">
              Connect with Local Service Providers
            </h1>
            <p className="mt-6 max-w-xl text-xl leading-relaxed text-brand-700">
              From plumbers to tutors, find trusted professionals in your area. Book
              services, read reviews, and get things done.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                to="/services"
                className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-4 text-lg font-bold text-white transition hover:bg-brand-700"
              >
                Browse Services <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center rounded-full bg-orange-600 px-7 py-4 text-lg font-bold text-white transition hover:bg-orange-700"
              >
                Become a Provider
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-brand-100 bg-white p-2 shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=1300&q=80"
              alt="Local service providers"
              className="h-full min-h-[320px] w-full rounded-[1.6rem] object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6">
        <h2 className="text-center text-5xl font-black text-brand-950">Popular Categories</h2>
        {loading ? (
          <LoadingSpinner label="Loading categories..." />
        ) : (
          <div className="mt-9 grid gap-6 md:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard
                key={category.title}
                title={category.title}
                image={categoryImages[category.title]}
                count={counts[category.title]}
                onClick={() => navigate(`/services?category=${category.key}`)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="bg-[#e9e7e2] py-14">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
          <h2 className="text-center text-5xl font-black text-brand-950">Why Choose Us</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {whyChooseUs.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="rounded-3xl border border-brand-100 bg-white p-6 shadow-soft"
                >
                  <Icon className="h-8 w-8 text-brand-600" />
                  <h3 className="mt-5 text-3xl font-bold text-brand-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-brand-700">{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
