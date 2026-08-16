"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { name: "Categories", href: "/menu/categories" },
    { name: "Items", href: "/menu/items" },
    { name: "Add-ons", href: "/menu/addons" },
  ];

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
      </div>
      
      <div className="flex items-center space-x-4 border-b border-gray-200">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            href={tab.href}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2",
              pathname.startsWith(tab.href)
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-primary hover:border-gray-300"
            )}
          >
            {tab.name}
          </Link>
        ))}
      </div>

      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
