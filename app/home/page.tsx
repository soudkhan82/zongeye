// app/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

type TabDef = {
  value: string;
  label: string;
  href: string;
  image: string; // path in /public/images
};

const TABS: TabDef[] = [
  { value: "rt", label: "Metrices", href: "/rt", image: "/images/kpi.png" },
  {
    value: "complaints",
    label: "Complaints",
    href: "/complaints",
    image: "/images/complaints.png",
  },
  {
    value: "avail",
    label: "Availability",
    href: "/avail",
    image: "/images/availability.png",
  },
  {
    value: "tasks",
    label: "Tasks",
    href: "/tasks",
    image: "/images/tasks.jpg",
  },
  { value: "ssl", label: "Network", href: "/ssl", image: "/images/ssl.png" },
];

export default function Page() {
  const router = useRouter();

  const go = (href: string) => router.push(href);
  const onKey = (e: React.KeyboardEvent<HTMLDivElement>, href: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      router.push(href);
    }
  };

  return (
    <main className="relative min-h-screen text-white">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="h-full w-full bg-[url('/images/geo-heatmap.png')] bg-cover bg-center" />
        <div className="pointer-events-none absolute inset-0 bg-black/40" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-10">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight drop-shadow">
            ZongEye — Quick Launch
          </h1>
          <p className="mt-2 text-slate-200 drop-shadow">
            Jump straight into KPIs, Complaints, Availability, Tasks, or Sites.
          </p>
        </header>

        {/* One-row equal-width tiles with full background cover */}
        <div className="flex w-full items-stretch gap-4 md:gap-5">
          {TABS.map((t) => (
            <motion.div
              key={t.value}
              role="button"
              tabIndex={0}
              aria-label={t.label}
              title={t.label}
              onClick={() => go(t.href)}
              onKeyDown={(e) => onKey(e, t.href)}
              className={[
                "group relative cursor-pointer select-none",
                "flex-1 basis-0 min-w-0",
                "aspect-[16/9] rounded-2xl overflow-hidden", // 👈 consistent size
                "border border-white/10 shadow-xl bg-cover bg-center", // 👈 ensures full cover
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400",
              ].join(" ")}
              style={{ backgroundImage: `url(${t.image})` }} // 👈 tile bg is the image
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
            >
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/45 transition-colors duration-300 group-hover:bg-black/30" />

              {/* Sheen */}
              <div className="pointer-events-none absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-[1200ms] ease-out [background:linear-gradient(120deg,transparent,rgba(255,255,255,0.18),transparent)]" />
              </div>

              {/* Label */}
              <motion.div
                className="relative z-10 flex h-full flex-col justify-end p-4 sm:p-5 md:p-6"
                initial={{ y: 6, opacity: 0.95 }}
                whileHover={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
              >
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold drop-shadow">
                  {t.label}
                </h2>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
