
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Email } from '@/lib/types';
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
      console.error("Failed to fetch emails:", error);
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

  return { emails, addEmail, loading, refreshEmails };
}
