"use client"

import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from "@/components/ui/field"
import { Input } from "../ui/input"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "@/context/authContext"
import { useNavigate } from "react-router-dom"


export const formSchema = z.object({
    username: z.string().min(1, "required"),
    password: z.string().min(1, "required"), 
})

export function LoginForm() {

    const { login } = useAuth()
    const navigate = useNavigate()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    })

    async function onSubmit(data: z.infer<typeof formSchema>) {
        await login(data.username, data.password)
        navigate("/")
    }

    const { errors } = form.formState   // error object

    return (
        <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldSet>
                <FieldGroup className="flex flex-col gap-6 py-6">                               

                    <Field data-invalid={!!errors.username} >
                        <FieldLabel htmlFor="username">Username</FieldLabel>
                        <Input 
                            id="username" 
                            aria-invalid={!!errors.username}
                            {...form.register("username")} 
                        />
                        {errors.username && <FieldError errors={[errors.username]} />}
                    </Field>

                    <Field data-invalid={!!errors.password} >
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <Input
                            id="password"
                            type="password"
                            aria-invalid={!!errors.password}
                            {...form.register("password")}
                        />
                        {errors.password && <FieldError errors={[errors.password]} />}
                    </Field>

                </FieldGroup>
            </FieldSet>
        </form>
    )
}