import React from "react";
import TicketForm from "../components/ticketForm";
import PageTitle from "@/components/ui/page-title";

async function AddTicket() {
  return (
    <div>
      <PageTitle title="Add Ticket" />
      <TicketForm initialValues={undefined} formType="add" />
    </div>
  );
}

export default AddTicket;
