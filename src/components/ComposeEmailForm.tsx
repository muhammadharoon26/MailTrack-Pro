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
  const { addEmail } = useEmails();
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
      // For this demo, we'll simulate sending and then schedule follow-up.
      const { to, subject, body, category } = values;

      const followUpResult = await scheduleFollowUp({
        emailContent: body,
        emailCategory: category,
        senderEmail: "user@mailtrack.pro", // Placeholder
        recipientEmail: to,
        subject: subject,
      });

      // The new email structure for the action doesn't require id or sentAt
      await addEmail({
        ...values,
        followUpAt: followUpResult.followUpDate,
        attachments: attachments.map(file => ({ name: file.name, size: file.size })),
      });


      toast({
        title: "Email Sent!",
        description: `Your email has been sent. ${followUpResult.reason || ''}`,
      });

      form.reset();
      setAttachments([]);
    } catch (error) {
      console.error("Failed to send email:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send email. Please try again.",
      });
    } finally {
      setIsSending(false);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
      e.target.value = ''; // Reset file input
    }
  };
  
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }

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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="internship">Internship Application</SelectItem>
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
          <div className="mt-2 flex items-center gap-4">
            <Button type="button" variant="outline" asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                <Paperclip className="mr-2 h-4 w-4" />
                Add file
              </label>
            </Button>
            <input id="file-upload" type="file" multiple className="hidden" onChange={handleFileChange} />
          </div>
          {attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between text-sm p-2 rounded-md border bg-muted/50">
                  <span className="truncate">{file.name}</span>
                  <Button variant="ghost" size="icon" type="button" className="h-6 w-6 shrink-0" onClick={() => removeAttachment(index)}>
                    <X className="h-4 w-4"/>
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
