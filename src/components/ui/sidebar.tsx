import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { NavLink } from "react-router-dom"

import { cn } from "@/lib/utils"

// ─── Context ────────────────────────────────────────────────────────────────

type SidebarContextValue = {
  collapsed: boolean
  toggle: () => void
}

const SidebarContext = React.createContext<SidebarContextValue>({
  collapsed: false,
  toggle: () => {},
})

function useSidebar() {
  return React.useContext(SidebarContext)
}

// ─── Root ────────────────────────────────────────────────────────────────────

function Sidebar({
  defaultCollapsed = false,
  className,
  children,
  ...props
}: React.ComponentProps<"aside"> & { defaultCollapsed?: boolean }) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed)
  const toggle = React.useCallback(() => setCollapsed((c) => !c), [])

  return (
    <SidebarContext.Provider value={{ collapsed, toggle }}>
      <aside
        data-slot="sidebar"
        data-collapsed={collapsed || undefined}
        className={cn(
          "group/sidebar relative flex h-screen shrink-0 flex-col",
          "border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
          "transition-[width] duration-500 ease-in-out",
          collapsed ? "w-23" : "w-65",
          className,
        )}
        {...props}
      >
        {/* Inner wrapper carries the 24px container padding.
            Toggle sits outside so its absolute -right-3 anchors
            to the <aside> border edge, not the padding edge. */}
        <div className="flex flex-1 flex-col overflow-hidden px-6 pt-6">
          {children}
        </div>
        <SidebarToggle />
      </aside>
    </SidebarContext.Provider>
  )
}

// ─── Toggle ──────────────────────────────────────────────────────────────────

function SidebarToggle({ className }: { className?: string }) {
  const { collapsed, toggle } = useSidebar()

  return (
    <button
      data-slot="sidebar-toggle"
      onClick={toggle}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className={cn(
        "absolute -right-3 top-8 z-10",
        "flex size-6 items-center justify-center rounded-md",
        "border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm",
        "transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        className,
      )}
    >
      {collapsed ? (
        <ChevronRight className="size-3" />
      ) : (
        <ChevronLeft className="size-3" />
      )}
    </button>
  )
}

// ─── Header ──────────────────────────────────────────────────────────────────

interface SidebarHeaderProps extends React.ComponentProps<"div"> {
  avatar?: string
  name?: string
  role?: string
}

function SidebarHeader({
  avatar,
  name,
  role,
  className,
  children,
  ...props
}: SidebarHeaderProps) {
  const { collapsed } = useSidebar()

  const initials = name
    ? name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?"

  return (
    <div
      data-slot="sidebar-header"
      className={cn(
        "flex shrink-0 items-center gap-3 pb-6",
        collapsed && "pl-1",
        className,
      )}
      {...props}
    >
      {avatar || name ? (
        <>
          {/* Avatar */}
          <div className="relative shrink-0">
            {avatar ? (
              <img
                src={avatar}
                alt={name ?? "User"}
                className="size-9 rounded-full object-cover ring-2 ring-sidebar-border"
              />
            ) : (
              <span className="flex size-9 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground ring-2 ring-sidebar-border">
                {initials}
              </span>
            )}
          </div>

          {/* Name + Role */}
          <div
            className={cn(
              "min-w-0 flex-1 overflow-hidden transition-[opacity,max-width] duration-500 ease-in-out",
              collapsed ? "max-w-0 opacity-0" : "max-w-full opacity-100",
            )}
          >
            {name && (
              <p className="truncate text-sm font-semibold text-sidebar-foreground">
                {name}
              </p>
            )}
            {role && (
              <p className="truncate text-[11px] uppercase tracking-wide text-sidebar-foreground/50">
                {role}
              </p>
            )}
          </div>
        </>
      ) : (
        children
      )}
    </div>
  )
}

// ─── Content ─────────────────────────────────────────────────────────────────

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn(
        "flex flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto",
        className,
      )}
      {...props}
    />
  )
}

// ─── Section ─────────────────────────────────────────────────────────────────

function SidebarSection({
  label,
  collapsedLabelClassName,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { label?: string; collapsedLabelClassName?: string }) {
  const { collapsed } = useSidebar()

  return (
    <div
      data-slot="sidebar-section"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    >
      {label && (
        <p
          className={cn(
            "pb-1 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/50",
            "transition-[padding-left] duration-500 ease-in-out",
            collapsed ? cn("pl-0", collapsedLabelClassName) : "pl-3",
          )}
        >
          {label}
        </p>
      )}
      {children}
    </div>
  )
}

// ─── Item ─────────────────────────────────────────────────────────────────────

interface SidebarItemBaseProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  className?: string
}

type SidebarItemProps = SidebarItemBaseProps &
  (
    | ({ to: string; href?: undefined } & Omit<React.ComponentProps<typeof NavLink>, keyof SidebarItemBaseProps | "to">)
    | ({ href: string; to?: undefined } & Omit<React.ComponentProps<"a">, keyof SidebarItemBaseProps>)
    | ({ href?: undefined; to?: undefined } & Omit<React.ComponentProps<"button">, keyof SidebarItemBaseProps>)
  )

function SidebarItem({
  icon,
  label,
  active,
  href,
  to,
  className,
  ...props
}: SidebarItemProps) {
  const { collapsed } = useSidebar()

  const sharedClassName = cn(
    "flex w-full items-center rounded-md px-3 py-[10px] text-sm font-medium",
    "text-sidebar-foreground/70 transition-[gap,colors] duration-500 ease-in-out",
    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
    active && "bg-sidebar-accent text-sidebar-accent-foreground",
    collapsed ? "gap-0" : "gap-3",
    className,
  )

  const content = (
    <>
      <span className="shrink-0 [&_svg]:size-5">{icon}</span>
      <span
        className={cn(
          "truncate transition-[opacity,max-width] duration-500 ease-in-out",
          collapsed ? "max-w-0 overflow-hidden opacity-0" : "max-w-full opacity-100",
        )}
      >
        {label}
      </span>
    </>
  )

  if (to !== undefined) {
    return (
      <NavLink
        data-slot="sidebar-item"
        to={to}
        end={to === "/"}
        title={collapsed ? label : undefined}
        className={({ isActive }) =>
          cn(sharedClassName, isActive && "bg-sidebar-accent text-sidebar-accent-foreground")
        }
        {...(props as Omit<React.ComponentProps<typeof NavLink>, "to" | "end" | "className">)}
      >
        {content}
      </NavLink>
    )
  }

  if (href !== undefined) {
    return (
      <a
        data-slot="sidebar-item"
        data-active={active || undefined}
        href={href}
        title={collapsed ? label : undefined}
        className={sharedClassName}
        {...(props as React.ComponentProps<"a">)}
      >
        {content}
      </a>
    )
  }

  return (
    <button
      data-slot="sidebar-item"
      data-active={active || undefined}
      type="button"
      title={collapsed ? label : undefined}
      className={sharedClassName}
      {...(props as React.ComponentProps<"button">)}
    >
      {content}
    </button>
  )
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn("mt-auto shrink-0 pb-6", className)}
      {...props}
    />
  )
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarSection,
  SidebarItem,
  SidebarFooter,
  useSidebar,
}
