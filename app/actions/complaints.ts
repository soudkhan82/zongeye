"use server";
import { Ticket } from "@/interfaces";
import supabase from "../config/supabase-config";
import { complaintPayload } from "./types";
const PAGE_SIZE = 5;

export const getTicketsbyClient = async (client: string) => {
  const { data, error } = await supabase
    .from("complaints")
    .select("*")
    .ilike("Client", `{% ${client}}`);
  if (error) throw error;
  return {
    success: true,
    data: data,
  };
};

export const createNewTicket = async (payload: complaintPayload) => {
  const { error } = await supabase.from("complaints").insert(payload);

  if (error) throw error;
  return {
    success: true,
    message: "Ticket Successfully created",
    //we do not need to return the data here , since its a post operation to store the data
  };
};

export const getTicketsAll = async (
  searchterm: string,
  page: number
): Promise<{ data: Ticket[]; total_records: number }> => {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  let query = supabase
    .from("complaints")
    .select("*", { count: "exact" })
    .range(from, to);

  if (searchterm) {
    query = query.ilike("Client", `%${searchterm}%`);
  }
  const { data, count, error } = await query;
  if (error || data.length === 0) throw error || new Error("No Records");
  return { data: data, total_records: count! };
};

export const getTicketById = async (id: number) => {
  try {
    const { data, error } = await supabase
      .from("complaints")
      .select("*")
      .eq("id", id);
    if (error || data.length === 0)
      throw error || new Error("Ticket not Found");
    return {
      success: true,
      data: data[0],
    };
  } catch (error: unknown) {
    let message = "";
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    }
    return {
      success: false,
      message: message,
    };
  }
};

export const editTicketByid = async ({
  ticket_id,
  payload,
}: {
  ticket_id: number;
  payload: complaintPayload;
}) => {
  const { error } = await supabase
    .from("complaints")
    .update(payload)
    .eq("id", ticket_id);
  if (error) throw error;

  return {
    success: true,
    message: "Link updated successfully",
  };

  // catch (error: unknown) {
  //   let message = "";
  //   if (error instanceof Error) {
  //     message = error.message;
  //   } else if (typeof error === "string") {
  //     message = error;
  //   }
  // }
};

export const deleteTicketByid = async (ticketid: number) => {
  try {
    const { error } = await supabase
      .from("tickets")
      .delete()
      .eq("id", ticketid);
    if (error) throw error;
    return {
      success: true,
      message: "Ticket Deleted successfully",
    };
  } catch (error: unknown) {
    let message = "";
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    }
    return {
      success: false,
      message: message,
    };
  }
};
