import { getlinkById } from "@/app/actions/clients";
import ErrorMessage from "@/components/ui/error-message";
import { Client } from "@/interfaces";
import React from "react";

interface Props {
  params: Promise<{ id: string }>;
}
async function ClientDetailsPage({ params }: Props) {
  const { id } = await params;
  const response = await getlinkById(parseInt(id));
  if (!response.success) {
    return <ErrorMessage error={response.message} />;
  }
  const link: Client = response.data;

  return (
    <div className="grid grid-rows-3">
      <h1>{link.NMS_USER_LABEL}</h1>
      <h4>{link.Client}</h4>
      <p>{link.Location}</p>
      <p>{link.Deployment}</p>
      <p>{link.LMV}</p>
    </div>
  );
}

export default ClientDetailsPage;
