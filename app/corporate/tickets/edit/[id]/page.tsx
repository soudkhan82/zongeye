import PageTitle from "@/components/ui/page-title";
import React from "react";
import TicketForm from "../../components/ticketForm";
import { getTicketById } from "@/app/actions/complaints";
import ErrorMessage from "@/components/ui/error-message";

interface Props {
  params: Promise<{ id: number }>;
}
async function EditTicket({ params }: Props) {
  const { id } = await params;
  const response: any = await getTicketById(id!);
  if (!response.success) {
    return <ErrorMessage error={response.message} />;
  }
  return (
    <div>
      <PageTitle title="Edit Ticket" />
      <TicketForm initialValues={response.data} formType="edit" />
    </div>
  );
}

export default EditTicket;
