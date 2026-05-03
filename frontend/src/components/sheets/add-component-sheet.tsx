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
import { getBom, type Bom } from "@/apis/boms"
import { createComponent } from "@/apis/components"
import { listParts } from "@/apis/parts"
import { type Part } from "@/apis/parts"
import { listPurchaseOrders, type PurchaseOrder } from "@/apis/purchaseOrders"

export const formSchema = z.object({
    bom_id: z.string(),
    part_id: z.string().min(1, "required"),
    po_id: z.string(),
    quantity: z.number().min(1, "required"),
    uom: z.string().min(1, "required"),
    status: z.string()
})

interface FormSheetProps {
    open: boolean,
    onOpenChange: (open: boolean) => void
    onUpdate: () => void
    bom: Bom
}

export function AddComponentSheet({ open, onOpenChange, onUpdate, bom }: FormSheetProps) {
    const [bomData, setBomData] = useState<Bom>()
    const [partsData, setPartsData] = useState<Part[]>([])
    const [poData, setPoData] = useState<PurchaseOrder[]>([])

    useEffect(() => {
        async function fetchData() {
            const b = await getBom(bom.bom_id)
            const p = await listParts()
            const pos = await listPurchaseOrders()
            setBomData(b)
            setPartsData(p)
            setPoData(pos)
        }
        fetchData()
    }, [])

    const form = useForm<z.infer<typeof formSchema>>({
            resolver: zodResolver(formSchema),
            defaultValues: {
                bom_id: "",
                part_id: "",
                po_id: "",
                quantity: 1,
                uom: "",
                status: ""
            },
        })

    async function onSubmit(data: z.infer<typeof formSchema>) {
        await createComponent({
            bom_id: bom.bom_id,
            part_id: data.part_id,
            po_id: data.po_id,
            quantity: Number(data.quantity),
            uom: data.uom,
            status: data.status,

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
                    <SheetTitle>Add a Component</SheetTitle>
                    <SheetDescription>Attach a subpart to {bomData?.bom_id}.</SheetDescription>
                </SheetHeader>

                <form id="add-component-form" onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup className="p-6">
                        <FieldSet>
                            {/* Include this when more sets are added */}
                            {/* <FieldLegend>Part Info</FieldLegend>
                            <FieldDescription>Describe the part and its relevant information.</FieldDescription> */}
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
                    </FieldGroup>
                </form>

                <SheetFooter className="border-t-1 border-neutral-200">
                    <Button type="submit" form="add-component-form" onClick={() => console.log("Errors:", form.formState.errors)}>Save</Button>
                    <Button variant="secondary" onClick={() => {
                        form.reset()
                        onOpenChange(false)
                    }}>Cancel</Button>
                </SheetFooter>

            </SheetContent>
        </Sheet>
    )
}