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
import { Controller, type ControllerRenderProps, type ControllerFieldState, useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { type Bom } from "@/apis/boms"
import { createComponent } from "@/apis/components"
import { listParts } from "@/apis/parts"
import { type Part } from "@/apis/parts"
import { listPurchaseOrders, type PurchaseOrder } from "@/apis/purchaseOrders"
import { useAuth } from "@/context/authContext"
import { useNavigate } from "react-router-dom"

export const formSchema = z.object({
    bom_id: z.string(),
    part_id: z.string().min(1, "required"),
    po_id: z.string(),
    quantity: z.number().min(1, "required"),
    uom: z.string().min(1, "required"),
    status: z.string(),
    created_by: z.string().optional(),
    updated_by: z.string().optional()
})

interface FormProps {
    open: boolean
    onUpdate: () => void
    bom: Bom
    formId: string
}

export function AddComponentForm({ open, onUpdate, bom, formId }: FormProps) {
    const [partsData, setPartsData] = useState<Part[]>([])
    const [poData, setPoData] = useState<PurchaseOrder[]>([])
    const { token, user, loading } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!token) return
        async function fetchData() {
            const p = await listParts(token!)
            const pos = await listPurchaseOrders(token!)
            setPartsData(p)
            setPoData(pos)
        }
        fetchData()
    }, [token])

    useEffect(() => {
        if (!open) { form.reset() }
    }, [open])

    const form = useForm<z.infer<typeof formSchema>>({
            resolver: zodResolver(formSchema),
            defaultValues: {
                bom_id: "",
                part_id: "",
                po_id: "",
                quantity: 1,
                uom: "",
                status: "",
                created_by: "",
                updated_by: ""
            },
        })

    async function onSubmit(data: z.infer<typeof formSchema>) {
        if (loading) return
        if (!user) {
            navigate("/login")
            return
        }
        await createComponent({
            bom_id: bom.bom_id,
            part_id: data.part_id,
            po_id: data.po_id,
            quantity: Number(data.quantity),
            uom: data.uom,
            status: data.status,

            created_by: user.uid,
            updated_by: user.uid
        }, token!)
        onUpdate()
    }

    return (
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
            <FieldSet className="p-6">
                <FieldGroup> 

                    <Controller 
                        name="part_id"
                        control={form.control}
                        render={({ field, fieldState }: { 
                            field: ControllerRenderProps<z.infer<typeof formSchema>, "part_id">, 
                            fieldState: ControllerFieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="part_id">Part Id</FieldLabel>
                                <Select 
                                    value={field.value}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Parts</SelectLabel>
                                            <SelectItem value="none">None</SelectItem>
                                            {partsData.map((value) => (
                                                <SelectItem key={value.part_id} value={value.part_id}>{value.part_no}</SelectItem>
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
                        name="po_id"
                        control={form.control}
                        render={({ field, fieldState }: { 
                            field: ControllerRenderProps<z.infer<typeof formSchema>, "po_id">, 
                            fieldState: ControllerFieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="po_id">Purchase Orders</FieldLabel>
                                <Select 
                                    value={field.value}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Purchase Orders</SelectLabel>
                                            <SelectItem value="none">None</SelectItem>
                                            {poData.map((value) => (
                                                <SelectItem key={value.po_id} value={value.po_id}>{value.po_no}</SelectItem>
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

                    <Field>
                        <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
                        <Input 
                            id="quantity"
                            type="number"
                            {...form.register("quantity", { valueAsNumber: true })}
                            placeholder="Enter quantity"
                        />
                    </Field> 

                    <Field>
                        <FieldLabel htmlFor="uom">uom</FieldLabel>
                        <Input 
                            id="uom"
                            {...form.register("uom")} 
                            placeholder="Enter uom"
                        />
                    </Field> 

                    <Field>
                        <FieldLabel htmlFor="status">Status</FieldLabel>
                        <Input 
                            id="status"
                            {...form.register("status")} 
                            placeholder="Enter status"
                        />
                    </Field>

                </FieldGroup>
            </FieldSet>
        </form>
    )
}