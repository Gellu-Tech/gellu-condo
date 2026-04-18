import { H2, Muted } from "@/components/ui/typography"

interface PageHeaderProps {
  title: string
  description?: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1 pb-4">
      <H2 className="border-b-0 pb-0">{title}</H2>
      {description && <Muted>{description}</Muted>}
    </div>
  )
}
