import * as React from "react"

import { NavDocuments } from "@/components/nav-entities"
import { NavRelationships } from "./nav-relationships"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboardIcon, CameraIcon, FileTextIcon, Settings2Icon, CircleHelpIcon, SearchIcon, DatabaseIcon, FileChartColumnIcon, FileIcon, CommandIcon } from "lucide-react"
import { Salad } from "lucide-react"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: ( <LayoutDashboardIcon /> ),
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: ( <CameraIcon /> ),
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: (
        <FileTextIcon
        />
      ),
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: (
        <FileTextIcon
        />
      ),
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: (
        <Settings2Icon
        />
      ),
    },
    {
      title: "Get Help",
      url: "#",
      icon: (
        <CircleHelpIcon
        />
      ),
    },
    {
      title: "Search",
      url: "#",
      icon: (
        <SearchIcon
        />
      ),
    },
  ],
  entities: [
    {
      name: "Parts",
      url: "/parts",
      icon: (
        <DatabaseIcon
        />
      ),
    },
    {
      name: "Vendors",
      url: "/vendors",
      icon: (
        <FileChartColumnIcon
        />
      ),
    },
    {
      name: "Purchase Orders",
      url: "/purchase-orders",
      icon: (
        <FileIcon
        />
      ),
    },
        {
      name: "BOMs",
      url: "/boms",
      icon: (
        <FileChartColumnIcon
        />
      ),
    },
  ],
  relationships: [
    {
      name: "Part/Vendors",
      url: "/part-vendors",
      icon: (<DatabaseIcon />)
    },
    {
      name: "Part/Subpart",
      url: "/part-subparts",
      icon: (<DatabaseIcon />)
    },
    {
      name: "Components",
      url: "/components",
      icon: (<DatabaseIcon />)
    },
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <Salad className="size-5!" />
                <span className="text-base font-semibold">Potato Salad</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.entities} />
        {/* <NavRelationships items={data.relationships} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
