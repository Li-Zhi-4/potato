import * as React from "react"
import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/context/authContext"
import { listBoms, type Bom } from "@/apis/boms"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from "@/components/ui/sidebar"
import {
    LayoutDashboard,
    Users,
    Package,
    Building2,
    ReceiptText,
    LayoutGrid,
    MessageCircle,
    Settings,
    Search,
    Plus,
    Command,
} from "lucide-react"
import { NavUser } from "./nav-user"
import { cn } from "@/lib/utils"

const DOT_COLORS = [
    "bg-orange-400",
    "bg-sky-400",
    "bg-emerald-400",
    "bg-violet-400",
    "bg-rose-400",
]

function NavItem({
    icon,
    label,
    href,
    active,
}: {
    icon: React.ReactNode
    label: string
    href: string
    active?: boolean
}) {
    return (
        <Link
            to={href}
            className={cn(
                "flex items-center gap-2 px-2 h-8 w-full rounded-sm transition-colors hover:bg-neutral-100",
                active && "bg-neutral-100"
            )}
        >
            <span className="size-4 shrink-0 flex items-center justify-center text-neutral-600">
                {icon}
            </span>
            <span className="text-[13px] text-neutral-900 whitespace-nowrap">{label}</span>
        </Link>
    )
}

function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1">
            <div className="px-2 py-1">
                <span className="font-light text-[10px] tracking-[2px] uppercase text-neutral-400">
                    {label}
                </span>
            </div>
            <div className="divide-y divide-neutral-200">{children}</div>
        </div>
    )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { user, token } = useAuth()
    const location = useLocation()
    const [boms, setBoms] = useState<Bom[]>([])

    useEffect(() => {
        if (!token) return
        listBoms(token).then(setBoms).catch(() => {})
    }, [token])

    const navUser = {
        name: user ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || user.username : "",
        email: user?.email ?? "",
        avatar: "",
    }

    const path = location.pathname

    return (
        <Sidebar collapsible="offcanvas" {...props}>

            {/* Header: logo block */}
            <SidebarHeader className="px-4 py-3 border-b-0">
                <div className="flex items-center gap-2 p-2">
                    <div className="size-8 border border-neutral-900 flex items-center justify-center shrink-0">
                        <span className="font-serif italic text-[16px] text-neutral-900 uppercase leading-none">
                            P
                        </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="font-serif text-[14px] text-neutral-900 leading-tight">Potato</span>
                        <span className="font-light text-[10px] tracking-[2px] uppercase text-neutral-400 leading-tight">
                            Inventory · v1.0
                        </span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-4 py-3 flex flex-col gap-4">

                {/* Action buttons */}
                <div className="flex flex-col gap-2">
                    <button className="flex items-center justify-between h-8 px-4 bg-neutral-900 w-full shrink-0">
                        <div className="flex items-center gap-2.5">
                            <Plus size={14} strokeWidth={1.5} className="text-white" />
                            <span className="font-medium text-[10px] tracking-[2px] uppercase text-white">
                                New Entry
                            </span>
                        </div>
                        <div className="border border-neutral-500 flex items-center justify-center h-[18px] px-1.5 gap-0.5">
                            <Command size={10} strokeWidth={1} className="text-neutral-400" />
                            <span className="font-light text-[10px] text-neutral-400 uppercase">N</span>
                        </div>
                    </button>
                    <button className="flex items-center justify-between h-8 px-4 bg-neutral-50 border border-neutral-200 w-full shrink-0">
                        <div className="flex items-center gap-2.5">
                            <Search size={14} strokeWidth={1.5} className="text-neutral-400" />
                            <span className="font-medium text-[10px] tracking-[2px] uppercase text-neutral-400">
                                Search...
                            </span>
                        </div>
                        <div className="border border-neutral-300 flex items-center justify-center h-[18px] px-1.5 gap-0.5">
                            <Command size={10} strokeWidth={1} className="text-neutral-400" />
                            <span className="font-light text-[10px] text-neutral-400 uppercase">K</span>
                        </div>
                    </button>
                </div>

                {/* Primary nav */}
                <div className="divide-y divide-neutral-200">
                    <NavItem
                        icon={<LayoutDashboard size={14} />}
                        label="Dashboard"
                        href="/"
                        active={path === "/"}
                    />
                    <NavItem
                        icon={<Users size={14} />}
                        label="Team"
                        href="/team"
                        active={path === "/team"}
                    />
                </div>

                {/* Library */}
                <NavSection label="Library">
                    <NavItem
                        icon={<Package size={14} />}
                        label="Parts"
                        href="/parts"
                        active={path.startsWith("/parts")}
                    />
                    <NavItem
                        icon={<Building2 size={14} />}
                        label="Vendors"
                        href="/vendors"
                        active={path.startsWith("/vendors")}
                    />
                    <NavItem
                        icon={<ReceiptText size={14} />}
                        label="Purchase Orders"
                        href="/purchase-orders"
                        active={path.startsWith("/purchase-orders")}
                    />
                    <NavItem
                        icon={<LayoutGrid size={14} />}
                        label="BOMs"
                        href="/boms"
                        active={path === "/boms"}
                    />
                </NavSection>

                {/* Projects: live BOMs */}
                {boms.length > 0 && (
                    <NavSection label="Projects">
                        {boms.map((bom, i) => (
                            <NavItem
                                key={bom.bom_id}
                                icon={
                                    <span
                                        className={cn(
                                            "size-2 rounded-full inline-block shrink-0",
                                            DOT_COLORS[i % DOT_COLORS.length]
                                        )}
                                    />
                                }
                                label={bom.job_no ?? bom.title ?? "Untitled"}
                                href={`/boms/${bom.job_no}/info`}
                                active={path === `/boms/${bom.job_no}/info`}
                            />
                        ))}
                    </NavSection>
                )}

            </SidebarContent>

            {/* Footer */}
            <SidebarFooter className="px-4 pb-4 pt-0 flex flex-col gap-2">
                <div className="border-t border-neutral-200 pt-2 divide-y divide-neutral-200">
                    <NavItem
                        icon={<MessageCircle size={14} />}
                        label="Feedback"
                        href="/feedback"
                        active={path === "/feedback"}
                    />
                    <NavItem
                        icon={<Settings size={14} />}
                        label="Settings"
                        href="/settings"
                        active={path === "/settings"}
                    />
                </div>
                <NavUser user={navUser} />
            </SidebarFooter>

        </Sidebar>
    )
}
