"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function HomePge() {
  return (
    <div className="flex flex-col">
      {/* Navbar placeholder */}
      <div className="flex justify-between items-center py-5 px-20"></div>

      <main
        className="flex flex-col items-center justify-center min-h-screen text-gray-900 relative"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600&auto=format&fit=crop')", // 👈 global background
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed", // parallax-like effect
        }}
      >
        {/* Optional overlay to keep text readable */}
        <div className="absolute inset-0 bg-black/30 z-0" />

        {/* Hero Section with background */}
        <section className="relative w-full z-10">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative container mx-auto px-4 py-20 flex flex-col md:flex-row items-center gap-10 text-white">
            {/* Text Content */}
            <div className="flex-1 text-center md:text-left space-y-6">
              <h1 className="text-5xl font-bold leading-tight drop-shadow">
                Transforming projects through{" "}
                <span className="text-blue-400">Technology</span>
              </h1>
              <p className="text-lg max-w-xl text-gray-200">
                See your data. Know your business. Act with confidence
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg">
                  Get Started
                </Button>
                <Button
                  variant="outline"
                  className="px-6 py-3 rounded-lg text-lg border-white text-black hover:bg-amber-300 hover:text-black"
                >
                  Learn More
                </Button>
              </div>
            </div>

            {/* Hero Image */}
            <div className="flex-1 relative h-96 w-full">
              <Image
                src="/telecom.png"
                alt="Telecom Illustration"
                fill
                className="object-contain rounded-2xl shadow-lg"
                priority
              />
            </div>
          </div>
        </section>

        {/* Features Section with background */}
        <section className="relative w-full z-10">
          <div className="relative container mx-auto px-4 py-16 grid md:grid-cols-3 gap-8 text-center">
            {[
              {
                title: "On Air Network Dashboard",
                desc: "Blazing fast with Server Side Rendering (SSR).",
                route: "/ssl/Dashboard",
                bg: "https://images.unsplash.com/photo-1581091215367-59ab6a9b4b9b?q=80&w=1600&auto=format&fit=crop",
              },
              {
                title: "Intuitive Visualizations",
                desc: "World-class contemporary UI Visuals with interactive controls",
                route: "/rt/kpi",
                bg: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=1600&auto=format&fit=crop",
              },
              {
                title: "Interactive Geospatial Analysis",
                desc: "Blazing fast with Server Side Rendering (SSR)",
                route: "/ssl",
                bg: "https://images.unsplash.com/photo-1502920514313-52581002a659?q=80&w=1600&auto=format&fit=crop",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="relative rounded-xl shadow hover:shadow-lg transition-shadow overflow-hidden h-60 flex flex-col justify-center items-center text-white"
                style={{
                  backgroundImage: `url(${feature.bg})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50" />
                {/* Content */}
                <div className="relative z-10 p-6">
                  <h3 className="text-xl font-semibold mb-3">
                    <Link href={`${feature.route}`}>{feature.title}</Link>
                  </h3>
                  <p className="text-gray-200">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
