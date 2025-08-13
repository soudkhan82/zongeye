"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Acc_Region,
  ActionType,
  lead_department,
  Status,
  Tagged_departments,
} from "@/constants";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  createNewActionItem,
  editActionByid,
  uploadImage,
} from "@/app/actions/tasks";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ActionItem } from "@/interfaces";
import toast from "react-hot-toast";

interface ActionItemProps {
  initialValues?: ActionItem;
  formType?: "add" | "edit";
}

function ActionItemForm({ initialValues, formType }: ActionItemProps) {
  const [loading, setLoading] = React.useState(false);
  const [file, setFile] = useState<File | null>(null);
  // const [preview, setPreview] = React.useState<string | null>(
  //   initialValues?.image ?? null
  // );
  const router = useRouter();
  const formSchema = z.object({
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
    image: z.string().url().optional().nullable(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      regional_feedback: "",
      nomc_feedback: "",
      target_timeline: "",
      Tagged_departments: [],
      lead_department: "",
      ActionType: "",
      region: "",
      status: "",
      image: null,
    },
  });
  useEffect(() => {
    if (initialValues) {
      form.reset({
        ...initialValues,
        image: initialValues.image ?? null,
      });

      // Object.keys(initialValues).forEach((key: any) => {
      //   form.setValue(key, initialValues[key]);
      // });
    }
  }, [initialValues, form]);

  const onTagChange = (deparment: string) => {
    try {
      const prevValues = form.getValues("Tagged_departments");
      if (prevValues.includes(deparment)) {
        form.setValue(
          "Tagged_departments",
          prevValues.filter((d) => d !== deparment)
        );
      } else {
        form.setValue("Tagged_departments", [...prevValues, deparment]);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        return { success: false as const, message: err.message };
      }
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    let response = null;
    console.log(values);
    try {
      let imageUrl: string | null = values.image ?? null;

      setLoading(true);

      if (file) {
        if (!file.type.startsWith("image/")) {
          toast.error("Please select a valid image.");
          setLoading(false);
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error("Image too large (max 5MB).");
          setLoading(false);
          return;
        }
        const res = await uploadImage(file, {
          bucket: "blog-images",
          prefix: "actions",
        });

        if (!res.success) {
          toast.error(res.message ?? "Image upload failed");
          setLoading(false);
          return;
        }
        imageUrl = res.url;
      } else if (formType === "edit") {
        // keep existing image if no new file chosen
        imageUrl = initialValues?.image ?? null;
      } else {
        // add mode & no file: keep null
        imageUrl = null;
      }
      const payload = { ...values, image: imageUrl };
      if (formType == "add") {
        response = await createNewActionItem({ ...values, image: imageUrl });
        if (response.success) {
          toast.success("Successfully created");
          router.push("/tasks");
        }
      } else {
        if (!initialValues) {
          return;
        }
        response = editActionByid({
          action_id: initialValues.id,
          payload,
        });
        if ((await response).success) {
          toast.success((await response).message);
          router.push("/tasks");
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        return { success: false as const, message: err.message };
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialValues) {
      form.reset(initialValues);
    }
  }, [initialValues, form]);
  return (
    <div className=" flex items-center p-3 m-4">
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
                <FormLabel>Action item</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          ></FormField>
          <FormField
            control={form.control}
            name="nomc_feedback"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NOMC Feedback</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
              </FormItem>
            )}
          ></FormField>
          <FormField
            control={form.control}
            name="regional_feedback"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Regional Feedback</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
              </FormItem>
            )}
          ></FormField>
          <FormField
            control={form.control}
            name="lead_department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Lead Department <b className="text-xs"> {field.value} </b>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Dept..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="text-sm">
                    {lead_department.map((item) => (
                      <SelectItem key={item.label} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
          <Input
            placeholder="Upload Image"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
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

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Action Item description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your feedback here..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Status <b className="text-xs"> {field.value} </b>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Status..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="text-sm">
                    {Status.map((item) => (
                      <SelectItem key={item.label} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
          <h3>Tagged Deparments</h3>
          <hr></hr>
          <div className="flex flex-wrap gap-7">
            {Tagged_departments.map((deparment) => {
              const prevValues = form.watch("Tagged_departments");
              const isChecked = prevValues.includes(deparment.value);
              return (
                <div className="flex gap-5 items-center" key={deparment.value}>
                  <h1 className="text-sm">{deparment.label}</h1>
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => onTagChange(deparment.value)}
                  />
                </div>
              );
            })}
          </div>

          <FormField
            control={form.control}
            name="target_timeline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Timeline</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ActionType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  ActionType <b className="text-xs"> {field.value} </b>
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
                    {ActionType.map((item) => (
                      <SelectItem key={item.label} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />
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

export default ActionItemForm;
