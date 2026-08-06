import { cn } from "@/lib/utils"

interface InfoBoxGroupProps {
    children: React.ReactNode
}

export function InfoBoxGroup({ children }: InfoBoxGroupProps) {

    return (
       <div className="grid grid-cols-2 gap-0 w-full lg:w-fit h-fit border border-neutral-500">
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
        <div className={cn("flex flex-col px-4 py-[18px] w-full lg:w-40 h-fit", className)}>
            <div className="font-mono text-xs tracking-[2px] text-neutral-500">{label.toUpperCase()}</div>
            <div className="font-serif text-4xl text-neutral-800">{value}</div>
        </div>
    )
}

export function InfoBoxSpecial({ label, value, className }: InfoBoxProps) {
 
    return (
        <div className={cn("flex flex-col px-4 py-[18px] w-full lg:w-40 h-fit bg-neutral-50", className)}>
            <div className="font-mono text-xs tracking-[2px] text-neutral-500">{label.toUpperCase()}</div>
            <div className="font-serif text-4xl text-primary">{value}</div>
        </div>
    )
}