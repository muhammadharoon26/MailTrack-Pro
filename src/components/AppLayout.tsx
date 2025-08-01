"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Send, Timer, Power, User as UserIcon, LogOut } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";

const navItems = [
  { href: "/", label: "Compose", icon: Send },
  { href: "/follow-up", label: "Follow-ups", icon: Timer },
];

interface User {
  name?: string;
  email?: string;
  picture?: string;
}

function AuthStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/session');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch session:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSession();
  }, []);

  if (isLoading) {
    return <Skeleton className="h-9 w-40" />;
  }

  if (user && user.email) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.picture} alt={user.name || 'User'} />
              <AvatarFallback>
                <UserIcon />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            <LogOut className="mr-2" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-border/20 bg-background/80 px-4 backdrop-blur-lg sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1" />
          <AuthStatus />
        </header>
        <main className="relative z-10 flex flex-1 flex-col overflow-y-auto">
            <div className="flex-grow p-4 sm:p-6">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
