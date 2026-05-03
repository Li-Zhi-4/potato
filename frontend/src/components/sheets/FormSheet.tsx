"use client"

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "../ui/button"

interface FormSheetProps {
    title: string,
    description?: string,
    open: boolean,
    onOpenChange: (open: boolean) => void
    formId: string
    children: React.ReactNode
}

export function FormSheet({ 
    title,
    description,
    open, 
    onOpenChange, 
    formId,
    children
}: FormSheetProps) {

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent>

                <SheetHeader className="border-b-1 border-neutral-200">
                    <SheetTitle>{title}</SheetTitle>
                    {description && <SheetDescription>{description}</SheetDescription>}
                </SheetHeader>

                {children}

                <SheetFooter className="border-t-1 border-neutral-200">
                    <Button type="submit" form={formId}>Save</Button>
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
                </SheetFooter>

            </SheetContent>
        </Sheet>
    )
}