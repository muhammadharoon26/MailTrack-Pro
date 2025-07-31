"use client";

import { useState } from "react";
import type { Email } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { suggestFollowUpMessage } from "@/ai/flows/suggest-follow-up-message";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageSquareQuote } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";

export function FollowUpList({ emails }: { emails: Email[] }) {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [suggestion, setSuggestion] = useState("");
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const { toast } = useToast();

  const handleComposeFollowUp = async (email: Email) => {
    setSelectedEmail(email);
    setIsLoadingSuggestion(true);
    try {
      const result = await suggestFollowUpMessage({ originalEmail: email.body });
      setSuggestion(result.followUpSuggestion);
    } catch (error) {
      console.error("Failed to get suggestion:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not generate follow-up suggestion.",
      });
      setSuggestion("Sorry, we couldn't generate a suggestion at this time.");
    } finally {
      setIsLoadingSuggestion(false);
    }
  };
  
  const handleCopyToClipboard = () => {
    if(!suggestion) return;
    navigator.clipboard.writeText(suggestion);
    toast({
      title: "Copied!",
      description: "Follow-up message copied to clipboard.",
    });
  }

  const closeDialog = () => {
    setSelectedEmail(null);
    setSuggestion("");
  };

  const categoryDisplay: Record<Email['category'], string> = {
    internship: "Internship",
    job: "Job Application",
    "cold-outreach": "Cold Outreach",
  }

  return (
    <>
      <div className="space-y-4">
        {emails.map((email) => (
          <div key={email.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg bg-card shadow-sm">
            <div className="flex-grow">
              <p className="font-semibold">{email.to}</p>
              <p className="text-sm text-muted-foreground truncate" title={email.subject}>{email.subject}</p>
              <div className="flex items-center gap-2 mt-2">
                 <Badge variant="secondary">{categoryDisplay[email.category]}</Badge>
                 <p className="text-xs text-muted-foreground">
                    Sent {formatDistanceToNow(new Date(email.sentAt), { addSuffix: true })}
                 </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full sm:w-auto shrink-0"
              onClick={() => handleComposeFollowUp(email)}
            >
              <MessageSquareQuote className="mr-2 h-4 w-4" />
              Compose Follow-up
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedEmail} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>AI-Suggested Follow-up</DialogTitle>
            <DialogDescription>
              For your email to <span className="font-semibold">{selectedEmail?.to}</span> about "{selectedEmail?.subject}".
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isLoadingSuggestion ? (
              <div className="flex items-center justify-center h-40 rounded-md border border-dashed">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Textarea value={suggestion} readOnly className="h-40" />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={handleCopyToClipboard} disabled={isLoadingSuggestion || !suggestion}>Copy Message</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
