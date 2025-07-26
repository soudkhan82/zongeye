import React from "react";
import SAForm from "../components/SAForm";

function AddSARPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h3 className="text-2xl font-bold mb-4">Add New Record</h3>
      <SAForm formType="add" />
    </div>
  );
}

export default AddSARPage;
