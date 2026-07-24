
interface DataPointProps {
    label: string
    children: React.ReactNode
}

export function DataPoint({ label, children }: DataPointProps) {

    return (
        <div className="flex flex-col gap-2 w-full px-4">
            <span className="font-mono text-xs tracking-[2px] text-neutral-500">{label.toUpperCase()}</span>
            {children}
        </div>
    )
}

interface DataPoint2Props {
    label: string
    value: string
}

export function DataPoint2({ label, value }: DataPoint2Props) {

    return (
        <div className="flex flex-col gap-2 w-full px-4">
            <span className="font-mono text-xs tracking-[2px] text-neutral-500">{label.toUpperCase()}</span>
            <span className="font-serif text-neutral-800">{value}</span>
        </div>
    )
}