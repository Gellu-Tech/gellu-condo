import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { CircleCheck, CircleX, TriangleAlert } from "lucide-react"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "group/alert relative grid w-full gap-0.5 rounded-2xl border px-4 py-3 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2.5 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-sm text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
        className
      )}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-2.5 right-3", className)}
      {...props}
    />
  )
}

interface AlertVariantProps {
  title: string
  description?: string
  className?: string
}

function AlertSuccess({ title, description, className }: AlertVariantProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm dark:border-green-800 dark:bg-green-950/30",
        className,
      )}
    >
      <CircleCheck className="mt-0.5 size-9 shrink-0 text-green-600 dark:text-green-400" />
      <div className="space-y-0.5">
        <p className="font-medium text-green-900 dark:text-green-300">{title}</p>
        {description && (
          <p className="text-green-800/70 dark:text-green-400/70">{description}</p>
        )}
      </div>
    </div>
  )
}

function AlertDestructive({ title, description, className }: AlertVariantProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm dark:border-red-800 dark:bg-red-950/30",
        className,
      )}
    >
      <CircleX className="mt-0.5 size-9 shrink-0 text-red-600 dark:text-red-400" />
      <div className="space-y-0.5">
        <p className="font-medium text-red-900 dark:text-red-300">{title}</p>
        {description && (
          <p className="text-red-800/70 dark:text-red-400/70">{description}</p>
        )}
      </div>
    </div>
  )
}

function AlertWarning({ title, description, className }: AlertVariantProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm dark:border-yellow-800 dark:bg-yellow-950/30",
        className,
      )}
    >
      <TriangleAlert className="mt-0.5 size-9 shrink-0 text-yellow-600 dark:text-yellow-400" />
      <div className="space-y-0.5">
        <p className="font-medium text-yellow-900 dark:text-yellow-300">{title}</p>
        {description && (
          <p className="text-yellow-800/70 dark:text-yellow-400/70">{description}</p>
        )}
      </div>
    </div>
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction, AlertSuccess, AlertDestructive, AlertWarning }
