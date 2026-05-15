"use client"

import {
    Field,
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
import { useState, useEffect } from "react"
import { type Vendor, listVendors } from "@/apis/vendors"
import { Controller, type ControllerRenderProps, type ControllerFieldState, useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { createPurchaseOrder, updatePurchaseOrder, type PurchaseOrder } from "@/apis/purchaseOrders"

export const formSchema = z.object({
    po_no: z.string().min(1, "Purchase order number is required"),
    vendor_id: z.string().min(1, "required"),
    status: z.enum(["draft", "sent", "received", "cancelled"]),
    created_by: z.string().min(1, "required"),
    updated_by: z.string().optional()
})

interface FormProps {
    open: boolean,
    onUpdate: () => void
    formId: string
    purchaseOrder?: PurchaseOrder
}

export function CreatePurchaseOrderForm({ open, onUpdate, formId, purchaseOrder }: FormProps) {
    const [vendorsData, setVendorsData] = useState<Vendor[]>([])

    useEffect(() => {
        async function fetchData() {
            const vendorList = await listVendors()
            setVendorsData(vendorList)
        }
        fetchData()
    }, [])

    useEffect(() => {
        if (purchaseOrder) {
            form.reset({
                po_no: purchaseOrder.po_no ?? "",
                vendor_id: purchaseOrder.vendor_id,
                status: purchaseOrder.status,
                created_by: '00000000-0000-0000-0000-000000000000',
                updated_by: '00000000-0000-0000-0000-000000000000',
            })
        } else {
            form.reset()
        }
    }, [open])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            po_no: purchaseOrder?.po_no ?? "",
            vendor_id: purchaseOrder?.vendor_id ?? "",
            status: purchaseOrder?.status ?? "draft",
            created_by: '00000000-0000-0000-0000-000000000000',
            updated_by: '00000000-0000-0000-0000-000000000000',
        },
    })

    async function onSubmit(data: z.infer<typeof formSchema>) {
        if (purchaseOrder) {
            await updatePurchaseOrder(purchaseOrder.po_id, {
                po_no: data.po_no,
                vendor_id: data.vendor_id,
                status: data.status,
                updated_by: '00000000-0000-0000-0000-000000000000',
            })
        } else {
            await createPurchaseOrder(data)
        }
        onUpdate()
    }

    const { errors } = form.formState   // error object

    return (
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
            <FieldSet className="p-6">
                <FieldGroup>

                    <Field data-invalid={!!errors.po_no} >
                        <FieldLabel htmlFor="po-no">Purchase Order No.</FieldLabel>
                        <Input 
                            id="po-no" 
                            {...form.register("po_no")} 
                            aria-invalid={!!errors.po_no}
                        />
                        {errors.po_no && (
                            <FieldError errors={[errors.po_no]} />
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
        </form>
    )
}