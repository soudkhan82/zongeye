// app/ss/vitals/[id]/page.tsx

import { getAvailabilityBySite } from "@/app/actions/avail";
import AvailabilityView from "../../components/availability_view";
import { AvailabilityPoint } from "@/interfaces";

export default async function VitalsPage({
  params,
}: {
  params: { id: string };
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const siteName = decodeURIComponent(params.id); // "Name" passed in URL
  const data: AvailabilityPoint[] = await getAvailabilityBySite(siteName);

  return <AvailabilityView data={data} title={siteName} />;
}
