"use client"

import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet,
} from "@/components/ui/field"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Checkbox } from "../ui/checkbox"
import { useState, useEffect } from "react"
import { type Vendor, listVendors } from "@/apis/vendors"
import { Controller, type ControllerRenderProps, type ControllerFieldState, useForm } from "react-hook-form"
import * as z from "zod"
import { type Part } from "@/apis/parts"
import { zodResolver } from "@hookform/resolvers/zod"
import { createVendorPart } from "@/apis/vendorParts"

export const formSchema = z.object({
    part_id: z.string().min(1, "required"),
    vendor_id: z.string().min(1, "required"),
    part_no: z.string().optional(),
    description: z.string().optional(),
    is_primary: z.boolean(),
    created_by: z.string().min(1, "required"),
    updated_by: z.string().optional()
})

interface FormProps {
    open: boolean
    onUpdate: () => void
    part: Part
    formId: string
}

export function AddVendorForm({ open, onUpdate, part, formId }: FormProps) {
    const [vendors, setVendors] = useState<Vendor[]>([])

    useEffect(() => {
        async function fetchData() {
            const vendorList = await listVendors()
            setVendors(vendorList)
        }
        fetchData()
    }, [])

    useEffect(() => {
        if (!open) { form.reset() }
    }, [open])

    const form = useForm<z.infer<typeof formSchema>>({
            resolver: zodResolver(formSchema),
            defaultValues: {
                part_id: part.part_id,
                vendor_id: "",
                part_no: "",
                description: "",
                is_primary: false,
                created_by: "0",
                updated_by: "0"
            },
        })

    async function onSubmit(data: z.infer<typeof formSchema>) {
        await createVendorPart(data)
        onUpdate()
    }

    return (
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup className="p-6">
                <FieldSet>
                    <FieldGroup>                              
                        
                        <Controller 
                            name="vendor_id"
                            control={form.control}
                            render={({ field, fieldState }: { 
                                field: ControllerRenderProps<z.infer<typeof formSchema>, "vendor_id">, 
                                fieldState: ControllerFieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="vendor_id">Primary Vendor</FieldLabel>
                                    <Select 
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Vendors</SelectLabel>
                                                {vendors.map((value) => (
                                                    <SelectItem key={value.vendor_id} value={value.vendor_id}>{value.vendor_name}</SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        <Controller 
                            name="is_primary"
                            control={form.control}
                            render={({ field, fieldState }: { 
                                field: ControllerRenderProps<z.infer<typeof formSchema>, "is_primary">, 
                                fieldState: ControllerFieldState }) => (
                                <Field orientation={"horizontal"} data-invalid={fieldState.invalid}>
                                    <Checkbox 
                                        id="is-assembly" 
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        onBlur={field.onBlur}
                                        ref={field.ref}
                                    />
                                    <FieldContent>
                                        <FieldLabel htmlFor="is-assembly">Is this the primary vendor?</FieldLabel>
                                        <FieldDescription>
                                            By clicking this checkbox, this vendor is considered the primary vendor.
                                        </FieldDescription>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}                                                
                                    </FieldContent>
                                </Field>
                            )}
                        />

                    </FieldGroup>
                </FieldSet>
                <FieldSeparator />
                <FieldSet>
                    <FieldLegend>Unique Vendor Info</FieldLegend>
                    <FieldDescription>Input any unique vendor information about {part.part_no}.</FieldDescription>
                    
                    <Field data-invalid={!!form.formState.errors.part_no} >
                        <FieldLabel htmlFor="part-no">Vendor Part No.</FieldLabel>
                        <Input 
                            id="part-no" 
                            {...form.register("part_no")} 
                            aria-invalid={!!form.formState.errors.part_no}
                        />
                        {form.formState.errors.part_no && (
                            <FieldError errors={[form.formState.errors.part_no]} />
                        )}
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="description">Vendor Description</FieldLabel>
                        <Textarea 
                            id="description"
                            {...form.register("description")} 
                            placeholder="Enter part description"
                        />
                    </Field>  

                </FieldSet>
            </FieldGroup>
        </form>
    )
}