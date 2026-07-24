import * as React from "react"

interface SectionHeaderProps {
    label: string
    title: string
    titleAccent?: string
    description?: string
    action?: React.ReactNode
}

export function SectionHeader({ label, title, titleAccent, description, action }: SectionHeaderProps) {
    return (
        <div className="flex flex-col gap-2 w-full">

            {/* Label + divider */}
            <div className="flex items-center gap-4 w-full">
                <span className="text-[10px] tracking-[2px] uppercase text-neutral-400 whitespace-nowrap shrink-0">
                    {label}
                </span>
                <div className="flex-1 border-t border-neutral-200" />
            </div>

            {/* Title row + action */}
            <div className="flex items-center justify-between w-full">
                <p className="font-serif text-[32px] leading-normal">
                    {title}{titleAccent && <> <span className="italic text-primary">{titleAccent}</span></>}
                </p>
                {action && <div>{action}</div>}
            </div>

            {/* Description */}
            {description && (
                <p className="font-serif text-sm text-neutral-500">{description}</p>
            )}

        </div>
    )
}
