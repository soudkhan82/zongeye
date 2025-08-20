// app/ssl/vitals/[id]/page.tsx
import { notFound } from "next/navigation";
import { get_site_vitals_by_site } from "@/app/actions/ssl";

type PageProps = {
  params: { id: string }; // dynamic segment value as string
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function Page({ params }: PageProps) {
  const name = decodeURIComponent(params.id); // if you used encodeURIComponent in links
  const rows = await get_site_vitals_by_site(name);

  if (!rows || rows.length === 0) {
    notFound();
  }

  // render your UI with rows
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Site Vitals — {name}</h1>
      {/* ...table/cards using rows... */}
    </div>
  );
}
