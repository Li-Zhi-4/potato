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
import { listParts, type Part } from "@/apis/parts"
import { zodResolver } from "@hookform/resolvers/zod"
import { createPartSubpart } from "@/apis/part_subpart"

export const formSchema = z.object({
    part_id: z.string().optional(),
    subpart_id: z.string().min(1, "required"),
    quantity: z.number().min(1, "required"),
    uom: z.string().min(1, "required"),
})

interface FormSheetProps {
    open: boolean,
    onOpenChange: (open: boolean) => void
    onPartCreated: () => void
    part: Part
}

export function AddSubpartSheet({ open, onOpenChange, onPartCreated, part }: FormSheetProps) {
    const [parts, setParts] = useState<Part[]>([])

    useEffect(() => {
        async function fetchData() {
            const partsList = await listParts()
            setParts(partsList)
        }
        fetchData()
    }, [])

    const form = useForm<z.infer<typeof formSchema>>({
            resolver: zodResolver(formSchema),
            defaultValues: {
                part_id: "",
                subpart_id: "",
                quantity: 1,
                uom: "",
            },
        })

    async function onSubmit(data: z.infer<typeof formSchema>) {
        const response2 = await createPartSubpart({
            part_id: part.part_id,
            subpart_id: data.subpart_id,
            quantity: Number(data.quantity),
            uom: data.uom,

            created_by: "0",
            updated_by: "0"
        })
        console.log(response2)
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
                    <SheetTitle>Add a Subpart</SheetTitle>
                    <SheetDescription>Attach a subpart to {part.part_no}.</SheetDescription>
                </SheetHeader>

                <form id="add-vendor-form" onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup className="p-6">
                        <FieldSet>
                            {/* Include this when more sets are added */}
                            {/* <FieldLegend>Part Info</FieldLegend>
                            <FieldDescription>Describe the part and its relevant information.</FieldDescription> */}
                            <FieldGroup>                              
                                <Controller 
                                    name="subpart_id"
                                    control={form.control}
                                    render={({ field, fieldState }: { 
                                        field: ControllerRenderProps<z.infer<typeof formSchema>, "subpart_id">, 
                                        fieldState: ControllerFieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="subpart_id">Subpart</FieldLabel>
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
                                                        {parts.map((value) => (
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
                            </FieldGroup>
                        </FieldSet>
                    </FieldGroup>
                </form>

                <SheetFooter className="border-t-1 border-neutral-200">
                    <Button type="submit" form="add-vendor-form" onClick={() => console.log("Errors:", form.formState.errors)}>Save</Button>
                    <Button variant="secondary" onClick={() => {
                        form.reset()
                        onOpenChange(false)
                    }}>Cancel</Button>
                </SheetFooter>

            </SheetContent>
        </Sheet>
    )
}