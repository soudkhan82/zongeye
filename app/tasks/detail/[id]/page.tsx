import { getActionById } from "@/app/actions/tasks";
import ErrorMessage from "@/components/ui/error-message";

import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActionItem } from "@/interfaces";

import { Button } from "@/components/ui/button";

import Link from "next/link";

interface Props {
  params: Promise<{ id: number }>;
}

async function TaskDetailsPage({ params }: Props) {
  const { id } = await params;
  const response: ApiResponse = await getActionById(id!);
  const actionitem: ActionItem = response.data;

  if (!response.success) {
    return <ErrorMessage error={response.message} />;
  }
  return (
    <div className=" w-full flex flex-col min-h-screen items-center justify-center bg-gray-100 p-4">
      <h1 className="text-xl">Details</h1>

      <Card className="w-2/3  shadow-xl rounded-2xl bg-white">
        <CardHeader>
          <CardTitle className="text-2xl">{actionitem.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <p>
            <span className="font-semi-bold text-blue-500">Timeline : </span>{" "}
            {actionitem.target_timeline}
          </p>{" "}
          <p>
            <span className="font-semi-bold text-blue-500">
              Tagged Depts :{" "}
            </span>{" "}
            {actionitem.Tagged_departments.join("---")}
          </p>
          <p>
            <span className="font-semi-bold text-blue-500">Type : </span>{" "}
            {actionitem.ActionType}
          </p>
          <p>
            <span className="font-semi-bold text-blue-500">Description : </span>{" "}
            {actionitem.description}
          </p>
          <p>
            <span className="font-semi-bold text-blue-500">NOMC Feedback </span>{" "}
            {actionitem.nomc_feedback}
          </p>
          {actionitem.image ? (
            <img src={actionitem.image} alt="" className="w-175 mt-2"></img>
          ) : (
            <div className="w-full aspect-[16/9] bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
              No image provided
            </div>
          )}
          <p>
            <span className="font-semi-bold text-blue-500">
              Lead Department{" "}
            </span>{" "}
            {actionitem.lead_department}
          </p>
          <p>
            <span className="font-semi-bold text-blue-500">
              Region Feedback{" "}
            </span>{" "}
            {actionitem.regional_feedback}
          </p>
        </CardContent>
      </Card>
      <div className="mt-10">
        <Button>
          <Link href={"/tasks"}>Goto List</Link>
        </Button>
      </div>
    </div>
  );
}

export default TaskDetailsPage;
