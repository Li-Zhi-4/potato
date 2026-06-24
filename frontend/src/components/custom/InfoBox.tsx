import { cn } from "@/lib/utils"

interface InfoBoxGroupProps {
    children: React.ReactNode
}

export function InfoBoxGroup({ children }: InfoBoxGroupProps) {

    return (
       <div className="grid grid-cols-2 gap-0 w-fit h-fit">
            {children}
        </div>
    )
}

interface InfoBoxProps {
    label: string
    value: string
    className?: string
}

export function InfoBox({ label, value, className }: InfoBoxProps) {

    return (
        <div className={cn("flex flex-col px-4 py-[18px] w-50 h-fit border border-neutral-200 -mt-px -ml-px", className)}>
            <div className="font-mono text-xs tracking-[2px] text-neutral-500">{label.toUpperCase()}</div>
            <div className="font-serif text-4xl text-neutral-800">{value}</div>
        </div>
    )
}

export function InfoBoxSpecial({ label, value, className }: InfoBoxProps) {
 
    return (
        <div className={cn("flex flex-col px-4 py-[18px] w-50 h-fit border border-neutral-200 -mt-px -ml-px bg-neutral-50", className)}>
            <div className="font-mono text-xs tracking-[2px] text-neutral-500">{label.toUpperCase()}</div>
            <div className="font-serif text-4xl text-primary">{value}</div>
        </div>
    )
}