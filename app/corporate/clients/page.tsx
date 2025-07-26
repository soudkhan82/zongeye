"use client";
import { getlinksByClient } from "@/app/actions/clients";

import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/loader";
import PageTitle from "@/components/ui/page-title";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Client } from "@/interfaces";
import ErrorMessage from "@/components/ui/error-message";
import { useRouter } from "next/navigation";
const columns = ["ID", "NMS ID", "Client", "Service Type"];

function CorpClientsList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  //const limit = 10;
  const router = useRouter();
  const loadData = async (searchTerm: string, page: number) => {
    let message = "";
    try {
      setLoading(true);
      const { data, total_records } = await getlinksByClient(searchTerm, page);
      setClients(data);
      setTotal(total_records);
    } catch (err: unknown) {
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === "string") {
        message = err;
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(submittedSearch, page);
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
          <PageTitle title="Corporate Links" />
          <Button>
            <Link href="/">Goto...</Link>
          </Button>
        </div>
        {loading && <Loader />}
        {!loading && clients.length > 0 && (
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
                {clients.map((client: Client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <Link href={`/corporate/clients/${client.id}`}>
                        {client.id}
                      </Link>
                    </TableCell>
                    <TableCell>{client.NMS_USER_LABEL}</TableCell>
                    <TableCell>{client.Client}</TableCell>

                    <TableCell>{client.ServiceType}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {!loading && clients.length === 0 && (
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
          disabled={clients.length < 5}
        >
          NEXT
        </Button>
        <p>Total Records are {total}</p>
      </div>
    </div>
  );
}

export default CorpClientsList;
