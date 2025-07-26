"use client";
import {
  getAvgResolution,
  getCorporateDashData,
} from "@/app/actions/dashboard";

import DashboardCard from "@/components/ui/Dashboard-card";

import Loader from "@/components/ui/loader";

import React from "react";
import toast from "react-hot-toast";
import TicketCatChart from "./components/TicketCatChart";
import TicketRegionChart from "./components/TicketRegionChart";
import TicketResolution from "./components/TicketResolution";

function CorporateDashboard() {
  const initialtickets = {
    totalTickets: 0,
    DIATickets: 0,
    DPLCTickets: 0,
    PRITickets: 0,
    OtherTickets: 0,
  };

  const [count, setCount] = React.useState(initialtickets);
  const [loading, setLoading] = React.useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);

      const response: any = await getCorporateDashData();
      if (response.success) {
        setCount(response.data);
        console.log(response.data);
      } else {
        throw new Error(response.message);
      }
    } catch (e: any) {
      toast.error(e.message);
      setCount(initialtickets);
    } finally {
      setLoading(false);
    }
  };
  React.useEffect(() => {
    fetchTickets();
  }, []);
  return (
    <div>
      {loading && (
        <div>
          <Loader />
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-4 gap-2">
          <DashboardCard
            title="Total Tickets"
            value={count.totalTickets}
            caption="Total Tickets"
          />
          <DashboardCard
            title="DIA Tickets"
            value={count.DIATickets}
            caption={`updated ${new Date().toLocaleDateString()}`}
          />
          <DashboardCard
            title="DPLC Tickets"
            value={count.DPLCTickets}
            caption={`updated ${new Date().toLocaleDateString()}`}
          />
          <DashboardCard
            title="PRI Tickets"
            value={count.PRITickets}
            caption={`updated ${new Date().toLocaleDateString()}`}
          />
          <div className="flex gap-4">
            <div className="flex flex-row">
              <TicketCatChart />
              <TicketRegionChart />
              <TicketResolution />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CorporateDashboard;
