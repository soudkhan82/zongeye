// app/ssl/vitals/[id]/page.tsx

import TrendsClient from "../../components/TrendClient";

type PageParams = { id: string };

// ✅ params is a plain object, not a Promise
export default async function Page({ params }: { params: PageParams }) {
  const name = decodeURIComponent(params.id);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Site Vitals — {name}</h1>
      {/* If TrendsClient needs the data, pass it down */}
      <TrendsClient name={name} />
    </div>
  );
}
