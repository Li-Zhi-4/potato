import { Badge } from "../ui/badge"
import { cn } from "@/lib/utils"

interface CustomBadgeProps {
    children: string
    variant?: "default" | "inactive"
}

export function CustomBadge({ children, variant = "default" }: CustomBadgeProps) {
    return (
        <Badge className={cn(
            "rounded-none font-mono px-[6px] h-[18px] tracking-[2px]",
            variant === "inactive"
                ? "bg-neutral-200 text-neutral-500 border-neutral-200"
                : "bg-primary border-primary"
        )}>
            {children}
        </Badge>
    )
}