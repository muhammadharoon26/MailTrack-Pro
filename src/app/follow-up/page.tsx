"use client";

import { FollowUpList } from "@/components/FollowUpList";
import { useEmails } from "@/hooks/use-emails";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Timer } from "lucide-react";

export default function FollowUpPage() {
  const { followUpEmails, loading } = useEmails();

  return (
    <div className="mx-auto max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Follow-ups for Today</CardTitle>
          <CardDescription>
            These are the emails you should follow up on today.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          ) : followUpEmails.length > 0 ? (
            <FollowUpList emails={followUpEmails} />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg bg-muted/50">
              <Timer className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">All Caught Up!</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                You have no follow-ups scheduled for today.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
