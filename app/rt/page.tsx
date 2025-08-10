export default function Page() {
  const cards = [
    {
      title: "Voice Traffic ",
      subtitle: "Explore clusters, hotspots, and trends",
      href: "/rt/voiceTraffic",
      img: "https://www.researchgate.net/profile/Yang-Li-162/publication/342059044/figure/fig8/AS:902280238280704@1592202012901/Traffic-heat-map-of-Beijing.png",
      badge: "Voice",
      chips: ["2G/3G/VoLTE", "+25 KPIs", "District filter"],
    },
    {
      title: "Data Traffic",
      subtitle: "Directional congestion patterns",
      href: "/rt/dataTraffic",
      img: "https://www.researchgate.net/profile/Sattar-Khan/publication/330420317/figure/fig2/AS:717259613257728@1547701429295/A-heat-map-matrix-visualization-for-traffic-congestion-analysis-21.png",
      badge: "GIS",
      chips: ["Rasters & tiles", "Sites & sectors", "Subregion filter"],
    },
    {
      title: "3D Telecom Traffic Time‑Series",
      subtitle: "Peaks & valleys over 21 days",
      href: "",
      img: "https://tse2.mm.bing.net/th/id/OIP.lAQ0xNO0-Wl_YWcnOiYF1wHaE3?pid=Api",
      badge: "3D",
      chips: ["Time series", "Weather overlay", "Udine case"],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 p-6 md:p-10">
      <header className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-800">
          Geo‑Analytics
          <span className="ml-3 inline-block align-middle text-sm md:text-base px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
            Interactive
          </span>
        </h1>
        <p className="mt-3 text-slate-600 max-w-3xl">
          Three beautiful, clickable GIS panels. Hover to preview; click to jump
          straight into your maps.
        </p>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {cards.map((card, i) => (
          <a
            key={i}
            href={card.href}
            className="group relative block overflow-hidden rounded-3xl shadow-2xl ring-1 ring-slate-200/60 hover:ring-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 transform transition-transform duration-300 hover:scale-105"
          >
            <div className="relative h-[500px] overflow-hidden">
              {" "}
              {/* Fixed large height */}
              <img
                src={card.img}
                alt={card.title}
                className="h-full w-full object-cover opacity-60 transition-transform duration-500 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/50" />
              <div className="absolute left-6 top-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-5 py-2 text-base font-semibold uppercase tracking-wide text-slate-800 shadow-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                  >
                    <path d="M3 11l19-7-7 19-2-8-8-2z" />
                  </svg>
                  {card.badge}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h2 className="text-white text-3xl md:text-4xl font-bold drop-shadow-md">
                  {card.title}
                </h2>
                <p className="mt-3 text-white text-lg md:text-xl drop-shadow-md">
                  {card.subtitle}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {card.chips.map((chip, j) => (
                    <span
                      key={j}
                      className="rounded-full bg-white/95 px-4 py-1.5 text-sm md:text-base font-medium text-slate-800 shadow-sm"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
                <div className="mt-6">
                  <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-lg font-semibold text-white shadow-md transition-all duration-300 group-hover:gap-3 group-hover:bg-emerald-500">
                    Open map
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-5 w-5"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-400/0 via-emerald-400/10 to-emerald-400/0 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
          </a>
        ))}
      </main>
    </div>
  );
}
