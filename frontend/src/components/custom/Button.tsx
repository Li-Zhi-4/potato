import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"
import { Command } from "lucide-react"

const buttonVariants = cva([
    "flex items-center justify-between overflow-hidden",    // layout
    "h-8 w-60 px-4 py-0.5", // sizing
    "bg-primary border border-primary border-solid",    // background & border
    "text-white" // text & font
])

export function Button({
    className,
    // variant = "default",
    asChild = false,
    children,
    ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & {asChild?: boolean}) {
    const Comp = asChild ? Slot.Root : "button"

    return (
       <Comp
            data-slot="button"
            // data-variant={variant}
            className={cn(buttonVariants({ className }))}
            {...props}
        >
            <div className="font-mono flex items-center gap-[10px]">
                {children}
            </div>

            <div className="flex items-center justify-center border-[0.5px] border-white px-[6px] py-[2px] w-8 font-mono font-light text-[10px]">
                <Command size={10} />K
            </div>
        </Comp>
    )
}