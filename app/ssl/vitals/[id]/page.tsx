import TrendsClient from "@/app/ssl/components/TrendClient";

export default function Page({ params }: { params: { id: string } }) {
  const name = decodeURIComponent(params.id ?? "");
  return <TrendsClient name={name} />;
}
