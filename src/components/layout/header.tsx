"use client";

import { Menu } from "lucide-react";
import { useUIStore } from "@/lib/store";
import { ThemeToggle } from "@/components/theme-toggle";

interface HeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function Header({ title, description, action }: HeaderProps) {
  const { setSidebarOpen } = useUIStore();

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 hover:bg-muted lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold">{title}</h1>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {action}
        </div>
      </div>
    </header>
  );
}
