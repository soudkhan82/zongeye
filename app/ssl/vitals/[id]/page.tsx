// app/ssl/vitals/[id]/page.tsx

import TrendsClient from "../../components/TrendClient";

interface Props {
  params: Promise<{ id: string }>;
}

// ✅ params is a plain object, not a Promise
export default async function Page({ params }: Props) {
  const name = (await params).id;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Site Vitals — {name}</h1>
      {/* If TrendsClient needs the data, pass it down */}
      <TrendsClient name={name} />
    </div>
  );
}
