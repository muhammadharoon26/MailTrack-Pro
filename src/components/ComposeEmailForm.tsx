"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { Paperclip, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useEmails } from "@/hooks/use-emails";
import { scheduleFollowUp } from "@/ai/flows/schedule-follow-up";
import { sendGmail } from "@/lib/actions/sendGmail"; // <-- Import our new Gmail action
import { addEmail } from "@/lib/actions/emails"; // Import the database action

const formSchema = z.object({
  to: z.string().email({ message: "Invalid email address." }),
  cc: z.string().optional(),
  bcc: z.string().optional(),
  subject: z.string().min(1, { message: "Subject is required." }),
  category: z.enum(["internship", "job", "cold-outreach"]),
  body: z.string().min(1, { message: "Email body cannot be empty." }),
});

export function ComposeEmailForm() {
  const { toast } = useToast();
  const { refreshEmails } = useEmails(); // Get the refresh function
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      to: "",
      cc: "",
      bcc: "",
      subject: "",
      category: "internship",
      body: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSending(true);
    try {
      // Step 1: Send the email using the secure Gmail server action
      const sendResult = await sendGmail({
        to: values.to,
        cc: values.cc,
        bcc: values.bcc,
        subject: values.subject,
        body: values.body,
      });

      if (!sendResult.success) {
        throw new Error(
          sendResult.message || "Failed to send email via Gmail."
        );
      }

      // Step 2: If sending is successful, schedule the AI follow-up
      const followUpResult = await scheduleFollowUp({
        emailContent: values.body,
        emailCategory: values.category,
        senderEmail: "me", // 'me' represents the authenticated user
        recipientEmail: values.to,
        subject: values.subject,
      });

      // Step 3: Save a record of the email to your own database for tracking
      await addEmail({
        ...values,
        followUpAt: followUpResult.followUpDate,
        attachments: attachments.map((file) => ({
          name: file.name,
          size: file.size,
        })),
      });

      // Manually refresh the email list after successful submission
      await refreshEmails();

      toast({
        title: "Email Sent!",
        description: `Your email was sent via Gmail. ${
          followUpResult.reason || ""
        }`,
      });

      form.reset();
      setAttachments([]);
    } catch (error: any) {
      console.error("Failed to send email:", error);
      toast({
        variant: "destructive",
        title: "Error Sending Email",
        description:
          error.message ||
          "Please check your connection or reconnect your Gmail account.",
      });
    } finally {
      setIsSending(false);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments((prev) => [...prev, ...Array.from(e.target.files!)]);
      e.target.value = ""; // Reset file input
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="to"
            render={({ field }) => (
              <FormItem>
                <FormLabel>To</FormLabel>
                <FormControl>
                  <Input placeholder="recipient@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="internship">
                      Internship Application
                    </SelectItem>
                    <SelectItem value="job">Job Application</SelectItem>
                    <SelectItem value="cold-outreach">Cold Outreach</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="cc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CC</FormLabel>
              <FormControl>
                <Input placeholder="cc@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bcc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>BCC</FormLabel>
              <FormControl>
                <Input placeholder="bcc@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input placeholder="Regarding your job opening" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Body</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Dear hiring manager..."
                  className="min-h-[200px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <FormLabel>Attachments</FormLabel>
          <p className="text-sm text-muted-foreground">
            Note: Attachments are not yet sent via Gmail in this demo.
          </p>
          <div className="mt-2 flex items-center gap-4">
            <Button type="button" variant="outline" asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                <Paperclip className="mr-2 h-4 w-4" />
                Add file
              </label>
            </Button>
            <input
              id="file-upload"
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          {attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm p-2 rounded-md border bg-muted/50"
                >
                  <span className="truncate">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    className="h-6 w-6 shrink-0"
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isSending}>
            {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Email
          </Button>
        </div>
      </form>
    </Form>
  );
}
