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
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from "@/components/ui/field"
import { Input } from "../ui/input"
import { createVendor } from "@/apis/vendors"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

export const formSchema = z.object({
    vendor_name: z.string().min(1, "Vendor name is required"),
    created_by: z.string().optional(),
    updated_by: z.string().optional(), 
})

interface FormSheetProps {
    open: boolean,
    onOpenChange: (open: boolean) => void
    onUpdate: () => void
}

export function CreateVendorSheet({ open, onOpenChange, onUpdate }: FormSheetProps) {

    const form = useForm<z.infer<typeof formSchema>>({
            resolver: zodResolver(formSchema),
            defaultValues: {
                vendor_name: "",
                created_by: "0",
                updated_by: "0"
            },
        })

    async function onSubmit(data: z.infer<typeof formSchema>) {
        await createVendor({
            vendor_name: data.vendor_name,
            created_by: "0",
            updated_by: "0"
        })
        form.reset()
        onOpenChange(false)
        onUpdate()
    }

    return (
        <Sheet open={open} onOpenChange={(value) => {
            if (!value) form.reset()
                onOpenChange(value)
        }}>
            <SheetContent>

                <SheetHeader className="border-b-1 border-neutral-200">
                    <SheetTitle>Create a Vendor</SheetTitle>
                    <SheetDescription>Create a new vendor.</SheetDescription>
                </SheetHeader>

                <form id="create-vendor-form" onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup className="p-6">
                        <FieldSet>
                            {/* Include this when more sets are added */}
                            {/* <FieldLegend>Part Info</FieldLegend>
                            <FieldDescription>Describe the part and its relevant information.</FieldDescription> */}
                            <FieldGroup>                              
                                <Field data-invalid={!!form.formState.errors.vendor_name} >
                                    <FieldLabel htmlFor="vendor_name">Vendor Part No.</FieldLabel>
                                    <Input 
                                        id="part-no" 
                                        {...form.register("vendor_name")} 
                                        aria-invalid={!!form.formState.errors.vendor_name}
                                    />
                                    {form.formState.errors.vendor_name && (
                                        <FieldError errors={[form.formState.errors.vendor_name]} />
                                    )}
                                </Field>
                            </FieldGroup>
                        </FieldSet>
                    </FieldGroup>
                </form>

                <SheetFooter className="border-t-1 border-neutral-200">
                    <Button type="submit" form="create-vendor-form" onClick={() => console.log("Errors:", form.formState.errors)}>Save</Button>
                    <Button variant="secondary" onClick={() => {
                        form.reset()
                        onOpenChange(false)
                    }}>Cancel</Button>
                </SheetFooter>

            </SheetContent>
        </Sheet>
    )
}