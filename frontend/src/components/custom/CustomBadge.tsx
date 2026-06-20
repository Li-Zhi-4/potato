import { Badge } from "../ui/badge"


export function CustomBadge({ children }: { children: string }) {

    return (
       <Badge className="rounded-none bg-primary font-mono px-[6px] h-[18px] tracking-[2px]">
            {children}
        </Badge>
    )
}