"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Email } from '@/lib/types';
import { getEmails, addEmail as addEmailAction } from '@/lib/actions/emails';
import { useToast } from './use-toast';

export function useEmails() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/session');
        if (response.ok) {
          const data = await response.json();
          setCurrentUserEmail(data.user?.email ?? null);
        }
      } catch (error) {
        setCurrentUserEmail(null);
      }
    }
    fetchUser();
  }, []);

  const refreshEmails = useCallback(async () => {
    if (!currentUserEmail) return;
    setLoading(true);
    try {
      const allEmails = await getEmails(currentUserEmail);
      setEmails(allEmails);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Database Error",
        description: "Could not fetch your emails. Please try again later.",
      });
      setEmails([]);
    } finally {
      setLoading(false);
    }
  }, [toast, currentUserEmail]);

  useEffect(() => {
    refreshEmails();
  }, [refreshEmails]);

  const addEmail = useCallback(async (email: Omit<Email, 'id' | 'sentAt'>) => {
    if (!currentUserEmail) return;
    try {
      await addEmailAction({ ...email, user_email: currentUserEmail });
      await refreshEmails();
    } catch (error) {
      console.error("Failed to add email:", error);
      throw error;
    }
  }, [refreshEmails, currentUserEmail]);

  return { emails, addEmail, loading, refreshEmails };
}
