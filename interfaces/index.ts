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
}

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
  longitude: number;
  latitude: number;
  siteclassification: string;
  subregion: string;
  address: string;
}
export interface Availability {
  id: number;
  month: string;
  SITE_ID: string;
  SubRegion: string;
  Region: string;
  CAT: string;
  Availability: number;
}
