import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  FieldDescription,
} from "@/components/ui/field"
import { RegisterUserForm } from "./forms/register-user-form"
import { Button } from "./ui/button"
import { Link } from "react-router-dom"

export function SignupForm({className, ...props}: React.ComponentProps<"div">) {


    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Create your account</CardTitle>
                    <CardDescription>
                        Enter your email below to create your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-6">
                    <RegisterUserForm />
                    <Button type="submit" form="register-user-form" className="w-full" size="lg">Create Account</Button>
                    <CardDescription className="pt-4 text-center">
                        Already have an account? <Link to="#" className="underline">Sign in</Link>
                    </CardDescription>
                </CardContent>
            </Card>
            <FieldDescription className="px-6 text-center">
                By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
                and <a href="#">Privacy Policy</a>.
            </FieldDescription>
        </div>
    )
}