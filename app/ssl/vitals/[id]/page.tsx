// app/ss/vitals/[id]/page.tsx

import { getAvailabilityBySite } from "@/app/actions/avail";
import AvailabilityView from "../../components/availability_view";

export default async function VitalsPage({
  params,
}: {
  params: { id: string };
}) {
  const siteName = decodeURIComponent(params.id); // "Name" passed in URL
  const data = await getAvailabilityBySite(siteName);

  return <AvailabilityView data={data} title={siteName} />;
}
