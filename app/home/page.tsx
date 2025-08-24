// app/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

type TabDef = {
  value: string;
  label: string;
  href: string;
  image: string; // path in /public/images
  subtitle: string;
};

const TABS: TabDef[] = [
  {
    value: "rt",
    label: "Metrices",
    href: "/rt",
    image: "/images/kpi.jpg",
    subtitle: "Performance Metrices",
  },
  {
    value: "complaints",
    label: "Complaints",
    href: "/complaints",
    image: "/images/complaints.jpg",
    subtitle: "Customer issues & trends",
  },
  {
    value: "avail",
    label: "Availability",
    href: "/avail",
    image: "/images/availability.jpg",
    subtitle: "Uptime & outages",
  },
  {
    value: "tasks",
    label: "Tasks",
    href: "/tasks",
    image: "/images/tasks.jpg",
    subtitle: "Actions, owners, SLAs",
  },
  {
    value: "ssl",
    label: "Network",
    href: "/ssl",
    image: "/images/ssl.jpg",
    subtitle: "Network Overview",
  },
];

export default function Page() {
  const router = useRouter();

  const handleTabChange = (value: string) => {
    const target = TABS.find((t) => t.value === value);
    if (target) router.push(target.href);
  };

  return (
    <main className="relative min-h-screen text-white">
      {/* Background: high-quality geographical heatmap */}
      <div className="absolute inset-0">
        <div className="h-full w-full bg-[url('/images/geo-heatmap.png')] bg-cover bg-center" />
        {/* Legibility overlays */}
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

        <Tabs
          defaultValue="Performance"
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 bg-transparent p-0">
            {TABS.map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                title={t.label}
                className={[
                  "group relative overflow-hidden rounded-2xl border border-white/10",
                  "h-44 md:h-56 p-0 text-left shadow-lg",
                  "bg-black/30 backdrop-blur-sm",
                  "data-[state=active]:ring-2 data-[state=active]:ring-indigo-400",
                ].join(" ")}
              >
                {/* Card background image */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${t.image})` }}
                />
                {/* Darken for contrast */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
                {/* Sheen */}
                <div className="pointer-events-none absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-[1200ms] ease-out [background:linear-gradient(120deg,transparent,rgba(255,255,255,0.18),transparent)]" />
                </div>

                <motion.div
                  className="relative z-10 flex h-full flex-col justify-end p-4"
                  initial={{ y: 6, opacity: 0.92 }}
                  whileHover={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <div className="text-sm uppercase tracking-wider text-white/80">
                    {t.subtitle}
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <h2 className="text-xl md:text-2xl font-semibold drop-shadow">
                      {t.label}
                    </h2>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/60 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                    </span>
                  </div>
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
                </motion.div>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <p className="mt-6 text-center text-xs text-slate-200/90 drop-shadow">
          Tip: Hover a tab to preview, click to open the section.
        </p>
      </div>
    </main>
  );
}
