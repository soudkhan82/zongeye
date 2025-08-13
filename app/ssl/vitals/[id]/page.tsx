// app/ss/vitals/[id]/page.tsx

import { getAvailabilityBySite } from "@/app/actions/avail";
import { AvailabilityPoint, siteVitals } from "@/interfaces";
import MapView from "../../components/mapview";
import { get_site_vitals_by_site } from "@/app/actions/ssl";

export default async function VitalsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const siteName = decodeURIComponent(resolvedParams.id); // "Name" passed in URL
  const avail: AvailabilityPoint[] = await getAvailabilityBySite(siteName);
  const vitals: siteVitals[] = await get_site_vitals_by_site(siteName);

  return <MapView avail={avail} vitals={vitals} title={siteName} />;
}
