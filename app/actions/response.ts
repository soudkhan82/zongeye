import { Client } from "@/interfaces";

export interface clientApiResponse {
  success: boolean;
  data: Client;
  message?: string;
}

export interface DashResponse {
  success: boolean;
  data: number[];
  message: string;
}
