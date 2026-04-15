import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

interface SiteHeaderProps {
  title: string
  children: React.ReactNode
}

export function SiteHeader({ title, children }: SiteHeaderProps) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full px-4 lg:px-6 justify-between items-center">
        <div className="flex items-center gap-1 lg:gap-2">
          <SidebarTrigger className="-ml-1" />
          <div className="flex">
            <Separator
              orientation="vertical"
              className="mx-2 h-4"
            />
          </div>
          <h1 className="text-base font-medium">{title}</h1>
        </div>
        {children}
      </div>
    </header>
  )
}
