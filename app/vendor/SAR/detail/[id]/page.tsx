import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActionItem, SiteAccessRequest } from "@/interfaces";

import { Button } from "@/components/ui/button";

import Link from "next/link";
import { getSiteAccessRequestById } from "@/app/actions/vendor";
import ErrorMessage from "@/components/ui/error-message";

interface Props {
  params: Promise<{ id: number }>;
}
async function SARDetailPage({ params }: Props) {
  const { id } = await params;
  const response: any = await getSiteAccessRequestById(id!);
  const sarItem: SiteAccessRequest = response.data;
  if (!response.success) {
    return <ErrorMessage error={response.message} />;
  }
  console.log(response.data);
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gray-100 p-4">
      <h1 className="text-xl">Site Access Request Details</h1>

      <Card className="w-full max-w-3xl shadow-xl rounded-2xl bg-white">
        <CardHeader>
          <CardTitle className="text-2xl">{sarItem.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <p>
            <span className="font-semi-bold text-blue-500">Visit Date : </span>{" "}
            {sarItem.visitDate}
          </p>{" "}
          <p>
            <span className="font-semi-bold text-blue-500">Scope of Work</span>{" "}
            {sarItem.scope.join("---")}
          </p>
          <p>
            <span className="font-semi-bold text-blue-500">Approved By </span>{" "}
            {sarItem.approvedBy}
          </p>
          <p>
            <span className="font-semi-bold text-blue-500">Description : </span>{" "}
            {sarItem.description}
          </p>
          <p>
            <span className="font-semi-bold text-blue-500">Visitor NIC : </span>{" "}
            {sarItem.visitorCNIC}
          </p>
          <p>
            <span className="font-semi-bold text-blue-500">
              Visitor Name :{" "}
            </span>{" "}
            {sarItem.visitorName}
          </p>
          <p>
            <span className="font-semi-bold text-blue-500">Region : </span>{" "}
            {sarItem.region}
          </p>
          <p>
            <span className="font-semi-bold text-blue-500">
              Approver Comments :{" "}
            </span>{" "}
            {sarItem.Approver_comments}
          </p>
        </CardContent>
      </Card>
      <div className="mt-10">
        <Button>
          <Link href={"/vendor/SAR/"}>Goto List</Link>
        </Button>
      </div>
    </div>
  );
}

export default SARDetailPage;
