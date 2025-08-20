// app/ssl/vitals/[id]/page.tsx
import TrendsClient from "../../components/TrendClient";

export default async function Page({ params }: { params: { id: string } }) {
  const name = decodeURIComponent(params.id);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Site Vitals — {name}</h1>
      {/* render rows */}
      <TrendsClient name={name} />
    </div>
  );
}
