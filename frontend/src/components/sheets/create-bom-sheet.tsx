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
import { createBom } from "@/apis/boms"

export const formSchema = z.object({
    title: z.string().optional(),
    job_no: z.coerce.number().min(1, "required"),
    description: z.string().optional(),
})

interface FormSheetProps {
    open: boolean,
    onOpenChange: (open: boolean) => void
    onUpdate: () => void
}

export function CreateBomSheet({ open, onOpenChange, onUpdate }: FormSheetProps) {

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            job_no: 1,
            description: "",
        },
    })

    async function onSubmit(data: z.infer<typeof formSchema>) {
        await createBom({
            title: data.title ?? null,
            job_no: Number(data.job_no),
            description: data.description ?? null,

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
                    <SheetTitle>Create a BOM</SheetTitle>
                    <SheetDescription>Create a BOM with a unique job number.</SheetDescription>
                </SheetHeader>

                <form id="create-bom-form" onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup className="p-6">
                        <FieldSet>
                            <FieldGroup>
                                <Field data-invalid={!!form.formState.errors.title} >
                                    <FieldLabel htmlFor="title">Title</FieldLabel>
                                    <Input 
                                        id="title" 
                                        {...form.register("title")} 
                                        aria-invalid={!!form.formState.errors.title}
                                    />
                                    {form.formState.errors.title && (
                                        <FieldError errors={[form.formState.errors.title]} />
                                    )}
                                </Field>
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