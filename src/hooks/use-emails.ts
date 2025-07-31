"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Email } from '@/lib/types';
import { isToday, parseISO } from 'date-fns';
import { getEmails, addEmail as addEmailAction } from '@/lib/actions/emails';
import { useToast } from './use-toast';

export function useEmails() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const refreshEmails = useCallback(async () => {
    setLoading(true);
    try {
      const allEmails = await getEmails();
      setEmails(allEmails);
    } catch (error) {
      console.error("Failed to fetch emails from database", error);
      // This is a critical error, but we don't want to crash the app.
      // We'll show a toast and set emails to an empty array.
      toast({
        variant: "destructive",
        title: "Database Error",
        description: "Could not fetch your emails. Please try again later.",
      });
      setEmails([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    refreshEmails();
  }, [refreshEmails]);

  const addEmail = useCallback(async (email: Omit<Email, 'id' | 'sentAt'>) => {
    try {
      await addEmailAction(email);
      await refreshEmails();
    } catch (error) {
      console.error("Failed to add email:", error);
      throw error; // Re-throw to be caught in the form
    }
  }, [refreshEmails]);

  const followUpEmails = emails.filter(email => {
    if (!email.followUpAt) return false;
    try {
      // The followUpAt from the DB is already a Date object or a string that parseISO can handle
      const followUpDate = typeof email.followUpAt === 'string' ? parseISO(email.followUpAt) : email.followUpAt;
      return isToday(followUpDate);
    } catch (e) {
      console.error("Error parsing follow-up date", e);
      return false;
    }
  });

  return { emails, addEmail, followUpEmails, loading };
}
