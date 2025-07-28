"use client";
import { Button } from "@/components/ui/button";
import PageTitle from "@/components/ui/page-title";
import Link from "next/link";
import React, { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";

import { getTicketsAll } from "@/app/actions/complaints";
import toast from "react-hot-toast";
import Loader from "@/components/ui/loader";
import { Ticket } from "@/interfaces";
import ErrorMessage from "@/components/ui/error-message";
const columns = [
  "Ticket ID",
  "NMS",
  "Client",
  "Issue_Type",
  "Status",
  "Complaint_Time",
  "Resolution (mins)",
  "Service Type",

  "Edit Ticket",
];

function TicketsList() {
  const router = useRouter();

  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [submittedSearch, setSubmittedSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);

  const fetchData = async (searchterm: string, page: number) => {
    let message = "";
    try {
      setLoading(true);
      const { data, total_records } = await getTicketsAll(searchterm, page);
      setTickets(data);
      setTotal(total_records);
    } catch (error: unknown) {
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === "string") {
        message = error;
      }

      if (error) toast.error(message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData(submittedSearch, page);
  }, [submittedSearch, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSubmittedSearch(search);
  };
  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          placeholder="Enter Client Name..."
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
        <div className="flex items-center justify-between">
          <PageTitle title="Tickets" />
          <Button>
            <Link href="../corporate/tickets/add">Add Ticket</Link>
          </Button>
        </div>
        {loading && <Loader />}
        {!loading && tickets.length > 0 && (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket: Ticket) => (
                  <TableRow key={ticket.id} className="p-2">
                    <TableCell>{ticket.id}</TableCell>
                    <TableCell>{ticket.NMS}</TableCell>
                    <TableCell>{ticket.Client}</TableCell>

                    <TableCell>{ticket.Issue_Type}</TableCell>
                    <TableCell>{ticket.Status}</TableCell>
                    <TableCell className="text-xs">
                      {ticket.Complaint_Time}
                    </TableCell>
                    <TableCell className="text-xs">
                      {ticket.Resolution_duration}
                    </TableCell>
                    <TableCell className="text-xs">
                      {ticket.Service_Type}
                    </TableCell>

                    <TableCell
                      data-label="actions"
                      className="flex gap-5 items-center"
                    >
                      <Button
                        variant={"outline"}
                        size={"icon"}
                        className="cursor-pointer"
                        onClick={() =>
                          router.push(`/corporate/tickets/edit/${ticket.id}`)
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {!loading && tickets.length === 0 && (
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
          disabled={tickets.length < 5}
        >
          NEXT
        </Button>
        <p>Total Records are {total} </p>
      </div>
    </div>
  );
}

export default TicketsList;
