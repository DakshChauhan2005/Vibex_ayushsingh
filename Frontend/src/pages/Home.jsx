import { useEffect, useMemo, useState } from "react";

import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Wrench,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import CategoryCard from "../components/CategoryCard";
import api from "../services/api";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import SectionWrapper from "../components/ui/SectionWrapper";

const categoryImages = {
  plumber:
    "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=900&q=80",
  electrical:
    "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=900&q=80",
  tutoring:
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80",
  Plumbing:
    "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=900&q=80",
  Electrical:
    "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=900&q=80",
  Tutoring:
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80",
};

const fallbackCategories = [
  { title: "Plumbing", key: "plumber" },
  { title: "Electrical", key: "electrical" },
  { title: "Tutoring", key: "tutoring" },
];

const fallbackCounts = {
  Plumbing: 0,
  Electrical: 0,
  Tutoring: 0,
};

const fallbackCategoryImage =
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80";

function toTitleCase(value) {
  return value
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
}

export default function Home() {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [categories, setCategories] = useState(fallbackCategories);
  const [counts, setCounts] = useState(fallbackCounts);
  const [totalProviders, setTotalProviders] = useState(0);
  const [totalServices, setTotalServices] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeStats = async () => {
      try {
        const [servicesResponse, providersResponse] = await Promise.all([
          api.get("/services", { params: { page: 1, limit: 500 } }),
          api.get("/users/providers"),
        ]);

        const services = servicesResponse.data?.data?.services || [];
        const servicesTotal = Number(servicesResponse.data?.meta?.total || services.length || 0);
        const providers = providersResponse.data?.data?.providers || [];

        const categoryMap = new Map();

        services.forEach((service) => {
          const rawCategory = String(service.category || "").trim();
          if (!rawCategory) return;

          const key = rawCategory.toLowerCase();
          const title = toTitleCase(rawCategory);
          const existing = categoryMap.get(key) || { key: rawCategory, title, providerIds: new Set() };

          if (service.provider?._id) {
            existing.providerIds.add(service.provider._id);
          }

          categoryMap.set(key, existing);
        });

        const derivedCategories = Array.from(categoryMap.values())
          .map((entry) => ({
            key: entry.key,
            title: entry.title,
            count: entry.providerIds.size,
          }))
          .sort((a, b) => b.count - a.count);

        if (derivedCategories.length > 0) {
          setCategories(derivedCategories.slice(0, 6).map(({ key, title }) => ({ key, title })));

          const dynamicCounts = {};
          derivedCategories.forEach((category) => {
            dynamicCounts[category.title] = category.count;
          });
          setCounts(dynamicCounts);
        }

        setTotalProviders(providers.length);
        setTotalServices(servicesTotal);
      } finally {
        setLoading(false);
      }
    };

    loadHomeStats();
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

  const testimonials = [
    {
      name: "Aarav Mehta",
      role: "Homeowner",
      text: "Booked a plumber in under 5 minutes. Clear pricing, quick response, and zero hassle.",
    },
    {
      name: "Nisha Arora",
      role: "Parent",
      text: "Found a great tutor nearby with verified reviews. The process feels reliable and professional.",
    },
    {
      name: "Rohit Kapoor",
      role: "Local Provider",
      text: "OpenCare helped me get steady local bookings and build trust with real customer feedback.",
    },
  ];

  const steps = [
    { title: "Search service", text: "Browse local categories and compare providers by price and rating.", icon: Search },
    { title: "Book instantly", text: "Choose a time slot and confirm your request in seconds.", icon: CalendarCheck2 },
    { title: "Get work done", text: "Track status updates and complete your service with confidence.", icon: Wrench },
  ];

  const displayedProviders = useMemo(() => {
    if (totalProviders > 0) return totalProviders;
    return Object.values(counts).reduce((acc, value) => acc + Number(value || 0), 0);
  }, [counts, totalProviders]);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-brand-100 bg-app">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.50)_0%,transparent_45%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.35)_0%,transparent_40%),radial-gradient(circle_at_100%_80%,rgba(255,255,255,0.25)_0%,transparent_40%)]" />
        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 md:grid-cols-2 md:py-20 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <p className="type-display text-sm font-bold uppercase tracking-[0.28em] text-orange-600">
              Your neighbourhood, your services
            </p>
            <h1 className="type-display mt-5 text-5xl font-black leading-[0.95] text-brand-950 md:text-7xl">
              Connect with
              <span className="block bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 bg-clip-text text-transparent">
                Local Service
              </span>
              Providers
            </h1>
            <p className="mt-6 max-w-xl text-xl leading-relaxed text-brand-700">
              From plumbers to tutors, find trusted professionals in your area. Book
              services, read reviews, and get things done.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-bold text-brand-800">
                <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" /> Verified Providers
              </span>
              <span className="rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-bold text-brand-800">
                <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" /> {loading ? "-" : `${totalServices}+`} services listed
              </span>
            </div>

            <div className="mt-9 flex flex-wrap gap-4">
              <Button as="a" href="/services" className="px-7 py-3.5 text-base">
                Browse Services <ArrowRight className="h-5 w-5" />
              </Button>
              {token ? (
                <Button as="a" href="/dashboard" variant="secondary" className="px-7 py-3.5 text-base">
                  Go to Dashboard
                </Button>
              ) : (
                <Button as="a" href="/register" variant="secondary" className="px-7 py-3.5 text-base">
                  Become a Provider
                </Button>
              )}
            </div>

            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
              <article className="rounded-2xl border border-brand-100 bg-white p-3 shadow-soft">
                <p className="text-xs font-bold uppercase tracking-wide text-brand-600">Providers</p>
                <p className="mt-1 text-2xl font-black text-brand-950">{loading ? "-" : displayedProviders}</p>
              </article>
              <article className="rounded-2xl border border-brand-100 bg-white p-3 shadow-soft">
                <p className="text-xs font-bold uppercase tracking-wide text-brand-600">Categories</p>
                <p className="mt-1 text-2xl font-black text-brand-950">{categories.length}</p>
              </article>
              <article className="rounded-2xl border border-brand-100 bg-white p-3 shadow-soft">
                <p className="text-xs font-bold uppercase tracking-wide text-brand-600">Support</p>
                <p className="mt-1 text-2xl font-black text-brand-950">24x7</p>
              </article>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            whileHover={{ scale: 1.01 }}
            className="rounded-[2rem] border border-brand-100 bg-white p-2 shadow-soft"
          >
            <img
              src="https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1300&q=80"
              alt="Local service providers"
              className="h-full min-h-[320px] w-full rounded-[1.6rem] object-cover saturate-90"
            />
          </motion.div>
        </div>
      </section>

      <SectionWrapper
        title="Popular Categories"
        subtitle="Choose a service category and discover trusted providers near your location."
      >
        {loading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }, (_, idx) => (
              <div key={idx} className="h-72 animate-pulse rounded-3xl border border-brand-100 bg-white" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard
                key={category.title}
                title={category.title}
                image={
                  categoryImages[category.key?.toLowerCase()] ||
                  categoryImages[category.title] ||
                  fallbackCategoryImage
                }
                count={counts[category.title] || 0}
                onClick={() => navigate(`/services?category=${category.key}`)}
              />
            ))}
          </div>
        )}
        <div className="mt-8 text-center">
          <Button as="a" href="/services" variant="secondary" className="px-7 py-3">
            View All Categories
          </Button>
        </div>
      </SectionWrapper>

      <SectionWrapper
        className="bg-brand-50"
        title="Why Choose OpenCare"
        subtitle="Built for trust, speed, and everyday convenience in local service discovery."
      >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {whyChooseUs.map((item) => {
              const Icon = item.icon;
              return (
                <motion.article
                  key={item.title}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="rounded-3xl border border-brand-100 bg-white/95 p-6 shadow-soft transition"
                >
                  <div className="inline-flex rounded-2xl bg-brand-50 p-3">
                    <Icon className="h-7 w-7 text-brand-600" />
                  </div>
                  <h3 className="mt-5 text-3xl font-bold text-brand-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-brand-700">{item.text}</p>
                </motion.article>
              );
            })}
          </div>
      </SectionWrapper>

      <SectionWrapper
        title="What our users say"
        subtitle="Real feedback from customers and providers using OpenCare every week."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <Card key={item.name} className="p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-900">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-brand-950">{item.name}</p>
                  <p className="text-xs text-brand-700">{item.role}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-orange-500">
                {Array.from({ length: 5 }, (_, index) => (
                  <Star key={index} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-3 text-sm leading-6 text-brand-700">{item.text}</p>
            </Card>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper
        className="bg-brand-50"
        title="How OpenCare works"
        subtitle="Three simple steps from discovery to completed work."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={step.title} className="relative p-6">
                <span className="absolute right-5 top-5 text-xs font-bold text-brand-600">Step {index + 1}</span>
                <div className="inline-flex rounded-2xl bg-brand-50 p-3">
                  <Icon className="h-6 w-6 text-brand-700" />
                </div>
                <h3 className="mt-4 text-2xl font-black text-brand-950">{step.title}</h3>
                <p className="mt-2 text-sm text-brand-700">{step.text}</p>
              </Card>
            );
          })}
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <div className="rounded-3xl border border-brand-700 bg-gradient-to-r from-brand-800 via-brand-700 to-brand-600 p-8 shadow-soft md:p-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="type-display inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-50">
                <Sparkles className="h-3.5 w-3.5" /> Conversion Optimized
              </p>
              <h2 className="type-display mt-4 text-4xl font-black text-white md:text-5xl">Find trusted help in minutes</h2>
              <p className="mt-3 max-w-2xl text-base text-brand-50/90 md:text-lg">
                Discover verified providers and book confidently with OpenCare's streamlined local marketplace.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button as="a" href="/services" className="bg-white text-brand-900 hover:bg-brand-50">
                Browse Services
              </Button>
              <Button as="a" href="/register" variant="secondary" className="border-white/40 text-white hover:bg-white/10">
                Become a Provider
              </Button>
            </div>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
