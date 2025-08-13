import z from "zod";
export const ticketformSchema = z.object({
  Client: z.string(),
  NMS: z.string(),
  Service_Type: z.string(),
  LMV: z.string(),
  Last_Mile: z.string(),
  Acc_Region: z.string(),
  Source_City: z.string().optional(),
  Sink_City: z.string().optional(),
  Issue_CAT: z.string(),
  Issue_Type: z.string(),
  Complaint_Time: z.string(),
  Resolution_Time: z.string(),
  Resolution_duration: z.number(),
  Issue_end: z.string(),
  RCA: z.string(),
  Reason: z.string(),
  Status: z.string(),
  Email_ref: z.string(),
  Reason_delay: z.string(),
});

export type complaintPayload = z.infer<typeof ticketformSchema>;

export const ActionItemformSchema = z.object({
  title: z.string(),
  status: z.string(),
  regional_feedback: z.string(),
  nomc_feedback: z.string(),
  target_timeline: z.string(),
  Tagged_departments: z.array(z.string()).min(1, "At least one department"),
  lead_department: z.string(),
  ActionType: z.string(),
  region: z.string(),
  description: z.string(),
});

export type ActionItemPayload = z.infer<typeof ActionItemformSchema>;

export const SARformSchema = z.object({
  title: z.string().min(4, "Atleast 04 letters"),
  description: z.string(),
  visitDate: z.string(),
  scope: z.array(z.string().min(1, "At least one work")),
  approvedBy: z.string(),
  Approver_comments: z.string(),
  visitorName: z.string(),
  visitorCNIC: z.number(),
  approval_status: z.string(),
  region: z.string(),
});

export type SARItemPayload = z.infer<typeof SARformSchema>;
