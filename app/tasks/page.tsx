"use client";

import { Button } from "@/components/ui/button";
import PageTitle from "@/components/ui/page-title";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Loader from "@/components/ui/loader";
import { getActionsAll } from "../actions/tasks";
import { ActionItem } from "@/interfaces";
import ErrorMessage from "@/components/ui/error-message";
import { Edit2 } from "lucide-react";

const columns = [
  "ActionID",
  "Type",
  "Title",
  "Region",
  "Target",
  "Status",
  "Lead Dept",

  "Edit",
];

function SndList() {
  const router = useRouter();
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [submittedsearch, setSubmittedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchData = async (searchterm: string, page: number) => {
    try {
      setLoading(true);
      const { data, total_records } = await getActionsAll(searchterm, page);
      setActions(data);
      setTotal(total_records);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData(submittedsearch, page);
  }, [submittedsearch, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSubmittedSearch(search);
  };
  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-2 mb-4 m-5">
        <input
          placeholder="Enter Action Item..."
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          Search
        </button>
      </form>
      <div>
        <div className="flex items-center justify-between p-5">
          <PageTitle title="Engineering Tasks" />
          <Button>
            <Link href="./tasks/add">Add Ticket</Link>
          </Button>
        </div>
        {loading && <Loader />}
        {!loading && actions.length > 0 && (
          <div className="p-5">
            <Table>
              <TableHeader className=" bg-pink-300">
                <TableRow>
                  {columns.map((col) => (
                    <TableHead
                      key={col}
                      className="font font-extrabold font-stretch-normal"
                    >
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {actions.map((action: ActionItem) => (
                  <TableRow key={action.id} className="p-2">
                    <TableCell>
                      <Link href={`/tasks/detail/${action.id}`}>
                        {action.id}
                      </Link>
                    </TableCell>
                    <TableCell>{action.ActionType}</TableCell>
                    <TableCell>{action.title}</TableCell>
                    <TableCell>{action.region}</TableCell>
                    <TableCell>{action.target_timeline}</TableCell>
                    <TableCell>{action.status}</TableCell>
                    <TableCell>{action.lead_department}</TableCell>

                    <TableCell
                      data-label="actions"
                      className="flex gap-5 items-center"
                    >
                      <Button
                        variant={"outline"}
                        size={"icon"}
                        className="cursor-pointer"
                        onClick={() => router.push(`/tasks/edit/${action.id}`)}
                      >
                        <Edit2 size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {!loading && actions.length === 0 && (
          <div>
            <ErrorMessage error="No Records" />
          </div>
        )}
      </div>
      <div className="flex gap-2 mt-9">
        <Button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span className="px-3 py-1">Page {page}</span>
        <Button
          onClick={() => setPage((p) => p + 1)}
          disabled={actions.length < 5}
        >
          NEXT
        </Button>
        <p>Total Records are {total} </p>
      </div>
    </div>
  );
}

export default SndList;
