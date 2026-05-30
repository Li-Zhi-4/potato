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
import { listParts, type Part } from "@/apis/parts"
import { zodResolver } from "@hookform/resolvers/zod"
import { createAssemblyPart } from "@/apis/assembly_parts"
import { useAuth } from "@/context/authContext"
import { useNavigate } from "react-router-dom"

export const formSchema = z.object({
    part_id: z.string().optional(),
    subpart_id: z.string().min(1, "required"),
    quantity: z.number().min(1, "required"),
    uom: z.string().min(1, "required"),
    created_by: z.string().optional(),
    updated_by: z.string().optional()
})

interface FormProps {
    open: boolean
    onUpdate: () => void
    part: Part
    formId: string
}

export function AddSubpartForm({ open, onUpdate, part, formId }: FormProps) {
    const [parts, setParts] = useState<Part[]>([])
    const { token, user, loading } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!token) return
        async function fetchData() {
            const partsList = await listParts(token!)
            setParts(partsList)
        }
        fetchData()
    }, [token])

    useEffect(() => {
        if (!open) { form.reset() }
    }, [open])

    const form = useForm<z.infer<typeof formSchema>>({
            resolver: zodResolver(formSchema),
            defaultValues: {
                part_id: "",
                subpart_id: "",
                quantity: 1,
                uom: "",
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
        await createAssemblyPart({
            part_id: part.part_id,
            subpart_id: data.subpart_id,
            quantity: Number(data.quantity),
            uom: data.uom,

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
        </form>
    )
}