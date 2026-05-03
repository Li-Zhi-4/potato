"use client"

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
import { useEffect } from "react"
import { type CreateVendorInput } from "@/apis/vendors"

// Matches type CreateVendorInput
export const formSchema = z.object({
    vendor_name: z.string().min(1, "required"),
    created_by: z.string(),
    updated_by: z.string().nullable(), 
})

interface FormSheetProps {
    open: boolean,
    onUpdate: () => void
    formId: string
}

export function CreateVendorForm({ open, onUpdate, formId }: FormSheetProps) {

    const form = useForm<CreateVendorInput>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            vendor_name: "",
            created_by: "0",
            updated_by: "0"
        },
    })

    useEffect(() => {
        if (!open) { form.reset() }
    }, [open])

    async function onSubmit(data: CreateVendorInput) {
        await createVendor(data)
        onUpdate()  
    }

    const { errors } = form.formState   // error object

    return (
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup className="p-6">
                <FieldSet>
                    <FieldGroup>                              
                        
                        <Field data-invalid={!!errors.vendor_name} >
                            <FieldLabel htmlFor="vendor_name">Vendor Name</FieldLabel>
                            <Input 
                                id="vendor_name" 
                                aria-invalid={!!errors.vendor_name}
                                {...form.register("vendor_name")} 
                            />
                            {errors.vendor_name && <FieldError errors={[errors.vendor_name]} />}
                        </Field>

                    </FieldGroup>
                </FieldSet>
            </FieldGroup>
        </form>
    )
}