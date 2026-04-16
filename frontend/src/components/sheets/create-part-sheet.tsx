"use client"

import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "../ui/button"
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
    FieldTitle,
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
import { Controller, type ControllerRenderProps, type ControllerFieldState, type UseFormReturn, useForm } from "react-hook-form"
import * as z from "zod"
import { createPart } from "@/apis/parts"
import { zodResolver } from "@hookform/resolvers/zod"

export const formSchema = z.object({
    part_no: z.string().min(1, "Part number is required"),
    description: z.string().optional(),
    is_assembly: z.boolean(),
    vendor: z.string().optional()
})

interface CreatePartSheetProps {
    open: boolean,
    onOpenChange: (open: boolean) => void
    onPartCreated: () => void
}

export function CreatePartSheet({ open, onOpenChange, onPartCreated }: CreatePartSheetProps) {
    const [vendors, setVendors] = useState<Vendor[]>([])

    useEffect(() => {
        async function fetchData() {
            const vendorList = await listVendors()
            setVendors(vendorList)
        }
        fetchData()
    }, [])

    const form = useForm<z.infer<typeof formSchema>>({
            resolver: zodResolver(formSchema),
            defaultValues: {
                part_no: "",
                description: "",
                is_assembly: false,
                vendor: "none"
            },
        })

    async function onSubmit(data: z.infer<typeof formSchema>) {
        await createPart({
            part_no: data.part_no,
            description: data.description ?? null,
            is_assembly: data.is_assembly,
            workflow_id: "0",
            created_by: "0",
            updated_by: "0",
        })
        console.log(data)
        form.reset()
        onOpenChange(false)
        onPartCreated()
    }

    return (
        <Sheet open={open} onOpenChange={(value) => {
            if (!value) form.reset()
                onOpenChange(value)
        }}>
            <SheetContent>

                <SheetHeader className="border-b-1 border-neutral-200">
                    <SheetTitle>Create a Part</SheetTitle>
                    <SheetDescription>Create a part with a unique part number.</SheetDescription>
                </SheetHeader>

                <form id="create-part-form" onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup className="p-6">
                        <FieldSet>
                            {/* Include this when more sets are added */}
                            {/* <FieldLegend>Part Info</FieldLegend>
                            <FieldDescription>Describe the part and its relevant information.</FieldDescription> */}
                            <FieldGroup>
                                <Field data-invalid={!!form.formState.errors.part_no} >
                                    <FieldLabel htmlFor="part-no">Part No.</FieldLabel>
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
                                    <FieldLabel htmlFor="description">Description</FieldLabel>
                                    <Textarea 
                                        id="description"
                                        {...form.register("description")} 
                                        placeholder="Enter part description"
                                    />
                                </Field>                                
                                <Controller 
                                    name="vendor"
                                    control={form.control}
                                    render={({ field, fieldState }: { 
                                        field: ControllerRenderProps<z.infer<typeof formSchema>, "vendor">, 
                                        fieldState: ControllerFieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="vendor">Primary Vendor</FieldLabel>
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
                                                        {vendors.map((value) => (
                                                            <SelectItem key={value.vendor_id} value={value.name}>{value.name}</SelectItem>
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

                <SheetFooter className="border-t-1 border-neutral-200">
                    <Button type="submit" form="create-part-form" >Save</Button>
                    <Button variant="secondary" onClick={() => {
                        form.reset()
                        onOpenChange(false)
                    }}>Cancel</Button>
                </SheetFooter>

            </SheetContent>
        </Sheet>
    )
}