"use client"

import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from "@/components/ui/field"
import { Input } from "../ui/input"
import { createVendor, updateVendor, type Vendor } from "@/apis/vendors"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"


export const formSchema = z.object({
    vendor_name: z.string().min(1, "required"),
    created_by: z.string(),
    updated_by: z.string().nullable(), 
})

interface FormProps {
    open: boolean,
    onUpdate: () => void
    formId: string
    vendor?: Vendor
}

export function CreateVendorForm({ open, onUpdate, formId, vendor }: FormProps) {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            vendor_name: vendor?.vendor_name || "",
            created_by: '00000000-0000-0000-0000-000000000000',
            updated_by: '00000000-0000-0000-0000-000000000000'
        },
    })

    useEffect(() => {
        if (vendor) { 
            form.reset({
                vendor_name: vendor.vendor_name,
                created_by: '00000000-0000-0000-0000-000000000000',
                updated_by: '00000000-0000-0000-0000-000000000000'
            }) 
        } else {
            form.reset() 
        }
    }, [open])

    async function onSubmit(data: z.infer<typeof formSchema>) {
        if (vendor) {
            await updateVendor(vendor.vendor_id, {
                vendor_name: data.vendor_name,
                updated_by: '00000000-0000-0000-0000-000000000000'
            })
        } else {
            await createVendor(data)
        }
        onUpdate()  
    }

    const { errors } = form.formState   // error object

    return (
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
            <FieldSet className="p-6">
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
        </form>
    )
}