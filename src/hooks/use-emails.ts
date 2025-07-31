"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Email } from '@/lib/types';
import { isToday, parseISO } from 'date-fns';

const EMAILS_STORAGE_KEY = 'mailtrack-pro-emails';

export function useEmails() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedEmails = localStorage.getItem(EMAILS_STORAGE_KEY);
      if (storedEmails) {
        setEmails(JSON.parse(storedEmails));
      }
    } catch (error) {
      console.error("Failed to parse emails from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addEmail = useCallback((email: Email) => {
    const updatedEmails = [email, ...emails];
    setEmails(updatedEmails);
    localStorage.setItem(EMAILS_STORAGE_KEY, JSON.stringify(updatedEmails));
  }, [emails]);

  const followUpEmails = emails.filter(email => {
    if (!email.followUpAt) return false;
    try {
      return isToday(parseISO(email.followUpAt));
    } catch (e) {
      return false;
    }
  });

  return { emails, addEmail, followUpEmails, loading };
}
