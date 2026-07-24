import * as React from "react"
import { cn } from "@/lib/utils"
import { CustomBadge } from "./CustomBadge"

export interface Tab {
    value: string
    label: string
    icon?: React.ReactNode
    count?: number
}

interface TabsProps {
    tabs: Tab[]
    value: string
    onValueChange: (value: string) => void
    action?: React.ReactNode
    children: React.ReactNode
}

export function Tabs({ tabs, value, onValueChange, action, children }: TabsProps) {
    return (
        <div className="flex flex-col gap-6">
            <div className="border-t border-b border-neutral-200 flex h-12 items-center w-full">
                {tabs.map((tab) => {
                    const isActive = value === tab.value
                    return (
                        <button
                            key={tab.value}
                            onClick={() => onValueChange(tab.value)}
                            className="border-r border-neutral-200 flex flex-col h-full items-start overflow-hidden shrink-0"
                        >
                            <div className="flex flex-1 items-center gap-3 px-4 pt-1 pb-0.5">
                                {tab.icon}
                                <span className="text-[10px] font-medium tracking-[2px] uppercase text-neutral-500 whitespace-nowrap">
                                    {tab.label}
                                </span>
                                {tab.count !== undefined && (
                                    <CustomBadge variant={isActive ? "default" : "inactive"}>
                                        {String(tab.count)}
                                    </CustomBadge>
                                )}
                            </div>
                            <div className={cn("h-[2px] w-full shrink-0", isActive ? "bg-primary" : "")} />
                        </button>
                    )
                })}
            </div>
            {action && <div className="flex justify-end">{action}</div>}
            {children}
        </div>
    )
}

interface TabContentProps {
    value: string
    activeValue: string
    children: React.ReactNode
}

export function TabContent({ value, activeValue, children }: TabContentProps) {
    if (value !== activeValue) return null
    return <>{children}</>
}
