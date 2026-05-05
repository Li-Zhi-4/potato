"use client"

import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
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
import { createPart } from "@/apis/parts"
import { zodResolver } from "@hookform/resolvers/zod"
import { createVendorPart } from "@/apis/vendorParts"


export const formSchema = z.object({
    part_no: z.string().min(1, "Part number is required"),
    description: z.string().optional(),
    is_assembly: z.boolean(),
    vendor_id: z.string()
})

interface FormProps {
    open: boolean,
    onUpdate: () => void
    formId: string
}

export function CreatePartForm({ open, onUpdate, formId }: FormProps) {
    const [vendorsData, setVendorsData] = useState<Vendor[]>([])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            part_no: "",
            description: "",
            is_assembly: false,
            vendor_id: "none"
        },
    })

    useEffect(() => {
        async function fetchData() {
            const vendorList = await listVendors()
            setVendorsData(vendorList)
        }
        fetchData()
    }, [])

    useEffect(() => {
        if (!open) { form.reset() }
    }, [open])

    async function onSubmit(data: z.infer<typeof formSchema>) {
        const response = await createPart({
            part_no: data.part_no,
            description: data.description ?? null,
            is_assembly: data.is_assembly,
            created_by: "0",
            updated_by: "0",
        })
        if (data.vendor_id !== "none"){
            await createVendorPart({
                part_id: response.part_id,
                vendor_id: data.vendor_id,
                is_primary: true,
                created_by: "0",
                updated_by: "0"
            })
        }
        onUpdate()
    }

    const { errors } = form.formState   // error object

    return (
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
                <FieldSet className="p-6">
                    {/* Include this when more sets are added */}
                    {/* <FieldLegend>Part Info</FieldLegend>
                    <FieldDescription>Describe the part and its relevant information.</FieldDescription> */}
                    <FieldGroup>
                        
                        <Field data-invalid={!!errors.part_no} >
                            <FieldLabel htmlFor="part-no">Part No.</FieldLabel>
                            <Input 
                                id="part-no" 
                                aria-invalid={!!errors.part_no}
                                {...form.register("part_no")} 
                            />
                            {errors.part_no && <FieldError errors={[errors.part_no]} />}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="description">Description</FieldLabel>
                            <Textarea 
                                id="description"
                                placeholder="Enter part description"
                                {...form.register("description")} 
                            />
                        </Field> 

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
                                                <SelectItem value="none">None</SelectItem>
                                                {vendorsData.map((value) => (
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
                            name="is_assembly"
                            control={form.control}
                            render={({ field, fieldState }: { 
                                field: ControllerRenderProps<z.infer<typeof formSchema>, "is_assembly">, 
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
                                        <FieldLabel htmlFor="is-assembly">Is this an assembly?</FieldLabel>
                                        <FieldDescription>
                                            By clicking this checkbox, this part is considered an assembly.
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
                {/* <FieldSeparator />
                <FieldSet>
                    <FieldLegend>Workflow Info</FieldLegend>
                    <FieldDescription>Attach a workflow to this part.</FieldDescription>
                    <FieldGroup>
                        <FieldLabel htmlFor="workflow">Workflow Id</FieldLabel>
                            <Input 
                                id="workflow"
                                placeholder="Enter a workflow id"
                                required
                            />
                    </FieldGroup>
                </FieldSet> */}
            </FieldGroup>
        </form>
    )
}