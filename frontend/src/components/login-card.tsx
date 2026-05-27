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
import { Button } from "./ui/button"
import { Link } from "react-router-dom"
import { LoginForm } from "./forms/login-form"

export function LoginCard({className, ...props}: React.ComponentProps<"div">) {


    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Login to your account</CardTitle>
                    <CardDescription>
                        Enter your username and password below to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-6">
                    <LoginForm />
                    <Button type="submit" form="login-form" className="w-full" size="lg">Login</Button>
                    <CardDescription className="pt-4 text-center">
                        Don't have an account? <Link to="/register" className="underline">Sign up</Link>
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