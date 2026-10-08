/**
 * UnifiedShell — single design-system shell for every dashboard.
 * Semantic tokens only (see index.css). Supports:
 *   - grouped sidebar nav
 *   - collapsible desktop sidebar
 *   - mobile drawer (hamburger)
 *   - optional back button, logout, topbar right slot, footer slot
 */
import React, { ReactNode, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, LogOut, Search, Bell, Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { cn } from "@/lib/utils";

export type UnifiedNavItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  accent?: boolean;
  badge?: string | number;
  onClick?: () => void;
};

export type UnifiedNavGroup = {
  title: string;
  items: UnifiedNavItem[];
};

interface UnifiedShellProps {
  brandTitle: string;
  brandSubtitle?: string;
  brandIcon?: React.ElementType;
  groups: UnifiedNavGroup[];
  activeId: string;
  onSelect: (id: string) => void;
  onBack?: () => void;
  backLabel?: string;
  onLogout?: () => void;
  topbarRight?: ReactNode;
  topbarTitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  showSearch?: boolean;
  notifications?: { id: string; title: string; description?: string; onClick?: () => void }[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}


export const UnifiedShell: React.FC<UnifiedShellProps> = ({
  brandTitle,
  brandSubtitle,
  brandIcon: BrandIcon,
  groups,
  activeId,
  onSelect,
  onBack,
  backLabel = "Back",
  onLogout,
  topbarRight,
  topbarTitle,
  children,
  footer,
  showSearch = true,
  notifications = [],
  collapsible = true,
  defaultCollapsed = false,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");

  const sidebarWidth = collapsed ? "w-[72px]" : "w-[264px]";
  const activeGroup = groups.find((group) => group.items.some((item) => item.id === activeId));

  const visibleGroups = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return groups;
    return groups
      .map((g) => ({ ...g, items: g.items.filter((i) => i.label.toLowerCase().includes(term)) }))
      .filter((g) => g.items.length > 0);
  }, [groups, query]);

  const SidebarInner = (

    <>
      {onBack && (
        <div className="px-3 pt-3 pb-2 border-b border-sidebar-border">
          <button
            onClick={onBack}
            className="ams-nav-item w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-white/5 hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
            {!collapsed && <span>{backLabel}</span>}
          </button>
        </div>
      )}

      <div className={cn("flex h-16 items-center gap-3 border-b border-sidebar-border px-5", collapsed && "justify-center px-3")}>
        <div className="h-9 w-9 rounded-lg bg-gradient-brand flex items-center justify-center shadow-glow shrink-0">
          {BrandIcon ? (
            <BrandIcon className="h-5 w-5 text-brand-foreground" />
          ) : (
            <span className="text-brand-foreground font-bold">SV</span>
          )}
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-sm font-bold truncate text-foreground">
              {brandTitle}
              <span className="text-[hsl(var(--brand-red))]">™</span>
            </div>
            {brandSubtitle && (
              <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground truncate">
                {brandSubtitle}
              </div>
            )}
          </div>
        )}
      </div>

      {showSearch && !collapsed && (
        <div className="px-4 pb-4 pt-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find a module…"
              aria-label="Search modules"
              className="h-9 border-sidebar-border bg-sidebar-accent/45 pl-9 text-xs shadow-none"
            />
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 pb-5 space-y-5">
        {visibleGroups.map((group) => (
          <div key={group.title}>
            {!collapsed && (
              <div className="px-3 pb-2 text-[10px] font-bold tracking-[0.14em] uppercase text-muted-foreground">
                {group.title}
              </div>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = activeId === item.id;
                return (
                  <motion.button
                    key={item.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      item.onClick?.();
                      onSelect(item.id);
                      setMobileOpen(false);
                    }}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "ams-nav-item ams-press group relative flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-sm font-medium",
                      active
                        ? "border-primary/25 bg-primary/12 text-foreground shadow-sm before:absolute before:-left-3 before:h-5 before:w-0.5 before:rounded-full before:bg-primary"
                        : item.accent
                        ? "border-primary/10 bg-primary/8 text-foreground hover:bg-primary/15"
                        : "border-transparent text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="truncate">{item.label}</span>
                        {item.badge != null && (
                          <span className="ml-auto min-w-5 rounded-full bg-primary/15 px-1.5 py-0.5 text-center text-[10px] text-primary">
                            {item.badge}
                          </span>
                        )}
                        {active && item.badge == null && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                        )}
                      </>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
        {visibleGroups.length === 0 && !collapsed && (
          <p className="px-3 text-xs text-muted-foreground">No modules match “{query}”.</p>
        )}
      </nav>

      {onLogout && (
        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={onLogout}
            title={collapsed ? "Secure Logout" : undefined}
            className="ams-nav-item w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Secure Logout</span>}
          </button>
        </div>
      )}

      {collapsible && (
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="hidden lg:flex items-center justify-center h-8 border-t border-sidebar-border text-muted-foreground hover:text-foreground hover:bg-white/5"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      )}
    </>
  );

  return (
    <div className="min-h-dvh w-full flex bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:sticky lg:top-0 lg:flex h-dvh shrink-0 flex-col bg-sidebar/95 text-sidebar-foreground border-r border-sidebar-border backdrop-blur-xl transition-[width] duration-300",
          sidebarWidth
        )}
      >
        {SidebarInner}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "tween", duration: 0.25 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border"
            >
              <div className="flex justify-end p-2">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {SidebarInner}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex items-center justify-between px-4 md:px-8 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden h-9 w-9 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="hidden items-center gap-2 text-xs sm:flex">
              <span className="text-muted-foreground">{activeGroup?.title ?? "Dashboard"}</span>
              <span className="text-border">/</span>
              {topbarTitle && <h2 className="truncate font-medium text-foreground">{topbarTitle}</h2>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label={`Notifications (${notifications.length})`}
                   className="icon3d relative flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <Bell className="h-4 w-4" />
                  {notifications.length > 0 && (
                    <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-destructive px-1 text-[10px] font-bold leading-4 text-destructive-foreground">
                      {notifications.length}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <DropdownMenuItem disabled>Nothing needs attention</DropdownMenuItem>
                ) : (
                  notifications.map((n) => (
                    <DropdownMenuItem
                      key={n.id}
                      onClick={n.onClick}
                      className="flex flex-col items-start gap-0.5"
                    >
                      <span className="text-sm font-medium">{n.title}</span>
                      {n.description && (
                        <span className="text-xs text-muted-foreground">{n.description}</span>
                      )}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            {topbarRight}

          </div>
        </header>

        <main className="flex-1 overflow-auto ams-section-enter">
          <div className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
            <section className="hero-surface" aria-labelledby="page-title">
              <div className="relative z-10 max-w-3xl">
                <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
                  <span>{activeGroup?.title ?? "Dashboard"}</span>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-muted-foreground">Live operations</span>
                </div>
                <h1 id="page-title" className="text-2xl font-bold text-foreground sm:text-3xl lg:text-[34px]">
                  {topbarTitle ?? brandTitle}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Monitor delivery, workload and team operations with live, permission-aware data.
                </p>
              </div>
            </section>
            <div className="launchpad-content">{children}</div>
          </div>
        </main>

        {footer}
      </div>
    </div>
  );
};

export default UnifiedShell;
