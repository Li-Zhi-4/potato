import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"
import { Command } from "lucide-react"

const buttonVariants = cva(
    [
        "flex items-center justify-between overflow-hidden",    // layout
        "border border-solid", // background & border
        "h-8 w-60 px-4 py-0.5", // sizing
        "text-white", // text & font
    ],
    {
        variants: {
            variant: {
                default: "bg-primary border-primary",
                outline: "border-neutral-200 text-neutral-400",
                secondary: "bg-neutral-900 border-neutral-900"
            }
        },
        defaultVariants: {
            variant: "default"
        }
    }
)

export function Button({
    className,
    variant = "default",
    asChild = false,
    children,
    command,
    ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & {
    asChild?: boolean,
    command?: string
}) {
    const Comp = asChild ? Slot.Root : "button"
    const commandClass = {
        default: "border-white text-white",
        outline: "border-neutral-400 text-neutral-400",
        secondary: "border-white text-white",
    }[variant ?? "default"]

    return (
       <Comp
            data-slot="button"
            data-variant={variant}
            className={cn(buttonVariants({ variant, className }))}
            {...props}
        >
            <div className="flex items-center gap-[10px] tracking-[2px] font-light text-[12px] uppercase">
                {children}
            </div>

            {command && <div className={cn("flex items-center justify-center border-[0.5px] px-[6px] py-[2px] w-8 h-[18px] font-mono font-light text-[10px]", commandClass)}>
                <Command size={10} />
                {command}
            </div>}
        </Comp>
    )
}