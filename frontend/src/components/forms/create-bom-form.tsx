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
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { createBom, updateBom, type Bom } from "@/apis/boms"
import { useEffect } from "react"

export const formSchema = z.object({
    title: z.string().optional(),
    job_no: z.string().optional(),
    description: z.string().optional(),
    created_by: z.string().min(1, "required"),
    updated_by: z.string().optional()
})

interface FormProps {
    open: boolean,
    onUpdate: () => void,
    formId: string
    bom?: Bom
}

export function CreateBomForm({ open, onUpdate, formId, bom }: FormProps) {

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            job_no: "",
            description: "",
            created_by: '00000000-0000-0000-0000-000000000000',
            updated_by: '00000000-0000-0000-0000-000000000000'
        },
    })

    useEffect(() => {
        if (bom) {
            form.reset({
                title: bom.title ?? "",
                job_no: bom.job_no ?? "",
                description: bom.description ?? "",
                created_by: '00000000-0000-0000-0000-000000000000',
                updated_by: '00000000-0000-0000-0000-000000000000',
            })
        } else {
            form.reset()
        }
    }, [open])

    async function onSubmit(data: z.infer<typeof formSchema>) {
        if (bom) {
            await updateBom(bom.bom_id, {
                title: data.title,
                job_no: data.job_no,
                description: data.description,
                updated_by: '00000000-0000-0000-0000-000000000000',
            })
        } else {
            await createBom(data)
        }
        onUpdate()
    }

    const { errors } = form.formState   // error object

    return (
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
            <FieldSet className="p-6">
                <FieldGroup>

                    <Field data-invalid={!!errors.title} >
                        <FieldLabel htmlFor="title">Title</FieldLabel>
                        <Input 
                            id="title" 
                            {...form.register("title")} 
                            aria-invalid={!!errors.title}
                        />
                        {errors.title && (
                            <FieldError errors={[errors.title]} />
                        )}
                    </Field>

                    <Field data-invalid={!!errors.job_no} >
                        <FieldLabel htmlFor="job-no">Job No.</FieldLabel>
                        <Input 
                            id="job-no" 
                            {...form.register("job_no")} 
                            aria-invalid={!!errors.job_no}
                        />
                        {errors.job_no && (
                            <FieldError errors={[errors.job_no]} />
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
        </form>
    )
}