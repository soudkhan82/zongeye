"use client";

import { Button } from "@/components/ui/button";
import PageTitle from "@/components/ui/page-title";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Loader from "@/components/ui/loader";
import { getSiteAccessRequestAll } from "@/app/actions/vendor";
import { ActionItem, SiteAccessRequest } from "@/interfaces";
import ErrorMessage from "@/components/ui/error-message";
import { BookCheckIcon, BookOpen, BookOpenText, Edit2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const columns = [
  "SAR ID",
  "Title",
  "Status",
  "Visit Date",
  "Region",
  "Edit SAR",
  "Details",
];
function SiteAccessRequestsList() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [submittedsearch, setSubmittedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const fetchData = async (searterm: string, page: number) => {
    try {
      setLoading(true);
      const { data, total_records } = await getSiteAccessRequestAll(
        searterm,
        page
      );
      setRequests(data);
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
          placeholder="Enter Request..."
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
          <PageTitle title="Site Access Requests" />
          <Button>
            <Link href="/vendor/SAR/add">Add Ticket</Link>
          </Button>
        </div>
        {loading && <Loader />}
        {!loading && requests.length > 0 && (
          <div className="p-5">
            <Table className="font-sans text-gray-800 text-md">
              <TableHeader className=" bg-blue-300">
                <TableRow>
                  {columns.map((col) => (
                    <TableHead
                      key={col}
                      className="font-semibold text-gray-800"
                    >
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request: SiteAccessRequest) => (
                  <TableRow key={request.id} className="p-2">
                    <TableCell>
                      <Link href={`/vendor/SAR/detail/${request.id}`}>
                        {request.id}
                      </Link>
                    </TableCell>

                    <TableCell>{request.title}</TableCell>
                    <TableCell>{request.approval_status}</TableCell>
                    <TableCell>{request.visitDate}</TableCell>

                    <TableCell>{request.region}</TableCell>

                    <TableCell
                      data-label="actions"
                      className="flex gap-5 items-center"
                    >
                      <Button
                        variant={"outline"}
                        size={"icon"}
                        className="cursor-pointer"
                        onClick={() =>
                          router.push(`/vendor/SAR/edit/${request.id}`)
                        }
                      >
                        <Edit2 size={34} />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Link href={`/vendor/SAR/detail/${request.id}`}>
                        <BookOpenText size={23} />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {!loading && requests.length === 0 && (
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
          disabled={requests.length < 5}
        >
          NEXT
        </Button>
        <p>Total Records are {total} </p>
      </div>
    </div>
  );
}

export default SiteAccessRequestsList;
