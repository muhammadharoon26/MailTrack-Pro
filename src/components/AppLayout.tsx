"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Send, Timer, Power } from "lucide-react";
import { useEffect, useState } from "react";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Compose", icon: Send },
  { href: "/follow-up", label: "Follow-ups", icon: Timer },
];

function ConnectGmailButton() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This is a client-side check to see if the session cookie exists.
    const checkSession = () => {
      const hasSession = document.cookie.includes("session=");
      setIsConnected(hasSession);
      setIsLoading(false);
    };
    checkSession();
  }, []);

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" className="w-40" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (isConnected) {
    return (
      <Button variant="secondary" size="sm" className="w-40" disabled>
        Gmail Connected
      </Button>
    );
  }

  return (
    <Button asChild variant="default" size="sm" className="w-40">
      <a href="/api/auth/google">
        <Power className="mr-2 h-4 w-4" />
        Connect Gmail
      </a>
    </Button>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 p-1">
              <Button
                variant="ghost"
                size="icon"
                className="text-primary hover:bg-primary/10 rounded-full"
              >
                <Mail className="h-6 w-6" />
              </Button>
              <h1 className="font-headline text-xl font-bold tracking-tighter">
                MailTrack Pro
              </h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b border-border/20 bg-transparent px-4 backdrop-blur-sm sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="md:flex-1">
              {/* This space can be used for other header elements if needed */}
            </div>
            <ConnectGmailButton />
          </header>
          <main className="relative z-10 flex-1 overflow-auto p-4 sm:p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}

// You might need a simple Loader icon component or import one if not available.
const Loader2 = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
