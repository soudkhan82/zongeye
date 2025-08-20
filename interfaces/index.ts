import { string } from "zod";

export interface IUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin" | "vendor";
  isactive: boolean;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: number;
  Client: string;
  NMS: string;
  Service_Type: string;
  LMV: string;
  Last_Mile: string;
  Acc_Region: string;
  Source_City: string;
  Sink_City: string;
  Issue_CAT: string;
  Issue_Type: string;
  Complaint_Time: string;
  Customer_Intimation_Time: string;
  Resolution_Time: string;
  Resolution_duration: number;
  Issue_end: string;
  RCA: string;
  Reason: string;
  Status: "Open" | "Closed" | "WIP";
  Email_ref: string;
  Reason_delay: string;

  //run time properties
  user_data: IUser;
}

export interface Client {
  id: number;
  NMS_USER_LABEL: string;
  Client: string;
  BW: number;
  Deployment: string;
  Handover: string;
  Latitude: string;
  Longitude: string;
  ServiceType: string;
  Solution: string;
  ISP: string;
  SourceCity: string;
  VLAN: string;
  Sub_Region: string;
  Site_Latitude: string;
  Site_Longitude: string;
  Loc_Status: string;
  Sink_City: string;
  Comments: string;
  MSISDN: string;
  Region: string;
  Segment: string;
  Activation_Status: string;
  Acc_Region: string;
  GCSS_Scope: string;
  Location: string;
  CMPAK_ID: string;
  Business_Case_ID: string;
  LMV: string;
  Link_Modification: string;
  UniqueID: string;
  GoAhead: string;
  SiteOwner: string;
  SwitchLoc: string;
  WO: string;
  BW_Slab: string;
}

export interface BlogPost {
  id: number;
  title: string;
  description: string;
  image?: string;
  impact: string | undefined;
  created_at?: string;
}

export type RegionCount = {
  region: string;
  count: number;
};

export type ActionTypeCount = {
  action_type: string;
  count: number;
};

export type StatusCount = {
  status: string;
  count: number;
};
export interface ActionItem {
  id: number;
  status: string;
  title: string;
  regional_feedback: string;
  region: string;
  nomc_feedback: string;
  target_timeline: string;
  Tagged_departments: string[];
  lead_department: string;
  ActionType: string;
  description: string;
  created_at: string;
  image?: string | null;
}
export type NewActionItem = Omit<ActionItem, "id" | "created_at">;
export type UpdateActionItem = Partial<NewActionItem>;

export interface FuelModel {
  id: number;
  name: string;
  quantity: number;
  district: string;
  subregion: string;
  timeline: Date;
}
export interface SiteAccessRequest {
  id: number;
  approval_status: string;
  visitorCNIC: number;
  visitorName: string;
  title: string;
  description: string;
  visitDate: string;
  scope: string[];
  approvedBy: string;
  siteID: string;
  region: string;
  Approver_comments: string;
}

export interface FetchAvailabilityPointsRow {
  id: string;
  name: string;
  lat: number;
  lon: number;
  siteClassification: string; // cast to SiteClass below
  district: string | null;
  grid: string | null;
  subregion: string | null;
  avg_availability: number | null;
}

export interface GeoPoint {
  id: number;
  Name: string;
  Latitude: number;
  Longitude: number;

  SiteClassification: string;
  District: string;
  Address: string;
}

export interface VoiceTraffic {
  name: string;
  voice2gtraffic: number;
  voice3gtraffic: number;
  voltetraffic: number;
  voicerevenue: number;
  longitude: number;
  latitude: number;
  siteclassification: string;
  subregion: string;
  address: string;
  district: string;
}
export interface DataTraffic {
  name: string;
  data3gtraffic: number;
  data4gtraffic: number;
  datarevenue: number;
  longitude: number;
  latitude: number;
  siteclassification: string;
  subregion: string;
  address: string;
  district: string;
}

export interface VoiceStats {
  distinct_sites: number;
  avg_voice2g: number | null;
  avg_voice3g: number | null;
  avg_voicelte: number | null;
  total_voice_revenue: number | null;
  avg_voice_revenue: number | null;
}

export interface DataStats {
  distinct_sites: number;
  avg_data3g: number | null;
  avg_data4g: number | null;
  total_data_revenue: number | null;
  avg_data_revenue: number | null;
}

export interface sslSite {
  name: string;
  district: string;
  grid: string;
  address: string | null;
  Siteclassification: string;
  subregion: string | null;
  latitude: number;
  longitude: number;
}

export interface siteVitals {
  Month: string;
  Name: string;
  voice2GTrafficE: number;
  voice3GTrafficE: number;
  voLTEVoiceTrafficE: number;
  data3GTrafficGB: number;
  data4GTrafficGB: number;
  MFULVoiceRev: number;
  MFULDataRev: number;
  MFULTotalRev: number;
}

//final and clean version for traffic
