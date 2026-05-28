"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  FileText,
  PanelLeftClose,
  PanelLeft,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { UserMenu } from "@/components/UserMenu";
import { Separator } from "@/components/ui/separator";

const iconClass =
  "h-4 w-4 shrink-0 transition-transform duration-200 ease-out group-hover:scale-110";

type Props = {
  workspaceName: string;
  userName: string;
  userEmail: string;
};

const nav: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/campaigns", label: "Campaigns", icon: LayoutGrid },
  { href: "/templates", label: "Templates", icon: FileText },
];

export function AppSidebar({ workspaceName, userName, userEmail }: Props) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex h-full shrink-0 flex-col bg-sidebar transition-all max-md:border-r max-md:border-sidebar-border ${
        collapsed ? "w-14" : "w-64"
      }`}
    >
      <div
        className={`flex items-center gap-2 p-2 ${
          collapsed ? "justify-center" : "justify-between pb-4"
        }`}
      >
        {!collapsed && (
          <Link
            href="/campaigns"
            className="px-2 text-sm font-bold tracking-tight text-sidebar-foreground"
          >
            sentinel
          </Link>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className={`group rounded text-muted-foreground hover:bg-sidebar-accent ${
            collapsed ? "" : "ml-auto"
          }`}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeft className={iconClass} />
          ) : (
            <PanelLeftClose className={iconClass} />
          )}
        </button>
      </div>

      {!collapsed && (
        <Separator className="mx-2 bg-sidebar-border" />
      )}

      {!collapsed && (
        <div className="mx-2 mb-4 flex items-center gap-2 px-2 pb-2 pt-4">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-violet-600 text-xs font-semibold text-white">
            {workspaceName.charAt(0).toUpperCase()}
          </div>
          <span className="truncate text-sm font-medium text-sidebar-foreground">
            {workspaceName}
          </span>
        </div>
      )}

      <nav className="flex flex-1 flex-col gap-1 px-2">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`group flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors ${
                collapsed ? "justify-center" : ""
              } ${
                active
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className={iconClass} />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 pt-2">
        <UserMenu
          userName={userName}
          userEmail={userEmail}
          collapsed={collapsed}
        />
      </div>
    </aside>
  );
}
