"use client";
import { createNewSiteAccessRequest, editSARById } from "@/app/actions/vendor";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Acc_Region, Approval_Status, SAFScope } from "@/constants";
import usersGlobalStore, {
  IUsersGlobalStore,
} from "@/store/users-global-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import z from "zod";

interface SAFProps {
  initialValues?: any;
  formType?: "add" | "edit";
}
function SAForm({ initialValues, formType }: SAFProps) {
  const [loading, setLoading] = useState(false);
  const { user } = usersGlobalStore() as IUsersGlobalStore;
  const router = useRouter();
  const currentrole = user?.role;
  const formSchema = z.object({
    title: z.string().min(4, "Atleast 04 letters"),
    description: z.string(),
    visitDate: z.string(),
    scope: z.array(z.string().min(1, "At least one work")),
    approvedBy: z.string(),
    Approver_comments: z.string(),
    visitorName: z.string(),
    visitorCNIC: z.string().min(1, "Required"),
    approval_status: z.string(),
    region: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      visitDate: "",
      scope: [],
      approvedBy: "",

      Approver_comments: "",
      visitorName: "",
      visitorCNIC: "",
      approval_status: "Submitting",
      region: "",
    },
  });

  useEffect(() => {
    if (initialValues) {
      Object.keys(initialValues).forEach((key: any) => {
        form.setValue(key, initialValues[key]);
      });
    }
  }, [initialValues]);

  const onScopeChange = (scope: string) => {
    try {
      const prevValues = form.getValues("scope");
      if (prevValues.includes(scope)) {
        form.setValue(
          "scope",
          prevValues.filter((d) => d !== scope)
        );
      } else {
        form.setValue("scope", [...prevValues, scope]);
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    let response = null;
    const approval_status = values.approval_status;

    try {
      setLoading(true);
      if (formType == "add") {
        response = await createNewSiteAccessRequest({
          ...values,
        });
      } else {
        if (approval_status === "Approved") {
          response = await editSARById({
            request_id: initialValues.id,
            payload: { ...values, approvedBy: user?.name },
          });
        } else {
          response = await editSARById({
            request_id: initialValues.id,
            payload: { ...values },
          });
        }
      }
      if (response.success) {
        toast.success(response.message);
        router.push("/vendor/SAR");
      } else {
        toast.error(response.message);
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center p-3 m-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 max-w-xl"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Request Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          ></FormField>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
              </FormItem>
            )}
          ></FormField>
          <FormField
            control={form.control}
            name="region"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Region <b className="text-xs"> {field.value} </b>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Region..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="text-sm">
                    {Acc_Region.map((item) => (
                      <SelectItem key={item.label} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <h3>Scope of Work</h3>
          <hr />
          <div className="flex flex-wrap gap-7">
            {SAFScope.map((scope) => {
              const prevValues = form.watch("scope");
              const isChecked = prevValues.includes(scope.value);
              return (
                <div className="flex gap-5 items-center" key={scope.value}>
                  <h1 className="text-sm">{scope.label}</h1>
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => onScopeChange(scope.value)}
                  />
                </div>
              );
            })}
          </div>
          <FormField
            control={form.control}
            name="approval_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Approval <b className="text-xs"> {field.value} </b>
                </FormLabel>
                <Select
                  disabled={currentrole === "vendor"}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Region..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="text-sm">
                    {Approval_Status.map((item) => (
                      <SelectItem key={item.label} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="visitDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visit Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="visitorCNIC"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visitor CNIC</FormLabel>
                <FormControl>
                  <Input
                    placeholder="12345-1234567-1"
                    {...field}
                    pattern="\d{5}-\d{7}-\d{1}"
                    maxLength={15}
                    required
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="visitorName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visitor Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="Approver_comments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Approver Comments</FormLabel>
                <FormControl>
                  <Textarea {...field} disabled={user?.role === "vendor"} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="approvedBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Approved By</FormLabel>
                <FormControl>
                  <Textarea {...field} disabled={user?.role === "vendor"} />
                </FormControl>
              </FormItem>
            )}
          />
          <div>
            <Button type="submit" className="ml-5" disabled={loading}>
              {formType === "add" ? "Add" : "Update"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default SAForm;
