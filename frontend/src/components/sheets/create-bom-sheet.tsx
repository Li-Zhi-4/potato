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
import { createPartVendor } from "@/apis/part_vendor"
import { createBom, type CreateBomInput } from "@/apis/boms"
import type { Form } from "radix-ui"

export const formSchema = z.object({
    job_no: z.coerce.number().min(1, "required"),
    description: z.string().optional(),
})

interface CreatePartSheetProps {
    open: boolean,
    onOpenChange: (open: boolean) => void
    onPartCreated: () => void
}

export function CreateBOMSheet({ open, onOpenChange, onPartCreated }: CreatePartSheetProps) {

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            job_no: 1,
            description: "",
        },
    })

    async function onSubmit(data: z.infer<typeof formSchema>) {
        await createBom({
            job_no: Number(data.job_no),
            description: data.description ?? null,

            created_by: "0",
            updated_by: "0",
        })
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
                    <SheetTitle>Create a BOM</SheetTitle>
                    <SheetDescription>Create a BOM with a unique job number.</SheetDescription>
                </SheetHeader>

                <form id="create-bom-form" onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup className="p-6">
                        <FieldSet>
                            <FieldGroup>
                                <Field data-invalid={!!form.formState.errors.job_no} >
                                    <FieldLabel htmlFor="job-no">Job No.</FieldLabel>
                                    <Input 
                                        id="job-no" 
                                        type="number"
                                        {...form.register("job_no")} 
                                        aria-invalid={!!form.formState.errors.job_no}
                                    />
                                    {form.formState.errors.job_no && (
                                        <FieldError errors={[form.formState.errors.job_no]} />
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
                            </FieldGroup>
                        </FieldSet>
                    </FieldGroup>
                </form>

                <SheetFooter className="border-t-1 border-neutral-200">
                    <Button type="submit" form="create-bom-form" >Save</Button>
                    <Button variant="secondary" onClick={() => {
                        form.reset()
                        onOpenChange(false)
                    }}>Cancel</Button>
                </SheetFooter>

            </SheetContent>
        </Sheet>
    )
}