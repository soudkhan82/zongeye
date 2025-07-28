"use server";
import supabase from "../config/supabase-config";
export const getCorporateDashData = async () => {
  const qry = supabase.from("complaints").select("*").limit(200);
  const { data, error } = await qry;

  if (error) throw new Error(error.message);
  const responseData = {
    totalTickets: data?.length,

    DIATickets: data?.filter((element) => element.Service_Type === "DIA")
      .length,
    DPLCTickets: data?.filter((element) => element.Service_Type === "DPLC")
      .length,
    PRITickets: data?.filter((element) => element.Service_Type === "PRI")
      .length,
    OtherTickets: 0,
  };
  return {
    success: true,
    message: "Success",
    data: responseData,
  };
};

export const getTicketCategoryCount = async () => {
  const { data, error } = await supabase.rpc("get_ticket_count_by_type");
  if (error) throw new Error(error.message);
  return {
    success: true,
    data: data,
  };
};

export const getTicketRegionCount = async () => {
  const { data, error } = await supabase.rpc("get_ticket_count_by_region");
  if (error) throw new Error(error.message);
  return {
    success: true,
    data: data,
  };
};

export const getAvgResolution = async () => {
  const { data, error } = await supabase.rpc("get_avg_resolution_duration");
  if (error) throw new Error(error.message);

  return {
    success: true,
    data: data,
  };
};
