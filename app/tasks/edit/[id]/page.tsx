import { getActionById } from "@/app/actions/tasks";
import ErrorMessage from "@/components/ui/error-message";
import PageTitle from "@/components/ui/page-title";
import React from "react";
import ActionItemForm from "../../components/ActionItemForm";

interface Props {
  params: Promise<{ id: number }>;
}

async function EditActionItem({ params }: Props) {
  const { id } = await params;
  const response = await getActionById(id!);
  if (!response.success) {
    return <ErrorMessage error={response.message} />;
  }

  return (
    <div>
      <PageTitle title="Edit Action" />
      <ActionItemForm initialValues={response.data} formType="edit" />
    </div>
  );
}

export default EditActionItem;
