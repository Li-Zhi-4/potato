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
    username: z.string().min(3, "username must be at least 3 characters, required"),
    email: z.email("invalid email address"),
    password: z.string().min(8, "password must be at least 8 characters, required"), 
    confirm_password: z.string(),
    first_name: z.string().optional(), 
    last_name: z.string().optional(), 
}).refine(data => data.password === data.confirm_password, {
    message: "password do not match",
    path: ["confirm_password"]
})


export function RegisterUserForm() {

    const { register: registerAccount } = useAuth()
    const navigate = useNavigate()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
            confirm_password: "",
            first_name: "",
            last_name: ""
        },
    })

    async function onSubmit(data: z.infer<typeof formSchema>) {
        const { confirm_password, ...input } = data
        await registerAccount(input)
        navigate("/")
    }

    const { errors } = form.formState   // error object

    return (
        <form id="register-user-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldSet>
                <FieldGroup className="flex flex-col gap-6 py-6">                               
                    
                    <div className="flex flex-row gap-4">
                        <Field data-invalid={!!errors.first_name} >
                            <FieldLabel htmlFor="first_name">First Name</FieldLabel>
                            <Input
                                id="first_name"
                                aria-invalid={!!errors.first_name}
                                {...form.register("first_name")}
                            />
                            {errors.first_name && <FieldError errors={[errors.first_name]} />}
                        </Field>
                        <Field data-invalid={!!errors.last_name} >
                            <FieldLabel htmlFor="last_name">Last Name</FieldLabel>
                            <Input
                                id="last_name"
                                aria-invalid={!!errors.last_name}
                                {...form.register("last_name")}
                            />
                            {errors.last_name && <FieldError errors={[errors.last_name]} />}
                        </Field>
                    </div>

                    <Field data-invalid={!!errors.username} >
                        <FieldLabel htmlFor="username">Username</FieldLabel>
                        <Input 
                            id="username" 
                            aria-invalid={!!errors.username}
                            {...form.register("username")} 
                        />
                        {errors.username && <FieldError errors={[errors.username]} />}
                    </Field>

                    <Field data-invalid={!!errors.email} >
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input 
                            id="email" 
                            aria-invalid={!!errors.email}
                            {...form.register("email")} 
                        />
                        {errors.email && <FieldError errors={[errors.email]} />}
                    </Field>

                    <div className="flex flex-row gap-4">
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
                        <Field data-invalid={!!errors.confirm_password} >
                            <FieldLabel htmlFor="confirm_password">Confirm Password</FieldLabel>
                            <Input
                                id="confirm_password"
                                type="password"
                                aria-invalid={!!errors.confirm_password}
                                {...form.register("confirm_password")}
                            />
                            {errors.confirm_password && <FieldError errors={[errors.confirm_password]} />}
                        </Field>
                    </div>

                </FieldGroup>
            </FieldSet>
        </form>
    )
}