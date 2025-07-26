export const ServiceType = [
  { value: "DIA", label: "DIA" },
  { value: "DPLC", label: "DPLC" },
  { value: "SIP", label: "SIP" },
  { value: "PRI", label: "PRI" },
  { value: "IPLC", label: "IPLC" },
  { value: "TURBONET", label: "TURBONET" },
];
export const Acc_Region = [
  { value: "North", label: "North" },
  { value: "Central", label: "Central" },
  { value: "South", label: "South" },
];
export enum taskStatus {
  Open = "OPEN",
  Closed = "CLOSED",
  InProgress = "InProgress",
}
export const Status = [
  { value: "Open", label: "Open" },
  { value: "Closed", label: "Closed" },
  { value: "In-Progress", label: "In-Progress" },
];
export const LastMile = [
  { value: "Wired", label: "Wired" },
  { value: "Wireless", label: "Wireless" },
  { value: "CustomerOwn", label: "CustomerOwn" },
];
export const Issue_CAT = [
  { value: "Outage", label: "Outage" },
  { value: "Degradation", label: "Degradation" },
];
export const Issue_Type = [
  { value: "Service Outage", label: "Service Outage" },
  { value: "Latency/Packet Loss", label: "Latency/Packet Loss" },
  { value: "Slow Browsing", label: "Slow Browsing" },
  { value: "Outgoing Call", label: "Outgoing Call" },
];
export const Issue_end = [
  { value: "Customer", label: "Customer" },
  { value: "Vendor", label: "Vendor" },
  { value: "Optical Transmission", label: "Optical Transmission" },
  { value: "ISP", label: "ISP" },
  { value: "CS Core", label: "CS Core" },
  { value: "PS Core", label: "PS Core" },
  { value: "CDN provider", label: "CDN provider" },
];

export const Tagged_departments = [
  { value: "NOMC", label: "NOMC" },
  { value: "South", label: "South" },
  { value: "North", label: "North" },
  { value: "Central", label: "Central" },
  { value: "NP", label: "NP" },
  { value: "NC", label: "NC" },
];

export const lead_department = [
  { value: "NOMC", label: "NOMC" },
  { value: "South", label: "South" },
  { value: "North", label: "North" },
  { value: "Central", label: "Central" },
  { value: "NP", label: "NP" },
  { value: "NC", label: "NC" },
];
export const ActionType = [
  { value: "MOAM", label: "MOAM" },
  { value: "S&D", label: "S&D" },
  { value: "CTO", label: "CTO" },
  { value: "Internal_Audit", label: "Internal_Audit" },
  { value: "Compliance", label: "Compliance" },
];

//Vendor SAR Approval
export const Approval_Status = [
  { value: "Submitting", label: "Submitting" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
];

export const SAFScope = [
  { value: "DG Movement", label: "DG Movement" },
  { value: "PM", label: "PM" },
  { value: "CM", label: "CM" },
  { value: "Telco Equipment", label: "Telco Equipment" },
  { value: "Civil Works", label: "Civil Works" },
];
