"use client";
import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { z } from "zod";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createNewTicket, editTicketByid } from "@/app/actions/complaints";
import {
  getTicketFormClients,
  getTicketFormLinks,
} from "@/app/actions/clients";
import {
  Acc_Region,
  Issue_CAT,
  Issue_end,
  Issue_Type,
  LastMile,
  ServiceType,
  Status,
} from "@/constants";

interface TicketFormProps {
  initialValues?: any;
  formType?: "add" | "edit";
}

function TicketForm({ initialValues, formType }: TicketFormProps) {
  const [Loading, setLoading] = React.useState(false);
  const [links, setLinks] = useState<{ id: number; NMS_USER_LABEL: string }[]>(
    []
  );
  const [clients, setClients] = useState<{ id: number; Client: string }[]>([]);
  const router = useRouter();
  const formSchema = z.object({
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
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      Client: "",
      NMS: "",
      Service_Type: "",
      LMV: "",
      Last_Mile: "",
      Acc_Region: "",
      Source_City: "",
      Sink_City: "",
      Issue_CAT: "",
      Complaint_Time: "",
      Resolution_Time: "",
      Resolution_duration: 0,
      Issue_end: "",
      RCA: "",
      Reason: "",
      Status: "",
      Email_ref: "",
      Reason_delay: "",
    },
  });

  const serviceType = form.watch("Service_Type");
  const region = form.watch("Acc_Region");

  const fetchLinksData = async () => {
    try {
      setLoading(true);
      const linksData = await getTicketFormLinks(serviceType, region);
      // console.log(linksData);
      if (Array.isArray(linksData)) {
        const cleanedData = linksData.map((item) => ({
          id: Number(item.id),
          NMS_USER_LABEL: String(item.NMS_USER_LABEL),
        }));
        setLinks(cleanedData);
        console.log(cleanedData);
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientsData = async () => {
    try {
      setLoading(true);
      const ClientData = await getTicketFormClients(serviceType, region);

      if (Array.isArray(ClientData)) {
        const cleanedData = ClientData.map((item) => ({
          id: Number(item.id),
          Client: String(item.Client),
        }));
        setClients(cleanedData);
        console.log(cleanedData);
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchLinksData();
    fetchClientsData();
  }, [serviceType, region]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    let response = null;
    const start_time = new Date(values.Complaint_Time);
    const end_time = new Date(values.Resolution_Time);
    const resolution =
      (end_time.getTime() - start_time.getTime()) / (1000 * 60);
    const resolution_mins = parseFloat(resolution.toFixed(2));
    try {
      setLoading(true);
      if (formType === "add") {
        response = await createNewTicket({
          ...values,
          Resolution_duration: resolution_mins,
        });
      } else {
        response = await editTicketByid({
          ticket_id: initialValues.id,
          payload: { ...values, Resolution_duration: resolution_mins },
        });
      }
      if (response.success) {
        toast.success(response.message);
        router.push("/corporate/tickets");
      } else {
        toast.error(response.message);
      }
    } catch (e:any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialValues) {
      Object.keys(initialValues).forEach((key: any) => {
        form.setValue(key, initialValues[key]);
      });
    }
  }, [initialValues]);
  return (
    <div className="w-full p-3 mt-2">
      <div className="mt-3"></div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 items-center gap-5">
            <FormField
              control={form.control}
              name="Client"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Client ID <b className="text-xs"> {field.value} </b>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Link..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="text-sm">
                      {clients.map((item) => (
                        <SelectItem key={item.id} value={item.Client}>
                          {item.Client}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Service_Type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Service Type :<b> {field.value} </b>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Service" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ServiceType.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 items-center gap-5">
            <FormField
              control={form.control}
              name="NMS"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    NMS Links ID <b className="text-xs"> {field.value} </b>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Link..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="text-sm">
                      {links.map((item) => (
                        <SelectItem key={item.id} value={item.NMS_USER_LABEL}>
                          {item.NMS_USER_LABEL}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Acc_Region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Account Region: <b> {field.value} </b>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Region" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Acc_Region.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Last_Mile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Last Mile : <b>{field.value}</b>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Last Mile" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LastMile.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 items-center gap-5">
            <FormField
              control={form.control}
              name="Issue_CAT"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Issue Cat : <b>{field.value}</b>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Issue CAT" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Issue_CAT.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="LMV"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Source_City"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source City</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Sink_City"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sink City</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Issue_Type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Issue Type : <b>{field.value}</b>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Issue" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Issue_Type.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Complaint_Time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Complaint Time : <b>{field.value}</b>{" "}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder=""
                      {...field}
                      type="datetime-local"
                    ></Input>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 items-center gap-5">
            <FormField
              control={form.control}
              name="Resolution_Time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Resolution Time: <b>{field.value}</b>{" "}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder=""
                      {...field}
                      type="datetime-local"
                    ></Input>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Resolution_duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resolution Duration</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 items-center gap-5">
            <FormField
              control={form.control}
              name="Issue_end"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Issue End <b>{field.value}</b>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Issue End" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Issue_end.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="RCA"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RCA</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Status <b>{field.value}</b>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Status.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 items-center gap-5">
            <FormField
              control={form.control}
              name="Email_ref"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Reference</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Reason_delay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delay Reason</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="Reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Detailed Reason</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <Button type="submit" className="ml-5" disabled={Loading}>
              {formType === "add" ? "Add" : "Update"}
            </Button>
          </div>
        </form>
      </Form>
    </div>  
  );
}

export default TicketForm;
