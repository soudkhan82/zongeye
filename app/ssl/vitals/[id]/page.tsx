// app/ss/vitals/[id]/page.tsx

import { getAvailabilityBySite } from "@/app/actions/avail";
import AvailabilityView from "../../components/availability_view";

type PageProps = { params: { id: string } };

export default async function VitalsPage({ params }: PageProps) {
  const siteName = decodeURIComponent(params.id); // "Name" passed in URL
  const data = await getAvailabilityBySite(siteName);

  return <AvailabilityView data={data} title={siteName} />;
}
