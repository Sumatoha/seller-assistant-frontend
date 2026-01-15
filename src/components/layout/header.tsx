"use client";

import { Bell, Search, User, Menu } from "lucide-react";
import { useUIStore, useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function Header({ title, description, action }: HeaderProps) {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={toggleSidebar}
            className={cn(
              "rounded-lg p-2 hover:bg-muted lg:hidden",
              sidebarOpen && "hidden"
            )}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {action}

          {/* User menu */}
          <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
              {user?.username?.[0]?.toUpperCase() || "U"}
            </div>
            <span className="hidden text-sm font-medium sm:block">
              {user?.username || "User"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
