import { SidebarTrigger } from "@/components/ui/sidebar";
import { SignedIn, UserButton } from "@clerk/nextjs";
import React from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AppHeader() {
  return (
    <div className="flex justify-between items-center w-full p-4 shadow bg-sidebar">
      <SidebarTrigger />
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  );
}
