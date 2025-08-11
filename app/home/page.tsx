"use client";
import { Button } from "@/components/ui/button";

import Image from "next/image";
import Link from "next/link";

export default function HomePge() {
  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center bg-gray-200 py-5 px-20">
        <h1 className="text-3xl font-bold text-green-400 [text-shadow:_0_0_10px_rgb(34_197_94)]">
          Zong <span className="text-white">EYE</span>
        </h1>
      </div>
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16 flex flex-col md:flex-row items-center gap-10">
          {/* Text Content */}
          <div className="flex-1 text-center md:text-left space-y-6">
            <h1 className="text-5xl font-bold leading-tight">
              Transforming projects through
              <span className="text-blue-600">Technology</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-xl">
              See your data. Know your business. Act with confidence
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg">
                Get Started
              </Button>
              <Button
                variant="outline"
                className="px-6 py-3 rounded-lg text-lg"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="flex-1 relative h-90 w-full">
            <Image
              src="/telecom.png"
              alt="Telecom Illustration"
              fill
              className="object-cover rounded-2xl shadow-lg"
              priority
            />
          </div>
        </div>

        {/* Features Section */}

        <section className="container mx-auto px-4 py-12 grid md:grid-cols-3 gap-8 text-center">
          {[
            {
              title: "Geographical Information System",
              desc: "Blazing fast with Server Side Rendering (SSR).",
              route: "/rt",
            },
            {
              title: "Intuitive Visualizations",
              desc: "World-class contemporary UI Visuals with interactive controls",
            },
            {
              title: "Geospatial Network 16+ Sites",
              desc: "An internative geographical visualization of the networ",
              route: "/ssl",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-3 text-blue-600">
                <Link href={`${feature.route}`}> {feature.title} </Link>
              </h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
