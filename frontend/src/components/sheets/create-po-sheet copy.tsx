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
import { createPurchaseOrder } from "@/apis/purchaseOrders"

export const formSchema = z.object({
    po_no: z.string().min(1, "Purchase order number is required"),
    vendor_id: z.string().min(1, "required"),
    status: z.enum(["draft", "sent", "received", "cancelled"]),
})

interface FormSheetProps {
    open: boolean,
    onOpenChange: (open: boolean) => void
    onUpdate: () => void
}

export function CreatePurchaseOrderSheet({ open, onOpenChange, onUpdate }: FormSheetProps) {
    const [vendorsData, setVendorsData] = useState<Vendor[]>([])

    useEffect(() => {
        async function fetchData() {
            const vendorList = await listVendors()
            setVendorsData(vendorList)
        }
        fetchData()
    }, [])

    const form = useForm<z.infer<typeof formSchema>>({
            resolver: zodResolver(formSchema),
            defaultValues: {
                po_no: "",
                vendor_id: "",
                status: "draft"
            },
        })

    async function onSubmit(data: z.infer<typeof formSchema>) {
        await createPurchaseOrder({
            po_no: data.po_no,
            vendor_id: data.vendor_id,
            status: data.status,
            created_by: "0",
            updated_by: "0",
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
                                <Field data-invalid={!!form.formState.errors.po_no} >
                                    <FieldLabel htmlFor="po-no">Purchase Order No.</FieldLabel>
                                    <Input 
                                        id="po-no" 
                                        {...form.register("po_no")} 
                                        aria-invalid={!!form.formState.errors.po_no}
                                    />
                                    {form.formState.errors.po_no && (
                                        <FieldError errors={[form.formState.errors.po_no]} />
                                    )}
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
                                    name="status"
                                    control={form.control}
                                    render={({ field, fieldState }: { 
                                        field: ControllerRenderProps<z.infer<typeof formSchema>, "status">, 
                                        fieldState: ControllerFieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="vendor_id">Status</FieldLabel>
                                            <Select 
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectLabel>Status</SelectLabel>
                                                        <SelectItem value="draft">Draft</SelectItem>
                                                        <SelectItem value="sent">Sent</SelectItem>
                                                        <SelectItem value="received">Received</SelectItem>
                                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />
                            </FieldGroup>
                        </FieldSet>
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