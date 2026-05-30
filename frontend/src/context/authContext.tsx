import { createContext, useContext, useEffect, useState } from "react"
import { loginUser, registerUser, getMe, type User, type RegisterUserInput } from "@/apis/auth"

interface AuthContextType {
    user: User | null
    token: string | null
    loading: boolean
    login: (username: string, password: string) => Promise<void>
    register: (input: RegisterUserInput) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    // on page refresh, restore token from localStorage and fetch the user
    useEffect(() => {
        const stored = localStorage.getItem("token")
        if (stored) {
            setToken(stored)
            getMe(stored)
                .then(setUser)
                .catch(() => {
                    // token is expired or invalid — clear it
                    localStorage.removeItem("token")
                    setToken(null)
                })
                .finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [])

    async function login(username: string, password: string) {
        const res = await loginUser({ username, password })
        setUser(res.user)
        setToken(res.access_token)
        localStorage.setItem("token", res.access_token)
    }

    async function register(input: RegisterUserInput) {
        const res = await registerUser(input)
        setUser(res.user)
        setToken(res.access_token)
        localStorage.setItem("token", res.access_token)
    }

    function logout() {
        setUser(null)
        setToken(null)
        localStorage.removeItem("token")
    }

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
    return ctx
}