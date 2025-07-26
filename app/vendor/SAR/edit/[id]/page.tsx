import { getSiteAccessRequestById } from "@/app/actions/vendor";
import ErrorMessage from "@/components/ui/error-message";
import PageTitle from "@/components/ui/page-title";
import React from "react";
import SAForm from "../../components/SAForm";

interface Props {
  params: Promise<{ id: number }>;
}
async function EditSARPage({ params }: Props) {
  const { id } = await params;
  const response: any = await getSiteAccessRequestById(id!);
  if (!response.success) {
    return <ErrorMessage error={response.message} />;
  }

  return (
    <div>
      <PageTitle title="Edit Site Access Request" />
      <SAForm initialValues={response.data} formType="edit" />
    </div>
  );
}

export default EditSARPage;
