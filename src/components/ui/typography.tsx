import { cn } from "@/lib/utils"

type WithClassName<T extends HTMLElement> = React.HTMLAttributes<T> & { className?: string }

export function H1({ className, ...props }: WithClassName<HTMLHeadingElement>) {
  return <h1 className={cn("typo-h1", className)} {...props} />
}

export function H2({ className, ...props }: WithClassName<HTMLHeadingElement>) {
  return <h2 className={cn("typo-h2", className)} {...props} />
}

export function H3({ className, ...props }: WithClassName<HTMLHeadingElement>) {
  return <h3 className={cn("typo-h3", className)} {...props} />
}

export function H4({ className, ...props }: WithClassName<HTMLHeadingElement>) {
  return <h4 className={cn("typo-h4", className)} {...props} />
}

export function P({ className, ...props }: WithClassName<HTMLParagraphElement>) {
  return <p className={cn("typo-p", className)} {...props} />
}

export function Lead({ className, ...props }: WithClassName<HTMLParagraphElement>) {
  return <p className={cn("typo-lead", className)} {...props} />
}

export function Large({ className, ...props }: WithClassName<HTMLDivElement>) {
  return <div className={cn("typo-large", className)} {...props} />
}

export function Small({ className, ...props }: WithClassName<HTMLElement>) {
  return <small className={cn("typo-small", className)} {...props} />
}

export function Muted({ className, ...props }: WithClassName<HTMLParagraphElement>) {
  return <p className={cn("typo-muted", className)} {...props} />
}

export function Blockquote({ className, ...props }: WithClassName<HTMLQuoteElement>) {
  return <blockquote className={cn("typo-blockquote", className)} {...props} />
}

export function InlineCode({ className, ...props }: WithClassName<HTMLElement>) {
  return <code className={cn("typo-code", className)} {...props} />
}
