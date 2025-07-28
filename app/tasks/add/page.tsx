import React from "react";
import ActionItemForm from "../components/ActionItemForm";

function AddSndPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h3 className="text-2xl font-bold mb-4">Add New Record</h3>
      <ActionItemForm formType="add" />
    </div>
  );
}

export default AddSndPage;
