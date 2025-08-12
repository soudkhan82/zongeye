// app/ss/vitals/[id]/page.tsx

import { getAvailabilityBySite } from "@/app/actions/avail";
import AvailabilityView from "../../components/availability_view";
import { AvailabilityPoint } from "@/interfaces";

export default async function VitalsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const siteName = decodeURIComponent(resolvedParams.id); // "Name" passed in URL
  const data: AvailabilityPoint[] = await getAvailabilityBySite(siteName);

  return <AvailabilityView data={data} title={siteName} />;
}
