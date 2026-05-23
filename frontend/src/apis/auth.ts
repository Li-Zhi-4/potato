import { API_BASE, handle } from "../lib/api"

export interface User {
    uid: string
    username: string
    email: string
    first_name: string | null
    last_name: string | null

    created_at: string
    updated_at: string
}

export interface AuthResponse {
    access_token: string
    user: User
}

export interface RegisterUserInput {
    username: string
    email: string
    password: string
    first_name: string | null
    last_name: string | null
}

// POST /auth/register
export async function registerUser(input: RegisterUserInput): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
    })
    return handle<AuthResponse>(res)
}

export interface LoginUserInput {
    username: string
    password: string
}

// POST /auth/login
export async function loginUser(input: LoginUserInput): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
    })
    return handle<AuthResponse>(res)
}

// GET /auth/me
export async function getMe(token: string): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    return handle<User>(res)
}