
"use client";

import { useState } from "react";
import { FollowUpList } from "@/components/FollowUpList";
import { useEmails } from "@/hooks/use-emails";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Timer } from "lucide-react";
import { isToday, parseISO } from "date-fns";

export default function FollowUpPage() {
  const { emails, loading } = useEmails();
  const [filter, setFilter] = useState<'today' | 'all'>('today');

  const todayFollowUps = emails.filter(email => {
    if (!email.followUpAt) return false;
    try {
      const followUpDate = typeof email.followUpAt === 'string' ? parseISO(email.followUpAt) : email.followUpAt;
      return isToday(followUpDate);
    } catch (e) {
      console.error("Error parsing follow-up date", e);
      return false;
    }
  });

  const allFollowUps = emails.filter(email => !!email.followUpAt);

  const filteredEmails = filter === 'today' ? todayFollowUps : allFollowUps;
  const listDescription = filter === 'today' 
    ? "These are the emails you should follow up on today."
    : "These are all of your scheduled follow-ups.";

  const NoFollowUps = () => (
    <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg bg-muted/50">
      <Timer className="h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">All Caught Up!</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        You have no follow-ups scheduled for {filter === 'today' ? 'today' : 'the future'}.
      </p>
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Follow-ups</CardTitle>
          <CardDescription>
            {listDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(value) => setFilter(value as 'today' | 'all')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            <TabsContent value="today">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full rounded-lg" />
                  <Skeleton className="h-20 w-full rounded-lg" />
                  <Skeleton className="h-20 w-full rounded-lg" />
                </div>
              ) : filteredEmails.length > 0 ? (
                <FollowUpList emails={filteredEmails} />
              ) : (
                <NoFollowUps />
              )}
            </TabsContent>
             <TabsContent value="all">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full rounded-lg" />
                  <Skeleton className="h-20 w-full rounded-lg" />
                  <Skeleton className="h-20 w-full rounded-lg" />
                </div>
              ) : filteredEmails.length > 0 ? (
                <FollowUpList emails={filteredEmails} />
              ) : (
                <NoFollowUps />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

